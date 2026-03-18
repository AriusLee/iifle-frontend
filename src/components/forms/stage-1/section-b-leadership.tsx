'use client';

import { UseFormReturn, useFieldArray, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FormFieldWrapper, NativeSelect } from '@/components/forms/form-field';
import { Plus, Trash2 } from 'lucide-react';
import type { Stage1Data } from '@/lib/validations/stage-1';

interface SectionProps {
  form: UseFormReturn<Stage1Data>;
}

const EDUCATION_OPTIONS = [
  { value: 'secondary', label: 'Secondary School' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'degree', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'phd', label: 'PhD / Doctorate' },
  { value: 'professional', label: 'Professional Qualification' },
  { value: 'emba', label: 'Executive MBA' },
];

const EXIT_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'sold', label: 'Sold a company' },
  { value: 'listed', label: 'Listed a company (IPO)' },
  { value: 'both', label: 'Both sold and listed' },
];

const EMBA_STATUS_OPTIONS = [
  { value: 'none', label: 'Not enrolled' },
  { value: 'in_progress', label: 'Currently enrolled' },
  { value: 'completed', label: 'Completed' },
];

const SUCCESSION_OPTIONS = [
  { value: 'yes', label: 'Yes, documented' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'no', label: 'No' },
];

const STABILITY_OPTIONS = [
  { value: 'yes', label: 'Yes, stable' },
  { value: 'mostly', label: 'Mostly stable' },
  { value: 'no', label: 'Significant changes' },
];

const MANAGEMENT_POSITIONS = ['CEO / Managing Director', 'CFO / Finance Director', 'COO / Operations Director', 'CTO / Technology Director', 'Sales & Marketing Director', 'HR Director'];

