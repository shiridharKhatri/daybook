import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const journalEntries = sqliteTable(
  'journal_entries',
  {
    id: text('id').primaryKey(),
    title: text('title'),
    content: text('content'),
    mood: text('mood'),
    images: text('images'), // JSON text
    voiceNoteUri: text('voice_note_uri'),
    isFavorite: integer('is_favorite').notNull().default(0),
    isArchived: integer('is_archived').notNull().default(0),
    isDeleted: integer('is_deleted').notNull().default(0),
    date: text('date').notNull(), // YYYY-MM-DD
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [index('idx_journal_entries_date').on(table.date)]
);

export const moodEntries = sqliteTable(
  'mood_entries',
  {
    id: text('id').primaryKey(),
    mood: text('mood', {
      enum: ['very_happy', 'happy', 'neutral', 'angry', 'sad'],
    }).notNull(),
    note: text('note'),
    journalEntryId: text('journal_entry_id').references(
      () => journalEntries.id,
      { onDelete: 'set null' }
    ),
    date: text('date').notNull(), // YYYY-MM-DD
    createdAt: integer('created_at').notNull(),
  },
  (table) => [index('idx_mood_entries_date').on(table.date)]
);

