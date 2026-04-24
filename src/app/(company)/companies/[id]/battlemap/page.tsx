'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle2, ArrowRight, Target, FileText, AlertTriangle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BATTLEMAP_SECTIONS,
  BATTLEMAP_SECTION_ORDER,
  BATTLEMAP_VARIANTS,
} from '@/lib/battlemap-questionnaire-data';

const VARIANT_COLOR: Record<string, string> = {
  replication: 'bg-amber-100 text-amber-800 border-amber-200',
  financing: 'bg-blue-100 text-blue-800 border-blue-200',
  capitalization: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export default function BattleMapOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: companyId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useT();

  const { data: diagnostics } = useQuery<any[]>({
    queryKey: ['diagnostics'],
    queryFn: () => api.diagnostics.list(),
  });
  const diagnostic = diagnostics?.find((d: any) => d.company_id === companyId);
  const diagnosticReady = !!(diagnostic?.module_scores && Object.keys(diagnostic.module_scores).some((k) => k !== '_meta'));

  const { data: battleMaps, isLoading: loadingBM } = useQuery<any[]>({
    queryKey: ['battlemaps'],
    queryFn: () => api.battlemaps.list(),
    enabled: diagnosticReady,
  });
  const battleMap = battleMaps?.find((bm: any) => bm.company_id === companyId);

  const createMutation = useMutation({
    mutationFn: () => api.battlemaps.createForDiagnostic(diagnostic!.id),
    onSuccess: (bm) => {
      queryClient.invalidateQueries({ queryKey: ['battlemaps'] });
      router.push(`/companies/${companyId}/battlemap/a`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const submitMutation = useMutation({
    mutationFn: () => api.battlemaps.submit(battleMap.id),
    onSuccess: () => {
      toast.success(t('分类完成', 'Classification complete'));
      queryClient.invalidateQueries({ queryKey: ['battlemaps'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Not-yet-eligible state
  if (!diagnosticReady) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-600" />
          <h1 className="text-xl font-bold">{t('战略作战图', 'Strategic Battle Map')}</h1>
        </div>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold mb-1">{t('需先完成 Phase 1 诊断', 'Complete Phase 1 diagnostic first')}</p>
                <p className="text-sm text-muted-foreground">
                  {t(
                    '战略作战图基于 Phase 1 的六大结构评分生成。请先完成诊断问卷。',
                    'The battle map is built on top of Phase 1 six-structure scores. Please complete the diagnostic questionnaire first.',
                  )}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer mt-3"
                  onClick={() => router.push(`/companies/${companyId}/questionnaire/a`)}
                >
                  {t('前往诊断问卷', 'Go to diagnostic')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingBM) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No battle map yet — intro + CTA
  if (!battleMap) {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-600" />
          <h1 className="text-xl font-bold">{t('战略作战图', 'Strategic Battle Map')}</h1>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm leading-relaxed">
              {t(
                'Phase 1 告诉你"你在哪里、卡在哪里"；作战图告诉你"下一阶段怎么打、用什么顺序打、90 天开始做什么"。',
                'Phase 1 shows where you are and what\'s stuck. The battle map tells you how to level up next, in what order, and what to start in 90 days.',
              )}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {Object.values(BATTLEMAP_VARIANTS).map((v) => (
                <div key={v.key} className={`rounded-lg border p-3 ${VARIANT_COLOR[v.key]}`}>
                  <p className="text-xs font-bold">{t(v.name_zh, v.name_en)}</p>
                  <p className="text-[11px] mt-1 leading-snug opacity-90">{t(v.subtitle_zh, v.subtitle_en)}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t(
                '回答 35 题（约 15 分钟），AI 会从三类作战图中匹配最合适的一份。',
                '35 questions (~15 min). AI picks one of three battle maps that fits you best.',
              )}
            </p>
            <Button
              size="sm"
              className="cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
              disabled={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? t('创建中...', 'Creating...') : t('开始作战图问卷', 'Start battle map questionnaire')}
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Battle map exists — show status + next action
  const answers = battleMap.answers || {};
  const questionsAnswered = Object.keys(answers).filter((k) => answers[k] && answers[k] !== '').length;
  const totalQuestions = BATTLEMAP_SECTIONS.reduce((n, s) => n + s.questions.length, 0);
  const sectionsSubmitted: string[] = battleMap.sections_submitted || [];
  const allSectionsSubmitted = BATTLEMAP_SECTIONS.every((s) => sectionsSubmitted.includes(s.key));
  const sectionAnalyses: Record<string, { analysis_zh?: string; analysis_en?: string }> =
    battleMap.section_analyses || {};
  const analysesPresent = BATTLEMAP_SECTIONS.filter((s) => {
    const a = sectionAnalyses[s.key];
    return a && (a.analysis_zh || a.analysis_en);
  });
  const hasVariant = !!battleMap.variant;
  const hasReport = !!battleMap.report_id;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-600" />
          <h1 className="text-xl font-bold">{t('战略作战图', 'Strategic Battle Map')}</h1>
        </div>
        {hasVariant && (
          <Badge className={VARIANT_COLOR[battleMap.variant]}>
            {t(battleMap.variant_name_zh, battleMap.variant_name_en)}
          </Badge>
        )}
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">{t('分区提交进度', 'Section submission progress')}</p>
            <p className="text-xs text-muted-foreground">
              {sectionsSubmitted.length}/{BATTLEMAP_SECTIONS.length} {t('分区', 'sections')} · {questionsAnswered}/{totalQuestions} {t('题', 'questions')}
            </p>
          </div>
          <div className="h-2 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${(sectionsSubmitted.length / BATTLEMAP_SECTIONS.length) * 100}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {BATTLEMAP_SECTIONS.map((s) => {
              const answered = s.questions.filter((q) => answers[q.id]).length;
              const submitted = sectionsSubmitted.includes(s.key);
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => router.push(`/companies/${companyId}/battlemap/${s.key}`)}
                  className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                    submitted
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                      : answered === s.questions.length
                        ? 'border-amber-300 bg-amber-50 text-amber-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {submitted && <CheckCircle2 className="inline h-3 w-3 mr-1" />}
                  {s.key.toUpperCase()} · {t(s.title_zh, s.title_en)} ({answered}/{s.questions.length})
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action card */}
      <Card>
        <CardContent className="pt-5 pb-4 space-y-3">
          {!allSectionsSubmitted && (
            <>
              <p className="text-sm text-muted-foreground">
                {t(
                  '逐分区提交问卷。每提交一个分区，AI 会立刻生成该分区的分析；全部 8 个分区提交后，作战图自动分类。',
                  'Submit section-by-section. Each submit triggers an AI analysis; when all 8 sections are in, the battle map auto-classifies.',
                )}
              </p>
              <Button
                size="sm"
                className="cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
                onClick={() => {
                  const firstPending = BATTLEMAP_SECTIONS.find((s) => !sectionsSubmitted.includes(s.key));
                  router.push(`/companies/${companyId}/battlemap/${firstPending?.key || BATTLEMAP_SECTION_ORDER[0]}`);
                }}
              >
                {sectionsSubmitted.length === 0
                  ? t('开始第一分区', 'Start section A')
                  : t('继续下一分区', 'Continue next section')}
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </>
          )}

          {allSectionsSubmitted && !hasVariant && (
            <>
              <p className="text-sm text-muted-foreground">
                {t(
                  '全部分区已提交，但分类尚未生成。点击下方手动重新分类。',
                  'All sections submitted but classification missing. Click below to re-run classification.',
                )}
              </p>
              <Button
                size="sm"
                className="cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
                disabled={submitMutation.isPending}
                onClick={() => submitMutation.mutate()}
              >
                {submitMutation.isPending ? t('分类中...', 'Classifying...') : t('重新分类', 'Re-classify')}
              </Button>
            </>
          )}

          {hasVariant && (
            <>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                <p className="text-xs font-semibold mb-1">
                  {t('匹配作战图', 'Matched variant')}: {t(battleMap.variant_name_zh, battleMap.variant_name_en)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(battleMap.current_stage, battleMap.current_stage)} → {t(battleMap.target_stage, battleMap.target_stage)}
                </p>
              </div>
              {battleMap.top_priorities && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('三大升级重点', 'Top 3 priorities')}</p>
                  {battleMap.top_priorities.map((p: any) => (
                    <div key={p.rank} className="text-xs border rounded-md px-3 py-1.5">
                      <span className="font-bold text-emerald-700">{p.rank}.</span>{' '}
                      <span className="font-medium">{t(p.title_zh, p.title_en)}</span>
                      <span className="text-muted-foreground"> — {t(p.action_zh, p.action_en)}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Report generation lives in the Reports page — it handles all
                  report types (diagnostic, battle map, future phases) in one
                  place. No duplicate generate button here. */}
              <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3 flex items-start gap-2.5">
                <FileText className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-blue-900 mb-0.5">
                    {hasReport
                      ? t('作战图报告已生成', 'Battle map report is ready')
                      : t('在"报告"页生成 10 章作战图报告', 'Generate the 10-chapter battle map report from the Reports page')}
                  </p>
                  <p className="text-[11px] text-blue-800/80 mb-2">
                    {t(
                      '所有报告（诊断、作战图、未来阶段）在 Reports 页面统一管理。',
                      'All reports (diagnostic, battle map, future phases) live together in the Reports page.',
                    )}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer h-8 text-xs"
                    onClick={() => router.push(`/companies/${companyId}/reports`)}
                  >
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    {t('前往报告页', 'Open Reports')}
                  </Button>
                </div>
              </div>
            </>
          )}

          {battleMap.error_message && (
            <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
              <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />
              {battleMap.error_message}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-section AI analyses — visible as soon as at least one section is submitted */}
      {analysesPresent.length > 0 && (
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-semibold">{t('分区 AI 分析', 'Section AI Analyses')}</p>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {analysesPresent.length}/{BATTLEMAP_SECTIONS.length}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {analysesPresent.map((s) => {
                const a = sectionAnalyses[s.key];
                return (
                  <div key={s.key} className="rounded-lg border bg-emerald-50/40 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-emerald-500 text-[10px] font-bold text-white">
                          {s.key.toUpperCase()}
                        </span>
                        <p className="text-xs font-semibold">{t(s.title_zh, s.title_en)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push(`/companies/${companyId}/battlemap/${s.key}`)}
                        className="cursor-pointer text-[11px] text-emerald-700 hover:underline"
                      >
                        {t('查看详情 →', 'Open section →')}
                      </button>
                    </div>
                    <StructuredAnalysis text={t(a?.analysis_zh || '', a?.analysis_en || '')} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/** Mirrors the [ZH]/[EN] structured renderer in the section page. */
function StructuredAnalysis({ text }: { text: string }) {
  if (!text) return null;
  const re = /^(【[^】]+】|\[[^\]]+\])/gm;
  const parts = text.split(re);
  const chunks: { header: string; body: string }[] = [];
  const leading = parts.shift() || '';
  if (leading.trim()) chunks.push({ header: '', body: leading.trim() });
  for (let i = 0; i < parts.length; i += 2) {
    const header = (parts[i] || '').trim();
    const body = (parts[i + 1] || '').trim();
    if (header || body) chunks.push({ header, body });
  }
  if (!chunks.length) {
    return <p className="text-xs text-foreground whitespace-pre-wrap">{text}</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {chunks.map((c, i) => (
        <div key={i}>
          {c.header && (
            <p className="text-[11px] font-bold text-emerald-700 mb-0.5">
              {c.header.replace(/[【】\[\]]/g, '')}
            </p>
          )}
          <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{c.body}</div>
        </div>
      ))}
    </div>
  );
}
