import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export function PasteInput() {
  const [open, setOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlPreview, setShowUrlPreview] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const urlPreviewRef = useRef<HTMLDivElement>(null);

  const isValidUrl = useCallback((string: string) => {
    const trimmed = string.trim();
    if (!trimmed) return false;

    if (/^https?:\/\/.+/.test(trimmed)) {
      try {
        new URL(trimmed);
        return true;
      } catch {
        return false;
      }
    }

    const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/.*)?$/;
    return domainPattern.test(trimmed);
  }, []);

  const getDomain = (url: string) => {
    try {
      if (!url.startsWith('http')) {
        return new URL(`https://${url}`).hostname;
      }
      return new URL(url).hostname;
    } catch {
      return '';
    }
  };

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrlInput(value);
    setShowUrlPreview(isValidUrl(value) && value.trim().length > 0);
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 15) {
      setTagInput(value);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().toUpperCase();
      if (newTag && tags.length < 2 && !tags.includes(newTag)) {
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
    if (isValidUrl(urlInput)) {
      alert(`Submitting URL: ${urlInput}\nTags: ${tags.join(', ')}`);
      // Reset state
      setOpen(false);
      setUrlInput('');
      setShowUrlPreview(false);
      setTags([]);
      setTagInput('');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close component if clicking outside
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        // Also hide preview
        setShowUrlPreview(false);
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      // Ignore if pasting into an input field (except when component is open and focused, handled naturally? No, global listener usually requires check)
      const target = e.target as HTMLElement;
      if (
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) &&
        !containerRef.current?.contains(target)
      ) {
        return;
      }

      const text = e.clipboardData?.getData('text');
      if (text) {
        // Optionally, check isValidUrl(text) to be strict? User just said "pasting url".
        e.preventDefault();
        setUrlInput(text);
        setOpen(true);
        setShowUrlPreview(isValidUrl(text));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setUrlInput('');
        setShowUrlPreview(false);
        setTags([]);
        setTagInput('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isValidUrl]);

  // Reset input when closed? Or keep it? Search resets.
  useEffect(() => {
    if (!open) {
      // setUrlInput(''); // Maybe keep it for better UX? Search clears it.
      // setShowUrlPreview(false);
    }
  }, [open]);

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
            className="relative flex items-center w-full md:w-[320px] px-3 py-2.5 bg-background border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors z-10"
          >
            <div className="flex items-center pointer-events-none mr-3">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground/50"
              >
                <title>Link icon</title>
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
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
            <div className="relative flex items-center group bg-background border border-border rounded-lg">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground/50"
                >
                  <title>Link icon</title>
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <Input
                autoFocus
                type="text"
                placeholder="Paste a URL to save..."
                value={urlInput}
                onChange={handleUrlInputChange}
                className="pl-10 pr-28 py-2.5 h-auto bg-transparent border-none rounded-lg text-[15px] placeholder:text-muted-foreground focus:ring-0 w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
              />
              <Button
                tabIndex={-1}
                className="absolute right-1.5 top-1.5 bottom-1.5 h-auto px-4 rounded-md font-medium text-[12px]"
                onClick={handleSubmit}
              >
                Add URL
              </Button>
            </div>

            {showUrlPreview && (
              <div
                ref={urlPreviewRef}
                className="absolute top-full left-0 mt-2 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50"
              >
                <div className="p-5">
                  {/* Domain & Favicon Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-sm bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {/* Placeholder favicon or real one if available */}
                      <div className="w-2 h-2 bg-muted-foreground/30 rounded-full" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {getDomain(urlInput)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[16px] font-bold text-foreground mb-1.5 leading-snug tracking-tight line-clamp-2">
                    Example Article Title from URL
                  </h3>

                  {/* Description */}
                  <p className="text-[14px] text-muted-foreground leading-relaxed line-clamp-2 font-normal">
                    This is a sample description that would be fetched from the URL. It provides a
                    brief overview of the article content.
                  </p>
                </div>

                {/* Tag Input Footer */}
                <div className="px-5 py-3 bg-muted/30 border-t border-border flex items-center gap-2 flex-wrap min-h-[50px]">
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
                  {tags.length < 2 && (
                    <input
                      type="text"
                      value={tagInput}
                      onChange={handleTagInputChange}
                      onKeyDown={handleTagKeyDown}
                      placeholder={tags.length === 0 ? 'Add tags (e.g. Design)...' : 'Add tag...'}
                      className="flex-1 bg-transparent border-none outline-none text-[13px] placeholder:text-muted-foreground/70 h-6 min-w-[120px]"
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
