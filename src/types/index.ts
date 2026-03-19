export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export type UserRole = 'admin' | 'advisor' | 'client';

export interface Company {
  id: string;
  legal_name: string;
  registration_number?: string;
  date_of_incorporation?: string;
  company_type?: string;
  primary_industry?: string;
  sub_industry?: string;
  country: string;
  website?: string;
  brief_description?: string;
  enterprise_stage?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export type IntakeStageNumber = '1' | '2' | '3';
export type IntakeStatus = 'not_started' | 'in_progress' | 'submitted' | 'validated';

export interface IntakeStage {
  id: string;
  company_id: string;
  stage: IntakeStageNumber;
  status: IntakeStatus;
  data: Record<string, any>;
  completed_sections: string[];
  submitted_at?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface DocumentRecord {
  id: string;
  company_id: string;
  category: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  stage?: string;
  created_at: string;
}

// Assessment types
export interface Assessment {
  id: string;
  company_id: string;
  trigger_stage: string;
  status: 'pending' | 'scoring' | 'draft' | 'review' | 'approved' | 'archived' | 'failed';
  overall_score: number | null;
  overall_rating: string | null;
  enterprise_stage_classification: string | null;
  capital_readiness: 'red' | 'amber' | 'green' | null;
  created_at: string;
  module_scores?: ModuleScore[];
  modules?: ModuleScore[];
}

export interface ModuleScore {
  id: string;
  module_number: number;
  module_name: string;
  total_score: number;
  rating: string;
  weight: number;
  dimensions?: DimensionScore[];
}

export interface DimensionScore {
  id: string;
  dimension_number: number;
  dimension_name: string;
  score: number;
  weight: number;
  scoring_method: string;
  calculation_detail: Record<string, any>;
  ai_reasoning: string | null;
}

export interface AutoFlag {
  id: string;
  flag_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  source_field: string | null;
  source_value: string | null;
  is_resolved: boolean;
}

// Report types
export interface ReportSummary {
  id: string;
  assessment_id: string;
  company_id: string;
  report_type: string;
  title: string;
  status: 'generating' | 'draft' | 'review' | 'revision' | 'approved' | 'published';
  language: string;
  version: number;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportSection {
  id: string;
  section_key: string;
  section_title: string;
  content_en: string | null;
  content_cn: string | null;
  content_data: Record<string, any> | null;
  sort_order: number;
  is_ai_generated: boolean;
  last_edited_by: string | null;
  last_edited_at: string | null;
}

export interface ReportDetail extends ReportSummary {
  sections: ReportSection[];
}
