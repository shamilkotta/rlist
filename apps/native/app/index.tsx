import { authClient } from '@/lib/auth-client';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function IndexRoute() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#111827" />
      </View>
    );
  }

  return <Redirect href={(session ? '/home' : '/login') as never} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
});
