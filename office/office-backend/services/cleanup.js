// services/cleanup.js
const User = require('../models/User'); // Assuming you have a User model
const Document = require('../models/Document'); // Assuming you have a Document model
const Reservation = require('../models/Reservation'); // Assuming you have a Reservation model
const loggingService = require('./logging'); // Assuming you have a logging service

const CLEANUP_THRESHOLD_DAYS = 30;

const cleanupOldGuestData = async () => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_THRESHOLD_DAYS);

    console.log(`[Cleanup Job] Running cleanup for guest accounts older than ${cutoffDate.toISOString()}`);

    // Find all guest users that are older than the cutoff date
    const oldGuestUsers = await User.find({
      isGuest: true,
      createdAt: { $lt: cutoffDate }
    }).select('_id'); // Only select the IDs

    if (oldGuestUsers.length === 0) {
      console.log('[Cleanup Job] No old guest accounts to delete.');
      return;
    }

    const userIdsToDelete = oldGuestUsers.map(user => user._id);

    console.log(`[Cleanup Job] Found ${userIdsToDelete.length} guest accounts to delete.`);

    // Delete all associated documents
    await Document.deleteMany({ user: { $in: userIdsToDelete } });
    console.log('[Cleanup Job] Deleted associated documents.');

    // Delete all associated reservations
    await Reservation.deleteMany({ user: { $in: userIdsToDelete } });
    console.log('[Cleanup Job] Deleted associated reservations.');

    // Finally, delete the guest user accounts themselves
    await User.deleteMany({ _id: { $in: userIdsToDelete } });
    console.log('[Cleanup Job] Deleted old guest user accounts.');

    // Log the action
    await loggingService.logEvent(
        'system', 
        `Automatically deleted ${userIdsToDelete.length} guest account(s) and their data.`
    );
    
    console.log('[Cleanup Job] Cleanup finished successfully.');

  } catch (error) {
    console.error('[Cleanup Job] Error during cleanup:', error);
    // You might want to log this error to a file or an external service
  }
};

module.exports = cleanupOldGuestData;