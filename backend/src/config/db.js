const mongoose = require("mongoose");
const dns = require("dns");

// Paksa pakai Google DNS (8.8.8.8) agar SRV record MongoDB Atlas bisa di-resolve
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.error("DB Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
