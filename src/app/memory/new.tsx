import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { MemoryForm } from '@/components/memory-form';
import { createMemory, type MemoryDraft } from '@/db/memories';

const EmptyDraft: MemoryDraft = { title: '', content: '', category: 'note' };

export default function NewMemoryScreen() {
  const db = useSQLiteContext();

  async function saveMemory(draft: MemoryDraft) {
    await createMemory(db, draft);
    router.back();
  }

  return <MemoryForm initialDraft={EmptyDraft} onSave={saveMemory} />;
}
