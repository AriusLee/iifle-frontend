'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dna, ArrowRight, Loader2, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScoreBadge } from '@/components/reports/score-badge';
import { RadarChart } from '@/components/reports/radar-chart';
import { Scorecard } from '@/components/reports/scorecard';
import { DimensionTable } from '@/components/reports/dimension-table';
import { AutoFlags } from '@/components/reports/auto-flags';
import { useAssessment } from '@/hooks/use-assessment';
import type { IntakeStatus } from '@/types';

const geneFactors = [
  'Founder Analysis',
  'Industry Positioning',
  'Product Assessment',
  'Differentiation Strategy',
  'Replicability Score',
  'Team Composition',
  'Growth Potential',
];

export default function GeneStructurePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: stages, isLoading } = useQuery({
    queryKey: ['intake-stages', id],
    queryFn: () => api.intake.getAllStages(id),
  });

  const {
    assessment,
    getModuleScore,
    flags,
    isLoading: isLoadingAssessment,
    triggerScoring,
    isTriggeringScoring,
  } = useAssessment(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stage1Status: IntakeStatus =
    stages?.find((s) => s.stage === '1')?.status || 'not_started';
  const isSubmitted = stage1Status === 'submitted' || stage1Status === 'validated';
  const isInProgress = stage1Status === 'in_progress';

  const geneModule = getModuleScore(1);
  const hasResults = isSubmitted && geneModule && geneModule.dimensions && geneModule.dimensions.length > 0;

  // Filter flags relevant to gene/module 1
  const geneFlags = flags.filter(
    (f) =>
      f.flag_type.toLowerCase().includes('gene') ||
      f.flag_type.toLowerCase().includes('founder') ||
      f.flag_type.toLowerCase().includes('team') ||
      f.flag_type.toLowerCase().includes('industry') ||
      f.flag_type.toLowerCase().includes('product') ||
      f.source_field?.toLowerCase().includes('module_1') ||
      f.source_field?.toLowerCase().includes('gene'),
  );

  const radarData = geneModule?.dimensions
    ? geneModule.dimensions
        .sort((a, b) => a.dimension_number - b.dimension_number)
        .map((d) => ({
          name: d.dimension_name.length > 16 ? d.dimension_name.slice(0, 14) + '...' : d.dimension_name,
          score: d.score,
          fullMark: 100,
        }))
    : geneFactors.map((f) => ({ name: f, score: 0, fullMark: 100 }));

  return (
    <div className="space-y-6">
      {/* Module header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Dna className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gene Structure Analysis</h1>
            <p className="text-sm text-muted-foreground">
              Evaluate the fundamental DNA of the company across 7 key dimensions
            </p>
          </div>
        </div>
        {hasResults && (
          <ScoreBadge score={geneModule.total_score} rating={geneModule.rating} size="lg" />
        )}
      </div>

      {/* State: Not started */}
      {!isSubmitted && !isInProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Stage 1 Intake Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Gene Structure analysis requires completion of Stage 1 (Company Fundamentals) intake.
              This module evaluates the following dimensions:
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {geneFactors.map((factor) => (
                <div
                  key={factor}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                >
                  <Dna className="h-4 w-4 text-primary/60 shrink-0" />
                  {factor}
                </div>
              ))}
            </div>
            <Link href={`/companies/${id}/intake/stage-1`}>
              <Button className="cursor-pointer gap-2 mt-2">
                Start Intake
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* State: In progress */}
      {isInProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-amber-500" />
              Stage 1 Intake In Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Stage 1 intake is currently in progress. Complete and submit the intake to unlock
              Gene Structure scoring.
            </p>
            <Link href={`/companies/${id}/intake/stage-1`}>
              <Button variant="outline" className="cursor-pointer gap-2">
                Continue Intake
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* State: Submitted but no results yet */}
      {isSubmitted && !hasResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              {isLoadingAssessment ? 'Loading Results...' : 'Analysis Ready'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAssessment ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading scoring results...
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Stage 1 data has been submitted. Gene Structure scoring results will appear here
                  once processing is complete.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {geneFactors.map((factor) => (
                    <div
                      key={factor}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <Dna className="h-4 w-4 text-primary/60 shrink-0" />
                        {factor}
                      </span>
                      <span className="text-xs text-muted-foreground">Pending</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* State: Results ready */}
      {hasResults && (
        <>
          {/* Radar Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Dimension Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <RadarChart data={radarData} />
            </CardContent>
          </Card>

          {/* Scorecard */}
          <Scorecard moduleScore={geneModule} />

          {/* Detailed Dimensions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Dimension Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <DimensionTable dimensions={geneModule.dimensions!} />
            </CardContent>
          </Card>

          {/* Auto Flags */}
          {geneFlags.length > 0 && <AutoFlags flags={geneFlags} />}

          {/* Re-score button */}
          <div className="flex justify-end">
            <Button
              onClick={() => triggerScoring('1')}
              disabled={isTriggeringScoring}
              variant="outline"
              className="cursor-pointer gap-2"
            >
              {isTriggeringScoring ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Re-score Gene Structure
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
