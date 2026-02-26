import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { getDomain, isValidUrl } from '@/lib/url';
import { convexAction, useConvexAction } from '@convex-dev/react-query';
import { api } from '@rlist/api/convex/_generated/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ConvexError } from 'convex/values';
import { Link2, X } from 'lucide-react';
import { type ChangeEvent, type KeyboardEvent, useEffect, useMemo, useState } from 'react';

const MAX_TAGS = 2;
const TAG_MAX_LENGTH = 15;
const URL_DEBOUNCE_MS = 500;

type UrlInputProps = {
  initialUrl: string;
  onSaved: () => void;
};

type StatusState = {
  type: 'error' | 'success';
  text: string;
};

function LinkIcon({ className }: { className?: string }) {
  return <Link2 className={className} size={16} strokeWidth={2} aria-hidden />;
}

export function UrlInput({ initialUrl, onSaved }: UrlInputProps) {
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [showUrlPreview, setShowUrlPreview] = useState(isValidUrl(initialUrl));
  const [tags, setTags] = useState<Array<string>>([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<StatusState | null>(null);

  useEffect(() => {
    setUrlInput(initialUrl);
    setShowUrlPreview(isValidUrl(initialUrl));
  }, [initialUrl]);

  const debouncedUrl = useDebounce(
    showUrlPreview && isValidUrl(urlInput) ? urlInput : '',
    URL_DEBOUNCE_MS
  );
  const shouldFetch = showUrlPreview && isValidUrl(debouncedUrl);

  const { data: metadata, isLoading: isLoadingMetadata } = useQuery({
    ...convexAction(api.articles.fetchMetadata, shouldFetch ? { url: debouncedUrl } : 'skip'),
    retry: false,
  });

  const mutationFn = useConvexAction(api.articles.addArticle);
  const addArticleMutation = useMutation({ mutationFn });

  const canSubmit = useMemo(
    () => isValidUrl(urlInput) && !addArticleMutation.isPending,
    [urlInput, addArticleMutation.isPending]
  );

  const handleTagInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value.length <= TAG_MAX_LENGTH) {
      setTagInput(value);
    }
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const newTag = tagInput.trim().toUpperCase();
      if (newTag && tags.length < MAX_TAGS && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
      return;
    }

    if (event.key === 'Backspace' && !tagInput && tags.length > 0) {
      event.preventDefault();
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!isValidUrl(urlInput)) return;

    setStatus(null);
    addArticleMutation.mutate(
      {
        url: debouncedUrl || urlInput,
        tags,
      },
      {
        onSuccess: () => {
          setStatus({ type: 'success', text: 'Article added' });
          onSaved();
        },
        onError: (error) => {
          if (
            error instanceof ConvexError &&
            'code' in error.data &&
            error.data.code === 'ALREADY_SAVED_ARTICLE'
          ) {
            setStatus({ type: 'error', text: 'Article already saved' });
            return;
          }
          setStatus({
            type: 'error',
            text: error instanceof ConvexError ? error.data.message : 'Failed to add article',
          });
        },
      }
    );
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center h-11 group bg-background border border-border rounded-md">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <LinkIcon className="text-muted-foreground/50" />
        </div>
        <Input
          autoFocus
          type="text"
          placeholder="Paste a URL to save..."
          value={urlInput}
          onChange={(event) => {
            const value = event.target.value;
            setUrlInput(value);
            setShowUrlPreview(isValidUrl(value) && value.trim().length > 0);
            setStatus(null);
          }}
          className="pl-10 pr-28 h-full border-none rounded-md text-[15px] placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 w-full shadow-none"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleSubmit();
            }
          }}
        />
        <Button
          tabIndex={-1}
          className="absolute right-1.5 top-1.5 bottom-1.5 h-auto px-4 rounded-[calc(var(--radius)-5px)] font-medium text-[12px] focus-visible:ring-0 focus-visible:ring-offset-0"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {addArticleMutation.isPending ? 'Adding...' : 'Add URL'}
        </Button>
      </div>

      {status ? (
        <p
          className={
            status.type === 'error'
              ? 'mt-2 text-xs text-destructive'
              : 'mt-2 text-xs text-green-600'
          }
        >
          {status.text}
        </p>
      ) : null}

      {showUrlPreview && (
        <div className="mt-2 w-full bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-sm bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {metadata ? (
                  <img
                    src={metadata.faviconUrl}
                    alt=""
                    className="w-4 h-4"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-2 h-2 bg-muted-foreground/30 rounded-full" />
                )}
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {metadata?.domain ?? getDomain(urlInput)}
              </span>
            </div>

            {isLoadingMetadata ? (
              <>
                <div className="h-5 w-3/4 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-full bg-muted rounded animate-pulse mb-1" />
                <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
              </>
            ) : (
              <>
                <h3 className="text-[16px] font-bold text-foreground mb-1.5 leading-snug tracking-tight line-clamp-2">
                  {metadata?.title ?? getDomain(urlInput)}
                </h3>
                {metadata?.description && (
                  <p className="text-[14px] text-muted-foreground leading-relaxed line-clamp-2 font-normal">
                    {metadata.description}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="px-5 py-3 bg-background border-t border-border flex items-center gap-2 flex-wrap min-h-[50px]">
            {tags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-1 px-2 py-0.5 bg-background border border-border rounded text-[13px] font-medium text-foreground"
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
                placeholder={tags.length === 0 ? 'Add tags (e.g. Design)...' : 'Add tag...'}
                className="flex-1 border-none outline-none text-[13px] placeholder:text-muted-foreground/70 h-6 min-w-[120px]"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
