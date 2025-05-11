const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/reservationsDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected for Reservations Service');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
