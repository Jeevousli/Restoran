const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  discount_type: {
    type: String,
    enum: ['percentage', 'fixed']
  },
  discount_value: Number,
  min_order: Number,
  max_discount: Number,
  start_date: Date,
  end_date: Date,
  is_active: Boolean,
  usage_limit: Number,
  used_count: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Voucher', voucherSchema);