export function SectionBLeadership({ form }: SectionProps) {
  const { register, control, watch, formState: { errors } } = form;
  const watchEmbaStatus = watch('founder.emba_status');
  const contingencyText = watch('succession.key_person_contingency') || '';

  const {
    fields: coFounderFields,
    append: appendCoFounder,
    remove: removeCoFounder,
  } = useFieldArray({
    control,
    name: 'co_founders',
  });

  return (
    <div className="space-y-8">
      {/* B1: Founder Profile */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          B1. Founder Profile
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Details about the primary founder or controlling shareholder.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Full Name"
            required
            error={errors.founder?.name?.message}
          >
            <Input
              {...register('founder.name')}
              placeholder="Full legal name"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Age"
            required
            error={errors.founder?.age?.message}
          >
            <Input
              type="number"
              {...register('founder.age')}
              placeholder="e.g. 42"
              min={18}
              max={100}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Nationality"
            required
            error={errors.founder?.nationality?.message}
          >
            <Input
              {...register('founder.nationality')}
              placeholder="e.g. Malaysian"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Highest Education"
            required
            error={errors.founder?.highest_education?.message}
          >
            <NativeSelect
              {...register('founder.highest_education')}
              options={EDUCATION_OPTIONS}
              placeholder="Select education level"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Education Institution"
            error={errors.founder?.education_institution?.message}
          >
            <Input
              {...register('founder.education_institution')}
              placeholder="e.g. Universiti Malaya"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Years in Industry"
            required
            error={errors.founder?.years_in_industry?.message}
          >
            <Input
              type="number"
              {...register('founder.years_in_industry')}
              placeholder="e.g. 15"
              min={0}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Years of Business Experience"
            required
            error={errors.founder?.years_business_experience?.message}
          >
            <Input
              type="number"
              {...register('founder.years_business_experience')}
              placeholder="e.g. 10"
              min={0}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Previous Companies Founded"
            error={errors.founder?.previous_companies_founded?.message}
          >
            <Input
              type="number"
              {...register('founder.previous_companies_founded')}
              placeholder="0"
              min={0}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Previous Exit Experience"
            error={errors.founder?.previous_exit_experience?.message}
          >
            <NativeSelect
              {...register('founder.previous_exit_experience')}
              options={EXIT_OPTIONS}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="EMBA Status"
            error={errors.founder?.emba_status?.message}
          >
            <NativeSelect
              {...register('founder.emba_status')}
              options={EMBA_STATUS_OPTIONS}
            />
          </FormFieldWrapper>

          {(watchEmbaStatus === 'in_progress' || watchEmbaStatus === 'completed') && (
            <FormFieldWrapper
              label="EMBA Program"
              error={errors.founder?.emba_program?.message}
            >
              <Input
                {...register('founder.emba_program')}
                placeholder="e.g. IIFLE Executive MBA"
              />
            </FormFieldWrapper>
          )}
        </div>
      </section>

      <Separator />

      {/* B2: Co-Founders */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              B2. Co-Founders / Key Shareholders
            </h3>
            <p className="text-sm text-muted-foreground">
              Other founders or significant shareholders (up to 5).
            </p>
          </div>
          {coFounderFields.length < 5 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() =>
                appendCoFounder({
                  name: '',
                  role: '',
                  ownership_pct: 0,
                  years_with_company: 0,
                  expertise: '',
                })
              }
            >
              <Plus className="size-4 mr-1" />
              Add Co-Founder
            </Button>
          )}
        </div>

        {coFounderFields.length === 0 && (
          <p className="text-sm text-muted-foreground italic py-4 text-center border border-dashed rounded-lg">
            No co-founders added. Click &quot;Add Co-Founder&quot; to add one.
          </p>
        )}

        <div className="space-y-4">
          {coFounderFields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border bg-muted/20 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">
                  Co-Founder {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-destructive hover:text-destructive"
                  onClick={() => removeCoFounder(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <FormFieldWrapper
                  label="Name"
                  required
                  error={errors.co_founders?.[index]?.name?.message}
                >
                  <Input
                    {...register(`co_founders.${index}.name`)}
                    placeholder="Full name"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Role / Title"
                  required
                  error={errors.co_founders?.[index]?.role?.message}
                >
                  <Input
                    {...register(`co_founders.${index}.role`)}
                    placeholder="e.g. Executive Director"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Ownership %"
                  required
                  error={errors.co_founders?.[index]?.ownership_pct?.message}
                >
                  <Input
                    type="number"
                    {...register(`co_founders.${index}.ownership_pct`)}
                    placeholder="e.g. 25"
                    min={0}
                    max={100}
                    step={0.1}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Years with Company"
                  error={errors.co_founders?.[index]?.years_with_company?.message}
                >
                  <Input
                    type="number"
                    {...register(`co_founders.${index}.years_with_company`)}
                    placeholder="e.g. 5"
                    min={0}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Area of Expertise"
                  required
                  error={errors.co_founders?.[index]?.expertise?.message}
                  className="md:col-span-2"
                >
                  <Input
                    {...register(`co_founders.${index}.expertise`)}
                    placeholder="e.g. Operations, Finance, Technology"
                  />
                </FormFieldWrapper>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* B3: Management Team */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          B3. Management Team
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Key management positions. Fill in what applies to your company.
        </p>

        <div className="space-y-3">
          {MANAGEMENT_POSITIONS.map((position, index) => (
            <div key={position} className="rounded-lg border p-4">
              <h4 className="text-sm font-medium text-foreground mb-3">
                {position}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-3">
                <FormFieldWrapper label="Name">
                  <Input
                    {...register(`management_team.${index}.name`)}
                    placeholder="Name"
                  />
                  <input
                    type="hidden"
                    {...register(`management_team.${index}.position`)}
                    value={position}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper label="Years in Role">
                  <Input
                    type="number"
                    {...register(`management_team.${index}.years_in_role`)}
                    placeholder="0"
                    min={0}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper label="Years with Company">
                  <Input
                    type="number"
                    {...register(`management_team.${index}.years_with_company`)}
                    placeholder="0"
                    min={0}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper label="Background">
                  <Input
                    {...register(`management_team.${index}.background`)}
                    placeholder="Brief background"
                  />
                </FormFieldWrapper>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* B4: Succession Planning */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          B4. Succession & Key Person Risk
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Planning for leadership continuity and risk mitigation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Has Succession Plan?"
            required
            error={errors.succession?.has_succession_plan?.message}
          >
            <NativeSelect
              {...register('succession.has_succession_plan')}
              options={SUCCESSION_OPTIONS}
              placeholder="Select"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Management Stable (3 Years)?"
            required
            error={errors.succession?.management_stable_3yr?.message}
          >
            <NativeSelect
              {...register('succession.management_stable_3yr')}
              options={STABILITY_OPTIONS}
              placeholder="Select"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Key Person (Most Critical)"
            required
            error={errors.succession?.key_person?.message}
          >
            <Input
              {...register('succession.key_person')}
              placeholder="e.g. Founder / CEO"
            />
          </FormFieldWrapper>

          <div /> {/* spacer */}

          <FormFieldWrapper
            label="Key Person Contingency Plan"
            required
            error={errors.succession?.key_person_contingency?.message}
            className="md:col-span-2"
          >
            <Textarea
              {...register('succession.key_person_contingency')}
              placeholder="What happens if this person is unavailable for an extended period?"
              rows={3}
              maxLength={300}
            />
            <div className="flex justify-end">
              <span className={`text-xs ${contingencyText.length > 270 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {contingencyText.length}/300
              </span>
            </div>
          </FormFieldWrapper>
        </div>
      </section>
    </div>
  );
}
