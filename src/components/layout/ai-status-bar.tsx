'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2, CheckCircle2, Search, BrainCircuit, FileText, AlertCircle, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

interface AiStatusBarProps {
  companyId: string;
}

interface TaskStatus {
  label: string;
  icon: React.ReactNode;
  color: string;
}

export function AiStatusBar({ companyId }: AiStatusBarProps) {
  const { data: research } = useQuery({
    queryKey: ['research', companyId],
    queryFn: () => api.research.get(companyId).catch(() => null),
    refetchInterval: (query) => {
      const data = query.state.data as any;
      if (!data) return 10000;
      return data.status === 'in_progress' || data.status === 'pending' ? 3000 : false;
    },
  });

  const { data: stages } = useQuery({
    queryKey: ['intake-stages', companyId],
    queryFn: () => api.intake.getAllStages(companyId).catch(() => []),
    refetchInterval: (query) => {
      const data = query.state.data as any[];
      if (!data) return 10000;
      const stage1 = data.find((s: any) => s.stage === '1');
      if (!stage1 || stage1.status === 'in_progress') return 3000;
      return false;
    },
  });

  const { data: documents } = useQuery({
    queryKey: ['documents', companyId],
    queryFn: () => api.documents.list(companyId).catch(() => []),
    refetchInterval: false,
  });

  const { data: assessments } = useQuery({
    queryKey: ['assessments', companyId],
    queryFn: () => api.assessments.list(companyId).catch(() => []),
    refetchInterval: (query) => {
      const data = query.state.data as any[];
      const latest = data?.[0];
      return latest?.status === 'scoring' || latest?.status === 'pending' ? 3000 : false;
    },
  });

  const tasks: TaskStatus[] = [];
  const hasDocuments = documents && documents.length > 0;
  const stage1 = stages?.find((s: any) => s.stage === '1');
  const stage1HasData = stage1?.data && Object.keys(stage1.data).length > 0;
  const stage1HasError = stage1?.data?._error;
  const latestAssessment = assessments?.[0];

  // 1. Research status
  if (research?.status === 'in_progress' || research?.status === 'pending') {
    tasks.push({ label: 'Researching company & industry', icon: <Search className="h-3.5 w-3.5" />, color: 'text-blue-600' });
  } else if (research?.status === 'failed') {
    tasks.push({ label: 'Research failed', icon: <AlertCircle className="h-3.5 w-3.5" />, color: 'text-red-500' });
  } else if (research?.status === 'completed') {
    tasks.push({ label: 'Research complete', icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'text-emerald-600' });
  }

  // 2. Auto-intake / Stage 1 status
  if (stage1HasError) {
    tasks.push({ label: `Intake failed: ${stage1.data._error.slice(0, 60)}`, icon: <AlertCircle className="h-3.5 w-3.5" />, color: 'text-red-500' });
  } else if (!stage1 && hasDocuments) {
    tasks.push({ label: 'AI analyzing documents', icon: <BrainCircuit className="h-3.5 w-3.5" />, color: 'text-purple-600' });
  } else if (stage1?.status === 'in_progress' && !stage1HasData) {
    tasks.push({ label: 'AI extracting intake data', icon: <BrainCircuit className="h-3.5 w-3.5" />, color: 'text-purple-600' });
  } else if (stage1?.status === 'submitted' || stage1?.status === 'validated') {
    tasks.push({ label: 'Stage 1 complete', icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'text-emerald-600' });
  } else if (stage1HasData) {
    tasks.push({ label: 'Stage 1 data ready', icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'text-emerald-600' });
  }

  // 3. Scoring status
  if (latestAssessment?.status === 'scoring' || latestAssessment?.status === 'pending') {
    const progressMsg = (latestAssessment as any)?.progress_message || 'AI scoring in progress';
    tasks.push({ label: progressMsg, icon: <TrendingUp className="h-3.5 w-3.5" />, color: 'text-blue-600' });
  } else if (latestAssessment?.status === 'failed') {
    const errMsg = (latestAssessment as any).error_message?.slice(0, 60) || 'Unknown error';
    tasks.push({ label: `Scoring failed: ${errMsg}`, icon: <AlertCircle className="h-3.5 w-3.5" />, color: 'text-red-500' });
  } else if (latestAssessment?.status === 'draft' || latestAssessment?.status === 'approved') {
    tasks.push({ label: 'Scoring complete', icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'text-emerald-600' });
  }

  const isActive = tasks.some((t) => t.color === 'text-blue-600' || t.color === 'text-purple-600');
  const hasErrors = tasks.some((t) => t.color === 'text-red-500');

  if (tasks.length === 0) return null;

  return (
    <div
      className={`flex items-center gap-4 border-b px-4 py-2 text-xs transition-all ${
        hasErrors
          ? 'bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900'
          : isActive
          ? 'bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900'
          : 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900'
      }`}
    >
      {isActive && (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500 shrink-0" />
      )}
      <div className="flex items-center gap-4 overflow-x-auto">
        {tasks.map((task, i) => (
          <div key={i} className={`flex items-center gap-1.5 whitespace-nowrap ${task.color}`}>
            {task.icon}
            <span>{task.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
