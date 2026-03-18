'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  });

  // Get the latest assessment (first in list, assuming sorted by created_at desc)
  const latestAssessment = assessments?.[0] ?? null;

  const {
    data: assessment,
    isLoading: isLoadingAssessment,
  } = useQuery({
    queryKey: ['assessment', companyId, latestAssessment?.id],
    queryFn: () => api.assessments.get(companyId, latestAssessment!.id),
    enabled: !!latestAssessment?.id,
  });

  const {
    data: flags,
    isLoading: isLoadingFlags,
  } = useQuery({
    queryKey: ['assessment-flags', companyId, latestAssessment?.id],
    queryFn: () => api.assessments.getFlags(companyId, latestAssessment!.id),
    enabled: !!latestAssessment?.id,
  });

  const triggerMutation = useMutation({
    mutationFn: (stage: string) => api.assessments.trigger(companyId, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', companyId] });
      queryClient.invalidateQueries({ queryKey: ['assessment', companyId] });
      queryClient.invalidateQueries({ queryKey: ['assessment-flags', companyId] });
    },
  });

  const moduleScores: ModuleScore[] = assessment?.module_scores ?? [];

  const getModuleScore = (moduleNumber: number): ModuleScore | undefined =>
    moduleScores.find((m) => m.module_number === moduleNumber);

  return {
    assessment: assessment ?? latestAssessment,
    moduleScores,
    getModuleScore,
    flags: flags ?? [],
    isLoading: isLoadingAssessments || isLoadingAssessment,
    isLoadingFlags,
    triggerScoring: triggerMutation.mutate,
    isTriggeringScoring: triggerMutation.isPending,
  };
}
