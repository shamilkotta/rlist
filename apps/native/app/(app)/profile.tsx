import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppColors, useTheme } from '@/hooks/use-theme';
import { authClient } from '@/lib/auth-client';
import { signOutAndClear } from '@/lib/sign-out';

export default function ProfileScreen() {
  const router = useRouter();
  const c = useAppColors();
  const { colorScheme } = useTheme();
  const { data: session } = authClient.useSession();

  const userId = session?.user?.id;

  const handleSignOut = useCallback(async () => {
    if (!userId) return;
    await signOutAndClear(userId);
  }, [userId]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <View style={styles.container}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
            <Feather name="chevron-left" size={20} color={c.text} />
            <Text style={[styles.backText, { color: c.text }]}>Back</Text>
          </Pressable>
          <Text style={[styles.title, { color: c.text }]}>Profile</Text>
          <View style={styles.spacer} />
        </View>

        <View style={[styles.card, { borderColor: c.border }]}>
          <Text style={[styles.label, { color: c.subtitle }]}>Name</Text>
          <Text style={[styles.value, { color: c.text }]}>{session?.user?.name || 'Unknown'}</Text>

          <View style={[styles.separator, { backgroundColor: c.border }]} />

          <Text style={[styles.label, { color: c.subtitle }]}>Email</Text>
          <Text style={[styles.value, { color: c.text }]}>
            {session?.user?.email || 'Not available'}
          </Text>
        </View>

        <Pressable
          onPress={() => void handleSignOut()}
          style={[styles.logoutButton, { backgroundColor: c.text }]}
        >
          <Text style={[styles.logoutText, { color: c.background }]}>Log out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 24,
    gap: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 56,
  },
  backText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Geist',
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Geist-Bold',
  },
  spacer: {
    width: 56,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  separator: {
    height: 1,
    marginVertical: 8,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontFamily: 'Geist-Medium',
  },
  value: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Geist',
  },
  logoutButton: {
    marginTop: 'auto',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Geist-Bold',
  },
});
