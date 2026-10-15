import { type SQLiteDatabase } from 'expo-sqlite';

import { type MemoryCategory } from '@/constants/memory-categories';

export type MemoryDraft = {
  title: string;
  content: string;
  category: MemoryCategory;
};

export type Memory = MemoryDraft & {
  id: number;
  createdAt: string;
  updatedAt: string;
};

/** The `category` column has a CHECK constraint, so stored values are always valid. */
type MemoryRow = {
  id: number;
  title: string;
  content: string;
  category: MemoryCategory;
  created_at: string;
  updated_at: string;
};

const SelectMemories =
  'SELECT id, title, content, category, created_at, updated_at FROM memories';

function toMemory(row: MemoryRow): Memory {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Most recently edited first. */
export async function getMemories(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<MemoryRow>(
    `${SelectMemories} ORDER BY updated_at DESC, id DESC`
  );
  return rows.map(toMemory);
}

export async function getMemory(db: SQLiteDatabase, id: number) {
  const row = await db.getFirstAsync<MemoryRow>(`${SelectMemories} WHERE id = ?`, id);
  return row === null ? null : toMemory(row);
}

export async function createMemory(db: SQLiteDatabase, draft: MemoryDraft) {
  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO memories (title, content, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    draft.title,
    draft.content,
    draft.category,
    now,
    now
  );
}

export async function updateMemory(db: SQLiteDatabase, id: number, draft: MemoryDraft) {
  await db.runAsync(
    'UPDATE memories SET title = ?, content = ?, category = ?, updated_at = ? WHERE id = ?',
    draft.title,
    draft.content,
    draft.category,
    new Date().toISOString(),
    id
  );
}

export async function deleteMemory(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM memories WHERE id = ?', id);
}
