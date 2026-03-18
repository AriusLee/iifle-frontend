'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Globe,
  MapPin,
  Calendar,
  Dna,
  Blocks,
  TrendingUp,
  Banknote,
  DoorOpen,
  Shield,
  Loader2,
  ArrowRight,
  AlertTriangle,
  AlertCircle,
  Info,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  BrainCircuit,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScoreBadge, getScoreColorHex } from '@/components/reports/score-badge';
import { RadarChart } from '@/components/reports/radar-chart';
import { useAssessment } from '@/hooks/use-assessment';
import type { IntakeStatus } from '@/types';

const stageInfo = [
  { stage: '1', name: 'Company Fundamentals', description: 'Basic company info, financials, and structure' },
  { stage: '2', name: 'Financial Deep Dive', description: 'Detailed financial data and projections' },
  { stage: '3', name: 'Strategic Assessment', description: 'Growth strategy, risks, and market position' },
];

const statusStyles: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
  not_started: { variant: 'outline', label: 'Not Started' },
  in_progress: { variant: 'secondary', label: 'In Progress' },
  submitted: { variant: 'default', label: 'Submitted' },
  validated: { variant: 'default', label: 'Validated' },
};

const moduleCards = [
  { label: 'Gene Structure', href: '/gene', icon: Dna, stage: '1', moduleNumber: 1, description: 'Founder, industry, product differentiation analysis' },
  { label: 'Business Model', href: '/business-model', icon: Blocks, stage: '1', moduleNumber: 2, description: 'Revenue model and business viability' },
  { label: 'Valuation', href: '/valuation', icon: TrendingUp, stage: '2', moduleNumber: 3, description: 'Company valuation methodology' },
  { label: 'Financing', href: '/financing', icon: Banknote, stage: '2', moduleNumber: 4, description: 'Capital structure and financing strategy' },
  { label: 'Exit Mechanism', href: '/exit', icon: DoorOpen, stage: '3', moduleNumber: 5, description: 'Exit strategies and timelines' },
  { label: 'Listing Standards', href: '/listing', icon: Shield, stage: '3', moduleNumber: 6, description: 'Exchange listing requirements' },
];

const capitalReadinessConfig = {
  red: { label: 'Not Ready', colorClass: 'bg-red-500', textClass: 'text-red-700 dark:text-red-400' },
  amber: { label: 'Conditional', colorClass: 'bg-amber-500', textClass: 'text-amber-700 dark:text-amber-400' },
  green: { label: 'Ready', colorClass: 'bg-emerald-500', textClass: 'text-emerald-700 dark:text-emerald-400' },
};

type AiProcessingState = 'idle' | 'researching' | 'analyzing' | 'ready' | 'none';

