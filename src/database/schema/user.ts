import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const userProfile = sqliteTable('user_profile', {
  id: text('id').primaryKey(),
  displayName: text('display_name').notNull(),
  avatarUri: text('avatar_uri'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => userProfile.id, { onDelete: 'cascade' }),
  theme: text('theme', { enum: ['light', 'dark', 'system'] })
    .notNull()
    .default('system'),
  currency: text('currency').notNull().default('NPR'),
  dateFormat: text('date_format').notNull().default('YYYY-MM-DD'),
  weekStartDay: text('week_start_day').notNull().default('sunday'),
  notificationsEnabled: integer('notifications_enabled').notNull().default(1),
  aiEnabled: integer('ai_enabled').notNull().default(0),
  aiProvider: text('ai_provider'),
  faceIdEnabled: integer('face_id_enabled').notNull().default(0),
  pinEnabled: integer('pin_enabled').notNull().default(0),
  pin: text('pin'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

