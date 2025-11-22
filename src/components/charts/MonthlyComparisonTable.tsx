'use client'

interface MonthlyData {
  month: string
  fullMonth: string
  expected: number
  real: number
  difference: number
  percentageDiff: number
  realMonthlyCost: number
  expectedMonthlyCost: number
  costDifference: number
  confidence: string
  isProjected: boolean
  status: string
  photosCount: number
  daysObserved: number
}

interface MonthlyComparisonTableProps {
  data: MonthlyData[]
}

export function MonthlyComparisonTable({ data }: MonthlyComparisonTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-white/50 py-8">
        <div className="text-4xl mb-2">📊</div>
        <p>No monthly data available yet</p>
        <p className="text-sm">Upload readings to see comparison</p>
      </div>
    )
  }

  const getStatusIcon = (status: string, confidence: string) => {
    if (status === 'insufficient_data') return '❌'
    if (status === 'complete') return '🟢'
    if (confidence === 'high') return '🟡'
    if (confidence === 'medium') return '🟠'
    return '🔴'
  }

  const getStatusLabel = (status: string, confidence: string, isProjected: boolean, photosCount: number) => {
    if (status === 'insufficient_data') {
      return photosCount === 0 ? 'No data' : `${photosCount} photo${photosCount > 1 ? 's' : ''} (need 2+)`
    }
    if (status === 'complete') return 'Complete'
    if (isProjected) {
      return `Projected (${confidence} conf.)`
    }
    return 'In progress'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/20">
            <th className="text-left p-3 text-white font-medium">Month</th>
            <th className="text-right p-3 text-white font-medium">Real (30d)</th>
            <th className="text-right p-3 text-white font-medium">Expected</th>
            <th className="text-right p-3 text-white font-medium">Difference</th>
            <th className="text-center p-3 text-white font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((monthData, index) => (
            <tr key={index} className="border-b border-white/10 hover:bg-white/5">
              <td className="p-3">
                <div className="text-white font-medium">{monthData.month}</div>
                <div className="text-white/60 text-xs">{monthData.fullMonth}</div>
              </td>
              
              <td className="p-3 text-right">
                <div className="text-white font-medium">
                  {monthData.status !== 'insufficient_data' ? `€${monthData.realMonthlyCost}` : '--'}
                </div>
                <div className="text-white/60 text-xs">
                  {monthData.status !== 'insufficient_data' ? 
                    `${monthData.real} kWh` : 
                    'No data'
                  }
                </div>
                {monthData.photosCount > 0 && (
                  <div className="text-white/40 text-xs">
                    {monthData.photosCount} photo{monthData.photosCount > 1 ? 's' : ''}
                    {monthData.daysObserved > 0 && ` (${monthData.daysObserved}d→30d)`}
                  </div>
                )}
              </td>
              
              <td className="p-3 text-right">
                <div className="text-white/80 font-medium">
                  {monthData.status !== 'insufficient_data' ? `€${monthData.expectedMonthlyCost}` : '--'}
                </div>
                <div className="text-white/60 text-xs">
                  {monthData.status !== 'insufficient_data' ? `${monthData.expected} kWh` : 'No data'}
                </div>
              </td>
              
              <td className="p-3 text-right">
                <div className={`font-medium ${
                  monthData.status === 'insufficient_data' ? 'text-white/40' :
                  monthData.costDifference > 0 ? 'text-red-400' : 
                  monthData.costDifference < 0 ? 'text-green-400' : 
                  'text-white/60'
                }`}>
                  {monthData.status !== 'insufficient_data' ? 
                    `€${monthData.costDifference >= 0 ? '+' : ''}${monthData.costDifference}` : 
                    '--'
                  }
                </div>
                <div className={`text-xs ${
                  monthData.status === 'insufficient_data' ? 'text-white/40' :
                  monthData.difference > 0 ? 'text-red-400/80' : 
                  monthData.difference < 0 ? 'text-green-400/80' : 
                  'text-white/60'
                }`}>
                  {monthData.status !== 'insufficient_data' ? 
                    `${monthData.difference >= 0 ? '+' : ''}${monthData.difference} kWh` : 
                    '--'
                  }
                </div>
                <div className={`text-xs ${
                  monthData.status === 'insufficient_data' ? 'text-white/40' :
                  monthData.costDifference > 0 ? 'text-red-400/60' : 
                  monthData.costDifference < 0 ? 'text-green-400/60' : 
                  'text-white/60'
                }`}>
                  {monthData.status !== 'insufficient_data' ? 
                    `${monthData.percentageDiff >= 0 ? '+' : ''}${monthData.percentageDiff}%` : 
                    '--'
                  }
                </div>
              </td>
              
              <td className="p-3 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-lg mb-1">
                    {getStatusIcon(monthData.status, monthData.confidence)}
                  </span>
                  <span className="text-xs text-white/60 text-center leading-tight">
                    {getStatusLabel(monthData.status, monthData.confidence, monthData.isProjected, monthData.photosCount)}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
