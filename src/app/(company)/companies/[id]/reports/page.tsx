'use client';

import { use, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FileText, Loader2, Plus, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
};

// Diagnostic report section keys → human label, in canonical sort order.
// Mirrors backend DIAGNOSTIC_SECTIONS so we can show progress like
// "Working on: 上市要求对比, 建议承接方向" while the AI is running.
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
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', id],
    queryFn: () => api.reports.list(id),
    // Poll every 2s while a report is generating so the section progress
    // count climbs visibly as the AI works through each section.
    refetchInterval: (query) => {
      const data = query.state.data as ReportSummary[] | undefined;
      if (data?.some((r) => r.status === 'generating')) return 2000;
      return false;
    },
  });

  const sortedReports = [...(reports || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // The "currently generating" report — newest first if multiple are running.
  // Drives the full-screen overlay below. The overlay also stays open during
  // the brief window between clicking Generate and the new row appearing in
  // the polled list (handled via the local `generating` state).
  const activeGenerating = sortedReports.find((r) => r.status === 'generating') || null;
  const overlayOpen = generating || !!activeGenerating;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const diagnostics = await api.diagnostics.list();
      const diagnostic = diagnostics.find(
        (d: any) => d.company_id === id && (d.status === 'completed' || d.status === 'submitted' || d.sections_submitted?.length > 0)
      );

      if (!diagnostic) {
        toast.error('No scored diagnostic found. Please complete at least one section first.');
        return;
      }

      await api.diagnostics.generateReport(diagnostic.id);
      // Invalidate so the new "generating" report row appears immediately —
      // without this the list waits up to a refetch interval to show it.
      await queryClient.invalidateQueries({ queryKey: ['reports', id] });
      toast.success('Report generation started');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const GenerateButton = ({ size = 'default' }: { size?: 'default' | 'sm' | 'lg' }) => (
    <Button
      size={size}
      className="cursor-pointer gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
      onClick={handleGenerate}
      disabled={generating}
    >
      {generating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      {generating ? 'Generating...' : 'Generate Report'}
    </Button>
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
        sectionLabels={DIAGNOSTIC_SECTION_LABELS}
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
        {sortedReports.length > 0 && <GenerateButton />}
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
            <GenerateButton />
          </CardContent>
        </Card>
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
                {sortedReports.map((report) => {
                  const statusCfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.draft;
                  const isGenerating = report.status === 'generating';
                  const doneKeys = new Set(report.sections_done_keys || []);
                  const total = report.sections_total || DIAGNOSTIC_SECTION_LABELS.length;
                  const done = report.sections_done || 0;
                  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
                  // For diagnostic reports we know the canonical section names,
                  // so we can show "currently working on…". For other report
                  // types we just show the count.
                  const isDiagnostic = report.report_type === 'diagnostic';
                  const inProgress = isDiagnostic
                    ? DIAGNOSTIC_SECTION_LABELS.filter((s) => !doneKeys.has(s.key)).slice(0, 3)
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
                            {isDiagnostic && inProgress.length > 0 && (
                              <p className="mt-1.5 text-[11px] text-muted-foreground">
                                <span className="font-medium">Working on: </span>
                                {inProgress.map((s) => s.label).join('、')}
                                {DIAGNOSTIC_SECTION_LABELS.filter((s) => !doneKeys.has(s.key)).length > 3 && '…'}
                              </p>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
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
}: {
  open: boolean;
  report: ReportSummary | null;
  sectionLabels: { key: string; label: string }[];
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
        <h3 className="mb-1 text-center text-lg font-bold">
          Generating Diagnostic Report
        </h3>
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
