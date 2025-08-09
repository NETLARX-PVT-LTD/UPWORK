const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();
const cron = require('node-cron');
const cleanupOldGuestData = require('./services/cleanup'); // Use the cleanup service
const User = require('./models/User'); // Path to your User model
const ScheduledTask = require('./models/ScheduledTask');
const Document = require('./models/Document');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  secure: true,
});
const PORT = process.env.PORT || 5000;

// Function to schedule the next cleanup job
const scheduleNextCleanup = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  try {
    await ScheduledTask.create({
      taskName: 'cleanupOldGuestData',
      runAt: tomorrow,
    });
    console.log('[Task Scheduler] Scheduled next cleanup job for:', tomorrow);
  } catch (err) {
    console.error('[Task Scheduler] Failed to schedule cleanup job:', err);
  }
};

// Polling function to run scheduled tasks
const startTaskRunner = () => {
  setInterval(async () => {
    try {
      const now = new Date();
      // Find a pending task that is due to run
      const task = await ScheduledTask.findOne({
        status: 'pending',
        runAt: { $lte: now },
      }).sort({ runAt: 1 }); // Process the oldest task first

      if (task) {
        console.log(`[Task Runner] Starting task: ${task.taskName}`);
        
        // Mark the task as running to prevent duplicate execution
        await ScheduledTask.findByIdAndUpdate(task._id, { status: 'running' });

        if (task.taskName === 'cleanupOldGuestData') {
          await cleanupOldGuestData(); // Execute the cleanup function
        }

        // Mark the task as completed
        await ScheduledTask.findByIdAndUpdate(task._id, { status: 'completed' });
        console.log(`[Task Runner] Task completed: ${task.taskName}`);

        // Schedule the next instance of this task
        await scheduleNextCleanup();
      }
    } catch (err) {
      console.error('[Task Runner] Error executing task:', err);
      // In case of error, you could update the task status to 'failed'
    }
  }, 60000); // Poll every minute
};

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    // Check if a cleanup job is already scheduled; if not, schedule the first one
    ScheduledTask.countDocuments({ taskName: 'cleanupOldGuestData', status: 'pending' })
      .then(count => {
        if (count === 0) {
          scheduleNextCleanup();
        }
      });

    startTaskRunner(); // Start the polling loop after the server is up
  })
  .catch(err => console.error(err));