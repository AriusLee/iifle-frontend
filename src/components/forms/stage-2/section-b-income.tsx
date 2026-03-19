'use client';

import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { FormFieldWrapper, NativeSelect } from '@/components/forms/form-field';
import type { Stage2Data } from '@/lib/validations/stage-2';

interface SectionProps {
  form: UseFormReturn<Stage2Data>;
}

const FY_MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2000, i, 1).toLocaleString('en', { month: 'long' }),
}));

type YearKey = 'year_t2' | 'year_t1' | 'year_t0';

const INPUT_ROWS: { field: string; label: string }[] = [
  { field: 'total_revenue', label: 'Total Revenue' },
  { field: 'other_income', label: 'Other Income' },
  { field: 'cost_of_goods_sold', label: 'Cost of Goods Sold' },
];

const OPEX_ROWS: { field: string; label: string }[] = [
  { field: 'staff_costs', label: 'Staff Costs' },
  { field: 'rental_expenses', label: 'Rental Expenses' },
  { field: 'depreciation_amortization', label: 'Depreciation & Amortisation' },
  { field: 'marketing_expenses', label: 'Marketing Expenses' },
  { field: 'administrative_expenses', label: 'Administrative Expenses' },
  { field: 'other_operating_expenses', label: 'Other Operating Expenses' },
];

const BELOW_OPEX_ROWS: { field: string; label: string }[] = [
  { field: 'interest_income', label: 'Interest Income' },
  { field: 'interest_expense', label: 'Interest Expense' },
  { field: 'exceptional_items', label: 'Exceptional / Non-Recurring Items' },
  { field: 'tax_expense', label: 'Tax Expense' },
];

function formatNumber(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '-';
  return val.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatPct(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val) || !isFinite(val)) return '-';
  return `${val.toFixed(1)}%`;
}

function n(v: unknown): number {
  return Number(v) || 0;
}

