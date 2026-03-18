'use client';

import { UseFormReturn, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { FormFieldWrapper, NativeSelect } from '@/components/forms/form-field';
import type { Stage1Data } from '@/lib/validations/stage-1';

interface SectionProps {
  form: UseFormReturn<Stage1Data>;
}

const FY_MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2000, i, 1).toLocaleString('en', { month: 'long' }),
}));

const CASH_FLOW_OPTIONS = [
  { value: 'yes_consistently', label: 'Yes, consistently positive' },
  { value: 'sometimes', label: 'Sometimes positive, sometimes negative' },
  { value: 'no', label: 'No, consistently negative' },
];

const AOB_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Unknown' },
];

const ACCOUNTING_STD_OPTIONS = [
  { value: 'mpers', label: 'MPERS' },
  { value: 'mfrs', label: 'MFRS' },
  { value: 'unknown', label: 'Unknown' },
];

function formatNumber(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '-';
  return val.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatPct(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val) || !isFinite(val)) return '-';
  return `${val.toFixed(1)}%`;
}

export function SectionEFinancials({ form }: SectionProps) {
  const { register, control, watch, formState: { errors } } = form;
  const watchAudited = watch('audit_status.has_audited');

  // Watch financial values for auto-calculations
  const t2 = watch('financials.year_t2');
  const t1 = watch('financials.year_t1');
  const t0 = watch('financials.year_t0');

  // Cash flow basics for runway calc
  const monthlyOpex = watch('cash_flow.monthly_opex');
  const currentCash = watch('cash_flow.current_cash');

  // Auto-calculations for each year
  const calcYear = (year: typeof t2) => {
    if (!year) return { grossProfit: 0, grossMargin: 0, netMargin: 0 };
    const revenue = Number(year.revenue) || 0;
    const cogs = Number(year.cogs) || 0;
    const pat = Number(year.pat) || 0;
    const grossProfit = revenue - cogs;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const netMargin = revenue > 0 ? (pat / revenue) * 100 : 0;
    return { grossProfit, grossMargin, netMargin };
  };

  const calc_t2 = calcYear(t2);
  const calc_t1 = calcYear(t1);
  const calc_t0 = calcYear(t0);

  // YoY growth
  const yoyGrowth_t1 =
    t2 && t1 && Number(t2.revenue) > 0
      ? ((Number(t1.revenue) - Number(t2.revenue)) / Number(t2.revenue)) * 100
      : undefined;
  const yoyGrowth_t0 =
    t1 && t0 && Number(t1.revenue) > 0
      ? ((Number(t0.revenue) - Number(t1.revenue)) / Number(t1.revenue)) * 100
      : undefined;

  // Months of runway
  const runway =
    Number(currentCash) > 0 && Number(monthlyOpex) > 0
      ? Number(currentCash) / Number(monthlyOpex)
      : undefined;

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-8">
      {/* E1: Revenue & Profitability */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          E1. Revenue & Profitability
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Three years of financial performance. All amounts in RM (Malaysian Ringgit).
        </p>

        <FormFieldWrapper
          label="Financial Year End Month"
          required
          error={errors.financials?.fy_end_month?.message}
          className="mb-6 max-w-xs"
        >
          <NativeSelect
            {...register('financials.fy_end_month')}
            options={FY_MONTH_OPTIONS}
            placeholder="Select month"
          />
        </FormFieldWrapper>

        {/* Financial data table */}
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-[200px]">
                  Metric
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Year T-2 ({currentYear - 2})
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Year T-1 ({currentYear - 1})
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Year T-0 ({currentYear})
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Revenue */}
              <tr className="border-b">
                <td className="px-4 py-2 font-medium">Revenue</td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('financials.year_t2.revenue')}
                    placeholder="0"
                    min={0}
                    className="text-right"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('financials.year_t1.revenue')}
                    placeholder="0"
                    min={0}
                    className="text-right"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('financials.year_t0.revenue')}
                    placeholder="0"
                    min={0}
                    className="text-right"
                  />
                </td>
              </tr>

              {/* COGS */}
              <tr className="border-b">
                <td className="px-4 py-2 font-medium">Cost of Goods Sold</td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('financials.year_t2.cogs')}
                    placeholder="0"
                    min={0}
                    className="text-right"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('financials.year_t1.cogs')}
                    placeholder="0"
                    min={0}
                    className="text-right"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('financials.year_t0.cogs')}
                    placeholder="0"
                    min={0}
                    className="text-right"
                  />
                </td>
              </tr>

              {/* Gross Profit (auto-calc) */}
              <tr className="border-b bg-muted/30">
                <td className="px-4 py-2 font-medium text-primary">
                  Gross Profit
                  <span className="ml-1 text-xs text-muted-foreground font-normal">(auto)</span>
                </td>
                <td className="px-4 py-2 text-right font-mono text-primary">
                  {formatNumber(calc_t2.grossProfit)}
                </td>
                <td className="px-4 py-2 text-right font-mono text-primary">
                  {formatNumber(calc_t1.grossProfit)}
                </td>
                <td className="px-4 py-2 text-right font-mono text-primary">
                  {formatNumber(calc_t0.grossProfit)}
                </td>
              </tr>

              {/* Operating Expenses */}
              <tr className="border-b">
                <td className="px-4 py-2 font-medium">Operating Expenses</td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('financials.year_t2.operating_expenses')}
                    placeholder="0"
                    min={0}
                    className="text-right"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('financials.year_t1.operating_expenses')}
                    placeholder="0"
                    min={0}
                    className="text-right"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('financials.year_t0.operating_expenses')}
                    placeholder="0"
                    min={0}
                    className="text-right"
                  />
                </td>
              </tr>

              {/* PBT */}
              <tr className="border-b">
                <td className="px-4 py-2 font-medium">Profit Before Tax (PBT)</td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('financials.year_t2.pbt')}
                    placeholder="0"
                    className="text-right"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('financials.year_t1.pbt')}
                    placeholder="0"
                    className="text-right"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('financials.year_t0.pbt')}
                    placeholder="0"
                    className="text-right"
                  />
                </td>
              </tr>

              {/* PAT */}
              <tr className="border-b">
                <td className="px-4 py-2 font-medium">Profit After Tax (PAT)</td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('financials.year_t2.pat')}
                    placeholder="0"
                    className="text-right"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('financials.year_t1.pat')}
                    placeholder="0"
                    className="text-right"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    {...register('financials.year_t0.pat')}
                    placeholder="0"
                    className="text-right"
                  />
                </td>
              </tr>

              {/* Gross Margin % (auto-calc) */}
              <tr className="border-b bg-muted/30">
                <td className="px-4 py-2 font-medium text-primary">
                  Gross Margin %
                  <span className="ml-1 text-xs text-muted-foreground font-normal">(auto)</span>
                </td>
                <td className="px-4 py-2 text-right font-mono text-primary">
                  {formatPct(calc_t2.grossMargin)}
                </td>
                <td className="px-4 py-2 text-right font-mono text-primary">
                  {formatPct(calc_t1.grossMargin)}
                </td>
                <td className="px-4 py-2 text-right font-mono text-primary">
                  {formatPct(calc_t0.grossMargin)}
                </td>
              </tr>

              {/* Net Margin % (auto-calc) */}
              <tr className="border-b bg-muted/30">
                <td className="px-4 py-2 font-medium text-primary">
                  Net Margin %
                  <span className="ml-1 text-xs text-muted-foreground font-normal">(auto)</span>
                </td>
                <td className="px-4 py-2 text-right font-mono text-primary">
                  {formatPct(calc_t2.netMargin)}
                </td>
                <td className="px-4 py-2 text-right font-mono text-primary">
                  {formatPct(calc_t1.netMargin)}
                </td>
                <td className="px-4 py-2 text-right font-mono text-primary">
                  {formatPct(calc_t0.netMargin)}
                </td>
              </tr>

              {/* YoY Revenue Growth % (auto-calc) */}
              <tr className="bg-muted/30">
                <td className="px-4 py-2 font-medium text-primary">
                  YoY Revenue Growth %
                  <span className="ml-1 text-xs text-muted-foreground font-normal">(auto)</span>
                </td>
                <td className="px-4 py-2 text-right font-mono text-muted-foreground">
                  -
                </td>
                <td className="px-4 py-2 text-right font-mono text-primary">
                  {yoyGrowth_t1 !== undefined ? formatPct(yoyGrowth_t1) : '-'}
                </td>
                <td className="px-4 py-2 text-right font-mono text-primary">
                  {yoyGrowth_t0 !== undefined ? formatPct(yoyGrowth_t0) : '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Separator />

      {/* E2: Balance Sheet */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          E2. Balance Sheet (Latest)
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Most recent balance sheet figures in RM.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Assets
            </h4>
            <FormFieldWrapper
              label="Cash & Equivalents"
              required
              error={errors.balance_sheet?.cash?.message}
            >
              <Input
                type="number"
                {...register('balance_sheet.cash')}
                placeholder="0"
                min={0}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Trade Receivables"
              required
              error={errors.balance_sheet?.receivables?.message}
            >
              <Input
                type="number"
                {...register('balance_sheet.receivables')}
                placeholder="0"
                min={0}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Inventory"
              error={errors.balance_sheet?.inventory?.message}
            >
              <Input
                type="number"
                {...register('balance_sheet.inventory')}
                placeholder="0"
                min={0}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Total Current Assets"
              required
              error={errors.balance_sheet?.current_assets?.message}
            >
              <Input
                type="number"
                {...register('balance_sheet.current_assets')}
                placeholder="0"
                min={0}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Fixed Assets (PPE)"
              required
              error={errors.balance_sheet?.fixed_assets?.message}
            >
              <Input
                type="number"
                {...register('balance_sheet.fixed_assets')}
                placeholder="0"
                min={0}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Total Assets"
              required
              error={errors.balance_sheet?.total_assets?.message}
            >
              <Input
                type="number"
                {...register('balance_sheet.total_assets')}
                placeholder="0"
                min={0}
              />
            </FormFieldWrapper>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Liabilities & Equity
            </h4>
            <FormFieldWrapper
              label="Current Liabilities"
              required
              error={errors.balance_sheet?.current_liabilities?.message}
            >
              <Input
                type="number"
                {...register('balance_sheet.current_liabilities')}
                placeholder="0"
                min={0}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Bank Borrowings"
              required
              error={errors.balance_sheet?.bank_borrowings?.message}
            >
              <Input
                type="number"
                {...register('balance_sheet.bank_borrowings')}
                placeholder="0"
                min={0}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Total Liabilities"
              required
              error={errors.balance_sheet?.total_liabilities?.message}
            >
              <Input
                type="number"
                {...register('balance_sheet.total_liabilities')}
                placeholder="0"
                min={0}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Paid-up Capital"
              required
              error={errors.balance_sheet?.paid_up_capital?.message}
            >
              <Input
                type="number"
                {...register('balance_sheet.paid_up_capital')}
                placeholder="0"
                min={0}
              />
            </FormFieldWrapper>
          </div>
        </div>
      </section>

      <Separator />

      {/* E3: Cash Flow Basics */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          E3. Cash Flow Basics
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Cash flow health and working capital cycle.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Cash Flow Position"
            required
            error={errors.cash_flow?.cash_flow_positive?.message}
          >
            <NativeSelect
              {...register('cash_flow.cash_flow_positive')}
              options={CASH_FLOW_OPTIONS}
              placeholder="Select"
            />
          </FormFieldWrapper>

          <div /> {/* spacer */}

          <FormFieldWrapper
            label="Monthly Operating Expenses (RM)"
            required
            error={errors.cash_flow?.monthly_opex?.message}
          >
            <Input
              type="number"
              {...register('cash_flow.monthly_opex')}
              placeholder="e.g. 200000"
              min={0}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Current Cash on Hand (RM)"
            required
            error={errors.cash_flow?.current_cash?.message}
          >
            <Input
              type="number"
              {...register('cash_flow.current_cash')}
              placeholder="e.g. 1000000"
              min={0}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Customer Payment Days"
            required
            error={errors.cash_flow?.customer_pay_days?.message}
            hint="Average days to receive payment from customers"
          >
            <Input
              type="number"
              {...register('cash_flow.customer_pay_days')}
              placeholder="e.g. 60"
              min={0}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Supplier Payment Days"
            required
            error={errors.cash_flow?.supplier_pay_days?.message}
            hint="Average days to pay suppliers"
          >
            <Input
              type="number"
              {...register('cash_flow.supplier_pay_days')}
              placeholder="e.g. 45"
              min={0}
            />
          </FormFieldWrapper>

          {/* Auto-calc: Months of Runway */}
          <div className="md:col-span-2 rounded-lg bg-primary/5 border border-primary/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Months of Runway (Auto-calculated)
                </p>
                <p className="text-xs text-muted-foreground">
                  Current Cash / Monthly Operating Expenses
                </p>
              </div>
              <span className="text-2xl font-bold text-primary font-mono">
                {runway !== undefined ? `${runway.toFixed(1)} months` : '-'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* E4: Audit Status */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          E4. Audit Status
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Status of financial auditing and accounting standards.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Has Audited Financial Statements?"
            required
            error={errors.audit_status?.has_audited?.message}
          >
            <Controller
              name="audit_status.has_audited"
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

          <FormFieldWrapper
            label="Accounting Standard"
            required
            error={errors.audit_status?.accounting_standard?.message}
          >
            <NativeSelect
              {...register('audit_status.accounting_standard')}
              options={ACCOUNTING_STD_OPTIONS}
              placeholder="Select"
            />
          </FormFieldWrapper>

          {watchAudited && (
            <>
              <FormFieldWrapper
                label="Years of Audited Accounts"
                error={errors.audit_status?.years_audited?.message}
              >
                <Input
                  type="number"
                  {...register('audit_status.years_audited')}
                  placeholder="e.g. 5"
                  min={0}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Auditor / Firm Name"
                error={errors.audit_status?.auditor_name?.message}
              >
                <Input
                  {...register('audit_status.auditor_name')}
                  placeholder="e.g. KPMG, Deloitte, BDO"
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="AOB Registered Auditor?"
                error={errors.audit_status?.aob_registered?.message}
                hint="Audit Oversight Board registration status"
              >
                <NativeSelect
                  {...register('audit_status.aob_registered')}
                  options={AOB_OPTIONS}
                  placeholder="Select"
                />
              </FormFieldWrapper>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
