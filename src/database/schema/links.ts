import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { collections } from './collections';

export const savedLinks = sqliteTable(
  'saved_links',
  {
    id: text('id').primaryKey(),
    url: text('url').notNull(),
    title: text('title'),
    description: text('description'),
    imageUrl: text('image_url'),
    siteName: text('site_name'),
    collectionId: text('collection_id').references(() => collections.id, {
      onDelete: 'set null',
    }),
    personalNotes: text('personal_notes'),
    isRead: integer('is_read').notNull().default(0),
    isArchived: integer('is_archived').notNull().default(0),
    isDeleted: integer('is_deleted').notNull().default(0),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [index('idx_saved_links_collection_id').on(table.collectionId)]
);

