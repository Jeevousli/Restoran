const Voucher = require("../models/Voucher");

// ── GET semua voucher ───────────────────────────────────
exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: { vouchers } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── GET voucher aktif (untuk user) ─────────────────────
exports.getActiveVouchers = async (req, res) => {
  try {
    const now = new Date();
    const vouchers = await Voucher.find({
      is_active:  true,
      start_date: { $lte: now },
      end_date:   { $gte: now },
    }).sort({ discount_value: -1 });

    return res.status(200).json({ success: true, data: { vouchers } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── GET voucher by ID ───────────────────────────────────
exports.getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ success: false, message: "Voucher tidak ditemukan" });
    }
    return res.status(200).json({ success: true, data: { voucher } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── Validate voucher code ───────────────────────────────
exports.validateVoucher = async (req, res) => {
  try {
    const { code, order_total } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: "Kode voucher wajib diisi" });
    }

    const now = new Date();
    const voucher = await Voucher.findOne({
      code:       code.toUpperCase(),
      is_active:  true,
      start_date: { $lte: now },
      end_date:   { $gte: now },
    });

    if (!voucher) {
      return res.status(400).json({ success: false, message: "Voucher tidak valid atau sudah kadaluarsa" });
    }

    if (voucher.min_order && order_total < voucher.min_order) {
      return res.status(400).json({
        success: false,
        message: `Minimum order Rp ${voucher.min_order.toLocaleString("id-ID")} untuk voucher ini`,
      });
    }

    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
      return res.status(400).json({ success: false, message: "Voucher sudah mencapai batas penggunaan" });
    }

    // Kalkulasi diskon
    let discount = 0;
    if (voucher.discount_type === "percentage") {
      discount = Math.round((voucher.discount_value / 100) * (order_total || 0));
      if (voucher.max_discount) discount = Math.min(discount, voucher.max_discount);
    } else {
      discount = voucher.discount_value;
    }

    return res.status(200).json({
      success: true,
      message: "Voucher valid",
      data: { voucher, calculated_discount: discount },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── CREATE voucher (admin) ──────────────────────────────
exports.createVoucher = async (req, res) => {
  try {
    const data = {
      ...req.body,
      code: req.body.code?.toUpperCase(),
    };
    const voucher = await Voucher.create(data);
    return res.status(201).json({ success: true, message: "Voucher berhasil dibuat", data: { voucher } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Kode voucher sudah digunakan" });
    }
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── UPDATE voucher (admin) ──────────────────────────────
exports.updateVoucher = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.code) data.code = data.code.toUpperCase();

    const voucher = await Voucher.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!voucher) {
      return res.status(404).json({ success: false, message: "Voucher tidak ditemukan" });
    }
    return res.status(200).json({ success: true, message: "Voucher diperbarui", data: { voucher } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── DELETE voucher (admin) ──────────────────────────────
exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) {
      return res.status(404).json({ success: false, message: "Voucher tidak ditemukan" });
    }
    return res.status(200).json({ success: true, message: "Voucher berhasil dihapus" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};
