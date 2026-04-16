const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Register semua model agar populate() bisa bekerja
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

// middleware
app.use(cors());
app.use(express.json());

// routes
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// route test
app.get("/", (req, res) => {
  res.send("API jalan 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});
