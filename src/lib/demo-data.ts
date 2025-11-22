import { ReadingData } from '@/hooks/useHybridReadings'
import { HouseConfig } from '@/hooks/useHybridReadings'

// Generate demo readings for unauthenticated users
export function generateDemoReadings(): ReadingData[] {
  const now = new Date()
  const readings: ReadingData[] = []
  
  // Generate readings for the last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 15)
    const baseReading = 1000 + (5 - i) * 50 + Math.random() * 20
    
    readings.push({
      id: `demo_${i}`,
      date: date.toISOString(),
      reading: Math.round(baseReading * 100) / 100,
      consumption: 30 + Math.random() * 10,
      cost: 5 + Math.random() * 2,
      confidence: 95,
    })
  }
  
  return readings
}

// Demo configuration
export const demoConfig: HouseConfig = {
  id: 'demo',
  price_per_kwh: 0.1117,
  base_monthly_fee: 14.76,
  currency: 'EUR',
  expected_monthly_consumption: 364,
  expected_annual_consumption: 4370,
  country_code: 'ES',
  gas_conversion_factor: 10.5,
  meter_type: 'gas',
  reading_unit: 'm³',
}

