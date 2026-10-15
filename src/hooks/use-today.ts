import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/** The current date, refreshed whenever the app returns to the foreground. */
export function useToday() {
  const [today, setToday] = useState(() => new Date());

  // iOS keeps the app alive in the background, so pick up a new day when it returns.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setToday(new Date());
      }
    });
    return () => subscription.remove();
  }, []);

  return today;
}
