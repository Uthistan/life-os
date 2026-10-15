import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TimeActivities, TimeActivityLabels, type TimeActivity } from '@/constants/time-activities';
import { Spacing } from '@/constants/theme';
import { type RunningSession } from '@/db/time-sessions';
import { formatElapsed } from '@/utils/duration';

type ActivityTimerProps = {
  runningSession: RunningSession | null;
  /** True while a start, stop or discard is being saved. */
  isBusy: boolean;
  onStart: (activity: TimeActivity) => void;
  onStop: (session: RunningSession) => void;
  onDiscard: (session: RunningSession) => void;
};

export function ActivityTimer({
  runningSession,
  isBusy,
  onStart,
  onStop,
  onDiscard,
}: ActivityTimerProps) {
  if (runningSession === null) {
    return (
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="small" themeColor="textSecondary">
          Choose an activity to start a timer
        </ThemedText>
        <View style={styles.activities}>
          {TimeActivities.map((activity) => (
            <Pressable
              key={activity}
              accessibilityRole="button"
              accessibilityLabel={`Start ${TimeActivityLabels[activity]}`}
              accessibilityState={{ disabled: isBusy }}
              disabled={isBusy}
              onPress={() => onStart(activity)}
              style={({ pressed }) => [pressed && styles.pressed, isBusy && styles.disabled]}>
              <ThemedView type="background" style={styles.chip}>
                <ThemedText type="small">{TimeActivityLabels[activity]}</ThemedText>
              </ThemedView>
            </Pressable>
          ))}
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="small" themeColor="textSecondary">
        {TimeActivityLabels[runningSession.activity]}
      </ThemedText>
      <ElapsedTime startedAt={runningSession.startedAt} />
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isBusy }}
          disabled={isBusy}
          onPress={() => onStop(runningSession)}
          style={({ pressed }) => [styles.action, pressed && styles.pressed, isBusy && styles.disabled]}>
          <ThemedView type="text" style={styles.button}>
            <ThemedText themeColor="background">Stop</ThemedText>
          </ThemedView>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isBusy }}
          disabled={isBusy}
          onPress={() => onDiscard(runningSession)}
          style={({ pressed }) => [styles.action, pressed && styles.pressed, isBusy && styles.disabled]}>
          <ThemedView type="background" style={styles.button}>
            <ThemedText>Discard</ThemedText>
          </ThemedView>
        </Pressable>
      </View>
    </ThemedView>
  );
}

/** Derives elapsed time from the start timestamp; the interval only triggers re-renders. */
function ElapsedTime({ startedAt }: { startedAt: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const elapsedSeconds = Math.floor((now - Date.parse(startedAt)) / 1000);
  if (elapsedSeconds < 0) {
    return (
      <ThemedText>
        Your device clock is earlier than this timer&apos;s start. Check the clock, or discard
        the timer.
      </ThemedText>
    );
  }
  return (
    <ThemedText type="title" accessibilityRole="timer">
      {formatElapsed(elapsedSeconds)}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  activities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  action: {
    flex: 1,
  },
  button: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});
