'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Globe, Building2, Users, Loader2, RefreshCw, CheckCircle2,
  Clock, AlertCircle, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ResearchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data: research, isLoading } = useQuery({
    queryKey: ['research', id],
    queryFn: () => api.research.get(id),
    refetchInterval: (query) => {
      // Poll every 5s while research is in progress
      const data = query.state.data as any;
      return data?.status === 'in_progress' ? 5000 : false;
    },
  });

  const triggerMutation = useMutation({
    mutationFn: () => api.research.trigger(id),
    onSuccess: () => {
      toast.success('Research started — this may take 1-2 minutes');
      queryClient.invalidateQueries({ queryKey: ['research', id] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to trigger research'),
  });

  const status = research?.status || 'none';
  const hasData = status === 'completed' && research?.data !== null;

  function renderDataSection(title: string, icon: React.ReactNode, data: Record<string, any> | null, color: string) {
    if (!data || Object.keys(data).length === 0 || data.error) {
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
              {data?.error || 'No data available'}
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
            <Badge variant="outline" className="text-xs">{Object.keys(data).length} fields</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(data).map(([key, value]) => {
            if (key === 'sources' || key === 'error') return null;
            return (
              <div key={key} className="rounded-lg border p-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  {key.replace(/_/g, ' ')}
                </p>
                <div className="text-sm">
                  {typeof value === 'string' ? (
                    <p className="whitespace-pre-wrap">{value}</p>
                  ) : Array.isArray(value) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {value.slice(0, 10).map((item, i) => (
                        <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                      ))}
                      {value.length > 10 && <li className="text-muted-foreground">...and {value.length - 10} more</li>}
                    </ul>
                  ) : typeof value === 'object' && value !== null ? (
                    <pre className="text-xs bg-muted rounded p-2 overflow-x-auto">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  ) : (
                    <p>{String(value)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
        <Button
          className="cursor-pointer gap-2"
          onClick={() => triggerMutation.mutate()}
          disabled={triggerMutation.isPending || status === 'in_progress'}
        >
          {(triggerMutation.isPending || status === 'in_progress') ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {status === 'in_progress' ? 'Researching...' : status === 'completed' ? 'Re-run Research' : 'Start Research'}
        </Button>
      </div>

      {/* Status */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {status === 'in_progress' && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-3 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">Research in progress</p>
              <p className="text-xs text-amber-600">
                Searching the web for company news, industry data, and peer comparisons. This typically takes 1-2 minutes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'failed' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">Research failed</p>
              <p className="text-xs text-red-600">
                {research?.company_data?.error || 'An error occurred. Try again or check your API key in Settings.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'none' && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-12 w-12 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-semibold">No research yet</h3>
            <p className="mt-1 text-center text-sm text-muted-foreground max-w-md">
              Click "Start Research" to run AI-powered due diligence. Research auto-triggers when you create a new company.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Research Results */}
      {status === 'completed' && research && (
        <>
          {/* Meta info */}
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
            {research.sources?.length > 0 && (
              <span>{research.sources.length} sources found</span>
            )}
          </div>

          {/* Three research sections */}
          <div className="space-y-4">
            {renderDataSection(
              'Company Research',
              <Building2 className="h-5 w-5 text-blue-500" />,
              research.company_data,
              'blue',
            )}
            {renderDataSection(
              'Industry Analysis',
              <Globe className="h-5 w-5 text-green-500" />,
              research.industry_data,
              'green',
            )}
            {renderDataSection(
              'Peer Comparison',
              <Users className="h-5 w-5 text-purple-500" />,
              research.peer_data,
              'purple',
            )}
          </div>

          {/* Sources */}
          {research.sources?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {research.sources.map((source: any, i: number) => (
                    <li key={i} className="text-sm">
                      {typeof source === 'string' ? (
                        source.startsWith('http') ? (
                          <a href={source} target="_blank" rel="noopener noreferrer" className="cursor-pointer text-primary hover:underline flex items-center gap-1">
                            {source} <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : source
                      ) : (
                        JSON.stringify(source)
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
