import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OfficeScheduleCard } from '@/components/office-schedule-card';
import { ThemedText } from '@/components/themed-text';
import { TodayRoutines } from '@/components/today-routines';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { toLocalDateKey } from '@/db/routine-completions';
import { useTheme } from '@/hooks/use-theme';
import { useToday } from '@/hooks/use-today';

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const today = useToday();
  const dateKey = toLocalDateKey(today);

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

      <TodayRoutines key={dateKey} dateKey={dateKey} />

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
});
