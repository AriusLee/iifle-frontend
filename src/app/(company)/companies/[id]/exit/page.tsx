'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DoorOpen, ArrowRight, Loader2, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { IntakeStatus } from '@/types';

const exitFactors = [
  'IPO Exit Viability',
  'Trade Sale / M&A Viability',
  'Other Exit Options',
  'Corporate Structure Readiness',
  'Timeline Feasibility',
  'Investor Return Path',
];

export default function ExitMechanismPage({ params }: { params: Promise<{ id: string }> }) {
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

  const stage3Status: IntakeStatus =
    stages?.find((s) => s.stage === '3')?.status || 'not_started';
  const isSubmitted = stage3Status === 'submitted' || stage3Status === 'validated';
  const isInProgress = stage3Status === 'in_progress';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <DoorOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exit Mechanism Analysis</h1>
          <p className="text-sm text-muted-foreground">
            Assess exit pathway viability, timeline feasibility, and investor returns
          </p>
        </div>
      </div>

      {!isSubmitted && !isInProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Stage 3 Intake Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Exit Mechanism analysis requires completion of Stage 3 (Capital Market Ready) intake.
              This module evaluates:
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {exitFactors.map((factor) => (
                <div key={factor} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                  <DoorOpen className="h-4 w-4 text-primary/60 shrink-0" />
                  {factor}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Stage 3 requires completion of Stage 1 and Stage 2 first.
            </p>
          </CardContent>
        </Card>
      )}

      {isInProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-amber-500" />
              Stage 3 Intake In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Stage 3 intake is currently in progress. Complete and submit to unlock Exit Mechanism scoring.
            </p>
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
              Stage 3 data submitted. Exit Mechanism scoring results will appear here once processing is complete.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {exitFactors.map((factor) => (
                <div key={factor} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <DoorOpen className="h-4 w-4 text-primary/60 shrink-0" />
                    {factor}
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
