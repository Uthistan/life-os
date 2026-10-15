import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MemoryCategoryLabels } from '@/constants/memory-categories';
import { Spacing } from '@/constants/theme';
import { type Memory } from '@/db/memories';

type MemoryRowProps = {
  memory: Memory;
};

export function MemoryRow({ memory }: MemoryRowProps) {
  return (
    <Link href={{ pathname: '/memory/[id]', params: { id: memory.id } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityHint="Opens the memory for editing"
        style={({ pressed }) => pressed && styles.pressed}>
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="small" themeColor="textSecondary">
            {MemoryCategoryLabels[memory.category]}
          </ThemedText>
          <ThemedText>{memory.title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
            {memory.content}
          </ThemedText>
        </ThemedView>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.one,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
});
