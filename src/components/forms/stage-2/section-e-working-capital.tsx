'use client';

import { UseFormReturn, useFieldArray, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FormFieldWrapper, NativeSelect } from '@/components/forms/form-field';
import { Plus, Trash2 } from 'lucide-react';
import type { Stage2Data } from '@/lib/validations/stage-2';

interface SectionProps {
  form: UseFormReturn<Stage2Data>;
}

const FACILITY_TYPE_OPTIONS = [
  { value: 'term_loan', label: 'Term Loan' },
  { value: 'revolving_credit', label: 'Revolving Credit' },
  { value: 'overdraft', label: 'Overdraft' },
  { value: 'trade_finance', label: 'Trade Finance' },
  { value: 'hire_purchase', label: 'Hire Purchase' },
  { value: 'leasing', label: 'Leasing' },
  { value: 'bond', label: 'Bond' },
  { value: 'other', label: 'Other' },
];

function formatNumber(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '-';
  return val.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function SectionEWorkingCapital({ form }: SectionProps) {
  const { register, watch, control, formState: { errors } } = form;

  const {
    fields: borrowingFields,
    append: appendBorrowing,
    remove: removeBorrowing,
  } = useFieldArray({
    control,
    name: 'working_capital.borrowings',
  });

  // Watch working capital cycle values for auto-calc CCC
  const avgCollectionDays = Number(watch('working_capital.average_collection_days')) || 0;
  const avgInventoryDays = Number(watch('working_capital.average_inventory_days')) || 0;
  const avgPayableDays = Number(watch('working_capital.average_payable_days')) || 0;
  const ccc = avgCollectionDays + avgInventoryDays - avgPayableDays;

  return (
    <div className="space-y-8">
      {/* E1: Receivables Aging */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          E1. Receivables Aging
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Breakdown of trade receivables by aging bucket. All amounts in RM.
        </p>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Aging Bucket</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amount (RM)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-2 font-medium">Current (0-30 days)</td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('working_capital.receivables_aging.current_0_30')}
                    placeholder="0"
                    min={0}
                    className="text-right"
                  />
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2 font-medium">31-60 Days</td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('working_capital.receivables_aging.days_31_60')}
                    placeholder="0"
                    min={0}
                    className="text-right"
                  />
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2 font-medium">61-90 Days</td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('working_capital.receivables_aging.days_61_90')}
                    placeholder="0"
                    min={0}
                    className="text-right"
                  />
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2 font-medium">91-120 Days</td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('working_capital.receivables_aging.days_91_120')}
                    placeholder="0"
                    min={0}
                    className="text-right"
                  />
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2 font-medium">Over 120 Days</td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('working_capital.receivables_aging.over_120_days')}
                    placeholder="0"
                    min={0}
                    className="text-right"
                  />
                </td>
              </tr>
              <tr className="border-b bg-muted/30">
                <td className="px-4 py-2 font-medium text-primary">Total Receivables</td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('working_capital.receivables_aging.total_receivables')}
                    placeholder="0"
                    min={0}
                    className="text-right"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Provision for Doubtful Debts</td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('working_capital.receivables_aging.provision_for_doubtful_debts')}
                    placeholder="0"
                    min={0}
                    className="text-right"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Separator />

      {/* E2: Inventory Breakdown */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          E2. Inventory Breakdown
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Breakdown of inventory by category. All amounts in RM.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Raw Materials"
            error={errors.working_capital?.inventory_breakdown?.raw_materials?.message}
          >
            <Input
              type="number"
              {...register('working_capital.inventory_breakdown.raw_materials')}
              placeholder="0"
              min={0}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Work in Progress"
            error={errors.working_capital?.inventory_breakdown?.work_in_progress?.message}
          >
            <Input
              type="number"
              {...register('working_capital.inventory_breakdown.work_in_progress')}
              placeholder="0"
              min={0}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Finished Goods"
            error={errors.working_capital?.inventory_breakdown?.finished_goods?.message}
          >
            <Input
              type="number"
              {...register('working_capital.inventory_breakdown.finished_goods')}
              placeholder="0"
              min={0}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Consumables"
            error={errors.working_capital?.inventory_breakdown?.consumables?.message}
          >
            <Input
              type="number"
              {...register('working_capital.inventory_breakdown.consumables')}
              placeholder="0"
              min={0}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Total Inventory"
            error={errors.working_capital?.inventory_breakdown?.total_inventory?.message}
          >
            <Input
              type="number"
              {...register('working_capital.inventory_breakdown.total_inventory')}
              placeholder="0"
              min={0}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Obsolete / Slow-Moving Provision"
            error={errors.working_capital?.inventory_breakdown?.obsolete_provision?.message}
          >
            <Input
              type="number"
              {...register('working_capital.inventory_breakdown.obsolete_provision')}
              placeholder="0"
              min={0}
            />
          </FormFieldWrapper>
        </div>
      </section>

      <Separator />

      {/* E3: Borrowing Facilities */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              E3. Borrowing Facilities
            </h3>
            <p className="text-sm text-muted-foreground">
              All existing credit facilities and borrowings.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() =>
              appendBorrowing({
                lender: '',
                facility_type: 'term_loan',
                facility_limit: 0,
                outstanding_amount: 0,
                interest_rate: 0,
                maturity_date: '',
                collateral: '',
                is_secured: true,
              })
            }
          >
            <Plus className="size-4 mr-1" />
            Add Facility
          </Button>
        </div>

        {borrowingFields.length === 0 && (
          <p className="text-sm text-muted-foreground italic py-4 text-center border border-dashed rounded-lg">
            No borrowing facilities added. Click &quot;Add Facility&quot; to add one.
          </p>
        )}

        <div className="space-y-4">
          {borrowingFields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border bg-muted/20 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">
                  Facility {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-destructive hover:text-destructive"
                  onClick={() => removeBorrowing(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <FormFieldWrapper
                  label="Lender"
                  required
                  error={errors.working_capital?.borrowings?.[index]?.lender?.message}
                >
                  <Input
                    {...register(`working_capital.borrowings.${index}.lender`)}
                    placeholder="e.g. Maybank"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Facility Type"
                  required
                  error={errors.working_capital?.borrowings?.[index]?.facility_type?.message}
                >
                  <NativeSelect
                    {...register(`working_capital.borrowings.${index}.facility_type`)}
                    options={FACILITY_TYPE_OPTIONS}
                    placeholder="Select type"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Facility Limit (RM)"
                  required
                  error={errors.working_capital?.borrowings?.[index]?.facility_limit?.message}
                >
                  <Input
                    type="number"
                    {...register(`working_capital.borrowings.${index}.facility_limit`)}
                    placeholder="0"
                    min={0}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Outstanding Amount (RM)"
                  required
                  error={errors.working_capital?.borrowings?.[index]?.outstanding_amount?.message}
                >
                  <Input
                    type="number"
                    {...register(`working_capital.borrowings.${index}.outstanding_amount`)}
                    placeholder="0"
                    min={0}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Interest Rate (%)"
                  required
                  error={errors.working_capital?.borrowings?.[index]?.interest_rate?.message}
                >
                  <Input
                    type="number"
                    {...register(`working_capital.borrowings.${index}.interest_rate`)}
                    placeholder="e.g. 5.5"
                    min={0}
                    step={0.01}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Maturity Date"
                  error={errors.working_capital?.borrowings?.[index]?.maturity_date?.message}
                >
                  <Input
                    type="date"
                    {...register(`working_capital.borrowings.${index}.maturity_date`)}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Collateral"
                  error={errors.working_capital?.borrowings?.[index]?.collateral?.message}
                  className="md:col-span-2"
                >
                  <Input
                    {...register(`working_capital.borrowings.${index}.collateral`)}
                    placeholder="e.g. Factory building, Receivables"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Secured?"
                  error={errors.working_capital?.borrowings?.[index]?.is_secured?.message}
                >
                  <Controller
                    name={`working_capital.borrowings.${index}.is_secured`}
                    control={control}
                    render={({ field: ctrlField }) => (
                      <label className="flex items-center gap-2 text-sm cursor-pointer h-8">
                        <input
                          type="checkbox"
                          checked={ctrlField.value || false}
                          onChange={(e) => ctrlField.onChange(e.target.checked)}
                          className="size-4 rounded border border-input accent-primary cursor-pointer"
                        />
                        Yes, this facility is secured
                      </label>
                    )}
                  />
                </FormFieldWrapper>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* E4: Working Capital Cycle */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          E4. Working Capital Cycle
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Average days for receivables collection, inventory holding, and payables payment.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Average Collection Days"
            error={errors.working_capital?.average_collection_days?.message}
            hint="Days to collect from customers"
          >
            <Input
              type="number"
              {...register('working_capital.average_collection_days')}
              placeholder="e.g. 60"
              min={0}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Average Inventory Days"
            error={errors.working_capital?.average_inventory_days?.message}
            hint="Days inventory is held"
          >
            <Input
              type="number"
              {...register('working_capital.average_inventory_days')}
              placeholder="e.g. 45"
              min={0}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Average Payable Days"
            error={errors.working_capital?.average_payable_days?.message}
            hint="Days to pay suppliers"
          >
            <Input
              type="number"
              {...register('working_capital.average_payable_days')}
              placeholder="e.g. 30"
              min={0}
            />
          </FormFieldWrapper>
        </div>

        {/* Auto-calc: Cash Conversion Cycle */}
        <div className="mt-4 rounded-lg bg-primary/5 border border-primary/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Cash Conversion Cycle (Auto-calculated)
              </p>
              <p className="text-xs text-muted-foreground">
                Collection Days + Inventory Days - Payable Days
              </p>
            </div>
            <span className="text-2xl font-bold text-primary font-mono">
              {avgCollectionDays || avgInventoryDays || avgPayableDays
                ? `${formatNumber(ccc)} days`
                : '-'}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
