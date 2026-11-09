import * as SQLite from 'expo-sqlite';
import { generateUUID as uuidv4 } from '../../utils/id';

const getDb = () => SQLite.openDatabaseSync('daybook.db');

export interface ProductItem {
  id: string;
  name: string;
  brand: string | null;
  imageUri: string | null;
  productType: string | null;
  category: string; // 'haircare' | 'skincare' | 'shopping'
  description: string | null;
  ingredients: string | null;
  purpose: string | null;
  price: number | null;
  currency: string;
  store: string | null;
  productUrl: string | null;
  personalNotes: string | null;
  usageInstructions: string | null;
  purchaseStatus: 'wishlisted' | 'purchased' | 'discontinued';
  collectionId: string | null;
  rating: number | null;
  createdAt: number;
}

export const productsRepository = {
  getAll: (options?: { category?: string; purchaseStatus?: string }): ProductItem[] => {
    const db = getDb();
    let query = `
      SELECT id, name, brand, image_uri as imageUri, product_type as productType,
             category, description, ingredients, purpose, price, currency,
             store, product_url as productUrl, personal_notes as personalNotes,
             usage_instructions as usageInstructions, purchase_status as purchaseStatus,
             collection_id as collectionId, rating, created_at as createdAt
      FROM products
      WHERE is_deleted = 0
    `;
    const params: any[] = [];
    if (options?.category) {
      query += ` AND category = ?`;
      params.push(options.category);
    }
    if (options?.purchaseStatus) {
      query += ` AND purchase_status = ?`;
      params.push(options.purchaseStatus);
    }
    query += ` ORDER BY created_at DESC`;
    return db.getAllSync<ProductItem>(query, params);
  },

  create: (data: {
    name: string;
    brand?: string;
    category: string;
    productType?: string;
    price?: number;
    currency?: string;
    store?: string;
    purpose?: string;
    ingredients?: string;
    purchaseStatus?: 'wishlisted' | 'purchased';
    collectionId?: string;
  }): ProductItem => {
    const db = getDb();
    const id = uuidv4();
    const now = Date.now();
    db.runSync(
      `INSERT INTO products (id, name, brand, category, product_type, price, currency, store, purpose, ingredients, purchase_status, collection_id, is_archived, is_deleted, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
      [
        id,
        data.name,
        data.brand || null,
        data.category,
        data.productType || null,
        data.price || null,
        data.currency || 'NPR',
        data.store || null,
        data.purpose || null,
        data.ingredients || null,
        data.purchaseStatus || 'wishlisted',
        data.collectionId || null,
        now,
        now,
      ]
    );
    const rows = db.getAllSync<ProductItem>(
      `SELECT id, name, brand, image_uri as imageUri, product_type as productType,
              category, description, ingredients, purpose, price, currency,
              store, product_url as productUrl, personal_notes as personalNotes,
              usage_instructions as usageInstructions, purchase_status as purchaseStatus,
              collection_id as collectionId, rating, created_at as createdAt
       FROM products WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  delete: (id: string): void => {
    const db = getDb();
    db.runSync(`UPDATE products SET is_deleted = 1 WHERE id = ?`, [id]);
  },
};
