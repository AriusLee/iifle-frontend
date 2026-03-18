'use client';

import { UseFormReturn, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { FormFieldWrapper, NativeSelect, MultiCheckboxGroup } from '@/components/forms/form-field';
import type { Stage1Data } from '@/lib/validations/stage-1';

interface SectionProps {
  form: UseFormReturn<Stage1Data>;
}

const MODEL_TYPE_OPTIONS = [
  { value: 'product_sales', label: 'Product Sales' },
  { value: 'service_fees', label: 'Service Fees' },
  { value: 'subscription', label: 'Subscription / Recurring' },
  { value: 'commission', label: 'Commission' },
  { value: 'licensing', label: 'Licensing' },
  { value: 'franchise', label: 'Franchise Fees' },
  { value: 'rental', label: 'Rental / Leasing' },
  { value: 'others', label: 'Others' },
];

const SEASONAL_OPTIONS = [
  { value: 'not_seasonal', label: 'Not seasonal' },
  { value: 'mildly', label: 'Mildly seasonal' },
  { value: 'highly', label: 'Highly seasonal' },
];

const MONTH_OPTIONS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const REPLICABLE_OPTIONS = [
  { value: 'easily', label: 'Easily replicable' },
  { value: 'with_effort', label: 'With some effort' },
  { value: 'difficult', label: 'Difficult' },
  { value: 'no', label: 'Not replicable' },
];

const SOP_OPTIONS = [
  { value: 'comprehensive', label: 'Comprehensive' },
  { value: 'partial', label: 'Partial' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'none', label: 'None' },
];

const FACILITY_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'planned', label: 'Planned' },
  { value: 'no', label: 'No' },
  { value: 'na', label: 'Not Applicable' },
];

const MARKET_SHARE_OPTIONS = [
  { value: 'lt_1pct', label: '< 1%' },
  { value: '1_5pct', label: '1-5%' },
  { value: '5_10pct', label: '5-10%' },
  { value: '10_25pct', label: '10-25%' },
  { value: '25_50pct', label: '25-50%' },
  { value: 'gt_50pct', label: '> 50%' },
  { value: 'unknown', label: 'Unknown' },
];

const ADVANTAGE_OPTIONS = [
  { value: 'price', label: 'Price' },
  { value: 'quality', label: 'Quality' },
  { value: 'brand', label: 'Brand' },
  { value: 'technology', label: 'Technology' },
  { value: 'speed', label: 'Speed / Delivery' },
  { value: 'service', label: 'Service' },
  { value: 'location', label: 'Location' },
  { value: 'network', label: 'Network / Relationships' },
  { value: 'others', label: 'Others' },
];

const BARRIER_OPTIONS = [
  { value: 'very_high', label: 'Very High' },
  { value: 'high', label: 'High' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'low', label: 'Low' },
  { value: 'none', label: 'None' },
];

