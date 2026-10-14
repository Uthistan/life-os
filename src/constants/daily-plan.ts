export type Routine = {
  id: string;
  title: string;
  durationMinutes: number;
};

export const Routines: readonly Routine[] = [
  { id: 'meditation', title: 'Meditation', durationMinutes: 10 },
  { id: 'gym', title: 'Gym', durationMinutes: 60 },
  { id: 'english-practice', title: 'English practice', durationMinutes: 30 },
  { id: 'reading', title: 'Reading', durationMinutes: 30 },
  { id: 'deep-work', title: 'Deep work', durationMinutes: 120 },
  { id: 'personal-time', title: 'Personal time', durationMinutes: 60 },
];

/** `day` uses `Date.getDay()` numbering, where 0 is Sunday. Hours are 24-hour. */
export const OfficeSchedule = {
  days: [
    { day: 1, label: 'Mon' },
    { day: 2, label: 'Tue' },
    { day: 3, label: 'Wed' },
    { day: 4, label: 'Thu' },
    { day: 5, label: 'Fri' },
  ],
  startHour: 10,
  endHour: 18,
} as const;
