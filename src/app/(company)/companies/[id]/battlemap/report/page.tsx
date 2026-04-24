'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft, Languages, Target, AlertTriangle } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const VARIANT_COLOR: Record<string, string> = {
  replication: 'bg-amber-100 text-amber-800 border-amber-200',
  financing: 'bg-blue-100 text-blue-800 border-blue-200',
  capitalization: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export default function BattleMapReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: companyId } = use(params);
  const router = useRouter();
  const { t } = useT();
  const [showEnglish, setShowEnglish] = useState(false);

  const { data: battleMaps } = useQuery<any[]>({
    queryKey: ['battlemaps'],
    queryFn: () => api.battlemaps.list(),
  });
  const battleMap = battleMaps?.find((bm: any) => bm.company_id === companyId);

  const { data: report, isLoading, error } = useQuery<any>({
    queryKey: ['battlemap-report', battleMap?.id],
    queryFn: () => api.battlemaps.getReport(battleMap!.id),
    enabled: !!battleMap?.report_id,
    refetchInterval: (q) => {
      const sections = q.state.data?.sections || [];
      return sections.length < 10 ? 3000 : false;
    },
  });

  if (!battleMap) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!battleMap.report_id) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold mb-1">{t('尚未生成报告', 'Report not generated yet')}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer mt-3"
                  onClick={() => router.push(`/companies/${companyId}/battlemap`)}
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  {t('返回概览', 'Back to overview')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !report) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-sm text-muted-foreground">
          {t('AI 正在生成 10 章报告...', 'AI is generating the 10-chapter report...')}
        </p>
      </div>
    );
  }

  const sections = (report.sections || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
  const totalSections = 10;
  const stillGenerating = sections.length < totalSections;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => router.push(`/companies/${companyId}/battlemap`)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('概览', 'Overview')}
          </Button>
          <Target className="h-5 w-5 text-emerald-600" />
          <h1 className="text-xl font-bold">{report.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {battleMap.variant && (
            <Badge className={VARIANT_COLOR[battleMap.variant]}>
              {t(battleMap.variant_name_zh, battleMap.variant_name_en)}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => setShowEnglish((v) => !v)}
          >
            <Languages className="h-3.5 w-3.5 mr-1" />
            {showEnglish ? t('切换中文', 'Show Chinese') : t('Show English', 'Show English')}
          </Button>
        </div>
      </div>

      {/* Stage pill */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{t('阶段', 'Stage')}:</span>
        <Badge variant="outline">{battleMap.current_stage}</Badge>
        <span className="text-muted-foreground">→</span>
        <Badge className="bg-emerald-100 text-emerald-700">{battleMap.target_stage}</Badge>
      </div>

      {/* Generating banner */}
      {stillGenerating && (
        <Card className="border-blue-200 bg-blue-50/40">
          <CardContent className="pt-4 pb-4 flex items-center gap-2 text-sm text-blue-800">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t(`AI 正在生成报告（${sections.length}/10）...`, `AI generating (${sections.length}/10)...`)}
          </CardContent>
        </Card>
      )}

      {/* Sections */}
      {sections.map((s: any) => {
        const content = showEnglish ? (s.content_en || s.content_cn) : (s.content_cn || s.content_en);
        return (
          <Card key={s.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500 text-xs font-bold text-white">
                  {s.sort_order}
                </span>
                {s.section_title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <article className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground prose-strong:text-emerald-700">
                <Markdown remarkPlugins={[remarkGfm]}>{content || ''}</Markdown>
              </article>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
