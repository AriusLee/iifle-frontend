import { z } from 'zod';

// ─── Section A: Company Profile ──────────────────────────────────────────────

export const registrationSchema = z.object({
  legal_name: z.string().min(1, 'Company name is required'),
  registration_number: z.string().min(1, 'Registration number is required'),
  date_of_incorporation: z.string().min(1, 'Date is required'),
  company_type: z.enum(['sdn_bhd', 'berhad', 'llp', 'sole_prop', 'partnership']),
  registered_address: z.string().min(1, 'Address is required'),
  operating_address: z.string().optional().or(z.literal('')),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  country_of_incorporation: z.enum(['malaysia', 'singapore', 'others']).default('malaysia'),
  other_jurisdictions: z.array(z.string()).default([]),
});

export const industrySchema = z.object({
  primary_industry: z.enum(['fnb', 'it', 'manufacturing', 'retail', 'logistics', 'property', 'services', 'others']),
  sub_industry: z.string().min(1, 'Sub-industry is required'),
  msic_code: z.string().optional().or(z.literal('')),
  brief_description: z.string().min(1, 'Description is required').max(500, 'Maximum 500 characters'),
});

export const scaleSchema = z.object({
  total_employees: z.coerce.number().int().positive('Must be positive'),
  num_branches: z.coerce.number().int().nonnegative().optional(),
  operating_since: z.coerce.number().int().min(1900, 'Invalid year').max(new Date().getFullYear(), 'Cannot be in the future'),
  geographic_coverage: z.array(z.enum(['local', 'national', 'regional', 'international'])).min(1, 'Select at least one'),
  countries_of_operation: z.array(z.string()).default([]),
});

export const sectionASchema = z.object({
  registration: registrationSchema,
  industry: industrySchema,
  scale: scaleSchema,
});

// ─── Section B: Founder & Leadership ─────────────────────────────────────────

export const founderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.coerce.number().int().min(18, 'Must be at least 18').max(100, 'Must be 100 or less'),
  nationality: z.string().min(1, 'Nationality is required'),
  highest_education: z.enum(['secondary', 'diploma', 'degree', 'masters', 'phd', 'professional', 'emba']),
  education_institution: z.string().optional().or(z.literal('')),
  years_in_industry: z.coerce.number().int().nonnegative('Must be 0 or more'),
  years_business_experience: z.coerce.number().int().nonnegative('Must be 0 or more'),
  previous_companies_founded: z.coerce.number().int().nonnegative().default(0),
  previous_exit_experience: z.enum(['none', 'sold', 'listed', 'both']).default('none'),
  emba_status: z.enum(['none', 'in_progress', 'completed']).default('none'),
  emba_program: z.string().optional().or(z.literal('')),
});

export const coFounderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  ownership_pct: z.coerce.number().min(0, 'Must be 0-100').max(100, 'Must be 0-100'),
  years_with_company: z.coerce.number().int().nonnegative(),
  expertise: z.string().min(1, 'Expertise is required'),
});

export const managementMemberSchema = z.object({
  position: z.string(),
  name: z.string().optional().or(z.literal('')),
  years_in_role: z.coerce.number().int().nonnegative().optional(),
  years_with_company: z.coerce.number().int().nonnegative().optional(),
  background: z.string().optional().or(z.literal('')),
});

export const successionSchema = z.object({
  has_succession_plan: z.enum(['yes', 'in_progress', 'no']),
  management_stable_3yr: z.enum(['yes', 'mostly', 'no']),
  key_person: z.string().min(1, 'Key person is required'),
  key_person_contingency: z.string().min(1, 'Contingency plan is required').max(300, 'Maximum 300 characters'),
});

export const sectionBSchema = z.object({
  founder: founderSchema,
  co_founders: z.array(coFounderSchema).max(5).default([]),
  management_team: z.array(managementMemberSchema).default([]),
  succession: successionSchema,
});

// ─── Section C: Products & Services ──────────────────────────────────────────

export const productOfferingSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  type: z.enum(['product', 'service', 'subscription', 'license']),
  revenue_share_pct: z.coerce.number().min(0).max(100),
  gross_margin_pct: z.coerce.number().min(-100).max(100).optional(),
  growth_trend: z.enum(['growing', 'stable', 'declining']),
});

