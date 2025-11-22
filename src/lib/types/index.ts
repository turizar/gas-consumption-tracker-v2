// Database Types
export interface User {
  id: string;
  email: string;
  name?: string;
  country_code: string;
  timezone: string;
  created_at: string;
}

export interface Meter {
  id: string;
  user_id: string;
  name: string;
  meter_type: string;
  is_active: boolean;
  created_at: string;
}

export interface Reading {
  id: string;
  meter_id: string;
  reading_value: number;
  photo_url?: string;
  reading_date: string;
  is_manual: boolean;
  confidence_score?: number;
  created_at: string;
}

export interface BillingConfig {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  expected_monthly_consumption: number;
  expected_annual_consumption: number;
  currency: string;
  price_per_kwh: number;
  billing_cycle_start: number;
  billing_type: string;
  adjustment_type: string;
  adjustment_calculation: string;
  valid_from: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
  // Gas to energy conversion
  gas_conversion_factor: number; // m³ to kWh conversion factor (default: 10.5)
  meter_type: 'gas' | 'electricity'; // Type of meter
  reading_unit: string; // Unit displayed on meter (m³, kWh, etc.)
}

export interface CountryDefault {
  id: string;
  country_code: string;
  country_name: string;
  currency: string;
  avg_price_per_kwh: number;
  avg_monthly_consumption: number;
  billing_cycle_start: number;
  billing_type: string;
  created_at: string;
}

export interface ConsumptionProjection {
  id: string;
  user_id: string;
  billing_config_id: string;
  projection_date: string;
  projected_consumption: number;
  projected_cost: number;
  balance_estimate: number;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface MeterReadingResponse {
  value: number;
  confidence: number;
}

// Decimal Detection Types
export interface DecimalDetectionResult {
  value: string;
  confidence: number;
  hasDecimal: boolean;
  decimalPosition?: number;
  reasoning: string[];
}

export interface ColorAnalysis {
  dominantColors: string[];
  colorVariations: {
    region: 'main' | 'last';
    colors: string[];
    confidence: number;
  }[];
}

export interface VisualSeparator {
  type: 'line' | 'space' | 'frame' | 'dot';
  position: { x: number; y: number };
  confidence: number;
}

export interface DigitPosition {
  digit: string;
  position: { x: number; y: number; width: number; height: number };
  confidence: number;
}

export interface CorrectionAnalysis {
  originalValue: string;
  correctedValue: string;
  hasDecimal: boolean;
  decimalPosition: number;
  imagePattern: unknown;
}

// Form Types
export interface CreateMeterForm {
  name: string;
  meter_type: string;
}

export interface CreateBillingConfigForm {
  name: string;
  expected_monthly_consumption: number;
  expected_annual_consumption: number;
  currency: string;
  price_per_kwh: number;
  billing_cycle_start: number;
  billing_type: string;
  adjustment_type: string;
  adjustment_calculation: string;
  valid_from: string;
  valid_until?: string;
}

// Dashboard Types
export interface DashboardData {
  current_month_consumption: number;
  current_month_cost: number;
  year_to_date_consumption: number;
  year_to_date_cost: number;
  projected_annual_consumption: number;
  projected_annual_cost: number;
  balance_estimate: number;
  balance_status: 'credit' | 'charge' | 'balance';
  balance_message: string;
}

