'use client';

import { UseFormReturn, useFieldArray, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FormFieldWrapper, NativeSelect, MultiCheckboxGroup } from '@/components/forms/form-field';
import { Plus, Trash2 } from 'lucide-react';
import type { Stage2Data } from '@/lib/validations/stage-2';

interface SectionProps {
  form: UseFormReturn<Stage2Data>;
}

const INSTRUMENT_TYPE_OPTIONS = [
  { value: 'ordinary_shares', label: 'Ordinary Shares' },
  { value: 'preference_shares', label: 'Preference Shares' },
  { value: 'convertible_note', label: 'Convertible Note' },
  { value: 'safe', label: 'SAFE' },
  { value: 'rcps', label: 'RCPS' },
  { value: 'other', label: 'Other' },
];

const INVESTOR_TYPE_OPTIONS = [
  { value: 'angel', label: 'Angel' },
  { value: 'vc', label: 'Venture Capital' },
  { value: 'pe', label: 'Private Equity' },
  { value: 'strategic', label: 'Strategic' },
  { value: 'government', label: 'Government' },
  { value: 'family_office', label: 'Family Office' },
  { value: 'other', label: 'Other' },
];

const SHAREHOLDER_TYPE_OPTIONS = [
  { value: 'founder', label: 'Founder' },
  { value: 'co_founder', label: 'Co-Founder' },
  { value: 'investor', label: 'Investor' },
  { value: 'employee', label: 'Employee' },
  { value: 'family', label: 'Family' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'other', label: 'Other' },
];

function formatPct(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val) || !isFinite(val)) return '-';
  return `${val.toFixed(1)}%`;
}

