import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const aiConversations = sqliteTable('ai_conversations', {
  id: text('id').primaryKey(),
  title: text('title'),
  lastMessageAt: integer('last_message_at'),
  messageCount: integer('message_count').notNull().default(0),
  isArchived: integer('is_archived').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const aiMessages = sqliteTable('ai_messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id')
    .notNull()
    .references(() => aiConversations.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  content: text('content').notNull(),
  metadata: text('metadata'), // JSON text
  createdAt: integer('created_at').notNull(),
});

