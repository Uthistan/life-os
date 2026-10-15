export const MemoryCategoryLabels = {
  idea: 'Idea',
  decision: 'Decision',
  commitment: 'Commitment',
  lesson: 'Lesson',
  note: 'Note',
} as const;

export type MemoryCategory = keyof typeof MemoryCategoryLabels;

export const MemoryCategories = Object.keys(MemoryCategoryLabels) as MemoryCategory[];
