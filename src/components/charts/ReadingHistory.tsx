'use client'

import { useHybridReadings } from '@/hooks/useHybridReadings'
import { convertGasToEnergy } from '@/lib/utils'

interface ReadingData {
  id: string
  date: string
  reading: number
  consumption: number
  cost: number
  confidence?: number
  imageUrl?: string
}

interface ReadingHistoryProps {
  readings: ReadingData[]
  onDeleteReading?: (id: string) => void
  isDemo?: boolean
}

export function ReadingHistory({ readings, onDeleteReading, isDemo = false }: ReadingHistoryProps) {
  const { config } = useHybridReadings()
  
  // Sort readings by date (newest first for display)
  const sortedReadings = [...readings].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  
  // Calculate consumption in real-time for each reading
  const calculateRealTimeConsumption = (currentReading: ReadingData) => {
    // Get the reading chronologically before this one
    const chronologicalReadings = [...readings].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    const currentIndex = chronologicalReadings.findIndex(r => r.id === currentReading.id)
    
    // If it's the first reading chronologically, no consumption
    if (currentIndex === 0) {
      return { consumption: null, cost: null, gasVolume: null }
    }
    
    const previousReading = chronologicalReadings[currentIndex - 1]
    
    // Calculate raw consumption in meter units (m³ or kWh)
    const rawConsumption = Math.max(0, currentReading.reading - previousReading.reading)
    
    // Convert to energy (kWh) if it's a gas meter
    let energyConsumption: number
    if (config?.meter_type === 'gas') {
      energyConsumption = convertGasToEnergy(rawConsumption, config?.gas_conversion_factor || 10.5)
    } else {
      energyConsumption = rawConsumption
    }
    
    // Calculate cost
    const pricePerKwh = config?.price_per_kwh || 0.1117
    const cost = Math.round(energyConsumption * pricePerKwh * 100) / 100
    
    return {
      consumption: Math.round(energyConsumption * 100) / 100,
      cost: cost,
      gasVolume: config?.meter_type === 'gas' ? Math.round(rawConsumption * 100) / 100 : null
    }
  }

  if (readings.length === 0) {
    return (
      <div className="text-center text-white/50 py-8">
        <div className="text-4xl mb-2">📋</div>
        <p>No readings recorded</p>
        <p className="text-sm">Upload your first photo to get started</p>
      </div>
    )
  }

  // Calculate monthly summary
  const now = new Date()
  const currentMonthReadings = readings.filter(reading => {
    const readingDate = new Date(reading.date)
    return readingDate.getMonth() === now.getMonth() && readingDate.getFullYear() === now.getFullYear()
  })
  let totalVariableCost = 0
  let totalEnergyConsumption = 0
  
  currentMonthReadings.forEach(reading => {
    const realTimeData = calculateRealTimeConsumption(reading)
    if (realTimeData.consumption !== null) {
      totalVariableCost += realTimeData.cost || 0
      totalEnergyConsumption += realTimeData.consumption || 0
    }
  })
  
  const baseFee = config?.base_monthly_fee || 14.76
  const totalMonthlyCost = totalVariableCost + baseFee
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-3">
      {sortedReadings.map((reading, index) => {
        const realTimeData = calculateRealTimeConsumption(reading)
        
        return (
          <div 
            key={reading.id} 
            className={`flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200 ${
              index === 0 ? 'ring-2 ring-blue-400/50 bg-blue-500/10' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                index === 0 
                  ? 'bg-blue-500/20 ring-2 ring-blue-400/50' 
                  : 'bg-white/10'
              }`}>
                <span className={`text-lg ${index === 0 ? 'text-blue-400' : 'text-white/70'}`}>
                  {index === 0 ? '🆕' : '⚡'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium text-lg">
                    {reading.reading.toLocaleString()} {config?.reading_unit || 'm³'}
                  </p>
                  {index === 0 && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-400/30">
                      Latest
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span>{new Date(reading.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                  {reading.confidence && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      {reading.confidence}% confidence
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              {realTimeData.consumption !== null ? (
                <>
                  <p className="text-white font-medium">€{realTimeData.cost}</p>
                  <p className="text-white/60 text-sm">{realTimeData.consumption} kWh</p>
                  {config?.meter_type === 'gas' && realTimeData.gasVolume !== null && (
                    <p className="text-white/40 text-xs">
                      {realTimeData.gasVolume} {config?.reading_unit || 'm³'} gas
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-white/50 font-medium text-sm">Baseline</p>
                  <p className="text-white/40 text-xs">First reading</p>
                </>
              )}
              {onDeleteReading && !isDemo && (
                <button
                  onClick={() => onDeleteReading(reading.id)}
                  className="mt-1 text-red-400 hover:text-red-300 text-xs transition-colors"
                >
                  Delete
                </button>
              )}
              {isDemo && (
                <span className="mt-1 text-white/40 text-xs">
                  Demo
                </span>
              )}
            </div>
          </div>
        )
      })}
      
      {/* Monthly Summary */}
      {currentMonthReadings.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg p-5 border border-blue-400/30">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <span>📊</span>
              <span>{currentMonthName} Summary</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70">Total Energy Consumption:</span>
                <span className="text-white font-medium">{Math.round(totalEnergyConsumption * 100) / 100} kWh</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70">Variable Cost:</span>
                <span className="text-white font-medium">€{Math.round(totalVariableCost * 100) / 100}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70">Base Monthly Fee:</span>
                <span className="text-white font-medium">€{baseFee}</span>
              </div>
              <div className="h-px bg-white/20 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Total Monthly Cost:</span>
                <span className="text-white font-bold text-lg">€{Math.round(totalMonthlyCost * 100) / 100}</span>
              </div>
              <p className="text-white/50 text-xs mt-2">
                💡 Individual readings show variable costs only. The base fee (€{baseFee}/month) is added once per month.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
