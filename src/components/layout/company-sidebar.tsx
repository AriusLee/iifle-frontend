'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  LayoutDashboard,
  Building2,
  FileText,
  FolderOpen,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';

interface CompanySidebarProps {
  companyId: string;
  companyName?: string;
  className?: string;
}

const QUESTIONNAIRE_SECTIONS = [
  { key: 'A', zh: '企业当前基础', en: 'Foundation' },
  { key: 'B', zh: '基因结构', en: 'Gene Structure' },
  { key: 'C', zh: '商业模式', en: 'Business Model' },
  { key: 'D', zh: '增长与估值', en: 'Growth & Valuation' },
  { key: 'E', zh: '融资准备', en: 'Financing' },
  { key: 'F', zh: '退出与上市', en: 'Exit & Listing' },
];

export function CompanySidebar({ companyId, companyName, className }: CompanySidebarProps) {
  const pathname = usePathname();
  const { t } = useT();
  const base = `/companies/${companyId}`;

  function isActive(href: string) {
    if (href === base) return pathname === href;
    return pathname.startsWith(href);
  }

  const isDashboard = pathname === base;

  return (
    <aside className={cn('flex h-full w-64 flex-col bg-slate-900 text-white', className)}>
      {/* Back link */}
      <div className="flex h-14 items-center px-4">
        <Link
          href="/companies"
          className="cursor-pointer flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('所有公司', 'All Companies')}
        </Link>
      </div>

      {companyName && (
        <div className="px-4 pb-3 border-b border-slate-700">
          <p className="text-xs text-slate-500 uppercase tracking-wider">{t('公司', 'Company')}</p>
          <p className="text-sm font-semibold text-white truncate">{companyName}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {/* Dashboard */}
        <NavLink href={base} icon={LayoutDashboard} label={t('仪表盘', 'Dashboard')} active={isDashboard} />

        <NavLink href={`${base}/about`} icon={Building2} label={t('关于公司', 'About')} active={isActive(`${base}/about`)} />

        {/* Questionnaire */}
        <div className="pt-3">
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            {t('诊断问卷', 'Questionnaire')}
          </p>
          <div className="space-y-0.5">
            {QUESTIONNAIRE_SECTIONS.map((s) => {
              const href = `${base}/questionnaire/${s.key.toLowerCase()}`;
              const active = pathname === href;
              return (
                <Link
                  key={s.key}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
                    active
                      ? 'bg-slate-700/50 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold bg-slate-700 text-slate-300 shrink-0">
                    {s.key}
                  </span>
                  <span className="truncate">{t(s.zh, s.en)}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="my-2 border-t border-slate-700" />

        <NavLink href={`${base}/reports`} icon={FileText} label={t('报告', 'Reports')} active={isActive(`${base}/reports`)} />

        <NavLink href={`${base}/documents`} icon={FolderOpen} label={t('文档', 'Documents')} active={isActive(`${base}/documents`)} />

        <div className="my-2 border-t border-slate-700" />

        <NavLink href={`${base}/settings`} icon={Settings} label={t('设置', 'Settings')} active={isActive(`${base}/settings`)} />
      </nav>
    </aside>
  );
}

function NavLink({ href, icon: Icon, label, active }: { href: string; icon: typeof LayoutDashboard; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
        active
          ? 'bg-slate-700/50 text-white'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
