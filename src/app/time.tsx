import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityTimer } from '@/components/activity-timer';
import { StatusCard } from '@/components/status-card';
import { ThemedText } from '@/components/themed-text';
import { TimeSummary } from '@/components/time-summary';
import { TimeActivityLabels, type TimeActivity } from '@/constants/time-activities';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import {
  ClockBeforeSessionStartError,
  discardRunningSession,
  getCompletedSessionsStartedOn,
  getRunningSession,
  startedOnLocalDay,
  startSession,
  stopSession,
  type CompletedSession,
  type RunningSession,
} from '@/db/time-sessions';
import { useTheme } from '@/hooks/use-theme';
import { useToday } from '@/hooks/use-today';

export default function TimeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const today = useToday();
  // Local midnight as a number: stable for the whole day, and changes when the day does.
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing.four,
          paddingBottom: insets.bottom + BottomTabInset + Spacing.three,
        },
      ]}>
      <View>
        <ThemedText type="small" themeColor="textSecondary">
          {today.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </ThemedText>
        <ThemedText type="subtitle">Time</ThemedText>
      </View>

      <TimeTrackingLoader key={dayStart} dayStart={dayStart} />
    </ScrollView>
  );
}

type LoadState =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'loaded'; runningSession: RunningSession | null; sessions: CompletedSession[] };

function TimeTrackingLoader({ dayStart }: { dayStart: number }) {
  const db = useSQLiteContext();
  const theme = useTheme();
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let isCurrent = true;
    Promise.all([getRunningSession(db), getCompletedSessionsStartedOn(db, new Date(dayStart))]).then(
      ([runningSession, sessions]) => {
        if (isCurrent) {
          setLoadState({ status: 'loaded', runningSession, sessions });
        }
      },
      (error: unknown) => {
        console.error('Failed to load time sessions', error);
        if (isCurrent) {
          setLoadState({ status: 'failed' });
        }
      }
    );
    return () => {
      isCurrent = false;
    };
  }, [db, dayStart]);

  if (loadState.status === 'loading') {
    return (
      <StatusCard>
        <ActivityIndicator color={theme.textSecondary} accessibilityLabel="Loading time sessions" />
      </StatusCard>
    );
  }

  if (loadState.status === 'failed') {
    return (
      <StatusCard>
        <ThemedText>Your time sessions couldn&apos;t be loaded.</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Restart Life OS to try again.
        </ThemedText>
      </StatusCard>
    );
  }

  return (
    <TimeTracker
      dayStart={dayStart}
      initialRunningSession={loadState.runningSession}
      initialSessions={loadState.sessions}
    />
  );
}

function showStopError(error: unknown) {
  if (error instanceof ClockBeforeSessionStartError) {
    Alert.alert(
      'Check your device clock',
      'Your device clock is earlier than when this timer started, so it can’t be stopped yet. The timer is still running. Correct the clock and try again, or discard the timer.'
    );
    return;
  }
  console.error('Failed to stop time session', error);
  Alert.alert('Timer still running', 'The timer couldn’t be stopped. Please try again.');
}

type TimeTrackerProps = {
  dayStart: number;
  initialRunningSession: RunningSession | null;
  initialSessions: CompletedSession[];
};

// The UI changes only after each write succeeds, so it always matches the database.
function TimeTracker({ dayStart, initialRunningSession, initialSessions }: TimeTrackerProps) {
  const db = useSQLiteContext();
  const [runningSession, setRunningSession] = useState(initialRunningSession);
  const [sessions, setSessions] = useState(initialSessions);
  const [isBusy, setIsBusy] = useState(false);

  async function handleStart(activity: TimeActivity) {
    setIsBusy(true);
    try {
      setRunningSession(await startSession(db, activity, new Date()));
    } catch (error) {
      console.error('Failed to start time session', error);
      Alert.alert('Timer not started', 'The timer couldn’t be started. Please try again.');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleStop(session: RunningSession) {
    setIsBusy(true);
    try {
      const completed = await stopSession(db, session, new Date());
      setRunningSession(null);
      // A session started before midnight belongs to the previous day's totals.
      if (startedOnLocalDay(completed, new Date(dayStart))) {
        setSessions((current) => [...current, completed]);
      }
    } catch (error) {
      showStopError(error);
    } finally {
      setIsBusy(false);
    }
  }

  async function discard(session: RunningSession) {
    setIsBusy(true);
    try {
      await discardRunningSession(db, session.id);
      setRunningSession(null);
    } catch (error) {
      console.error('Failed to discard time session', error);
      Alert.alert('Timer still running', 'The timer couldn’t be discarded. Please try again.');
    } finally {
      setIsBusy(false);
    }
  }

  function confirmDiscard(session: RunningSession) {
    Alert.alert(
      'Discard this timer?',
      `This ${TimeActivityLabels[session.activity]} session won’t be saved.`,
      [
        { text: 'Keep timer', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => discard(session) },
      ]
    );
  }

  return (
    <>
      <ActivityTimer
        runningSession={runningSession}
        isBusy={isBusy}
        onStart={handleStart}
        onStop={handleStop}
        onDiscard={confirmDiscard}
      />
      <TimeSummary sessions={sessions} />
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
});
