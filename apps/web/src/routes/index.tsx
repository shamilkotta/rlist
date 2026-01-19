import { createFileRoute } from '@tanstack/react-router';
import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  LayoutGrid,
  List,
  Plus,
  Search,
  Settings,
} from 'lucide-react';
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
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 h-[60px]">
        <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-6 h-6 bg-black rounded-[6px] flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[17px] font-bold tracking-tight text-gray-900">ReadList</span>
            </a>

            <nav className="hidden md:flex items-center gap-6 ml-2">
              {['Dashboard', 'Discover', 'Analytics'].map((item) => (
                <a
                  key={item}
                  href="/"
                  className={`text-[14px] font-medium transition-colors ${
                    item === 'Discover' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-1.5 w-[240px] bg-gray-50/50 border border-transparent hover:border-gray-200 rounded-md text-[13px] focus:bg-white focus:border-gray-200 focus:outline-none focus:ring-0 transition-all duration-200 placeholder:text-gray-400"
              />
            </div>

            <button
              type="button"
              className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors"
            >
              <Bell className="w-4 h-4" />
            </button>

            <button
              type="button"
              className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-700 to-slate-800" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 pb-20">
        {/* Hero Section */}
        <section className="pt-32 pb-24 flex flex-col items-center text-center max-w-2xl mx-auto">
          <h1 className="text-[56px] font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]">
            Curate your{' '}
            <span className="relative inline-block text-gray-900 border-b-[6px] border-gray-100/80 leading-[0.8] pb-1">
              knowledge base.
            </span>
          </h1>
          <p className="text-[19px] text-gray-500 max-w-lg mb-12 leading-relaxed font-normal">
            Save articles, documentation, and videos for later reading. Organized and
            distraction-free.
          </p>

          <div className="w-full max-w-[520px] relative flex items-center group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-300"
              >
                <title>Link icon</title>
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Paste a URL to save..."
              className="w-full pl-14 pr-28 py-4 bg-white border border-gray-200 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] text-[16px] placeholder:text-gray-400 focus:border-gray-300 focus:ring-4 focus:ring-gray-50 focus:outline-none transition-all duration-300"
            />
            <button
              type="button"
              className="absolute right-2 top-2 bottom-2 bg-black text-white px-5 rounded-lg font-medium text-[13px] hover:bg-gray-800 focus:ring-4 focus:ring-gray-100 transition-all duration-200 shadow-sm"
            >
              Add URL
            </button>
            <div className="absolute -right-16 top-1/2 -translate-y-1/2 hidden lg:block opacity-20 hover:opacity-100 transition-opacity cursor-pointer">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </section>

        {/* Filters */}
        <div className="sticky top-[60px] z-40 bg-white/90 backdrop-blur-md py-6 mb-8 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1">
                {['All Items', 'Unread', 'Archive'].map((tab, i) => (
                  <button
                    key={tab}
                    type="button"
                    className={`relative px-1 py-1 text-[14px] font-medium transition-colors ${
                      i === 0
                        ? 'text-gray-900 after:absolute after:bottom-[-25px] after:left-0 after:w-full after:h-[2px] after:bg-gray-900'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-gray-200" />

              <button
                type="button"
                className="flex items-center gap-1.5 text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                Tags <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-1.5 rounded text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <div key={article.id} className="h-full">
              <ArticleCard {...article} />
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-20 py-12">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 text-gray-400 text-[13px] font-medium">
            <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center">
              <ArrowUpRight className="w-2.5 h-2.5 text-gray-400" />
            </div>
            <span>ReadList © 2024</span>
          </div>

          <div className="flex items-center gap-8 text-[13px] text-gray-500 font-medium">
            <a href="/" className="hover:text-gray-900 transition-colors">
              Privacy
            </a>
            <a href="/" className="hover:text-gray-900 transition-colors">
              Terms
            </a>
            <a href="/" className="hover:text-gray-900 transition-colors">
              GitHub
            </a>
            <a href="/" className="hover:text-gray-900 transition-colors">
              Contact
            </a>
          </div>

          <button type="button" className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
