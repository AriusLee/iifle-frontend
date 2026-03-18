'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Banknote, ArrowRight, Loader2, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { IntakeStatus } from '@/types';

const financingAreas = [
  'Debt Structure',
  'Equity Composition',
  'Working Capital',
  'Capital Expenditure',
  'Funding Rounds',
  'Debt Covenants',
];

export default function FinancingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: stages, isLoading } = useQuery({
    queryKey: ['intake-stages', id],
    queryFn: () => api.intake.getAllStages(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stage2Status: IntakeStatus =
    stages?.find((s) => s.stage === '2')?.status || 'not_started';
  const isSubmitted = stage2Status === 'submitted' || stage2Status === 'validated';
  const isInProgress = stage2Status === 'in_progress';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Banknote className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financing Analysis</h1>
          <p className="text-sm text-muted-foreground">
            Capital structure optimization and financing strategy assessment
          </p>
        </div>
      </div>

      {!isSubmitted && !isInProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Stage 2 Intake Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Financing analysis requires completion of Stage 2 (Financial Deep Dive) intake.
              This module evaluates:
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {financingAreas.map((area) => (
                <div key={area} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                  <Banknote className="h-4 w-4 text-primary/60 shrink-0" />
                  {area}
                </div>
              ))}
            </div>
            <Link href={`/companies/${id}/intake`}>
              <Button className="cursor-pointer gap-2 mt-2">
                Go to Intake
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {isInProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-amber-500" />
              Stage 2 Intake In Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Complete and submit Stage 2 intake to unlock Financing analysis.
            </p>
            <Link href={`/companies/${id}/intake`}>
              <Button variant="outline" className="cursor-pointer gap-2">
                Continue Intake
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {isSubmitted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Analysis Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Stage 2 data has been submitted. Financing analysis results will appear here
              once processing is complete.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {financingAreas.map((area) => (
                <div key={area} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-primary/60 shrink-0" />
                    {area}
                  </span>
                  <span className="text-xs text-muted-foreground">Pending</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
