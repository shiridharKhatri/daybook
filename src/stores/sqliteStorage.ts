import * as SQLite from 'expo-sqlite';
import { StateStorage } from 'zustand/middleware';

/**
 * SQLite-backed synchronous StateStorage adapter for Zustand.
 * Avoids any AsyncStorage NativeModule is null issues on Expo Go / RN New Architecture.
 */
export const sqliteStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      const db = SQLite.openDatabaseSync('daybook.db');
      db.execSync(`
        CREATE TABLE IF NOT EXISTS app_state (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);
      const rows = db.getAllSync<{ value: string }>(
        'SELECT value FROM app_state WHERE key = ?',
        [name]
      );
      return rows[0]?.value ?? null;
    } catch (e) {
      console.warn('sqliteStorage.getItem failed:', e);
      return null;
    }
  },

  setItem: (name: string, value: string): void => {
    try {
      const db = SQLite.openDatabaseSync('daybook.db');
      db.execSync(`
        CREATE TABLE IF NOT EXISTS app_state (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);
      db.runSync(
        'INSERT OR REPLACE INTO app_state (key, value) VALUES (?, ?)',
        [name, value]
      );
    } catch (e) {
      console.warn('sqliteStorage.setItem failed:', e);
    }
  },

  removeItem: (name: string): void => {
    try {
      const db = SQLite.openDatabaseSync('daybook.db');
      db.runSync('DELETE FROM app_state WHERE key = ?', [name]);
    } catch (e) {
      console.warn('sqliteStorage.removeItem failed:', e);
    }
  },
};

