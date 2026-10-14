import { type SQLiteDatabase } from 'expo-sqlite';

export const DatabaseName = 'life-os.db';

const DatabaseVersion = 1;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  // `PRAGMA user_version` always returns exactly one row.
  const { user_version: currentVersion } = (await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  ))!;
  if (currentVersion >= DatabaseVersion) {
    return;
  }

  await db.execAsync('PRAGMA journal_mode = WAL');
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      CREATE TABLE routine_completions (
        date TEXT NOT NULL,
        routine_id TEXT NOT NULL,
        PRIMARY KEY (date, routine_id)
      );
      PRAGMA user_version = ${DatabaseVersion};
    `);
  });
}