export const productCompetitivenessSchema = z.object({
  differentiation: z.string().min(1, 'Differentiation is required').max(500, 'Maximum 500 characters'),
  ip_type: z.array(z.enum(['none', 'patents', 'trademarks', 'trade_secrets', 'proprietary_tech'])),
  num_patents: z.coerce.number().int().nonnegative().optional(),
  rd_spending: z.coerce.number().nonnegative().optional(),
  certifications: z.string().optional().or(z.literal('')),
});

export const customerProfileSchema = z.object({
  customer_type: z.enum(['b2b', 'b2c', 'b2g', 'mixed']),
  active_customers: z.coerce.number().int().positive('Must be at least 1'),
  top1_revenue_pct: z.coerce.number().min(0).max(100),
  top5_revenue_pct: z.coerce.number().min(0).max(100),
  top10_revenue_pct: z.coerce.number().min(0).max(100).optional(),
  avg_relationship_length: z.enum(['lt_1yr', '1_3yr', '3_5yr', '5plus']),
  retention_rate: z.coerce.number().min(0).max(100).optional(),
  long_term_contracts: z.enum(['none', 'some', 'majority', 'all']),
});

export const supplyChainSchema = z.object({
  num_key_suppliers: z.coerce.number().int().nonnegative(),
  single_supplier_dependency: z.enum(['none', 'low', 'moderate', 'high', 'critical']),
  supplier_agreements_documented: z.enum(['all', 'most', 'some', 'none']),
});

export const sectionCSchema = z.object({
  products: z.array(productOfferingSchema).min(1, 'At least one product/service required').max(10),
  product_competitiveness: productCompetitivenessSchema,
  customers: customerProfileSchema,
  supply_chain: supplyChainSchema,
});

// ─── Section D: Business Model ───────────────────────────────────────────────

export const revenueModelSchema = z.object({
  description: z.string().min(1, 'Description is required').max(300, 'Maximum 300 characters'),
  model_types: z.array(z.enum(['product_sales', 'service_fees', 'subscription', 'commission', 'licensing', 'franchise', 'rental', 'others'])).min(1, 'Select at least one'),
  recurring_revenue_pct: z.coerce.number().min(0).max(100),
  is_seasonal: z.enum(['not_seasonal', 'mildly', 'highly']),
  peak_months: z.array(z.coerce.number().int().min(1).max(12)).default([]),
});

export const scalabilitySchema = z.object({
  replicable: z.enum(['easily', 'with_effort', 'difficult', 'no']),
  documented_sops: z.enum(['comprehensive', 'partial', 'minimal', 'none']),
  central_facility: z.enum(['yes', 'planned', 'no', 'na']).optional(),
  training_weeks: z.coerce.number().int().positive('Must be at least 1 week'),
  expansion_plan_3yr: z.string().min(1, 'Expansion plan is required').max(300, 'Maximum 300 characters'),
});

export const competitiveLandscapeSchema = z.object({
  top3_competitors: z.array(z.string()).min(1, 'At least one competitor required').max(3),
  estimated_market_share: z.enum(['lt_1pct', '1_5pct', '5_10pct', '10_25pct', '25_50pct', 'gt_50pct', 'unknown']),
  segment_leader: z.boolean(),
  segment_leader_detail: z.string().optional().or(z.literal('')),
  competitive_advantages: z.array(z.enum(['price', 'quality', 'brand', 'technology', 'speed', 'service', 'location', 'network', 'others'])).min(1, 'Select at least one'),
  barriers_to_entry: z.enum(['very_high', 'high', 'moderate', 'low', 'none']),
});

export const sectionDSchema = z.object({
  revenue_model: revenueModelSchema,
  scalability: scalabilitySchema,
  competitive_landscape: competitiveLandscapeSchema,
});

// ─── Section E: Basic Financials ─────────────────────────────────────────────

export const yearlyFinancialsSchema = z.object({
  revenue: z.coerce.number().nonnegative('Revenue must be non-negative'),
  cogs: z.coerce.number().nonnegative('COGS must be non-negative'),
  operating_expenses: z.coerce.number().nonnegative('Operating expenses must be non-negative'),
  pbt: z.coerce.number(),
  pat: z.coerce.number(),
});

