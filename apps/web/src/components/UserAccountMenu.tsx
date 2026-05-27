import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSignOut } from '@/hooks/use-sign-out';
import { Link } from '@tanstack/react-router';
import { LogOut, User } from 'lucide-react';

type SessionWithUser = {
  user: { name?: string | null; email?: string | null; image?: string | null };
};

type UserAccountMenuProps = {
  session: SessionWithUser;
  trigger?: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  className?: string;
};

export function UserAccountMenu({
  session,
  trigger,
  align = 'end',
  side = 'bottom',
  sideOffset = 8,
  className,
}: UserAccountMenuProps) {
  const signOut = useSignOut();

  const defaultTrigger = (
    <button
      type="button"
      className="hidden md:flex w-8 h-8 rounded-full bg-primary text-primary-foreground items-center justify-center text-xs font-medium hover:opacity-90 transition-opacity overflow-hidden ring-1 ring-border cursor-pointer"
    >
      <Avatar className="h-8 w-8 rounded-full">
        <AvatarImage src={session.user.image ?? ''} alt={session.user.name ?? ''} />
        <AvatarFallback className="rounded-full">
          {session.user.name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger ?? defaultTrigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        className={className ?? 'w-56 rounded-lg'}
        align={align}
        side={side}
        sideOffset={sideOffset}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={session.user.image ?? ''} alt={session.user.name ?? ''} />
              <AvatarFallback className="rounded-lg">
                {session.user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{session.user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{session.user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
