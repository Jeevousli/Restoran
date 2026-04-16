const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema({
  name: String,
  discount_type: {
    type: String,
    enum: ['percentage', 'fixed']
  },
  discount_value: Number,
  start_date: Date,
  end_date: Date,
  product_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  is_active: Boolean
}, { timestamps: true });

module.exports = mongoose.model('Promo', promoSchema);
