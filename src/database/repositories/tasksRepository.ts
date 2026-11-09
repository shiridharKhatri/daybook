import * as SQLite from 'expo-sqlite';
import { generateUUID as uuidv4 } from '../../utils/id';

const getDb = () => SQLite.openDatabaseSync('daybook.db');

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  reminderDate: string | null;
  priority: 'A' | 'B' | 'C' | 'D';
  status: 'pending' | 'completed' | 'cancelled';
  sortOrder: number;
  completedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export const tasksRepository = {
  getAll: (options?: { status?: string; priority?: string; date?: string }): TaskItem[] => {
    const db = getDb();
    let query = `
      SELECT id, title, description, due_date as dueDate, reminder_date as reminderDate,
             priority, status, sort_order as sortOrder, completed_at as completedAt,
             created_at as createdAt, updated_at as updatedAt
      FROM tasks
      WHERE is_deleted = 0
    `;
    const params: any[] = [];

    if (options?.status) {
      query += ` AND status = ?`;
      params.push(options.status);
    }
    if (options?.priority) {
      query += ` AND priority = ?`;
      params.push(options.priority);
    }
    if (options?.date) {
      query += ` AND (due_date = ? OR due_date IS NULL)`;
      params.push(options.date);
    }

    // High priority first (A > B > C > D), then pending before completed
    query += ` ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, priority ASC, created_at DESC`;
    return db.getAllSync<TaskItem>(query, params);
  },

  create: (data: {
    title: string;
    description?: string;
    dueDate?: string | null;
    priority?: 'A' | 'B' | 'C' | 'D';
  }): TaskItem => {
    const db = getDb();
    const id = uuidv4();
    const now = Date.now();
    db.runSync(
      `INSERT INTO tasks (id, title, description, due_date, priority, status, sort_order, is_archived, is_deleted, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'pending', 0, 0, 0, ?, ?)`,
      [
        id,
        data.title,
        data.description || null,
        data.dueDate || null,
        data.priority || 'C',
        now,
        now,
      ]
    );
    const rows = db.getAllSync<TaskItem>(
      `SELECT id, title, description, due_date as dueDate, reminder_date as reminderDate,
              priority, status, sort_order as sortOrder, completed_at as completedAt,
              created_at as createdAt, updated_at as updatedAt
       FROM tasks WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  toggleComplete: (id: string, isCompleted: boolean): void => {
    const db = getDb();
    const now = Date.now();
    const status = isCompleted ? 'completed' : 'pending';
    const completedAt = isCompleted ? now : null;
    db.runSync(
      `UPDATE tasks SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?`,
      [status, completedAt, now, id]
    );
  },

  delete: (id: string): void => {
    const db = getDb();
    db.runSync(`UPDATE tasks SET is_deleted = 1 WHERE id = ?`, [id]);
  },
};
