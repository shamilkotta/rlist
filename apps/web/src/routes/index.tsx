import { AppHeader } from '@/components/AppHeader';
import { AppLogo } from '@/components/AppLogo';
import { LandingPage } from '@/components/LandingPage';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { usePaginatedQuery } from '@/hooks/use-paginated-articles';
import { usePendingArticleRecovery } from '@/hooks/use-pending-article-recovery';
import { mapArticlesForDisplay } from '@/lib/article';
import { normalizeTags, toTagsSearchParam } from '@/lib/tags';
import { cn } from '@/lib/utils';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@rlist/api/convex/_generated/api';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate, useRouteContext } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ChevronDown, LayoutGrid, List, LoaderCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ArticleCard, ArticleCardSkeleton } from '../components/ArticleCard';
import { ArticleListItem, ArticleListItemSkeleton } from '../components/ArticleListItem';
import { PasteInput } from '../components/PasteInput';

type ViewMode = 'grid' | 'list';
type TabFilter = 'unread' | 'all' | 'archive';
type HomeRouteSearch = { tab?: TabFilter; tags?: string[] };

const VALID_TABS: TabFilter[] = ['unread', 'all', 'archive'];
const SKELETON_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6'];
const VIEW_MODE_STORAGE_KEY = 'rlist:view-mode';
const ARTICLE_PAGE_SIZE = 24;
const DEFAULT_VIEW_MODE: ViewMode = 'grid';

const TABS: { label: string; value: TabFilter }[] = [
  { label: 'Unread', value: 'unread' },
  { label: 'All Items', value: 'all' },
  { label: 'Archive', value: 'archive' },
];

const TAB_HEADINGS: Record<TabFilter, string> = {
  unread: 'Unread Articles',
  all: 'All Articles',
  archive: 'Archived Articles',
};

export const Route = createFileRoute('/')({
  component: HomeRoute,
  validateSearch: (search: Record<string, unknown>): HomeRouteSearch => {
    const tab = search.tab as string;
    const tags = normalizeTags(search.tags);
    if (VALID_TABS.includes(tab as TabFilter)) {
      return { tab: tab as TabFilter, tags };
    }
    return { tags };
  },
  loaderDeps: ({ search }) => ({ tab: search.tab ?? 'unread', tags: search.tags?.join(',') ?? '' }),
  loader: async (ctx) => {
    return {
      isAuthenticated: ctx.context.isAuthenticated,
    };
  },
  head: (ctx) => ({
    meta: [
      {
        title: ctx.loaderData?.isAuthenticated
          ? 'Your articles | rlist'
          : 'rlist: Your digital library, simplified',
      },
    ],
  }),
});

