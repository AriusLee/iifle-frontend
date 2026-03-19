'use client';

import { UseFormReturn, useFieldArray, Controller } from 'react-hook-form';
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

const RELATIONSHIP_OPTIONS = [
  { value: 'director', label: 'Director' },
  { value: 'shareholder', label: 'Shareholder' },
  { value: 'family_member', label: 'Family Member' },
  { value: 'subsidiary', label: 'Subsidiary' },
  { value: 'associate', label: 'Associate' },
  { value: 'common_director', label: 'Common Director' },
  { value: 'other', label: 'Other' },
];

const TRANSACTION_TYPE_OPTIONS = [
  { value: 'sales', label: 'Sales' },
  { value: 'purchases', label: 'Purchases' },
  { value: 'management_fee', label: 'Management Fee' },
  { value: 'rental', label: 'Rental' },
  { value: 'loan', label: 'Loan' },
  { value: 'guarantee', label: 'Guarantee' },
  { value: 'service', label: 'Service' },
  { value: 'other', label: 'Other' },
];

const ARMS_LENGTH_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Unknown' },
];

const DOCUMENTATION_OPTIONS = [
  { value: 'formal_agreement', label: 'Formal Agreement' },
  { value: 'informal', label: 'Informal' },
  { value: 'none', label: 'None' },
];

function formatNumber(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '-';
  return val.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatPct(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val) || !isFinite(val)) return '-';
  return `${val.toFixed(1)}%`;
}

