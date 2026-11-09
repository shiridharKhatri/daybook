import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const recipes = sqliteTable('recipes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  coverImageUri: text('cover_image_uri'),
  ingredients: text('ingredients'), // JSON text
  instructions: text('instructions'), // JSON text
  prepTime: integer('prep_time'), // minutes
  cookTime: integer('cook_time'), // minutes
  servings: integer('servings'),
  category: text('category'),
  personalNotes: text('personal_notes'),
  sourceUrl: text('source_url'),
  isFavorite: integer('is_favorite').notNull().default(0),
  isArchived: integer('is_archived').notNull().default(0),
  isDeleted: integer('is_deleted').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const recipeIngredients = sqliteTable('recipe_ingredients', {
  id: text('id').primaryKey(),
  recipeId: text('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  amount: text('amount'),
  unit: text('unit'),
  isOptional: integer('is_optional').notNull().default(0),
  createdAt: integer('created_at').notNull(),
});

