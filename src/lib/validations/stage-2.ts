import { z } from 'zod';

// ─── Section A: Audited Financial Statements ─────────────────────────────────

export const auditInfoSchema = z.object({
  has_audited_accounts: z.boolean().default(false),
  years_audited: z.coerce.number().int().min(0).default(0),
  auditor_name: z.string().optional().or(z.literal('')),
  auditor_firm: z.string().optional().or(z.literal('')),
  aob_registered: z.enum(['yes', 'no', 'unknown']).default('unknown'),
  accounting_standard: z.enum(['mpers', 'mfrs', 'ifrs', 'unknown']).default('unknown'),
  audit_opinion: z.enum(['unqualified', 'qualified', 'adverse', 'disclaimer', 'unknown']).default('unknown'),
  audit_qualifications: z.string().optional().or(z.literal('')),
  latest_audit_fy_end: z.string().optional().or(z.literal('')),
  management_letter_issues: z.string().optional().or(z.literal('')),
});

export const sectionASchema = z.object({
  audit_info: auditInfoSchema.optional(),
  audited_documents: z.object({
    document_ids: z.array(z.string()).default([]),
    years_covered: z.array(z.coerce.number()).default([]),
  }).optional(),
});

// ─── Section B: Detailed Income Statement (3yr) ─────────────────────────────

export const incomeStatementYearSchema = z.object({
  fiscal_year: z.coerce.number().int(),
  total_revenue: z.coerce.number().default(0),
  other_income: z.coerce.number().default(0),
  cost_of_goods_sold: z.coerce.number().default(0),
  gross_profit: z.coerce.number().default(0),
  staff_costs: z.coerce.number().default(0),
  rental_expenses: z.coerce.number().default(0),
  depreciation_amortization: z.coerce.number().default(0),
  marketing_expenses: z.coerce.number().default(0),
  administrative_expenses: z.coerce.number().default(0),
  other_operating_expenses: z.coerce.number().default(0),
  total_operating_expenses: z.coerce.number().default(0),
  ebitda: z.coerce.number().default(0),
  ebit: z.coerce.number().default(0),
  interest_income: z.coerce.number().default(0),
  interest_expense: z.coerce.number().default(0),
  net_finance_cost: z.coerce.number().default(0),
  exceptional_items: z.coerce.number().default(0),
  profit_before_tax: z.coerce.number().default(0),
  tax_expense: z.coerce.number().default(0),
  profit_after_tax: z.coerce.number().default(0),
});

export const sectionBSchema = z.object({
  fy_end_month: z.coerce.number().int().min(1).max(12),
  year_t2: incomeStatementYearSchema.optional(),
  year_t1: incomeStatementYearSchema.optional(),
  year_t0: incomeStatementYearSchema.optional(),
});

// ─── Section C: Detailed Balance Sheet (3yr) ─────────────────────────────────

export const balanceSheetYearSchema = z.object({
  fiscal_year: z.coerce.number().int(),
  cash_and_equivalents: z.coerce.number().default(0),
  trade_receivables: z.coerce.number().default(0),
  other_receivables: z.coerce.number().default(0),
  inventory: z.coerce.number().default(0),
  prepayments: z.coerce.number().default(0),
  other_current_assets: z.coerce.number().default(0),
  total_current_assets: z.coerce.number().default(0),
  property_plant_equipment: z.coerce.number().default(0),
  right_of_use_assets: z.coerce.number().default(0),
  intangible_assets: z.coerce.number().default(0),
  goodwill: z.coerce.number().default(0),
  investment_properties: z.coerce.number().default(0),
  investments: z.coerce.number().default(0),
  deferred_tax_assets: z.coerce.number().default(0),
  other_non_current_assets: z.coerce.number().default(0),
  total_non_current_assets: z.coerce.number().default(0),
  total_assets: z.coerce.number().default(0),
  trade_payables: z.coerce.number().default(0),
  other_payables: z.coerce.number().default(0),
  short_term_borrowings: z.coerce.number().default(0),
  lease_liabilities_current: z.coerce.number().default(0),
  tax_payable: z.coerce.number().default(0),
  other_current_liabilities: z.coerce.number().default(0),
  total_current_liabilities: z.coerce.number().default(0),
  long_term_borrowings: z.coerce.number().default(0),
  lease_liabilities_non_current: z.coerce.number().default(0),
  deferred_tax_liabilities: z.coerce.number().default(0),
  provisions: z.coerce.number().default(0),
  other_non_current_liabilities: z.coerce.number().default(0),
  total_non_current_liabilities: z.coerce.number().default(0),
  total_liabilities: z.coerce.number().default(0),
  paid_up_capital: z.coerce.number().default(0),
  share_premium: z.coerce.number().default(0),
  retained_earnings: z.coerce.number().default(0),
  other_reserves: z.coerce.number().default(0),
  non_controlling_interests: z.coerce.number().default(0),
  total_equity: z.coerce.number().default(0),
});

