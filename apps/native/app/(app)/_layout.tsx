import { Redirect, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { useAppColdStartSync } from '@/hooks/use-app-cold-start-sync';
import { useShareIntentHandler } from '@/hooks/use-share-intent-handler';
import { authClient } from '@/lib/auth-client';

export default function AppLayout() {
  const { data: session } = authClient.useSession();
  useAppColdStartSync(session?.user?.id);
  useShareIntentHandler();

  if (!session) {
    return <Redirect href={'/login' as never} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, freezeOnBlur: true }}>
      <Stack.Screen name="home" />
      <Stack.Screen
        name="search"
        options={{
          animation: 'fade_from_bottom',
          animationDuration: 140,
        }}
      />
      <Stack.Screen
        name="save-url"
        options={{
          animation: 'fade_from_bottom',
          animationDuration: 140,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
