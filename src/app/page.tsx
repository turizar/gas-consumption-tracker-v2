'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <span className="text-sm font-medium text-white/90">🚀 AI-Powered Gas Tracking</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Gas Consumption
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Tracker
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your gas monitoring with AI-powered meter reading. 
              <span className="text-blue-300 font-semibold"> Snap, analyze, optimize</span> your gas consumption effortlessly.
            </p>
            
            <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto">
              Upload photos of your gas meter, get AI-powered readings, and track your consumption with beautiful analytics.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              {loading ? (
                <div className="text-white/70">Loading...</div>
              ) : isAuthenticated ? (
                <Button asChild size="lg" className="text-lg px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                  <Link href="/dashboard">
                    📊 Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="text-lg px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                    <Link href="/register">
                      ✨ Get Started Free
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    size="lg" 
                    variant="outline"
                    className="text-lg px-10 py-4 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Link href="/login">
                      🔐 Login
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    size="lg" 
                    className="text-lg px-10 py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0 shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105"
                  >
                    <Link href="/dashboard?demo=true">
                      🎮 Try Demo
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Everything you need to monitor and optimize your gas consumption
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
              <div className="text-5xl mb-6">📱</div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Photo Upload</h3>
              <p className="text-white/70 leading-relaxed">
                Simply take a photo of your gas meter and let our advanced AI extract readings automatically. 
                No manual data entry required.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
              <div className="text-5xl mb-6">📊</div>
              <h3 className="text-2xl font-bold text-white mb-4">Real-time Analytics</h3>
              <p className="text-white/70 leading-relaxed">
                Get instant insights into your gas consumption patterns with beautiful charts and 
                detailed analytics dashboard.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
              <div className="text-5xl mb-6">💰</div>
              <h3 className="text-2xl font-bold text-white mb-4">Cost Optimization</h3>
              <p className="text-white/70 leading-relaxed">
                Compare your actual vs expected consumption and receive personalized recommendations 
                to optimize your gas bills.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!loading && !isAuthenticated && (
        <div className="relative py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Start Tracking?
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Start tracking your gas consumption today. Register for free and get instant insights into your energy usage.
              </p>
              <Button asChild size="lg" className="text-xl px-12 py-5 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0 shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105">
                <Link href="/register">
                  ✨ Start Tracking Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}