import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { products } from './products';

export const routines = sqliteTable('routines', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type', { enum: ['morning', 'evening', 'weekly', 'custom'] })
    .notNull()
    .default('custom'),
  category: text('category', {
    enum: ['haircare', 'skincare', 'general'],
  })
    .notNull()
    .default('general'),
  icon: text('icon'),
  isActive: integer('is_active').notNull().default(1),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const routineSteps = sqliteTable('routine_steps', {
  id: text('id').primaryKey(),
  routineId: text('routine_id')
    .notNull()
    .references(() => routines.id, { onDelete: 'cascade' }),
  productId: text('product_id').references(() => products.id, {
    onDelete: 'set null',
  }),
  title: text('title').notNull(),
  description: text('description'),
  duration: integer('duration'), // seconds
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

