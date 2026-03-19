'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FormStepper } from '@/components/forms/form-stepper';
import { SectionAAudit } from '@/components/forms/stage-2/section-a-audit';
import { SectionBIncome } from '@/components/forms/stage-2/section-b-income';
import { SectionCBalanceSheet } from '@/components/forms/stage-2/section-c-balance-sheet';
import { SectionDCashflow } from '@/components/forms/stage-2/section-d-cashflow';
import { SectionEWorkingCapital } from '@/components/forms/stage-2/section-e-working-capital';
import { SectionFPeers } from '@/components/forms/stage-2/section-f-peers';
import { SectionGProjections } from '@/components/forms/stage-2/section-g-projections';
import { SectionHFunding } from '@/components/forms/stage-2/section-h-funding';
import { SectionIRpt } from '@/components/forms/stage-2/section-i-rpt';
import { stage2Schema, type Stage2Data } from '@/lib/validations/stage-2';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

const STEPS = [
  { id: 'A', label: 'Audit Info', description: 'Audited financial statements' },
  { id: 'B', label: 'Income Statement', description: 'Revenue, costs, profit (3yr)' },
  { id: 'C', label: 'Balance Sheet', description: 'Assets, liabilities, equity (3yr)' },
  { id: 'D', label: 'Cash Flow', description: 'Operating, investing, financing (3yr)' },
  { id: 'E', label: 'Working Capital', description: 'Receivables, inventory, borrowings' },
  { id: 'F', label: 'Peer Comparison', description: 'Comparable companies & benchmarks' },
  { id: 'G', label: 'Projections', description: 'Budget, forecasts, capex plans' },
  { id: 'H', label: 'Funding & Equity', description: 'Rounds, shareholders, structure' },
  { id: 'I', label: 'Related Party', description: 'RPT disclosure & policy' },
];

const SECTION_REQUIRED_FIELDS: Record<number, string[]> = {
  0: ['audit.audit_info.accounting_standard'],
  1: ['income_statement.fy_end_month'],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
};

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

export default function Stage2IntakePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: companyId } = use(params);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(true);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const form = useForm<Stage2Data>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(stage2Schema) as any,
    defaultValues: {
      working_capital: { borrowings: [] },
      peers: { comparable_companies: [] },
      projections: { projections: [], capex_plans: [], key_growth_drivers: [], key_risks: [] },
      funding: { funding_rounds: [], current_shareholders: [] },
      related_party: { has_related_party_transactions: false, transactions: [] },
    },
    mode: 'onBlur',
  });

  const { formState: { isDirty } } = form;

  // Load saved draft on mount
  useEffect(() => {
    async function loadDraft() {
      try {
        const stage = await api.intake.getStage(companyId, '2');
        if (stage?.data && Object.keys(stage.data).length > 0) {
          form.reset(stage.data);
          toast.info('Draft loaded');
        }
      } catch {
        // No draft exists yet
      } finally {
        setLoadingDraft(false);
      }
    }
    loadDraft();
  }, [companyId, form]);

  // Save draft function
  const saveDraft = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const values = form.getValues();
      await api.intake.saveDraft(companyId, '2', values);
      setLastSaved(new Date());
      form.reset(values, { keepValues: true });
      toast.success('Draft saved');
    } catch {
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  }, [form, isSaving, companyId]);

  // Auto-save every 30 seconds if dirty
  useEffect(() => {
    autoSaveTimerRef.current = setInterval(() => {
      if (isDirty) {
        saveDraft();
      }
    }, 30000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [isDirty, saveDraft]);

  // Track section completion
  useEffect(() => {
    const subscription = form.watch(() => {
      const values = form.getValues() as Record<string, unknown>;
      const newCompleted = new Set<number>();

      for (const [stepIdx, fields] of Object.entries(SECTION_REQUIRED_FIELDS)) {
        const idx = Number(stepIdx);
        if (fields.length === 0) {
          // Mark as complete if any data exists in this section
          const sectionKeys = ['audit', 'income_statement', 'balance_sheet', 'cash_flow', 'working_capital', 'peers', 'projections', 'funding', 'related_party'];
          const sectionData = values[sectionKeys[idx]];
          if (sectionData && typeof sectionData === 'object' && Object.keys(sectionData as object).length > 0) {
            newCompleted.add(idx);
          }
          continue;
        }

        const allFilled = fields.every((field) => {
          const value = getNestedValue(values, field);
          if (Array.isArray(value)) return value.length > 0;
          if (typeof value === 'number') return true;
          return value !== undefined && value !== null && value !== '';
        });

        if (allFilled) {
          newCompleted.add(idx);
        }
      }

      setCompletedSteps(newCompleted);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Submit handler
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const values = form.getValues();
      await api.intake.submitStage(companyId, '2', values);
      toast.success('Stage 2 submitted successfully! Scoring will begin shortly.');
      router.push(`/companies/${companyId}`);
    } catch (err: any) {
      toast.error(err.message || 'Submission failed. Please check all required fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToStep = (index: number) => {
    setCurrentStep(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goNext = () => {
    if (currentStep < STEPS.length - 1) goToStep(currentStep + 1);
  };

  const goPrev = () => {
    if (currentStep > 0) goToStep(currentStep - 1);
  };

  const formAny = form as unknown as UseFormReturn<Stage2Data>;

  const renderSection = () => {
    switch (currentStep) {
      case 0: return <SectionAAudit form={formAny} />;
      case 1: return <SectionBIncome form={formAny} />;
      case 2: return <SectionCBalanceSheet form={formAny} />;
      case 3: return <SectionDCashflow form={formAny} />;
      case 4: return <SectionEWorkingCapital form={formAny} />;
      case 5: return <SectionFPeers form={formAny} />;
      case 6: return <SectionGProjections form={formAny} />;
      case 7: return <SectionHFunding form={formAny} />;
      case 8: return <SectionIRpt form={formAny} />;
      default: return null;
    }
  };

  if (loadingDraft) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading intake form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-foreground">Stage 2: Financial Engine</h1>
          <Badge variant="outline" className="text-xs">Draft</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Detailed financial data for valuation and financing readiness assessment.
          All amounts in RM (Malaysian Ringgit). Your progress is saved automatically.
        </p>
        {lastSaved && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <CheckCircle2 className="size-3 text-green-500" />
            Last saved: {lastSaved.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Stepper */}
      <div className="mb-8 rounded-xl border bg-card p-4 md:p-6">
        <FormStepper
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
        />
      </div>

      {/* Section Content */}
      <div className="rounded-xl border bg-card p-6 md:p-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              {STEPS[currentStep].id}
            </span>
            <h2 className="text-xl font-semibold text-foreground">{STEPS[currentStep].label}</h2>
          </div>
          <p className="text-sm text-muted-foreground ml-9">{STEPS[currentStep].description}</p>
        </div>

        <Separator className="mb-6" />

        <form onSubmit={(e) => e.preventDefault()}>
          {renderSection()}
        </form>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between rounded-xl border bg-card p-4">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={goPrev}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="size-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={saveDraft}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="size-4 mr-1 animate-spin" /> : <Save className="size-4 mr-1" />}
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button type="button" className="cursor-pointer" onClick={goNext}>
              Next
              <ChevronRight className="size-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              className="cursor-pointer"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="size-4 mr-1 animate-spin" /> : <Send className="size-4 mr-1" />}
              {isSubmitting ? 'Submitting...' : 'Submit Stage 2'}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          {completedSteps.size} of {STEPS.length} sections with data
        </p>
      </div>
    </div>
  );
}
