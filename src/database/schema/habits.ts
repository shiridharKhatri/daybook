import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const habits = sqliteTable(
  'habits',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    icon: text('icon'),
    color: text('color'),
    frequency: text('frequency', { enum: ['daily', 'weekly', 'custom'] })
      .notNull()
      .default('daily'),
    targetDays: text('target_days'), // JSON text e.g. ["mon","tue","wed"]
    reminderTime: text('reminder_time'),
    isActive: integer('is_active').notNull().default(1),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [index('idx_habits_is_active').on(table.isActive)]
);

export const habitCompletions = sqliteTable(
  'habit_completions',
  {
    id: text('id').primaryKey(),
    habitId: text('habit_id')
      .notNull()
      .references(() => habits.id, { onDelete: 'cascade' }),
    completedDate: text('completed_date').notNull(), // YYYY-MM-DD
    note: text('note'),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [
    index('idx_habit_completions_habit_id').on(table.habitId),
    index('idx_habit_completions_date').on(table.completedDate),
  ]
);

