// Country Defaults
export const COUNTRY_DEFAULTS = {
  US: {
    currency: 'USD',
    avgPricePerKwh: 0.132,
    avgMonthlyConsumption: 877,
    billingCycleStart: 1,
    billingType: 'monthly'
  },
  ES: {
    currency: 'EUR',
    avgPricePerKwh: 0.285,
    avgMonthlyConsumption: 350,
    billingCycleStart: 1,
    billingType: 'bimonthly'
  },
  MX: {
    currency: 'MXN',
    avgPricePerKwh: 1.85,
    avgMonthlyConsumption: 250,
    billingCycleStart: 1,
    billingType: 'monthly'
  },
  AR: {
    currency: 'ARS',
    avgPricePerKwh: 25.50,
    avgMonthlyConsumption: 300,
    billingCycleStart: 1,
    billingType: 'monthly'
  }
} as const

// Billing Types
export const BILLING_TYPES = {
  MONTHLY: 'monthly',
  BIMONTHLY: 'bimonthly',
  QUARTERLY: 'quarterly'
} as const

// Adjustment Types
export const ADJUSTMENT_TYPES = {
  BALANCE: 'balance',
  CREDIT: 'credit',
  CHARGE: 'charge'
} as const

// Adjustment Calculations
export const ADJUSTMENT_CALCULATIONS = {
  ANNUAL: 'annual',
  MONTHLY: 'monthly'
} as const

// Meter Types
export const METER_TYPES = {
  ELECTRIC: 'electric',
  GAS: 'gas',
  WATER: 'water'
} as const

// Balance Status Colors
export const BALANCE_STATUS_COLORS = {
  credit: 'text-green-600',
  charge: 'text-red-600',
  balance: 'text-blue-600'
} as const

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  READINGS: '/api/readings',
  BILLING: '/api/billing',
  AI: '/api/ai',
  COUNTRY_DEFAULTS: '/api/country-defaults'
} as const

// Storage Paths
export const STORAGE_PATHS = {
  METER_PHOTOS: 'meter-photos'
} as const

