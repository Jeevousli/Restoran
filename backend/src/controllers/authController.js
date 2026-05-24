const bcrypt = require("bcryptjs");
const User   = require("../models/User");
const {
  generateTokenPair,
  generateAccessToken,
  verifyRefreshToken,
} = require("../utils/jwt");

// ── Register ────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, no_telp } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Nama, email, dan password wajib diisi" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ success: false, message: "Email sudah terdaftar" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      no_telp: no_telp || "",
      role: "user",
    });

    const { accessToken, refreshToken } = generateTokenPair(user);
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: {
        user: {
          _id:     user._id,
          name:    user.name,
          email:   user.email,
          no_telp: user.no_telp,
          role:    user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Error di register:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── Login ───────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email dan password wajib diisi" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Email atau password salah" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Email atau password salah" });
    }

    const { accessToken, refreshToken } = generateTokenPair(user);
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: {
        user: {
          _id:     user._id,
          name:    user.name,
          email:   user.email,
          no_telp: user.no_telp,
          role:    user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Error di login:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── Login Admin ─────────────────────────────────────────
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email dan password wajib diisi" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Email atau password salah" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Akses ditolak: bukan akun admin" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Email atau password salah" });
    }

    const { accessToken, refreshToken } = generateTokenPair(user);
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login admin berhasil",
      data: {
        user: {
          _id:   user._id,
          name:  user.name,
          email: user.email,
          role:  user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Error di loginAdmin:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── Refresh Token ───────────────────────────────────────
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "refreshToken wajib dikirim" });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({ success: false, message: "Refresh token tidak valid atau kadaluarsa" });
    }

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token tidak cocok" });
    }

    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      message: "Token diperbarui",
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    console.error("Error di refreshToken:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

// ── Logout ──────────────────────────────────────────────
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await User.findOneAndUpdate(
        { refreshToken },
        { refreshToken: null }
      );
    }
    return res.status(200).json({ success: true, message: "Logout berhasil" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// ── Get Profile ─────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        user: {
          _id:       req.user._id,
          name:      req.user.name,
          email:     req.user.email,
          no_telp:   req.user.no_telp,
          role:      req.user.role,
          createdAt: req.user.createdAt,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// ── Update Profile ──────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, no_telp } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, no_telp },
      { new: true, select: "-password -refreshToken" }
    );
    return res.status(200).json({ success: true, message: "Profil diperbarui", data: { user } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// ── Change Password ─────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    if (!old_password || !new_password) {
      return res.status(400).json({ success: false, message: "old_password dan new_password wajib diisi" });
    }

    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(old_password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Password lama salah" });
    }

    user.password = await bcrypt.hash(new_password, 10);
    await user.save();

    return res.status(200).json({ success: true, message: "Password berhasil diubah" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};
