import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function PayeesLayout() {
  const { theme } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.headerBackground },
        headerTintColor: theme.colors.headerText,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Payees' }} />
      <Stack.Screen name="new" options={{ title: 'Add Payee' }} />
      <Stack.Screen name="[id]" options={{ title: 'Payee Details' }} />
      <Stack.Screen name="edit/[id]" options={{ title: 'Edit Payee' }} />
    </Stack>
  );
}
