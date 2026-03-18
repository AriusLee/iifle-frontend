'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ClipboardList, Lock, CheckCircle2, Clock, Loader2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { IntakeStatus } from '@/types';

const stages = [
  {
    stage: '1',
    name: 'Company Fundamentals',
    description:
      'Provide basic company information, ownership structure, corporate governance, and high-level financial overview.',
    sections: ['Company Info', 'Ownership', 'Governance', 'Financial Summary'],
  },
  {
    stage: '2',
    name: 'Financial Deep Dive',
    description:
      'Detailed financial statements, revenue breakdown, cost structure, debt schedule, and cash flow analysis.',
    sections: ['Income Statement', 'Balance Sheet', 'Cash Flow', 'Debt Schedule'],
  },
  {
    stage: '3',
    name: 'Strategic Assessment',
    description:
      'Growth strategy, market positioning, competitive landscape, risk factors, and capital requirements.',
    sections: ['Market Position', 'Growth Strategy', 'Risk Assessment', 'Capital Needs'],
  },
];

const statusConfig: Record<IntakeStatus, { icon: typeof CheckCircle2; color: string; label: string }> = {
  not_started: { icon: Clock, color: 'text-muted-foreground', label: 'Not Started' },
  in_progress: { icon: Clock, color: 'text-amber-600', label: 'In Progress' },
  submitted: { icon: CheckCircle2, color: 'text-blue-600', label: 'Submitted' },
  validated: { icon: CheckCircle2, color: 'text-emerald-600', label: 'Validated' },
};

export default function IntakePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: intakeStages, isLoading } = useQuery({
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

  const stageStatusMap = new Map<string, IntakeStatus>();
  if (intakeStages) {
    for (const s of intakeStages) {
      stageStatusMap.set(s.stage, s.status);
    }
  }

  function isLocked(stageNum: string): boolean {
    if (stageNum === '1') return false;
    const prevStage = String(Number(stageNum) - 1);
    const prevStatus = stageStatusMap.get(prevStage);
    return !prevStatus || (prevStatus !== 'submitted' && prevStatus !== 'validated');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Data Intake</h2>
        <p className="text-sm text-muted-foreground">
          Complete each stage to build your company&apos;s capital structure profile.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {stages.map((stage) => {
          const status: IntakeStatus = stageStatusMap.get(stage.stage) || 'not_started';
          const locked = isLocked(stage.stage);
          const config = statusConfig[status];
          const StatusIcon = config.icon;

          return (
            <Card
              key={stage.stage}
              className={`relative transition-all ${locked ? 'opacity-60' : 'hover:shadow-md'}`}
            >
              {locked && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-[1px]">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Lock className="h-6 w-6" />
                    <p className="text-xs font-medium">Complete Stage {Number(stage.stage) - 1} first</p>
                  </div>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {stage.stage}
                    </div>
                    <CardTitle className="text-base">{stage.name}</CardTitle>
                  </div>
                  <Badge
                    variant={status === 'validated' || status === 'submitted' ? 'default' : 'secondary'}
                    className="gap-1"
                  >
                    <StatusIcon className={`h-3 w-3 ${config.color}`} />
                    {config.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{stage.description}</p>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Sections</p>
                  <div className="flex flex-wrap gap-1">
                    {stage.sections.map((section) => (
                      <Badge key={section} variant="outline" className="text-xs">
                        {section}
                      </Badge>
                    ))}
                  </div>
                </div>

                {!locked && (
                  <Link href={`/companies/${id}/intake/stage-${stage.stage}`} className="block">
                    <Button className="w-full cursor-pointer gap-2" variant={status === 'not_started' ? 'default' : 'outline'}>
                      <ClipboardList className="h-4 w-4" />
                      {status === 'not_started'
                        ? 'Start Stage'
                        : status === 'in_progress'
                        ? 'Continue'
                        : 'View Submission'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
