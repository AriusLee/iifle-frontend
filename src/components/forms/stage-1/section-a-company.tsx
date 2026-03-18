'use client';

import { UseFormReturn, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { FormFieldWrapper, NativeSelect, MultiCheckboxGroup } from '@/components/forms/form-field';
import type { Stage1Data } from '@/lib/validations/stage-1';

interface SectionProps {
  form: UseFormReturn<Stage1Data>;
}

const COMPANY_TYPE_OPTIONS = [
  { value: 'sdn_bhd', label: 'Sdn Bhd' },
  { value: 'berhad', label: 'Berhad' },
  { value: 'llp', label: 'LLP' },
  { value: 'sole_prop', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
];

const COUNTRY_OPTIONS = [
  { value: 'malaysia', label: 'Malaysia' },
  { value: 'singapore', label: 'Singapore' },
  { value: 'others', label: 'Others' },
];

const INDUSTRY_OPTIONS = [
  { value: 'fnb', label: 'Food & Beverage' },
  { value: 'it', label: 'Information Technology' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'property', label: 'Property & Real Estate' },
  { value: 'services', label: 'Professional Services' },
  { value: 'others', label: 'Others' },
];

const GEOGRAPHIC_OPTIONS = [
  { value: 'local', label: 'Local / City' },
  { value: 'national', label: 'National' },
  { value: 'regional', label: 'Regional (ASEAN / Asia)' },
  { value: 'international', label: 'International' },
];

export function SectionACompany({ form }: SectionProps) {
  const { register, control, watch, formState: { errors } } = form;
  const watchCountry = watch('registration.country_of_incorporation');
  const watchGeoCoverage = watch('scale.geographic_coverage');
  const briefDesc = watch('industry.brief_description') || '';

  return (
    <div className="space-y-8">
      {/* A1: Registration Details */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          A1. Registration Details
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Basic company registration information as per SSM or equivalent authority.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Legal Company Name"
            required
            error={errors.registration?.legal_name?.message}
          >
            <Input
              {...register('registration.legal_name')}
              placeholder="e.g. ABC Holdings Sdn Bhd"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Registration Number"
            required
            error={errors.registration?.registration_number?.message}
            hint="SSM / ROC / ROB number"
          >
            <Input
              {...register('registration.registration_number')}
              placeholder="e.g. 202301012345"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Date of Incorporation"
            required
            error={errors.registration?.date_of_incorporation?.message}
          >
            <Input
              type="date"
              {...register('registration.date_of_incorporation')}
              className="cursor-pointer"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Company Type"
            required
            error={errors.registration?.company_type?.message}
          >
            <NativeSelect
              {...register('registration.company_type')}
              options={COMPANY_TYPE_OPTIONS}
              placeholder="Select company type"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Country of Incorporation"
            required
            error={errors.registration?.country_of_incorporation?.message}
          >
            <NativeSelect
              {...register('registration.country_of_incorporation')}
              options={COUNTRY_OPTIONS}
              placeholder="Select country"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Website"
            error={errors.registration?.website?.message}
          >
            <Input
              {...register('registration.website')}
              placeholder="https://www.example.com"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Registered Address"
            required
            error={errors.registration?.registered_address?.message}
            className="md:col-span-2"
          >
            <Textarea
              {...register('registration.registered_address')}
              placeholder="Full registered address"
              rows={2}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Operating Address"
            hint="Leave blank if same as registered address"
            error={errors.registration?.operating_address?.message}
            className="md:col-span-2"
          >
            <Textarea
              {...register('registration.operating_address')}
              placeholder="Full operating address (if different)"
              rows={2}
            />
          </FormFieldWrapper>

          {watchCountry === 'others' && (
            <FormFieldWrapper
              label="Other Jurisdictions"
              hint="Comma-separated list of jurisdictions"
              className="md:col-span-2"
            >
              <Input
                {...register('registration.other_jurisdictions')}
                placeholder="e.g. Hong Kong, Cayman Islands"
              />
            </FormFieldWrapper>
          )}
        </div>
      </section>

      <Separator />

      {/* A2: Industry Classification */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          A2. Industry Classification
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          How your business is classified by industry and sector.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Primary Industry"
            required
            error={errors.industry?.primary_industry?.message}
          >
            <NativeSelect
              {...register('industry.primary_industry')}
              options={INDUSTRY_OPTIONS}
              placeholder="Select industry"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Sub-Industry / Sector"
            required
            error={errors.industry?.sub_industry?.message}
          >
            <Input
              {...register('industry.sub_industry')}
              placeholder="e.g. Cloud SaaS, Halal Food Manufacturing"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="MSIC Code"
            hint="Malaysian Standard Industrial Classification code (optional)"
            error={errors.industry?.msic_code?.message}
          >
            <Input
              {...register('industry.msic_code')}
              placeholder="e.g. 62011"
            />
          </FormFieldWrapper>

          <div /> {/* spacer */}

          <FormFieldWrapper
            label="Brief Business Description"
            required
            error={errors.industry?.brief_description?.message}
            className="md:col-span-2"
          >
            <Textarea
              {...register('industry.brief_description')}
              placeholder="Describe what your company does in 1-3 sentences"
              rows={3}
              maxLength={500}
            />
            <div className="flex justify-end">
              <span className={`text-xs ${briefDesc.length > 450 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {briefDesc.length}/500
              </span>
            </div>
          </FormFieldWrapper>
        </div>
      </section>

      <Separator />

      {/* A3: Company Scale */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          A3. Company Scale
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Current size and reach of your operations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Total Employees"
            required
            error={errors.scale?.total_employees?.message}
          >
            <Input
              type="number"
              {...register('scale.total_employees')}
              placeholder="e.g. 50"
              min={1}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Number of Branches / Outlets"
            error={errors.scale?.num_branches?.message}
          >
            <Input
              type="number"
              {...register('scale.num_branches')}
              placeholder="e.g. 3"
              min={0}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Operating Since (Year)"
            required
            error={errors.scale?.operating_since?.message}
          >
            <Input
              type="number"
              {...register('scale.operating_since')}
              placeholder="e.g. 2015"
              min={1900}
              max={new Date().getFullYear()}
            />
          </FormFieldWrapper>

          <div /> {/* spacer */}

          <FormFieldWrapper
            label="Geographic Coverage"
            required
            error={errors.scale?.geographic_coverage?.message}
            className="md:col-span-2"
          >
            <Controller
              name="scale.geographic_coverage"
              control={control}
              render={({ field }) => (
                <MultiCheckboxGroup
                  options={GEOGRAPHIC_OPTIONS}
                  value={field.value || []}
                  onChange={field.onChange}
                  columns={4}
                />
              )}
            />
          </FormFieldWrapper>

          {(watchGeoCoverage?.includes('regional') || watchGeoCoverage?.includes('international')) && (
            <FormFieldWrapper
              label="Countries of Operation"
              hint="Comma-separated list of countries"
              className="md:col-span-2"
            >
              <Input
                {...register('scale.countries_of_operation')}
                placeholder="e.g. Singapore, Thailand, Indonesia"
              />
            </FormFieldWrapper>
          )}
        </div>
      </section>
    </div>
  );
}
