import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ModeToggle } from './mode-toggle';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/10">
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

      <main className="flex-1 flex flex-col items-center justify-center relative px-4 overflow-hidden pt-[60px]">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-size-[6rem_4rem] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] opacity-[0.2]" />

        {/* Hero Section Only */}
        <div className="max-w-[1400px] mx-auto text-center relative z-10 py-20 md:py-32">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-muted-foreground text-[11px] font-medium mb-8 border border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Now in public beta
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-linear-to-b from-foreground to-foreground/60 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            Your personal reading list,
            <br />
            curated for focus.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-[550px] mx-auto mb-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 leading-relaxed">
            ReadList helps you capture and organize articles, newsletters, and papers. No
            distractions, just a beautiful space for your knowledge.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
            <Button size="lg" className="rounded-full px-8 h-12 text-[15px] font-medium" asChild>
              <Link to="/signup">
                Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="rounded-full px-8 h-12 text-[15px] font-medium"
              asChild
            >
              <Link to="/login">Sign in to your account</Link>
            </Button>
          </div>

          {/* Mockup Container */}
          <div className="mt-16 md:mt-20 relative max-w-[1000px] mx-auto animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-500">
            <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-2xl shadow-primary/10 bg-background/50 backdrop-blur-sm p-1 md:p-2">
              <img
                src="/mockup-light.png"
                alt="ReadList Mockup Light"
                className="w-full h-auto rounded-lg border border-border/40 dark:hidden"
              />
              <img
                src="/mockup-dark.png"
                alt="ReadList Mockup Dark"
                className="w-full h-auto rounded-lg border border-border/40 hidden dark:block"
              />
            </div>

            {/* Decorative accents for mockup */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 blur-2xl rounded-full -z-10" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/5 blur-3xl rounded-full -z-10" />
          </div>
        </div>

        {/* Soft Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full -z-10" />
      </main>

      {/* Footer - Minimal */}
      <footer className="bg-background py-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 text-muted-foreground/60 text-[13px] font-medium">
            <div className="w-5 h-5 bg-muted/50 rounded flex items-center justify-center">
              <ArrowUpRight className="w-2.5 h-2.5" />
            </div>
            <span>ReadList © 2024</span>
          </div>

          <div className="flex items-center gap-6 text-[13px] text-muted-foreground/60 font-medium">
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
