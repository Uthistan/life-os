import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DailyProgress } from '@/components/daily-progress';
import { OfficeScheduleCard } from '@/components/office-schedule-card';
import { RoutineRow } from '@/components/routine-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Routines } from '@/constants/daily-plan';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  // Captured on mount: the dashboard does not roll over at midnight while open.
  const [today] = useState(() => new Date());
  const [completedIds, setCompletedIds] = useState<ReadonlySet<string>>(() => new Set());

  function toggleRoutine(id: string) {
    setCompletedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

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
        <ThemedText type="subtitle">Today</ThemedText>
      </View>

      <DailyProgress completedCount={completedIds.size} totalCount={Routines.length} />

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

      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Schedule
        </ThemedText>
        <OfficeScheduleCard today={today} />
      </View>
    </ScrollView>
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
  section: {
    gap: Spacing.two,
  },
  routineList: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.four,
  },
});
