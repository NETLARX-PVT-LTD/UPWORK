import { VideoProcessingAutomation } from './automation.mjs';

export async function handler(event, context) {
  const automation = new VideoProcessingAutomation();

  try {
    if (event.cleanupOnly) {
      return await automation.runCleanupOnly();
    } else if (event.stats) {
      return await automation.getSystemStats();
    } else {
      return await automation.handler();
    }
  } catch (error) {
    console.error('Lambda execution error:', error.message);
    throw error;
  }
}