export const basicFinancialsSchema = z.object({
  fy_end_month: z.coerce.number().int().min(1).max(12),
  year_t2: yearlyFinancialsSchema,
  year_t1: yearlyFinancialsSchema,
  year_t0: yearlyFinancialsSchema,
});

export const balanceSheetSchema = z.object({
  cash: z.coerce.number().nonnegative(),
  receivables: z.coerce.number().nonnegative(),
  inventory: z.coerce.number().nonnegative().optional(),
  current_assets: z.coerce.number().nonnegative(),
  fixed_assets: z.coerce.number().nonnegative(),
  total_assets: z.coerce.number().nonnegative(),
  current_liabilities: z.coerce.number().nonnegative(),
  bank_borrowings: z.coerce.number().nonnegative(),
  total_liabilities: z.coerce.number().nonnegative(),
  paid_up_capital: z.coerce.number().nonnegative(),
});

export const cashFlowBasicsSchema = z.object({
  cash_flow_positive: z.enum(['yes_consistently', 'sometimes', 'no']),
  monthly_opex: z.coerce.number().nonnegative(),
  current_cash: z.coerce.number().nonnegative(),
  customer_pay_days: z.coerce.number().int().nonnegative(),
  supplier_pay_days: z.coerce.number().int().nonnegative(),
});

export const auditStatusSchema = z.object({
  has_audited: z.boolean(),
  years_audited: z.coerce.number().int().nonnegative().optional(),
  auditor_name: z.string().optional().or(z.literal('')),
  aob_registered: z.enum(['yes', 'no', 'unknown']).optional(),
  accounting_standard: z.enum(['mpers', 'mfrs', 'unknown']),
});

export const sectionESchema = z.object({
  financials: basicFinancialsSchema,
  balance_sheet: balanceSheetSchema,
  cash_flow: cashFlowBasicsSchema,
  audit_status: auditStatusSchema,
});

// ─── Section F: Growth & Ambition ────────────────────────────────────────────

export const growthPlansSchema = z.object({
  revenue_target_yr1: z.coerce.number().positive('Must be positive'),
  revenue_target_yr3: z.coerce.number().positive('Must be positive'),
  revenue_target_yr5: z.coerce.number().positive().optional(),
  growth_strategy: z.array(z.enum(['organic', 'new_products', 'new_markets', 'acquisitions', 'franchising', 'online', 'partnerships'])).min(1, 'Select at least one'),
  biggest_obstacle: z.string().min(1, 'Please describe the biggest obstacle').max(300, 'Maximum 300 characters'),
});

export const capitalIntentionsSchema = z.object({
  looking_to_raise: z.enum(['yes_actively', 'considering', 'not_now', 'no']),
  raise_amount: z.coerce.number().positive().optional(),
  raise_purpose: z.array(z.enum(['expansion', 'working_capital', 'rd', 'ma', 'debt_repayment', 'ipo_prep', 'others'])).default([]),
  prior_funding: z.array(z.enum(['never', 'angel', 'vc', 'pe', 'bank_loan', 'government_grant', 'others'])).default([]),
  prior_amount: z.coerce.number().nonnegative().optional(),
});

export const ipoAspirationSchema = z.object({
  interest: z.enum(['within_3yr', 'within_5yr', 'interested_unsure', 'not_interested', 'dont_know']),
  preferred_markets: z.array(z.string()).default([]),
  engaged_advisors: z.enum(['yes', 'in_discussions', 'no']).optional(),
  biggest_barrier: z.string().optional().or(z.literal('')),
});

export const exitPreferenceSchema = z.object({
  long_term_goal: z.enum(['keep_forever', 'ipo', 'sell', 'next_generation', 'dont_know']),
  liquidity_timeline: z.enum(['1_2yr', '3_5yr', '5_10yr', 'no_timeline']).optional(),
});

export const sectionFSchema = z.object({
  growth_plans: growthPlansSchema,
  capital_intentions: capitalIntentionsSchema,
  ipo_aspiration: ipoAspirationSchema,
  exit_preference: exitPreferenceSchema,
});

// ─── Section G: Team & Organization ──────────────────────────────────────────

