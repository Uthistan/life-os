import { StyleSheet, View } from 'react-native';

import { StatusCard } from '@/components/status-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TimeActivities, TimeActivityLabels } from '@/constants/time-activities';
import { Spacing } from '@/constants/theme';
import { type CompletedSession } from '@/db/time-sessions';
import { formatDuration } from '@/utils/duration';

function formatSeconds(seconds: number) {
  return seconds < 60 ? `${seconds} sec` : formatDuration(Math.floor(seconds / 60));
}

function formatClockTime(isoTimestamp: string) {
  return new Date(isoTimestamp).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Totals per activity in the fixed activity order, omitting activities with no time. */
function getActivityTotals(sessions: CompletedSession[]) {
  return TimeActivities.map((activity) => ({
    activity,
    seconds: sessions
      .filter((session) => session.activity === activity)
      .reduce((sum, session) => sum + session.durationSeconds, 0),
  })).filter((total) => total.seconds > 0);
}

type TimeSummaryProps = {
  sessions: CompletedSession[];
};

export function TimeSummary({ sessions }: TimeSummaryProps) {
  if (sessions.length === 0) {
    return (
      <StatusCard>
        <ThemedText type="small" themeColor="textSecondary">
          No completed sessions today.
        </ThemedText>
      </StatusCard>
    );
  }

  return (
    <>
      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          By activity
        </ThemedText>
        <ThemedView type="backgroundElement" style={styles.card}>
          {getActivityTotals(sessions).map(({ activity, seconds }) => (
            <View key={activity} style={styles.row}>
              <ThemedText>{TimeActivityLabels[activity]}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {formatSeconds(seconds)}
              </ThemedText>
            </View>
          ))}
        </ThemedView>
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Sessions
        </ThemedText>
        <ThemedView type="backgroundElement" style={styles.card}>
          {sessions.map((session) => (
            <View key={session.id} style={styles.row}>
              <View>
                <ThemedText>{TimeActivityLabels[session.activity]}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {formatClockTime(session.startedAt)} – {formatClockTime(session.endedAt)}
                </ThemedText>
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {formatSeconds(session.durationSeconds)}
              </ThemedText>
            </View>
          ))}
        </ThemedView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  card: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
});
