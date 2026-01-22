import { Button, Input, ModeToggle } from '@repo/ui';
import { createFileRoute } from '@tanstack/react-router';
import { ArrowUpRight, Bell, ChevronDown, LayoutGrid, List, Search } from 'lucide-react';
import { ArticleCard } from '../components/ArticleCard';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
  const articles = [
    {
      id: 1,
      title: 'React Server Components: A Comprehensive Guide',
      description:
        'Understanding the mental model of Server Components and how they fundamentally change data fetching in modern React applications.',
      domain: 'react.dev',
      date: '2h ago',
      tags: ['FRONTEND'],
      faviconUrl: 'https://react.dev/favicon.ico',
    },
    {
      id: 2,
      title: 'Designing reliable systems for scale',
      description:
        'How Stripe engineered their API to handle Black Friday traffic with 99.999% uptime through intelligent load balancing.',
      domain: 'stripe.com',
      date: 'Dec 14',
      tags: ['SYSTEM DESIGN'],
      faviconUrl: 'https://stripe.com/favicon.ico',
    },
    {
      id: 3,
      title: 'The craft of interaction design',
      description:
        "Why micro-interactions matter more than you think. A deep dive into the philosophy behind Linear's smooth user experience.",
      domain: 'linear.app',
      date: 'Dec 12',
      tags: ['UX/UI'],
      faviconUrl: 'https://linear.app/favicon.ico',
    },
    {
      id: 4,
      title: 'Zero-config backends on AI Cloud',
      description:
        'Building agents should feel like shaping an idea rather than fighting a maze of code or infrastructure.',
      domain: 'vercel.com',
      date: 'Dec 10',
      tags: ['ENGINEERING', 'AI'],
      faviconUrl: 'https://assets.vercel.com/image/upload/front/favicon/vercel/favicon.ico',
    },
    {
      id: 5,
      title: 'Optimizing large language models',
      description:
        'Techniques for reducing latency and token costs when deploying LLMs in production environments.',
      domain: 'openai.com',
      date: 'Dec 08',
      tags: ['AI', 'ML'],
      faviconUrl: 'https://openai.com/favicon.ico',
    },
    {
      id: 6,
      title: 'Rust 1.75.0 Release Notes',
      description:
        'Async functions in traits, new stabilization features, and performance improvements for the compiler.',
      domain: 'rust-lang.org',
      date: 'Dec 05',
      tags: ['BACKEND'],
      faviconUrl: 'https://www.rust-lang.org/static/images/favicon.svg',
    },
    {
      id: 7,
      title: 'Advanced Prototyping with Variables',
      description:
        'How to use Figma variables to create realistic prototypes with logic, expressions, and dynamic state management.',
      domain: 'figma.com',
      date: 'Dec 03',
      tags: ['DESIGN'],
      faviconUrl: 'https://static.figma.com/app/icon/1/favicon.png',
    },
    {
      id: 8,
      title: 'Tailwind CSS v4.0: The Future of styling',
      description:
        'A sneak peek into the new engine, zero-runtime overhead, and simplified configuration coming in the next major version.',
      domain: 'tailwindcss.com',
      date: 'Dec 01',
      tags: ['CSS', 'FRONTEND'],
      faviconUrl: 'https://tailwindcss.com/favicon.ico',
    },
    {
      id: 9,
      title: 'Supabase is now General Availability',
      description:
        'The open source Firebase alternative declares GA. What this means for enterprise adoption and future roadmap.',
      domain: 'supabase.com',
      date: 'Nov 28',
      tags: ['DATABASE', 'BACKEND'],
      faviconUrl: 'https://supabase.com/favicon.ico',
    },
    {
      id: 10,
      title: 'Drizzle ORM: SQL-like elegance',
      description:
        'Why developers are switching to Drizzle for its widespread type safety, lightweight footprint, and zero dependencies.',
      domain: 'orm.drizzle.team',
      date: 'Nov 25',
      tags: ['DATABASE'],
      faviconUrl: 'https://orm.drizzle.team/favicon.ico',
    },
    {
      id: 11,
      title: 'View Transitions in Astro 3.0',
      description:
        'Seamless page navigation without a full page reload. Native browser APIs making SPAs obsolete?',
      domain: 'astro.build',
      date: 'Nov 22',
      tags: ['FRONTEND'],
      faviconUrl: 'https://astro.build/favicon.ico',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-muted">
      {/* Fixed Logo - stays in place while scrolling */}
      <a
        href="/"
        className="fixed left-6 top-[17px] z-60 flex items-center group"
        style={{ left: 'max(24px, calc((100vw - 1400px) / 2 + 24px))' }}
      >
        <div className="w-6 h-6 bg-primary rounded-[6px] flex items-center justify-center group-hover:bg-primary/90 transition-colors">
          <ArrowUpRight className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
      </a>

      {/* Header - scrolls away */}
      <header className="z-40 w-full bg-background">
        <div className="max-w-[1400px] mx-auto px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Spacer for fixed logo */}
            <div className="w-6" />

            <nav className="hidden md:flex items-center gap-6">
              {['Dashboard', 'Discover', 'Analytics'].map((item) => (
                <a
                  key={item}
                  href="/"
                  className={`text-[14px] font-medium transition-colors whitespace-nowrap ${
                    item === 'Discover'
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
            <div className="relative hidden sm:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-1.5 w-[240px] bg-muted/50 border-transparent hover:border-border text-[13px] focus:bg-background focus:border-border placeholder:text-muted-foreground"
              />
            </div>

            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="w-4 h-4" />
            </Button>

            <button
              type="button"
              className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary/70 to-primary/90" />
            </button>
          </div>
        </div>
      </header>

      {/* Filter Bar - sticky */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Tabs with scroll-driven animation for margin */}
            <div className="flex items-center gap-8 filter-tabs">
              {['All Items', 'Unread', 'Archive'].map((tab, i) => (
                <button
                  key={tab}
                  type="button"
                  className={`py-4 text-[14px] font-medium transition-colors border-b-2 ${
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
                className="py-4 flex items-center gap-1.5 text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors border-b-2 border-transparent"
              >
                Tags <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-20">
        {/* Add URL Section */}
        <section className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h2 className="text-[32px] font-bold tracking-tight text-foreground mb-2">
                Your Articles
              </h2>
              <p className="text-[14px] text-muted-foreground">
                Save and organize articles for later reading
              </p>
            </div>
            <div className="relative flex items-center group shrink-0">
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
                type="text"
                placeholder="Paste a URL to save..."
                className="pl-10 pr-24 py-2 h-auto bg-background border-border rounded-lg shadow-sm text-[14px] placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/10 w-full max-w-[400px]"
              />
              <Button className="absolute right-1.5 top-1.5 bottom-1.5 h-auto px-4 rounded-md font-medium text-[12px]">
                Add URL
              </Button>
            </div>
          </div>
        </section>

        {/* Grid */}
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-l border-t border-dashed border-border">
            {articles.map((article) => (
              <ArticleCard key={article.id} {...article} />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-4">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
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
