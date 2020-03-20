const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  name: {type: String, required: true},
  description: {type: String, required: true, unique: true},
  picture: String,
});

taskSchema.set('timestamps', true);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
