import * as SQLite from 'expo-sqlite';
import { generateUUID as uuidv4 } from '../../utils/id';

const getDb = () => SQLite.openDatabaseSync('daybook.db');

export interface HabitItem {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  frequency: string;
  isActive: number;
  isCompletedToday: boolean;
  streakCount: number;
}

export const habitsRepository = {
  getAllWithTodayStatus: (): HabitItem[] => {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    // Seed starter habits if none exist
    const countRow = db.getAllSync<{ count: number }>('SELECT COUNT(*) as count FROM habits');
    if (countRow[0]?.count === 0) {
      const now = Date.now();
      const starterHabits = [
        { id: 'h-skincare', name: 'Morning Skincare', icon: 'heart', color: '#E9C5BE' },
        { id: 'h-water', name: 'Drink 2L Water', icon: 'sun', color: '#8BB0C4' },
        { id: 'h-meditate', name: '5-min Stillness', icon: 'sun', color: '#8DB580' },
        { id: 'h-journal', name: 'Evening Reflection', icon: 'book', color: '#E8B36F' },
      ];
      starterHabits.forEach((h, idx) => {
        db.runSync(
          `INSERT INTO habits (id, name, description, icon, color, frequency, is_active, sort_order, created_at, updated_at)
           VALUES (?, ?, 'Daily self-care routine', ?, ?, 'daily', 1, ?, ?, ?)`,
          [h.id, h.name, h.icon, h.color, idx, now, now]
        );
      });
    }

    const habits = db.getAllSync<any>(`
      SELECT id, name, description, icon, color, frequency, is_active as isActive
      FROM habits
      WHERE is_active = 1
      ORDER BY sort_order ASC
    `);

    return habits.map((h) => {
      // Check if completed today
      const comp = db.getAllSync<{ count: number }>(
        `SELECT COUNT(*) as count FROM habit_completions WHERE habit_id = ? AND completed_date = ?`,
        [h.id, today]
      );
      // Streak count (total completions)
      const streak = db.getAllSync<{ count: number }>(
        `SELECT COUNT(*) as count FROM habit_completions WHERE habit_id = ?`,
        [h.id]
      );

      return {
        ...h,
        isCompletedToday: (comp[0]?.count || 0) > 0,
        streakCount: streak[0]?.count || 0,
      };
    });
  },

  toggleToday: (habitId: string, isCompleted: boolean): void => {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];
    const now = Date.now();

    if (isCompleted) {
      const id = uuidv4();
      db.runSync(
        `INSERT OR IGNORE INTO habit_completions (id, habit_id, completed_date, created_at)
         VALUES (?, ?, ?, ?)`,
        [id, habitId, today, now]
      );
    } else {
      db.runSync(
        `DELETE FROM habit_completions WHERE habit_id = ? AND completed_date = ?`,
        [habitId, today]
      );
    }
  },

  create: (data: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
  }): HabitItem => {
    const db = getDb();
    const id = uuidv4();
    const now = Date.now();
    const countRow = db.getAllSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM habits WHERE is_active = 1'
    );
    const sortOrder = countRow[0]?.count || 0;

    db.runSync(
      `INSERT INTO habits (id, name, description, icon, color, frequency, is_active, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'daily', 1, ?, ?, ?)`,
      [
        id,
        data.name.trim(),
        data.description || 'Daily self-care routine',
        data.icon || 'heart',
        data.color || '#C58882',
        sortOrder,
        now,
        now,
      ]
    );

    return {
      id,
      name: data.name.trim(),
      description: data.description || 'Daily self-care routine',
      icon: data.icon || 'heart',
      color: data.color || '#C58882',
      frequency: 'daily',
      isActive: 1,
      isCompletedToday: false,
      streakCount: 0,
    };
  },

  update: (
    id: string,
    data: {
      name?: string;
      description?: string;
      icon?: string;
      color?: string;
    }
  ): void => {
    const db = getDb();
    const now = Date.now();
    const updates: string[] = ['updated_at = ?'];
    const params: any[] = [now];

    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name.trim());
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description);
    }
    if (data.icon !== undefined) {
      updates.push('icon = ?');
      params.push(data.icon);
    }
    if (data.color !== undefined) {
      updates.push('color = ?');
      params.push(data.color);
    }

    params.push(id);
    db.runSync(`UPDATE habits SET ${updates.join(', ')} WHERE id = ?`, params);
  },

  delete: (id: string): void => {
    const db = getDb();
    db.runSync(`UPDATE habits SET is_active = 0 WHERE id = ?`, [id]);
    db.runSync(`DELETE FROM habit_completions WHERE habit_id = ?`, [id]);
  },
};