export const sectionCSchema = z.object({
  year_t2: balanceSheetYearSchema.optional(),
  year_t1: balanceSheetYearSchema.optional(),
  year_t0: balanceSheetYearSchema.optional(),
});

// ─── Section D: Cash Flow Details (3yr) ──────────────────────────────────────

export const cashFlowYearSchema = z.object({
  fiscal_year: z.coerce.number().int(),
  profit_before_tax: z.coerce.number().default(0),
  depreciation_amortization: z.coerce.number().default(0),
  working_capital_changes: z.coerce.number().default(0),
  tax_paid: z.coerce.number().default(0),
  net_operating_cash_flow: z.coerce.number().default(0),
  capex: z.coerce.number().default(0),
  net_investing_cash_flow: z.coerce.number().default(0),
  proceeds_from_borrowings: z.coerce.number().default(0),
  repayment_of_borrowings: z.coerce.number().default(0),
  dividends_paid: z.coerce.number().default(0),
  net_financing_cash_flow: z.coerce.number().default(0),
  net_change_in_cash: z.coerce.number().default(0),
  opening_cash: z.coerce.number().default(0),
  closing_cash: z.coerce.number().default(0),
  free_cash_flow: z.coerce.number().default(0),
});

export const sectionDSchema = z.object({
  year_t2: cashFlowYearSchema.optional(),
  year_t1: cashFlowYearSchema.optional(),
  year_t0: cashFlowYearSchema.optional(),
});

// ─── Section E: Working Capital Details ──────────────────────────────────────

export const sectionESchema = z.object({
  receivables_aging: z.object({
    current_0_30: z.coerce.number().default(0),
    days_31_60: z.coerce.number().default(0),
    days_61_90: z.coerce.number().default(0),
    days_91_120: z.coerce.number().default(0),
    over_120_days: z.coerce.number().default(0),
    total_receivables: z.coerce.number().default(0),
    provision_for_doubtful_debts: z.coerce.number().default(0),
  }).optional(),
  inventory_breakdown: z.object({
    raw_materials: z.coerce.number().default(0),
    work_in_progress: z.coerce.number().default(0),
    finished_goods: z.coerce.number().default(0),
    consumables: z.coerce.number().default(0),
    total_inventory: z.coerce.number().default(0),
    obsolete_provision: z.coerce.number().default(0),
  }).optional(),
  borrowings: z.array(z.object({
    lender: z.string().min(1),
    facility_type: z.enum(['term_loan', 'revolving_credit', 'overdraft', 'trade_finance', 'hire_purchase', 'leasing', 'bond', 'other']),
    facility_limit: z.coerce.number(),
    outstanding_amount: z.coerce.number(),
    interest_rate: z.coerce.number(),
    maturity_date: z.string().optional().or(z.literal('')),
    collateral: z.string().optional().or(z.literal('')),
    is_secured: z.boolean().default(true),
  })).default([]),
  average_collection_days: z.coerce.number().optional(),
  average_inventory_days: z.coerce.number().optional(),
  average_payable_days: z.coerce.number().optional(),
});

// ─── Section F: Peer Comparison Data ─────────────────────────────────────────

export const sectionFSchema = z.object({
  comparable_companies: z.array(z.object({
    name: z.string().min(1),
    ticker: z.string().optional().or(z.literal('')),
    market: z.string().optional().or(z.literal('')),
    revenue: z.coerce.number().optional(),
    pat: z.coerce.number().optional(),
    market_cap: z.coerce.number().optional(),
    pe_ratio: z.coerce.number().optional(),
    ev_ebitda: z.coerce.number().optional(),
    gross_margin_pct: z.coerce.number().optional(),
    net_margin_pct: z.coerce.number().optional(),
    roe_pct: z.coerce.number().optional(),
  })).default([]),
  industry_benchmarks: z.object({
    industry: z.string(),
    gross_margin_median: z.coerce.number().optional(),
    net_margin_median: z.coerce.number().optional(),
    roe_median: z.coerce.number().optional(),
    pe_median: z.coerce.number().optional(),
    ev_ebitda_median: z.coerce.number().optional(),
    revenue_growth_median: z.coerce.number().optional(),
  }).optional(),
  data_source: z.string().optional().or(z.literal('')),
  data_as_of: z.string().optional().or(z.literal('')),
});

// ─── Section G: Budget & Projections ─────────────────────────────────────────

