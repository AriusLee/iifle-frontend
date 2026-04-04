'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { SECTIONS, translateAnswer } from '@/lib/questionnaire-data';
import { useT } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const SECTION_ORDER = ['a', 'b', 'c', 'd', 'e', 'f'];

const RATING_LABEL: Record<string, { zh: string; en: string }> = {
  Strong: { zh: '优秀', en: 'Strong' },
  Medium: { zh: '中等', en: 'Medium' },
  Developing: { zh: '发展中', en: 'Developing' },
  Weak: { zh: '薄弱', en: 'Weak' },
};

const STAGE_INFO: Record<string, { color: string; zh: string; en: string }> = {
  '概念萌芽期': { color: 'bg-red-100 text-red-700', zh: '企业尚处于概念阶段，尚未形成稳定的商业模式和收入来源。建议先验证核心假设。', en: 'At concept stage without a stable business model. Focus on validating core assumptions.' },
  '初创探索期': { color: 'bg-orange-100 text-orange-700', zh: '企业已经起步但仍在探索阶段。商业模式初步成型，需要重点关注市场验证和团队建设。', en: 'Started but still exploring. Business model forming — focus on market validation and team building.' },
  '模式验证期': { color: 'bg-yellow-100 text-yellow-700', zh: '企业已有一定经营基础，正在验证商业模式的可复制性。这是向规模化过渡的关键阶段。', en: 'Operational foundation exists, validating replicability. Critical transition stage toward scaling.' },
  '规模扩张期': { color: 'bg-emerald-100 text-emerald-700', zh: '企业已验证商业模式，正在进入规模化扩张阶段。建议关注组织能力建设和资本化路径。', en: 'Business model validated, scaling underway. Focus on organizational capability and capital pathway.' },
  '资本进阶期': { color: 'bg-blue-100 text-blue-700', zh: '企业已具备资本化条件，可以认真考虑融资、并购或上市路径。', en: 'Capital-ready. Consider fundraising, M&A, or IPO pathways.' },
};

const RATING_INFO: Record<string, { zh: string; en: string }> = {
  Strong: { zh: '该模块表现优秀，已具备较强的结构基础，可作为企业核心竞争力进一步强化。', en: 'Performing well with a strong structural foundation that can be further strengthened.' },
  Medium: { zh: '该模块处于中等水平，有一定基础但仍有提升空间。建议针对薄弱环节进行优化。', en: 'At a medium level with room for improvement. Focus on optimizing weak areas.' },
  Developing: { zh: '该模块仍在发展中，需要重点关注和改善。建议优先投入资源补齐短板。', en: 'Still developing and needs attention. Prioritize resources to address gaps.' },
  Weak: { zh: '该模块表现较弱，是当前企业发展的主要瓶颈之一。建议优先制定改善计划。', en: 'Weak and represents a key bottleneck. Prioritize creating an improvement plan.' },
};

function getStageKey(stage: string): string {
  for (const key of Object.keys(STAGE_INFO)) {
    if (stage.includes(key)) return key;
  }
  return '';
}

