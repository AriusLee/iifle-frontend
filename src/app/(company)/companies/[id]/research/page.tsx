'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Globe, Building2, Users, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { IntakeStatus } from '@/types';

export default function ResearchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: stages, isLoading } = useQuery({
    queryKey: ['intake-stages', id],
    queryFn: () => api.intake.getAllStages(id),
  });

  const stage1Status: IntakeStatus =
    stages?.find((s) => s.stage === '1')?.status || 'not_started';
  const isSubmitted = stage1Status === 'submitted' || stage1Status === 'validated';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Search className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Due Diligence Research</h1>
          <p className="text-sm text-muted-foreground">
            AI-powered online research about the company, industry, and peers
          </p>
        </div>
      </div>

      {!isSubmitted ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-semibold">Research pending</h3>
            <p className="mt-1 text-center text-sm text-muted-foreground max-w-md">
              Due diligence research auto-triggers after Stage 1 submission. Complete the intake to unlock
              company research, industry analysis, and peer comparison.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-5 w-5 text-blue-500" />
                Company Research
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                News, filings, reputation, and key personnel background research.
              </p>
              <p className="mt-3 text-xs text-amber-600 font-medium">Processing — Phase 2</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-5 w-5 text-green-500" />
                Industry Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                TAM, lifecycle stage, PESTEL analysis, trends, and regulatory environment.
              </p>
              <p className="mt-3 text-xs text-amber-600 font-medium">Processing — Phase 2</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-purple-500" />
                Peer Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Comparable companies, financial benchmarks, and M&A activity.
              </p>
              <p className="mt-3 text-xs text-amber-600 font-medium">Processing — Phase 2</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
