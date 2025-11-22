'use client'

import Link from 'next/link'
import { Button } from './button'
import { StatCard } from './stat-card'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { useAuth } from '@/hooks/useAuth'

interface EmptyStateProps {
  onUploadClick?: () => void
}

export function EmptyState({ onUploadClick }: EmptyStateProps) {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Large Icon */}
      <div className="mb-6">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border-4 border-blue-400/30">
          <span className="text-6xl">📸</span>
        </div>
      </div>

      {/* Main Message */}
      <h2 className="text-3xl font-bold text-white mb-4">
        Start Tracking Your Gas Consumption
      </h2>
      <p className="text-xl text-white/70 mb-8 max-w-md">
        Upload your first gas meter reading to see real-time analytics, consumption trends, and cost insights.
      </p>

      {/* CTA Button */}
      {isAuthenticated ? (
        <Button
          onClick={onUploadClick}
          size="lg"
          className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
        >
          📷 Upload Your First Reading
        </Button>
      ) : (
        <div className="space-y-4">
          <Button
            asChild
            size="lg"
            className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
          >
            <Link href="/register">
              ✨ Get Started - Register Now
            </Link>
          </Button>
          <p className="text-white/60 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Login
            </Link>
          </p>
        </div>
      )}

      {/* Dashboard Preview Section */}
      <div className="mt-12 w-full max-w-6xl">
        <div className="relative">
          {/* Preview Badge */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2 rounded-full border-2 border-white/20 shadow-lg">
              <span className="text-white font-semibold text-sm">👀 Preview - Example Dashboard</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border-2 border-blue-400/30 shadow-2xl">
            {/* Stats Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Current Reading"
                value="1,234 m³"
                description="Latest gas meter reading"
                icon="🏠"
                className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-400/30 opacity-90"
              />
              <StatCard
                title="Projected Monthly Cost"
                value="€55.20"
                description="✅ Based on 364 kWh (30d→30d)"
                icon="💰"
                trend={{ value: 2.5, label: "below expected cost", positive: true }}
                className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-400/30 opacity-90"
              />
              <StatCard
                title="Expected Monthly Cost"
                value="€55.44"
                description="Based on 364 kWh/month energy"
                icon="🎯"
                className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-400/30 opacity-90"
              />
              <StatCard
                title="Cost Difference"
                value="€-0.24"
                description="-0.5 kWh energy difference from expected"
                icon="⬇️"
                trend={{ value: 0.5, label: "under expected consumption", positive: true }}
                className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-400/30 opacity-90"
              />
            </div>

            {/* Chart Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 opacity-90">
                <CardHeader>
                  <CardTitle className="text-white">📈 Reading Evolution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center border border-white/10">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="text-white/60 text-sm">Interactive consumption chart</p>
                      <p className="text-white/40 text-xs mt-1">Shows reading trends over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 opacity-90">
                <CardHeader>
                  <CardTitle className="text-white">🤖 AI Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-400/30">
                      <div className="text-blue-200 text-sm">
                        <p><strong>Real:</strong> 364 kWh energy ✓</p>
                        <p><strong>Expected:</strong> 364 kWh energy</p>
                        <p><strong>Difference:</strong> 0 kWh (0%)</p>
                      </div>
                    </div>
                    <div className="p-3 bg-indigo-500/20 rounded-lg border border-indigo-400/30">
                      <div className="text-indigo-200 text-sm">
                        <p><strong>Current bill:</strong> €55.20</p>
                        <p><strong>Expected bill:</strong> €55.44</p>
                        <p><strong>Difference:</strong> €-0.24 (savings!)</p>
                      </div>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-lg border border-green-400/30">
                      <div className="text-green-200 text-sm">
                        <p><strong>✅ On Target</strong></p>
                        <p className="text-xs">Your consumption is very close to expected</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Info Message */}
            <div className="text-center mt-6 pt-6 border-t border-white/10">
              <p className="text-white/70 text-sm">
                This is a preview with example data. Register to start tracking your own gas consumption!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="mt-8 grid md:grid-cols-2 gap-4 max-w-2xl w-full text-left">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h4 className="text-white font-medium">AI-Powered Reading</h4>
            <p className="text-white/60 text-sm">Just take a photo, AI extracts the reading automatically</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h4 className="text-white font-medium">Monthly Comparisons</h4>
            <p className="text-white/60 text-sm">Track your consumption month by month</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h4 className="text-white font-medium">Cost Projections</h4>
            <p className="text-white/60 text-sm">See projected costs and annual balance</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h4 className="text-white font-medium">Secure & Private</h4>
            <p className="text-white/60 text-sm">Your data is encrypted and private</p>
          </div>
        </div>
      </div>
    </div>
  )
}