export function SectionBIncome({ form }: SectionProps) {
  const { register, watch, formState: { errors } } = form;

  const currentYear = new Date().getFullYear();

  const t2 = watch('income_statement.year_t2');
  const t1 = watch('income_statement.year_t1');
  const t0 = watch('income_statement.year_t0');

  const calcYear = (year: typeof t2) => {
    if (!year) {
      return {
        grossProfit: 0, totalOpex: 0, ebitda: 0, ebit: 0,
        netFinanceCost: 0, profitBeforeTax: 0, profitAfterTax: 0,
        grossMargin: 0, netMargin: 0,
      };
    }
    const revenue = n(year.total_revenue);
    const otherIncome = n(year.other_income);
    const cogs = n(year.cost_of_goods_sold);
    const grossProfit = revenue - cogs;

    const staffCosts = n(year.staff_costs);
    const rental = n(year.rental_expenses);
    const dep = n(year.depreciation_amortization);
    const marketing = n(year.marketing_expenses);
    const admin = n(year.administrative_expenses);
    const otherOpex = n(year.other_operating_expenses);
    const totalOpex = staffCosts + rental + dep + marketing + admin + otherOpex;

    const ebitda = grossProfit + otherIncome - totalOpex + dep;
    const ebit = ebitda - dep;

    const interestIncome = n(year.interest_income);
    const interestExpense = n(year.interest_expense);
    const netFinanceCost = interestExpense - interestIncome;
    const exceptional = n(year.exceptional_items);

    const profitBeforeTax = ebit - netFinanceCost + exceptional;
    const taxExpense = n(year.tax_expense);
    const profitAfterTax = profitBeforeTax - taxExpense;

    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const netMargin = revenue > 0 ? (profitAfterTax / revenue) * 100 : 0;

    return {
      grossProfit, totalOpex, ebitda, ebit,
      netFinanceCost, profitBeforeTax, profitAfterTax,
      grossMargin, netMargin,
    };
  };

  const calc_t2 = calcYear(t2);
  const calc_t1 = calcYear(t1);
  const calc_t0 = calcYear(t0);

  const yearLabels: { key: YearKey; label: string }[] = [
    { key: 'year_t2', label: `Year T-2 (${currentYear - 2})` },
    { key: 'year_t1', label: `Year T-1 (${currentYear - 1})` },
    { key: 'year_t0', label: `Year T-0 (${currentYear})` },
  ];

  const calcs = [calc_t2, calc_t1, calc_t0];

  const renderInputRow = (field: string, label: string) => (
    <tr key={field} className="border-b">
      <td className="px-4 py-2 font-medium">{label}</td>
      {yearLabels.map(({ key }) => (
        <td key={key} className="px-4 py-2">
          <Input
            type="number"
            {...register(`income_statement.${key}.${field}` as any)}
            placeholder="0"
            className="text-right"
          />
        </td>
      ))}
    </tr>
  );

  const renderAutoRow = (label: string, values: number[], isPercent = false) => (
    <tr key={label} className="border-b bg-muted/30">
      <td className="px-4 py-2 font-medium text-primary">
        {label}
        <span className="ml-1 text-xs text-muted-foreground font-normal">(auto)</span>
      </td>
      {values.map((val, i) => (
        <td key={i} className="px-4 py-2 text-right font-mono text-primary">
          {isPercent ? formatPct(val) : formatNumber(val)}
        </td>
      ))}
    </tr>
  );

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          B. Detailed Income Statement
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Three years of detailed income statement data. All amounts in RM (Malaysian Ringgit).
        </p>

        <FormFieldWrapper
          label="Financial Year End Month"
          required
          error={errors.income_statement?.fy_end_month?.message}
          className="mb-6 max-w-xs"
        >
          <NativeSelect
            {...register('income_statement.fy_end_month')}
            options={FY_MONTH_OPTIONS}
            placeholder="Select month"
          />
        </FormFieldWrapper>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-[240px]">
                  Metric
                </th>
                {yearLabels.map(({ key, label }) => (
                  <th key={key} className="px-4 py-3 text-right font-medium text-muted-foreground">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Revenue & COGS */}
              {INPUT_ROWS.map((row) => renderInputRow(row.field, row.label))}

              {/* Gross Profit (auto) */}
              {renderAutoRow('Gross Profit', calcs.map((c) => c.grossProfit))}

              {/* Gross Margin % (auto) */}
              {renderAutoRow('Gross Margin %', calcs.map((c) => c.grossMargin), true)}

              {/* Section separator */}
              <tr className="border-b">
                <td colSpan={4} className="px-4 py-2 bg-muted/20">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Operating Expenses
                  </span>
                </td>
              </tr>

              {/* OpEx rows */}
              {OPEX_ROWS.map((row) => renderInputRow(row.field, row.label))}

              {/* Total Operating Expenses (auto) */}
              {renderAutoRow('Total Operating Expenses', calcs.map((c) => c.totalOpex))}

              {/* EBITDA (auto) */}
              {renderAutoRow('EBITDA', calcs.map((c) => c.ebitda))}

              {/* EBIT (auto) */}
              {renderAutoRow('EBIT', calcs.map((c) => c.ebit))}

              {/* Section separator */}
              <tr className="border-b">
                <td colSpan={4} className="px-4 py-2 bg-muted/20">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Non-Operating Items
                  </span>
                </td>
              </tr>

              {/* Below OpEx rows */}
              {BELOW_OPEX_ROWS.map((row) => renderInputRow(row.field, row.label))}

              {/* Profit Before Tax (auto) */}
              {renderAutoRow('Profit Before Tax', calcs.map((c) => c.profitBeforeTax))}

              {/* Profit After Tax (auto) */}
              {renderAutoRow('Profit After Tax', calcs.map((c) => c.profitAfterTax))}

              {/* Net Margin % (auto) */}
              {renderAutoRow('Net Margin %', calcs.map((c) => c.netMargin), true)}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
