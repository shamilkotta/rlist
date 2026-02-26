import { env } from '@/lib/env';
import { ConvexQueryClient } from '@convex-dev/react-query';
import { QueryClient } from '@tanstack/react-query';

const convexQueryClient = new ConvexQueryClient(env.convexUrl, { expectAuth: true });

const queryClient: QueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
});

convexQueryClient.connect(queryClient);

export { convexQueryClient, queryClient };
