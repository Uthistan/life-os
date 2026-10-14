import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { DailyProgress } from '@/components/daily-progress';
import { RoutineRow } from '@/components/routine-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Routines } from '@/constants/daily-plan';
import { Spacing } from '@/constants/theme';
import { getCompletedRoutineIds, setRoutineCompletion } from '@/db/routine-completions';
import { useTheme } from '@/hooks/use-theme';

type LoadState =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'loaded'; completedIds: ReadonlySet<string> };

type TodayRoutinesProps = {
  dateKey: string;
};

/** Loads the day's saved completions. Remount with `key={dateKey}` when the day changes. */
export function TodayRoutines({ dateKey }: TodayRoutinesProps) {
  const db = useSQLiteContext();
  const theme = useTheme();
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let isCurrent = true;
    getCompletedRoutineIds(db, dateKey).then(
      (ids) => {
        if (isCurrent) {
          setLoadState({ status: 'loaded', completedIds: new Set(ids) });
        }
      },
      (error: unknown) => {
        console.error('Failed to load routine completions', error);
        if (isCurrent) {
          setLoadState({ status: 'failed' });
        }
      }
    );
    return () => {
      isCurrent = false;
    };
  }, [db, dateKey]);

  if (loadState.status === 'loading') {
    return (
      <ThemedView type="backgroundElement" style={styles.statusCard}>
        <ActivityIndicator color={theme.textSecondary} accessibilityLabel="Loading routines" />
      </ThemedView>
    );
  }

  if (loadState.status === 'failed') {
    return (
      <ThemedView type="backgroundElement" style={styles.statusCard}>
        <ThemedText>Today&apos;s routines couldn&apos;t be loaded.</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Restart Life OS to try again.
        </ThemedText>
      </ThemedView>
    );
  }

  return <RoutineChecklist dateKey={dateKey} initialCompletedIds={loadState.completedIds} />;
}

function withCompletion(ids: ReadonlySet<string>, routineId: string, isCompleted: boolean) {
  const next = new Set(ids);
  if (isCompleted) {
    next.add(routineId);
  } else {
    next.delete(routineId);
  }
  return next;
}

type RoutineChecklistProps = {
  dateKey: string;
  initialCompletedIds: ReadonlySet<string>;
};

function RoutineChecklist({ dateKey, initialCompletedIds }: RoutineChecklistProps) {
  const db = useSQLiteContext();
  const [completedIds, setCompletedIds] = useState(initialCompletedIds);
  const completedCount = Routines.filter((routine) => completedIds.has(routine.id)).length;

  // The UI changes only after the write succeeds, so it never shows an unsaved state.
  async function toggleRoutine(routineId: string) {
    const isCompleted = !completedIds.has(routineId);
    try {
      await setRoutineCompletion(db, dateKey, routineId, isCompleted);
    } catch (error) {
      console.error('Failed to save routine completion', error);
      Alert.alert('Not saved', 'Your change couldn’t be saved. Please try again.');
      return;
    }
    setCompletedIds((current) => withCompletion(current, routineId, isCompleted));
  }

  return (
    <>
      <DailyProgress completedCount={completedCount} totalCount={Routines.length} />

      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Routines
        </ThemedText>
        <ThemedView type="backgroundElement" style={styles.routineList}>
          {Routines.map((routine) => (
            <RoutineRow
              key={routine.id}
              routine={routine}
              isCompleted={completedIds.has(routine.id)}
              onToggle={toggleRoutine}
            />
          ))}
        </ThemedView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    gap: Spacing.one,
    alignItems: 'center',
    padding: Spacing.five,
    borderRadius: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  routineList: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.four,
  },
});
