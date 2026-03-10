import {
  clearPendingArticleUrl,
  getPendingArticleUrl,
  setPendingArticleUrl,
} from '@/lib/pending-article';
import { useConvexAction } from '@convex-dev/react-query';
import { api } from '@rlist/api/convex/_generated/api';
import { useMutation } from '@tanstack/react-query';
import { ConvexError } from 'convex/values';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function usePendingArticleRecovery() {
  const addArticleMutationFn = useConvexAction(api.articles.addArticle);
  const addArticleMutation = useMutation({ mutationFn: addArticleMutationFn });

  useEffect(() => {
    const pendingUrl = getPendingArticleUrl();
    if (!pendingUrl) return;

    clearPendingArticleUrl();
    addArticleMutation.mutate(
      { url: pendingUrl, tags: [] },
      {
        onSuccess: () => toast.success('Article added'),
        onError: (err) => {
          if (
            err instanceof ConvexError &&
            'code' in err.data &&
            err.data.code === 'ALREADY_SAVED_ARTICLE'
          ) {
            return;
          }
          toast.error(err instanceof ConvexError ? err.data.message : 'Failed to add article');
          setPendingArticleUrl(pendingUrl);
        },
      }
    );
  }, [addArticleMutation]);
}
