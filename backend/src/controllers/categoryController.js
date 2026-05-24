const Category = require("../models/Category");

// ── GET semua kategori ──────────────────────────────────
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ category_name: 1 });
    return res.status(200).json({ success: true, data: { categories } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── GET kategori by ID ──────────────────────────────────
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Kategori tidak ditemukan" });
    }
    return res.status(200).json({ success: true, data: { category } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── CREATE kategori (admin) ─────────────────────────────
exports.createCategory = async (req, res) => {
  try {
    const { category_name } = req.body;
    if (!category_name) {
      return res.status(400).json({ success: false, message: "category_name wajib diisi" });
    }
    const category = await Category.create({ category_name });
    return res.status(201).json({ success: true, message: "Kategori berhasil dibuat", data: { category } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── UPDATE kategori (admin) ─────────────────────────────
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) {
      return res.status(404).json({ success: false, message: "Kategori tidak ditemukan" });
    }
    return res.status(200).json({ success: true, message: "Kategori diperbarui", data: { category } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── DELETE kategori (admin) ─────────────────────────────
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Kategori tidak ditemukan" });
    }
    return res.status(200).json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};
