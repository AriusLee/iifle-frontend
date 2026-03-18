'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  { label: 'Gene Structure', href: '/gene', icon: Dna, stage: '1', description: 'Founder, industry, product differentiation analysis' },
  { label: 'Business Model', href: '/business-model', icon: Blocks, stage: '1', description: 'Revenue model and business viability' },
  { label: 'Valuation', href: '/valuation', icon: TrendingUp, stage: '2', description: 'Company valuation methodology' },
  { label: 'Financing', href: '/financing', icon: Banknote, stage: '2', description: 'Capital structure and financing strategy' },
  { label: 'Exit Mechanism', href: '/exit', icon: DoorOpen, stage: '3', description: 'Exit strategies and timelines' },
  { label: 'Listing Standards', href: '/listing', icon: Shield, stage: '3', description: 'Exchange listing requirements' },
];

export default function CompanyOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: company, isLoading } = useQuery({
    queryKey: ['company', id],
    queryFn: () => api.companies.get(id),
  });

  const { data: stages } = useQuery({
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

  if (!company) return null;

  const stageStatusMap = new Map<string, IntakeStatus>();
  if (stages) {
    for (const s of stages) {
      stageStatusMap.set(s.stage, s.status);
    }
  }

  return (
    <div className="space-y-6">
      {/* Company details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Details
          </CardTitle>
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

            return (
              <Link key={mod.href} href={`/companies/${id}${mod.href}`} className="cursor-pointer block">
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{mod.label}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Requires Stage {mod.stage}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">{mod.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant={isReady ? 'default' : 'outline'} className="text-[10px]">
                        {isReady ? 'Ready' : 'No data yet'}
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
