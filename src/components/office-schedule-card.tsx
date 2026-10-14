import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { OfficeSchedule } from '@/constants/daily-plan';
import { Spacing } from '@/constants/theme';

function formatHour(hour: number) {
  return new Date(2000, 0, 1, hour).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

type OfficeScheduleCardProps = {
  today: Date;
};

export function OfficeScheduleCard({ today }: OfficeScheduleCardProps) {
  const todayDay = today.getDay();

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.header}>
        <ThemedText>Office</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatHour(OfficeSchedule.startHour)} – {formatHour(OfficeSchedule.endHour)}
        </ThemedText>
      </View>
      <View style={styles.days}>
        {OfficeSchedule.days.map(({ day, label }) => {
          const isToday = day === todayDay;
          return (
            <ThemedView key={day} type={isToday ? 'text' : 'background'} style={styles.day}>
              <ThemedText type="small" themeColor={isToday ? 'background' : 'textSecondary'}>
                {label}
              </ThemedText>
            </ThemedView>
          );
        })}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  days: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
});
