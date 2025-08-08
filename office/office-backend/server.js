const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();
const cron = require('node-cron');
const cleanupOldGuestData = require('./services/cleanup'); // Use the cleanup service
const User = require('./models/User'); // Path to your User model
const Document = require('./models/Document');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  secure: true,
});
const PORT = process.env.PORT || 5000;

// Schedule the cleanup job to run every day at midnight
cron.schedule('0 0 * * *', () => {
  console.log('[Cron] Running daily guest data cleanup job.');
  cleanupOldGuestData(); // Call the function from your cleanup service
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));