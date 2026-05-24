const { verifyAccessToken } = require("../utils/jwt");
const User = require("../models/User");

// ── Protect: verifikasi JWT ─────────────────────────────
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Token tidak ditemukan" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select("-password -refreshToken");
    if (!user) {
      return res.status(401).json({ success: false, message: "User tidak ditemukan" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token tidak valid atau sudah kadaluarsa" });
  }
};

// ── Admin Only ──────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Akses ditolak: hanya admin" });
  }
  next();
};

module.exports = { protect, adminOnly };
