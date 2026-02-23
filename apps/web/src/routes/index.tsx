import { LandingPage } from '@/components/LandingPage';
import { ModeToggle } from '@/components/mode-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebar } from '@/components/ui/sidebar';
import { mapArticlesForDisplay } from '@/lib/article';
import { authClient } from '@/lib/auth-client';
import {
  clearPendingArticleUrl,
  getPendingArticleUrl,
  setPendingArticleUrl,
} from '@/lib/pending-article';
import { useConvexAction } from '@convex-dev/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@rlist/api/convex/_generated/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, createFileRoute, useNavigate, useRouteContext } from '@tanstack/react-router';
import { ConvexError } from 'convex/values';
import {
  ArrowUpRight,
  BadgeCheck,
  Bell,
  ChevronDown,
  CreditCard,
  LayoutGrid,
  List,
  LogOut,
  Sparkles,
  TextAlignEnd,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ArticleCard, ArticleCardSkeleton } from '../components/ArticleCard';
import { ArticleListItem, ArticleListItemSkeleton } from '../components/ArticleListItem';
import { PasteInput } from '../components/PasteInput';
import { Search } from '../components/Search';

type ViewMode = 'grid' | 'list';
type TabFilter = 'unread' | 'all' | 'archive';

const validTabs: TabFilter[] = ['unread', 'all', 'archive'];
const skeletonKeys = ['s1', 's2', 's3', 's4', 's5', 's6'];
const viewModeStorageKey = 'rlist:view-mode';

const tabs: { label: string; value: TabFilter }[] = [
  { label: 'Unread', value: 'unread' },
  { label: 'All Items', value: 'all' },
  { label: 'Archive', value: 'archive' },
];

export const Route = createFileRoute('/')({
  component: Home,
  validateSearch: (search: Record<string, unknown>): { tab?: TabFilter } => {
    const tab = search.tab as string;
    if (validTabs.includes(tab as TabFilter)) {
      return { tab: tab as TabFilter };
    }
    return {};
  },
});

