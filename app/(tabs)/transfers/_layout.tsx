import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function TransfersLayout() {
  const { theme } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.headerBackground },
        headerTintColor: theme.colors.headerText,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Transfers' }} />
      <Stack.Screen name="new" options={{ title: 'Send Money' }} />
      <Stack.Screen name="[id]" options={{ title: 'Transfer Details' }} />
    </Stack>
  );
}
