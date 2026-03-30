'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  ArrowLeft,
  Loader2,
  FileText,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
// Section labels for displaying answers (no full questionnaire data needed in advisor)
const ANSWER_SECTIONS: { key: string; range: [number, number]; title_zh: string; title_en: string }[] = [
  { key: 'A', range: [1, 6], title_zh: '企业当前基础', title_en: 'Current Enterprise Foundation' },
  { key: 'B', range: [7, 9], title_zh: '基因结构', title_en: 'Gene Structure' },
  { key: 'C', range: [10, 15], title_zh: '商业模式结构', title_en: 'Business Model Structure' },
  { key: 'D', range: [16, 20], title_zh: '增长与估值潜力', title_en: 'Growth & Valuation Potential' },
  { key: 'E', range: [21, 24], title_zh: '融资与资本准备', title_en: 'Financing & Capital Readiness' },
  { key: 'F', range: [25, 26], title_zh: '退出与上市方向', title_en: 'Exit & Listing Direction' },
  { key: 'G', range: [27, 27], title_zh: '报告期望', title_en: 'Report Expectations' },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Diagnostic {
  id: string;
  company_id: string;
  company_name: string | null;
  status: 'draft' | 'submitted' | 'scoring' | 'completed' | 'failed';
  answers: Record<string, string | string[]> | null;
  overall_score: number | null;
  overall_rating: string | null;
  enterprise_stage: string | null;
  capital_readiness: 'green' | 'amber' | 'red' | null;
  module_scores: Record<string, { name_zh: string; name_en: string; score: number; rating: string }> | null;
  key_findings: Array<{
    type: string;
    severity: string;
    title_zh: string;
    title_en: string;
    description_zh: string;
    description_en: string;
    module: number;
  }> | null;
  report_id: string | null;
  submitted_at: string | null;
  scored_at: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: '草稿 Draft', className: 'bg-gray-100 text-gray-700' },
  submitted: { label: '已提交 Submitted', className: 'bg-blue-100 text-blue-700' },
  scoring: { label: '评分中 Scoring', className: 'bg-yellow-100 text-yellow-700' },
  completed: { label: '已完成 Completed', className: 'bg-emerald-100 text-emerald-700' },
  failed: { label: '失败 Failed', className: 'bg-red-100 text-red-700' },
};

const READINESS_BADGE: Record<string, { label: string; className: string }> = {
  green: { label: '绿灯 Green', className: 'bg-emerald-100 text-emerald-700' },
  amber: { label: '黄灯 Amber', className: 'bg-amber-100 text-amber-700' },
  red: { label: '红灯 Red', className: 'bg-red-100 text-red-700' },
};

const SEVERITY_ICON: Record<string, React.ReactNode> = {
  high: <AlertTriangle className="h-4 w-4 text-red-500" />,
  medium: <Info className="h-4 w-4 text-amber-500" />,
  low: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
};

