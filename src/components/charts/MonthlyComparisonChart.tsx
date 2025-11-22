'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useCallback, useMemo } from 'react'

interface MonthlyData {
  month: string
  expected: number
  real: number
  confidence: string
  isProjected: boolean
}

interface MonthlyComparisonChartProps {
  data: MonthlyData[]
}

export function MonthlyComparisonChart({ data }: MonthlyComparisonChartProps) {
  // Hooks must be called before any early returns
  interface TooltipEntry {
    name: string
    value: number
    color: string
    dataKey: string
    payload?: MonthlyData
  }

  const CustomTooltip = useCallback(({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-300 text-sm">
                {entry.name}: {entry.value} kWh
                {entry.dataKey === 'real' && entry.payload?.isProjected && (
                  <span className="text-yellow-400 ml-1">(projected)</span>
                )}
              </span>
            </div>
          ))}
          {payload[0]?.payload && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <p className="text-xs text-gray-400">
                Confidence: {payload[0].payload.confidence}
                {payload[0].payload.isProjected && ' • Projected'}
              </p>
            </div>
          )}
        </div>
      )
    }
    return null
  }, [])

  const CustomBar = useCallback((props: { payload?: MonthlyData; [key: string]: unknown }) => {
    const { payload } = props
    const opacity = payload?.confidence === 'insufficient' ? 0.3 : 
                   payload?.confidence === 'low' ? 0.6 : 
                   payload?.confidence === 'medium' ? 0.8 : 1.0
    
    return <Bar {...props} fillOpacity={opacity} />
  }, [])

  // Memoize styles to prevent re-renders
  const legendStyle = useMemo(() => ({ 
    color: '#9CA3AF', 
    fontSize: '12px' 
  }), [])
  
  const yAxisLabelStyle = useMemo(() => ({ 
    textAnchor: 'middle' as const, 
    fill: '#9CA3AF' 
  }), [])

  // Early return after hooks
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-white/50">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No monthly data available yet</p>
          <p className="text-sm">Upload readings to see comparison</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="month" 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            label={{ value: 'kWh', angle: -90, position: 'insideLeft', style: yAxisLabelStyle }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={legendStyle}
            iconType="rect"
          />
          
          {/* Expected bar */}
          <Bar 
            dataKey="expected" 
            name="Expected" 
            fill="#10B981" 
            radius={[2, 2, 0, 0]}
          />
          
          {/* Real bar with dynamic opacity based on confidence */}
          <Bar 
            dataKey="real" 
            name="Real" 
            fill="#3B82F6" 
            radius={[2, 2, 0, 0]}
            shape={<CustomBar />}
          />
        </BarChart>
      </ResponsiveContainer>
      
      {/* Legend for confidence levels */}
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-400 justify-center">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded"></div>
          <span>High confidence</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 opacity-80 rounded"></div>
          <span>Medium confidence</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 opacity-60 rounded"></div>
          <span>Low confidence</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 opacity-30 rounded"></div>
          <span>Insufficient data</span>
        </div>
      </div>
    </div>
  )
}
