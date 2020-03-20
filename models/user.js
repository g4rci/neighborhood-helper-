const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  direction: {type: String, required: true},
  picture: String,
});

userSchema.set('timestamps', true);

const User = mongoose.model('User', userSchema);

module.exports = User;
