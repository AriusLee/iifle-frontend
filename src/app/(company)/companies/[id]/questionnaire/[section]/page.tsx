'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { SECTIONS, translateAnswer } from '@/lib/questionnaire-data';
import { useT } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function QuestionnaireSectionPage({
  params,
}: {
  params: Promise<{ id: string; section: string }>;
}) {
  const { id: companyId, section: sectionKey } = use(params);
  const queryClient = useQueryClient();
  const { t } = useT();
  const sectionData = SECTIONS[sectionKey];

  const { data: diagnostics, isLoading: loadingDiag } = useQuery<any[]>({
    queryKey: ['diagnostics'],
    queryFn: () => api.diagnostics.list(),
  });

  const diagnostic = useMemo(() => {
    if (!diagnostics) return null;
    return diagnostics.find((d: any) => d.company_id === companyId) || null;
  }, [diagnostics, companyId]);

  const existingAnswers: Record<string, string | string[]> = diagnostic?.answers || {};
  const hasAnswers = sectionData?.questions.some((q) => existingAnswers[q.id]);
  const isCompleted = diagnostic?.status === 'completed';
  const moduleScores = diagnostic?.module_scores || {};

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [otherAnswers, setOtherAnswers] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);

  const diagnosticId = diagnostic?.id;
  useEffect(() => {
    if (!diagnostic?.answers || !sectionData) return;
    const init: Record<string, string> = {};
    sectionData.questions.forEach((q) => {
      const val = diagnostic.answers[q.id];
      if (typeof val === 'string') init[q.id] = val;
    });
    setAnswers(init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagnosticId, sectionKey]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const allAnswers = { ...existingAnswers, ...answers };
      const allOther = { ...(diagnostic?.other_answers || {}), ...otherAnswers };
      if (diagnostic) {
        await api.diagnostics.saveDraft(diagnostic.id, { answers: allAnswers, other_answers: allOther });
      } else {
        const company = await api.companies.get(companyId);
        await api.diagnostics.create({ company: { legal_name: company.legal_name, country: company.country }, answers: allAnswers, other_answers: allOther });
      }
    },
    onSuccess: () => { toast.success(t('已保存', 'Saved')); queryClient.invalidateQueries({ queryKey: ['diagnostics'] }); setEditing(false); },
    onError: (err: Error) => { toast.error(err.message); },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!diagnostic) throw new Error('No diagnostic');
      await api.diagnostics.saveDraft(diagnostic.id, { answers: { ...existingAnswers, ...answers }, other_answers: { ...(diagnostic?.other_answers || {}), ...otherAnswers } });
      return api.diagnostics.submit(diagnostic.id);
    },
    onSuccess: () => { toast.success(t('已提交并完成评分', 'Submitted & scored')); queryClient.invalidateQueries({ queryKey: ['diagnostics'] }); },
    onError: (err: Error) => { toast.error(err.message); },
  });

  if (!sectionData) return <div className="p-8 text-center text-muted-foreground">{t('未找到此分区', 'Section not found')}</div>;
  if (loadingDiag) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  const sectionModuleMap: Record<string, string> = { a: '', b: '1', c: '2', d: '3', e: '4', f: '5' };
  const moduleKey = sectionModuleMap[sectionKey];
  const moduleScore = moduleKey ? moduleScores[moduleKey] : null;
  const showForm = !hasAnswers || editing;
  const sectionAnsweredCount = sectionData.questions.filter((q) => answers[q.id] || existingAnswers[q.id]).length;
  const totalAnswered = Object.keys(existingAnswers).filter((k) => { const v = existingAnswers[k]; return Array.isArray(v) ? v.length > 0 : !!v; }).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700">
            {sectionKey.toUpperCase()}
          </span>
          <div>
            <h1 className="text-xl font-bold">{t(sectionData.title_zh, sectionData.title_en)}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasAnswers && !editing && (
            <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => setEditing(true)}>{t('编辑', 'Edit')}</Button>
          )}
          {moduleScore && (
            <Badge className="bg-emerald-100 text-emerald-700 text-sm px-3 py-1">
              {moduleScore.score}{t('分', 'pts')} — {moduleScore.rating}
            </Badge>
          )}
        </div>
      </div>

      {/* AI Analysis — TOP */}
      {isCompleted && moduleScore && (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-semibold">{t('AI 分析', 'AI Analysis')} — {t(moduleScore.name_zh, moduleScore.name_en)}</span>
            </div>
            <div className="flex items-center gap-6 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: moduleScore.score >= 60 ? '#10B981' : moduleScore.score >= 40 ? '#F59E0B' : '#EF4444' }}>
                  {moduleScore.score}
                </p>
                <p className="text-[10px] text-muted-foreground">{t('得分', 'Score')}</p>
              </div>
              <Badge className={
                moduleScore.rating === 'Strong' ? 'bg-emerald-100 text-emerald-700' :
                moduleScore.rating === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                moduleScore.rating === 'Developing' ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }>
                {moduleScore.rating}
              </Badge>
              {moduleScore.questions && (
                <div className="flex-1 space-y-1">
                  {Object.entries(moduleScore.questions).map(([qid, qdata]: [string, any]) => (
                    <div key={qid} className="flex items-center gap-2 text-xs">
                      <span className="w-7 text-muted-foreground shrink-0">{qid}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-gray-200">
                        <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${qdata.score}%` }} />
                      </div>
                      <span className="w-6 text-right font-medium">{qdata.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {diagnostic?.key_findings?.filter((f: any) => f.module === parseInt(moduleKey))?.map((f: any, i: number) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-white p-2.5 border mb-1.5 last:mb-0">
                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${f.severity === 'high' ? 'bg-red-500' : f.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <div>
                  <p className="text-xs font-medium">{t(f.title_zh, f.title_en)}</p>
                  <p className="text-[11px] text-muted-foreground">{t(f.description_zh, f.description_en)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Section A: enterprise stage */}
      {sectionKey === 'a' && isCompleted && diagnostic?.enterprise_stage && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold">{t('AI 阶段判定', 'Enterprise Stage')}</span>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-blue-100 text-blue-700 text-base px-3 py-1.5">{diagnostic.enterprise_stage}</Badge>
              <div>
                <p className="text-sm font-medium">{t('总分', 'Score')}: {diagnostic.overall_score}/100</p>
                <p className="text-xs text-muted-foreground">{diagnostic.overall_rating}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <Card>
        <CardContent className="pt-4 divide-y">
          {sectionData.questions.map((q, idx) => {
            const existingVal = existingAnswers[q.id];
            const currentVal = answers[q.id] || '';

            return (
              <div key={q.id} className="py-3 first:pt-1">
                <div className="flex items-start gap-2 mb-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-medium leading-snug">{t(q.zh, q.en)}</p>
                </div>

                {showForm ? (
                  <div className="flex flex-wrap gap-1.5 ml-7">
                    {q.options.map((opt) => (
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
                    <button
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: '__other__' }))}
                      className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                        currentVal === '__other__'
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {t('其他', 'Other')}
                    </button>
                    {currentVal === '__other__' && (
                      <Input
                        placeholder={t('请填写...', 'Please specify...')}
                        value={otherAnswers[q.id] || ''}
                        onChange={(e) => setOtherAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                        className="mt-1 h-7 text-xs w-full max-w-xs"
                      />
                    )}
                  </div>
                ) : (
                  <div className="ml-7 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-0.5">
                      {typeof existingVal === 'string'
                        ? t(existingVal, translateAnswer(q.id, existingVal))
                        : Array.isArray(existingVal)
                        ? existingVal.map((v) => t(v, translateAnswer(q.id, v))).join(', ')
                        : '--'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Actions */}
      {showForm && (
        <div className="sticky bottom-0 flex items-center justify-between gap-3 bg-white/95 backdrop-blur-sm py-3 border-t">
          <p className="text-xs text-muted-foreground">{sectionAnsweredCount}/{sectionData.questions.length} {t('已答', 'answered')}</p>
          <div className="flex items-center gap-2">
            {editing && (
              <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => setEditing(false)}>{t('取消', 'Cancel')}</Button>
            )}
            <Button variant="outline" size="sm" className="cursor-pointer" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
              {saveMutation.isPending ? t('保存中...', 'Saving...') : t('保存草稿', 'Save Draft')}
            </Button>
            {diagnostic && totalAnswered >= 26 && (
              <Button size="sm" className="cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600" disabled={submitMutation.isPending} onClick={() => submitMutation.mutate()}>
                {submitMutation.isPending ? t('提交中...', 'Submitting...') : `${t('提交诊断', 'Submit')} (${totalAnswered}/27)`}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
