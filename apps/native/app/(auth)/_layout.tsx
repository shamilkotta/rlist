import { Redirect, Stack } from 'expo-router';
import { useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { authClient } from '@/lib/auth-client';

export default function AuthLayout() {
  const { data: session, isPending } = authClient.useSession();
  const hasResolvedSession = useRef(false);

  if (!isPending) {
    hasResolvedSession.current = true;
  }

  // better-auth refetches the session whenever the app returns to the foreground
  // (e.g. after Samsung Pass / biometric autofill) and flips `isPending` back to true
  // while signed out. Only block on the initial load so the auth screens (and their
  // focused inputs being autofilled) are not unmounted mid-fill.
  if (isPending && !hasResolvedSession.current) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (session) {
    return <Redirect href={'/home' as never} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