export const sectionGSchema = z.object({
  current_year_budget_revenue: z.coerce.number().optional(),
  current_year_budget_pat: z.coerce.number().optional(),
  projections: z.array(z.object({
    year: z.coerce.number().int(),
    projected_revenue: z.coerce.number(),
    projected_cogs: z.coerce.number().optional(),
    projected_gross_profit: z.coerce.number().optional(),
    projected_operating_expenses: z.coerce.number().optional(),
    projected_ebitda: z.coerce.number().optional(),
    projected_pat: z.coerce.number().optional(),
    projected_capex: z.coerce.number().optional(),
    projected_headcount: z.coerce.number().int().optional(),
    key_assumptions: z.string().optional().or(z.literal('')),
  })).default([]),
  capex_plans: z.array(z.object({
    description: z.string().min(1),
    amount: z.coerce.number(),
    year: z.coerce.number().int(),
    category: z.enum(['property', 'equipment', 'technology', 'vehicles', 'renovation', 'other']),
    funding_source: z.enum(['internal_cash', 'bank_loan', 'equity', 'lease', 'other']).default('internal_cash'),
  })).default([]),
  projection_methodology: z.string().optional().or(z.literal('')),
  key_growth_drivers: z.array(z.string()).default([]),
  key_risks: z.array(z.string()).default([]),
});

// ─── Section H: Funding History & Equity ─────────────────────────────────────

export const sectionHSchema = z.object({
  funding_rounds: z.array(z.object({
    round_name: z.string().min(1),
    date: z.string().optional().or(z.literal('')),
    amount_raised: z.coerce.number(),
    currency: z.string().default('MYR'),
    investor_names: z.array(z.string()).default([]),
    investor_types: z.array(z.enum(['angel', 'vc', 'pe', 'strategic', 'government', 'family_office', 'other'])).default([]),
    pre_money_valuation: z.coerce.number().optional(),
    post_money_valuation: z.coerce.number().optional(),
    equity_given_pct: z.coerce.number().optional(),
    instrument_type: z.enum(['ordinary_shares', 'preference_shares', 'convertible_note', 'safe', 'rcps', 'other']).default('ordinary_shares'),
  })).default([]),
  total_raised_to_date: z.coerce.number().optional(),
  current_shareholders: z.array(z.object({
    name: z.string().min(1),
    type: z.enum(['founder', 'co_founder', 'investor', 'employee', 'family', 'corporate', 'other']),
    shares_held: z.coerce.number().int().optional(),
    ownership_pct: z.coerce.number().min(0).max(100),
    is_director: z.boolean().default(false),
    nationality: z.string().optional().or(z.literal('')),
  })).default([]),
  total_shares_issued: z.coerce.number().int().optional(),
  paid_up_capital: z.coerce.number().optional(),
  has_shareholder_agreement: z.boolean().optional(),
  has_esos_plan: z.boolean().optional(),
  esos_pool_pct: z.coerce.number().optional(),
  has_convertible_instruments: z.boolean().optional(),
  convertible_details: z.string().optional().or(z.literal('')),
});

// ─── Section I: Related Party Transactions ───────────────────────────────────

export const sectionISchema = z.object({
  has_related_party_transactions: z.boolean().default(false),
  transactions: z.array(z.object({
    related_party_name: z.string().min(1),
    relationship: z.enum(['director', 'shareholder', 'family_member', 'subsidiary', 'associate', 'common_director', 'other']),
    transaction_type: z.enum(['sales', 'purchases', 'management_fee', 'rental', 'loan', 'guarantee', 'service', 'other']),
    amount: z.coerce.number(),
    currency: z.string().default('MYR'),
    is_recurring: z.boolean().default(true),
    is_arms_length: z.enum(['yes', 'no', 'unknown']).default('unknown'),
    documentation_status: z.enum(['formal_agreement', 'informal', 'none']).default('none'),
    description: z.string().optional().or(z.literal('')),
  })).default([]),
  total_rpt_amount: z.coerce.number().optional(),
  rpt_as_pct_of_revenue: z.coerce.number().optional(),
  has_rpt_policy: z.boolean().default(false),
});

// ─── Top-Level Stage 2 Schema ────────────────────────────────────────────────

export const stage2Schema = z.object({
  audit: sectionASchema.optional(),
  income_statement: sectionBSchema.optional(),
  balance_sheet: sectionCSchema.optional(),
  cash_flow: sectionDSchema.optional(),
  working_capital: sectionESchema.optional(),
  peers: sectionFSchema.optional(),
  projections: sectionGSchema.optional(),
  funding: sectionHSchema.optional(),
  related_party: sectionISchema.optional(),
});

export type Stage2Data = z.infer<typeof stage2Schema>;
