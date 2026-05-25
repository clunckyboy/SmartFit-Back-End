// scheduler/dailyReset.js — tambahkan reset streak
import cron from 'node-cron';
import db from './db.js';

cron.schedule('0 0 * * *', async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Reset streak user yang tidak menyelesaikan 3 aktivitas kemarin
  await db.query(`
    UPDATE streaks
    SET current_streak = 0, updated_at = NOW()
    WHERE last_completed_date < $1 AND current_streak > 0
  `, [yesterdayStr]);

}, { timezone: 'Asia/Jakarta' });