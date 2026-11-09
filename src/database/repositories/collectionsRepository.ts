import * as SQLite from 'expo-sqlite';
import { generateUUID as uuidv4 } from '../../utils/id';

const getDb = () => SQLite.openDatabaseSync('daybook.db');

export interface CollectionItem {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  description: string | null;
  type: 'default' | 'custom';
  sortOrder: number;
  itemCount?: number;
}

export const collectionsRepository = {
  getAll: (): CollectionItem[] => {
    const db = getDb();
    return db.getAllSync<CollectionItem>(`
      SELECT c.id, c.name, c.icon, c.color, c.description, c.type, c.sort_order as sortOrder,
             (SELECT COUNT(*) FROM notes WHERE collection_id = c.id AND is_deleted = 0) +
             (SELECT COUNT(*) FROM products WHERE collection_id = c.id AND is_deleted = 0) as itemCount
      FROM collections c
      ORDER BY c.sort_order ASC, c.name ASC
    `);
  },

  getById: (id: string): CollectionItem | null => {
    const db = getDb();
    const rows = db.getAllSync<CollectionItem>(
      `SELECT c.id, c.name, c.icon, c.color, c.description, c.type, c.sort_order as sortOrder,
              (SELECT COUNT(*) FROM notes WHERE collection_id = c.id AND is_deleted = 0) as itemCount
       FROM collections c
       WHERE c.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  create: (data: { name: string; icon?: string; color?: string; description?: string }): CollectionItem => {
    const db = getDb();
    const id = uuidv4();
    const now = Date.now();
    db.runSync(
      `INSERT INTO collections (id, name, icon, color, description, type, sort_order, is_default, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'custom', 99, 0, ?, ?)`,
      [id, data.name, data.icon || 'book', data.color || '#E9C5BE', data.description || null, now, now]
    );
    return collectionsRepository.getById(id)!;
  },
};
