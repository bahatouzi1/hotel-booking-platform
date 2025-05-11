const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  type: { type: String, required: true },
  price: { type: Number, required: true },
  available: { type: Boolean, default: true }
});

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: false },
  rooms: [roomSchema]
});

module.exports = mongoose.model('Hotel', hotelSchema);