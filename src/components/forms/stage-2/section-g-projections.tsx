'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FormFieldWrapper, NativeSelect } from '@/components/forms/form-field';
import { Plus, Trash2 } from 'lucide-react';
import type { Stage2Data } from '@/lib/validations/stage-2';

interface SectionProps {
  form: UseFormReturn<Stage2Data>;
}

const CAPEX_CATEGORY_OPTIONS = [
  { value: 'property', label: 'Property' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'technology', label: 'Technology' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'renovation', label: 'Renovation' },
  { value: 'other', label: 'Other' },
];

const FUNDING_SOURCE_OPTIONS = [
  { value: 'internal_cash', label: 'Internal Cash' },
  { value: 'bank_loan', label: 'Bank Loan' },
  { value: 'equity', label: 'Equity' },
  { value: 'lease', label: 'Lease' },
  { value: 'other', label: 'Other' },
];

const METHODOLOGY_OPTIONS = [
  { value: '', label: 'Select methodology' },
  { value: 'bottom_up', label: 'Bottom-Up' },
  { value: 'top_down', label: 'Top-Down' },
  { value: 'hybrid', label: 'Hybrid' },
];

export function SectionGProjections({ form }: SectionProps) {
  const { register, control, formState: { errors } } = form;

  const {
    fields: projectionFields,
    append: appendProjection,
    remove: removeProjection,
  } = useFieldArray({
    control,
    name: 'projections.projections',
  });

  const {
    fields: capexFields,
    append: appendCapex,
    remove: removeCapex,
  } = useFieldArray({
    control,
    name: 'projections.capex_plans',
  });

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-8">
      {/* G1: Current Year Budget */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          G1. Current Year Budget
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Budget figures for the current financial year. All amounts in RM.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Budget Revenue (RM)"
            error={errors.projections?.current_year_budget_revenue?.message}
          >
            <Input
              type="number"
              {...register('projections.current_year_budget_revenue')}
              placeholder="0"
              min={0}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Budget PAT (RM)"
            error={errors.projections?.current_year_budget_pat?.message}
          >
            <Input
              type="number"
              {...register('projections.current_year_budget_pat')}
              placeholder="0"
            />
          </FormFieldWrapper>
        </div>
      </section>

      <Separator />

      {/* G2: 5-Year Projections */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              G2. 5-Year Projections
            </h3>
            <p className="text-sm text-muted-foreground">
              Financial projections for each year. All amounts in RM.
            </p>
          </div>
          {projectionFields.length < 5 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() =>
                appendProjection({
                  year: currentYear + projectionFields.length + 1,
                  projected_revenue: 0,
                  projected_cogs: undefined,
                  projected_gross_profit: undefined,
                  projected_operating_expenses: undefined,
                  projected_ebitda: undefined,
                  projected_pat: undefined,
                  projected_capex: undefined,
                  projected_headcount: undefined,
                  key_assumptions: '',
                })
              }
            >
              <Plus className="size-4 mr-1" />
              Add Year
            </Button>
          )}
        </div>

        {projectionFields.length === 0 && (
          <p className="text-sm text-muted-foreground italic py-4 text-center border border-dashed rounded-lg">
            No projections added. Click &quot;Add Year&quot; to add a year.
          </p>
        )}

        <div className="space-y-4">
          {projectionFields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border bg-muted/20 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">
                  Year {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-destructive hover:text-destructive"
                  onClick={() => removeProjection(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <FormFieldWrapper
                  label="Year"
                  required
                  error={errors.projections?.projections?.[index]?.year?.message}
                >
                  <Input
                    type="number"
                    {...register(`projections.projections.${index}.year`)}
                    placeholder={String(currentYear + index + 1)}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Projected Revenue (RM)"
                  required
                  error={errors.projections?.projections?.[index]?.projected_revenue?.message}
                >
                  <Input
                    type="number"
                    {...register(`projections.projections.${index}.projected_revenue`)}
                    placeholder="0"
                    min={0}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Projected COGS (RM)"
                  error={errors.projections?.projections?.[index]?.projected_cogs?.message}
                >
                  <Input
                    type="number"
                    {...register(`projections.projections.${index}.projected_cogs`)}
                    placeholder="0"
                    min={0}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Projected PAT (RM)"
                  error={errors.projections?.projections?.[index]?.projected_pat?.message}
                >
                  <Input
                    type="number"
                    {...register(`projections.projections.${index}.projected_pat`)}
                    placeholder="0"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Projected Capex (RM)"
                  error={errors.projections?.projections?.[index]?.projected_capex?.message}
                >
                  <Input
                    type="number"
                    {...register(`projections.projections.${index}.projected_capex`)}
                    placeholder="0"
                    min={0}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Projected Headcount"
                  error={errors.projections?.projections?.[index]?.projected_headcount?.message}
                >
                  <Input
                    type="number"
                    {...register(`projections.projections.${index}.projected_headcount`)}
                    placeholder="0"
                    min={0}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Key Assumptions"
                  error={errors.projections?.projections?.[index]?.key_assumptions?.message}
                  className="md:col-span-2 lg:col-span-3"
                >
                  <Textarea
                    {...register(`projections.projections.${index}.key_assumptions`)}
                    placeholder="Describe key assumptions for this year's projections..."
                    rows={2}
                  />
                </FormFieldWrapper>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* G3: Capex Plans */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              G3. Capex Plans
            </h3>
            <p className="text-sm text-muted-foreground">
              Planned capital expenditure items.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() =>
              appendCapex({
                description: '',
                amount: 0,
                year: currentYear + 1,
                category: 'equipment',
                funding_source: 'internal_cash',
              })
            }
          >
            <Plus className="size-4 mr-1" />
            Add Capex Item
          </Button>
        </div>

        {capexFields.length === 0 && (
          <p className="text-sm text-muted-foreground italic py-4 text-center border border-dashed rounded-lg">
            No capex plans added. Click &quot;Add Capex Item&quot; to add one.
          </p>
        )}

        <div className="space-y-4">
          {capexFields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border bg-muted/20 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">
                  Capex Item {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-destructive hover:text-destructive"
                  onClick={() => removeCapex(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <FormFieldWrapper
                  label="Description"
                  required
                  error={errors.projections?.capex_plans?.[index]?.description?.message}
                  className="md:col-span-2 lg:col-span-3"
                >
                  <Input
                    {...register(`projections.capex_plans.${index}.description`)}
                    placeholder="e.g. New production line"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Amount (RM)"
                  required
                  error={errors.projections?.capex_plans?.[index]?.amount?.message}
                >
                  <Input
                    type="number"
                    {...register(`projections.capex_plans.${index}.amount`)}
                    placeholder="0"
                    min={0}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Year"
                  required
                  error={errors.projections?.capex_plans?.[index]?.year?.message}
                >
                  <Input
                    type="number"
                    {...register(`projections.capex_plans.${index}.year`)}
                    placeholder={String(currentYear + 1)}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Category"
                  required
                  error={errors.projections?.capex_plans?.[index]?.category?.message}
                >
                  <NativeSelect
                    {...register(`projections.capex_plans.${index}.category`)}
                    options={CAPEX_CATEGORY_OPTIONS}
                    placeholder="Select category"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Funding Source"
                  required
                  error={errors.projections?.capex_plans?.[index]?.funding_source?.message}
                >
                  <NativeSelect
                    {...register(`projections.capex_plans.${index}.funding_source`)}
                    options={FUNDING_SOURCE_OPTIONS}
                    placeholder="Select source"
                  />
                </FormFieldWrapper>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* G4: Methodology & Drivers */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          G4. Projection Methodology
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Approach used and key factors driving the projections.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Projection Methodology"
            error={errors.projections?.projection_methodology?.message}
          >
            <NativeSelect
              {...register('projections.projection_methodology')}
              options={METHODOLOGY_OPTIONS}
            />
          </FormFieldWrapper>

          <div /> {/* spacer */}

          <FormFieldWrapper
            label="Key Growth Drivers"
            error={errors.projections?.key_growth_drivers?.message}
            hint="Comma-separated list of growth drivers"
            className="md:col-span-2"
          >
            <Input
              {...register('projections.key_growth_drivers')}
              placeholder="e.g. New markets, Product expansion, Price increases"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Key Risks"
            error={errors.projections?.key_risks?.message}
            hint="Comma-separated list of key risks"
            className="md:col-span-2"
          >
            <Input
              {...register('projections.key_risks')}
              placeholder="e.g. Competition, Regulatory changes, Raw material costs"
            />
          </FormFieldWrapper>
        </div>
      </section>
    </div>
  );
}
