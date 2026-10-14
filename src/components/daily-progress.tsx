import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type DailyProgressProps = {
  completedCount: number;
  totalCount: number;
};

export function DailyProgress({ completedCount, totalCount }: DailyProgressProps) {
  const theme = useTheme();
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.summary}>
        <ThemedText type="title">{percentage}%</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {completedCount} of {totalCount} routines done
        </ThemedText>
      </View>
      <ThemedView
        type="backgroundSelected"
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityLabel="Daily completion"
        accessibilityValue={{ min: 0, max: 100, now: percentage }}>
        <View
          style={[styles.fill, { width: `${percentage}%`, backgroundColor: theme.text }]}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  summary: {
    gap: Spacing.one,
  },
  track: {
    height: Spacing.two,
    borderRadius: Spacing.one,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Spacing.one,
  },
});
