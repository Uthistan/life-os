import { type SQLiteDatabase } from 'expo-sqlite';

import { type TimeActivity } from '@/constants/time-activities';

/** Timestamps are UTC ISO strings from `Date.toISOString()`, so they compare correctly as text. */
export type RunningSession = {
  id: number;
  activity: TimeActivity;
  startedAt: string;
};

export type CompletedSession = RunningSession & {
  endedAt: string;
  durationSeconds: number;
};

/** The device clock is earlier than the session's start, so no valid end time exists yet. */
export class ClockBeforeSessionStartError extends Error {
  constructor() {
    super('The device clock is earlier than the session start time.');
    this.name = 'ClockBeforeSessionStartError';
  }
}

/** The `activity` column has a CHECK constraint, so stored values are always valid. */
type SessionRow = {
  id: number;
  activity: TimeActivity;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
};

/** A session belongs to the local calendar day it started on: [local midnight, next local midnight). */
function getLocalDayRange(day: Date) {
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const end = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function startedOnLocalDay(session: RunningSession, day: Date) {
  const { start, end } = getLocalDayRange(day);
  return session.startedAt >= start && session.startedAt < end;
}

export async function getRunningSession(db: SQLiteDatabase): Promise<RunningSession | null> {
  const row = await db.getFirstAsync<Pick<SessionRow, 'id' | 'activity' | 'started_at'>>(
    'SELECT id, activity, started_at FROM time_sessions WHERE ended_at IS NULL'
  );
  return row === null ? null : { id: row.id, activity: row.activity, startedAt: row.started_at };
}

/** Completed sessions that started on the given local day, oldest first. */
export async function getCompletedSessionsStartedOn(db: SQLiteDatabase, day: Date) {
  const { start, end } = getLocalDayRange(day);
  const rows = await db.getAllAsync<SessionRow>(
    `SELECT id, activity, started_at, ended_at, duration_seconds FROM time_sessions
     WHERE ended_at IS NOT NULL AND started_at >= ? AND started_at < ?
     ORDER BY started_at`,
    start,
    end
  );
  return rows.map(
    (row): CompletedSession => ({
      id: row.id,
      activity: row.activity,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      durationSeconds: row.duration_seconds,
    })
  );
}

/** Fails if a session is already running (unique index `time_sessions_one_running`). */
export async function startSession(
  db: SQLiteDatabase,
  activity: TimeActivity,
  startedAt: Date
): Promise<RunningSession> {
  const startedAtIso = startedAt.toISOString();
  const result = await db.runAsync(
    'INSERT INTO time_sessions (activity, started_at) VALUES (?, ?)',
    activity,
    startedAtIso
  );
  return { id: result.lastInsertRowId, activity, startedAt: startedAtIso };
}

export async function stopSession(
  db: SQLiteDatabase,
  session: RunningSession,
  endedAt: Date
): Promise<CompletedSession> {
  const durationMs = endedAt.getTime() - Date.parse(session.startedAt);
  if (durationMs < 0) {
    throw new ClockBeforeSessionStartError();
  }
  const completed: CompletedSession = {
    ...session,
    endedAt: endedAt.toISOString(),
    durationSeconds: Math.round(durationMs / 1000),
  };
  const result = await db.runAsync(
    'UPDATE time_sessions SET ended_at = ?, duration_seconds = ? WHERE id = ? AND ended_at IS NULL',
    completed.endedAt,
    completed.durationSeconds,
    session.id
  );
  if (result.changes !== 1) {
    throw new Error(`Time session ${session.id} is not running.`);
  }
  return completed;
}

export async function discardRunningSession(db: SQLiteDatabase, sessionId: number) {
  const result = await db.runAsync(
    'DELETE FROM time_sessions WHERE id = ? AND ended_at IS NULL',
    sessionId
  );
  if (result.changes !== 1) {
    throw new Error(`Time session ${sessionId} is not running.`);
  }
}
