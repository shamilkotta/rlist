import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClickOutside } from '@/hooks/use-click-outside';
import { useDebounce } from '@/hooks/use-debounce';
import { getDomain, isValidUrl, validateArticleUrl } from '@/lib/url';
import { convexAction, useConvexAction } from '@convex-dev/react-query';
import { api } from '@rlist/api/convex/_generated/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ConvexError } from 'convex/values';
import { AnimatePresence, motion } from 'framer-motion';
import { Link2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const MAX_TAGS = 2;
const TAG_MAX_LENGTH = 15;
const URL_DEBOUNCE_MS = 500;

function LinkIcon({ className }: { className?: string }) {
  return <Link2 className={className} size={16} strokeWidth={2} aria-hidden />;
}

export function PasteInput() {
  const [open, setOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlPreview, setShowUrlPreview] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const urlPreviewRef = useRef<HTMLDivElement>(null);

  const valueToDebounce = showUrlPreview && isValidUrl(urlInput) ? urlInput : '';
  const debouncedUrl = useDebounce(valueToDebounce, URL_DEBOUNCE_MS);

  const shouldFetch = showUrlPreview && isValidUrl(debouncedUrl);

  const { data: metadata, isLoading: isLoadingMetadata } = useQuery({
    ...convexAction(api.articles.fetchMetadata, shouldFetch ? { url: debouncedUrl } : 'skip'),
    retry: false,
  });

  const mutationFn = useConvexAction(api.articles.addArticle);
  const addArticleMutation = useMutation({ mutationFn });

  const resetState = useCallback(() => {
    setOpen(false);
    setUrlInput('');
    setShowUrlPreview(false);
    setTags([]);
    setTagInput('');
  }, []);

  useClickOutside(containerRef, resetState);

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrlInput(value);
    setShowUrlPreview(isValidUrl(value) && value.trim().length > 0);
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
      const newTag = tagInput.trim().toUpperCase();
      if (newTag && tags.length < MAX_TAGS && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      e.preventDefault();
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    const urlToSubmit = debouncedUrl || urlInput;
    const validated = validateArticleUrl(urlToSubmit);
    if (!validated) return;

    addArticleMutation.mutate(
      {
        url: validated,
        tags,
      },
      {
        onSuccess: () => {
          toast.success('Article added');
          resetState();
        },
        onError: (error) => {
          if (
            error instanceof ConvexError &&
            'code' in error.data &&
            error.data.code === 'ALREADY_SAVED_ARTICLE'
          ) {
            toast.error('Article already saved');
            return;
          }
          toast.error(error instanceof ConvexError ? error.data.message : 'Failed to add article');
        },
      }
    );
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) &&
        !containerRef.current?.contains(target)
      ) {
        return;
      }

      const text = e.clipboardData?.getData('text');
      if (text) {
        e.preventDefault();
        setUrlInput(text);
        setOpen(true);
        const valid = isValidUrl(text);
        setShowUrlPreview(valid);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetState();
      }
    };

    document.addEventListener('paste', handlePaste);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [resetState]);

  return (
    <div className="relative h-auto sm:h-[50px] w-full md:w-auto" ref={containerRef}>
      <AnimatePresence mode="wait">
        {!open && (
          <motion.button
            layoutId="paste-input-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
            onClick={() => setOpen(true)}
            className="relative flex items-center h-11 cursor-text w-full md:w-[320px] px-3 bg-background border border-border rounded-md text-muted-foreground hover:text-foreground transition-colors z-10 focus:outline-none"
          >
            <div className="flex items-center pointer-events-none mr-3">
              <LinkIcon className="text-muted-foreground/50" />
            </div>
            <span className="text-[15px]">Paste a URL to save...</span>
          </motion.button>
        )}

        {open && (
          <motion.div
            layoutId="paste-input-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
            className="relative z-50 w-full md:w-[480px]"
          >
            <div className="relative flex items-center h-11 group bg-background border border-border rounded-md">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <LinkIcon className="text-muted-foreground/50" />
              </div>
              <Input
                autoFocus
                type="text"
                placeholder="Paste a URL to save..."
                value={urlInput}
                onChange={handleUrlInputChange}
                className="pl-10 pr-28 h-full dark:bg-background border-none rounded-md text-[15px] placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 w-full shadow-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
              />
              <Button
                tabIndex={-1}
                className="absolute right-1.5 top-1.5 bottom-1.5 h-auto px-4 rounded-[calc(var(--radius)-5px)] font-medium text-[12px] focus-visible:ring-0 focus-visible:ring-offset-0"
                onClick={handleSubmit}
                disabled={addArticleMutation.isPending}
              >
                {addArticleMutation.isPending ? 'Adding...' : 'Add URL'}
              </Button>
            </div>

            {showUrlPreview && (
              <div
                ref={urlPreviewRef}
                className="absolute top-full left-0 mt-2 w-full bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50"
              >
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-sm bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {metadata ? (
                        <img
                          src={metadata.faviconUrl}
                          alt=""
                          className="w-4 h-4"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
