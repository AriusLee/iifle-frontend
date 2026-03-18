'use client';

import { UseFormReturn, useFieldArray, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FormFieldWrapper, NativeSelect, MultiCheckboxGroup } from '@/components/forms/form-field';
import { Plus, Trash2 } from 'lucide-react';
import type { Stage1Data } from '@/lib/validations/stage-1';

interface SectionProps {
  form: UseFormReturn<Stage1Data>;
}

const PRODUCT_TYPE_OPTIONS = [
  { value: 'product', label: 'Physical Product' },
  { value: 'service', label: 'Service' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'license', label: 'License / Royalty' },
];

const GROWTH_TREND_OPTIONS = [
  { value: 'growing', label: 'Growing' },
  { value: 'stable', label: 'Stable' },
  { value: 'declining', label: 'Declining' },
];

const IP_TYPE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'patents', label: 'Patents' },
  { value: 'trademarks', label: 'Trademarks' },
  { value: 'trade_secrets', label: 'Trade Secrets' },
  { value: 'proprietary_tech', label: 'Proprietary Technology' },
];

const CUSTOMER_TYPE_OPTIONS = [
  { value: 'b2b', label: 'B2B (Business)' },
  { value: 'b2c', label: 'B2C (Consumer)' },
  { value: 'b2g', label: 'B2G (Government)' },
  { value: 'mixed', label: 'Mixed' },
];

const RELATIONSHIP_LENGTH_OPTIONS = [
  { value: 'lt_1yr', label: 'Less than 1 year' },
  { value: '1_3yr', label: '1-3 years' },
  { value: '3_5yr', label: '3-5 years' },
  { value: '5plus', label: '5+ years' },
];

const CONTRACT_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'some', label: 'Some (< 30%)' },
  { value: 'majority', label: 'Majority (30-70%)' },
  { value: 'all', label: 'All / Nearly All (> 70%)' },
];

const DEPENDENCY_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const AGREEMENT_OPTIONS = [
  { value: 'all', label: 'All documented' },
  { value: 'most', label: 'Most documented' },
  { value: 'some', label: 'Some documented' },
  { value: 'none', label: 'None documented' },
];

