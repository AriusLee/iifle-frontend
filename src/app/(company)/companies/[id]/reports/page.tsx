'use client';

import { use, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FileText, Loader2, Plus, Trash2, Sparkles, Target, ChevronDown, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import type { ReportSummary } from '@/types';

const TYPE_LABELS: Record<string, string> = {
  module_1: '基因',
  module_2: '商模',
  module_3: '估值',
  module_4: '融资',
  module_5: '退出',
  module_6: '上市',
  master: '综合',
  diagnostic: '诊断',
  battle_map: '作战图',
};

const TYPE_COLORS: Record<string, string> = {
  diagnostic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  battle_map: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  master: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

// Per-report-type section labels. Mirrors the backend section definitions so
// the overlay can show "Working on: …" with real names while the AI writes
// each section in parallel.
const DIAGNOSTIC_SECTION_LABELS: { key: string; label: string }[] = [
  { key: 'enterprise_profile', label: '企业画像与阶段判断' },
  { key: 'key_highlights', label: '关键勾选摘要' },
  { key: 'six_scores', label: '六大结构评分' },
  { key: 'ai_assessment', label: 'AI 总判断' },
  { key: 'unicorn_pathway', label: '独角兽路径图' },
  { key: 'action_plan_90d', label: '90 天行动建议' },
  { key: 'upgrade_assessment', label: '升级判断' },
  { key: 'listing_requirements', label: '上市要求对比' },
  { key: 'next_steps', label: '建议承接方向' },
];

const BATTLE_MAP_SECTION_LABELS: { key: string; label: string }[] = [
  { key: 'advanced_verdict', label: '进阶总判断' },
  { key: 'next_stage_goal', label: '下一阶段目标' },
  { key: 'priority_structures', label: '三大结构优先级' },
  { key: 'business_model_upgrade', label: '商业模式升级' },
  { key: 'org_kpi_upgrade', label: '组织与 KPI 升级' },
  { key: 'profit_finance_readiness', label: '利润质量与财务准备' },
  { key: 'equity_governance', label: '股权与治理升级' },
  { key: 'valuation_financing_path', label: '估值与融资路径' },
  { key: 'timeline_battle_plan', label: '90/180/12个月作战图' },
  { key: 'next_service_path', label: '升级承接建议' },
];

function sectionLabelsFor(reportType: string | undefined): { key: string; label: string }[] {
  if (reportType === 'battle_map') return BATTLE_MAP_SECTION_LABELS;
  return DIAGNOSTIC_SECTION_LABELS;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  generating: {
    label: 'Generating',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 animate-pulse',
  },
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  },
  review: {
    label: 'In Review',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  revision: {
    label: 'Revision',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  published: {
    label: 'Published',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState<'diagnostic' | 'battle_map' | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', id],
    queryFn: () => api.reports.list(id),
    refetchInterval: (query) => {
      const data = query.state.data as ReportSummary[] | undefined;
      if (data?.some((r) => r.status === 'generating')) return 2000;
      return false;
    },
  });

  // Prerequisite data: check whether we can generate each report type.
  const { data: diagnostics } = useQuery({
    queryKey: ['diagnostics'],
    queryFn: () => api.diagnostics.list(),
  });
  const companyDiagnostic = diagnostics?.find((d: any) => d.company_id === id) as any;
  const diagnosticCanRun = !!(
    companyDiagnostic &&
    (companyDiagnostic.status === 'completed'
      || companyDiagnostic.status === 'submitted'
      || (companyDiagnostic.sections_submitted?.length || 0) > 0)
  );

  const { data: battleMaps } = useQuery<any[]>({
    queryKey: ['battlemaps'],
    queryFn: () => api.battlemaps.list(),
  });
  const companyBattleMap = battleMaps?.find((bm: any) => bm.company_id === id);
  const battleMapCanRun = !!(companyBattleMap && companyBattleMap.variant);

  const sortedReports = [...(reports || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Type filter: build pill list from whatever types are actually present,
  // so the filter bar reflects reality instead of listing empty categories.
  const typeCounts: Record<string, number> = sortedReports.reduce(
    (acc, r) => ({ ...acc, [r.report_type]: (acc[r.report_type] || 0) + 1 }),
    {} as Record<string, number>,
  );
  const filterTypes: { key: string; label: string }[] = [
    { key: 'all', label: 'All' },
    // Ordered so the primary report types always appear first when present.
    ...(['diagnostic', 'battle_map', 'master'] as const)
      .filter((k) => typeCounts[k] > 0)
      .map((k) => ({ key: k, label: TYPE_LABELS[k] || k })),
    // Any remaining types (module_1..6, etc.) appended in insertion order.
    ...Object.keys(typeCounts)
      .filter((k) => !['diagnostic', 'battle_map', 'master'].includes(k))
      .map((k) => ({ key: k, label: TYPE_LABELS[k] || k })),
  ];

  const filteredReports = typeFilter === 'all'
    ? sortedReports
    : sortedReports.filter((r) => r.report_type === typeFilter);

  const activeGenerating = sortedReports.find((r) => r.status === 'generating') || null;
  const overlayOpen = !!generating || !!activeGenerating;
  // Pick section labels by the actively-generating report's type; fall back
  // to whichever flow we just kicked off so the overlay shows the right names
  // during the ~2s lag before the new row appears in the polled list.
  const overlayType = activeGenerating?.report_type || generating || undefined;
  const overlaySectionLabels = sectionLabelsFor(overlayType);
  const overlayTitle = overlayType === 'battle_map'
    ? 'Generating Battle Map Report'
    : 'Generating Diagnostic Report';

  const handleGenerateDiagnostic = async () => {
    if (!diagnosticCanRun || !companyDiagnostic) {
      toast.error('No scored diagnostic found. Please complete at least one section first.');
      return;
    }
    setGenerating('diagnostic');
    try {
      await api.diagnostics.generateReport(companyDiagnostic.id);
      await queryClient.invalidateQueries({ queryKey: ['reports', id] });
      toast.success('Diagnostic report generation started');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate diagnostic report');
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateBattleMap = async () => {
    if (!battleMapCanRun || !companyBattleMap) {
      toast.error('Battle map must be classified before generating the report.');
      return;
    }
    setGenerating('battle_map');
    try {
      await api.battlemaps.generateReport(companyBattleMap.id);
      await queryClient.invalidateQueries({ queryKey: ['reports', id] });
      await queryClient.invalidateQueries({ queryKey: ['battlemaps'] });
      toast.success('Battle map report generation started');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate battle map report');
    } finally {
      setGenerating(null);
    }
  };

  const GenerateMenu = ({ size = 'default' }: { size?: 'default' | 'sm' | 'lg' }) => (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size={size}
            className="cursor-pointer gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={!!generating}
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {generating ? 'Generating...' : 'Generate Report'}
            <ChevronDown className="h-4 w-4 opacity-70" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Pick report type
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer py-2.5"
          disabled={!diagnosticCanRun}
          onClick={handleGenerateDiagnostic}
        >
          <div className="flex items-start gap-2.5 w-full">
            <div className="mt-0.5 h-7 w-7 rounded-md bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
              <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium">诊断报告</p>
                <span className="text-[10px] text-muted-foreground">Phase 1</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {diagnosticCanRun
                  ? '9 章诊断报告 — 企业画像、六大评分、90 天行动'
                  : '需先完成诊断问卷至少一个分区'}
              </p>
            </div>
            {!diagnosticCanRun && <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />}
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer py-2.5"
          disabled={!battleMapCanRun}
          onClick={handleGenerateBattleMap}
        >
          <div className="flex items-start gap-2.5 w-full">
            <div className="mt-0.5 h-7 w-7 rounded-md bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
              <Target className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium">作战图报告</p>
                <span className="text-[10px] text-muted-foreground">
                  {companyBattleMap?.variant_name_zh || 'Battle Map'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {battleMapCanRun
                  ? '10 章作战方案 — 优先级、时间轴、升级承接'
                  : '需先完成作战图问卷并生成分类'}
              </p>
            </div>
            {!battleMapCanRun && <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Full-screen AI generation overlay — blocks interaction while a report
          is being generated. Uses real polling data (sections_done / total /
          section_keys) to show live progress. */}
      <ReportGenerationOverlay
        open={overlayOpen}
        report={activeGenerating}
        sectionLabels={overlaySectionLabels}
        title={overlayTitle}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports 报告</h1>
            <p className="text-sm text-muted-foreground">
              AI-generated analysis reports for this company
            </p>
          </div>
        </div>
        {sortedReports.length > 0 && <GenerateMenu />}
      </div>

      {/* Empty state */}
      {sortedReports.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-semibold">暂无报告 No reports yet</h3>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              Generate your first report based on completed diagnostics
            </p>
            <GenerateMenu />
          </CardContent>
        </Card>
      )}

      {/* Type filter — only shown when there's more than one type to pick from */}
      {sortedReports.length > 0 && filterTypes.length > 2 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {filterTypes.map((ft) => {
            const active = typeFilter === ft.key;
            const count = ft.key === 'all' ? sortedReports.length : (typeCounts[ft.key] || 0);
            return (
              <button
                key={ft.key}
                type="button"
                onClick={() => setTypeFilter(ft.key)}
                className={`cursor-pointer flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <span>{ft.label}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? 'bg-white/20' : 'bg-muted'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Reports table */}
      {sortedReports.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-sm text-muted-foreground">
                      No reports match this filter.{' '}
                      <button
                        type="button"
                        onClick={() => setTypeFilter('all')}
                        className="cursor-pointer text-emerald-600 hover:underline"
                      >
                        Clear filter
                      </button>
                    </TableCell>
                  </TableRow>
                )}
                {filteredReports.map((report) => {
                  const statusCfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.draft;
                  const isGenerating = report.status === 'generating';
                  const rowSectionLabels = sectionLabelsFor(report.report_type);
                  const doneKeys = new Set(report.sections_done_keys || []);
                  const total = report.sections_total || rowSectionLabels.length;
                  const done = report.sections_done || 0;
                  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
                  // We have canonical section names for diagnostic + battle_map;
                  // for other types fall back to the count only.
                  const hasNamedSections = report.report_type === 'diagnostic' || report.report_type === 'battle_map';
                  const inProgress = hasNamedSections
                    ? rowSectionLabels.filter((s) => !doneKeys.has(s.key)).slice(0, 3)
                    : [];
                  return (
                    <TableRow
                      key={report.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        router.push(`/companies/${id}/reports/${report.id}`)
                      }
                    >
                      <TableCell className="font-medium">
                        <div>{report.title || 'Untitled Report'}</div>
                        {isGenerating && (
                          <div className="mt-2 max-w-md">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Loader2 className="h-3 w-3 animate-spin text-yellow-600" />
                              <span className="font-medium text-yellow-700 dark:text-yellow-400">
                                {done} / {total} sections complete
                              </span>
                              <span className="text-muted-foreground/60">·</span>
                              <span>{percent}%</span>
                            </div>
                            <div className="h-1 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-yellow-500 transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            {hasNamedSections && inProgress.length > 0 && (
                              <p className="mt-1.5 text-[11px] text-muted-foreground">
                                <span className="font-medium">Working on: </span>
                                {inProgress.map((s) => s.label).join('、')}
                                {rowSectionLabels.filter((s) => !doneKeys.has(s.key)).length > 3 && '…'}
                              </p>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={TYPE_COLORS[report.report_type] || 'bg-gray-100 text-gray-800'}
                        >
                          {TYPE_LABELS[report.report_type] || report.report_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusCfg.className}>
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="uppercase text-sm text-muted-foreground">
                        {report.language}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDate(report.created_at)}
                      </TableCell>
                      <TableCell>
                        <button
                          className="cursor-pointer p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                          disabled={deleting === report.id}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!confirm('Delete this report?')) return;
                            setDeleting(report.id);
                            try {
                              await api.reports.delete(id, report.id);
                              queryClient.invalidateQueries({ queryKey: ['reports', id] });
                              toast.success('Report deleted');
                            } catch (err: any) {
                              toast.error(err.message);
                            } finally {
                              setDeleting(null);
                            }
                          }}
                        >
                          {deleting === report.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Trash2 className="h-4 w-4" />}
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ── Report generation overlay ───────────────────────────────────────────
 * Full-screen blocking overlay shown while a diagnostic report is being
 * generated. Cannot be dismissed. Uses the live polling data from the
 * reports list endpoint to show real per-section progress.
 */
function ReportGenerationOverlay({
  open,
  report,
  sectionLabels,
  title,
}: {
  open: boolean;
  report: ReportSummary | null;
  sectionLabels: { key: string; label: string }[];
  title: string;
}) {
  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const doneKeys = new Set(report?.sections_done_keys || []);
  const total = report?.sections_total || sectionLabels.length;
  const done = report?.sections_done || 0;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  // Find the next 1-3 sections being worked on right now
  const inProgress = sectionLabels.filter((s) => !doneKeys.has(s.key));
  const currentlyWorkingOn = inProgress.slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mx-4 w-full max-w-lg rounded-2xl border bg-card p-8 shadow-2xl">
        {/* Animated radial spinner */}
        <div className="relative mx-auto mb-6 h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-100 dark:border-emerald-900/40" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-emerald-500" />
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-1 text-center text-lg font-bold">{title}</h3>
        <p className="mb-5 text-center text-xs text-muted-foreground">
          {report?.title || 'AI is analysing the diagnostic and writing each section'}
        </p>

        {/* Progress bar */}
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
            {done} / {total} sections complete
          </span>
          <span className="text-muted-foreground">{percent}%</span>
        </div>
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Section checklist */}
        <ul className="mb-5 flex max-h-64 flex-col gap-1.5 overflow-y-auto">
          {sectionLabels.map((s) => {
            const isDone = doneKeys.has(s.key);
            const isCurrent = !isDone && currentlyWorkingOn.some((c) => c.key === s.key);
            return (
              <li
                key={s.key}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                  isCurrent
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 font-semibold text-emerald-700 dark:text-emerald-400'
                    : isDone
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/40'
                }`}
              >
                <span className="flex h-4 w-4 items-center justify-center shrink-0">
                  {isDone ? (
                    <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isCurrent ? (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                  )}
                </span>
                <span className="flex-1">{s.label}</span>
                {isCurrent && (
                  <Loader2 className="h-3 w-3 animate-spin text-emerald-500 shrink-0" />
                )}
              </li>
            );
          })}
        </ul>

        {/* Hint */}
        <p className="text-center text-[11px] text-muted-foreground">
          AI is writing each section in parallel — typically completes in 50-90 seconds.
          Please don&apos;t close this page.
        </p>
      </div>
    </div>
  );
}
