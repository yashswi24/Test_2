// models/userModel.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  profile: {
    fullName: String,
    imageUrl: String,
    // Add other user profile fields as needed
  },
  approvalStatus: { type: String, default: 'Pending' }, // 'Pending', 'Accepted', or 'Rejected'
});

const User = mongoose.model('User', userSchema);

module.exports = User;