export const orgMaturitySchema = z.object({
  formal_org_chart: z.enum(['yes', 'partial', 'no']),
  num_departments: z.coerce.number().int().positive('Must be at least 1'),
  performance_reviews: z.enum(['quarterly', 'semi_annually', 'annually', 'rarely', 'never']),
  training_program: z.enum(['systematic_733', 'periodic', 'adhoc', 'none']),
  turnover_rate: z.coerce.number().min(0).max(100).optional(),
  hr_policies: z.enum(['comprehensive', 'basic', 'none']),
});

export const cultureValuesSchema = z.object({
  documented_vmv: z.enum(['all_three', 'some', 'none']),
  vision: z.string().max(200, 'Maximum 200 characters').optional().or(z.literal('')),
  mission: z.string().max(200, 'Maximum 200 characters').optional().or(z.literal('')),
  core_values: z.string().max(200, 'Maximum 200 characters').optional().or(z.literal('')),
});

export const sectionGSchema = z.object({
  org_maturity: orgMaturitySchema,
  culture: cultureValuesSchema,
});

// ─── Full Stage 1 Schema (flat structure for react-hook-form) ────────────────

export const stage1Schema = z.object({
  // Section A
  registration: registrationSchema.optional(),
  industry: industrySchema.optional(),
  scale: scaleSchema.optional(),
  // Section B
  founder: founderSchema.optional(),
  co_founders: z.array(coFounderSchema).max(5).default([]),
  management_team: z.array(managementMemberSchema).default([]),
  succession: successionSchema.optional(),
  // Section C
  products: z.array(productOfferingSchema).default([]),
  product_competitiveness: productCompetitivenessSchema.optional(),
  customers: customerProfileSchema.optional(),
  supply_chain: supplyChainSchema.optional(),
  // Section D
  revenue_model: revenueModelSchema.optional(),
  scalability: scalabilitySchema.optional(),
  competitive_landscape: competitiveLandscapeSchema.optional(),
  // Section E
  financials: basicFinancialsSchema.optional(),
  balance_sheet: balanceSheetSchema.optional(),
  cash_flow: cashFlowBasicsSchema.optional(),
  audit_status: auditStatusSchema.optional(),
  // Section F
  growth_plans: growthPlansSchema.optional(),
  capital_intentions: capitalIntentionsSchema.optional(),
  ipo_aspiration: ipoAspirationSchema.optional(),
  exit_preference: exitPreferenceSchema.optional(),
  // Section G
  org_maturity: orgMaturitySchema.optional(),
  culture: cultureValuesSchema.optional(),
});

export type Stage1Data = z.infer<typeof stage1Schema>;
export type Registration = z.infer<typeof registrationSchema>;
export type Industry = z.infer<typeof industrySchema>;
export type Scale = z.infer<typeof scaleSchema>;
export type Founder = z.infer<typeof founderSchema>;
export type CoFounder = z.infer<typeof coFounderSchema>;
export type ManagementMember = z.infer<typeof managementMemberSchema>;
export type Succession = z.infer<typeof successionSchema>;
export type ProductOffering = z.infer<typeof productOfferingSchema>;
export type ProductCompetitiveness = z.infer<typeof productCompetitivenessSchema>;
export type CustomerProfile = z.infer<typeof customerProfileSchema>;
export type SupplyChain = z.infer<typeof supplyChainSchema>;
export type RevenueModel = z.infer<typeof revenueModelSchema>;
export type Scalability = z.infer<typeof scalabilitySchema>;
export type CompetitiveLandscape = z.infer<typeof competitiveLandscapeSchema>;
export type YearlyFinancials = z.infer<typeof yearlyFinancialsSchema>;
export type BasicFinancials = z.infer<typeof basicFinancialsSchema>;
export type BalanceSheet = z.infer<typeof balanceSheetSchema>;
export type CashFlowBasics = z.infer<typeof cashFlowBasicsSchema>;
export type AuditStatus = z.infer<typeof auditStatusSchema>;
export type GrowthPlans = z.infer<typeof growthPlansSchema>;
export type CapitalIntentions = z.infer<typeof capitalIntentionsSchema>;
export type IpoAspiration = z.infer<typeof ipoAspirationSchema>;
export type ExitPreference = z.infer<typeof exitPreferenceSchema>;
export type OrgMaturity = z.infer<typeof orgMaturitySchema>;
export type CultureValues = z.infer<typeof cultureValuesSchema>;