function Home() {
  const { toggleSidebar } = useSidebar();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { tab } = Route.useSearch();
  const activeTab = tab ?? 'unread';
  const navigate = useNavigate();
  const { isAuthenticated } = useRouteContext({ from: Route.id });
  const { data: session, isPending } = authClient.useSession();
  const { data: userArticles, isLoading: isLoadingArticles } = useQuery({
    ...convexQuery(api.articles.listUserArticles, { filter: activeTab }),
    enabled: isAuthenticated,
  });

  const addArticleMutationFn = useConvexAction(api.articles.addArticle);
  const addArticleMutation = useMutation({ mutationFn: addArticleMutationFn });

  useEffect(() => {
    const savedViewMode = window.localStorage.getItem(viewModeStorageKey);
    if (savedViewMode === 'grid' || savedViewMode === 'list') {
      setViewMode(savedViewMode);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(viewModeStorageKey, viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (!isAuthenticated) return;
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
  }, [isAuthenticated, addArticleMutation]);

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const articles = mapArticlesForDisplay(userArticles);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-muted">
      {/* Fixed Logo - stays in place while scrolling */}
      <a
        href="/"
        className="fixed left-4 sm:left-6 top-[17px] z-80 flex items-center group"
        style={{ left: 'max(16px, calc((100vw - 1400px) / 2 + 16px))' }}
      >
        <div className="w-6 h-6 bg-primary rounded-[6px] flex items-center justify-center group-hover:bg-primary/90 transition-colors">
          <ArrowUpRight className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
      </a>

      {/* Header - scrolls away */}
      <header className="z-60 w-full bg-background">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Spacer for fixed logo */}
            <div className="w-3" />

            <nav className="hidden md:flex items-center gap-6">
              {['Dashboard', 'Discover', 'Analytics'].map((item) => (
                <a
                  key={item}
                  href="/"
                  className={`text-[14px] font-medium transition-colors whitespace-nowrap ${
                    item === 'Dashboard'
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Search />

            {!isPending &&
              (session ? (
                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="hidden md:flex w-8 h-8 rounded-full bg-primary text-primary-foreground items-center justify-center text-xs font-medium hover:opacity-90 transition-opacity overflow-hidden ring-1 ring-border cursor-pointer"
                      >
                        <Avatar className="h-8 w-8 rounded-full">
                          <AvatarImage
                            src={session.user.image ?? ''}
                            alt={session.user.name ?? ''}
                          />
                          <AvatarFallback className="rounded-full">
                            {session.user.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 rounded-lg" align="end" sideOffset={8}>
                      <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                          <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage
                              src={session.user.image ?? ''}
                              alt={session.user.name ?? ''}
                            />
                            <AvatarFallback className="rounded-lg">
                              {session.user.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">{session.user.name}</span>
                            <span className="truncate text-xs text-muted-foreground">
                              {session.user.email}
                            </span>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <Sparkles className="mr-2 h-4 w-4 text-primary" />
                          Upgrade to Pro
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <BadgeCheck className="mr-2 h-4 w-4" />
                          Account
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Billing
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Bell className="mr-2 h-4 w-4" />
                          Notifications
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          authClient.signOut({
                            fetchOptions: {
                              onSuccess: () => {
                                location.reload();
                              },
                            },
                          })
                        }
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild className="hidden md:flex">
                    <Link to="/login">Sign in</Link>
                  </Button>
                  <Button size="sm" asChild className="hidden md:flex">
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </div>
              ))}

            <Button
              variant="ghost"
              size="icon"
              className="flex md:hidden h-8 w-8"
              onClick={toggleSidebar}
            >
              <TextAlignEnd className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Filter Bar - sticky */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar -mx-4 sm:-mx-6 px-4 sm:px-6">
            {/* Tabs with scroll-driven animation for margin */}
            <div className="flex items-center gap-4 sm:gap-8 filter-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => navigate({ to: '/', search: { tab: tab.value } })}
                  className={`py-4 text-nowrap text-[13px] sm:text-[14px] font-medium transition-colors border-b-2 ${
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
                className="py-4 flex items-center gap-1.5 text-[13px] sm:text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors border-b-2 border-transparent whitespace-nowrap"
              >
                Tags <ChevronDown className="w-3.5 h-3.5 opacity-50" />
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

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {/* Add URL Section */}
        <section className="max-w-[1400px] mx-auto px-3 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-[28px] md:text-[32px] font-bold tracking-tight text-foreground mb-2">
                Your Articles
              </h2>
              {/* <p className="text-[14px] text-muted-foreground">
                Save and organize articles for later reading
              </p> */}
            </div>
            <PasteInput />
          </div>
        </section>

        {/* Articles Grid/List View */}
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6">
          {isLoadingArticles ? (
            <>
              <div
                className={`${viewMode === 'grid' ? 'grid' : 'md:hidden grid'} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-l border-dashed border-border [&>*:nth-child(-n+1)]:border-t md:[&>*:nth-child(-n+2)]:border-t lg:[&>*:nth-child(-n+3)]:border-t`}
              >
                {skeletonKeys.map((key) => (
                  <ArticleCardSkeleton key={key} />
                ))}
              </div>
              <div
                className={`${viewMode === 'list' ? 'md:block hidden' : 'hidden'} border-l border-t border-dashed border-border`}
              >
                {skeletonKeys.map((key) => (
                  <ArticleListItemSkeleton key={key} />
                ))}
              </div>
            </>
          ) : articles.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              {activeTab === 'unread' && "No unread articles. You're all caught up!"}
              {activeTab === 'all' &&
                'No articles yet. Paste a URL above to add your first article.'}
              {activeTab === 'archive' && 'No archived articles.'}
            </div>
          ) : (
            <>
              <div
                className={`${viewMode === 'grid' ? 'grid' : 'md:hidden grid'} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-l border-dashed border-border [&>*:nth-child(-n+1)]:border-t md:[&>*:nth-child(-n+2)]:border-t lg:[&>*:nth-child(-n+3)]:border-t`}
              >
                {articles.map((article) => (
                  <ArticleCard key={article.id} {...article} />
                ))}
              </div>
              <div
                className={`${viewMode === 'list' ? 'md:block hidden' : 'hidden'} border-l border-t border-dashed border-border`}
              >
                {articles.map((article) => (
                  <ArticleListItem key={article.id} {...article} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-4">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-muted-foreground text-[13px] font-medium">
            <div className="w-5 h-5 bg-muted rounded flex items-center justify-center">
              <ArrowUpRight className="w-2.5 h-2.5 text-muted-foreground" />
            </div>
            <span>ReadList © 2024</span>
          </div>

          <div className="flex items-center gap-6 text-[13px] text-muted-foreground font-medium">
            <a href="/" className="hover:text-foreground transition-colors">
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
