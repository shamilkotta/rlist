import { createFileRoute } from '@tanstack/react-router';
import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  Grid3X3,
  Link2,
  List,
  Search,
  Settings,
} from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/')({ component: App });

const articles = [
  {
    id: 1,
    favicon: 'https://react.dev/favicon.ico',
    domain: 'react.dev',
    date: '2h ago',
    title: 'React Server Components: A Comprehensive Guide',
    description:
      'Understanding the mental model of Server Components and how they fundamentally change data fetching in modern React applications.',
    tags: [{ label: 'FRONTEND', color: 'bg-gray-100 text-gray-700' }],
  },
  {
    id: 2,
    favicon: 'https://stripe.com/favicon.ico',
    domain: 'stripe.com',
    date: 'Dec 14',
    title: 'Designing reliable systems for scale',
    description:
      'How Stripe engineered their API to handle Black Friday traffic with 99.999% uptime through intelligent load balancing.',
    tags: [{ label: 'SYSTEM DESIGN', color: 'bg-gray-100 text-gray-700' }],
  },
  {
    id: 3,
    favicon: 'https://linear.app/favicon.ico',
    domain: 'linear.app',
    date: 'Dec 12',
    title: 'The craft of interaction design',
    description:
      "Why micro-interactions matter more than you think. A deep dive into the philosophy behind Linear's smooth user experience.",
    tags: [{ label: 'UX/UI', color: 'bg-gray-100 text-gray-700' }],
  },
  {
    id: 4,
    favicon: 'https://vercel.com/favicon.ico',
    domain: 'vercel.com',
    date: 'Dec 10',
    title: 'Zero-config backends on AI Cloud',
    description:
      'Building agents should feel like shaping an idea rather than fighting a maze of code or infrastructure.',
    tags: [
      { label: 'ENGINEERING', color: 'bg-gray-100 text-gray-700' },
      { label: 'AI', color: 'bg-gray-100 text-gray-700' },
    ],
  },
  {
    id: 5,
    favicon: 'https://openai.com/favicon.ico',
    domain: 'openai.com',
    date: 'Dec 08',
    title: 'Optimizing large language models',
    description:
      'Techniques for reducing latency and token costs when deploying LLMs in production environments.',
    tags: [
      { label: 'AI', color: 'bg-gray-100 text-gray-700' },
      { label: 'ML', color: 'bg-gray-100 text-gray-700' },
    ],
  },
  {
    id: 6,
    favicon: 'https://rust-lang.org/favicon.ico',
    domain: 'rust-lang.org',
    date: 'Dec 05',
    title: 'Rust 1.75.0 Release Notes',
    description:
      'Async functions in traits, new stabilization features, and performance improvements for the compiler.',
    tags: [{ label: 'BACKEND', color: 'bg-gray-100 text-gray-700' }],
  },
];

function App() {
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo and Nav */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900 text-lg">ReadList</span>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <a
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </a>
                <a
                  href="/discover"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Discover
                </a>
                <a
                  href="/analytics"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Analytics
                </a>
              </nav>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center bg-gray-50 rounded-lg px-3 py-2 w-48 lg:w-56">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none w-full"
                />
              </div>
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-gray-800 rounded-full" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 tracking-tight mb-4">
              Curate your knowledge base.
            </h1>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              Save articles, documentation, and videos for later reading.
              <br className="hidden sm:block" />
              Organized and distraction-free.
            </p>

            {/* URL Input */}
            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1.5 pl-4 max-w-xl mx-auto shadow-sm">
              <Link2 className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
              <input
                type="url"
                placeholder="Paste a URL to save..."
                className="flex-1 text-gray-600 placeholder-gray-400 outline-none text-sm sm:text-base min-w-0"
              />
              <button
                type="button"
                className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shrink-0"
              >
                Add URL
              </button>
            </div>
          </div>
        </section>

        {/* Tabs and Filters */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'all'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All Items
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('unread')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'unread'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Unread
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('archive')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'archive'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Archive
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap"
                >
                  Tags
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'text-gray-900 bg-gray-100'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'text-gray-900 bg-gray-100'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div
              className={`grid gap-4 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1 max-w-3xl'
              }`}
            >
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={article.favicon}
                        alt=""
                        className="w-5 h-5 rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E";
                        }}
                      />
                      <span className="text-sm text-gray-500">{article.domain}</span>
                    </div>
                    <span className="text-sm text-gray-400">{article.date}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors leading-snug">
                    {article.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
                    {article.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <span
                        key={tag.label}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md ${tag.color}`}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-6 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-500">ReadList © 2024</span>
            </div>

            {/* Links */}
            <nav className="flex items-center gap-6">
              <a
                href="/privacy"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Terms
              </a>
              <a
                href="https://github.com"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                GitHub
              </a>
              <a
                href="/contact"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Contact
              </a>
            </nav>

            {/* Settings */}
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
