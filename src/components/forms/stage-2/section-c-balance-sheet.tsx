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

const CURRENT_ASSET_FIELDS: { field: string; label: string }[] = [
  { field: 'cash_and_equivalents', label: 'Cash & Equivalents' },
  { field: 'trade_receivables', label: 'Trade Receivables' },
  { field: 'other_receivables', label: 'Other Receivables' },
  { field: 'inventory', label: 'Inventory' },
  { field: 'prepayments', label: 'Prepayments' },
  { field: 'other_current_assets', label: 'Other Current Assets' },
];

const NON_CURRENT_ASSET_FIELDS: { field: string; label: string }[] = [
  { field: 'property_plant_equipment', label: 'Property, Plant & Equipment' },
  { field: 'right_of_use_assets', label: 'Right-of-Use Assets' },
  { field: 'intangible_assets', label: 'Intangible Assets' },
  { field: 'goodwill', label: 'Goodwill' },
  { field: 'investments', label: 'Investments' },
  { field: 'other_non_current_assets', label: 'Other Non-Current Assets' },
];

const CURRENT_LIABILITY_FIELDS: { field: string; label: string }[] = [
  { field: 'trade_payables', label: 'Trade Payables' },
  { field: 'other_payables', label: 'Other Payables' },
  { field: 'short_term_borrowings', label: 'Short-Term Borrowings' },
  { field: 'lease_liabilities_current', label: 'Lease Liabilities (Current)' },
  { field: 'tax_payable', label: 'Tax Payable' },
  { field: 'other_current_liabilities', label: 'Other Current Liabilities' },
];

const NON_CURRENT_LIABILITY_FIELDS: { field: string; label: string }[] = [
  { field: 'long_term_borrowings', label: 'Long-Term Borrowings' },
  { field: 'lease_liabilities_non_current', label: 'Lease Liabilities (Non-Current)' },
  { field: 'provisions', label: 'Provisions' },
  { field: 'other_non_current_liabilities', label: 'Other Non-Current Liabilities' },
];

const EQUITY_FIELDS: { field: string; label: string }[] = [
  { field: 'paid_up_capital', label: 'Paid-Up Capital' },
  { field: 'share_premium', label: 'Share Premium' },
  { field: 'retained_earnings', label: 'Retained Earnings' },
  { field: 'other_reserves', label: 'Other Reserves' },
  { field: 'non_controlling_interests', label: 'Non-Controlling Interests' },
];

function formatNumber(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '-';
  return val.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatRatio(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val) || !isFinite(val)) return '-';
  return val.toFixed(2);
}

function n(v: unknown): number {
  return Number(v) || 0;
}

export function SectionCBalanceSheet({ form }: SectionProps) {
  const { register, watch, formState: { errors } } = form;

  const currentYear = new Date().getFullYear();

  const t2 = watch('balance_sheet.year_t2');
  const t1 = watch('balance_sheet.year_t1');
  const t0 = watch('balance_sheet.year_t0');

  const calcYear = (year: typeof t2) => {
    if (!year) {
      return {
        totalCurrentAssets: 0, totalNonCurrentAssets: 0, totalAssets: 0,
        totalCurrentLiabilities: 0, totalNonCurrentLiabilities: 0, totalLiabilities: 0,
        totalEquity: 0, currentRatio: 0, debtEquityRatio: 0,
      };
    }

    const totalCurrentAssets =
      n(year.cash_and_equivalents) + n(year.trade_receivables) + n(year.other_receivables) +
      n(year.inventory) + n(year.prepayments) + n(year.other_current_assets);

    const totalNonCurrentAssets =
      n(year.property_plant_equipment) + n(year.right_of_use_assets) + n(year.intangible_assets) +
      n(year.goodwill) + n(year.investments) + n(year.other_non_current_assets);

    const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

    const totalCurrentLiabilities =
      n(year.trade_payables) + n(year.other_payables) + n(year.short_term_borrowings) +
      n(year.lease_liabilities_current) + n(year.tax_payable) + n(year.other_current_liabilities);

    const totalNonCurrentLiabilities =
      n(year.long_term_borrowings) + n(year.lease_liabilities_non_current) +
      n(year.provisions) + n(year.other_non_current_liabilities);

    const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;

    const totalEquity =
      n(year.paid_up_capital) + n(year.share_premium) + n(year.retained_earnings) +
      n(year.other_reserves) + n(year.non_controlling_interests);

    const currentRatio = totalCurrentLiabilities > 0
      ? totalCurrentAssets / totalCurrentLiabilities
      : 0;

    const totalDebt = n(year.short_term_borrowings) + n(year.long_term_borrowings);
    const debtEquityRatio = totalEquity > 0 ? totalDebt / totalEquity : 0;

    return {
      totalCurrentAssets, totalNonCurrentAssets, totalAssets,
      totalCurrentLiabilities, totalNonCurrentLiabilities, totalLiabilities,
      totalEquity, currentRatio, debtEquityRatio,
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
            {...register(`balance_sheet.${key}.${field}` as any)}
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

  const renderRatioRow = (label: string, values: number[]) => (
    <tr key={label} className="border-b bg-muted/30">
      <td className="px-4 py-2 font-medium text-primary">
        {label}
        <span className="ml-1 text-xs text-muted-foreground font-normal">(auto)</span>
      </td>
      {values.map((val, i) => (
        <td key={i} className="px-4 py-2 text-right font-mono text-primary">
          {formatRatio(val)}
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
          C. Detailed Balance Sheet
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Three years of balance sheet data. All amounts in RM (Malaysian Ringgit).
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
              {/* ASSETS */}
              {renderSectionHeader('Current Assets')}
              {CURRENT_ASSET_FIELDS.map((row) => renderInputRow(row.field, row.label))}
              {renderAutoRow('Total Current Assets', calcs.map((c) => c.totalCurrentAssets))}

              {renderSectionHeader('Non-Current Assets')}
              {NON_CURRENT_ASSET_FIELDS.map((row) => renderInputRow(row.field, row.label))}
              {renderAutoRow('Total Non-Current Assets', calcs.map((c) => c.totalNonCurrentAssets))}

              {renderAutoRow('Total Assets', calcs.map((c) => c.totalAssets), true)}

              {/* LIABILITIES */}
              {renderSectionHeader('Current Liabilities')}
              {CURRENT_LIABILITY_FIELDS.map((row) => renderInputRow(row.field, row.label))}
              {renderAutoRow('Total Current Liabilities', calcs.map((c) => c.totalCurrentLiabilities))}

              {renderSectionHeader('Non-Current Liabilities')}
              {NON_CURRENT_LIABILITY_FIELDS.map((row) => renderInputRow(row.field, row.label))}
              {renderAutoRow('Total Non-Current Liabilities', calcs.map((c) => c.totalNonCurrentLiabilities))}

              {renderAutoRow('Total Liabilities', calcs.map((c) => c.totalLiabilities), true)}

              {/* EQUITY */}
              {renderSectionHeader('Equity')}
              {EQUITY_FIELDS.map((row) => renderInputRow(row.field, row.label))}
              {renderAutoRow('Total Equity', calcs.map((c) => c.totalEquity), true)}

              {/* RATIOS */}
              {renderSectionHeader('Key Ratios')}
              {renderRatioRow('Current Ratio', calcs.map((c) => c.currentRatio))}
              {renderRatioRow('Debt / Equity Ratio', calcs.map((c) => c.debtEquityRatio))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