export function SectionDBusiness({ form }: SectionProps) {
  const { register, control, watch, formState: { errors } } = form;
  const watchSeasonal = watch('revenue_model.is_seasonal');
  const watchSegmentLeader = watch('competitive_landscape.segment_leader');
  const descText = watch('revenue_model.description') || '';
  const expansionText = watch('scalability.expansion_plan_3yr') || '';

  return (
    <div className="space-y-8">
      {/* D1: Revenue Model */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          D1. Revenue Model
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          How your business generates revenue and its characteristics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Revenue Model Description"
            required
            error={errors.revenue_model?.description?.message}
            className="md:col-span-2"
          >
            <Textarea
              {...register('revenue_model.description')}
              placeholder="Briefly describe how your business makes money"
              rows={3}
              maxLength={300}
            />
            <div className="flex justify-end">
              <span className={`text-xs ${descText.length > 270 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {descText.length}/300
              </span>
            </div>
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Revenue Model Types"
            required
            error={errors.revenue_model?.model_types?.message}
            className="md:col-span-2"
          >
            <Controller
              name="revenue_model.model_types"
              control={control}
              render={({ field }) => (
                <MultiCheckboxGroup
                  options={MODEL_TYPE_OPTIONS}
                  value={field.value || []}
                  onChange={field.onChange}
                  columns={4}
                />
              )}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Recurring Revenue %"
            required
            error={errors.revenue_model?.recurring_revenue_pct?.message}
            hint="Percentage of revenue that is recurring or contractually committed"
          >
            <Input
              type="number"
              {...register('revenue_model.recurring_revenue_pct')}
              placeholder="e.g. 30"
              min={0}
              max={100}
              step={1}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Seasonality"
            required
            error={errors.revenue_model?.is_seasonal?.message}
          >
            <NativeSelect
              {...register('revenue_model.is_seasonal')}
              options={SEASONAL_OPTIONS}
              placeholder="Select"
            />
          </FormFieldWrapper>

          {(watchSeasonal === 'mildly' || watchSeasonal === 'highly') && (
            <FormFieldWrapper
              label="Peak Months"
              hint="Select the months with highest revenue"
              className="md:col-span-2"
            >
              <Controller
                name="revenue_model.peak_months"
                control={control}
                render={({ field }) => (
                  <MultiCheckboxGroup
                    options={MONTH_OPTIONS}
                    value={(field.value || []).map(String)}
                    onChange={(vals) => field.onChange(vals.map(Number))}
                    columns={4}
                  />
                )}
              />
            </FormFieldWrapper>
          )}
        </div>
      </section>

      <Separator />

      {/* D2: Scalability */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          D2. Scalability
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          How easily your business model can scale and be replicated.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Business Replicability"
            required
            error={errors.scalability?.replicable?.message}
          >
            <NativeSelect
              {...register('scalability.replicable')}
              options={REPLICABLE_OPTIONS}
              placeholder="Select"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Documented SOPs"
            required
            error={errors.scalability?.documented_sops?.message}
          >
            <NativeSelect
              {...register('scalability.documented_sops')}
              options={SOP_OPTIONS}
              placeholder="Select"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Central / Commissary Facility"
            error={errors.scalability?.central_facility?.message}
          >
            <NativeSelect
              {...register('scalability.central_facility')}
              options={FACILITY_OPTIONS}
              placeholder="Select"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Training Time (Weeks)"
            required
            error={errors.scalability?.training_weeks?.message}
            hint="Weeks to train a new branch/outlet team"
          >
            <Input
              type="number"
              {...register('scalability.training_weeks')}
              placeholder="e.g. 4"
              min={1}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="3-Year Expansion Plan"
            required
            error={errors.scalability?.expansion_plan_3yr?.message}
            className="md:col-span-2"
          >
            <Textarea
              {...register('scalability.expansion_plan_3yr')}
              placeholder="Describe your expansion plans for the next 3 years"
              rows={3}
              maxLength={300}
            />
            <div className="flex justify-end">
              <span className={`text-xs ${expansionText.length > 270 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {expansionText.length}/300
              </span>
            </div>
          </FormFieldWrapper>
        </div>
      </section>

      <Separator />

      {/* D3: Competitive Landscape */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          D3. Competitive Landscape
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your market position and competitive dynamics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Top 3 Competitors"
            required
            error={errors.competitive_landscape?.top3_competitors?.message}
            className="md:col-span-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                {...register('competitive_landscape.top3_competitors.0')}
                placeholder="Competitor 1"
              />
              <Input
                {...register('competitive_landscape.top3_competitors.1')}
                placeholder="Competitor 2"
              />
              <Input
                {...register('competitive_landscape.top3_competitors.2')}
                placeholder="Competitor 3"
              />
            </div>
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Estimated Market Share"
            required
            error={errors.competitive_landscape?.estimated_market_share?.message}
          >
            <NativeSelect
              {...register('competitive_landscape.estimated_market_share')}
              options={MARKET_SHARE_OPTIONS}
              placeholder="Select"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Segment Leader?"
            error={errors.competitive_landscape?.segment_leader?.message}
          >
            <div className="flex items-center gap-3 h-8">
              <Controller
                name="competitive_landscape.segment_leader"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.value || false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="size-4 rounded border border-input accent-primary cursor-pointer"
                    />
                    Yes, we are the segment leader
                  </label>
                )}
              />
            </div>
          </FormFieldWrapper>

          {watchSegmentLeader && (
            <FormFieldWrapper
              label="Segment Leadership Details"
              error={errors.competitive_landscape?.segment_leader_detail?.message}
              className="md:col-span-2"
            >
              <Input
                {...register('competitive_landscape.segment_leader_detail')}
                placeholder="In which segment or region are you the leader?"
              />
            </FormFieldWrapper>
          )}

          <FormFieldWrapper
            label="Competitive Advantages"
            required
            error={errors.competitive_landscape?.competitive_advantages?.message}
            className="md:col-span-2"
          >
            <Controller
              name="competitive_landscape.competitive_advantages"
              control={control}
              render={({ field }) => (
                <MultiCheckboxGroup
                  options={ADVANTAGE_OPTIONS}
                  value={field.value || []}
                  onChange={field.onChange}
                  columns={3}
                />
              )}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Barriers to Entry"
            required
            error={errors.competitive_landscape?.barriers_to_entry?.message}
          >
            <NativeSelect
              {...register('competitive_landscape.barriers_to_entry')}
              options={BARRIER_OPTIONS}
              placeholder="Select"
            />
          </FormFieldWrapper>
        </div>
      </section>
    </div>
  );
}
