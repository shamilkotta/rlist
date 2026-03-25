import { authClient } from '@/lib/auth-client';
import { Redirect } from 'expo-router';

export default function IndexRoute() {
  const { data: session } = authClient.useSession();

  return <Redirect href={(session ? '/home' : '/login') as never} />;
}
