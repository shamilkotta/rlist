import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'framer-motion';
import { Search as SearchIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Mock data for search suggestions
const searchItems = [
  {
    id: 1,
    title: 'React Server Components: A Comprehensive Guide',
    domain: 'react.dev',
    date: '2h ago',
    faviconUrl: 'https://react.dev/favicon.ico',
  },
  {
    id: 2,
    title: 'Designing reliable systems for scale',
    domain: 'stripe.com',
    date: 'Dec 14',
    faviconUrl: 'https://stripe.com/favicon.ico',
  },
  {
    id: 3,
    title: 'The craft of interaction design',
    domain: 'linear.app',
    date: 'Dec 12',
    faviconUrl: 'https://linear.app/favicon.ico',
  },
  {
    id: 4,
    title: 'Zero-config backends on AI Cloud',
    domain: 'vercel.com',
    date: 'Dec 10',
    faviconUrl: 'https://assets.vercel.com/image/upload/front/favicon/vercel/favicon.ico',
  },
];

export function Search() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', down);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-9 sm:w-[200px] md:w-[300px] h-9" ref={containerRef}>
      <AnimatePresence>
        {!open && (
          <motion.button
            layoutId="search-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
            type="button"
            onClick={() => setOpen(true)}
            className="absolute inset-0 flex items-center justify-center sm:justify-start w-full px-2 sm:px-3 py-1.5 text-sm rounded-md bg-background border-0 sm:border sm:border-border transition-colors cursor-text text-muted-foreground hover:text-foreground z-10"
          >
            <motion.div
              layoutId="search-icon"
              transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
            >
              <SearchIcon className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-2 text-muted-foreground group-hover:text-foreground transition-colors" />
            </motion.div>
            <motion.span
              layoutId="search-text"
              transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
              className="text-[13px] hidden sm:block flex-1 text-left"
            >
              Find...
            </motion.span>
            <motion.kbd
              layoutId="search-kbd"
              transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
              className="pointer-events-none hidden md:inline-flex h-5 min-w-[34px] items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
            >
              ⌘K
            </motion.kbd>
          </motion.button>
        )}

        {open && (
          <motion.div
            layoutId="search-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
            className="fixed sm:absolute top-4 sm:top-0 left-1/2 sm:left-auto sm:right-0 -translate-x-1/2 sm:translate-x-0 z-100 bg-background border border-border rounded-xl overflow-hidden w-[calc(100vw-32px)] sm:w-[380px] md:w-[450px] shadow-2xl"
          >
            <Command className="w-full bg-transparent" loop>
              <div className="flex items-center border-b border-border px-3 h-[52px]">
                <motion.div
                  layoutId="search-icon"
                  transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
                >
                  <SearchIcon className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
                </motion.div>
                <Command.Input
                  autoFocus
                  placeholder="Find..."
                  value={query}
                  onValueChange={setQuery}
                  className="flex h-full flex-1 rounded-md bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground text-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none focus:ring-0"
                />
                <motion.kbd
                  layoutId="search-kbd"
                  transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
                  className="pointer-events-none inline-flex h-5 min-w-[34px] items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
                >
                  Esc
                </motion.kbd>
              </div>
              <Command.List className="max-h-[360px] overflow-y-auto p-2 scroll-py-2">
                <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                  No results found.
                </Command.Empty>

                <Command.Group className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                  {searchItems.map((item) => (
                    <Command.Item
                      key={item.id}
                      onSelect={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-foreground cursor-pointer transition-colors aria-selected:bg-muted"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-medium truncate">{item.title}</span>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <img
                            src={item.faviconUrl}
                            alt={item.domain}
                            className="w-3 h-3 object-contain"
                          />
                          <span className="text-[11px] font-mono tracking-tight">
                            {item.domain}
                          </span>
                        </div>
                      </div>
                      <div className="ml-auto text-[11px] text-muted-foreground whitespace-nowrap">
                        {item.date}
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
