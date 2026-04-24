'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  LayoutDashboard,
  Building2,
  FileText,
  FolderOpen,
  Settings,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';
import { api } from '@/lib/api';
import { BATTLEMAP_SECTIONS } from '@/lib/battlemap-questionnaire-data';

interface CompanySidebarProps {
  companyId: string;
  companyName?: string;
  className?: string;
}

const PHASE1_SECTIONS = [
  { key: 'a', zh: '企业当前基础', en: 'Foundation' },
  { key: 'b', zh: '基因结构', en: 'Gene Structure' },
  { key: 'c', zh: '商业模式', en: 'Business Model' },
  { key: 'd', zh: '增长与估值', en: 'Growth & Valuation' },
  { key: 'e', zh: '融资准备', en: 'Financing' },
  { key: 'f', zh: '退出与上市', en: 'Exit & Listing' },
];

export function CompanySidebar({ companyId, companyName, className }: CompanySidebarProps) {
  const pathname = usePathname();
  const { t } = useT();
  const base = `/companies/${companyId}`;

  const { data: diagnostics } = useQuery<any[]>({
    queryKey: ['diagnostics'],
    queryFn: () => api.diagnostics.list(),
  });
  const diagnostic = diagnostics?.find((d: any) => d.company_id === companyId);
  const phase1Submitted: string[] = diagnostic?.sections_submitted || [];

  const diagnosticReady = !!(diagnostic?.module_scores && Object.keys(diagnostic.module_scores).some((k) => k !== '_meta'));

  const { data: battleMaps } = useQuery<any[]>({
    queryKey: ['battlemaps'],
    queryFn: () => api.battlemaps.list(),
    enabled: diagnosticReady,
  });
  const battleMap = battleMaps?.find((bm: any) => bm.company_id === companyId);
  const bmSubmitted: string[] = battleMap?.sections_submitted || [];

  // Expand the group that contains the current route by default; persist each
  // user's manual toggles for this session in localStorage.
  const isOnPhase1 = pathname.startsWith(`${base}/questionnaire`);
  const isOnBattlemap = pathname.startsWith(`${base}/battlemap`);

  const [phase1Open, setPhase1Open] = useState<boolean>(true);
  const [battlemapOpen, setBattlemapOpen] = useState<boolean>(true);

  useEffect(() => {
    const p1 = localStorage.getItem('sidebar-phase1-open');
    const bm = localStorage.getItem('sidebar-battlemap-open');
    if (p1 !== null) setPhase1Open(p1 === '1');
    else setPhase1Open(isOnPhase1 || !isOnBattlemap); // default open unless user is elsewhere
    if (bm !== null) setBattlemapOpen(bm === '1');
    else setBattlemapOpen(isOnBattlemap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleP1() {
    const next = !phase1Open;
    setPhase1Open(next);
    localStorage.setItem('sidebar-phase1-open', next ? '1' : '0');
  }
  function toggleBM() {
    const next = !battlemapOpen;
    setBattlemapOpen(next);
    localStorage.setItem('sidebar-battlemap-open', next ? '1' : '0');
  }

  function isActive(href: string) {
    if (href === base) return pathname === href;
    return pathname.startsWith(href);
  }

  const isDashboard = pathname === base;
  const isBattlemapOverview = pathname === `${base}/battlemap`;

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

        {/* Phase 1: Diagnostic Questionnaire */}
        <div className="pt-3">
          <GroupHeader
            label={t('诊断问卷 · Phase 1', 'Questionnaire · Phase 1')}
            submittedCount={phase1Submitted.length}
            totalCount={PHASE1_SECTIONS.length}
            open={phase1Open}
            onToggle={toggleP1}
          />
          {phase1Open && (
            <div className="space-y-0.5 mt-1">
              {PHASE1_SECTIONS.map((s) => {
                const href = `${base}/questionnaire/${s.key}`;
                const active = pathname === href;
                const submitted = phase1Submitted.includes(s.key);
                return (
                  <SectionLink
                    key={s.key}
                    href={href}
                    code={s.key.toUpperCase()}
                    label={t(s.zh, s.en)}
                    active={active}
                    submitted={submitted}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Phase 1.5: Battle Map (only visible once Phase 1 is scored) */}
        {diagnosticReady && (
          <div className="pt-3">
            <GroupHeader
              label={t('战略作战图 · Battle Map', 'Battle Map')}
              submittedCount={bmSubmitted.length}
              totalCount={BATTLEMAP_SECTIONS.length}
              open={battlemapOpen}
              onToggle={toggleBM}
            />
            {battlemapOpen && (
              <div className="space-y-0.5 mt-1">
                {/* Overview link — variant summary, classification, report CTA */}
                <Link
                  href={`${base}/battlemap`}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
                    isBattlemapOverview
                      ? 'bg-slate-700/50 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold bg-emerald-500 text-white shrink-0">
                    ★
                  </span>
                  <span className="truncate flex-1">
                    {battleMap?.variant_name_zh
                      ? t(battleMap.variant_name_zh, battleMap.variant_name_en || 'Overview')
                      : t('概览', 'Overview')}
                  </span>
                </Link>

                {BATTLEMAP_SECTIONS.map((s) => {
                  const href = `${base}/battlemap/${s.key}`;
                  const active = pathname === href;
                  const submitted = bmSubmitted.includes(s.key);
                  return (
                    <SectionLink
                      key={s.key}
                      href={href}
                      code={s.key.toUpperCase()}
                      label={t(s.title_zh, s.title_en)}
                      active={active}
                      submitted={submitted}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="my-2 border-t border-slate-700" />

        <NavLink href={`${base}/reports`} icon={FileText} label={t('报告', 'Reports')} active={isActive(`${base}/reports`)} />

        <NavLink href={`${base}/documents`} icon={FolderOpen} label={t('文档', 'Documents')} active={isActive(`${base}/documents`)} />

        <div className="my-2 border-t border-slate-700" />

        <NavLink href={`${base}/settings`} icon={Settings} label={t('设置', 'Settings')} active={isActive(`${base}/settings`)} />
      </nav>
    </aside>
  );
}

function GroupHeader({
  label,
  submittedCount,
  totalCount,
  open,
  onToggle,
}: {
  label: string;
  submittedCount: number;
  totalCount: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="cursor-pointer flex w-full items-center justify-between px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors"
    >
      <span className="flex items-center gap-2">
        <ChevronDown
          className={cn('h-3 w-3 transition-transform', open ? 'rotate-0' : '-rotate-90')}
        />
        {label}
      </span>
      <span className="text-[10px] font-medium normal-case tracking-normal text-slate-600">
        {submittedCount}/{totalCount}
      </span>
    </button>
  );
}

function SectionLink({
  href,
  code,
  label,
  active,
  submitted,
}: {
  href: string;
  code: string;
  label: string;
  active: boolean;
  submitted: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
        active
          ? 'bg-slate-700/50 text-white'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      )}
    >
      <span
        className={cn(
          'inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold shrink-0',
          submitted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300',
        )}
      >
        {code}
      </span>
      <span className="truncate flex-1">{label}</span>
      {submitted && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
    </Link>
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
