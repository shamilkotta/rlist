import { MOCK_ARTICLES_QUERY_KEY, updateArticleTags } from '@/lib/mock-articles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const MAX_TAGS = 2;
const TAG_MAX_LENGTH = 15;

interface TagEditorProps {
  articleId: string;
  initialTags: string[];
}

export function TagEditor({ articleId, initialTags }: TagEditorProps) {
  const [tags, setTags] = useState<string[]>(() => initialTags);
  const [tagInput, setTagInput] = useState('');
  const queryClient = useQueryClient();
  const updateTagsMutation = useMutation({
    mutationFn: updateArticleTags,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOCK_ARTICLES_QUERY_KEY });
    },
  });

  const persistTags = (newTags: string[]) => {
    setTags(newTags);
    updateTagsMutation.mutate(
      { articleId, tags: newTags },
      {
        onError: () => {
          setTags(initialTags);
          toast.error('Failed to update tags');
        },
      }
    );
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= TAG_MAX_LENGTH) {
      setTagInput(value);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      e.stopPropagation();
      const newTag = tagInput.trim().toUpperCase();
      if (newTag && tags.length < MAX_TAGS && !tags.includes(newTag)) {
        persistTags([...tags, newTag]);
        setTagInput('');
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      e.preventDefault();
      persistTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    persistTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div
      className="flex items-center gap-2 flex-wrap"
      role="presentation"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {tags.map((tag) => (
        <div
          key={tag}
          className="flex items-center gap-1 px-2 py-0.5 bg-background border border-border rounded text-[11px] font-semibold uppercase tracking-wider text-foreground"
        >
          <span>{tag}</span>
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      {tags.length < MAX_TAGS && (
        <input
          type="text"
          value={tagInput}
          onChange={handleTagInputChange}
          onKeyDown={handleTagKeyDown}
          placeholder={tags.length === 0 ? 'Add tag...' : 'Add tag...'}
          className="flex-1 border-none outline-none bg-transparent text-[11px] placeholder:text-muted-foreground/70 h-6 min-w-[70px]"
        />
      )}
    </div>
  );
}
