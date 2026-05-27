import { AppLogo } from '@/components/AppLogo';
import { Search } from '@/components/Search';
import { UserAccountMenu } from '@/components/UserAccountMenu';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth-client';
import { Link } from '@tanstack/react-router';
import { TextAlignEnd } from 'lucide-react';

export function AppHeader() {
  const { toggleSidebar } = useSidebar();
  const { data: session, isPending } = authClient.useSession();

  return (
    <>
      <Link
        to="/"
        className="fixed left-4 sm:left-6 top-[18.5px] z-80 flex items-center group"
        style={{ left: 'max(16px, calc((100vw - 1400px) / 2 + 16px))' }}
      >
        <AppLogo className="w-5 h-5" imgClassName="w-5 h-5" />
      </Link>

      <header className="z-60 w-full bg-background">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-1" />
            <Link
              to="/"
              className="text-lg transition-colors whitespace-nowrap text-foreground font-bold"
            >
              rlist
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Search />

            {!isPending && session && (
              <div className="flex items-center gap-3">
                <UserAccountMenu session={session} />
              </div>
            )}

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
    </>
  );
}