export default function QuestionnaireSectionPage({
  params,
}: {
  params: Promise<{ id: string; section: string }>;
}) {
  const { id: companyId, section: sectionKey } = use(params);
  const router = useRouter();
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
  const moduleScores = diagnostic?.module_scores || {};

  const sectionsSubmitted: string[] = diagnostic?.sections_submitted || [];
  const isSectionSubmitted = sectionsSubmitted.includes(sectionKey);
  const sectionIndex = SECTION_ORDER.indexOf(sectionKey);
  const prevSection = sectionIndex > 0 ? SECTION_ORDER[sectionIndex - 1] : null;
  const canSubmitSection = !prevSection || sectionsSubmitted.includes(prevSection);

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

  const submitSectionMutation = useMutation({
    mutationFn: async () => {
      if (!diagnostic) throw new Error('No diagnostic');
      return api.diagnostics.submitSection(diagnostic.id, sectionKey, {
        answers: { ...existingAnswers, ...answers },
        other_answers: { ...(diagnostic?.other_answers || {}), ...otherAnswers },
      });
    },
    onSuccess: () => {
      toast.success(t('评分完成', 'Scoring complete'));
      queryClient.invalidateQueries({ queryKey: ['diagnostics'] });
      setEditing(false);
    },
    onError: (err: Error) => { toast.error(err.message); },
  });

  if (!sectionData) return <div className="p-8 text-center text-muted-foreground">{t('未找到此分区', 'Section not found')}</div>;
  if (loadingDiag) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  const sectionModuleMap: Record<string, string> = { a: '', b: '1', c: '2', d: '3', e: '4', f: '5' };
  const moduleKey = sectionModuleMap[sectionKey];
  const moduleScore = moduleKey ? moduleScores[moduleKey] : null;
  const sectionAnsweredCount = sectionData.questions.filter((q) => answers[q.id] || existingAnswers[q.id]).length;
  const sectionAllAnswered = sectionAnsweredCount === sectionData.questions.length;
  const showQuestions = !isSectionSubmitted || editing;

  // Findings for this module
  const findings = (diagnostic?.key_findings || []).filter((f: any) => moduleKey && f.module === parseInt(moduleKey));
  const sectionAnalysis = diagnostic?.section_analyses?.[sectionKey];

  // Answer summary for score card
  const answerSummary = sectionData.questions
    .map((q) => ({ zh: q.zh.replace('？', '').replace('?', ''), en: q.en.replace('?', ''), val: existingAnswers[q.id] }))
    .filter((a) => a.val && a.val !== '__other__');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700">
            {sectionKey.toUpperCase()}
          </span>
          <h1 className="text-xl font-bold">{t(sectionData.title_zh, sectionData.title_en)}</h1>
        </div>
        <div className="flex items-center gap-2">
          {isSectionSubmitted && (
            <Badge className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5">
              <CheckCircle2 className="h-3 w-3 mr-1 inline" />
              {t('已提交', 'Submitted')}
            </Badge>
          )}
          {moduleScore && (
            <Badge className="bg-emerald-100 text-emerald-700 text-sm px-3 py-1">
              {moduleScore.score}{t('分', 'pts')} — {t(RATING_LABEL[moduleScore.rating]?.zh || moduleScore.rating, RATING_LABEL[moduleScore.rating]?.en || moduleScore.rating)}
            </Badge>
          )}
        </div>
      </div>

      {/* Section A results — enterprise stage */}
      {isSectionSubmitted && sectionKey === 'a' && diagnostic?.enterprise_stage && (() => {
        const stage = diagnostic.enterprise_stage;
        const stageKey = getStageKey(stage);
        const info = STAGE_INFO[stageKey];
        const stageScore = diagnostic.stage_score ?? 0;
        const profileItems = [
          { zh: '成立时间', en: 'Established', val: existingAnswers['Q01'] },
          { zh: '行业', en: 'Industry', val: existingAnswers['Q03'] },
          { zh: '年营收', en: 'Revenue', val: existingAnswers['Q04'] },
          { zh: '团队规模', en: 'Team', val: existingAnswers['Q06'] },
          { zh: '经营状态', en: 'State', val: existingAnswers['Q07'] },
        ].filter((p) => p.val);

        return (
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-white">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold">{t('企业阶段判定', 'Enterprise Stage Assessment')}</p>
                  <p className="text-[11px] text-muted-foreground">{t('基于8项基础指标综合评估', 'Based on 8 foundational indicators')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{stageScore}</p>
                  <p className="text-[10px] text-muted-foreground">{t('阶段得分', 'Stage Score')}</p>
                </div>
                <div className="flex-1">
                  <Badge className={`${info?.color || 'bg-gray-100 text-gray-700'} text-sm px-3 py-1.5 mb-2`}>{stage}</Badge>
                  <div className="h-2 rounded-full bg-gray-200 mt-1">
                    <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${stageScore}%` }} />
                  </div>
                </div>
              </div>
              {(sectionAnalysis?.analysis_zh || info) && (
                <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 mb-4">
                  <p className="text-xs leading-relaxed text-blue-800 whitespace-pre-line">
                    {sectionAnalysis?.analysis_zh
                      ? t(sectionAnalysis.analysis_zh, sectionAnalysis.analysis_en || sectionAnalysis.analysis_zh)
                      : info ? t(info.zh, info.en) : ''}
                  </p>
                </div>
              )}
              {profileItems.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {profileItems.map((p) => (
                    <div key={p.en} className="rounded-lg bg-white border border-gray-100 px-3 py-2">
                      <p className="text-[10px] text-muted-foreground mb-0.5">{t(p.zh, p.en)}</p>
                      <p className="text-xs font-medium truncate">{String(p.val)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Module score results — sections B-F */}
      {isSectionSubmitted && moduleScore && (() => {
        const score = moduleScore.score;
        const scoreColor = score >= 60 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
        const ratingInfo = RATING_INFO[moduleScore.rating];

        return (
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                  <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold">{t(moduleScore.name_zh, moduleScore.name_en)} {t('评分', 'Score')}</p>
                  <p className="text-[11px] text-muted-foreground">{t(`基于${sectionData.questions.length}项指标综合评估`, `Based on ${sectionData.questions.length} indicators`)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-3xl font-bold" style={{ color: scoreColor }}>{score}</p>
                  <p className="text-[10px] text-muted-foreground">{t('得分', 'Score')}</p>
                </div>
                <div className="flex-1">
                  <Badge className={
                    moduleScore.rating === 'Strong' ? 'bg-emerald-100 text-emerald-700' :
                    moduleScore.rating === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    moduleScore.rating === 'Developing' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }>{t(RATING_LABEL[moduleScore.rating]?.zh || moduleScore.rating, RATING_LABEL[moduleScore.rating]?.en || moduleScore.rating)}</Badge>
                  <div className="h-2 rounded-full bg-gray-200 mt-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: scoreColor }} />
                  </div>
                </div>
              </div>
              {(sectionAnalysis?.analysis_zh || ratingInfo) && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 mb-4">
                  <p className="text-xs leading-relaxed text-emerald-800 whitespace-pre-line">
                    {sectionAnalysis?.analysis_zh
                      ? t(sectionAnalysis.analysis_zh, sectionAnalysis.analysis_en || sectionAnalysis.analysis_zh)
                      : ratingInfo ? t(ratingInfo.zh, ratingInfo.en) : ''}
                  </p>
                </div>
              )}
              {findings.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('关键发现', 'Key Findings')}</p>
                  {findings.map((f: any, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-lg bg-white p-3 border">
                      <div className={`mt-0.5 h-2.5 w-2.5 rounded-full shrink-0 ${f.severity === 'high' ? 'bg-red-500' : f.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <div>
                        <p className="text-xs font-semibold">{t(f.title_zh, f.title_en)}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{t(f.description_zh, f.description_en)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {answerSummary.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {answerSummary.map((a, i) => (
                    <div key={i} className="rounded-lg bg-white border border-gray-100 px-3 py-2">
                      <p className="text-[10px] text-muted-foreground mb-0.5 truncate">{t(a.zh, a.en)}</p>
                      <p className="text-xs font-medium truncate">{String(a.val)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Questions — hidden when submitted, show re-answer button */}
      {showQuestions ? (
        <>
          <Card>
            <CardContent className="pt-4 divide-y">
              {sectionData.questions.map((q, idx) => {
                const currentVal = answers[q.id] || '';
                return (
                  <div key={q.id} className="py-3 first:pt-1">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-sm font-medium leading-snug">{t(q.zh, q.en)}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 ml-7">
                      {q.options.map((opt) => (
                        <button key={opt.zh} type="button"
                          onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.zh }))}
                          className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                            currentVal === opt.zh
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                          }`}>
                          {t(opt.zh, opt.en)}
                        </button>
                      ))}
                      <button type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: '__other__' }))}
                        className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                          currentVal === '__other__'
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}>
                        {t('其他', 'Other')}
                      </button>
                      {currentVal === '__other__' && (
                        <Input placeholder={t('请填写...', 'Please specify...')}
                          value={otherAnswers[q.id] || ''}
                          onChange={(e) => setOtherAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                          className="mt-1 h-7 text-xs w-full max-w-xs" />
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="sticky bottom-0 flex items-center justify-between gap-3 bg-white/95 backdrop-blur-sm py-3 border-t">
            <p className="text-xs text-muted-foreground">{sectionAnsweredCount}/{sectionData.questions.length} {t('已答', 'answered')}</p>
            <div className="flex items-center gap-2">
              {editing && (
                <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => setEditing(false)}>{t('取消', 'Cancel')}</Button>
              )}
              <Button variant="outline" size="sm" className="cursor-pointer" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                {saveMutation.isPending ? t('保存中...', 'Saving...') : t('保存草稿', 'Save Draft')}
              </Button>
              {diagnostic && sectionAllAnswered && canSubmitSection && (
                <Button size="sm" className="cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600" disabled={submitSectionMutation.isPending} onClick={() => submitSectionMutation.mutate()}>
                  {submitSectionMutation.isPending ? t('评分中...', 'Scoring...') : isSectionSubmitted ? t('重新评分', 'Re-score') : t('提交并评分', 'Submit & Score')}
                </Button>
              )}
              {!canSubmitSection && !isSectionSubmitted && (
                <span className="text-xs text-muted-foreground">{t('请先完成上一分区', 'Complete previous section first')}</span>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => setEditing(true)}>
            {t('重新作答', 'Re-answer')}
          </Button>
          {sectionIndex < SECTION_ORDER.length - 1 && (
            <Button size="sm" className="cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
              onClick={() => router.push(`/companies/${companyId}/questionnaire/${SECTION_ORDER[sectionIndex + 1]}`)}>
              {t('下一分区', 'Next Section')} →
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
