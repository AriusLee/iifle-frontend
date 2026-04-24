'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ArrowLeft, ArrowRight, Target, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  BATTLEMAP_SECTION_ORDER,
  getBattleMapSection,
  getBattleMapOptions,
} from '@/lib/battlemap-questionnaire-data';

export default function BattleMapSectionPage({
  params,
}: {
  params: Promise<{ id: string; section: string }>;
}) {
  const { id: companyId, section: sectionKey } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useT();
  const section = getBattleMapSection(sectionKey);

  const { data: battleMaps, isLoading } = useQuery<any[]>({
    queryKey: ['battlemaps'],
    queryFn: () => api.battlemaps.list(),
  });
  const battleMap = battleMaps?.find((bm: any) => bm.company_id === companyId);
  const existingAnswers: Record<string, string> = battleMap?.answers || {};
  const sectionsSubmitted: string[] = battleMap?.sections_submitted || [];
  const isSectionSubmitted = sectionsSubmitted.includes(sectionKey);
  const analysis = battleMap?.section_analyses?.[sectionKey];

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!section) return;
    const init: Record<string, string> = {};
    section.questions.forEach((q) => {
      const v = existingAnswers[q.id];
      if (typeof v === 'string') init[q.id] = v;
    });
    setAnswers(init);
    setEditing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleMap?.id, sectionKey]);

  const sectionIndex = BATTLEMAP_SECTION_ORDER.indexOf(sectionKey);
  const prevKey = sectionIndex > 0 ? BATTLEMAP_SECTION_ORDER[sectionIndex - 1] : null;
  const nextKey = sectionIndex < BATTLEMAP_SECTION_ORDER.length - 1
    ? BATTLEMAP_SECTION_ORDER[sectionIndex + 1]
    : null;
  const canSubmitSection = !prevKey || sectionsSubmitted.includes(prevKey);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!battleMap) throw new Error('BattleMap not created yet');
      const merged = { ...existingAnswers, ...answers };
      await api.battlemaps.saveDraft(battleMap.id, { answers: merged });
    },
    onSuccess: () => {
      toast.success(t('已保存', 'Saved'));
      queryClient.invalidateQueries({ queryKey: ['battlemaps'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const submitSectionMutation = useMutation({
    mutationFn: async () => {
      if (!battleMap) throw new Error('BattleMap not created yet');
      const merged = { ...existingAnswers, ...answers };
      return api.battlemaps.submitSection(battleMap.id, sectionKey, { answers: merged });
    },
    onSuccess: () => {
      toast.success(t('分析完成', 'Analysis complete'));
      queryClient.invalidateQueries({ queryKey: ['battlemaps'] });
      setEditing(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!section) {
    return <div className="p-8 text-center text-muted-foreground">{t('未找到此分区', 'Section not found')}</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!battleMap) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm mb-3">
              {t('请先在作战图概览页开启作战图。', 'Please open the battle map from the overview page first.')}
            </p>
            <Button
              size="sm"
              className="cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
              onClick={() => router.push(`/companies/${companyId}/battlemap`)}
            >
              {t('前往概览', 'Go to overview')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sectionAnsweredCount = section.questions.filter((q) => answers[q.id]).length;
  const sectionAllAnswered = sectionAnsweredCount === section.questions.length;
  const showQuestions = !isSectionSubmitted || editing;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-600" />
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700">
            {sectionKey.toUpperCase()}
          </span>
          <h1 className="text-xl font-bold">{t(section.title_zh, section.title_en)}</h1>
          {isSectionSubmitted && (
            <Badge className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5">
              <CheckCircle2 className="h-3 w-3 mr-1 inline" />
              {t('已提交', 'Submitted')}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {t('战略作战图', 'Battle Map')} ({sectionIndex + 1}/{BATTLEMAP_SECTION_ORDER.length})
        </p>
      </div>

      {/* AI analysis card — shown once section is submitted */}
      {isSectionSubmitted && analysis && (analysis.analysis_zh || analysis.analysis_en) && (
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                <Sparkles className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold">{t('AI 顾问分析', 'AI Consultant Analysis')}</p>
                <p className="text-[11px] text-muted-foreground">
                  {t(section.title_zh, section.title_en)} · {t('基于客户回答与 Phase 1 阶段定位', 'Based on customer answers + Phase 1 stage')}
                </p>
              </div>
            </div>
            <StructuredAnalysis text={t(analysis.analysis_zh || '', analysis.analysis_en || '')} />
          </CardContent>
        </Card>
      )}

      {/* Customer answers — read-only list so the advisor can read the raw
          responses alongside the AI analysis without flipping the form into
          edit mode. Hidden while editing (the form above shows the state). */}
      {isSectionSubmitted && !editing && (
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {t('客户回答', 'Customer Answers')}
                </p>
                <p className="text-sm font-semibold">
                  {section.questions.length} {t('题', 'questions')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="cursor-pointer text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                {t('编辑回答 →', 'Edit answers →')}
              </button>
            </div>
            <div className="divide-y">
              {section.questions.map((q, idx) => {
                const raw = existingAnswers[q.id] || '';
                let display: string;
                if (q.kind === 'open') {
                  display = raw || t('— 未填写', '— not answered');
                } else {
                  // Resolve option value (stored as zh) to its localized label.
                  const opt = getBattleMapOptions(q).find((o) => o.zh === raw);
                  display = opt
                    ? t(opt.zh, opt.en)
                    : raw
                      ? String(raw)
                      : t('— 未填写', '— not answered');
                }
                return (
                  <div key={q.id} className="py-3 first:pt-1 last:pb-1">
                    <div className="flex items-start gap-2 mb-1.5">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-medium leading-snug text-muted-foreground">
                        {t(q.zh, q.en)}
                      </p>
                    </div>
                    <div
                      className={
                        q.kind === 'open'
                          ? 'ml-7 text-sm leading-relaxed text-foreground whitespace-pre-wrap bg-slate-50 border border-slate-200 rounded-md px-3 py-2'
                          : 'ml-7 text-sm font-medium text-foreground'
                      }
                    >
                      {display}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions (hidden when submitted unless editing) */}
      {showQuestions ? (
        <Card>
          <CardContent className="pt-4 divide-y">
            {section.questions.map((q, idx) => {
              const currentVal = answers[q.id] || '';

              if (q.kind === 'open') {
                return (
                  <div key={q.id} className="py-3 first:pt-1">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-600 shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-sm font-medium leading-snug">{t(q.zh, q.en)}</p>
                    </div>
                    <div className="ml-7">
                      <Textarea
                        value={currentVal}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder={t(q.placeholder_zh || '', q.placeholder_en || '')}
                        className="min-h-[72px] text-sm"
                      />
                    </div>
                  </div>
                );
              }

              const opts = getBattleMapOptions(q);
              return (
                <div key={q.id} className="py-3 first:pt-1">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-600 shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-medium leading-snug">{t(q.zh, q.en)}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 ml-7">
                    {opts.map((opt) => (
                      <button
                        key={opt.zh}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.zh }))}
                        className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                          currentVal === opt.zh
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {t(opt.zh, opt.en)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : (
        /* Submitted view — collapsed controls */
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => prevKey
              ? router.push(`/companies/${companyId}/battlemap/${prevKey}`)
              : router.push(`/companies/${companyId}/battlemap`)}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            {prevKey ? t('上一分区', 'Previous') : t('概览', 'Overview')}
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => setEditing(true)}
            >
              {t('重新作答', 'Re-answer')}
            </Button>
            {nextKey && (
              <Button
                size="sm"
                className="cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
                onClick={() => router.push(`/companies/${companyId}/battlemap/${nextKey}`)}
              >
                {t('下一分区', 'Next')} <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Footer — while answering/editing */}
      {showQuestions && (
        <div className="sticky bottom-0 flex items-center justify-between gap-3 bg-white/95 backdrop-blur-sm py-3 border-t">
          <div className="flex items-center gap-2">
            {prevKey ? (
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => router.push(`/companies/${companyId}/battlemap/${prevKey}`)}
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                {t('上一分区', 'Previous')}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => router.push(`/companies/${companyId}/battlemap`)}
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                {t('概览', 'Overview')}
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              {sectionAnsweredCount}/{section.questions.length} {t('已答', 'answered')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {editing && (
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => setEditing(false)}
              >
                {t('取消', 'Cancel')}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? t('保存中...', 'Saving...') : t('保存草稿', 'Save draft')}
            </Button>
            {sectionAllAnswered && canSubmitSection && (
              <Button
                size="sm"
                className="cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
                disabled={submitSectionMutation.isPending}
                onClick={() => submitSectionMutation.mutate()}
              >
                {submitSectionMutation.isPending
                  ? t('分析中...', 'Analyzing...')
                  : isSectionSubmitted
                    ? t('重新分析', 'Re-analyze')
                    : t('提交并分析', 'Submit & analyze')}
              </Button>
            )}
            {!canSubmitSection && !isSectionSubmitted && (
              <span className="text-xs text-muted-foreground">
                {t(`请先完成 ${prevKey?.toUpperCase()} 分区`, `Complete ${prevKey?.toUpperCase()} first`)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Renders structured [ZH]/[EN] analysis with 【...】/[...] section headers. */
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
    return <p className="text-sm text-foreground whitespace-pre-wrap">{text}</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {chunks.map((c, i) => (
        <div key={i}>
          {c.header && (
            <p className="text-xs font-bold text-emerald-700 mb-1">
              {c.header.replace(/[【】\[\]]/g, '')}
            </p>
          )}
          <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{c.body}</div>
        </div>
      ))}
    </div>
  );
}