export function SectionHFunding({ form }: SectionProps) {
  const { register, watch, control, formState: { errors } } = form;

  const {
    fields: roundFields,
    append: appendRound,
    remove: removeRound,
  } = useFieldArray({
    control,
    name: 'funding.funding_rounds',
  });

  const {
    fields: shareholderFields,
    append: appendShareholder,
    remove: removeShareholder,
  } = useFieldArray({
    control,
    name: 'funding.current_shareholders',
  });

  const watchEsos = watch('funding.has_esos_plan');
  const watchConvertible = watch('funding.has_convertible_instruments');

  // Auto-calc total ownership %
  const shareholders = watch('funding.current_shareholders') || [];
  const totalOwnership = shareholders.reduce(
    (sum, s) => sum + (Number(s?.ownership_pct) || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* H1: Funding Rounds */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              H1. Funding Rounds
            </h3>
            <p className="text-sm text-muted-foreground">
              Historical funding rounds and capital raises.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() =>
              appendRound({
                round_name: '',
                date: '',
                amount_raised: 0,
                currency: 'MYR',
                investor_names: [],
                investor_types: [],
                pre_money_valuation: undefined,
                post_money_valuation: undefined,
                equity_given_pct: undefined,
                instrument_type: 'ordinary_shares',
              })
            }
          >
            <Plus className="size-4 mr-1" />
            Add Round
          </Button>
        </div>

        {roundFields.length === 0 && (
          <p className="text-sm text-muted-foreground italic py-4 text-center border border-dashed rounded-lg">
            No funding rounds added. Click &quot;Add Round&quot; to add one.
          </p>
        )}

        <div className="space-y-4">
          {roundFields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border bg-muted/20 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">
                  Round {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-destructive hover:text-destructive"
                  onClick={() => removeRound(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <FormFieldWrapper
                  label="Round Name"
                  required
                  error={errors.funding?.funding_rounds?.[index]?.round_name?.message}
                >
                  <Input
                    {...register(`funding.funding_rounds.${index}.round_name`)}
                    placeholder="e.g. Seed, Series A"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Date"
                  error={errors.funding?.funding_rounds?.[index]?.date?.message}
                >
                  <Input
                    type="date"
                    {...register(`funding.funding_rounds.${index}.date`)}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Amount Raised (RM)"
                  required
                  error={errors.funding?.funding_rounds?.[index]?.amount_raised?.message}
                >
                  <Input
                    type="number"
                    {...register(`funding.funding_rounds.${index}.amount_raised`)}
                    placeholder="0"
                    min={0}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Investor Names"
                  error={errors.funding?.funding_rounds?.[index]?.investor_names?.message}
                  hint="Comma-separated list of investor names"
                  className="md:col-span-2"
                >
                  <Input
                    {...register(`funding.funding_rounds.${index}.investor_names`)}
                    placeholder="e.g. ABC Capital, XYZ Ventures"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Instrument Type"
                  error={errors.funding?.funding_rounds?.[index]?.instrument_type?.message}
                >
                  <NativeSelect
                    {...register(`funding.funding_rounds.${index}.instrument_type`)}
                    options={INSTRUMENT_TYPE_OPTIONS}
                    placeholder="Select type"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Investor Types"
                  error={errors.funding?.funding_rounds?.[index]?.investor_types?.message}
                  className="md:col-span-2 lg:col-span-3"
                >
                  <Controller
                    name={`funding.funding_rounds.${index}.investor_types`}
                    control={control}
                    render={({ field: ctrlField }) => (
                      <MultiCheckboxGroup
                        options={INVESTOR_TYPE_OPTIONS}
                        value={(ctrlField.value as string[]) || []}
                        onChange={ctrlField.onChange}
                        columns={4}
                      />
                    )}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Pre-Money Valuation (RM)"
                  error={errors.funding?.funding_rounds?.[index]?.pre_money_valuation?.message}
                >
                  <Input
                    type="number"
                    {...register(`funding.funding_rounds.${index}.pre_money_valuation`)}
                    placeholder="0"
                    min={0}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Post-Money Valuation (RM)"
                  error={errors.funding?.funding_rounds?.[index]?.post_money_valuation?.message}
                >
                  <Input
                    type="number"
                    {...register(`funding.funding_rounds.${index}.post_money_valuation`)}
                    placeholder="0"
                    min={0}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Equity Given %"
                  error={errors.funding?.funding_rounds?.[index]?.equity_given_pct?.message}
                >
                  <Input
                    type="number"
                    {...register(`funding.funding_rounds.${index}.equity_given_pct`)}
                    placeholder="e.g. 20"
                    min={0}
                    max={100}
                    step={0.1}
                  />
                </FormFieldWrapper>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* H2: Total Raised */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          H2. Total Capital Raised
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Cumulative total across all rounds.
        </p>

        <div className="max-w-md">
          <FormFieldWrapper
            label="Total Raised to Date (RM)"
            error={errors.funding?.total_raised_to_date?.message}
          >
            <Input
              type="number"
              {...register('funding.total_raised_to_date')}
              placeholder="0"
              min={0}
            />
          </FormFieldWrapper>
        </div>
      </section>

      <Separator />

      {/* H3: Current Shareholders */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              H3. Current Shareholders
            </h3>
            <p className="text-sm text-muted-foreground">
              Current shareholder register.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() =>
              appendShareholder({
                name: '',
                type: 'founder',
                shares_held: undefined,
                ownership_pct: 0,
                is_director: false,
                nationality: '',
              })
            }
          >
            <Plus className="size-4 mr-1" />
            Add Shareholder
          </Button>
        </div>

        {shareholderFields.length === 0 && (
          <p className="text-sm text-muted-foreground italic py-4 text-center border border-dashed rounded-lg">
            No shareholders added. Click &quot;Add Shareholder&quot; to add one.
          </p>
        )}

        {shareholderFields.length > 0 && (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ownership %</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Director?</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nationality</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground w-12" />
                </tr>
              </thead>
              <tbody>
                {shareholderFields.map((field, index) => (
                  <tr key={field.id} className="border-b">
                    <td className="px-4 py-2">
                      <Input
                        {...register(`funding.current_shareholders.${index}.name`)}
                        placeholder="Name"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <NativeSelect
                        {...register(`funding.current_shareholders.${index}.type`)}
                        options={SHAREHOLDER_TYPE_OPTIONS}
                        placeholder="Select"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        {...register(`funding.current_shareholders.${index}.ownership_pct`)}
                        placeholder="0"
                        min={0}
                        max={100}
                        step={0.1}
                        className="text-right"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Controller
                        name={`funding.current_shareholders.${index}.is_director`}
                        control={control}
                        render={({ field: ctrlField }) => (
                          <input
                            type="checkbox"
                            checked={ctrlField.value || false}
                            onChange={(e) => ctrlField.onChange(e.target.checked)}
                            className="size-4 rounded border border-input accent-primary cursor-pointer"
                          />
                        )}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        {...register(`funding.current_shareholders.${index}.nationality`)}
                        placeholder="e.g. Malaysian"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="cursor-pointer text-destructive hover:text-destructive"
                        onClick={() => removeShareholder(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/30">
                  <td className="px-4 py-2 font-medium text-primary" colSpan={2}>
                    Total Ownership
                    <span className="ml-1 text-xs text-muted-foreground font-normal">(auto)</span>
                  </td>
                  <td className="px-4 py-2 text-right font-mono font-bold text-primary">
                    {formatPct(totalOwnership)}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      <Separator />

      {/* H4: Equity Details */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          H4. Equity Structure
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Share capital and governance details.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Total Shares Issued"
            error={errors.funding?.total_shares_issued?.message}
          >
            <Input
              type="number"
              {...register('funding.total_shares_issued')}
              placeholder="e.g. 1000000"
              min={0}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Paid-up Capital (RM)"
            error={errors.funding?.paid_up_capital?.message}
          >
            <Input
              type="number"
              {...register('funding.paid_up_capital')}
              placeholder="0"
              min={0}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Has Shareholder Agreement?"
            error={errors.funding?.has_shareholder_agreement?.message}
          >
            <Controller
              name="funding.has_shareholder_agreement"
              control={control}
              render={({ field: ctrlField }) => (
                <label className="flex items-center gap-2 text-sm cursor-pointer h-8">
                  <input
                    type="checkbox"
                    checked={ctrlField.value || false}
                    onChange={(e) => ctrlField.onChange(e.target.checked)}
                    className="size-4 rounded border border-input accent-primary cursor-pointer"
                  />
                  Yes, a shareholder agreement is in place
                </label>
              )}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Has ESOS / ESOP Plan?"
            error={errors.funding?.has_esos_plan?.message}
          >
            <Controller
              name="funding.has_esos_plan"
              control={control}
              render={({ field: ctrlField }) => (
                <label className="flex items-center gap-2 text-sm cursor-pointer h-8">
                  <input
                    type="checkbox"
                    checked={ctrlField.value || false}
                    onChange={(e) => ctrlField.onChange(e.target.checked)}
                    className="size-4 rounded border border-input accent-primary cursor-pointer"
                  />
                  Yes, an ESOS / ESOP plan exists
                </label>
              )}
            />
          </FormFieldWrapper>

          {watchEsos && (
            <FormFieldWrapper
              label="ESOS Pool %"
              error={errors.funding?.esos_pool_pct?.message}
              hint="Percentage of shares reserved for ESOS"
            >
              <Input
                type="number"
                {...register('funding.esos_pool_pct')}
                placeholder="e.g. 10"
                min={0}
                max={100}
                step={0.1}
              />
            </FormFieldWrapper>
          )}

          <FormFieldWrapper
            label="Has Convertible Instruments?"
            error={errors.funding?.has_convertible_instruments?.message}
          >
            <Controller
              name="funding.has_convertible_instruments"
              control={control}
              render={({ field: ctrlField }) => (
                <label className="flex items-center gap-2 text-sm cursor-pointer h-8">
                  <input
                    type="checkbox"
                    checked={ctrlField.value || false}
                    onChange={(e) => ctrlField.onChange(e.target.checked)}
                    className="size-4 rounded border border-input accent-primary cursor-pointer"
                  />
                  Yes, convertible instruments exist
                </label>
              )}
            />
          </FormFieldWrapper>

          {watchConvertible && (
            <FormFieldWrapper
              label="Convertible Instrument Details"
              error={errors.funding?.convertible_details?.message}
              className="md:col-span-2"
            >
              <Input
                {...register('funding.convertible_details')}
                placeholder="e.g. RM 2M convertible note, 20% discount, 12-month maturity"
              />
            </FormFieldWrapper>
          )}
        </div>
      </section>
    </div>
  );
}
