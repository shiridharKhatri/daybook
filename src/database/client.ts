import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const expoDb = SQLite.openDatabaseSync('daybook.db');
export const db = drizzle(expoDb, { schema });

export async function initializeDatabase(): Promise<void> {
  // Enable foreign keys and WAL mode
  expoDb.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS user_profile (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      avatar_uri TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
      theme TEXT NOT NULL DEFAULT 'light',
      currency TEXT NOT NULL DEFAULT 'NPR',
      date_format TEXT NOT NULL DEFAULT 'YYYY-MM-DD',
      week_start_day TEXT NOT NULL DEFAULT 'sunday',
      notifications_enabled INTEGER NOT NULL DEFAULT 1,
      ai_enabled INTEGER NOT NULL DEFAULT 1,
      ai_provider TEXT DEFAULT 'gemini',
      face_id_enabled INTEGER NOT NULL DEFAULT 0,
      pin_enabled INTEGER NOT NULL DEFAULT 0,
      pin TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      description TEXT,
      type TEXT NOT NULL DEFAULT 'custom',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      collection_id TEXT REFERENCES collections(id) ON DELETE SET NULL,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS note_attachments (
      id TEXT PRIMARY KEY,
      note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      uri TEXT NOT NULL,
      file_name TEXT,
      file_size INTEGER,
      mime_type TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS note_tags (
      note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (note_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT,
      image_uri TEXT,
      product_type TEXT,
      category TEXT NOT NULL,
      description TEXT,
      ingredients TEXT,
      purpose TEXT,
      price REAL,
      currency TEXT NOT NULL DEFAULT 'NPR',
      store TEXT,
      product_url TEXT,
      personal_notes TEXT,
      usage_instructions TEXT,
      purchase_status TEXT NOT NULL DEFAULT 'wishlisted',
      collection_id TEXT REFERENCES collections(id) ON DELETE SET NULL,
      rating INTEGER,
      personal_experience TEXT,
      is_archived INTEGER NOT NULL DEFAULT 0,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS product_ingredients (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      concern TEXT
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      reminder_date TEXT,
      priority TEXT NOT NULL DEFAULT 'C',
      status TEXT NOT NULL DEFAULT 'pending',
      category_id TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_recurring INTEGER NOT NULL DEFAULT 0,
      recurring_pattern TEXT,
      parent_task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
      completed_at INTEGER,
      is_archived INTEGER NOT NULL DEFAULT 0,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      is_completed INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      completed_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      color TEXT,
      frequency TEXT NOT NULL DEFAULT 'daily',
      target_days TEXT,
      reminder_time TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habit_completions (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      completed_date TEXT NOT NULL,
      note TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS routines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL DEFAULT 'morning',
      category TEXT NOT NULL DEFAULT 'general',
      icon TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS routine_steps (
      id TEXT PRIMARY KEY,
      routine_id TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
      product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      description TEXT,
      duration INTEGER,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'NPR',
      category TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      payment_method TEXT,
      account_label TEXT,
      is_recurring INTEGER NOT NULL DEFAULT 0,
      recurring_pattern TEXT,
      receipt_uri TEXT,
      tags TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'NPR',
      period TEXT NOT NULL DEFAULT 'monthly',
      start_date TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      title TEXT,
      content TEXT NOT NULL,
      mood TEXT,
      images TEXT,
      voice_note_uri TEXT,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      date TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mood_entries (
      id TEXT PRIMARY KEY,
      mood TEXT NOT NULL,
      note TEXT,
      journal_entry_id TEXT REFERENCES journal_entries(id) ON DELETE SET NULL,
      date TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS saved_links (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      title TEXT,
      description TEXT,
      image_url TEXT,
      site_name TEXT,
      collection_id TEXT REFERENCES collections(id) ON DELETE SET NULL,
      personal_notes TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      uri TEXT NOT NULL,
      file_name TEXT,
      file_size INTEGER,
      mime_type TEXT,
      description TEXT,
      collection_id TEXT REFERENCES collections(id) ON DELETE SET NULL,
      tags TEXT,
      is_archived INTEGER NOT NULL DEFAULT 0,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      cover_image_uri TEXT,
      ingredients TEXT,
      instructions TEXT,
      prep_time INTEGER,
      cook_time INTEGER,
      servings INTEGER,
      category TEXT,
      personal_notes TEXT,
      source_url TEXT,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS travel_plans (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      destination TEXT NOT NULL,
      description TEXT,
      start_date TEXT,
      end_date TEXT,
      budget REAL,
      currency TEXT NOT NULL DEFAULT 'NPR',
      cover_image_uri TEXT,
      is_archived INTEGER NOT NULL DEFAULT 0,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS travel_items (
      id TEXT PRIMARY KEY,
      travel_plan_id TEXT NOT NULL REFERENCES travel_plans(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      url TEXT,
      is_completed INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_conversations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      last_message_at INTEGER NOT NULL,
      message_count INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      metadata TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT,
      is_recurring INTEGER NOT NULL DEFAULT 0,
      recurring_pattern TEXT,
      related_type TEXT NOT NULL DEFAULT 'general',
      related_id TEXT,
      is_completed INTEGER NOT NULL DEFAULT 0,
      is_snoozed INTEGER NOT NULL DEFAULT 0,
      snooze_until TEXT,
      notification_id TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cycle_settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      cycle_length INTEGER NOT NULL DEFAULT 28,
      period_length INTEGER NOT NULL DEFAULT 5,
      last_period_start TEXT,
      luteal_length INTEGER NOT NULL DEFAULT 14,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cycle_logs (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      is_period_day INTEGER NOT NULL DEFAULT 0,
      flow_level TEXT DEFAULT 'none',
      symptoms TEXT,
      mood TEXT,
      notes TEXT,
      water_glasses INTEGER DEFAULT 6,
      sleep_hours REAL DEFAULT 7.5,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_cycle_logs_date ON cycle_logs(date);
    CREATE INDEX IF NOT EXISTS idx_notes_collection_id ON notes(collection_id);
    CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(date);
    CREATE INDEX IF NOT EXISTS idx_mood_date ON mood_entries(date);
    CREATE INDEX IF NOT EXISTS idx_habits_active ON habits(is_active);
    CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_date ON habit_completions(habit_id, completed_date);
  `);

  try {
    expoDb.runSync(`ALTER TABLE cycle_logs ADD COLUMN water_glasses INTEGER DEFAULT 6`);
  } catch {}
  try {
    expoDb.runSync(`ALTER TABLE cycle_logs ADD COLUMN sleep_hours REAL DEFAULT 7.5`);
  } catch {}

  // Seed default collections if none exist
  const existingCollections = expoDb.getAllSync<any>('SELECT COUNT(*) as count FROM collections');
  if (existingCollections[0]?.count === 0) {
    const now = Date.now();
    const defaultCols = [
      { id: 'col-haircare', name: 'Hair Care', icon: 'flower', color: '#E9C5BE', description: 'Products, oils, shampoos, and routines' },
      { id: 'col-skincare', name: 'Skincare', icon: 'heart', color: '#E8B36F', description: 'Cleansers, moisturizers, serums, SPF' },
      { id: 'col-wellness', name: 'Health & Wellness', icon: 'sun', color: '#8DB580', description: 'Fitness, mindfulness, sleep, water' },
      { id: 'col-shopping', name: 'Shopping & Wishlist', icon: 'bag', color: '#8BB0C4', description: 'Items to buy and price comparisons' },
      { id: 'col-recipes', name: 'Food & Recipes', icon: 'book', color: '#E9C5BE', description: 'Recipes, meal plans, groceries' },
      { id: 'col-learning', name: 'Learning & Ideas', icon: 'bookmark', color: '#E8B36F', description: 'Articles, books, thoughts' },
      { id: 'col-personal', name: 'Personal & Life', icon: 'user', color: '#8DB580', description: 'Everyday memories and organization' },
      { id: 'col-travel', name: 'Travel & Trips', icon: 'map', color: '#8BB0C4', description: 'Packing lists, itineraries, places' },
      { id: 'col-work', name: 'Work & Projects', icon: 'briefcase', color: '#B5AFA8', description: 'Projects, agendas, milestones' },
      { id: 'col-important', name: 'Important Info', icon: 'lock', color: '#D4736C', description: 'Key documents, contacts, references' },
    ];

    for (let i = 0; i < defaultCols.length; i++) {
      const col = defaultCols[i];
      expoDb.runSync(
        `INSERT INTO collections (id, name, icon, color, description, type, sort_order, is_default, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'default', ?, 1, ?, ?)`,
        [col.id, col.name, col.icon, col.color, col.description, i, now, now]
      );
    }
  }
}
