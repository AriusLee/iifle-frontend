'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  FileText,
  Loader2,
  CheckCircle2,
  Clock,
  Download,
  Zap,
  Star,
  Crown,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { getSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ReportDetail } from '@/types';

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  generating: { label: 'Generating', variant: 'secondary' },
  draft: { label: 'Draft', variant: 'outline' },
  review: { label: 'In Review', variant: 'secondary' },
  revision: { label: 'Revision', variant: 'destructive' },
  approved: { label: 'Approved', variant: 'default' },
  published: { label: 'Published', variant: 'default' },
};

const TIER_CONFIG: Record<string, { icon: typeof Star; label: string; color: string }> = {
  essential: { icon: Zap, label: 'Essential', color: 'text-slate-500' },
  standard: { icon: Star, label: 'Standard', color: 'text-blue-500' },
  premium: { icon: Crown, label: 'Premium', color: 'text-amber-500' },
};

export default function ReportViewPage({
  params,
}: {
  params: Promise<{ id: string; reportId: string }>;
}) {
  const { id, reportId } = use(params);
  const [isExporting, setIsExporting] = useState(false);
  // Language follows the global header toggle. The PDF export uses the same
  // locale so the download matches what the user sees on screen.
  const locale = useI18n((s) => s.locale);
  const showChinese = locale === 'zh';

  const handleExportPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const lang = showChinese ? 'cn' : 'en';
      const url = api.reports.exportPdfUrl(id, reportId, lang);
      const session = (await getSession()) as any;
      const token = session?.accessToken;

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) return;

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = res.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } finally {
      setIsExporting(false);
    }
  };

  const { data: report, isLoading } = useQuery({
    queryKey: ['report-detail', id, reportId],
    queryFn: () => api.reports.get(id, reportId),
    refetchInterval: (query) => {
      if (query.state.data?.status === 'generating') return 3000;
      return false;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Report not found</p>
        <Link href={`/companies/${id}/reports`}>
          <Button variant="outline" className="cursor-pointer mt-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to reports
          </Button>
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_MAP[report.status] || STATUS_MAP.draft;
  const tier = (report as any).tier || 'standard';
  const tierCfg = TIER_CONFIG[tier] || TIER_CONFIG.standard;
  const TierIcon = tierCfg.icon;

  if (report.status === 'generating') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/companies/${id}/reports`}>
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{report.title}</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Generating Report...</p>
            <p className="text-sm text-muted-foreground mt-1">
              AI is analyzing your data and writing the report. This typically takes 1-3 minutes.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Link href={`/companies/${id}/reports`}>
            <Button variant="ghost" size="icon" className="cursor-pointer mt-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{report.title}</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
              <span className={cn('flex items-center gap-1 text-xs font-medium', tierCfg.color)}>
                <TierIcon className="h-3.5 w-3.5" />
                {tierCfg.label}
              </span>
              <span className="text-xs text-muted-foreground">
                Version {report.version}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(report.created_at).toLocaleDateString('en-MY', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-2"
            onClick={() => handleExportPdf()}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {isExporting ? 'Exporting...' : `Export PDF · ${showChinese ? '中文' : 'EN'}`}
          </Button>
        </div>
      </div>

      {isExporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-[320px]">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-base font-medium">Generating PDF...</p>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Preparing your report for download. This may take a few seconds.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report sections */}
      <div className="space-y-6">
        {report.sections
          ?.sort((a, b) => a.sort_order - b.sort_order)
          .map((section) => {
            const content = showChinese
              ? section.content_cn || section.content_en
              : section.content_en;

            return (
              <Card key={section.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {section.section_title}
                    {section.is_ai_generated && (
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        AI Generated
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {content ? (
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2 first:mt-0">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-semibold mt-4 mb-2 first:mt-0">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-semibold mt-3 mb-1.5">{children}</h3>,
                        h4: ({ children }) => <h4 className="text-sm font-semibold mt-2 mb-1">{children}</h4>,
                        p: ({ children }) => <p className="text-sm leading-relaxed text-foreground/90 mb-3 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-sm leading-relaxed text-foreground/90">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        blockquote: ({ children }) => <blockquote className="border-l-3 border-emerald-300 pl-4 py-1 my-3 bg-emerald-50/50 rounded-r-lg">{children}</blockquote>,
                        hr: () => <hr className="my-4 border-border" />,
                        table: ({ children }) => <div className="overflow-x-auto mb-3"><table className="w-full text-sm border-collapse">{children}</table></div>,
                        thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
                        th: ({ children }) => <th className="border border-border px-3 py-2 text-left font-semibold text-xs">{children}</th>,
                        td: ({ children }) => <td className="border border-border px-3 py-2 text-sm">{children}</td>,
                      }}
                    >
                      {content}
                    </Markdown>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No content available for this section.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Footer */}
      <Separator />
      <div className="flex items-center justify-between pb-8">
        <p className="text-xs text-muted-foreground">
          Report generated by IIFLE AI Platform. This report is confidential and intended for authorized personnel only.
        </p>
        <Link href={`/companies/${id}/reports`}>
          <Button variant="outline" size="sm" className="cursor-pointer gap-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Reports
          </Button>
        </Link>
      </div>
    </div>
  );
}
