'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, Star, Crown, Loader2, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useCompanyStore } from '@/stores/company-store';
import { cn } from '@/lib/utils';

interface GenerateReportDialogProps {
  companyId: string;
  assessmentId: string;
  moduleNumber: number;
  moduleName: string;
  children: React.ReactElement<{ onClick?: () => void }>;
}

const TIERS = [
  {
    id: 'essential' as const,
    name: 'Essential',
    icon: Zap,
    color: 'border-slate-200 hover:border-slate-400',
    selectedColor: 'border-slate-500 bg-slate-50 dark:bg-slate-900/50',
    iconColor: 'text-slate-500',
    description: 'Key findings, scores, and brief recommendations.',
    features: ['Overall score & rating', 'Key findings summary', 'Top recommendations'],
    pages: '2-3 pages',
  },
  {
    id: 'standard' as const,
    name: 'Standard',
    icon: Star,
    color: 'border-blue-200 hover:border-blue-400',
    selectedColor: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-500',
    description: 'Full analysis with detailed scoring breakdown.',
    features: [
      'Dimension-by-dimension analysis',
      'Detailed scoring rationale',
      'Comparative insights',
      'Actionable recommendations',
    ],
    pages: '5-8 pages',
    popular: true,
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    icon: Crown,
    color: 'border-amber-200 hover:border-amber-400',
    selectedColor: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
    iconColor: 'text-amber-500',
    description: 'Comprehensive deep-dive with peer comparisons and action plan.',
    features: [
      'Everything in Standard',
      'Peer & industry benchmarks',
      'Risk analysis & mitigation',
      'Detailed action plan with timeline',
      'Bilingual (EN/CN)',
    ],
    pages: '10-15 pages',
  },
];

export function GenerateReportDialog({
  companyId,
  assessmentId,
  moduleNumber,
  moduleName,
  children,
}: GenerateReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('standard');
  const queryClient = useQueryClient();
  const { openReports } = useCompanyStore();

  const generateReport = useMutation({
    mutationFn: () =>
      api.reports.generate(companyId, {
        module_number: moduleNumber,
        assessment_id: assessmentId,
        tier: selectedTier,
      }),
    onSuccess: () => {
      toast.success('Report generation started');
      queryClient.invalidateQueries({ queryKey: ['reports', companyId] });
      setOpen(false);
      openReports(`module_${moduleNumber}`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to generate report');
    },
  });

  // Clone child to inject onClick
  const trigger = React.cloneElement(children, {
    onClick: () => setOpen(true),
  });

  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Generate {moduleName} Report
          </DialogTitle>
          <DialogDescription>
            Select the report depth. You can always generate a new version later
            as more data becomes available.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {TIERS.map((tier) => {
            const TierIcon = tier.icon;
            const isSelected = selectedTier === tier.id;

            return (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={cn(
                  'w-full rounded-lg border-2 p-4 text-left transition-all cursor-pointer',
                  'relative',
                  isSelected ? tier.selectedColor : tier.color
                )}
              >
                {tier.popular && (
                  <span className="absolute -top-2.5 right-3 rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-medium text-white">
                    Popular
                  </span>
                )}

                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      isSelected ? 'bg-white dark:bg-background' : 'bg-muted'
                    )}
                  >
                    <TierIcon className={cn('h-4 w-4', tier.iconColor)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{tier.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ~{tier.pages}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tier.description}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        >
                          <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Selection indicator */}
                  <div
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 mt-0.5',
                      isSelected
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/30'
                    )}
                  >
                    {isSelected && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={() => generateReport.mutate()}
            disabled={generateReport.isPending}
            className="cursor-pointer gap-2"
          >
            {generateReport.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {generateReport.isPending ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
