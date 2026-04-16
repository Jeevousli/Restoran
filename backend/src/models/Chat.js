const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sender_type: {
    type: String,
    enum: ['user', 'admin']
  },
  message: String,
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
