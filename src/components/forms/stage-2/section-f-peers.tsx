'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FormFieldWrapper } from '@/components/forms/form-field';
import { Plus, Trash2 } from 'lucide-react';
import type { Stage2Data } from '@/lib/validations/stage-2';

interface SectionProps {
  form: UseFormReturn<Stage2Data>;
}

export function SectionFPeers({ form }: SectionProps) {
  const { register, control, formState: { errors } } = form;

  const {
    fields: companyFields,
    append: appendCompany,
    remove: removeCompany,
  } = useFieldArray({
    control,
    name: 'peers.comparable_companies',
  });

  return (
    <div className="space-y-8">
      {/* F1: Comparable Companies */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              F1. Comparable Companies
            </h3>
            <p className="text-sm text-muted-foreground">
              Listed or private companies used as valuation benchmarks.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() =>
              appendCompany({
                name: '',
                ticker: '',
                market: '',
                revenue: undefined,
                pat: undefined,
                market_cap: undefined,
                pe_ratio: undefined,
                ev_ebitda: undefined,
                gross_margin_pct: undefined,
                net_margin_pct: undefined,
                roe_pct: undefined,
              })
            }
          >
            <Plus className="size-4 mr-1" />
            Add Company
          </Button>
        </div>

        {companyFields.length === 0 && (
          <p className="text-sm text-muted-foreground italic py-4 text-center border border-dashed rounded-lg">
            No comparable companies added. Click &quot;Add Company&quot; to add one.
          </p>
        )}

        <div className="space-y-4">
          {companyFields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border bg-muted/20 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">
                  Company {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-destructive hover:text-destructive"
                  onClick={() => removeCompany(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <FormFieldWrapper
                  label="Company Name"
                  required
                  error={errors.peers?.comparable_companies?.[index]?.name?.message}
                >
                  <Input
                    {...register(`peers.comparable_companies.${index}.name`)}
                    placeholder="e.g. Top Glove Corporation"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Ticker / Stock Code"
                  error={errors.peers?.comparable_companies?.[index]?.ticker?.message}
                >
                  <Input
                    {...register(`peers.comparable_companies.${index}.ticker`)}
                    placeholder="e.g. 7113"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Market / Exchange"
                  error={errors.peers?.comparable_companies?.[index]?.market?.message}
                >
                  <Input
                    {...register(`peers.comparable_companies.${index}.market`)}
                    placeholder="e.g. Bursa Malaysia"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Revenue (RM)"
                  error={errors.peers?.comparable_companies?.[index]?.revenue?.message}
                >
                  <Input
                    type="number"
                    {...register(`peers.comparable_companies.${index}.revenue`)}
                    placeholder="0"
                    min={0}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="PAT (RM)"
                  error={errors.peers?.comparable_companies?.[index]?.pat?.message}
                >
                  <Input
                    type="number"
                    {...register(`peers.comparable_companies.${index}.pat`)}
                    placeholder="0"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Market Cap (RM)"
                  error={errors.peers?.comparable_companies?.[index]?.market_cap?.message}
                >
                  <Input
                    type="number"
                    {...register(`peers.comparable_companies.${index}.market_cap`)}
                    placeholder="0"
                    min={0}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="P/E Ratio"
                  error={errors.peers?.comparable_companies?.[index]?.pe_ratio?.message}
                >
                  <Input
                    type="number"
                    {...register(`peers.comparable_companies.${index}.pe_ratio`)}
                    placeholder="e.g. 15.2"
                    step={0.1}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="EV/EBITDA"
                  error={errors.peers?.comparable_companies?.[index]?.ev_ebitda?.message}
                >
                  <Input
                    type="number"
                    {...register(`peers.comparable_companies.${index}.ev_ebitda`)}
                    placeholder="e.g. 10.5"
                    step={0.1}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Gross Margin %"
                  error={errors.peers?.comparable_companies?.[index]?.gross_margin_pct?.message}
                >
                  <Input
                    type="number"
                    {...register(`peers.comparable_companies.${index}.gross_margin_pct`)}
                    placeholder="e.g. 35.0"
                    step={0.1}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Net Margin %"
                  error={errors.peers?.comparable_companies?.[index]?.net_margin_pct?.message}
                >
                  <Input
                    type="number"
                    {...register(`peers.comparable_companies.${index}.net_margin_pct`)}
                    placeholder="e.g. 12.5"
                    step={0.1}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="ROE %"
                  error={errors.peers?.comparable_companies?.[index]?.roe_pct?.message}
                >
                  <Input
                    type="number"
                    {...register(`peers.comparable_companies.${index}.roe_pct`)}
                    placeholder="e.g. 18.0"
                    step={0.1}
                  />
                </FormFieldWrapper>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* F2: Industry Benchmarks */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          F2. Industry Benchmarks
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Median industry metrics for comparison.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Industry"
            required
            error={errors.peers?.industry_benchmarks?.industry?.message}
            className="md:col-span-2 lg:col-span-3"
          >
            <Input
              {...register('peers.industry_benchmarks.industry')}
              placeholder="e.g. Manufacturing - Rubber Products"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Gross Margin Median %"
            error={errors.peers?.industry_benchmarks?.gross_margin_median?.message}
          >
            <Input
              type="number"
              {...register('peers.industry_benchmarks.gross_margin_median')}
              placeholder="e.g. 30.0"
              step={0.1}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Net Margin Median %"
            error={errors.peers?.industry_benchmarks?.net_margin_median?.message}
          >
            <Input
              type="number"
              {...register('peers.industry_benchmarks.net_margin_median')}
              placeholder="e.g. 10.0"
              step={0.1}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="ROE Median %"
            error={errors.peers?.industry_benchmarks?.roe_median?.message}
          >
            <Input
              type="number"
              {...register('peers.industry_benchmarks.roe_median')}
              placeholder="e.g. 15.0"
              step={0.1}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="P/E Median"
            error={errors.peers?.industry_benchmarks?.pe_median?.message}
          >
            <Input
              type="number"
              {...register('peers.industry_benchmarks.pe_median')}
              placeholder="e.g. 14.0"
              step={0.1}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="EV/EBITDA Median"
            error={errors.peers?.industry_benchmarks?.ev_ebitda_median?.message}
          >
            <Input
              type="number"
              {...register('peers.industry_benchmarks.ev_ebitda_median')}
              placeholder="e.g. 9.0"
              step={0.1}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Revenue Growth Median %"
            error={errors.peers?.industry_benchmarks?.revenue_growth_median?.message}
          >
            <Input
              type="number"
              {...register('peers.industry_benchmarks.revenue_growth_median')}
              placeholder="e.g. 8.0"
              step={0.1}
            />
          </FormFieldWrapper>
        </div>
      </section>

      <Separator />

      {/* F3: Data Source */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          F3. Data Source
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Source and date of the peer comparison data.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Data Source"
            error={errors.peers?.data_source?.message}
            hint="e.g. Bloomberg, Capital IQ, Bursa Malaysia"
          >
            <Input
              {...register('peers.data_source')}
              placeholder="e.g. Bloomberg Terminal"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Data As Of"
            error={errors.peers?.data_as_of?.message}
            hint="Date when this data was retrieved"
          >
            <Input
              type="date"
              {...register('peers.data_as_of')}
            />
          </FormFieldWrapper>
        </div>
      </section>
    </div>
  );
}
