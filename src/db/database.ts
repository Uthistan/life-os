import { type SQLiteDatabase } from 'expo-sqlite';

export const DatabaseName = 'life-os.db';

/**
 * Append-only: entry N migrates the schema to `user_version` N.
 * Never edit or reorder an entry that has shipped.
 */
const Migrations: readonly string[] = [
  `
    CREATE TABLE routine_completions (
      date TEXT NOT NULL,
      routine_id TEXT NOT NULL,
      PRIMARY KEY (date, routine_id)
    );
  `,
  `
    CREATE TABLE memories (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL
        CHECK (category IN ('idea', 'decision', 'commitment', 'lesson', 'note')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `,
];

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  // `PRAGMA user_version` always returns exactly one row.
  const { user_version: currentVersion } = (await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  ))!;

  if (currentVersion === 0) {
    await db.execAsync('PRAGMA journal_mode = WAL');
  }

  for (let version = currentVersion + 1; version <= Migrations.length; version++) {
    // The schema change and its version bump commit or roll back together.
    await db.withTransactionAsync(async () => {
      await db.execAsync(Migrations[version - 1]);
      await db.execAsync(`PRAGMA user_version = ${version}`);
    });
  }
}
