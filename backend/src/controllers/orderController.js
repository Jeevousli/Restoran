const Order   = require("../models/Order");
const Product = require("../models/Product");
const Voucher = require("../models/Voucher");

const VALID_PAYMENT_METHODS = ["Tunai", "Transfer", "QRIS", "Kartu Kredit", "Kartu Debit"];
const VALID_STATUSES        = ["pending", "processing", "done", "cancelled"];

// ── Create Order (user) ─────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      delivery_fee = 0,
      voucher_code,
      payment_method,
      notes,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Items wajib ada dan tidak boleh kosong" });
    }

    if (payment_method && !VALID_PAYMENT_METHODS.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: `payment_method tidak valid. Gunakan: ${VALID_PAYMENT_METHODS.join(", ")}`,
      });
    }

    // Hitung total dari produk
    let total_price = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Produk ${item.product_id} tidak ditemukan` });
      }
      if (product.is_active === false) {
        return res.status(400).json({ success: false, message: `Produk "${product.name}" tidak tersedia` });
      }

      const subtotal = product.price * (item.quantity || 1);
      total_price += subtotal;

      enrichedItems.push({
        product_id: product._id,
        name:       product.name,
        price:      product.price,
        quantity:   item.quantity || 1,
        subtotal,
        notes:      item.notes || "",
      });
    }

    // Kalkulasi voucher / promo discount
    let promo_discount = 0;
    let voucher_id     = null;

    if (voucher_code) {
      const now = new Date();
      const voucher = await Voucher.findOne({
        code:      voucher_code.toUpperCase(),
        is_active: true,
        start_date: { $lte: now },
        end_date:   { $gte: now },
      });

      if (!voucher) {
        return res.status(400).json({ success: false, message: "Voucher tidak valid atau sudah kadaluarsa" });
      }
      if (voucher.min_order && total_price < voucher.min_order) {
        return res.status(400).json({
          success: false,
          message: `Minimum order untuk voucher ini: Rp ${voucher.min_order.toLocaleString("id-ID")}`,
        });
      }
      if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
        return res.status(400).json({ success: false, message: "Voucher sudah mencapai batas penggunaan" });
      }

      if (voucher.discount_type === "percentage") {
        promo_discount = Math.round((voucher.discount_value / 100) * total_price);
        if (voucher.max_discount) {
          promo_discount = Math.min(promo_discount, voucher.max_discount);
        }
      } else {
        promo_discount = voucher.discount_value;
      }

      // Tambah used_count
      voucher.used_count = (voucher.used_count || 0) + 1;
      await voucher.save();
      voucher_id = voucher._id;
    }

    const final_price = Math.max(0, total_price + delivery_fee - promo_discount);

    const order = await Order.create({
      user_id:        req.user._id,
      items:          enrichedItems,
      total_price,
      delivery_fee,
      promo_discount,
      final_price,
      voucher_id,
      payment_method: payment_method || "Tunai",
      payment_status: "pending",
      status:         "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Order berhasil dibuat",
      data:    { order },
    });
  } catch (error) {
    console.error("Error di createOrder:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── Get My Orders (user) ────────────────────────────────
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user._id })
      .populate("items.product_id", "name image_url")
      .populate("voucher_id", "code discount_type discount_value")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: { orders } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── Get Order By ID ─────────────────────────────────────
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user_id", "name email no_telp")
      .populate("items.product_id", "name image_url price")
      .populate("voucher_id", "code discount_type discount_value");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order tidak ditemukan" });
    }

    // User hanya bisa lihat order miliknya (kecuali admin)
    if (req.user.role !== "admin" && order.user_id._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Akses ditolak" });
    }

    return res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── Get All Orders (admin) ──────────────────────────────
exports.getAllOrders = async (req, res) => {
  try {
    const { status, payment_status, limit = 100, page = 1 } = req.query;
    const filter = {};
    if (status)         filter.status         = status;
    if (payment_status) filter.payment_status = payment_status;

    const orders = await Order.find(filter)
      .populate("user_id", "name email no_telp")
      .populate("items.product_id", "name image_url")
      .populate("voucher_id", "code")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Order.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: { orders, total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── Update Order Status (admin) ─────────────────────────
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, payment_status } = req.body;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Gunakan: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const update = {};
    if (status)         update.status         = status;
    if (payment_status) update.payment_status = payment_status;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order tidak ditemukan" });
    }

    return res.status(200).json({ success: true, message: "Status order diperbarui", data: { order } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};
