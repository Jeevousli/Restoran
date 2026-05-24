// ================================================
// SEED ADMIN USER
// ================================================
// Jalankan: node src/seed-admin.js
// Script ini membuat akun admin pertama.
// Aman dijalankan berkali-kali (idempotent).
// ================================================

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const dotenv   = require("dotenv");
const dns      = require("dns");

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dotenv.config({ path: "./.env" });

const User = require("./models/User");

const ADMIN = {
  name:     "Admin Noesantara",
  email:    "admin@noesantara.com",
  password: "admin123",
  role:     "admin",
};

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB terhubung");

    const existing = await User.findOne({ email: ADMIN.email });

    if (existing) {
      console.log("ℹ️  Akun admin sudah ada:");
      console.log(`   📧 Email   : ${ADMIN.email}`);
      console.log(`   🔑 Password: ${ADMIN.password}`);
      console.log(`   👤 Role    : ${existing.role}`);
    } else {
      const hashed = await bcrypt.hash(ADMIN.password, 10);
      await User.create({
        name:     ADMIN.name,
        email:    ADMIN.email,
        password: hashed,
        role:     "admin",
      });
      console.log("✅ Akun admin berhasil dibuat!");
      console.log(`   📧 Email   : ${ADMIN.email}`);
      console.log(`   🔑 Password: ${ADMIN.password}`);
      console.log(`   👤 Role    : admin`);
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB terputus");
  }
}

seedAdmin();