function HomeRoute() {
  const { tab, tags } = Route.useSearch();
  const activeTab = tab ?? 'unread';
  const selectedTags = tags ?? [];
  const { isAuthenticated } = useRouteContext({ from: Route.id });
  const navigate = useNavigate();
  const [isTagPanelOpen, setIsTagPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_VIEW_MODE;
    }

    const savedViewMode = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return savedViewMode === 'grid' || savedViewMode === 'list' ? savedViewMode : DEFAULT_VIEW_MODE;
  });

  useEffect(() => {
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

  const { data: availableTags = [] } = useQuery({
    ...convexQuery(api.articles.listUserTags, { filter: activeTab }),
    enabled: isAuthenticated,
  });

  const toggleTagFilter = (tag: string) => {
    const normalizedTag = normalizeTags([tag]).at(0);
    if (!normalizedTag) {
      return;
    }

    const nextTags = selectedTags.includes(normalizedTag)
      ? selectedTags.filter((item) => item !== normalizedTag)
      : normalizeTags([...selectedTags, normalizedTag]);

    navigate({
      to: '/',
      search: {
        tab: activeTab,
        tags: toTagsSearchParam(nextTags),
      },
    });
  };

  const clearTagFilters = () => {
    navigate({
      to: '/',
      search: {
        tab: activeTab,
        tags: undefined,
      },
    });
  };

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-muted">
      <AppHeader />

      {/* Filter Bar - sticky */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar -mx-4 sm:-mx-6 px-4 sm:px-6">
            {/* Tabs with scroll-driven animation for margin */}
            <div className="flex items-center gap-4 sm:gap-8 filter-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() =>
                    navigate({
                      to: '/',
                      search: { tab: tab.value, tags: toTagsSearchParam(selectedTags) },
                    })
                  }
                  className={`pt-4 pb-4 text-nowrap text-[13px] sm:text-[14px] font-medium transition-colors border-b-2 ${
                    activeTab === tab.value
                      ? 'text-foreground border-foreground'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsTagPanelOpen((open) => !open)}
                className={cn(
                  'py-4 flex items-center gap-1.5 text-[13px] sm:text-[14px] font-medium transition-colors whitespace-nowrap',
                  selectedTags.length > 0 || isTagPanelOpen
                    ? 'text-foreground border-foreground'
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                )}
              >
                Tags
                {selectedTags.length > 0 && (
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] leading-none text-foreground">
                    {selectedTags.length}
                  </span>
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 opacity-50 transition-transform ${
                    isTagPanelOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            <div className="hidden md:flex items-center shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? (
                  <List className="w-4 h-4" />
                ) : (
                  <LayoutGrid className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isTagPanelOpen && (
        <div className=" bg-background/95">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3">
            {selectedTags.length > 0 && (
              <div className="mb-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
                {selectedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTagFilter(tag)}
                    className="inline-flex items-center gap-1 rounded border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary transition-colors hover:bg-primary/15"
                  >
                    {tag}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearTagFilters}
                  className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Clear all
                </button>
              </div>
            )}

            {availableTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTagFilter(tag)}
                      className={`inline-flex items-center rounded border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
                        isSelected
                          ? 'border-primary/40 bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tags found for this tab.</p>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {/* Add URL Section */}
        <section className="max-w-[1400px] mx-auto px-3 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <motion.div layout transition={{ type: 'spring', bounce: 0, duration: 0.28 }}>
              <h2 className="text-[28px] md:text-[32px] font-bold tracking-tight text-foreground mb-2">
                {TAB_HEADINGS[activeTab]}
              </h2>
              {/* <p className="text-[14px] text-muted-foreground">
                Save and organize articles for later reading
              </p> */}
            </motion.div>
            <PasteInput />
          </div>
        </section>

        {/* Articles Grid/List View */}
        <ArticlesList
          activeTab={activeTab}
          viewMode={viewMode}
          selectedTags={selectedTags}
          onTagClick={toggleTagFilter}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-4">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-muted-foreground text-[13px] font-medium">
            <AppLogo className="w-4 h-4" imgClassName="w-4 h-4" />
            <span>rlist © {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-6 text-[13px] text-muted-foreground font-medium">
            <a href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="/" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="/" className="hover:text-foreground transition-colors">
              GitHub
            </a>
            <a href="/" className="hover:text-foreground transition-colors">
              Contact
            </a>
            <ModeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}

function ArticlesList({
  activeTab,
  viewMode,
  selectedTags,
  onTagClick,
}: {
  activeTab: TabFilter;
  viewMode: ViewMode;
  selectedTags: string[];
  onTagClick: (_tag: string) => void;
}) {
  const {
    results: allUserArticles,
    status: paginationStatus,
    loadMore,
  } = usePaginatedQuery({ filter: activeTab, tags: selectedTags, pageSize: ARTICLE_PAGE_SIZE });

  usePendingArticleRecovery();

  const isInitialArticlesLoading = paginationStatus === 'LoadingFirstPage';
  const canLoadMore = paginationStatus === 'CanLoadMore';
  const isLoadingMore = paginationStatus === 'LoadingMore';
  const isExhausted = paginationStatus === 'Exhausted';

  function handleLoadMore() {
    if (!canLoadMore) {
      return;
    }

    loadMore(ARTICLE_PAGE_SIZE);
  }

  const articles = mapArticlesForDisplay(allUserArticles);
  const showEmptyState = articles.length === 0 && isExhausted;

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-6">
      {isInitialArticlesLoading ? (
        <ArticlesListFallback viewMode={viewMode} />
      ) : showEmptyState ? (
        <div className="py-12 text-center text-muted-foreground text-sm">
          {selectedTags.length > 0
            ? 'No articles match the selected tags.'
            : activeTab === 'unread'
              ? "No unread articles. You're all caught up!"
              : activeTab === 'all'
                ? 'No articles yet. Paste a URL above to add your first article.'
                : 'No archived articles.'}
        </div>
      ) : (
        <>
          {articles.length > 0 && (
            <>
              <div
                className={`${viewMode === 'grid' ? 'grid' : 'md:hidden grid'} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-l border-dashed border-border [&>*:nth-child(-n+1)]:border-t md:[&>*:nth-child(-n+2)]:border-t lg:[&>*:nth-child(-n+3)]:border-t`}
              >
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    {...article}
                    activeTags={selectedTags}
                    onTagClick={onTagClick}
                  />
                ))}
              </div>
              <div
                className={`${viewMode === 'list' ? 'md:block hidden' : 'hidden'} border-l border-t border-dashed border-border`}
              >
                {articles.map((article) => (
                  <ArticleListItem
                    key={article.id}
                    {...article}
                    activeTags={selectedTags}
                    onTagClick={onTagClick}
                  />
                ))}
              </div>
            </>
          )}
          {(canLoadMore || isLoadingMore) && (
            <div className="flex justify-center py-12">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="h-10 w-full max-w-2xl rounded-full border border-dashed border-border/70 bg-background px-8 text-base font-medium text-foreground hover:bg-muted/30 transition-colors disabled:opacity-80"
              >
                {isLoadingMore && <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />}
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ArticlesListFallback({ viewMode }: { viewMode: ViewMode }) {
  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-6">
      <div
        className={`${viewMode === 'grid' ? 'grid' : 'md:hidden grid'} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-l border-dashed border-border [&>*:nth-child(-n+1)]:border-t md:[&>*:nth-child(-n+2)]:border-t lg:[&>*:nth-child(-n+3)]:border-t`}
      >
        {SKELETON_KEYS.map((key) => (
          <ArticleCardSkeleton key={key} />
        ))}
      </div>
      <div
        className={`${viewMode === 'list' ? 'md:block hidden' : 'hidden'} border-l border-t border-dashed border-border`}
      >
        {SKELETON_KEYS.map((key) => (
          <ArticleListItemSkeleton key={key} />
        ))}
      </div>
    </div>
  );
}
