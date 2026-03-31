'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Download, AlertTriangle, ShieldCheck, Globe } from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  PieChart, Pie,
  ResponsiveContainer,
} from 'recharts';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ── Helpers ──────────────────────────────────────────────────────────────────

type Lang = 'cn' | 'en';

function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#F59E0B';
  if (score >= 40) return '#F97316';
  return '#EF4444';
}

function getReadiness(r: string | null) {
  if (r === 'green') return { label_cn: '绿灯 — 资本准备就绪', label_en: 'Green — Capital Ready', color: '#10B981', bg: 'bg-emerald-50 border-emerald-200' };
  if (r === 'amber') return { label_cn: '黄灯 — 需补强基础', label_en: 'Amber — Foundation Needed', color: '#F59E0B', bg: 'bg-amber-50 border-amber-200' };
  return { label_cn: '红灯 — 尚未具备条件', label_en: 'Red — Not Ready', color: '#EF4444', bg: 'bg-red-50 border-red-200' };
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function DiagnosticReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('cn');

  const { data: diag, isLoading: diagLoading } = useQuery<any>({
    queryKey: ['diagnostic', params.id],
    queryFn: () => api.diagnostics.get(params.id),
    enabled: !!params.id,
  });

  const { data: report, isLoading: reportLoading, error } = useQuery<any>({
    queryKey: ['diagnostic-report', params.id],
    queryFn: () => api.diagnostics.getReport(params.id),
    enabled: !!diag?.report_id,
  });

  const isLoading = diagLoading || reportLoading;

  const sections = useMemo(() => {
    if (!report?.sections) return [];
    return [...report.sections].sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [report]);

  const modules = useMemo(() => {
    if (!diag?.module_scores) return [];
    return Object.entries(diag.module_scores)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([key, mod]: [string, any]) => ({ key, ...mod }));
  }, [diag?.module_scores]);

  const radarData = modules.map((m: any) => ({
    module: lang === 'cn' ? m.name_zh : m.name_en,
    score: m.score,
    fullMark: 100,
  }));

  const barData = modules.map((m: any) => ({
    name: lang === 'cn' ? m.name_zh : m.name_en,
    score: m.score,
    rating: m.rating,
  }));

  const findings = diag?.key_findings || [];
  const bottlenecks = findings.filter((f: any) => f.type === 'bottleneck' || f.type === 'gap');
  const strengths = findings.filter((f: any) => f.type === 'strength');

  const getSection = (key: string) => sections.find((s: any) => s.section_key === key);
  const getText = (section: any) => lang === 'cn' ? (section?.content_cn || section?.content_en || '') : (section?.content_en || section?.content_cn || '');

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
        <button className="flex cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground" onClick={() => router.push(`/diagnostics/${params.id}`)}>
          <ArrowLeft className="h-4 w-4" /> 返回诊断
        </button>
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{!diag?.report_id ? '尚未生成报告' : '加载报告失败'}</p>
        </div>
      </div>
    );
  }

  const score = diag?.overall_score ?? 0;
  const readiness = getReadiness(diag?.capital_readiness);

  const gaugeData = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b mb-8 -mx-4 px-4 py-3 flex items-center justify-between">
        <button className="flex cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground" onClick={() => router.push(`/diagnostics/${params.id}`)}>
          <ArrowLeft className="h-4 w-4" /> {lang === 'cn' ? '返回诊断' : 'Back'}
        </button>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border bg-gray-50 p-0.5">
            <button
              onClick={() => setLang('cn')}
              className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-all ${lang === 'cn' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              中文
            </button>
            <button
              onClick={() => setLang('en')}
              className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-all ${lang === 'en' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              English
            </button>
          </div>
          <Button variant="outline" size="sm" className="cursor-pointer gap-1.5" disabled>
            <Download className="h-3.5 w-3.5" /> PDF
          </Button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
         REPORT CONTENT
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-10">

        {/* ── Cover / Title ── */}
        <header className="text-center py-6">
          <p className="text-xs uppercase tracking-widest text-emerald-600 mb-2">IIFLE</p>
          <h1 className="text-3xl font-bold text-gray-900">{report.title}</h1>
          <p className="mt-2 text-sm text-gray-500">{diag?.company_name}</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-700">{lang === 'cn' ? '独角兽成长诊断' : 'Unicorn Growth Diagnostic'}</Badge>
          </div>
        </header>

        <hr className="border-gray-200" />

        {/* ── 1. Score Overview ── */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {lang === 'cn' ? '一、诊断总览' : '1. Diagnostic Overview'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Gauge */}
            <div className="flex flex-col items-center">
              <div className="relative h-44 w-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={gaugeData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} startAngle={220} endAngle={-40} dataKey="value" stroke="none">
                      <Cell fill={getScoreColor(score)} />
                      <Cell fill="#F3F4F6" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold" style={{ color: getScoreColor(score) }}>{score}</span>
                  <span className="text-[10px] text-gray-400">{lang === 'cn' ? '总分 / 100' : 'Score / 100'}</span>
                </div>
              </div>
            </div>

            {/* Rating + Stage */}
            <div className="space-y-4 text-center">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">{lang === 'cn' ? '综合评级' : 'Rating'}</p>
                <p className="text-lg font-semibold text-gray-800">{diag?.overall_rating || '--'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">{lang === 'cn' ? '企业阶段' : 'Enterprise Stage'}</p>
                <p className="text-lg font-semibold text-gray-800">{diag?.enterprise_stage || '--'}</p>
              </div>
            </div>

            {/* Capital Readiness */}
            <div className={`flex flex-col items-center gap-2 rounded-xl border p-5 ${readiness.bg}`}>
              <div className="h-10 w-10 rounded-full border-4" style={{ backgroundColor: readiness.color, borderColor: `${readiness.color}40` }} />
              <p className="text-sm font-semibold text-center" style={{ color: readiness.color }}>
                {lang === 'cn' ? readiness.label_cn : readiness.label_en}
              </p>
              <p className="text-[10px] text-gray-400">{lang === 'cn' ? '资本准备度' : 'Capital Readiness'}</p>
            </div>
          </div>
        </section>

        {/* ── Executive Summary ── */}
        {getSection('executive_summary') && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {lang === 'cn' ? '二、诊断摘要' : '2. Executive Summary'}
            </h2>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 bg-gray-50 rounded-xl p-6 border border-gray-100">
              {getText(getSection('executive_summary'))}
            </div>
          </section>
        )}

        {/* ── Module Scores (cards + charts) ── */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {lang === 'cn' ? '三、六大模块评分' : '3. Module Scores'}
          </h2>

          {/* Mini score cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {modules.map((m: any) => (
              <div key={m.key} className="rounded-xl border bg-white overflow-hidden">
                <div className="h-1" style={{ backgroundColor: getScoreColor(m.score) }} />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xl font-bold" style={{ color: getScoreColor(m.score) }}>{m.score}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${getScoreColor(m.score)}15`, color: getScoreColor(m.score) }}>{m.rating}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{lang === 'cn' ? m.name_zh : m.name_en}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar */}
            {radarData.length > 0 && (
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">{lang === 'cn' ? '雷达图' : 'Radar Chart'}</p>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid stroke="#E5E7EB" />
                      <PolarAngleAxis dataKey="module" tick={{ fontSize: 10, fill: '#374151' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                      <Radar dataKey="score" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={2} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Bar */}
            {barData.length > 0 && (
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">{lang === 'cn' ? '得分对比' : 'Score Comparison'}</p>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} layout="vertical" margin={{ left: 80, right: 16, top: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={75} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={18}>
                        {barData.map((entry: any, i: number) => (
                          <Cell key={i} fill={getScoreColor(entry.score)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Key Findings ── */}
        {findings.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {lang === 'cn' ? '四、关键发现' : '4. Key Findings'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-red-200 bg-red-50/50 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-semibold text-red-700">{lang === 'cn' ? '瓶颈与缺口' : 'Bottlenecks & Gaps'}</span>
                </div>
                {bottlenecks.length > 0 ? bottlenecks.map((f: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 mb-3 last:mb-0">
                    <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${f.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{lang === 'cn' ? f.title_zh : f.title_en}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{lang === 'cn' ? f.description_zh : f.description_en}</p>
                    </div>
                  </div>
                )) : <p className="text-xs text-gray-400 italic">{lang === 'cn' ? '无重大瓶颈' : 'No major bottlenecks'}</p>}
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-700">{lang === 'cn' ? '核心优势' : 'Key Strengths'}</span>
                </div>
                {strengths.length > 0 ? strengths.map((f: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 mb-3 last:mb-0">
                    <div className="mt-1.5 h-2 w-2 rounded-full shrink-0 bg-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{lang === 'cn' ? f.title_zh : f.title_en}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{lang === 'cn' ? f.description_zh : f.description_en}</p>
                    </div>
                  </div>
                )) : <p className="text-xs text-gray-400 italic">{lang === 'cn' ? '需更多数据分析' : 'More data needed'}</p>}
              </div>
            </div>
          </section>
        )}

        <hr className="border-gray-200" />

        {/* ── Module Analysis Sections ── */}
        {[
          { key: 'enterprise_stage', num: '五', en_num: '5', title_cn: '企业阶段分析', title_en: 'Enterprise Stage Analysis' },
          { key: 'gene_structure', num: '六', en_num: '6', title_cn: '基因结构诊断', title_en: 'Gene Structure Diagnosis' },
          { key: 'business_model', num: '七', en_num: '7', title_cn: '商业模式诊断', title_en: 'Business Model Diagnosis' },
          { key: 'growth_valuation', num: '八', en_num: '8', title_cn: '增长与估值潜力', title_en: 'Growth & Valuation Potential' },
          { key: 'financing_readiness', num: '九', en_num: '9', title_cn: '融资与资本准备度', title_en: 'Financing & Capital Readiness' },
          { key: 'exit_listing', num: '十', en_num: '10', title_cn: '退出与上市方向', title_en: 'Exit & Listing Direction' },
        ].map(({ key, num, en_num, title_cn, title_en }) => {
          const s = getSection(key);
          if (!s) return null;
          return (
            <section key={key}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {lang === 'cn' ? `${num}、${title_cn}` : `${en_num}. ${title_en}`}
              </h2>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {getText(s)}
              </div>
            </section>
          );
        })}

        <hr className="border-gray-200" />

        {/* ── Growth Pathway ── */}
        {getSection('growth_pathway') && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {lang === 'cn' ? '十一、做大做强路径建议' : '11. Growth Pathway Recommendations'}
            </h2>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 bg-emerald-50/50 rounded-xl p-6 border border-emerald-100">
              {getText(getSection('growth_pathway'))}
            </div>
          </section>
        )}

        {/* ── Action Items ── */}
        {getSection('action_items') && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {lang === 'cn' ? '十二、行动建议' : '12. Action Items'}
            </h2>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 bg-amber-50/50 rounded-xl p-6 border border-amber-100">
              {getText(getSection('action_items'))}
            </div>
          </section>
        )}

        {/* ── Footer ── */}
        <footer className="border-t pt-8 pb-12 text-center space-y-1">
          <p className="text-xs text-gray-400">
            {lang === 'cn' ? '本报告由 IIFLE AI 平台自动生成' : 'Report generated by IIFLE AI Platform'}
          </p>
          <p className="text-xs text-gray-400">
            {lang === 'cn' ? '数据来源：企业诊断问卷 + 行业实时研究' : 'Sources: Diagnostic Questionnaire + Real-time Industry Research'}
          </p>
          <p className="text-[10px] text-gray-300 mt-2">© {new Date().getFullYear()} IIFLE · All Rights Reserved</p>
        </footer>
      </div>
    </div>
  );
}
