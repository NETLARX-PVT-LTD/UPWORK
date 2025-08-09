const mongoose = require('mongoose');

const scheduledTaskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: true,
  },
  runAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ScheduledTask = mongoose.model('ScheduledTask', scheduledTaskSchema);

module.exports = ScheduledTask;