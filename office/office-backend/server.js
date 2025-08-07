const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();
const cron = require('node-cron');
const User = require('./models/User'); // Path to your User model
const Document = require('./models/Document');

const PORT = process.env.PORT || 5000;

// Schedule a task to run once every day at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('Running daily cleanup job...');

    // Calculate the cutoff date (e.g., 30 days ago)
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Find all guest users who were created before the cutoff date
    const expiredGuests = await User.find({
        isGuest: true,
        createdAt: { $lt: cutoffDate },
    });

    if (expiredGuests.length > 0) {
        console.log(`Found ${expiredGuests.length} expired guest users to delete.`);
        for (const guest of expiredGuests) {
            // Delete associated documents
            await Document.deleteMany({ owner: guest._id });

            // Finally, delete the user account
            await User.findByIdAndDelete(guest._id);
            console.log(`Deleted guest user and data for ID: ${guest._id}`);
        }
    } else {
        console.log('No expired guest users found.');
    }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));