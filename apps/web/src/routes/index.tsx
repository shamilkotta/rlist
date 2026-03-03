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
  return (
    <main className="min-h-screen grid place-items-center bg-background text-foreground p-8">
      <section className="text-center max-w-xl">
        <h1 className="text-5xl font-bold tracking-tight mb-4">rlist</h1>
        <p className="text-lg text-muted-foreground">
          Deployment verification page. Better Auth and Convex are fully removed from the web app.
        </p>
      </section>
    </main>
  );
}
