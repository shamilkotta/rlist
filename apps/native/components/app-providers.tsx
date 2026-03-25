import { db } from '@/db/client';
import { userSettings } from '@/db/schema';
import migrations from '@/drizzle/migrations';
import { ThemeContext, type ThemeMode } from '@/hooks/use-theme';
import { authClient } from '@/lib/auth-client';
import { convexQueryClient, queryClient } from '@/lib/convex';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConvexProviderWithAuth } from 'convex/react';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import type { PropsWithChildren } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

SplashScreen.preventAutoHideAsync();

function useAuthFromBetterAuth() {
  const { data: session, isPending } = authClient.useSession();

  const fetchAccessToken = useCallback(async () => {
    if (!session) {
      return null;
    }

    try {
      const result = await authClient.convex.token();
      return result.data?.token ?? null;
    } catch {
      return null;
    }
  }, [session]);

  return useMemo(
    () => ({
      isLoading: isPending,
      isAuthenticated: session !== null,
      fetchAccessToken,
    }),
    [fetchAccessToken, isPending, session]
  );
}

export function AppProviders({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [themeLoaded, setThemeLoaded] = useState(false);
  const nativeColorScheme = useNativeColorScheme();
  const { success: migrationsSuccess, error: migrationsError } = useMigrations(db, migrations);
  const { isPending } = authClient.useSession();

  const [fontsLoaded] = useFonts({
    Geist: require('../assets/fonts/Geist-Regular.ttf'),
    'Geist-Medium': require('../assets/fonts/Geist-Medium.ttf'),
    'Geist-SemiBold': require('../assets/fonts/Geist-SemiBold.ttf'),
    'Geist-Bold': require('../assets/fonts/Geist-Bold.ttf'),
    'Geist-ExtraBold': require('../assets/fonts/Geist-ExtraBold.ttf'),
    'Geist-Black': require('../assets/fonts/Geist-Black.ttf'),
  });

  useEffect(() => {
    if (!migrationsSuccess) return;

    async function loadTheme() {
      const settings = await db.select().from(userSettings).limit(1);
      if (settings.length > 0) {
        setThemeState(settings[0].theme as ThemeMode);
      } else {
        await db.insert(userSettings).values({ theme: 'system' });
      }
      setThemeLoaded(true);
    }

    loadTheme();
  }, [migrationsSuccess]);

  useEffect(() => {
    if (fontsLoaded && themeLoaded && !isPending) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, themeLoaded, isPending]);

  if (migrationsError) {
    throw migrationsError;
  }

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    await db.update(userSettings).set({ theme: newTheme });
  };

  const colorScheme =
    (theme === 'system' ? (nativeColorScheme ?? 'light') : theme) === 'dark' ? 'dark' : 'light';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        colorScheme,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ConvexProviderWithAuth
          client={convexQueryClient.convexClient}
          useAuth={useAuthFromBetterAuth}
        >
          {children}
        </ConvexProviderWithAuth>
      </QueryClientProvider>
    </ThemeContext.Provider>
  );
}
