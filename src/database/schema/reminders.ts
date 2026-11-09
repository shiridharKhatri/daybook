import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const reminders = sqliteTable('reminders', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  date: text('date').notNull(),
  time: text('time'),
  isRecurring: integer('is_recurring').notNull().default(0),
  recurringPattern: text('recurring_pattern'),
  relatedType: text('related_type', {
    enum: ['task', 'habit', 'routine', 'general'],
  }),
  relatedId: text('related_id'),
  isCompleted: integer('is_completed').notNull().default(0),
  isSnoozed: integer('is_snoozed').notNull().default(0),
  snoozeUntil: integer('snooze_until'),
  notificationId: text('notification_id'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

