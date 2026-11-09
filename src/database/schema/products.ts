import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { collections } from './collections';

export const products = sqliteTable(
  'products',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    brand: text('brand'),
    imageUri: text('image_uri'),
    productType: text('product_type'),
    category: text('category'),
    description: text('description'),
    ingredients: text('ingredients'), // JSON text
    purpose: text('purpose'),
    price: real('price'),
    currency: text('currency'),
    store: text('store'),
    productUrl: text('product_url'),
    personalNotes: text('personal_notes'),
    usageInstructions: text('usage_instructions'),
    purchaseStatus: text('purchase_status', {
      enum: ['wishlisted', 'purchased', 'discontinued'],
    }),
    collectionId: text('collection_id').references(() => collections.id, {
      onDelete: 'set null',
    }),
    rating: integer('rating'), // 1-5
    personalExperience: text('personal_experience'),
    isArchived: integer('is_archived').notNull().default(0),
    isDeleted: integer('is_deleted').notNull().default(0),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [
    index('idx_products_collection_id').on(table.collectionId),
    index('idx_products_category').on(table.category),
  ]
);

export const productIngredients = sqliteTable('product_ingredients', {
  id: text('id').primaryKey(),
  productId: text('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  concern: text('concern'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

