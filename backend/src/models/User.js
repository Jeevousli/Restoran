const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true },
    email:        { type: String, unique: true, required: true, lowercase: true },
    password:     { type: String, required: true },
    no_telp:      { type: String, default: "" },
    role:         { type: String, enum: ["user", "admin"], default: "user" },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
