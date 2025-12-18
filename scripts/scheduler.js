// Local scheduler for queue management
// Run with: node scripts/scheduler.js

const cron = require('node-cron');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function fillQueue() {
  console.log(`[${new Date().toISOString()}] Running queue fill job...`);

  try {
    const response = await fetch(`${BASE_URL}/api/queue?action=fill`, {
      method: 'POST'
    });

    const data = await response.json();

    if (data.success) {
      console.log(`Queue fill complete: ${data.generated} generated, ${data.errors} errors`);
    } else {
      console.error('Queue fill failed:', data.error);
    }
  } catch (error) {
    console.error('Queue fill error:', error.message);
  }
}

async function checkQueueStats() {
  try {
    const response = await fetch(`${BASE_URL}/api/queue`);
    const data = await response.json();

    if (data.success) {
      console.log(`Queue stats: ${data.stats.total} items (${data.stats.pending} pending, ${data.stats.approved} approved)`);
      if (data.stats.needsGeneration > 0) {
        console.log(`Needs ${data.stats.needsGeneration} more items to fill queue`);
      }
    }
  } catch (error) {
    console.error('Failed to get queue stats:', error.message);
  }
}

async function cleanupOldContent() {
  console.log(`[${new Date().toISOString()}] Running cleanup job...`);

  try {
    const response = await fetch(`${BASE_URL}/api/queue?action=cleanup&days=30`, {
      method: 'POST'
    });

    const data = await response.json();

    if (data.success) {
      console.log(`Cleanup complete: ${data.deleted} old items removed`);
    } else {
      console.error('Cleanup failed:', data.error);
    }
  } catch (error) {
    console.error('Cleanup error:', error.message);
  }
}

// Main function
async function main() {
  console.log('=================================');
  console.log('InspirePost Scheduler Started');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('=================================\n');

  // Check initial stats
  await checkQueueStats();

  // Schedule jobs

  // Fill queue every day at 6 AM
  cron.schedule('0 6 * * *', async () => {
    await fillQueue();
  });

  // Cleanup old content every Sunday at 3 AM
  cron.schedule('0 3 * * 0', async () => {
    await cleanupOldContent();
  });

  // Check queue stats every hour (for logging)
  cron.schedule('0 * * * *', async () => {
    await checkQueueStats();
  });

  console.log('Scheduled jobs:');
  console.log('  - Queue fill: Daily at 6:00 AM');
  console.log('  - Cleanup: Sundays at 3:00 AM');
  console.log('  - Stats check: Every hour');
  console.log('\nScheduler is running. Press Ctrl+C to stop.\n');

  // Run initial fill if needed
  const args = process.argv.slice(2);
  if (args.includes('--fill-now')) {
    console.log('Running initial queue fill...');
    await fillQueue();
  }
}

main().catch(console.error);
