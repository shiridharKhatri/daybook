import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const travelPlans = sqliteTable('travel_plans', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  destination: text('destination'),
  description: text('description'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  budget: real('budget'),
  currency: text('currency').default('NPR'),
  coverImageUri: text('cover_image_uri'),
  isArchived: integer('is_archived').notNull().default(0),
  isDeleted: integer('is_deleted').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const travelItems = sqliteTable('travel_items', {
  id: text('id').primaryKey(),
  travelPlanId: text('travel_plan_id')
    .notNull()
    .references(() => travelPlans.id, { onDelete: 'cascade' }),
  type: text('type', {
    enum: ['checklist', 'packing', 'place', 'booking', 'note'],
  }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  url: text('url'),
  isCompleted: integer('is_completed').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

