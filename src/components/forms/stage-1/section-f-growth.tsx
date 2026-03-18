'use client';

import { UseFormReturn, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { FormFieldWrapper, NativeSelect, MultiCheckboxGroup } from '@/components/forms/form-field';
import type { Stage1Data } from '@/lib/validations/stage-1';

interface SectionProps {
  form: UseFormReturn<Stage1Data>;
}

const GROWTH_STRATEGY_OPTIONS = [
  { value: 'organic', label: 'Organic Growth' },
  { value: 'new_products', label: 'New Products / Services' },
  { value: 'new_markets', label: 'New Markets / Geographies' },
  { value: 'acquisitions', label: 'Acquisitions (M&A)' },
  { value: 'franchising', label: 'Franchising' },
  { value: 'online', label: 'Digital / Online Channels' },
  { value: 'partnerships', label: 'Strategic Partnerships' },
];

const RAISE_STATUS_OPTIONS = [
  { value: 'yes_actively', label: 'Yes, actively raising' },
  { value: 'considering', label: 'Considering it' },
  { value: 'not_now', label: 'Not right now' },
  { value: 'no', label: 'No plans to raise' },
];

const RAISE_PURPOSE_OPTIONS = [
  { value: 'expansion', label: 'Business Expansion' },
  { value: 'working_capital', label: 'Working Capital' },
  { value: 'rd', label: 'Research & Development' },
  { value: 'ma', label: 'Mergers & Acquisitions' },
  { value: 'debt_repayment', label: 'Debt Repayment' },
  { value: 'ipo_prep', label: 'IPO Preparation' },
  { value: 'others', label: 'Others' },
];

const PRIOR_FUNDING_OPTIONS = [
  { value: 'never', label: 'Never raised external funding' },
  { value: 'angel', label: 'Angel Investors' },
  { value: 'vc', label: 'Venture Capital' },
  { value: 'pe', label: 'Private Equity' },
  { value: 'bank_loan', label: 'Bank Loans' },
  { value: 'government_grant', label: 'Government Grants' },
  { value: 'others', label: 'Others' },
];

const IPO_INTEREST_OPTIONS = [
  { value: 'within_3yr', label: 'Within 3 years' },
  { value: 'within_5yr', label: 'Within 5 years' },
  { value: 'interested_unsure', label: 'Interested but timing unsure' },
  { value: 'not_interested', label: 'Not interested' },
  { value: 'dont_know', label: "Don't know yet" },
];

const MARKET_OPTIONS = [
  { value: 'bursa_main', label: 'Bursa Main Market' },
  { value: 'bursa_ace', label: 'Bursa ACE Market' },
  { value: 'bursa_leap', label: 'Bursa LEAP Market' },
  { value: 'nasdaq', label: 'Nasdaq' },
  { value: 'sgx', label: 'SGX (Singapore)' },
  { value: 'asx', label: 'ASX (Australia)' },
  { value: 'aim', label: 'AIM (London)' },
  { value: 'hkex', label: 'HKEX (Hong Kong)' },
  { value: 'dont_know', label: "Don't know yet" },
];

const ADVISOR_OPTIONS = [
  { value: 'yes', label: 'Yes, engaged' },
  { value: 'in_discussions', label: 'In discussions' },
  { value: 'no', label: 'No' },
];

const GOAL_OPTIONS = [
  { value: 'keep_forever', label: 'Keep and grow forever' },
  { value: 'ipo', label: 'IPO / Public listing' },
  { value: 'sell', label: 'Sell the business (trade sale / M&A)' },
  { value: 'next_generation', label: 'Pass to next generation' },
  { value: 'dont_know', label: "Don't know yet" },
];

const TIMELINE_OPTIONS = [
  { value: '1_2yr', label: '1-2 years' },
  { value: '3_5yr', label: '3-5 years' },
  { value: '5_10yr', label: '5-10 years' },
  { value: 'no_timeline', label: 'No timeline' },
];

export function SectionFGrowth({ form }: SectionProps) {
  const { register, control, watch, formState: { errors } } = form;
  const watchRaising = watch('capital_intentions.looking_to_raise');
  const watchIpoInterest = watch('ipo_aspiration.interest');
  const obstacleText = watch('growth_plans.biggest_obstacle') || '';
  const watchPriorFunding = watch('capital_intentions.prior_funding');

  const showRaiseDetails = watchRaising === 'yes_actively' || watchRaising === 'considering';
  const showIpoDetails = watchIpoInterest !== 'not_interested' && watchIpoInterest !== 'dont_know';
  const showPriorAmount = watchPriorFunding && !watchPriorFunding.includes('never') && watchPriorFunding.length > 0;

  return (
    <div className="space-y-8">
      {/* F1: Growth Plans */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          F1. Growth Plans
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Revenue targets and growth strategy for the next 1-5 years.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Revenue Target Year 1 (RM)"
            required
            error={errors.growth_plans?.revenue_target_yr1?.message}
          >
            <Input
              type="number"
              {...register('growth_plans.revenue_target_yr1')}
              placeholder="e.g. 10000000"
              min={0}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Revenue Target Year 3 (RM)"
            required
            error={errors.growth_plans?.revenue_target_yr3?.message}
          >
            <Input
              type="number"
              {...register('growth_plans.revenue_target_yr3')}
              placeholder="e.g. 30000000"
              min={0}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Revenue Target Year 5 (RM)"
            error={errors.growth_plans?.revenue_target_yr5?.message}
          >
            <Input
              type="number"
              {...register('growth_plans.revenue_target_yr5')}
              placeholder="e.g. 100000000"
              min={0}
            />
          </FormFieldWrapper>

          <div /> {/* spacer */}

          <FormFieldWrapper
            label="Growth Strategy"
            required
            error={errors.growth_plans?.growth_strategy?.message}
            className="md:col-span-2"
          >
            <Controller
              name="growth_plans.growth_strategy"
              control={control}
              render={({ field }) => (
                <MultiCheckboxGroup
                  options={GROWTH_STRATEGY_OPTIONS}
                  value={field.value || []}
                  onChange={field.onChange}
                  columns={3}
                />
              )}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Biggest Obstacle to Growth"
            required
            error={errors.growth_plans?.biggest_obstacle?.message}
            className="md:col-span-2"
          >
            <Textarea
              {...register('growth_plans.biggest_obstacle')}
              placeholder="What is the single biggest challenge holding your company back from growing faster?"
              rows={3}
              maxLength={300}
            />
            <div className="flex justify-end">
              <span className={`text-xs ${obstacleText.length > 270 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {obstacleText.length}/300
              </span>
            </div>
          </FormFieldWrapper>
        </div>
      </section>

      <Separator />

      {/* F2: Capital Intentions */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          F2. Capital Intentions
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Current and past fundraising activity.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Looking to Raise Capital?"
            required
            error={errors.capital_intentions?.looking_to_raise?.message}
          >
            <NativeSelect
              {...register('capital_intentions.looking_to_raise')}
              options={RAISE_STATUS_OPTIONS}
              placeholder="Select"
            />
          </FormFieldWrapper>

          {showRaiseDetails && (
            <>
              <FormFieldWrapper
                label="Target Raise Amount (RM)"
                error={errors.capital_intentions?.raise_amount?.message}
              >
                <Input
                  type="number"
                  {...register('capital_intentions.raise_amount')}
                  placeholder="e.g. 5000000"
                  min={0}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Purpose of Fundraise"
                error={errors.capital_intentions?.raise_purpose?.message}
                className="md:col-span-2"
              >
                <Controller
                  name="capital_intentions.raise_purpose"
                  control={control}
                  render={({ field }) => (
                    <MultiCheckboxGroup
                      options={RAISE_PURPOSE_OPTIONS}
                      value={field.value || []}
                      onChange={field.onChange}
                      columns={3}
                    />
                  )}
                />
              </FormFieldWrapper>
            </>
          )}

          <FormFieldWrapper
            label="Prior Funding Sources"
            error={errors.capital_intentions?.prior_funding?.message}
            className="md:col-span-2"
          >
            <Controller
              name="capital_intentions.prior_funding"
              control={control}
              render={({ field }) => (
                <MultiCheckboxGroup
                  options={PRIOR_FUNDING_OPTIONS}
                  value={field.value || []}
                  onChange={field.onChange}
                  columns={3}
                />
              )}
            />
          </FormFieldWrapper>

          {showPriorAmount && (
            <FormFieldWrapper
              label="Total Prior Funding Raised (RM)"
              error={errors.capital_intentions?.prior_amount?.message}
            >
              <Input
                type="number"
                {...register('capital_intentions.prior_amount')}
                placeholder="e.g. 2000000"
                min={0}
              />
            </FormFieldWrapper>
          )}
        </div>
      </section>

      <Separator />

      {/* F3: IPO / Listing Aspiration */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          F3. IPO / Listing Aspiration
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Interest in public listing and capital markets.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="IPO Interest"
            required
            error={errors.ipo_aspiration?.interest?.message}
          >
            <NativeSelect
              {...register('ipo_aspiration.interest')}
              options={IPO_INTEREST_OPTIONS}
              placeholder="Select"
            />
          </FormFieldWrapper>

          <div /> {/* spacer */}

          {showIpoDetails && (
            <>
              <FormFieldWrapper
                label="Preferred Markets"
                error={errors.ipo_aspiration?.preferred_markets?.message}
                className="md:col-span-2"
              >
                <Controller
                  name="ipo_aspiration.preferred_markets"
                  control={control}
                  render={({ field }) => (
                    <MultiCheckboxGroup
                      options={MARKET_OPTIONS}
                      value={field.value || []}
                      onChange={field.onChange}
                      columns={3}
                    />
                  )}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Engaged Listing Advisors?"
                error={errors.ipo_aspiration?.engaged_advisors?.message}
              >
                <NativeSelect
                  {...register('ipo_aspiration.engaged_advisors')}
                  options={ADVISOR_OPTIONS}
                  placeholder="Select"
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Biggest Barrier to Listing"
                error={errors.ipo_aspiration?.biggest_barrier?.message}
              >
                <Input
                  {...register('ipo_aspiration.biggest_barrier')}
                  placeholder="e.g. Revenue threshold, governance readiness"
                />
              </FormFieldWrapper>
            </>
          )}
        </div>
      </section>

      <Separator />

      {/* F4: Exit Preference */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          F4. Exit Preference
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Long-term vision for ownership and liquidity.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormFieldWrapper
            label="Long-term Goal"
            required
            error={errors.exit_preference?.long_term_goal?.message}
          >
            <NativeSelect
              {...register('exit_preference.long_term_goal')}
              options={GOAL_OPTIONS}
              placeholder="Select"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Liquidity Timeline"
            error={errors.exit_preference?.liquidity_timeline?.message}
          >
            <NativeSelect
              {...register('exit_preference.liquidity_timeline')}
              options={TIMELINE_OPTIONS}
              placeholder="Select"
            />
          </FormFieldWrapper>
        </div>
      </section>
    </div>
  );
}
