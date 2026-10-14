import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { type Routine } from '@/constants/daily-plan';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const CheckedSymbol: SymbolViewProps['name'] = {
  ios: 'checkmark.circle.fill',
  android: 'check_circle',
  web: 'check_circle',
};

const UncheckedSymbol: SymbolViewProps['name'] = {
  ios: 'circle',
  android: 'radio_button_unchecked',
  web: 'radio_button_unchecked',
};

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`;
}

type RoutineRowProps = {
  routine: Routine;
  isCompleted: boolean;
  onToggle: (id: string) => void;
};

export function RoutineRow({ routine, isCompleted, onToggle }: RoutineRowProps) {
  const theme = useTheme();
  const duration = formatDuration(routine.durationMinutes);

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isCompleted }}
      accessibilityLabel={`${routine.title}, ${duration}`}
      onPress={() => onToggle(routine.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <SymbolView
        name={isCompleted ? CheckedSymbol : UncheckedSymbol}
        size={24}
        tintColor={isCompleted ? theme.text : theme.textSecondary}
      />
      <ThemedText
        themeColor={isCompleted ? 'textSecondary' : 'text'}
        style={[styles.title, isCompleted && styles.completedTitle]}>
        {routine.title}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {duration}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
});
