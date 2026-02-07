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

        <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 md:py-24 relative z-10">
          {/* Left Column: Content */}
          <div className="text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-muted-foreground text-[11px] font-medium mb-6 border border-border/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                Now in public beta
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-linear-to-b from-foreground to-foreground/60 bg-clip-text text-transparent leading-[1.15]">
                Your personal reading list,
                <br />
                curated for focus.
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-[550px] lg:mx-0 mx-auto leading-relaxed">
                ReadList helps you capture and organize articles, newsletters, and papers. No
                distractions, just a beautiful space for your knowledge.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button
                size="lg"
                className="rounded-full px-8 h-12 text-[15px] font-medium w-full sm:w-auto"
                asChild
              >
                <Link to="/signup">
                  Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="rounded-full px-8 h-12 text-[15px] font-medium w-full sm:w-auto"
                asChild
              >
                <Link to="/login">Sign in to your account</Link>
              </Button>
            </div>
          </div>

          {/* Right Column: Mockup */}
          <div className="relative animate-in fade-in slide-in-from-right-12 duration-1000 delay-200">
            <div
              className="relative aspect-video lg:aspect-square xl:aspect-video rounded-2xl overflow-hidden border border-border/50 shadow-[0_0_50px_-12px_rgba(0,0,0,0.3)] shadow-primary/10 bg-background/50 backdrop-blur-sm p-1"
              style={{
                transform: 'perspective(2000px) rotateY(-15deg) rotateX(5deg) scale(1.1)',
                transformStyle: 'preserve-3d',
              }}
            >
              <img
                src="/mockup-light.png"
                alt=""
                className="w-full h-full object-cover object-top rounded-xl border border-border/40 dark:hidden"
              />
              <img
                src="/mockup-dark.png"
                alt=""
                className="w-full h-full object-cover object-top rounded-xl border border-border/40 hidden dark:block"
              />
            </div>

            {/* Floating UI Elements (Decorative) */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 blur-[60px] rounded-full animate-pulse" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 blur-[80px] rounded-full" />
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
