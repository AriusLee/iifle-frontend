'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Assessment, ModuleScore, AutoFlag } from '@/types';

export function useAssessment(companyId: string) {
  const queryClient = useQueryClient();

  const {
    data: assessments,
    isLoading: isLoadingAssessments,
  } = useQuery({
    queryKey: ['assessments', companyId],
    queryFn: () => api.assessments.list(companyId),
    enabled: !!companyId,
    // Poll every 5s while scoring is in progress
    refetchInterval: (query) => {
      const data = query.state.data as any[];
      const latest = data?.[0];
      return latest?.status === 'scoring' || latest?.status === 'pending' ? 5000 : false;
    },
  });

  const latestAssessment = assessments?.[0] ?? null;

  const {
    data: assessment,
    isLoading: isLoadingAssessment,
  } = useQuery({
    queryKey: ['assessment', companyId, latestAssessment?.id],
    queryFn: () => api.assessments.get(companyId, latestAssessment!.id),
    enabled: !!latestAssessment?.id,
    retry: false,
    refetchInterval: (query) => {
      const data = query.state.data as any;
      if (!data) return false;
      const modules = data?.modules ?? data?.module_scores ?? [];
      const status = data?.status;
      // Only poll while actively scoring
      return (status === 'scoring' || status === 'pending') && modules.length === 0 ? 5000 : false;
    },
  });

  const {
    data: flags,
  } = useQuery({
    queryKey: ['assessment-flags', companyId, latestAssessment?.id],
    queryFn: () => api.assessments.getFlags(companyId, latestAssessment!.id),
    enabled: !!latestAssessment?.id,
  });

  const triggerMutation = useMutation({
    mutationFn: (stage: string) => api.assessments.trigger(companyId, stage),
    onSuccess: () => {
      toast.success('Scoring started — results will appear shortly');
      // Start polling
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['assessments', companyId] });
        queryClient.invalidateQueries({ queryKey: ['assessment', companyId] });
        queryClient.invalidateQueries({ queryKey: ['assessment-flags', companyId] });
      }, 3000);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to trigger scoring');
    },
  });

  const moduleScores: ModuleScore[] = assessment?.module_scores ?? assessment?.modules ?? [];

  const getModuleScore = (moduleNumber: number): ModuleScore | undefined =>
    moduleScores.find((m) => m.module_number === moduleNumber);

  return {
    assessment: assessment ?? latestAssessment,
    moduleScores,
    getModuleScore,
    flags: flags ?? [],
    isLoading: isLoadingAssessments || isLoadingAssessment,
    triggerScoring: triggerMutation.mutate,
    isTriggeringScoring: triggerMutation.isPending,
  };
}
