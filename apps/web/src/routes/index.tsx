import { LandingPage } from '@/components/LandingPage';
import { mockSignOut, useMockSession } from '@/lib/mock-auth';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: LandingRoute,
  head: () => ({
    meta: [
      {
        title: 'rlist: Your digital library, simplified',
      },
    ],
  }),
});

function LandingRoute() {
  const { session } = useMockSession();

  if (!session) {
    return <LandingPage />;
  }

  return (
    <main className="min-h-screen grid place-items-center bg-background text-foreground p-8">
      <section className="text-center max-w-xl">
        <h1 className="text-5xl font-bold tracking-tight mb-4">Welcome back</h1>
        <p className="text-lg text-muted-foreground mb-6">Logged in as {session.user.email}</p>
        <button
          type="button"
          onClick={async () => {
            await mockSignOut();
            window.location.reload();
          }}
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted/50"
        >
          Sign out
        </button>
      </section>
    </main>
  );
}
