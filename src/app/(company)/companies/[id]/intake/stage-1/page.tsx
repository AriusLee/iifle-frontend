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
import { SectionACompany } from '@/components/forms/stage-1/section-a-company';
import { SectionBLeadership } from '@/components/forms/stage-1/section-b-leadership';
import { SectionCProducts } from '@/components/forms/stage-1/section-c-products';
import { SectionDBusiness } from '@/components/forms/stage-1/section-d-business';
import { SectionEFinancials } from '@/components/forms/stage-1/section-e-financials';
import { SectionFGrowth } from '@/components/forms/stage-1/section-f-growth';
import { SectionGTeam } from '@/components/forms/stage-1/section-g-team';
import { SectionHDocuments } from '@/components/forms/stage-1/section-h-documents';
import { stage1Schema, type Stage1Data } from '@/lib/validations/stage-1';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

const STEPS = [
  { id: 'A', label: 'Company Profile', description: 'Registration, industry, scale' },
  { id: 'B', label: 'Leadership', description: 'Founder, management, succession' },
  { id: 'C', label: 'Products', description: 'Offerings, customers, supply chain' },
  { id: 'D', label: 'Business Model', description: 'Revenue, scalability, competition' },
  { id: 'E', label: 'Financials', description: 'Revenue, balance sheet, cash flow' },
  { id: 'F', label: 'Growth', description: 'Plans, capital, IPO, exit' },
  { id: 'G', label: 'Team', description: 'Organization, culture, values' },
  { id: 'H', label: 'Documents', description: 'Upload supporting files' },
];

const SECTION_REQUIRED_FIELDS: Record<number, string[]> = {
  0: ['registration.legal_name', 'registration.registration_number', 'industry.primary_industry', 'scale.total_employees'],
  1: ['founder.name', 'founder.age', 'succession.key_person'],
  2: ['products'],
  3: ['revenue_model.description', 'scalability.expansion_plan_3yr'],
  4: ['financials.fy_end_month', 'balance_sheet.total_assets'],
  5: ['growth_plans.revenue_target_yr1', 'growth_plans.revenue_target_yr3'],
  6: ['org_maturity.formal_org_chart', 'org_maturity.num_departments'],
  7: [],
};

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

export default function Stage1IntakePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: companyId } = use(params);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(true);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const form = useForm<Stage1Data>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(stage1Schema) as any,
    defaultValues: {
      co_founders: [],
      management_team: [
        { position: 'CEO / Managing Director', name: '', years_in_role: undefined, years_with_company: undefined, background: '' },
        { position: 'CFO / Finance Director', name: '', years_in_role: undefined, years_with_company: undefined, background: '' },
        { position: 'COO / Operations Director', name: '', years_in_role: undefined, years_with_company: undefined, background: '' },
        { position: 'CTO / Technology Director', name: '', years_in_role: undefined, years_with_company: undefined, background: '' },
        { position: 'Sales & Marketing Director', name: '', years_in_role: undefined, years_with_company: undefined, background: '' },
        { position: 'HR Director', name: '', years_in_role: undefined, years_with_company: undefined, background: '' },
      ],
      products: [],
    },
    mode: 'onBlur',
  });

  const { formState: { isDirty } } = form;

  // Load saved draft on mount
  useEffect(() => {
    async function loadDraft() {
      try {
        const stage = await api.intake.getStage(companyId, '1');
        if (stage?.data && Object.keys(stage.data).length > 0) {
          form.reset(stage.data);
          toast.info('Draft loaded');
        }
      } catch {
        // No draft exists yet — start fresh
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
      await api.intake.saveDraft(companyId, '1', values);
      setLastSaved(new Date());
      form.reset(values, { keepValues: true });
      toast.success('Draft saved');
    } catch (err) {
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  }, [form, isSaving, companyId]);

  // Auto-save every 30 seconds if form is dirty
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
        if (fields.length === 0) continue;

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
      await api.intake.submitStage(companyId, '1', values);
      toast.success('Stage 1 submitted successfully!');
      router.push(`/companies/${companyId}`);
    } catch (err: any) {
      toast.error(err.message || 'Submission failed. Please check all required fields.');
      // Find first section with errors and navigate to it
      const isValid = await form.trigger();
      if (!isValid) {
        const errs = form.formState.errors;
        if (errs.registration || errs.industry || errs.scale) setCurrentStep(0);
        else if (errs.founder || errs.co_founders || errs.management_team || errs.succession) setCurrentStep(1);
        else if (errs.products || errs.product_competitiveness || errs.customers || errs.supply_chain) setCurrentStep(2);
        else if (errs.revenue_model || errs.scalability || errs.competitive_landscape) setCurrentStep(3);
        else if (errs.financials || errs.balance_sheet || errs.cash_flow || errs.audit_status) setCurrentStep(4);
        else if (errs.growth_plans || errs.capital_intentions || errs.ipo_aspiration || errs.exit_preference) setCurrentStep(5);
        else if (errs.org_maturity || errs.culture) setCurrentStep(6);
      }
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formAny = form as unknown as UseFormReturn<Stage1Data>;

  const renderSection = () => {
    switch (currentStep) {
      case 0: return <SectionACompany form={formAny} />;
      case 1: return <SectionBLeadership form={formAny} />;
      case 2: return <SectionCProducts form={formAny} />;
      case 3: return <SectionDBusiness form={formAny} />;
      case 4: return <SectionEFinancials form={formAny} />;
      case 5: return <SectionFGrowth form={formAny} />;
      case 6: return <SectionGTeam form={formAny} />;
      case 7: return <SectionHDocuments form={formAny} />;
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
          <h1 className="text-2xl font-bold text-foreground">Stage 1: Initial Intake</h1>
          <Badge variant="outline" className="text-xs">Draft</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete all sections to submit your company for initial assessment.
          Your progress is saved automatically.
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
              {isSubmitting ? 'Submitting...' : 'Submit Stage 1'}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          {completedSteps.size} of {STEPS.length - 1} sections completed
          {completedSteps.size === STEPS.length - 1 && ' — Ready to submit!'}
        </p>
      </div>
    </div>
  );
}
