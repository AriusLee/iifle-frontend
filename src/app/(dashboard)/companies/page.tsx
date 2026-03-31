'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  CheckCircle2,
  TrendingUp,
  Loader2,
  ClipboardList,
  ArrowUpDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  key_findings: Array<{ type: string; severity: string; title_zh: string; title_en: string; description_zh: string; description_en: string; module: number }> | null;
  report_id: string | null;
  submitted_at: string | null;
  scored_at: string | null;
  created_at: string;
}

type SortField = 'date' | 'score' | 'company';
type SortDir = 'asc' | 'desc';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: '草稿', className: 'bg-gray-100 text-gray-700' },
  submitted: { label: '已提交', className: 'bg-blue-100 text-blue-700' },
  scoring: { label: '评分中', className: 'bg-yellow-100 text-yellow-700' },
  completed: { label: '已完成', className: 'bg-emerald-100 text-emerald-700' },
  failed: { label: '失败', className: 'bg-red-100 text-red-700' },
};

const READINESS_DOT: Record<string, string> = {
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};

function getScoreColor(score: number | null): string {
  if (score === null) return 'text-gray-400';
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export default function CompaniesPage() {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const { data: diagnostics, isLoading, error } = useQuery<Diagnostic[]>({
    queryKey: ['diagnostics'],
    queryFn: () => api.diagnostics.list(),
  });

  const stats = useMemo(() => {
    if (!diagnostics) return { total: 0, completed: 0, avgScore: 0 };
    const completed = diagnostics.filter((d) => d.status === 'completed');
    const scores = completed.map((d) => d.overall_score).filter((s): s is number => s !== null);
    return {
      total: diagnostics.length,
      completed: completed.length,
      avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    };
  }, [diagnostics]);

  const sorted = useMemo(() => {
    if (!diagnostics) return [];
    const copy = [...diagnostics];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') {
        const dateA = a.submitted_at || a.created_at;
        const dateB = b.submitted_at || b.created_at;
        cmp = new Date(dateA).getTime() - new Date(dateB).getTime();
      } else if (sortField === 'score') {
        cmp = (a.overall_score ?? -1) - (b.overall_score ?? -1);
      } else if (sortField === 'company') {
        cmp = (a.company_name ?? '').localeCompare(b.company_name ?? '');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [diagnostics, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Diagnostic Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Unicorn Growth Diagnostic (独角兽成长诊断)
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
              <Activity className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">总诊断数 Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">已完成 Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">平均分 Avg Score</p>
              <p className="text-2xl font-bold">{stats.avgScore || '--'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">
            Failed to load diagnostics. Please try again.
          </p>
        </div>
      )}

      {/* Empty state */}
      {diagnostics && diagnostics.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20">
          <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">暂无诊断记录</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            No diagnostics yet. Customers can start a diagnostic from the questionnaire page.
          </p>
        </div>
      )}

      {/* Table */}
      {sorted.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>诊断列表 Diagnostic List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button
                      className="flex cursor-pointer items-center gap-1"
                      onClick={() => toggleSort('company')}
                    >
                      企业名称 Company
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>状态 Status</TableHead>
                  <TableHead>
                    <button
                      className="flex cursor-pointer items-center gap-1"
                      onClick={() => toggleSort('score')}
                    >
                      总分 Score
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>企业阶段 Stage</TableHead>
                  <TableHead>资本准备 Capital</TableHead>
                  <TableHead>
                    <button
                      className="flex cursor-pointer items-center gap-1"
                      onClick={() => toggleSort('date')}
                    >
                      提交日期 Date
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((d) => {
                  const statusCfg = STATUS_CONFIG[d.status] ?? STATUS_CONFIG.draft;
                  return (
                    <TableRow
                      key={d.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/companies/${d.company_id}`)}
                    >
                      <TableCell className="font-medium">
                        {d.company_name || '未命名企业'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusCfg.className}>
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${getScoreColor(d.overall_score)}`}>
                          {d.overall_score !== null ? d.overall_score : '--'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {d.enterprise_stage || '--'}
                      </TableCell>
                      <TableCell>
                        {d.capital_readiness ? (
                          <span className="flex items-center gap-1.5">
                            <span
                              className={`inline-block h-2.5 w-2.5 rounded-full ${READINESS_DOT[d.capital_readiness] ?? 'bg-gray-300'}`}
                            />
                            <span className="text-xs text-muted-foreground capitalize">
                              {d.capital_readiness}
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(d.submitted_at || d.created_at)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
