'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2, Globe, MapPin, Calendar, Loader2, RefreshCw,
  CheckCircle2, Clock, AlertCircle, ExternalLink, Search,
  Users, TrendingUp, BookOpen, Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

/* ------------------------------------------------------------------ */
/*  Utility: humanize a snake_case / camelCase key into a readable label */
/* ------------------------------------------------------------------ */
function humanize(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ------------------------------------------------------------------ */
/*  Generic JSONB renderer — handles string | array | object | primitive */
/* ------------------------------------------------------------------ */
function JsonValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="text-sm text-muted-foreground">N/A</span>;
  }

  if (typeof value === 'string') {
    // Render URL-like strings as links
    if (value.startsWith('http')) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          {value}
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    }
    return <p className="text-sm whitespace-pre-wrap">{value}</p>;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return <p className="text-sm">{String(value)}</p>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-sm text-muted-foreground">None</span>;
    }
    return (
      <ul className="list-disc list-inside space-y-1">
        {value.map((item, i) => (
          <li key={i} className="text-sm">
            {typeof item === 'string' || typeof item === 'number' ? (
              item
            ) : typeof item === 'object' && item !== null ? (
              <div className="ml-4 mt-1">
                <JsonBlock data={item as Record<string, unknown>} />
              </div>
            ) : (
              String(item)
            )}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === 'object') {
    return <JsonBlock data={value as Record<string, unknown>} />;
  }

  return <p className="text-sm">{String(value)}</p>;
}

function JsonBlock({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(
    ([key]) => key !== 'sources' && key !== 'error',
  );

  if (entries.length === 0) {
    return <span className="text-sm text-muted-foreground">No data</span>;
  }

  return (
    <div className="space-y-3">
      {entries.map(([key, val]) => (
        <div key={key} className="rounded-lg border p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            {humanize(key)}
          </p>
          <JsonValue value={val} />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Research data section card                                        */
/* ------------------------------------------------------------------ */
function ResearchCard({
  title,
  icon,
  data,
}: {
  title: string;
  icon: React.ReactNode;
  data: Record<string, unknown> | null | undefined;
}) {
  if (!data || Object.keys(data).length === 0 || (data as any).error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {(data as any)?.error || 'No data available'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
          <Badge variant="outline" className="text-xs">
            {Object.keys(data).filter((k) => k !== 'sources' && k !== 'error').length} fields
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <JsonBlock data={data} />
      </CardContent>
    </Card>
  );
}

/* ================================================================== */
/*  Page component                                                    */
/* ================================================================== */
export default function AboutCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  /* --- Company data --- */
  const {
    data: company,
    isLoading: companyLoading,
  } = useQuery({
    queryKey: ['company', id],
    queryFn: () => api.companies.get(id),
  });

  /* --- Research data (poll while in_progress) --- */
  const {
    data: research,
    isLoading: researchLoading,
  } = useQuery({
    queryKey: ['research', id],
    queryFn: () => api.research.get(id).catch(() => null),
    refetchInterval: (query) => {
      const d = query.state.data as any;
      return d?.status === 'in_progress' || d?.status === 'pending' ? 5000 : false;
    },
  });

  /* --- Trigger / retry research --- */
  const triggerMutation = useMutation({
    mutationFn: () => api.research.trigger(id),
    onSuccess: () => {
      toast.success('Research started — this may take 1-2 minutes');
      queryClient.invalidateQueries({ queryKey: ['research', id] });
    },
    onError: (err: any) =>
      toast.error(err.message || 'Failed to trigger research'),
  });

  const researchStatus: string = research?.status || 'none';

  /* --- Loading state --- */
  if (companyLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!company) return null;

  /* ---------------------------------------------------------------- */
  /*  Company field definitions                                       */
  /* ---------------------------------------------------------------- */
  const companyFields: {
    label: string;
    value: string | undefined;
    icon?: React.ReactNode;
    isLink?: boolean;
  }[] = [
    { label: '法定名称 Legal Name', value: company.legal_name },
    { label: '品牌名称 Brand Name', value: (company as any).brand_name },
    { label: '注册编号 Registration No.', value: company.registration_number },
    { label: '公司类型 Company Type', value: company.company_type },
    {
      label: '主要行业 Primary Industry',
      value: company.primary_industry,
    },
    { label: '细分行业 Sub-Industry', value: company.sub_industry },
    {
      label: '国家 Country',
      value: company.country,
      icon: <MapPin className="h-3.5 w-3.5 text-muted-foreground" />,
    },
    {
      label: '网站 Website',
      value: company.website,
      icon: <Globe className="h-3.5 w-3.5 text-muted-foreground" />,
      isLink: true,
    },
    { label: '企业阶段 Enterprise Stage', value: company.enterprise_stage },
    {
      label: '成立日期 Incorporation',
      value: company.date_of_incorporation,
      icon: <Calendar className="h-3.5 w-3.5 text-muted-foreground" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
          <Building2 className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            公司概况 Company Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            {company.legal_name}
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  Company Profile Card                                        */}
      {/* ============================================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5 text-emerald-600" />
            基本信息 Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            {companyFields.map(({ label, value, icon, isLink }) => {
              if (!value) return null;
              return (
                <div key={label} className="flex items-start gap-2">
                  {icon && <span className="mt-0.5">{icon}</span>}
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="text-sm font-medium mt-0.5">
                      {isLink ? (
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cursor-pointer text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {value}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                </div>
              );
            })}
          </dl>

          {company.brief_description && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  简介 Description
                </p>
                <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                  {company.brief_description}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/*  Research Section                                            */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Search className="h-5 w-5 text-emerald-600" />
            研究数据 Research Data
          </h2>
        </div>

        {/* Loading research */}
        {researchLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Status: none */}
        {!researchLoading && researchStatus === 'none' && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Search className="h-12 w-12 text-muted-foreground/30" />
              <h3 className="mt-4 text-lg font-semibold">暂无研究数据 No Research Data Yet</h3>
              <p className="mt-1 text-center text-sm text-muted-foreground max-w-md">
                Run AI-powered research to gather company, industry, and competitor intelligence.
              </p>
              <Button
                className="cursor-pointer mt-6 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => triggerMutation.mutate()}
                disabled={triggerMutation.isPending}
              >
                {triggerMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Run Research
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Status: pending / in_progress */}
        {!researchLoading &&
          (researchStatus === 'in_progress' || researchStatus === 'pending') && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
              <CardContent className="flex items-center gap-3 py-6">
                <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    研究进行中 Research in Progress...
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Searching the web for company data, industry analysis, and peer comparisons. This typically takes 1-2 minutes.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Status: failed */}
        {!researchLoading && researchStatus === 'failed' && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
            <CardContent className="flex items-center justify-between gap-3 py-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    研究失败 Research Failed
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {research?.company_data?.error ||
                      'An error occurred. Try again or check your API key in Settings.'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer gap-2 border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => triggerMutation.mutate()}
                disabled={triggerMutation.isPending}
              >
                {triggerMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Status: completed */}
        {!researchLoading && researchStatus === 'completed' && research && (
          <div className="space-y-4">
            {/* Meta info bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  Research completed
                </span>
                {research.research_date && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(research.research_date).toLocaleString()}
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer gap-2"
                onClick={() => triggerMutation.mutate()}
                disabled={triggerMutation.isPending || (researchStatus as string) === 'in_progress'}
              >
                {triggerMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refine Research
              </Button>
            </div>

            {/* Company Overview */}
            <ResearchCard
              title="公司概览 Company Overview"
              icon={<Building2 className="h-5 w-5 text-blue-500" />}
              data={research.company_data}
            />

            {/* Industry Analysis */}
            <ResearchCard
              title="行业分析 Industry Analysis"
              icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
              data={research.industry_data}
            />

            {/* Peer & Competitors */}
            <ResearchCard
              title="同行与竞争对手 Peer & Competitors"
              icon={<Users className="h-5 w-5 text-purple-500" />}
              data={research.peer_data}
            />

          </div>
        )}
      </div>
    </div>
  );
}
