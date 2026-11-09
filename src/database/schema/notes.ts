import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { collections } from './collections';

export const notes = sqliteTable(
  'notes',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content'), // JSON text
    collectionId: text('collection_id').references(() => collections.id, {
      onDelete: 'set null',
    }),
    isPinned: integer('is_pinned').notNull().default(0),
    isFavorite: integer('is_favorite').notNull().default(0),
    isArchived: integer('is_archived').notNull().default(0),
    isDeleted: integer('is_deleted').notNull().default(0),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [
    index('idx_notes_collection_id').on(table.collectionId),
    index('idx_notes_created_at').on(table.createdAt),
  ]
);

export const noteAttachments = sqliteTable('note_attachments', {
  id: text('id').primaryKey(),
  noteId: text('note_id')
    .notNull()
    .references(() => notes.id, { onDelete: 'cascade' }),
  type: text('type', {
    enum: ['image', 'document', 'voice', 'link'],
  }).notNull(),
  uri: text('uri').notNull(),
  fileName: text('file_name'),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  createdAt: integer('created_at').notNull(),
});

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color'),
  createdAt: integer('created_at').notNull(),
});

export const noteTags = sqliteTable(
  'note_tags',
  {
    noteId: text('note_id')
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.noteId, table.tagId] })]
);

