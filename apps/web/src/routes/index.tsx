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
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@rlist/api/convex/_generated/api';
import { useQuery } from '@tanstack/react-query';
import { Link, createFileRoute, useRouteContext } from '@tanstack/react-router';
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
import { useState } from 'react';
import { ArticleCard } from '../components/ArticleCard';
import { ArticleListItem } from '../components/ArticleListItem';
import { PasteInput } from '../components/PasteInput';
import { Search } from '../components/Search';

export const Route = createFileRoute('/')({
  component: Home,
});

type ViewMode = 'grid' | 'list';

function Home() {
  const { toggleSidebar } = useSidebar();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { isAuthenticated } = useRouteContext({ from: Route.id });
  const { data: session, isPending } = authClient.useSession();
  const { data: userArticles, isLoading: isLoadingArticles } = useQuery({
    ...convexQuery(api.articles.listUserArticles),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const articles = mapArticlesForDisplay(userArticles);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-muted">
      {/* Fixed Logo - stays in place while scrolling */}
      <a
        href="/"
        className="fixed left-4 sm:left-6 top-[17px] z-60 flex items-center group"
        style={{ left: 'max(16px, calc((100vw - 1400px) / 2 + 16px))' }}
      >
        <div className="w-6 h-6 bg-primary rounded-[6px] flex items-center justify-center group-hover:bg-primary/90 transition-colors">
          <ArrowUpRight className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
      </a>

      {/* Header - scrolls away */}
      <header className="z-40 w-full bg-background">
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
              {['All Items', 'Unread', 'Archive'].map((tab, i) => (
                <button
                  key={tab}
                  type="button"
                  className={`py-4 text-nowrap text-[13px] sm:text-[14px] font-medium transition-colors border-b-2 ${
                    i === 0
                      ? 'text-foreground border-foreground'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  {tab}
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
      <main className="pb-20">
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
            <div className="py-12 text-center text-muted-foreground text-sm">
              Loading articles...
            </div>
          ) : articles.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No articles yet. Paste a URL above to add your first article.
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
