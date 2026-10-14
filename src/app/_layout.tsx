import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { DatabaseName, migrateDbIfNeeded } from '@/db/database';

// Database open/migration failures are rethrown by SQLiteProvider and shown here with a retry.
export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <SQLiteProvider databaseName={DatabaseName} onInit={migrateDbIfNeeded}>
        <AppTabs />
      </SQLiteProvider>
    </ThemeProvider>
  );
}