export function SectionIRpt({ form }: SectionProps) {
  const { register, watch, control, formState: { errors } } = form;

  const watchHasRpt = watch('related_party.has_related_party_transactions');

  const {
    fields: transactionFields,
    append: appendTransaction,
    remove: removeTransaction,
  } = useFieldArray({
    control,
    name: 'related_party.transactions',
  });

  // Auto-calc total RPT amount
  const transactions = watch('related_party.transactions') || [];
  const totalRptAmount = transactions.reduce(
    (sum, t) => sum + (Number(t?.amount) || 0),
    0
  );

  // Try to get revenue for auto-calc RPT as % of revenue
  // Revenue could be from income_statement year_t0
  const latestRevenue = Number(watch('income_statement.year_t0.total_revenue')) || 0;
  const rptPctOfRevenue =
    latestRevenue > 0 && totalRptAmount > 0
      ? (totalRptAmount / latestRevenue) * 100
      : undefined;

  return (
    <div className="space-y-8">
      {/* I1: Has Related Party Transactions */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          I1. Related Party Transactions
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Transactions between the company and its related parties (directors, shareholders, family members, etc.).
        </p>

        <FormFieldWrapper
          label="Has Related Party Transactions?"
          error={errors.related_party?.has_related_party_transactions?.message}
        >
          <Controller
            name="related_party.has_related_party_transactions"
            control={control}
            render={({ field: ctrlField }) => (
              <label className="flex items-center gap-2 text-sm cursor-pointer h-8">
                <input
                  type="checkbox"
                  checked={ctrlField.value || false}
                  onChange={(e) => ctrlField.onChange(e.target.checked)}
                  className="size-4 rounded border border-input accent-primary cursor-pointer"
                />
                Yes, the company has related party transactions
              </label>
            )}
          />
        </FormFieldWrapper>
      </section>

      {/* I2: Transactions (shown only if has_related_party_transactions is true) */}
      {watchHasRpt && (
        <>
          <Separator />

          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  I2. Transaction Details
                </h3>
                <p className="text-sm text-muted-foreground">
                  Details of each related party transaction.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() =>
                  appendTransaction({
                    related_party_name: '',
                    relationship: 'director',
                    transaction_type: 'sales',
                    amount: 0,
                    currency: 'MYR',
                    is_recurring: true,
                    is_arms_length: 'unknown',
                    documentation_status: 'none',
                    description: '',
                  })
                }
              >
                <Plus className="size-4 mr-1" />
                Add Transaction
              </Button>
            </div>

            {transactionFields.length === 0 && (
              <p className="text-sm text-muted-foreground italic py-4 text-center border border-dashed rounded-lg">
                No transactions added. Click &quot;Add Transaction&quot; to add one.
              </p>
            )}

            <div className="space-y-4">
              {transactionFields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border bg-muted/20 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">
                      Transaction {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="cursor-pointer text-destructive hover:text-destructive"
                      onClick={() => removeTransaction(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <FormFieldWrapper
                      label="Related Party Name"
                      required
                      error={errors.related_party?.transactions?.[index]?.related_party_name?.message}
                    >
                      <Input
                        {...register(`related_party.transactions.${index}.related_party_name`)}
                        placeholder="e.g. ABC Holdings Sdn Bhd"
                      />
                    </FormFieldWrapper>

                    <FormFieldWrapper
                      label="Relationship"
                      required
                      error={errors.related_party?.transactions?.[index]?.relationship?.message}
                    >
                      <NativeSelect
                        {...register(`related_party.transactions.${index}.relationship`)}
                        options={RELATIONSHIP_OPTIONS}
                        placeholder="Select relationship"
                      />
                    </FormFieldWrapper>

                    <FormFieldWrapper
                      label="Transaction Type"
                      required
                      error={errors.related_party?.transactions?.[index]?.transaction_type?.message}
                    >
                      <NativeSelect
                        {...register(`related_party.transactions.${index}.transaction_type`)}
                        options={TRANSACTION_TYPE_OPTIONS}
                        placeholder="Select type"
                      />
                    </FormFieldWrapper>

                    <FormFieldWrapper
                      label="Amount (RM)"
                      required
                      error={errors.related_party?.transactions?.[index]?.amount?.message}
                    >
                      <Input
                        type="number"
                        {...register(`related_party.transactions.${index}.amount`)}
                        placeholder="0"
                        min={0}
                      />
                    </FormFieldWrapper>

                    <FormFieldWrapper
                      label="Arm&apos;s Length?"
                      required
                      error={errors.related_party?.transactions?.[index]?.is_arms_length?.message}
                    >
                      <NativeSelect
                        {...register(`related_party.transactions.${index}.is_arms_length`)}
                        options={ARMS_LENGTH_OPTIONS}
                        placeholder="Select"
                      />
                    </FormFieldWrapper>

                    <FormFieldWrapper
                      label="Documentation Status"
                      required
                      error={errors.related_party?.transactions?.[index]?.documentation_status?.message}
                    >
                      <NativeSelect
                        {...register(`related_party.transactions.${index}.documentation_status`)}
                        options={DOCUMENTATION_OPTIONS}
                        placeholder="Select status"
                      />
                    </FormFieldWrapper>

                    <FormFieldWrapper
                      label="Recurring?"
                      error={errors.related_party?.transactions?.[index]?.is_recurring?.message}
                    >
                      <Controller
                        name={`related_party.transactions.${index}.is_recurring`}
                        control={control}
                        render={({ field: ctrlField }) => (
                          <label className="flex items-center gap-2 text-sm cursor-pointer h-8">
                            <input
                              type="checkbox"
                              checked={ctrlField.value || false}
                              onChange={(e) => ctrlField.onChange(e.target.checked)}
                              className="size-4 rounded border border-input accent-primary cursor-pointer"
                            />
                            Yes, this is a recurring transaction
                          </label>
                        )}
                      />
                    </FormFieldWrapper>

                    <FormFieldWrapper
                      label="Description"
                      error={errors.related_party?.transactions?.[index]?.description?.message}
                      className="md:col-span-2"
                    >
                      <Textarea
                        {...register(`related_party.transactions.${index}.description`)}
                        placeholder="Describe the nature of this transaction..."
                        rows={2}
                      />
                    </FormFieldWrapper>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* I3: RPT Summary */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              I3. RPT Summary
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Aggregate related party transaction metrics.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mb-4">
              {/* Auto-calc total RPT amount */}
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Total RPT Amount
                  <span className="ml-1">(auto)</span>
                </p>
                <p className="text-lg font-bold text-primary font-mono">
                  RM {formatNumber(totalRptAmount)}
                </p>
              </div>

              {/* Auto-calc RPT as % of revenue */}
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  RPT as % of Revenue
                  <span className="ml-1">(auto)</span>
                </p>
                <p className="text-lg font-bold text-primary font-mono">
                  {rptPctOfRevenue !== undefined ? formatPct(rptPctOfRevenue) : '-'}
                </p>
                {latestRevenue === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Fill in Section B revenue to auto-calculate
                  </p>
                )}
              </div>

              <FormFieldWrapper
                label="Has RPT Policy?"
                error={errors.related_party?.has_rpt_policy?.message}
              >
                <Controller
                  name="related_party.has_rpt_policy"
                  control={control}
                  render={({ field: ctrlField }) => (
                    <label className="flex items-center gap-2 text-sm cursor-pointer h-8">
                      <input
                        type="checkbox"
                        checked={ctrlField.value || false}
                        onChange={(e) => ctrlField.onChange(e.target.checked)}
                        className="size-4 rounded border border-input accent-primary cursor-pointer"
                      />
                      Yes, a formal RPT policy exists
                    </label>
                  )}
                />
              </FormFieldWrapper>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
