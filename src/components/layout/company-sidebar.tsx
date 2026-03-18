'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  LayoutDashboard,
  Dna,
  Blocks,
  TrendingUp,
  Banknote,
  DoorOpen,
  Shield,
  FileText,
  Search,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanySidebarProps {
  companyId: string;
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

function getNavSections(companyId: string): NavSection[] {
  const base = `/companies/${companyId}`;
  return [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', href: base, icon: LayoutDashboard },
      ],
    },
    {
      title: 'Analysis Modules',
      items: [
        { label: 'Gene Structure', href: `${base}/gene`, icon: Dna },
        { label: 'Business Model', href: `${base}/business-model`, icon: Blocks },
        { label: 'Valuation', href: `${base}/valuation`, icon: TrendingUp },
        { label: 'Financing', href: `${base}/financing`, icon: Banknote },
        { label: 'Exit Mechanism', href: `${base}/exit`, icon: DoorOpen },
        { label: 'Listing Standards', href: `${base}/listing`, icon: Shield },
      ],
    },
    {
      title: 'Data',
      items: [
        { label: 'Documents', href: `${base}/documents`, icon: FileText },
        { label: 'Research', href: `${base}/research`, icon: Search },
      ],
    },
    {
      items: [
        { label: 'Settings', href: `${base}/settings`, icon: Settings },
      ],
    },
  ];
}

export function CompanySidebar({ companyId, className }: CompanySidebarProps) {
  const pathname = usePathname();
  const navSections = getNavSections(companyId);

  function isActive(href: string) {
    if (href === `/companies/${companyId}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col bg-slate-900 text-white',
        className
      )}
    >
      {/* Back link + Logo */}
      <div className="flex h-14 items-center px-4">
        <Link
          href="/companies"
          className="cursor-pointer flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Companies
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            {section.title && (
              <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {section.title}
              </p>
            )}
            {!section.title && sIdx > 0 && (
              <div className="my-2 border-t border-slate-700" />
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
                      active
                        ? 'bg-slate-700/50 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {/* Status dot placeholder */}
                    <span className="h-2 w-2 rounded-full bg-slate-600 shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
