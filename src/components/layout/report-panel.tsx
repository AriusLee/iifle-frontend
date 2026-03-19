'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  FileText,
  Loader2,
  ChevronRight,
  Crown,
  Star,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCompanyStore } from '@/stores/company-store';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ReportSummary } from '@/types';

interface ReportPanelProps {
  companyId: string;
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  module_1: 'Gene Structure Report',
  module_2: 'Business Model Report',
  module_3: 'Valuation Report',
  module_4: 'Financing Report',
  module_5: 'Exit Mechanism Report',
  module_6: 'Listing Standards Report',
  master: 'Master Report',
};

const MODULE_SHORT_LABELS: Record<string, string> = {
  module_1: 'Gene Structure',
  module_2: 'Business Model',
  module_3: 'Valuation',
  module_4: 'Financing',
  module_5: 'Exit Mechanism',
  module_6: 'Listing Standards',
};

const TIER_ICONS: Record<string, typeof Star> = {
  essential: Zap,
  standard: Star,
  premium: Crown,
};

const TIER_LABELS: Record<string, string> = {
  essential: 'Essential',
  standard: 'Standard',
  premium: 'Premium',
};

const TIER_COLORS: Record<string, string> = {
  essential: 'text-slate-500',
  standard: 'text-blue-500',
  premium: 'text-amber-500',
};

const STATUS_CONFIG: Record<string, { color: string; label: string; animate?: boolean }> = {
  generating: { color: 'bg-blue-500', label: 'Generating', animate: true },
  draft: { color: 'bg-amber-500', label: 'Draft' },
  review: { color: 'bg-purple-500', label: 'In Review' },
  revision: { color: 'bg-orange-500', label: 'Revision' },
  approved: { color: 'bg-emerald-500', label: 'Approved' },
  published: { color: 'bg-emerald-600', label: 'Published' },
};

const TIER_FILTER_OPTIONS = [
  { id: null, label: 'All' },
  { id: 'essential', label: 'Essential', icon: Zap, color: 'text-slate-500' },
  { id: 'standard', label: 'Standard', icon: Star, color: 'text-blue-500' },
  { id: 'premium', label: 'Premium', icon: Crown, color: 'text-amber-500' },
] as const;

export function ReportPanel({ companyId }: ReportPanelProps) {
  const {
    closeReports,
    reportModuleFilter,
    reportTierFilter,
    setReportTierFilter,
  } = useCompanyStore();
  const router = useRouter();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', companyId],
    queryFn: () => api.reports.list(companyId),
    retry: false,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.some((r) => r.status === 'generating')) return 3000;
      return false;
    },
  });

  // Filter reports by module and tier
  const filteredReports = useMemo(() => {
    if (!reports) return [];
    return reports.filter((r) => {
      if (reportModuleFilter && r.report_type !== reportModuleFilter) return false;
      const tier = (r as any).tier || 'standard';
      if (reportTierFilter && tier !== reportTierFilter) return false;
      return true;
    });
  }, [reports, reportModuleFilter, reportTierFilter]);

  const handleReportClick = (report: ReportSummary) => {
    if (report.status === 'generating') return;
    router.push(`/companies/${companyId}/reports/${report.id}`);
  };

  const panelTitle = reportModuleFilter
    ? MODULE_SHORT_LABELS[reportModuleFilter] || 'Reports'
    : 'All Reports';

  return (
    <div className="flex h-full w-80 flex-col border-l bg-background xl:w-96">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold">{panelTitle}</h3>
          {filteredReports.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
              {filteredReports.length}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={closeReports}
          title="Close"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tier filter */}
      <div className="flex items-center gap-1 border-b px-3 py-2">
        {TIER_FILTER_OPTIONS.map((opt) => {
          const isActive = reportTierFilter === opt.id;
          const Icon = 'icon' in opt ? opt.icon : null;
          return (
            <button
              key={opt.label}
              onClick={() => setReportTierFilter(isActive ? null : opt.id)}
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors cursor-pointer',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {Icon && <Icon className={cn('h-3 w-3', !isActive && ('color' in opt ? opt.color : ''))} />}
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Report List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No Reports Yet</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {reportModuleFilter
                ? `No ${MODULE_SHORT_LABELS[reportModuleFilter] || ''} reports generated yet. Use the Generate Report button above.`
                : 'Generate your first report from any scored module page.'}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredReports.map((report) => {
              const statusCfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.draft;
              const isGenerating = report.status === 'generating';
              const tier = (report as any).tier || 'standard';
              const TierIcon = TIER_ICONS[tier] || Star;

              return (
                <button
                  key={report.id}
                  onClick={() => handleReportClick(report)}
                  disabled={isGenerating}
                  className={cn(
                    'w-full flex items-start gap-3 rounded-lg px-3 py-3 text-left',
                    'transition-colors group',
                    isGenerating
                      ? 'opacity-70 cursor-wait'
                      : 'hover:bg-muted/60 cursor-pointer'
                  )}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 text-primary" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {REPORT_TYPE_LABELS[report.report_type] || report.title}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn('flex items-center gap-1 text-xs', TIER_COLORS[tier])}>
                        <TierIcon className="h-3 w-3" />
                        {TIER_LABELS[tier]}
                      </span>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            statusCfg.color,
                            statusCfg.animate && 'animate-pulse'
                          )}
                        />
                        {statusCfg.label}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      {new Date(report.created_at).toLocaleDateString('en-MY', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {!isGenerating && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
