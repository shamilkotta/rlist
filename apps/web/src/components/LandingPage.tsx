import { Link } from '@tanstack/react-router';

import { ModeToggle } from '@/components/mode-toggle';

export function LandingPage() {
  return (
    <div className="bg-[#f6f7f8] dark:bg-[#0a0a0a] font-geist text-slate-900 dark:text-slate-100 min-h-screen flex flex-col antialiased selection:bg-foreground selection:text-background overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-slate-200 dark:border-[#333333] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 text-slate-900 dark:text-white">
                <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <title>Reader logo</title>
                  <path
                    d="M4 19V5C4 3.89543 4.89543 3 6 3H19C19.5523 3 20 3.44772 20 4V20C20 20.5523 19.5523 21 19 21H6C4.89543 21 4 20.1046 4 19ZM6 5H18V19H6V5Z"
                    fill="currentColor"
                    fillOpacity={0.2}
                  />
                  <path
                    d="M4 5C4 3.89543 4.89543 3 6 3H19C19.5523 3 20 3.44772 20 4V19H6C4.89543 19 4 18.1046 4 17V5Z"
                    stroke="currentColor"
                    strokeWidth={2}
                  />
                  <path d="M8 8H16" stroke="currentColor" strokeLinecap="round" strokeWidth={2} />
                  <path d="M8 12H13" stroke="currentColor" strokeLinecap="round" strokeWidth={2} />
                </svg>
              </div>
              <span className="font-bold text-lg tracking-tight">Reader</span>
            </div>
            {/* Auth Button */}
            <Link
              to="/login"
              className="text-sm font-medium px-4 py-2 rounded-lg transition-colors text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-12">
        {/* Subtle Grid Background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none mix-blend-soft-light"
          style={{
            backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center mt-8">
          {/* Hero Text */}
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Your digital library,
            <br />
            simplified.
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-[#888888] max-w-2xl mb-10 leading-relaxed">
            The fastest way to save, organize, and rediscover the content you love. Built for speed
            and simplicity.
          </p>

          {/* Interactive Input Simulation */}
          <div className="w-full max-w-lg relative group mb-16">
            <div className="relative flex items-center bg-white dark:bg-black border border-slate-200 dark:border-[#333333] rounded-xl p-2 shadow-2xl">
              <div className="pl-3 pr-2 text-slate-400 dark:text-slate-500">
                <span className="material-symbols-outlined text-xl" style={{ lineHeight: 'unset' }}>
                  link
                </span>
              </div>
              <input
                className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm sm:text-base h-10 focus:ring-0"
                placeholder="https://example.com/article..."
                readOnly
                type="text"
              />
              <Link
                to="/signup"
                className="bg-foreground text-background text-sm font-semibold px-4 h-9 rounded-lg transition-all shadow-[0_0_15px_rgba(19,127,236,0.3)] hover:shadow-[0_0_25px_rgba(19,127,236,0.5)] flex items-center gap-2"
              >
                <span>Save</span>
                <span className="hidden sm:inline opacity-70 text-xs font-normal">↵</span>
              </Link>
            </div>
          </div>

          {/* Dashboard Screenshot */}
          <div className="relative w-full max-w-4xl mx-auto mb-24 group perspective-1000">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-t from-[#137fec]/20 via-transparent to-transparent rounded-xl blur-2xl opacity-50 group-hover:opacity-70 transition duration-700" />
            {/* Mockup Container */}
            <div className="relative rounded-xl border border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#111111] overflow-hidden shadow-2xl">
              {/* Fake Browser Header */}
              <div className="h-8 border-b border-slate-200 dark:border-[#333333] flex items-center px-4 gap-2 bg-white/50 dark:bg-black/50">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
              {/* Image */}
              <div className="aspect-[16/10] w-full bg-slate-100 dark:bg-[#050505] relative overflow-hidden">
                {/* Abstract UI Representation */}
                <div className="absolute inset-0 flex flex-col p-6 gap-4">
                  {/* Sidebar & Content Layout */}
                  <div className="flex gap-6 h-full">
                    {/* Sidebar Mock */}
                    <div className="w-48 hidden sm:flex flex-col gap-3 border-r border-slate-200 dark:border-[#333333] pr-6 opacity-40">
                      <div className="h-4 w-24 bg-slate-300 dark:bg-slate-700 rounded mb-4" />
                      <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                    {/* List View Mock */}
                    <div className="flex-1 flex flex-col gap-4">
                      {/* List Item 1 */}
                      <div className="h-16 w-full border border-slate-200 dark:border-[#333333] rounded-lg flex items-center px-4 gap-4 bg-white dark:bg-black">
                        <div className="h-8 w-8 rounded bg-[#137fec]/20 flex items-center justify-center text-[#137fec]">
                          {/* <span className="material-symbols-outlined text-[18px]">article</span> */}
                          <span className="material-symbols-outlined text-[18px]">link</span>
                        </div>
                        <div className="flex-1">
                          <div className="h-3 w-48 bg-slate-300 dark:bg-slate-700 rounded mb-2" />
                          <div className="h-2 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                        </div>
                      </div>
                      {/* List Item 2 */}
                      <div className="h-16 w-full border border-slate-200 dark:border-[#333333] rounded-lg flex items-center px-4 gap-4 bg-white dark:bg-black opacity-80">
                        <div className="h-8 w-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-500">
                          {/* <span className="material-symbols-outlined text-[18px]">
                            video_library
                          </span> */}
                          <span className="material-symbols-outlined text-[18px]">link</span>
                        </div>
                        <div className="flex-1">
                          <div className="h-3 w-64 bg-slate-300 dark:bg-slate-700 rounded mb-2" />
                          <div className="h-2 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                        </div>
                      </div>
                      {/* List Item 3 */}
                      <div className="h-16 w-full border border-slate-200 dark:border-[#333333] rounded-lg flex items-center px-4 gap-4 bg-white dark:bg-black opacity-60">
                        <div className="h-8 w-8 rounded bg-green-500/20 flex items-center justify-center text-green-500">
                          {/* <span className="material-symbols-outlined text-[18px]">image</span> */}
                          <span className="material-symbols-outlined text-[18px]">link</span>
                        </div>
                        <div className="flex-1">
                          <div className="h-3 w-40 bg-slate-300 dark:bg-slate-700 rounded mb-2" />
                          <div className="h-2 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                        </div>
                      </div>
                      {/* List Item 4 */}
                      <div className="h-16 w-full border border-slate-200 dark:border-[#333333] rounded-lg flex items-center px-4 gap-4 bg-white dark:bg-black opacity-40">
                        <div className="h-8 w-8 rounded bg-orange-500/20 flex items-center justify-center text-orange-500">
                          <span className="material-symbols-outlined text-[18px]">link</span>
                        </div>
                        <div className="flex-1">
                          <div className="h-3 w-56 bg-slate-300 dark:bg-slate-700 rounded mb-2" />
                          <div className="h-2 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-24 px-4">
            {/* Feature 1 */}
            <div className="flex flex-col items-start text-left p-6 rounded-2xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#333333] transition hover:border-slate-300 dark:hover:border-slate-700">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4 text-slate-900 dark:text-white">
                <span className="material-symbols-outlined">search</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Search</h3>
              <p className="text-slate-600 dark:text-[#888888] text-sm leading-relaxed">
                Instant full-text search across all your saved links. Find exactly what you need in
                milliseconds.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col items-start text-left p-6 rounded-2xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#333333] transition hover:border-slate-300 dark:hover:border-slate-700">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4 text-slate-900 dark:text-white">
                <span className="material-symbols-outlined">folder_open</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Group</h3>
              <p className="text-slate-600 dark:text-[#888888] text-sm leading-relaxed">
                Tag and categorize with zero friction. Create smart collections that organize
                themselves.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col items-start text-left p-6 rounded-2xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#333333] transition hover:border-slate-300 dark:hover:border-slate-700">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4 text-slate-900 dark:text-white">
                <span className="material-symbols-outlined">menu_book</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Read</h3>
              <p className="text-slate-600 dark:text-[#888888] text-sm leading-relaxed">
                Distraction-free reader view built-in. Strip away ads and clutter for pure reading
                focus.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="w-full max-w-3xl relative">
            {/* <div className="absolute inset-0 bg-gradient-radial from-[#137fec]/20 to-transparent blur-3xl -z-10" /> */}
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Start your library today.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* <Link
                to="/signup"
                className="px-8 py-3 rounded-lg bg-[#137fec] hover:bg-[#0b5cb5] text-white font-semibold transition-all shadow-lg shadow-[#137fec]/25"
              >
                Get Started for Free
              </Link> */}
              <Link
                to="/signup"
                className="px-8 py-3 rounded-lg border border-slate-200 dark:border-[#333333] bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-[#333333] py-10 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-600">
            <div className="w-5 h-5">
              <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <title>Reader logo</title>
                <path
                  d="M4 19V5C4 3.89543 4.89543 3 6 3H19C19.5523 3 20 3.44772 20 4V20C20 20.5523 19.5523 21 19 21H6C4.89543 21 4 20.1046 4 19ZM6 5H18V19H6V5Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="text-sm">© 2024 Minimalist Reader.</span>
          </div>
          <div className="flex gap-8">
            <Link
              to="/"
              className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/"
              className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors"
            >
              Terms
            </Link>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors"
            >
              Twitter
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors"
            >
              GitHub
            </a>
            <ModeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}