function getScoreColor(score: number | null): string {
  if (score === null) return 'text-gray-400';
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

function getRatingBg(rating: string): string {
  const r = rating?.toLowerCase() ?? '';
  if (r.includes('excellent') || r.includes('优')) return 'bg-emerald-500 text-white';
  if (r.includes('good') || r.includes('良')) return 'bg-emerald-400 text-white';
  if (r.includes('average') || r.includes('中')) return 'bg-yellow-500 text-white';
  if (r.includes('below') || r.includes('较')) return 'bg-orange-500 text-white';
  return 'bg-gray-500 text-white';
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DiagnosticDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: diag, isLoading, error } = useQuery<Diagnostic>({
    queryKey: ['diagnostic', params.id],
    queryFn: () => api.diagnostics.get(params.id),
    enabled: !!params.id,
  });

  const generateMutation = useMutation({
    mutationFn: () => api.diagnostics.generateReport(params.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostic', params.id] });
    },
  });

  // Radar data
  const radarData = useMemo(() => {
    if (!diag?.module_scores) return [];
    return Object.entries(diag.module_scores).map(([, mod]) => ({
      module: mod.name_zh,
      score: mod.score,
      fullMark: 100,
    }));
  }, [diag?.module_scores]);

  // Module table rows
  const moduleRows = useMemo(() => {
    if (!diag?.module_scores) return [];
    return Object.entries(diag.module_scores).map(([key, mod]) => ({
      key,
      name_zh: mod.name_zh,
      name_en: mod.name_en,
      score: mod.score,
      rating: mod.rating,
    }));
  }, [diag?.module_scores]);

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error
  if (error || !diag) {
    return (
      <div className="space-y-4">
        <button
          className="flex cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => router.push('/companies')}
        >
          <ArrowLeft className="h-4 w-4" />
          返回仪表盘 Back to Dashboard
        </button>
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">
            Failed to load diagnostic. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[diag.status] ?? STATUS_CONFIG.draft;

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="space-y-2">
        <button
          className="flex cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => router.push('/companies')}
        >
          <ArrowLeft className="h-4 w-4" />
          返回仪表盘 Back to Dashboard
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {diag.company_name || '未命名企业'}
          </h1>
          <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Score Overview */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>分数概览 Score Overview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6 pt-6 sm:flex-row sm:justify-around">
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor(diag.overall_score)}`}>
                  {diag.overall_score ?? '--'}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">总分 Overall Score</p>
              </div>
              <div className="text-center">
                {diag.overall_rating ? (
                  <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${getRatingBg(diag.overall_rating)}`}>
                    {diag.overall_rating}
                  </span>
                ) : (
                  <span className="text-lg text-muted-foreground">--</span>
                )}
                <p className="mt-1 text-sm text-muted-foreground">评级 Rating</p>
              </div>
              <div className="text-center">
                <span className="inline-block rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-800">
                  {diag.enterprise_stage || '--'}
                </span>
                <p className="mt-1 text-sm text-muted-foreground">企业阶段 Stage</p>
              </div>
              <div className="text-center">
                {diag.capital_readiness ? (
                  <Badge className={READINESS_BADGE[diag.capital_readiness]?.className ?? 'bg-gray-100 text-gray-700'}>
                    {READINESS_BADGE[diag.capital_readiness]?.label ?? diag.capital_readiness}
                  </Badge>
                ) : (
                  <span className="text-lg text-muted-foreground">--</span>
                )}
                <p className="mt-1 text-sm text-muted-foreground">资本准备 Capital Readiness</p>
              </div>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          {radarData.length > 0 && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>模块得分雷达图</CardTitle>
                <CardDescription>Module Score Radar Chart</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis
                        dataKey="module"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                      />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          fontSize: '13px',
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Module Breakdown */}
          {moduleRows.length > 0 && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>模块明细 Module Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>模块 Module</TableHead>
                      <TableHead>得分 Score</TableHead>
                      <TableHead>评级 Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {moduleRows.map((m) => (
                      <TableRow key={m.key}>
                        <TableCell>
                          <div className="font-medium">{m.name_zh}</div>
                          <div className="text-xs text-muted-foreground">{m.name_en}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all"
                                style={{ width: `${m.score}%` }}
                              />
                            </div>
                            <span className={`font-semibold ${getScoreColor(m.score)}`}>
                              {m.score}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRatingBg(m.rating)}>{m.rating}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Key Findings */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>关键发现 Key Findings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {diag.key_findings && diag.key_findings.length > 0 ? (
                diag.key_findings.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {SEVERITY_ICON[f.severity] ?? SEVERITY_ICON.medium}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{f.title_zh}</span>
                        <Badge
                          className={
                            f.severity === 'high'
                              ? 'bg-red-100 text-red-700'
                              : f.severity === 'medium'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                          }
                        >
                          {f.severity}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{f.title_en}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{f.description_zh}</p>
                      <p className="text-xs text-muted-foreground/70">{f.description_en}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">暂无关键发现 No key findings.</p>
              )}
            </CardContent>
          </Card>

          {/* Report Actions */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>报告操作 Report Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {diag.report_id ? (
                <Button
                  className="w-full cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
                  onClick={() => router.push(`/diagnostics/${diag.id}/report`)}
                >
                  <ExternalLink className="mr-1.5 h-4 w-4" />
                  查看报告 View Report
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {diag.status === 'completed'
                      ? '诊断已完成，可以生成完整报告。'
                      : '诊断完成后方可生成报告。'}
                  </p>
                  <Button
                    className="w-full cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
                    disabled={diag.status !== 'completed' || generateMutation.isPending}
                    onClick={() => generateMutation.mutate()}
                  >
                    <FileText className="mr-1.5 h-4 w-4" />
                    {generateMutation.isPending
                      ? '生成中... Generating...'
                      : '生成报告 Generate Report'}
                  </Button>
                  {generateMutation.isError && (
                    <p className="text-xs text-destructive">
                      报告生成失败，请重试。 Report generation failed.
                    </p>
                  )}
                  {generateMutation.isSuccess && (
                    <p className="text-xs text-emerald-600">
                      报告已生成。 Report generated successfully.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full-width: Questionnaire Answers */}
      {diag.answers && Object.keys(diag.answers).length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>问卷回答 Questionnaire Answers</CardTitle>
            <CardDescription>
              共 {Object.keys(diag.answers).length} 道问题 / {Object.keys(diag.answers).length} questions answered
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y pt-2">
            {ANSWER_SECTIONS.map((section) => {
              const qIds: string[] = [];
              for (let i = section.range[0]; i <= section.range[1]; i++) {
                qIds.push(`Q${String(i).padStart(2, '0')}`);
              }
              const hasAnswers = qIds.some((qid) => diag.answers?.[qid] !== undefined);
              if (!hasAnswers) return null;

              return (
                <div key={section.key} className="py-4 first:pt-2 last:pb-2">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500 text-xs font-bold text-white">
                      {section.key}
                    </span>
                    <span className="text-sm font-semibold">
                      {section.title_zh}
                      <span className="ml-1.5 font-normal text-muted-foreground">
                        {section.title_en}
                      </span>
                    </span>
                  </div>
                  <div className="space-y-3 pl-8">
                    {qIds.map((qid) => {
                      const answer = diag.answers?.[qid];
                      if (answer === undefined) return null;
                      const displayAnswer = Array.isArray(answer)
                        ? answer.join('、')
                        : String(answer);
                      return (
                        <div key={qid} className="text-sm">
                          <p className="font-medium text-foreground">{qid}</p>
                          <p className="mt-1 rounded bg-muted/50 px-3 py-1.5 text-sm">
                            {displayAnswer || '--'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
