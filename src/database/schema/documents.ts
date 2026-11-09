import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { collections } from './collections';

export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  uri: text('uri').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  description: text('description'),
  collectionId: text('collection_id').references(() => collections.id, {
    onDelete: 'set null',
  }),
  tags: text('tags'), // JSON text
  isArchived: integer('is_archived').notNull().default(0),
  isDeleted: integer('is_deleted').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

