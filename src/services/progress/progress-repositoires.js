import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class ProgressRepositories {
  constructor() {
    this.pool = new Pool();
  }

  async getProgressToday(userId) {
    const today = new Date().toISOString().split('T')[0];

    const activities = await this.pool.query(
      'SELECT activity_id FROM activity_progress WHERE user_id = $1 AND date = $2 AND completed = TRUE',
      [userId, today]
    );

    const foods = await this.pool.query(
      'SELECT food_id FROM food_progress WHERE user_id = $1 AND date = $2 AND consumed = TRUE',
      [userId, today]
    );

    return {
      completedActivityIds: activities.rows.map(r => r.activity_id),
      consumedFoodIds: foods.rows.map(r => r.food_id),
    };
  }

  async upsertActivityProgress(userId, activityId, completed) {
    const today = new Date().toISOString().split('T')[0];
    await this.pool.query(`
      INSERT INTO activity_progress (id, user_id, date, activity_id, completed)
      VALUES ($1, $2, $3, $4, $5::boolean)
      ON CONFLICT (user_id, date, activity_id)
      DO UPDATE SET completed = EXCLUDED.completed
    `, [nanoid(16), userId, today, activityId, completed]);
  }

  async upsertFoodProgress(userId, foodId, consumed) {
    const today = new Date().toISOString().split('T')[0];
    await this.pool.query(`
      INSERT INTO food_progress (id, user_id, date, food_id, consumed)
      VALUES ($1, $2, $3, $4, $5::boolean)
      ON CONFLICT (user_id, date, food_id)
      DO UPDATE SET consumed = EXCLUDED.consumed
    `, [nanoid(16), userId, today, foodId, consumed]);
  }

  async countCompletedActivitiesToday(userId) {
    const today = new Date().toISOString().split('T')[0];
    const result = await this.pool.query(
      'SELECT COUNT(*) as count FROM activity_progress WHERE user_id = $1 AND date = $2 AND completed = TRUE',
      [userId, today]
    );
    return parseInt(result.rows[0].count);
  }

  async countConsumedFoodsToday(userId) {
    const today = new Date().toISOString().split('T')[0];
    const result = await this.pool.query(
      'SELECT COUNT(*) as count FROM food_progress WHERE user_id = $1 AND date = $2 AND consumed = TRUE',
      [userId, today]
    );
    return parseInt(result.rows[0].count);
  }

  async getStreak(userId) {
    const result = await this.pool.query(
      'SELECT * FROM streaks WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] ?? null;
  }

  async updateStreak(userId) {
    const today = new Date().toISOString().split('T')[0];


    const completedActivityCount = await this.countCompletedActivitiesToday(userId);
    const consumedFoodCount = await this.countConsumedFoodsToday(userId);

    
    // Streak hanya update jika 3 aktivitas selesai
    if (completedActivityCount < 3 || consumedFoodCount < 6) return;

    const streak = await this.getStreak(userId);
    console.log('current streak: ', streak);

    const lastDate = streak?.last_completed_date
      ? new Date(streak.last_completed_date).toISOString().split('T')[0]
      : null;

    // Jika hari ini sudah dihitung, skip
    if (lastDate === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Lanjut streak jika kemarin selesai, reset ke 1 jika tidak
    const newStreak = lastDate === yesterdayStr
      ? (streak.current_streak + 1)
      : 1;

    await this.pool.query(`
      INSERT INTO streaks (id, user_id, current_streak, longest_streak, last_completed_date, updated_at)
      VALUES ($1, $2, $3, $3, $4, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        current_streak      = $3,
        longest_streak      = GREATEST(streaks.longest_streak, $3),
        last_completed_date = $4,
        updated_at          = NOW()
    `, [nanoid(16), userId, newStreak, today]);
    }
}

export default new ProgressRepositories();