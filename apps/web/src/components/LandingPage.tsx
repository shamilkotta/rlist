import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { ArrowRight, ArrowUpRight, BookOpen, Layers, Zap } from 'lucide-react';
import { ModeToggle } from './mode-toggle';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <div className="w-6 h-6 bg-primary rounded-[6px] flex items-center justify-center group-hover:bg-primary/90 transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">ReadList</span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
            <div className="h-4 w-px bg-border mx-2 hidden sm:block" />
            <ModeToggle />
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-[60px]">
        {/* Hero Section */}
        <section className="relative px-4 pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          <div className="max-w-[1400px] mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium mb-6 border border-border animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Now in public beta
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              Your personal reading list,
              <br />
              simplified.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-[600px] mx-auto mb-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
              Save articles, newsletters, and papers. Read them whenever you're ready. No
              distractions, just your content.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
              <Button size="lg" className="rounded-full px-8 h-12 text-base font-medium" asChild>
                <Link to="/signup">
                  Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-12 text-base font-medium"
                asChild
              >
                <Link to="/login">Sign in to your account</Link>
              </Button>
            </div>
          </div>

          {/* Background Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-20 bg-muted/30">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  id: 'fast-saving',
                  icon: <Zap className="w-5 h-5" />,
                  title: 'Fast Saving',
                  description:
                    "Paste a URL and we'll handle the rest. Metadata, content, and tags extracted instantly.",
                },
                {
                  id: 'smart-org',
                  icon: <Layers className="w-5 h-5" />,
                  title: 'Smart Organization',
                  description:
                    'Categorize your reading list with tags. Keep your research, hobbies, and news separate.',
                },
                {
                  id: 'focused-reading',
                  icon: <BookOpen className="w-5 h-5" />,
                  title: 'Focused Reading',
                  description:
                    'A clean, minimal interface designed for one thing: reading without distractions.',
                },
              ].map((feature) => (
                <div
                  key={feature.id}
                  className="p-6 rounded-2xl border border-border bg-background hover:shadow-lg hover:shadow-primary/5 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-24">
          <div className="max-w-[800px] mx-auto text-center border border-border rounded-3xl p-8 md:p-16 relative overflow-hidden bg-background">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to clear your tabs?</h2>
            <p className="text-muted-foreground mb-10 text-lg">
              Join thousands of readers who use ReadList to organize their digital life.
            </p>
            <Button size="lg" className="rounded-full px-10 h-12 text-base font-medium" asChild>
              <Link to="/signup">Start Saving Now</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-10 mt-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 text-muted-foreground text-[13px] font-medium">
            <div className="w-5 h-5 bg-muted rounded flex items-center justify-center">
              <ArrowUpRight className="w-2.5 h-2.5 text-muted-foreground" />
            </div>
            <span>ReadList © 2024</span>
          </div>

          <div className="flex items-center gap-8 text-[13px] text-muted-foreground font-medium">
            <Link to="/" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link to="/" className="hover:text-foreground transition-colors">
              GitHub
            </Link>
            <Link to="/" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
