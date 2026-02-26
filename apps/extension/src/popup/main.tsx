import { authClient } from '@/lib/auth';
import { convexQueryClient, queryClient } from '@/lib/convex';
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import { App } from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Missing root element');
}

createRoot(rootElement).render(
  <QueryClientProvider client={queryClient}>
    <ConvexBetterAuthProvider client={convexQueryClient.convexClient} authClient={authClient}>
      <App />
    </ConvexBetterAuthProvider>
  </QueryClientProvider>
);
