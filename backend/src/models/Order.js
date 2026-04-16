const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  name: String,
  price: Number,
  quantity: Number,
  subtotal: Number,
  notes: String
});

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  items: [itemSchema],

  total_price: Number,
  delivery_fee: Number,
  promo_discount: Number,
  final_price: Number,

  voucher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voucher'
  },

  payment_method: String,
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },

  midtrans_order_id: String,
  snap_token: String,

  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'done', 'cancelled'],
    default: 'pending'
  }

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
