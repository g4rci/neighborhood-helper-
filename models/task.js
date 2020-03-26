const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  name: {type: String, required: true},
  creator: {type: Schema.Types.ObjectId, ref:'User'}, 
  assigned: {type: Schema.Types.ObjectId, ref:'User'}, 
  description: {type: String, required: true, unique: true},
  picture: String,
});

taskSchema.set('timestamps', true);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
