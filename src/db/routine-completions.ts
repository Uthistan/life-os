import { type SQLiteDatabase } from 'expo-sqlite';

/** Formats a date as a local calendar day (`YYYY-MM-DD`). `toISOString` would use UTC. */
export function toLocalDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export async function getCompletedRoutineIds(db: SQLiteDatabase, dateKey: string) {
  const rows = await db.getAllAsync<{ routine_id: string }>(
    'SELECT routine_id FROM routine_completions WHERE date = ?',
    dateKey
  );
  return rows.map((row) => row.routine_id);
}

/** Idempotent: setting the state a routine already has is a no-op. */
export async function setRoutineCompletion(
  db: SQLiteDatabase,
  dateKey: string,
  routineId: string,
  isCompleted: boolean
) {
  if (isCompleted) {
    await db.runAsync(
      'INSERT OR IGNORE INTO routine_completions (date, routine_id) VALUES (?, ?)',
      dateKey,
      routineId
    );
    return;
  }
  await db.runAsync(
    'DELETE FROM routine_completions WHERE date = ? AND routine_id = ?',
    dateKey,
    routineId
  );
}
