import cron from 'node-cron';
import { generateAudioNews } from '../services/newsScraper.js';

export function startScheduler() {
  // Runs every hour to auto-generate and store audio news
  cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] 🕐 Generating hourly news...');
    try {
      await generateAudioNews(true);
      console.log('[Scheduler] ✅ Hourly news generated successfully');
    } catch (error) {
      console.error('[Scheduler] ❌ Error generating hourly news:', error);
    }
  });

  // Generate news every 15 minutes during peak hours (6 AM - 10 PM)
  cron.schedule('*/15 6-22 * * *', async () => {
    console.log('[Scheduler] ⚡ Generating peak-hour news update...');
    try {
      await generateAudioNews(true);
      console.log('[Scheduler] ✅ Peak-hour news generated successfully');
    } catch (error) {
      console.error('[Scheduler] ❌ Error generating peak-hour news:', error);
    }
  });

  console.log('📅 News scheduler started');
  console.log('⏰ Hourly news generation: Every hour');
  console.log('⚡ Peak-hour updates: Every 15 minutes (6 AM - 10 PM)');
}
