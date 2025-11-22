'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PhotoUpload } from '@/components/forms/PhotoUpload'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReadingEvolutionChart } from '@/components/charts/ReadingEvolutionChart'
import { ReadingHistory } from '@/components/charts/ReadingHistory'
import { MonthlyComparisonTable } from '@/components/charts/MonthlyComparisonTable'
import { useHybridReadings } from '@/hooks/useHybridReadings'
import { useAuth } from '@/hooks/useAuth'
import { AuthModal } from '@/components/ui/auth-modal'
import { EmptyState } from '@/components/ui/empty-state'

function DashboardContent() {
  const { user, signOut, isAuthenticated } = useAuth()
  const searchParams = useSearchParams()
  const {
    readings,
    config,
    isProcessing,
    loading,
    isSupabaseConfigured,
    isDemoMode,
    activateDemoMode,
    addReading,
    deleteReading,
    getLatestReading,
    getMonthlyComparison30Days,
    getMonthlyComparisonTableData
  } = useHybridReadings()

  const [showAuthModal, setShowAuthModal] = useState(false)

  // Activate demo mode if ?demo=true in URL
  useEffect(() => {
    if (searchParams.get('demo') === 'true' && !isDemoMode) {
      activateDemoMode()
    }
  }, [searchParams, isDemoMode, activateDemoMode])


  const requireAuth = () => {
    // Allow in demo mode
    if (isDemoMode) return true
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return false
    }
    return true
  }

  const handlePhotoUpload = async () => {
    requireAuth()
  }

  const handleReadingExtracted = async (reading: number, confidence: number, photoFile?: File) => {
    if (!requireAuth()) return
    
    try {
      await addReading(reading, confidence, photoFile)
    } catch (error) {
      console.error('Error saving reading:', error)
    }
  }

  const handleReadingCorrected = async (_originalReading: number, correctedReading: number, photoFile?: File) => {
    if (!requireAuth()) return
    
    try {
      await addReading(correctedReading, 100, photoFile)
    } catch (error) {
      console.error('Error saving corrected reading:', error)
    }
  }

  const handleDeleteReading = async (id: string) => {
    if (!requireAuth()) return
    
    try {
      await deleteReading(id)
    } catch (error) {
      console.error('Error deleting reading:', error)
    }
  }

  // Get current stats using new 30-day logic (only if there are readings)
  const latestReading = readings.length > 0 ? getLatestReading() : null
  const currentMonthComparison = readings.length > 0 ? getMonthlyComparison30Days() : null
  const monthlyTableData = readings.length > 0 ? getMonthlyComparisonTableData(6) : []

  const stats = readings.length > 0 && currentMonthComparison ? {
    currentReading: latestReading?.reading || 0,
    // Current month data (30-day normalized)
    monthlyConsumption: currentMonthComparison.real,
    expectedConsumption: currentMonthComparison.expected,
    difference: currentMonthComparison.difference,
    percentageDiff: currentMonthComparison.percentageDiff,
    // Cost data
    currentMonthlyBill: currentMonthComparison.realMonthlyCost,
    expectedMonthlyBill: currentMonthComparison.expectedMonthlyCost,
    costDifference: currentMonthComparison.costDifference,
    // Data quality
    isProjected: currentMonthComparison.isProjected,
    confidence: currentMonthComparison.confidence,
    status: currentMonthComparison.status,
    photosCount: currentMonthComparison.photosCount,
    daysObserved: currentMonthComparison.daysObserved
  } : null

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Loading your gas data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Gas Readings</h1>
              <p className="text-white/70 mt-1">Monitor your gas consumption in real-time</p>
              {isDemoMode && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-400/30">
                    🎮 Demo Mode
                  </span>
                  <span className="text-green-300/70 text-xs">
                    Try the full experience • Data will be cleared when you close this tab
                  </span>
                </div>
              )}
              {!isDemoMode && isAuthenticated && !isSupabaseConfigured && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full border border-yellow-400/30">
                    📱 Local Mode
                  </span>
                  <span className="text-yellow-300/70 text-xs">
                    Data saved locally • Configure Supabase for cloud sync
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-3 items-center">
              {isAuthenticated && user && (
                <div className="text-white/70 text-sm mr-2">
                  {user.email}
                </div>
              )}
              <Button asChild variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Link href="/">
                  🏠 Home
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Link href="/settings">
                  ⚙️ Settings
                </Link>
              </Button>
              {isAuthenticated ? (
                <Button 
                  onClick={() => signOut()} 
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Logout
                </Button>
              ) : (
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link href="/register">
                    Register
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Empty State - Show when no readings and not in demo mode */}
        {readings.length === 0 && !loading && !isDemoMode && (
          <EmptyState onUploadClick={() => {
            if (!isAuthenticated) {
              setShowAuthModal(true)
            }
          }} />
        )}

        {/* Upload Section - Show when authenticated, in demo mode, or when there are readings */}
        {(isAuthenticated || isDemoMode || readings.length > 0) && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">📸 Upload Gas Meter Reading</h2>
              <p className="text-white/70 max-w-2xl mx-auto">
                Take a photo of your gas meter and let our AI extract the reading automatically
              </p>
            </div>
            <PhotoUpload 
              onPhotoUpload={handlePhotoUpload} 
              onReadingExtracted={handleReadingExtracted}
              onReadingCorrected={handleReadingCorrected}
              isLoading={isProcessing} 
            />
          </div>
        )}

        {/* Stats and Charts - Show when there are readings or in demo mode */}
        {(readings.length > 0 || isDemoMode) && (
          <>
            {/* Main Stats Grid */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Current Reading"
                  value={stats.currentReading > 0 ? `${stats.currentReading.toLocaleString()} ${config?.reading_unit || 'm³'}` : "No data"}
                  description={latestReading ? "Latest gas meter reading" : "Upload a photo to start"}
                  icon="🏠"
                  className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-400/30"
                />
                
                <StatCard
                  title={`Projected Monthly Cost ${stats.isProjected ? '(Est.)' : ''}`}
                  value={stats.status !== 'insufficient_data' ? `€${stats.currentMonthlyBill}` : "Need more data"}
                  description={(() => {
                    if (stats.status === 'insufficient_data') {
                      return stats.photosCount === 0 ? 'Upload 2+ gas readings to compare' : `${stats.photosCount} photo${stats.photosCount > 1 ? 's' : ''} (need 2+)`
                    }
                    if (stats.status === 'cross_month') {
                      return `⏳ Very early projection (${stats.daysObserved}d from previous month)`
                    }
                    const confidenceIcons: Record<string, string> = {
                      'high': '✅',
                      'medium': '⏳', 
                      'low': '⚠️',
                      'very_low': '⚠️',
                      'insufficient': '❓'
                    }
                    return `${confidenceIcons[stats.confidence] || '❓'} Based on ${stats.monthlyConsumption} kWh ${stats.daysObserved > 0 ? `(${stats.daysObserved}d→30d)` : ''}`
                  })()}
                  icon="💰"
                  trend={stats.status !== 'insufficient_data' && Math.abs(stats.percentageDiff) > 0 ? { 
                    value: Math.abs(stats.percentageDiff), 
                    label: `${stats.percentageDiff >= 0 ? 'above' : 'below'} expected cost`, 
                    positive: stats.costDifference <= 0 
                  } : undefined}
                  className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-400/30"
                />
                
                <StatCard
                  title="Expected Monthly Cost"
                  value={stats.status !== 'insufficient_data' ? `€${stats.expectedMonthlyBill}` : "Need more data"}
                  description={stats.status !== 'insufficient_data' ? 
                    `Based on ${stats.expectedConsumption} kWh/month energy` : 
                    'Upload 2+ gas readings to show expected cost'
                  }
                  icon="🎯"
                  className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-400/30"
                />
                
                <StatCard
                  title="Cost Difference"
                  value={stats.status !== 'insufficient_data' ? 
                    `€${stats.costDifference >= 0 ? '+' : ''}${stats.costDifference}` : 
                    'Need more data'
                  }
                  description={stats.status !== 'insufficient_data' ? 
                    `${stats.difference >= 0 ? '+' : ''}${stats.difference} kWh energy difference from expected` : 
                    'Upload 2+ gas readings to compare'
                  }
                  icon={stats.costDifference > 0 ? "⬆️" : stats.costDifference < 0 ? "⬇️" : "➡️"}
                  trend={stats.status !== 'insufficient_data' && Math.abs(stats.percentageDiff) > 0 ? {
                    value: Math.abs(stats.percentageDiff),
                    label: `${stats.percentageDiff >= 0 ? 'over' : 'under'} expected consumption`,
                    positive: stats.costDifference <= 0
                  } : undefined}
                  className={
                    stats.costDifference > 0 ? "bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-400/30" :
                    stats.costDifference < 0 ? "bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-400/30" :
                    "bg-gradient-to-br from-gray-500/20 to-gray-600/20 border-gray-400/30"
                  }
                />
              </div>
            )}

            {/* Monthly Comparison Table */}
            {monthlyTableData.length > 0 && (
              <div className="mb-8">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">📊 Monthly Comparison: Expected vs Real</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MonthlyComparisonTable data={monthlyTableData} />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Charts and Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reading Evolution Chart */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">📈 Reading Evolution</CardTitle>
            </CardHeader>
            <CardContent>
              <ReadingEvolutionChart 
                data={readings} 
              />
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">🤖 AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!stats || stats.status === 'insufficient_data' ? (
                  <div className="text-center text-white/50 py-8">
                    <div className="text-4xl mb-2">🤖</div>
                    <p>Not enough data for comparison</p>
                    <p className="text-sm">Upload 2+ readings to see monthly insights</p>
                  </div>
                ) : (
                  <>
                    {/* Monthly Analysis */}
                    <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-400">📊</span>
                        <span className="font-medium text-blue-300">Monthly Analysis</span>
                      </div>
                      <div className="text-blue-200 text-sm space-y-1">
                        <p><strong>Real:</strong> {stats.monthlyConsumption} kWh energy {
                          stats.status === 'cross_month' 
                            ? `(early projection using prev. month data)` 
                            : stats.isProjected 
                              ? `(projected from ${stats.daysObserved} days)` 
                              : '✓'
                        }</p>
                        <p><strong>Expected:</strong> {stats.expectedConsumption} kWh energy (from your annual consumption target)</p>
                        <p><strong>Difference:</strong> {stats.difference >= 0 ? '+' : ''}{stats.difference} kWh energy ({stats.percentageDiff >= 0 ? '+' : ''}{stats.percentageDiff}%)</p>
                        {stats.status === 'cross_month' && (
                          <p className="text-xs text-blue-300 mt-1">⚠️ Projection will improve as you add more readings this month</p>
                        )}
                      </div>
                    </div>

                    {/* Cost Impact */}
                    <div className="p-4 bg-indigo-500/20 rounded-lg border border-indigo-400/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-indigo-400">💰</span>
                        <span className="font-medium text-indigo-300">Cost Impact</span>
                      </div>
                      <div className="text-indigo-200 text-sm space-y-1">
                        <p><strong>Current bill:</strong> €{stats.currentMonthlyBill}</p>
                        <p><strong>Expected bill:</strong> €{stats.expectedMonthlyBill}</p>
                        <p><strong>Difference:</strong> €{stats.costDifference >= 0 ? '+' : ''}{stats.costDifference}
                          {stats.costDifference < 0 ? ' (savings!)' : ' (extra cost)'}
                        </p>
                        <p className="text-xs text-indigo-300">Base: €14.76/month + Variable: €0.1117/kWh energy (from gas conversion)</p>
                      </div>
                    </div>

                    {/* Data Quality & Tips */}
                    <div className="p-4 bg-gray-500/20 rounded-lg border border-gray-400/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-400">🎯</span>
                        <span className="font-medium text-gray-300">Data Quality</span>
                      </div>
                      <div className="text-gray-200 text-sm space-y-1">
                        <p><strong>Confidence:</strong> {stats.confidence.charAt(0).toUpperCase() + stats.confidence.slice(1).replace('_', ' ')} 
                          ({stats.photosCount} photo{stats.photosCount > 1 ? 's' : ''})
                        </p>
                        {stats.status === 'cross_month' && (
                          <p><strong>Note:</strong> Using data from previous month (only {stats.photosCount} reading this month)</p>
                        )}
                        {stats.isProjected && stats.status !== 'cross_month' && (
                          <p><strong>Projection:</strong> Based on {stats.daysObserved} days of data → 30 days standard</p>
                        )}
                        <p className="text-xs text-gray-300 mt-2">
                          💡 {stats.status === 'cross_month' ? 
                            'Add more readings this month for better accuracy' :
                            stats.confidence === 'low' || stats.confidence === 'very_low' || stats.photosCount < 3 ? 
                            'Upload more readings for better accuracy' : 
                            'Great data quality! Your projections are reliable'}
                        </p>
                      </div>
                    </div>

                    {/* Consumption Analysis */}
                    {stats.difference > 10 ? (
                      <div className="p-4 bg-red-500/20 rounded-lg border border-red-400/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-red-400">🚨</span>
                          <span className="font-medium text-red-300">High Consumption Alert</span>
                        </div>
                        <p className="text-red-200 text-sm">
                          You&apos;re consuming {stats.difference} kWh energy ({stats.percentageDiff}%) more than expected. 
                          This adds €{Math.abs(stats.costDifference)} to your monthly bill.
                        </p>
                      </div>
                    ) : stats.difference < -10 ? (
                      <div className="p-4 bg-green-500/20 rounded-lg border border-green-400/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-green-400">🌟</span>
                          <span className="font-medium text-green-300">Excellent Efficiency</span>
                        </div>
                        <p className="text-green-200 text-sm">
                          Great job! You&apos;re using {Math.abs(stats.difference)} kWh energy ({Math.abs(stats.percentageDiff)}%) less than expected. 
                          This saves €{Math.abs(stats.costDifference)} on your monthly bill.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-blue-400">✅</span>
                          <span className="font-medium text-blue-300">On Target</span>
                        </div>
                        <p className="text-blue-200 text-sm">
                          Your consumption is very close to expected ({stats.percentageDiff}% difference). 
                          Keep maintaining these consumption patterns.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
            </div>

            {/* Recent Readings */}
            <div className="mt-8">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">📋 Recent Readings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReadingHistory 
                    readings={readings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())} 
                    onDeleteReading={handleDeleteReading}
                    isDemo={isDemoMode}
                  />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          title="Registration Required"
          message="Please register or login to upload photos and save your gas meter readings."
          action="Register Now"
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
