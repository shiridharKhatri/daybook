import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon'),
  color: text('color'),
  description: text('description'),
  type: text('type', { enum: ['default', 'custom'] })
    .notNull()
    .default('custom'),
  sortOrder: integer('sort_order').notNull().default(0),
  isDefault: integer('is_default').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

