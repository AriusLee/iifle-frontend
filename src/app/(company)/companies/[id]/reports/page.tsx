'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FileText, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import type { ReportSummary } from '@/types';

const TYPE_LABELS: Record<string, string> = {
  module_1: '基因',
  module_2: '商模',
  module_3: '估值',
  module_4: '融资',
  module_5: '退出',
  module_6: '上市',
  master: '综合',
  diagnostic: '诊断',
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  generating: {
    label: 'Generating',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 animate-pulse',
  },
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  },
  review: {
    label: 'In Review',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  revision: {
    label: 'Revision',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  published: {
    label: 'Published',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [generating, setGenerating] = useState(false);

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', id],
    queryFn: () => api.reports.list(id),
    refetchInterval: (query) => {
      const data = query.state.data as ReportSummary[] | undefined;
      if (data?.some((r) => r.status === 'generating')) return 3000;
      return false;
    },
  });

  const sortedReports = [...(reports || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const diagnostics = await api.diagnostics.list();
      const diagnostic = diagnostics.find(
        (d: any) => d.company_id === id && d.status === 'completed'
      );

      if (!diagnostic) {
        toast.error('No completed diagnostic found');
        return;
      }

      await api.diagnostics.generateReport(diagnostic.id);
      toast.success('Report generation started');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const GenerateButton = ({ size = 'default' }: { size?: 'default' | 'sm' | 'lg' }) => (
    <Button
      size={size}
      className="cursor-pointer gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
      onClick={handleGenerate}
      disabled={generating}
    >
      {generating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      {generating ? 'Generating...' : 'Generate Report'}
    </Button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports 报告</h1>
            <p className="text-sm text-muted-foreground">
              AI-generated analysis reports for this company
            </p>
          </div>
        </div>
        {sortedReports.length > 0 && <GenerateButton />}
      </div>

      {/* Empty state */}
      {sortedReports.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-semibold">暂无报告 No reports yet</h3>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              Generate your first report based on completed diagnostics
            </p>
            <GenerateButton />
          </CardContent>
        </Card>
      )}

      {/* Reports table */}
      {sortedReports.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedReports.map((report) => {
                  const statusCfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.draft;
                  return (
                    <TableRow
                      key={report.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        router.push(`/companies/${id}/reports/${report.id}`)
                      }
                    >
                      <TableCell className="font-medium">
                        {report.title || 'Untitled Report'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {TYPE_LABELS[report.report_type] || report.report_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusCfg.className}>
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="uppercase text-sm text-muted-foreground">
                        {report.language}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDate(report.created_at)}
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
