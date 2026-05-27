import { AppLogo } from '@/components/AppLogo';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { authClient } from '@/lib/auth-client';
import { Link } from '@tanstack/react-router';
import { ChevronUp, Home, User } from 'lucide-react';

import { UserAccountMenu } from '@/components/UserAccountMenu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSidebar } from '@/components/ui/sidebar';

export function AppSidebar() {
  const isMobile = useIsMobile();
  const { data: session } = authClient.useSession();
  const { setOpenMobile } = useSidebar();

  if (!isMobile) {
    return null;
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex ml-5 items-center gap-2 px-2">
          <AppLogo className="w-5 h-5" imgClassName="w-5 h-5" />
          <span className="font-bold text-lg">rlist</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Home">
                  <Link
                    to="/"
                    onClick={() => {
                      setOpenMobile(false);
                    }}
                  >
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {session && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Profile">
                    <Link
                      to="/profile"
                      onClick={() => {
                        setOpenMobile(false);
                      }}
                    >
                      <User />
                      <span>Profile</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooterComponent />
    </Sidebar>
  );
}

function SidebarFooterComponent() {
  const { data: session } = authClient.useSession();
  const { setOpenMobile } = useSidebar();

  if (!session) {
    return (
      <SidebarFooter className="p-4 border-t border-border space-y-2">
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link
            to="/login"
            onClick={() => {
              setOpenMobile(false);
            }}
          >
            Sign in
          </Link>
        </Button>
        <Button size="sm" asChild className="w-full">
          <Link
            to="/signup"
            onClick={() => {
              setOpenMobile(false);
            }}
          >
            Get Started
          </Link>
        </Button>
      </SidebarFooter>
    );
  }

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <UserAccountMenu
            session={session}
            side="top"
            sideOffset={4}
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            trigger={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={session.user.image ?? ''} alt={session.user.name ?? ''} />
                  <AvatarFallback className="rounded-lg">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{session.user.name}</span>
                  <span className="truncate text-xs">{session.user.email}</span>
                </div>
                <ChevronUp className="ml-auto size-4" />
              </SidebarMenuButton>
            }
          />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
