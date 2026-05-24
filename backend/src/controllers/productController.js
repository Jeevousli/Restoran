const Product  = require("../models/Product");
const Category = require("../models/Category");

// ── GET semua produk (publik) ───────────────────────────
exports.getProducts = async (req, res) => {
  try {
    const { category_id, is_active, search } = req.query;
    const filter = {};

    if (category_id)            filter.category_id = category_id;
    if (is_active !== undefined) filter.is_active   = is_active === "true";
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const products = await Product.find(filter)
      .populate("category_id", "category_name")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: { products } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── GET produk by ID (publik) ───────────────────────────
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category_id", "category_name");
    if (!product) {
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    }
    return res.status(200).json({ success: true, data: { product } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── CREATE produk (admin) ───────────────────────────────
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, image_url, is_active, category_id } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: "name dan price wajib diisi" });
    }

    const product = await Product.create({
      name,
      description: description || "",
      price: Number(price),
      image_url: image_url || "",
      is_active: is_active !== false,
      category_id: category_id || null,
    });

    const populated = await product.populate("category_id", "category_name");
    return res.status(201).json({ success: true, message: "Produk berhasil dibuat", data: { product: populated } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── UPDATE produk (admin) ───────────────────────────────
exports.updateProduct = async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.price !== undefined) update.price = Number(update.price);

    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate("category_id", "category_name");

    if (!product) {
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    }
    return res.status(200).json({ success: true, message: "Produk diperbarui", data: { product } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── TOGGLE is_active (admin) ────────────────────────────
exports.toggleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    }
    product.is_active = !product.is_active;
    await product.save();
    return res.status(200).json({
      success: true,
      message: `Produk ${product.is_active ? "diaktifkan" : "dinonaktifkan"}`,
      data: { product },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── DELETE produk (admin) ───────────────────────────────
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    }
    return res.status(200).json({ success: true, message: "Produk berhasil dihapus" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};
