export const TimeActivityLabels = {
  'deep-work': 'Deep Work',
  learning: 'Learning',
  gym: 'Gym',
  'personal-time': 'Personal Time',
  'intentional-recovery': 'Intentional Recovery',
  'unintentional-scrolling': 'Unintentional Scrolling',
} as const;

export type TimeActivity = keyof typeof TimeActivityLabels;

export const TimeActivities = Object.keys(TimeActivityLabels) as TimeActivity[];
