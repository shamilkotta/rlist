import { AppHeader } from '@/components/AppHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSignOut } from '@/hooks/use-sign-out';
import { authClient } from '@/lib/auth-client';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoaderCircle } from 'lucide-react';

export const Route = createFileRoute('/profile')({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: ProfilePage,
  head: () => ({
    meta: [{ title: 'Profile | rlist' }],
  }),
});

function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const signOut = useSignOut();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-muted">
      <AppHeader />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Profile</h1>

        {isPending ? (
          <div className="flex justify-center py-12">
            <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="max-w-lg space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-xl">
                <AvatarImage src={session?.user.image ?? ''} alt={session?.user.name ?? ''} />
                <AvatarFallback className="rounded-xl text-lg">
                  {session?.user.name?.charAt(0).toUpperCase() ?? '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{session?.user.name ?? 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">
                  {session?.user.email ?? 'Not available'}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border p-4 space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Name
                </p>
                <p className="mt-1 text-sm">{session?.user.name ?? 'Unknown'}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Email
                </p>
                <p className="mt-1 text-sm">{session?.user.email ?? 'Not available'}</p>
              </div>
            </div>

            <Button variant="outline" className="w-full sm:w-auto" onClick={signOut}>
              Log out
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
