const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  direction: {type: String, required: true},
  picture: { type: String, default: "https://banner2.cleanpng.com/20180404/djw/kisspng-computer-icons-users-group-internet-forum-user-avatar-5ac45a991206f5.9866985115228176890738.jpg"}
});

userSchema.set('timestamps', true);

const User = mongoose.model('User', userSchema);

module.exports = User;
