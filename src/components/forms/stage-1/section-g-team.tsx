'use client';

import { UseFormReturn, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { FormFieldWrapper, NativeSelect } from '@/components/forms/form-field';
import type { Stage1Data } from '@/lib/validations/stage-1';

interface SectionProps {
  form: UseFormReturn<Stage1Data>;
}

const ORG_CHART_OPTIONS = [
  { value: 'yes', label: 'Yes, fully documented' },
  { value: 'partial', label: 'Partially documented' },
  { value: 'no', label: 'No formal org chart' },
];

const REVIEW_OPTIONS = [
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi_annually', label: 'Semi-annually' },
  { value: 'annually', label: 'Annually' },
  { value: 'rarely', label: 'Rarely' },
  { value: 'never', label: 'Never' },
];

const TRAINING_OPTIONS = [
  { value: 'systematic_733', label: 'Systematic (e.g. 7-3-3 model)' },
  { value: 'periodic', label: 'Periodic / Scheduled' },
  { value: 'adhoc', label: 'Ad-hoc / As needed' },
  { value: 'none', label: 'None' },
];

const HR_POLICY_OPTIONS = [
  { value: 'comprehensive', label: 'Comprehensive (handbook, policies, procedures)' },
  { value: 'basic', label: 'Basic (some policies in place)' },
  { value: 'none', label: 'No formal HR policies' },
];

const VMV_OPTIONS = [
  { value: 'all_three', label: 'All three documented (Vision, Mission, Values)' },
  { value: 'some', label: 'Some documented' },
  { value: 'none', label: 'None documented' },
];

export function SectionGTeam({ form }: SectionProps) {
  const { register, watch, formState: { errors } } = form;
  const watchVmv = watch('culture.documented_vmv');
  const showVmvFields = watchVmv === 'all_three' || watchVmv === 'some';

  const visionText = watch('culture.vision') || '';
  const missionText = watch('culture.mission') || '';
  const valuesText = watch('culture.core_values') || '';

  return (
    <div className="space-y-8">
      {/* G1: Organizational Maturity */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          G1. Organizational Maturity
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          How structured and mature your organizational practices are.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Formal Organization Chart?"
            required
            error={errors.org_maturity?.formal_org_chart?.message}
          >
            <NativeSelect
              {...register('org_maturity.formal_org_chart')}
              options={ORG_CHART_OPTIONS}
              placeholder="Select"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Number of Departments"
            required
            error={errors.org_maturity?.num_departments?.message}
          >
            <Input
              type="number"
              {...register('org_maturity.num_departments')}
              placeholder="e.g. 6"
              min={1}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Performance Reviews"
            required
            error={errors.org_maturity?.performance_reviews?.message}
          >
            <NativeSelect
              {...register('org_maturity.performance_reviews')}
              options={REVIEW_OPTIONS}
              placeholder="Select frequency"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Training Program"
            required
            error={errors.org_maturity?.training_program?.message}
          >
            <NativeSelect
              {...register('org_maturity.training_program')}
              options={TRAINING_OPTIONS}
              placeholder="Select"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Annual Staff Turnover Rate %"
            error={errors.org_maturity?.turnover_rate?.message}
            hint="Optional - approximate annual turnover percentage"
          >
            <Input
              type="number"
              {...register('org_maturity.turnover_rate')}
              placeholder="e.g. 15"
              min={0}
              max={100}
              step={0.1}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="HR Policies"
            required
            error={errors.org_maturity?.hr_policies?.message}
          >
            <NativeSelect
              {...register('org_maturity.hr_policies')}
              options={HR_POLICY_OPTIONS}
              placeholder="Select"
            />
          </FormFieldWrapper>
        </div>
      </section>

      <Separator />

      {/* G2: Culture & Values */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          G2. Culture & Values
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Company vision, mission, and core values documentation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Documented Vision / Mission / Values?"
            required
            error={errors.culture?.documented_vmv?.message}
            className="md:col-span-2"
          >
            <NativeSelect
              {...register('culture.documented_vmv')}
              options={VMV_OPTIONS}
              placeholder="Select"
            />
          </FormFieldWrapper>

          {showVmvFields && (
            <>
              <FormFieldWrapper
                label="Vision Statement"
                error={errors.culture?.vision?.message}
                className="md:col-span-2"
              >
                <Textarea
                  {...register('culture.vision')}
                  placeholder="Your company's vision statement"
                  rows={2}
                  maxLength={200}
                />
                <div className="flex justify-end">
                  <span className={`text-xs ${visionText.length > 180 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {visionText.length}/200
                  </span>
                </div>
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Mission Statement"
                error={errors.culture?.mission?.message}
                className="md:col-span-2"
              >
                <Textarea
                  {...register('culture.mission')}
                  placeholder="Your company's mission statement"
                  rows={2}
                  maxLength={200}
                />
                <div className="flex justify-end">
                  <span className={`text-xs ${missionText.length > 180 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {missionText.length}/200
                  </span>
                </div>
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Core Values"
                error={errors.culture?.core_values?.message}
                className="md:col-span-2"
              >
                <Textarea
                  {...register('culture.core_values')}
                  placeholder="Your company's core values (comma-separated or as a short statement)"
                  rows={2}
                  maxLength={200}
                />
                <div className="flex justify-end">
                  <span className={`text-xs ${valuesText.length > 180 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {valuesText.length}/200
                  </span>
                </div>
              </FormFieldWrapper>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
