import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router';

export const Route = createRootRouteWithContext<{
  queryClient: unknown;
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
    links: [],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f8fafc' }}>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
