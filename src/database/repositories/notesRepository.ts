import * as SQLite from 'expo-sqlite';
import { generateUUID as uuidv4 } from '../../utils/id';

const getDb = () => SQLite.openDatabaseSync('daybook.db');

export interface NoteItem {
  id: string;
  title: string;
  content: string | null;
  collectionId: string | null;
  collectionName?: string | null;
  collectionColor?: string | null;
  isPinned: number;
  isFavorite: number;
  isArchived: number;
  createdAt: number;
  updatedAt: number;
  hasVoice?: boolean;
  voiceUri?: string | null;
}

export interface NoteAttachment {
  id: string;
  noteId: string;
  type: 'image' | 'document' | 'voice' | 'link';
  uri: string;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  createdAt: number;
}

export const notesRepository = {
  getAll: (options?: { collectionId?: string; search?: string }): NoteItem[] => {
    const db = getDb();
    let query = `
      SELECT n.id, n.title, n.content, n.collection_id as collectionId,
             c.name as collectionName, c.color as collectionColor,
             n.is_pinned as isPinned, n.is_favorite as isFavorite,
             n.is_archived as isArchived, n.created_at as createdAt, n.updated_at as updatedAt,
             (SELECT uri FROM note_attachments WHERE note_id = n.id AND type = 'voice' LIMIT 1) as voiceUri
      FROM notes n
      LEFT JOIN collections c ON n.collection_id = c.id
      WHERE n.is_deleted = 0
    `;
    const params: any[] = [];

    if (options?.collectionId) {
      query += ` AND n.collection_id = ?`;
      params.push(options.collectionId);
    }
    if (options?.search) {
      query += ` AND (n.title LIKE ? OR n.content LIKE ?)`;
      params.push(`%${options.search}%`, `%${options.search}%`);
    }

    query += ` ORDER BY n.is_pinned DESC, n.updated_at DESC`;
    const results = db.getAllSync<NoteItem>(query, params);
    if (results.length === 0 && !options?.search && !options?.collectionId) {
      // Seed default peaceful entries matching user reference design
      try {
        const starter1 = notesRepository.create({
          title: 'Relaxing Meditation',
          content: 'A day of small victories and quiet moments. Focused on gentle breathing, chamomile tea, and letting go of today’s rush.',
          collectionId: 'col-personal',
          isFavorite: true,
        });
        const starter2 = notesRepository.create({
          title: 'Inner Garden',
          content: 'Reflecting on the challenges and growth this week. Remember: patience is not the absence of action, but the calm belief in continuous progress.',
          collectionId: 'col-learning',
          isFavorite: false,
        });
        return [starter1, starter2];
      } catch (e) {
        return [];
      }
    }
    return results;
  },

  getById: (id: string): NoteItem | null => {
    const db = getDb();
    const rows = db.getAllSync<NoteItem>(
      `SELECT n.id, n.title, n.content, n.collection_id as collectionId,
              c.name as collectionName, c.color as collectionColor,
              n.is_pinned as isPinned, n.is_favorite as isFavorite,
              n.is_archived as isArchived, n.created_at as createdAt, n.updated_at as updatedAt,
              (SELECT uri FROM note_attachments WHERE note_id = n.id AND type = 'voice' LIMIT 1) as voiceUri
       FROM notes n
       LEFT JOIN collections c ON n.collection_id = c.id
       WHERE n.id = ? AND n.is_deleted = 0`,
      [id]
    );
    return rows[0] || null;
  },

  create: (data: {
    title: string;
    content?: string;
    collectionId?: string | null;
    isPinned?: boolean;
    isFavorite?: boolean;
  }): NoteItem => {
    const db = getDb();
    const id = uuidv4();
    const now = Date.now();
    db.runSync(
      `INSERT INTO notes (id, title, content, collection_id, is_pinned, is_favorite, is_archived, is_deleted, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
      [
        id,
        data.title,
        data.content || '',
        data.collectionId || null,
        data.isPinned ? 1 : 0,
        data.isFavorite ? 1 : 0,
        now,
        now,
      ]
    );
    return notesRepository.getById(id)!;
  },

  update: (
    id: string,
    data: {
      title?: string;
      content?: string;
      collectionId?: string | null;
      isPinned?: boolean;
      isFavorite?: boolean;
    }
  ): NoteItem | null => {
    const db = getDb();
    const now = Date.now();
    const updates: string[] = ['updated_at = ?'];
    const params: any[] = [now];

    if (data.title !== undefined) {
      updates.push('title = ?');
      params.push(data.title);
    }
    if (data.content !== undefined) {
      updates.push('content = ?');
      params.push(data.content);
    }
    if (data.collectionId !== undefined) {
      updates.push('collection_id = ?');
      params.push(data.collectionId);
    }
    if (data.isPinned !== undefined) {
      updates.push('is_pinned = ?');
      params.push(data.isPinned ? 1 : 0);
    }
    if (data.isFavorite !== undefined) {
      updates.push('is_favorite = ?');
      params.push(data.isFavorite ? 1 : 0);
    }

    params.push(id);
    db.runSync(`UPDATE notes SET ${updates.join(', ')} WHERE id = ?`, params);
    return notesRepository.getById(id);
  },

  delete: (id: string): void => {
    const db = getDb();
    db.runSync(`UPDATE notes SET is_deleted = 1 WHERE id = ?`, [id]);
  },

  addAttachment: (
    noteId: string,
    data: {
      type: 'image' | 'document' | 'voice' | 'link';
      uri: string;
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
    }
  ): NoteAttachment => {
    const db = getDb();
    const id = uuidv4();
    const now = Date.now();
    db.runSync(
      `INSERT INTO note_attachments (id, note_id, type, uri, file_name, file_size, mime_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        noteId,
        data.type,
        data.uri,
        data.fileName || null,
        data.fileSize || null,
        data.mimeType || null,
        now,
      ]
    );
    return {
      id,
      noteId,
      type: data.type,
      uri: data.uri,
      fileName: data.fileName || null,
      fileSize: data.fileSize || null,
      mimeType: data.mimeType || null,
      createdAt: now,
    };
  },

  getAttachments: (noteId: string): NoteAttachment[] => {
    const db = getDb();
    return db.getAllSync<NoteAttachment>(
      `SELECT id, note_id as noteId, type, uri, file_name as fileName, file_size as fileSize, mime_type as mimeType, created_at as createdAt
       FROM note_attachments
       WHERE note_id = ?
       ORDER BY created_at ASC`,
      [noteId]
    );
  },

  getVoiceAttachment: (noteId: string): NoteAttachment | null => {
    const db = getDb();
    const rows = db.getAllSync<NoteAttachment>(
      `SELECT id, note_id as noteId, type, uri, file_name as fileName, file_size as fileSize, mime_type as mimeType, created_at as createdAt
       FROM note_attachments
       WHERE note_id = ? AND type = 'voice'
       ORDER BY created_at DESC
       LIMIT 1`,
      [noteId]
    );
    return rows[0] || null;
  },
};
