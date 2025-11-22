'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ReadingData } from '@/hooks/useHybridReadings'

interface ReadingEvolutionChartProps {
  data: ReadingData[]
  className?: string
}

export function ReadingEvolutionChart({ data, className = '' }: ReadingEvolutionChartProps) {
  // Process data for the chart
  const chartData = data
    .map(item => ({
      id: item.id,
      date: item.date,
      reading: item.reading,
      displayDate: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  interface TooltipPayload {
    payload?: {
      reading: number
      displayDate: string
    }
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload
      if (!data) return null
      
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-1">{data.displayDate}</p>
          <p className="text-blue-400 mb-1">
            <span className="font-medium">Gas Reading:</span> {data.reading.toLocaleString()} m³
          </p>
          <p className="text-gray-300 text-xs">
            Energy equivalent: ~{Math.round(data.reading * 10.5).toLocaleString()} kWh
          </p>
        </div>
      )
    }
    return null
  }

  if (data.length === 0) {
    return (
      <div className={`h-64 flex items-center justify-center ${className}`}>
        <div className="text-center text-white/50">
          <div className="text-4xl mb-2">📊</div>
          <p>No data to display</p>
          <p className="text-sm">Upload your first photo to see the evolution</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-64 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="displayDate" 
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={['dataMin - 100', 'dataMax + 100']}
            label={{ value: 'Reading (m³)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="reading"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2, fill: '#1e40af' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
