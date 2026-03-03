import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MOCK_ARTICLES_QUERY_KEY,
  deleteArticle,
  toggleArchiveStatus,
  toggleReadStatus,
} from '@/lib/mock-articles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ArticleActionsProps {
  articleId: string;
  isRead: boolean;
  isArchived: boolean;
}

export function ArticleActions({ articleId, isRead, isArchived }: ArticleActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const toggleReadMutation = useMutation({
    mutationFn: toggleReadStatus,
    onSuccess: () => {
      toast.success(isRead ? 'Marked as unread' : 'Marked as read');
      queryClient.invalidateQueries({ queryKey: MOCK_ARTICLES_QUERY_KEY });
    },
    onError: () => toast.error('Failed to update read status'),
  });

  const toggleArchiveMutation = useMutation({
    mutationFn: toggleArchiveStatus,
    onSuccess: () => {
      toast.success(isArchived ? 'Unarchived' : 'Archived');
      queryClient.invalidateQueries({ queryKey: MOCK_ARTICLES_QUERY_KEY });
    },
    onError: () => toast.error('Failed to update archive status'),
  });

  const deleteArticleMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      toast.success('Article deleted');
      queryClient.invalidateQueries({ queryKey: MOCK_ARTICLES_QUERY_KEY });
    },
    onError: () => toast.error('Failed to delete article'),
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center rounded-md h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem
            onClick={() => toggleReadMutation.mutate({ articleId })}
            disabled={toggleReadMutation.isPending}
          >
            {isRead ? 'Mark as unread' : 'Mark as read'}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => toggleArchiveMutation.mutate({ articleId })}
            disabled={toggleArchiveMutation.isPending}
          >
            {isArchived ? 'Unarchive' : 'Archive'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete article</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this article from your list. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteArticleMutation.mutate({ articleId })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
