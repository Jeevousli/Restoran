const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    description: { type: String, default: "" },
    price:       { type: Number, required: true },
    rating:      { type: Number, default: 0 },
    image_url:   { type: String, default: "" },
    is_active:   { type: Boolean, default: true },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
