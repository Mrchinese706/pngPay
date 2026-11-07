import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Theme, type ThemeId, themes, pacificTheme } from '../theme';

const STORAGE_KEY = 'pngpay_theme';
export type AppearancePreference = ThemeId | 'system';

type ThemeContextValue = {
  theme: Theme;
  themeId: ThemeId;
  appearance: AppearancePreference;
  appearanceLoading: boolean;
  appearanceError: string | null;
  setTheme: (preference: AppearancePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: pacificTheme,
  themeId: 'pacific',
  appearance: 'pacific',
  appearanceLoading: false,
  appearanceError: null,
  setTheme: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [appearance, setAppearance] = useState<AppearancePreference>('pacific');
  const [appearanceLoading, setAppearanceLoading] = useState(true);
  const [appearanceError, setAppearanceError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (active && (
          stored === 'system'
          || (stored && Object.prototype.hasOwnProperty.call(themes, stored))
        )) {
          setAppearance(stored as AppearancePreference);
        }
      })
      .catch(() => {
        if (active) setAppearanceError('Could not load your saved appearance preference.');
      })
      .finally(() => {
        if (active) setAppearanceLoading(false);
      });

    return () => { active = false; };
  }, []);

  const setTheme = useCallback(async (preference: AppearancePreference) => {
    await AsyncStorage.setItem(STORAGE_KEY, preference);
    setAppearance(preference);
    setAppearanceError(null);
  }, []);

  const themeId: ThemeId = appearance === 'system'
    ? systemColorScheme === 'dark' ? 'midnight' : 'pacific'
    : appearance;
  const value = useMemo(
    () => ({ theme: themes[themeId], themeId, appearance, appearanceLoading, appearanceError, setTheme }),
    [themeId, appearance, appearanceLoading, appearanceError, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
