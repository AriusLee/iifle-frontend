'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Download } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DiagnosticReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  // First fetch the diagnostic to get company_id and report_id
  const { data: diag, isLoading: diagLoading } = useQuery<any>({
    queryKey: ['diagnostic', params.id],
    queryFn: () => api.diagnostics.get(params.id),
    enabled: !!params.id,
  });

  // Then fetch the report via diagnostic endpoint (no company-role check)
  const { data: report, isLoading: reportLoading, error } = useQuery<any>({
    queryKey: ['diagnostic-report', params.id],
    queryFn: () => api.diagnostics.getReport(params.id),
    enabled: !!diag?.report_id,
  });

  const isLoading = diagLoading || reportLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-4">
        <button
          className="flex cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => router.push(`/diagnostics/${params.id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          返回诊断 Back to Diagnostic
        </button>
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">
            {!diag?.report_id
              ? '尚未生成报告 No report generated yet.'
              : '加载报告失败 Failed to load report.'}
          </p>
        </div>
      </div>
    );
  }

  const sections = report.sections
    ? [...report.sections].sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <button
          className="flex cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => router.push(`/diagnostics/${params.id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          返回诊断 Back to Diagnostic
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{report.title}</h1>
            <p className="text-sm text-muted-foreground">
              {diag?.company_name} · {report.language === 'bilingual' ? '中英双语' : report.language === 'cn' ? '中文' : 'English'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={
              report.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
              report.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }>
              {report.status}
            </Badge>
            <Button variant="outline" size="sm" className="cursor-pointer gap-1.5" disabled>
              <Download className="h-4 w-4" />
              导出 PDF (Coming Soon)
            </Button>
          </div>
        </div>
      </div>

      {/* Report Sections */}
      {sections.map((section: any) => (
        <Card key={section.id || section.section_key}>
          <CardHeader className="border-b">
            <CardTitle className="text-lg">{section.section_title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            {section.content_cn && (
              <div className="prose prose-sm max-w-none prose-headings:text-base">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {section.content_cn}
                </div>
              </div>
            )}
            {section.content_en && (
              <div className="border-t pt-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">English</p>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {section.content_en}
                </div>
              </div>
            )}
            {!section.content_cn && !section.content_en && (
              <p className="text-sm text-muted-foreground italic">内容生成中... Content pending.</p>
            )}
          </CardContent>
        </Card>
      ))}

      {sections.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">报告内容为空 Report has no sections.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
