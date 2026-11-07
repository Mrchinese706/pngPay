import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { LoadingView } from '@/components/StateViews';

// Keep the splash screen visible until the auth state has resolved.
SplashScreen.preventAutoHideAsync();

function RouteGuard() {
  const { user, loading } = useAuth();
  const { theme, appearanceLoading } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading || appearanceLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }

    SplashScreen.hideAsync();
  }, [user, loading, appearanceLoading, segments, router]);

  if (loading || appearanceLoading) {
    return (
      <>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <LoadingView />
      </>
    );
  }

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Slot />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouteGuard />
      </AuthProvider>
    </ThemeProvider>
  );
}
