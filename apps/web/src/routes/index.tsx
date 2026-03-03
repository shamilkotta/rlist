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
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        color: '#0f172a',
      }}
    >
      <section style={{ maxWidth: 720, textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', marginBottom: '0.75rem' }}>rlist</h1>
        <p style={{ fontSize: '1.125rem', opacity: 0.8 }}>
          Minimal deployment verification page. If you can see this, the web app is loading.
        </p>
      </section>
    </main>
  );
}
