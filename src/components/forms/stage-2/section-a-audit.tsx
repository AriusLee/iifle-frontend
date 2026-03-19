'use client';

import { UseFormReturn, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { FormFieldWrapper, NativeSelect } from '@/components/forms/form-field';
import type { Stage2Data } from '@/lib/validations/stage-2';

interface SectionProps {
  form: UseFormReturn<Stage2Data>;
}

const AOB_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Unknown' },
];

const ACCOUNTING_STD_OPTIONS = [
  { value: 'mpers', label: 'MPERS' },
  { value: 'mfrs', label: 'MFRS' },
  { value: 'ifrs', label: 'IFRS' },
  { value: 'unknown', label: 'Unknown' },
];

const AUDIT_OPINION_OPTIONS = [
  { value: 'unqualified', label: 'Unqualified (Clean)' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'adverse', label: 'Adverse' },
  { value: 'disclaimer', label: 'Disclaimer of Opinion' },
  { value: 'unknown', label: 'Unknown' },
];

export function SectionAAudit({ form }: SectionProps) {
  const { register, control, watch, formState: { errors } } = form;
  const watchAudited = watch('audit.audit_info.has_audited_accounts');

  return (
    <div className="space-y-8">
      {/* A: Audit Status */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          A. Audited Financial Statements
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Details of the company&apos;s audited financial statements and auditor information.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Has Audited Financial Statements?"
            error={errors.audit?.audit_info?.has_audited_accounts?.message}
          >
            <Controller
              name="audit.audit_info.has_audited_accounts"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm cursor-pointer h-8">
                  <input
                    type="checkbox"
                    checked={field.value || false}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="size-4 rounded border border-input accent-primary cursor-pointer"
                  />
                  Yes, financial statements are audited
                </label>
              )}
            />
          </FormFieldWrapper>

          <div /> {/* spacer */}

          {watchAudited && (
            <>
              <FormFieldWrapper
                label="Years of Audited Accounts"
                error={errors.audit?.audit_info?.years_audited?.message}
              >
                <Input
                  type="number"
                  {...register('audit.audit_info.years_audited')}
                  placeholder="e.g. 5"
                  min={0}
                  className="text-right"
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Auditor Name"
                error={errors.audit?.audit_info?.auditor_name?.message}
              >
                <Input
                  {...register('audit.audit_info.auditor_name')}
                  placeholder="e.g. John Doe"
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Auditor Firm"
                error={errors.audit?.audit_info?.auditor_firm?.message}
              >
                <Input
                  {...register('audit.audit_info.auditor_firm')}
                  placeholder="e.g. KPMG, Deloitte, BDO"
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="AOB Registered Auditor?"
                error={errors.audit?.audit_info?.aob_registered?.message}
                hint="Audit Oversight Board registration status"
              >
                <NativeSelect
                  {...register('audit.audit_info.aob_registered')}
                  options={AOB_OPTIONS}
                  placeholder="Select"
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Accounting Standard"
                error={errors.audit?.audit_info?.accounting_standard?.message}
              >
                <NativeSelect
                  {...register('audit.audit_info.accounting_standard')}
                  options={ACCOUNTING_STD_OPTIONS}
                  placeholder="Select"
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Audit Opinion"
                error={errors.audit?.audit_info?.audit_opinion?.message}
              >
                <NativeSelect
                  {...register('audit.audit_info.audit_opinion')}
                  options={AUDIT_OPINION_OPTIONS}
                  placeholder="Select"
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Latest Audit Financial Year End"
                error={errors.audit?.audit_info?.latest_audit_fy_end?.message}
              >
                <Input
                  type="date"
                  {...register('audit.audit_info.latest_audit_fy_end')}
                  className="cursor-pointer"
                />
              </FormFieldWrapper>

              <div /> {/* spacer */}

              <FormFieldWrapper
                label="Audit Qualifications / Emphasis of Matter"
                error={errors.audit?.audit_info?.audit_qualifications?.message}
                hint="Details of any qualifications or emphasis of matter paragraphs"
                className="md:col-span-2"
              >
                <Textarea
                  {...register('audit.audit_info.audit_qualifications')}
                  placeholder="Describe any audit qualifications or emphasis of matter..."
                  rows={3}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Management Letter Issues"
                error={errors.audit?.audit_info?.management_letter_issues?.message}
                hint="Key issues raised in the latest management letter"
                className="md:col-span-2"
              >
                <Textarea
                  {...register('audit.audit_info.management_letter_issues')}
                  placeholder="Summarise key issues from management letter..."
                  rows={3}
                />
              </FormFieldWrapper>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
