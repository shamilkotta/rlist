// import 'react-native-reanimated';
import { AppProviders } from '@/components/app-providers';
import { Stack } from 'expo-router';
import { ShareIntentProvider } from 'expo-share-intent';

export default function RootLayout() {
  return (
    <ShareIntentProvider>
      <AppProviders>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </AppProviders>
    </ShareIntentProvider>
  );
}
