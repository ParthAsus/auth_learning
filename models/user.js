const mongoose = require('mongoose');
const { type } = require('os');

mongoose.connect('mongodb://127.0.0.1:27017/authtesting');

const userSchema = mongoose.Schema({
  name: String,
  email: {type: String, unique: true},
  phoneNo: {type: Number, unique: true},
  userName: {type: String, unique: true},
  password: String
});

module.exports = mongoose.model('user', userSchema);