export default function CompanyOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [isReprocessing, setIsReprocessing] = useState(false);

  const { data: company, isLoading } = useQuery({
    queryKey: ['company', id],
    queryFn: () => api.companies.get(id),
  });

  const { data: stages, refetch: refetchStages } = useQuery({
    queryKey: ['intake-stages', id],
    queryFn: () => api.intake.getAllStages(id),
  });

  const { data: research, refetch: refetchResearch } = useQuery({
    queryKey: ['research', id],
    queryFn: () => api.research.get(id).catch(() => null),
  });

  const { data: documents } = useQuery({
    queryKey: ['documents', id],
    queryFn: () => api.documents.list(id).catch(() => []),
  });

  const {
    assessment,
    moduleScores,
    flags,
    isLoading: isLoadingAssessment,
  } = useAssessment(id);

  // Determine AI processing state
  const getAiState = useCallback((): AiProcessingState => {
    const stage1 = stages?.find((s: any) => s.stage === '1');
    const hasDocuments = documents && documents.length > 0;

    // If research is actively in progress
    if (research && research.status === 'in_progress') {
      return 'researching';
    }

    // If stage 1 exists and is submitted/validated, data is ready
    if (stage1 && (stage1.status === 'submitted' || stage1.status === 'validated')) {
      return 'ready';
    }

    // If stage 1 is in_progress (auto-intake is filling data)
    if (stage1 && stage1.status === 'in_progress') {
      return 'analyzing';
    }

    // If we have documents but stage 1 is not_started, AI may be processing
    if (hasDocuments && (!stage1 || stage1.status === 'not_started')) {
      // Check if research was triggered (status exists)
      if (research && research.status === 'pending') {
        return 'researching';
      }
      // Might still be processing — check if company was just created with docs
      if (research && research.status === 'completed' && (!stage1 || stage1.status === 'not_started')) {
        return 'analyzing';
      }
    }

    return 'none';
  }, [stages, documents, research]);

  const aiState = getAiState();

  // Poll while AI is processing
  useEffect(() => {
    if (aiState !== 'researching' && aiState !== 'analyzing') return;

    const interval = setInterval(() => {
      refetchStages();
      refetchResearch();
      queryClient.invalidateQueries({ queryKey: ['company', id] });
    }, 5000);

    return () => clearInterval(interval);
  }, [aiState, id, refetchStages, refetchResearch, queryClient]);

  const handleReprocess = async () => {
    setIsReprocessing(true);
    try {
      await api.autoIntake.trigger(id);
      toast.success('AI processing triggered — analyzing documents...');
      refetchStages();
      refetchResearch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to trigger AI processing');
    } finally {
      setIsReprocessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!company) return null;

  const stageStatusMap = new Map<string, IntakeStatus>();
  if (stages) {
    for (const s of stages) {
      stageStatusMap.set(s.stage, s.status);
    }
  }

  const hasAssessment = assessment && assessment.overall_score != null;

  // Build radar data from scored modules
  const radarData = moduleScores.length > 0
    ? moduleScores.map((m) => ({
        name: m.module_name.length > 14 ? m.module_name.slice(0, 12) + '...' : m.module_name,
        score: m.total_score,
        fullMark: 100,
      }))
    : moduleCards.map((m) => ({
        name: m.label,
        score: 0,
        fullMark: 100,
      }));

  // Flag counts by severity
  const flagCounts = {
    critical: flags.filter((f) => f.severity === 'critical').length,
    high: flags.filter((f) => f.severity === 'high').length,
    medium: flags.filter((f) => f.severity === 'medium').length,
    low: flags.filter((f) => f.severity === 'low').length,
  };
  const totalFlags = flags.length;

  return (
    <div className="space-y-6">
      {/* Company details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Details
            </CardTitle>
            {documents && documents.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer gap-1.5"
                onClick={handleReprocess}
                disabled={isReprocessing || aiState === 'researching' || aiState === 'analyzing'}
              >
                {isReprocessing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                Re-process with AI
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Legal Name</p>
              <p className="text-sm font-semibold">{company.legal_name}</p>
            </div>
            {company.registration_number && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Registration #</p>
                <p className="text-sm">{company.registration_number}</p>
              </div>
            )}
            {company.company_type && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Company Type</p>
                <p className="text-sm">{company.company_type}</p>
              </div>
            )}
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Country</p>
                <p className="text-sm">{company.country}</p>
              </div>
            </div>
            {company.primary_industry && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Industry</p>
                <Badge variant="outline">{company.primary_industry}</Badge>
              </div>
            )}
            {company.website && (
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Website</p>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer text-sm text-primary hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              </div>
            )}
            {company.date_of_incorporation && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Incorporated</p>
                  <p className="text-sm">{company.date_of_incorporation}</p>
                </div>
              </div>
            )}
          </div>
          {company.brief_description && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Description</p>
                <p className="mt-1 text-sm text-foreground">{company.brief_description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Assessment Overview (if exists) */}
      {hasAssessment && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Overall Score */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-muted-foreground mb-2">Overall Score</p>
              <div className="flex items-center gap-3">
                <ScoreBadge score={assessment.overall_score!} rating={assessment.overall_rating} size="lg" />
              </div>
            </CardContent>
          </Card>

          {/* Capital Readiness */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-muted-foreground mb-2">Capital Readiness</p>
              {assessment.capital_readiness ? (
                <div className="flex items-center gap-3">
                  {/* Traffic light */}
                  <div className="flex items-center gap-1.5">
                    {(['red', 'amber', 'green'] as const).map((color) => (
                      <div
                        key={color}
                        className={`h-5 w-5 rounded-full transition-all ${
                          assessment.capital_readiness === color
                            ? capitalReadinessConfig[color].colorClass
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-sm font-semibold ${capitalReadinessConfig[assessment.capital_readiness].textClass}`}>
                    {capitalReadinessConfig[assessment.capital_readiness].label}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Pending</span>
              )}
            </CardContent>
          </Card>

          {/* Enterprise Stage */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-muted-foreground mb-2">Enterprise Stage</p>
              {assessment.enterprise_stage_classification ? (
                <Badge variant="secondary" className="text-sm">
                  {assessment.enterprise_stage_classification}
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">Pending</span>
              )}
            </CardContent>
          </Card>

          {/* Flags Summary */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-muted-foreground mb-2">Auto-Flags</p>
              {totalFlags > 0 ? (
                <div className="flex items-center gap-2 flex-wrap">
                  {flagCounts.critical > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full px-2 py-0.5">
                      <AlertTriangle className="h-3 w-3" />
                      {flagCounts.critical}
                    </span>
                  )}
                  {flagCounts.high > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 rounded-full px-2 py-0.5">
                      <AlertTriangle className="h-3 w-3" />
                      {flagCounts.high}
                    </span>
                  )}
                  {flagCounts.medium > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full px-2 py-0.5">
                      <AlertCircle className="h-3 w-3" />
                      {flagCounts.medium}
                    </span>
                  )}
                  {flagCounts.low > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full px-2 py-0.5">
                      <Info className="h-3 w-3" />
                      {flagCounts.low}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">None</span>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Module Radar Chart (if assessment exists) */}
      {hasAssessment && moduleScores.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Module Score Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart data={radarData} />
          </CardContent>
        </Card>
      )}

      {/* Stage Progress */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Intake Progress</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {stageInfo.map((info) => {
            const status = stageStatusMap.get(info.stage) || 'not_started';
            const style = statusStyles[status] || statusStyles.not_started;

            return (
              <Card key={info.stage}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Stage {info.stage}</CardTitle>
                    <Badge variant={style.variant}>{style.label}</Badge>
                  </div>
                  <p className="text-sm font-medium">{info.name}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{info.description}</p>
                  <Link href={`/companies/${id}/intake`} className="mt-3 block">
                    <Button size="sm" variant="outline" className="w-full cursor-pointer">
                      {status === 'not_started' ? 'Start' : status === 'in_progress' ? 'Continue' : 'View'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Module Summary Cards */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Analysis Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {moduleCards.map((mod) => {
            const Icon = mod.icon;
            const requiredStageStatus = stageStatusMap.get(mod.stage);
            const isReady = requiredStageStatus === 'submitted' || requiredStageStatus === 'validated';
            const moduleScore = moduleScores.find((m) => m.module_number === mod.moduleNumber);

            return (
              <Link key={mod.href} href={`/companies/${id}${mod.href}`} className="cursor-pointer block">
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm">{mod.label}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Requires Stage {mod.stage}
                        </p>
                      </div>
                      {moduleScore && (
                        <ScoreBadge score={moduleScore.total_score} size="sm" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">{mod.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant={isReady ? 'default' : 'outline'} className="text-[10px]">
                        {moduleScore ? moduleScore.rating : isReady ? 'Ready' : 'No data yet'}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
