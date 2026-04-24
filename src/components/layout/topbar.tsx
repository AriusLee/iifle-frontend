'use client';

import { useState, useEffect } from 'react';
import { Menu, LogOut, User, FileText, Globe } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CompanySelector } from '@/components/layout/company-selector';
import { useCompanyStore } from '@/stores/company-store';
import { useI18n } from '@/lib/i18n';

interface TopbarProps {
  onMenuClick: () => void;
  companyId?: string;
  companyName?: string;
}

export function Topbar({ onMenuClick, companyId, companyName }: TopbarProps) {
  const { data: session, status } = useSession();
  const { rightPanel, toggleReports } = useCompanyStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const initials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden cursor-pointer"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Left side — CompanySelector is client-only to avoid Base UI hydration
          mismatch (its useQuery + dropdown useId counters differ SSR vs client). */}
      {companyId ? (
        mounted ? (
          <CompanySelector companyId={companyId} companyName={companyName} />
        ) : (
          <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold">
            <span className="max-w-[200px] truncate text-foreground">
              {companyName || 'Loading...'}
            </span>
          </div>
        )
      ) : (
        <h1 className="text-sm font-semibold text-foreground">
          IIFLE AI Platform
        </h1>
      )}

      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Report toggle (only in company context) */}
        {companyId && (
          <Button
            variant={rightPanel === 'reports' ? 'secondary' : 'ghost'}
            size="icon"
            className="cursor-pointer"
            onClick={toggleReports}
          >
            <FileText className="h-5 w-5" />
            <span className="sr-only">Toggle reports</span>
          </Button>
        )}

        {/* AI chat toggle intentionally hidden — backend + ChatPanel are still
            in the codebase so this can be re-enabled by restoring this block. */}

        {/* Language toggle */}
        <LangToggle />

        {/* User menu — only render on client to avoid hydration mismatch */}
        {mounted && (
          <DropdownMenu>
            <DropdownMenuTrigger className="relative flex h-8 w-8 items-center justify-center rounded-full cursor-pointer hover:bg-muted transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {session?.user?.name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" disabled>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

function LangToggle() {
  const { locale, setLocale } = useI18n();
  return (
    <button
      onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
      className="cursor-pointer flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      title="Switch language"
    >
      <Globe className="h-3.5 w-3.5" />
      {locale === 'zh' ? '中文' : 'EN'}
    </button>
  );
}
