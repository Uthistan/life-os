import { Stack } from 'expo-router';

export default function MemoryLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Memory', headerShown: false }} />
      <Stack.Screen name="new" options={{ title: 'New memory' }} />
      <Stack.Screen name="[id]" options={{ title: 'Edit memory' }} />
    </Stack>
  );
}
