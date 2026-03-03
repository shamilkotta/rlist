import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useLocation,
  useRouteContext,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import { AppSidebar } from '@/components/AppSidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import appCss from '../styles.css?url';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'rlist: Your digital library, simplified',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
      },
    ],
  }),
  beforeLoad: async () => {
    const token = null;
    return {
      isAuthenticated: false,
      token,
    };
  },

  shellComponent: RootComponent,
});

function RootComponent() {
  const context = useRouteContext({ from: Route.id });
  const location = useLocation();
  const showLandingLayout = location.pathname === '/' && !context.isAuthenticated;

  return (
    <RootDocument showLandingLayout={showLandingLayout}>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({
  children,
  showLandingLayout,
}: {
  children: React.ReactNode;
  showLandingLayout: boolean;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="m-0 antialiased">
        <ThemeProvider defaultTheme="system" storageKey="rlist:user-theme">
          <Toaster />
          <SidebarProvider defaultOpen={false}>
            {!showLandingLayout && <AppSidebar />}
            <SidebarInset className={showLandingLayout ? 'p-0! min-h-screen!' : undefined}>
              {children}
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
