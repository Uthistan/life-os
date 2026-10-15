import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MemoryCategories, MemoryCategoryLabels } from '@/constants/memory-categories';
import { Spacing } from '@/constants/theme';
import { type MemoryDraft } from '@/db/memories';
import { useTheme } from '@/hooks/use-theme';

function isDraftComplete(draft: MemoryDraft) {
  return draft.title.trim() !== '' && draft.content.trim() !== '';
}

function trimDraft(draft: MemoryDraft): MemoryDraft {
  return { ...draft, title: draft.title.trim(), content: draft.content.trim() };
}

type MemoryFormProps = {
  initialDraft: MemoryDraft;
  /** Persists the draft. A rejection keeps the form open with its content intact. */
  onSave: (draft: MemoryDraft) => Promise<void>;
  onDelete?: () => void;
};

export function MemoryForm({ initialDraft, onSave, onDelete }: MemoryFormProps) {
  const theme = useTheme();
  const [draft, setDraft] = useState(initialDraft);
  const [isSaving, setIsSaving] = useState(false);
  const canSave = isDraftComplete(draft) && !isSaving;
  const inputStyle = [styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }];

  function updateDraft(changes: Partial<MemoryDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  async function handleSave() {
    if (!isDraftComplete(draft)) {
      Alert.alert('Missing details', 'Add a title and content before saving.');
      return;
    }
    setIsSaving(true);
    try {
      await onSave(trimDraft(draft));
    } catch (error) {
      console.error('Failed to save memory', error);
      Alert.alert('Not saved', 'Your memory couldn’t be saved. Your text is still here, so please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Title
        </ThemedText>
        <TextInput
          value={draft.title}
          onChangeText={(title) => updateDraft({ title })}
          placeholder="What do you want to remember?"
          placeholderTextColor={theme.textSecondary}
          accessibilityLabel="Title"
          style={inputStyle}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Category
        </ThemedText>
        <View style={styles.categories} accessibilityRole="radiogroup">
          {MemoryCategories.map((category) => {
            const isSelected = category === draft.category;
            return (
              <Pressable
                key={category}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                onPress={() => updateDraft({ category })}>
                <ThemedView type={isSelected ? 'text' : 'backgroundElement'} style={styles.chip}>
                  <ThemedText type="small" themeColor={isSelected ? 'background' : 'text'}>
                    {MemoryCategoryLabels[category]}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Content
        </ThemedText>
        <TextInput
          value={draft.content}
          onChangeText={(content) => updateDraft({ content })}
          placeholder="Details"
          placeholderTextColor={theme.textSecondary}
          accessibilityLabel="Content"
          multiline
          style={[inputStyle, styles.contentInput]}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSave }}
        disabled={!canSave}
        onPress={handleSave}
        style={({ pressed }) => [pressed && styles.pressed, !canSave && styles.disabled]}>
        <ThemedView type="text" style={styles.button}>
          <ThemedText themeColor="background">{isSaving ? 'Saving…' : 'Save'}</ThemedText>
        </ThemedView>
      </Pressable>

      {onDelete && (
        <Pressable
          accessibilityRole="button"
          onPress={onDelete}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <ThemedText themeColor="textSecondary">Delete memory</ThemedText>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
    padding: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  input: {
    fontSize: 16,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  contentInput: {
    minHeight: 160,
    textAlignVertical: 'top',
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
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
