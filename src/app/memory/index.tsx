import { Link, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MemoryRow } from '@/components/memory-row';
import { StatusCard } from '@/components/status-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { getMemories, type Memory } from '@/db/memories';
import { useTheme } from '@/hooks/use-theme';

type LoadState =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'loaded'; memories: Memory[] };

export default function MemoryScreen() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });

  // Reload on focus so changes made in the editor appear when navigating back.
  useFocusEffect(
    useCallback(() => {
      let isCurrent = true;
      getMemories(db).then(
        (memories) => {
          if (isCurrent) {
            setLoadState({ status: 'loaded', memories });
          }
        },
        (error: unknown) => {
          console.error('Failed to load memories', error);
          if (isCurrent) {
            setLoadState({ status: 'failed' });
          }
        }
      );
      return () => {
        isCurrent = false;
      };
    }, [db])
  );

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing.four,
          paddingBottom: insets.bottom + BottomTabInset + Spacing.three,
        },
      ]}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Memory</ThemedText>
        <Link href="/memory/new" asChild>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => pressed && styles.pressed}>
            <ThemedView type="backgroundElement" style={styles.newButton}>
              <ThemedText type="small">New memory</ThemedText>
            </ThemedView>
          </Pressable>
        </Link>
      </View>

      <MemoryListContent loadState={loadState} />
    </ScrollView>
  );
}

function MemoryListContent({ loadState }: { loadState: LoadState }) {
  const theme = useTheme();

  if (loadState.status === 'loading') {
    return (
      <StatusCard>
        <ActivityIndicator color={theme.textSecondary} accessibilityLabel="Loading memories" />
      </StatusCard>
    );
  }

  if (loadState.status === 'failed') {
    return (
      <StatusCard>
        <ThemedText>Your memories couldn&apos;t be loaded.</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Restart Life OS to try again.
        </ThemedText>
      </StatusCard>
    );
  }

  return <SearchableMemoryList memories={loadState.memories} />;
}

function matchesQuery(memory: Memory, normalizedQuery: string) {
  return (
    memory.title.toLocaleLowerCase().includes(normalizedQuery) ||
    memory.content.toLocaleLowerCase().includes(normalizedQuery)
  );
}

function SearchableMemoryList({ memories }: { memories: Memory[] }) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const results = memories.filter((memory) => matchesQuery(memory, normalizedQuery));

  if (memories.length === 0) {
    return (
      <StatusCard>
        <ThemedText>No memories yet.</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Capture an idea, decision, commitment, lesson or note.
        </ThemedText>
      </StatusCard>
    );
  }

  return (
    <View style={styles.section}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search titles and content"
        placeholderTextColor={theme.textSecondary}
        accessibilityLabel="Search memories"
        clearButtonMode="while-editing"
        autoCorrect={false}
        style={[styles.search, { backgroundColor: theme.backgroundElement, color: theme.text }]}
      />
      {results.length === 0 ? (
        <StatusCard>
          <ThemedText type="small" themeColor="textSecondary">
            No memories match “{query.trim()}”.
          </ThemedText>
        </StatusCard>
      ) : (
        results.map((memory) => <MemoryRow key={memory.id} memory={memory} />)
      )}
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  section: {
    gap: Spacing.three,
  },
  search: {
    fontSize: 16,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
});
