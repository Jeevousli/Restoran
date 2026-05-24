const express = require("express");
const dotenv  = require("dotenv");
const cors    = require("cors");
const connectDB = require("./config/db");

// Load models agar populate() bisa bekerja
require("./models/User");
require("./models/Category");
require("./models/Product");
require("./models/Voucher");
require("./models/Promo");
require("./models/Order");
require("./models/Chat");

dotenv.config({ path: "./.env" });
connectDB();

const app = express();

// ── Middleware ──────────────────────────────────────────
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────
app.use("/api/auth",      require("./routes/authRoutes"));
app.use("/api/products",  require("./routes/productRoutes"));
app.use("/api/categories",require("./routes/categoryRoutes"));
app.use("/api/orders",    require("./routes/orderRoutes"));
app.use("/api/vouchers",  require("./routes/voucherRoutes"));

// ── Health Check ────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Noesantara API berjalan 🚀",
    endpoints: {
      auth:       "/api/auth",
      products:   "/api/products",
      categories: "/api/categories",
      orders:     "/api/orders",
      vouchers:   "/api/vouchers",
    },
  });
});

// ── 404 Handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} tidak ditemukan` });
});

// ── Error Handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error", error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di port ${PORT}`);
});

module.exports = app;