export function SectionCProducts({ form }: SectionProps) {
  const { register, control, watch, formState: { errors } } = form;
  const watchIpType = watch('product_competitiveness.ip_type');
  const diffText = watch('product_competitiveness.differentiation') || '';

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control,
    name: 'products',
  });

  return (
    <div className="space-y-8">
      {/* C1: Core Offerings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              C1. Core Products & Services
            </h3>
            <p className="text-sm text-muted-foreground">
              List your main revenue-generating products/services (up to 10).
            </p>
          </div>
          {productFields.length < 10 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() =>
                appendProduct({
                  name: '',
                  type: 'product',
                  revenue_share_pct: 0,
                  gross_margin_pct: undefined,
                  growth_trend: 'stable',
                })
              }
            >
              <Plus className="size-4 mr-1" />
              Add Product / Service
            </Button>
          )}
        </div>

        {errors.products?.message && (
          <p className="text-sm text-destructive mb-4">{errors.products.message}</p>
        )}

        {productFields.length === 0 && (
          <p className="text-sm text-muted-foreground italic py-6 text-center border border-dashed rounded-lg">
            No products added yet. Click &quot;Add Product / Service&quot; to add your first offering.
          </p>
        )}

        <div className="space-y-4">
          {productFields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border bg-muted/20 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">
                  Product / Service {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-destructive hover:text-destructive"
                  onClick={() => removeProduct(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-3">
                <FormFieldWrapper
                  label="Name"
                  required
                  error={errors.products?.[index]?.name?.message}
                  className="lg:col-span-2"
                >
                  <Input
                    {...register(`products.${index}.name`)}
                    placeholder="Product/service name"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Type"
                  required
                  error={errors.products?.[index]?.type?.message}
                >
                  <NativeSelect
                    {...register(`products.${index}.type`)}
                    options={PRODUCT_TYPE_OPTIONS}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Revenue Share %"
                  required
                  error={errors.products?.[index]?.revenue_share_pct?.message}
                >
                  <Input
                    type="number"
                    {...register(`products.${index}.revenue_share_pct`)}
                    placeholder="0"
                    min={0}
                    max={100}
                    step={0.1}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Gross Margin %"
                  error={errors.products?.[index]?.gross_margin_pct?.message}
                >
                  <Input
                    type="number"
                    {...register(`products.${index}.gross_margin_pct`)}
                    placeholder="e.g. 40"
                    min={-100}
                    max={100}
                    step={0.1}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Growth Trend"
                  required
                  error={errors.products?.[index]?.growth_trend?.message}
                >
                  <NativeSelect
                    {...register(`products.${index}.growth_trend`)}
                    options={GROWTH_TREND_OPTIONS}
                  />
                </FormFieldWrapper>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* C2: Product Competitiveness */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          C2. Product Competitiveness
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          What makes your offerings stand out in the market.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Key Differentiation"
            required
            error={errors.product_competitiveness?.differentiation?.message}
            className="md:col-span-2"
          >
            <Textarea
              {...register('product_competitiveness.differentiation')}
              placeholder="What makes your product/service unique compared to competitors?"
              rows={3}
              maxLength={500}
            />
            <div className="flex justify-end">
              <span className={`text-xs ${diffText.length > 450 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {diffText.length}/500
              </span>
            </div>
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Intellectual Property"
            error={errors.product_competitiveness?.ip_type?.message}
            className="md:col-span-2"
          >
            <Controller
              name="product_competitiveness.ip_type"
              control={control}
              render={({ field }) => (
                <MultiCheckboxGroup
                  options={IP_TYPE_OPTIONS}
                  value={field.value || []}
                  onChange={field.onChange}
                  columns={3}
                />
              )}
            />
          </FormFieldWrapper>

          {watchIpType?.includes('patents') && (
            <FormFieldWrapper
              label="Number of Patents"
              error={errors.product_competitiveness?.num_patents?.message}
            >
              <Input
                type="number"
                {...register('product_competitiveness.num_patents')}
                placeholder="0"
                min={0}
              />
            </FormFieldWrapper>
          )}

          <FormFieldWrapper
            label="Annual R&D Spending (RM)"
            error={errors.product_competitiveness?.rd_spending?.message}
          >
            <Input
              type="number"
              {...register('product_competitiveness.rd_spending')}
              placeholder="e.g. 500000"
              min={0}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Certifications"
            hint="e.g. ISO 9001, Halal, GMP, CE"
            error={errors.product_competitiveness?.certifications?.message}
            className="md:col-span-2"
          >
            <Input
              {...register('product_competitiveness.certifications')}
              placeholder="e.g. ISO 9001, Halal, HACCP"
            />
          </FormFieldWrapper>
        </div>
      </section>

      <Separator />

      {/* C3: Customer Profile */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          C3. Customer Profile
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Understanding your customer base and concentration risk.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Customer Type"
            required
            error={errors.customers?.customer_type?.message}
          >
            <NativeSelect
              {...register('customers.customer_type')}
              options={CUSTOMER_TYPE_OPTIONS}
              placeholder="Select type"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Active Customers"
            required
            error={errors.customers?.active_customers?.message}
          >
            <Input
              type="number"
              {...register('customers.active_customers')}
              placeholder="e.g. 200"
              min={1}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Top 1 Customer Revenue %"
            required
            error={errors.customers?.top1_revenue_pct?.message}
            hint="Revenue concentration from largest customer"
          >
            <Input
              type="number"
              {...register('customers.top1_revenue_pct')}
              placeholder="e.g. 15"
              min={0}
              max={100}
              step={0.1}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Top 5 Customers Revenue %"
            required
            error={errors.customers?.top5_revenue_pct?.message}
          >
            <Input
              type="number"
              {...register('customers.top5_revenue_pct')}
              placeholder="e.g. 45"
              min={0}
              max={100}
              step={0.1}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Top 10 Customers Revenue %"
            error={errors.customers?.top10_revenue_pct?.message}
          >
            <Input
              type="number"
              {...register('customers.top10_revenue_pct')}
              placeholder="e.g. 65"
              min={0}
              max={100}
              step={0.1}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Average Relationship Length"
            required
            error={errors.customers?.avg_relationship_length?.message}
          >
            <NativeSelect
              {...register('customers.avg_relationship_length')}
              options={RELATIONSHIP_LENGTH_OPTIONS}
              placeholder="Select"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Customer Retention Rate %"
            error={errors.customers?.retention_rate?.message}
            hint="Annual retention rate (optional)"
          >
            <Input
              type="number"
              {...register('customers.retention_rate')}
              placeholder="e.g. 85"
              min={0}
              max={100}
              step={0.1}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Long-term Contracts"
            required
            error={errors.customers?.long_term_contracts?.message}
          >
            <NativeSelect
              {...register('customers.long_term_contracts')}
              options={CONTRACT_OPTIONS}
              placeholder="Select"
            />
          </FormFieldWrapper>
        </div>
      </section>

      <Separator />

      {/* C4: Supply Chain */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          C4. Supply Chain
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Supplier relationships and dependency assessment.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Number of Key Suppliers"
            required
            error={errors.supply_chain?.num_key_suppliers?.message}
          >
            <Input
              type="number"
              {...register('supply_chain.num_key_suppliers')}
              placeholder="e.g. 10"
              min={0}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Single Supplier Dependency"
            required
            error={errors.supply_chain?.single_supplier_dependency?.message}
          >
            <NativeSelect
              {...register('supply_chain.single_supplier_dependency')}
              options={DEPENDENCY_OPTIONS}
              placeholder="Select level"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Supplier Agreements Documented"
            required
            error={errors.supply_chain?.supplier_agreements_documented?.message}
          >
            <NativeSelect
              {...register('supply_chain.supplier_agreements_documented')}
              options={AGREEMENT_OPTIONS}
              placeholder="Select"
            />
          </FormFieldWrapper>
        </div>
      </section>
    </div>
  );
}
