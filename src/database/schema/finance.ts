import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

export const transactions = sqliteTable(
  'transactions',
  {
    id: text('id').primaryKey(),
    type: text('type', { enum: ['income', 'expense'] }).notNull(),
    amount: real('amount').notNull(),
    currency: text('currency').notNull().default('NPR'),
    category: text('category').notNull(),
    description: text('description'),
    date: text('date').notNull(), // YYYY-MM-DD
    paymentMethod: text('payment_method'),
    accountLabel: text('account_label'),
    isRecurring: integer('is_recurring').notNull().default(0),
    recurringPattern: text('recurring_pattern'),
    receiptUri: text('receipt_uri'),
    tags: text('tags'), // JSON text
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [
    index('idx_transactions_type').on(table.type),
    index('idx_transactions_date').on(table.date),
    index('idx_transactions_category').on(table.category),
  ]
);

export const budgets = sqliteTable('budgets', {
  id: text('id').primaryKey(),
  category: text('category').notNull(),
  amount: real('amount').notNull(),
  currency: text('currency').notNull().default('NPR'),
  period: text('period', { enum: ['monthly', 'weekly'] })
    .notNull()
    .default('monthly'),
  startDate: text('start_date').notNull(),
  isActive: integer('is_active').notNull().default(1),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

