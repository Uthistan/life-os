import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet } from 'react-native';

import { MemoryForm } from '@/components/memory-form';
import { StatusCard } from '@/components/status-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { deleteMemory, getMemory, updateMemory, type Memory, type MemoryDraft } from '@/db/memories';
import { useTheme } from '@/hooks/use-theme';

type LoadState =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'missing' }
  | { status: 'loaded'; memory: Memory };

export default function EditMemoryScreen() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<'/memory/[id]'>();
  const memoryId = Number(id);
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let isCurrent = true;
    getMemory(db, memoryId).then(
      (memory) => {
        if (isCurrent) {
          setLoadState(memory === null ? { status: 'missing' } : { status: 'loaded', memory });
        }
      },
      (error: unknown) => {
        console.error('Failed to load memory', error);
        if (isCurrent) {
          setLoadState({ status: 'failed' });
        }
      }
    );
    return () => {
      isCurrent = false;
    };
  }, [db, memoryId]);

  async function saveChanges(draft: MemoryDraft) {
    await updateMemory(db, memoryId, draft);
    router.back();
  }

  async function deleteAndClose() {
    try {
      await deleteMemory(db, memoryId);
    } catch (error) {
      console.error('Failed to delete memory', error);
      Alert.alert('Not deleted', 'This memory couldn’t be deleted. Please try again.');
      return;
    }
    router.back();
  }

  function confirmDelete() {
    Alert.alert('Delete memory?', 'This can’t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: deleteAndClose },
    ]);
  }

  if (loadState.status === 'loaded') {
    const { title, content, category } = loadState.memory;
    return (
      <MemoryForm
        initialDraft={{ title, content, category }}
        onSave={saveChanges}
        onDelete={confirmDelete}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <LoadStatus status={loadState.status} />
    </ThemedView>
  );
}

function LoadStatus({ status }: { status: 'loading' | 'failed' | 'missing' }) {
  const theme = useTheme();

  if (status === 'loading') {
    return (
      <StatusCard>
        <ActivityIndicator color={theme.textSecondary} accessibilityLabel="Loading memory" />
      </StatusCard>
    );
  }

  const message =
    status === 'missing'
      ? 'This memory no longer exists.'
      : 'This memory couldn’t be loaded. Go back and try again.';
  return (
    <StatusCard>
      <ThemedText>{message}</ThemedText>
    </StatusCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.four,
  },
});
