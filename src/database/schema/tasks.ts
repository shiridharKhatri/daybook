import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const tasks = sqliteTable(
  'tasks',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    dueDate: integer('due_date'),
    reminderDate: integer('reminder_date'),
    priority: text('priority', { enum: ['A', 'B', 'C', 'D'] })
      .notNull()
      .default('D'),
    status: text('status', { enum: ['pending', 'completed', 'cancelled'] })
      .notNull()
      .default('pending'),
    categoryId: text('category_id'),
    sortOrder: integer('sort_order').notNull().default(0),
    isRecurring: integer('is_recurring').notNull().default(0),
    recurringPattern: text('recurring_pattern'),
    parentTaskId: text('parent_task_id'),
    completedAt: integer('completed_at'),
    isArchived: integer('is_archived').notNull().default(0),
    isDeleted: integer('is_deleted').notNull().default(0),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [
    index('idx_tasks_status').on(table.status),
    index('idx_tasks_due_date').on(table.dueDate),
    index('idx_tasks_priority').on(table.priority),
  ]
);

export const subtasks = sqliteTable('subtasks', {
  id: text('id').primaryKey(),
  taskId: text('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  isCompleted: integer('is_completed').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
  completedAt: integer('completed_at'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

