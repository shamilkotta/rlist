import { LandingPage } from '@/components/LandingPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomeRoute,
  head: () => ({
    meta: [
      {
        title: 'rlist: Your digital library, simplified',
      },
    ],
  }),
});

function HomeRoute() {
  return <LandingPage />;
}
