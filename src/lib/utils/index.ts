import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatNumber(number: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number)
}

export function calculateMonthlyConsumption(currentReading: number, previousReading: number): number {
  return Math.max(0, currentReading - previousReading)
}

export function calculateCost(consumption: number, pricePerKwh: number): number {
  return consumption * pricePerKwh
}

export function calculateBalance(
  actualConsumption: number,
  expectedConsumption: number,
  pricePerKwh: number
): number {
  const difference = actualConsumption - expectedConsumption
  return difference * pricePerKwh
}

export function getBalanceStatus(balance: number): 'credit' | 'charge' | 'balance' {
  if (balance > 0) return 'credit'
  if (balance < 0) return 'charge'
  return 'balance'
}

export function getBalanceMessage(balance: number, currency: string): string {
  const status = getBalanceStatus(balance)
  const formattedBalance = formatCurrency(Math.abs(balance), currency)
  
  switch (status) {
    case 'credit':
      return `Estimated refund of ${formattedBalance} at year end`
    case 'charge':
      return `Estimated additional charge of ${formattedBalance} at year end`
    default:
      return 'Consumption is on track with expectations'
  }
}

export function generateStoragePath(userId: string, meterId: string, filename: string): string {
  return `${userId}/${meterId}/${filename}`
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateReadingValue(value: number): boolean {
  return value >= 0 && value <= 999999.99
}

// Gas to energy conversion utilities
export function convertGasToEnergy(gasCubicMeters: number, conversionFactor: number = 10.5): number {
  return gasCubicMeters * conversionFactor
}

export function getDefaultGasConversionFactor(countryCode?: string): number {
  // Default gas conversion factors by country (m³ to kWh)
  const factors: Record<string, number> = {
    'ES': 10.5, // Spain
    'FR': 10.7, // France
    'DE': 10.3, // Germany
    'IT': 10.5, // Italy
    'UK': 11.1, // United Kingdom
    'NL': 10.4, // Netherlands
    'BE': 10.5, // Belgium
    'PT': 10.5, // Portugal
  }
  
  return factors[countryCode || 'ES'] || 10.5 // Default to Spain/European average
}

export function formatEnergyWithUnit(value: number, unit: string, decimals: number = 2): string {
  return `${formatNumber(value, decimals)} ${unit}`
}

export function calculateGasConsumptionInEnergy(
  currentReading: number, 
  previousReading: number, 
  conversionFactor: number = 10.5
): number {
  const gasConsumption = calculateMonthlyConsumption(currentReading, previousReading)
  return convertGasToEnergy(gasConsumption, conversionFactor)
}

