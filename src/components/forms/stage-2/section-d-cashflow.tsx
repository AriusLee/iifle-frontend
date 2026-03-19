'use client';

import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { FormFieldWrapper, NativeSelect } from '@/components/forms/form-field';
import type { Stage2Data } from '@/lib/validations/stage-2';

interface SectionProps {
  form: UseFormReturn<Stage2Data>;
}

type YearKey = 'year_t2' | 'year_t1' | 'year_t0';

const OPERATING_FIELDS: { field: string; label: string }[] = [
  { field: 'profit_before_tax', label: 'Profit Before Tax' },
  { field: 'depreciation_amortization', label: 'Depreciation & Amortisation' },
  { field: 'working_capital_changes', label: 'Working Capital Changes' },
  { field: 'tax_paid', label: 'Tax Paid' },
];

const INVESTING_FIELDS: { field: string; label: string }[] = [
  { field: 'capex', label: 'Capital Expenditure (Capex)' },
];

const FINANCING_FIELDS: { field: string; label: string }[] = [
  { field: 'proceeds_from_borrowings', label: 'Proceeds from Borrowings' },
  { field: 'repayment_of_borrowings', label: 'Repayment of Borrowings' },
  { field: 'dividends_paid', label: 'Dividends Paid' },
];

function formatNumber(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '-';
  return val.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function n(v: unknown): number {
  return Number(v) || 0;
}

export function SectionDCashflow({ form }: SectionProps) {
  const { register, watch, formState: { errors } } = form;

  const currentYear = new Date().getFullYear();

  const t2 = watch('cash_flow.year_t2');
  const t1 = watch('cash_flow.year_t1');
  const t0 = watch('cash_flow.year_t0');

  const calcYear = (year: typeof t2) => {
    if (!year) {
      return {
        netOperatingCashFlow: 0, netInvestingCashFlow: 0,
        netFinancingCashFlow: 0, netChangeInCash: 0,
        closingCash: 0, freeCashFlow: 0,
      };
    }

    const pbt = n(year.profit_before_tax);
    const dep = n(year.depreciation_amortization);
    const wcChanges = n(year.working_capital_changes);
    const taxPaid = n(year.tax_paid);
    const netOperatingCashFlow = pbt + dep + wcChanges - taxPaid;

    const capex = n(year.capex);
    const netInvestingCashFlow = -capex;

    const proceedsFromBorrowings = n(year.proceeds_from_borrowings);
    const repaymentOfBorrowings = n(year.repayment_of_borrowings);
    const dividendsPaid = n(year.dividends_paid);
    const netFinancingCashFlow = proceedsFromBorrowings - repaymentOfBorrowings - dividendsPaid;

    const netChangeInCash = netOperatingCashFlow + netInvestingCashFlow + netFinancingCashFlow;

    const openingCash = n(year.opening_cash);
    const closingCash = openingCash + netChangeInCash;

    const freeCashFlow = netOperatingCashFlow - capex;

    return {
      netOperatingCashFlow, netInvestingCashFlow,
      netFinancingCashFlow, netChangeInCash,
      closingCash, freeCashFlow,
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
            {...register(`cash_flow.${key}.${field}` as any)}
            placeholder="0"
            className="text-right"
          />
        </td>
      ))}
    </tr>
  );

  const renderAutoRow = (label: string, values: number[], isBold = false) => (
    <tr key={label} className={`border-b bg-muted/30 ${isBold ? 'font-semibold' : ''}`}>
      <td className="px-4 py-2 font-medium text-primary">
        {label}
        <span className="ml-1 text-xs text-muted-foreground font-normal">(auto)</span>
      </td>
      {values.map((val, i) => (
        <td key={i} className="px-4 py-2 text-right font-mono text-primary">
          {formatNumber(val)}
        </td>
      ))}
    </tr>
  );

  const renderSectionHeader = (title: string) => (
    <tr key={`header-${title}`} className="border-b">
      <td colSpan={4} className="px-4 py-2 bg-muted/20">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
      </td>
    </tr>
  );

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          D. Cash Flow Details
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Three years of cash flow data. All amounts in RM (Malaysian Ringgit).
        </p>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-[240px]">
                  Item
                </th>
                {yearLabels.map(({ key, label }) => (
                  <th key={key} className="px-4 py-3 text-right font-medium text-muted-foreground">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Operating Activities */}
              {renderSectionHeader('Operating Activities')}
              {OPERATING_FIELDS.map((row) => renderInputRow(row.field, row.label))}
              {renderAutoRow('Net Operating Cash Flow', calcs.map((c) => c.netOperatingCashFlow))}

              {/* Investing Activities */}
              {renderSectionHeader('Investing Activities')}
              {INVESTING_FIELDS.map((row) => renderInputRow(row.field, row.label))}
              {renderAutoRow('Net Investing Cash Flow', calcs.map((c) => c.netInvestingCashFlow))}

              {/* Financing Activities */}
              {renderSectionHeader('Financing Activities')}
              {FINANCING_FIELDS.map((row) => renderInputRow(row.field, row.label))}
              {renderAutoRow('Net Financing Cash Flow', calcs.map((c) => c.netFinancingCashFlow))}

              {/* Summary */}
              {renderSectionHeader('Summary')}
              {renderAutoRow('Net Change in Cash', calcs.map((c) => c.netChangeInCash), true)}

              {/* Opening Cash (input) */}
              <tr className="border-b">
                <td className="px-4 py-2 font-medium">Opening Cash</td>
                {yearLabels.map(({ key }) => (
                  <td key={key} className="px-4 py-2">
                    <Input
                      type="number"
                      {...register(`cash_flow.${key}.opening_cash` as any)}
                      placeholder="0"
                      className="text-right"
                    />
                  </td>
                ))}
              </tr>

              {renderAutoRow('Closing Cash', calcs.map((c) => c.closingCash), true)}
              {renderAutoRow('Free Cash Flow', calcs.map((c) => c.freeCashFlow), true)}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
