const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String
  },
  illness: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  image_urls: [{
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
