import * as SQLite from 'expo-sqlite';
import { generateUUID as uuidv4 } from '../../utils/id';

const getDb = () => SQLite.openDatabaseSync('daybook.db');

export interface TransactionItem {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  category: string;
  description: string | null;
  date: string;
  paymentMethod: string | null;
  createdAt: number;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  spendingToday: number;
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
}

export const financeRepository = {
  getAll: (options?: { limit?: number; type?: 'income' | 'expense' }): TransactionItem[] => {
    const db = getDb();
    let query = `
      SELECT id, type, amount, currency, category, description, date,
             payment_method as paymentMethod, created_at as createdAt
      FROM transactions
    `;
    const params: any[] = [];
    if (options?.type) {
      query += ` WHERE type = ?`;
      params.push(options.type);
    }
    query += ` ORDER BY date DESC, created_at DESC`;
    if (options?.limit) {
      query += ` LIMIT ?`;
      params.push(options.limit);
    }
    return db.getAllSync<TransactionItem>(query, params);
  },

  getSummary: (): FinanceSummary => {
    const db = getDb();
    const rows = db.getAllSync<{ type: string; total: number }>(`
      SELECT type, SUM(amount) as total
      FROM transactions
      GROUP BY type
    `);

    let totalIncome = 0;
    let totalExpenses = 0;
    rows.forEach((r) => {
      if (r.type === 'income') totalIncome = r.total || 0;
      if (r.type === 'expense') totalExpenses = r.total || 0;
    });

    // Today's spending
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRow = db.getAllSync<{ todayTotal: number }>(
      `SELECT SUM(amount) as todayTotal FROM transactions WHERE type = 'expense' AND date = ?`,
      [todayStr]
    );
    const spendingToday = todayRow[0]?.todayTotal || 0;

    // Category breakdown
    const catRows = db.getAllSync<{ category: string; amount: number }>(`
      SELECT category, SUM(amount) as amount
      FROM transactions
      WHERE type = 'expense'
      GROUP BY category
      ORDER BY amount DESC
    `);

    const categoryBreakdown = catRows.map((c) => ({
      category: c.category,
      amount: c.amount,
      percentage: totalExpenses > 0 ? Math.round((c.amount / totalExpenses) * 100) : 0,
    }));

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      spendingToday,
      categoryBreakdown,
    };
  },

  create: (data: {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description?: string;
    date: string;
    currency?: string;
    paymentMethod?: string;
  }): TransactionItem => {
    const db = getDb();
    const id = uuidv4();
    const now = Date.now();
    db.runSync(
      `INSERT INTO transactions (id, type, amount, currency, category, description, date, payment_method, is_recurring, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        id,
        data.type,
        data.amount,
        data.currency || 'NPR',
        data.category,
        data.description || null,
        data.date,
        data.paymentMethod || 'Cash',
        now,
        now,
      ]
    );
    const rows = db.getAllSync<TransactionItem>(
      `SELECT id, type, amount, currency, category, description, date,
              payment_method as paymentMethod, created_at as createdAt
       FROM transactions WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  delete: (id: string): void => {
    const db = getDb();
    db.runSync(`DELETE FROM transactions WHERE id = ?`, [id]);
  },
};
