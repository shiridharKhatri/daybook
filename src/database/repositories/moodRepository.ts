import * as SQLite from 'expo-sqlite';
import { generateUUID as uuidv4 } from '../../utils/id';

const getDb = () => SQLite.openDatabaseSync('daybook.db');

export interface MoodRecord {
  id: string;
  mood: string;
  note: string | null;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export const moodRepository = {
  getToday: (dateStr?: string): MoodRecord | null => {
    const db = getDb();
    const today = dateStr || new Date().toISOString().split('T')[0];
    const rows = db.getAllSync<MoodRecord>(
      `SELECT id, mood, note, date, created_at as createdAt
       FROM mood_entries
       WHERE date = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [today]
    );
    return rows[0] || null;
  },

  getRecent: (limit = 7): MoodRecord[] => {
    const db = getDb();
    return db.getAllSync<MoodRecord>(
      `SELECT id, mood, note, date, created_at as createdAt
       FROM mood_entries
       ORDER BY date DESC, created_at DESC
       LIMIT ?`,
      [limit]
    );
  },

  setMood: (data: { mood: string; note?: string; date?: string }): MoodRecord => {
    const db = getDb();
    const date = data.date || new Date().toISOString().split('T')[0];
    const now = Date.now();
    const existing = moodRepository.getToday(date);

    if (existing) {
      db.runSync(
        `UPDATE mood_entries SET mood = ?, note = ? WHERE id = ?`,
        [data.mood, data.note || existing.note, existing.id]
      );
      return { ...existing, mood: data.mood, note: data.note || existing.note };
    } else {
      const id = uuidv4();
      db.runSync(
        `INSERT INTO mood_entries (id, mood, note, date, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, data.mood, data.note || null, date, now]
      );
      return { id, mood: data.mood, note: data.note || null, date, createdAt: now };
    }
  },
};
