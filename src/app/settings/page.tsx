'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useHybridReadings, HouseConfig } from '@/hooks/useHybridReadings'
import { useAuth } from '@/hooks/useAuth'

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth()
  const { config, updateConfig, loading } = useHybridReadings()
  const [formData, setFormData] = useState<Partial<HouseConfig>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Initialize form data when config loads
  useEffect(() => {
    if (config) {
      setFormData({
        price_per_kwh: config.price_per_kwh,
        base_monthly_fee: config.base_monthly_fee,
        currency: config.currency,
        expected_annual_consumption: config.expected_annual_consumption,
        country_code: config.country_code,
        gas_conversion_factor: config.gas_conversion_factor,
        reading_unit: config.reading_unit
      })
    }
  }, [config])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const result = await updateConfig(formData)
      if (result.success) {
        setSaveMessage({ type: 'success', text: 'Configuration saved successfully!' })
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        setSaveMessage({ type: 'error', text: result.error || 'Failed to save configuration' })
      }
    } catch {
      setSaveMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: keyof HouseConfig, value: number | string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Calculate monthly values
  const monthlyConsumption = formData.expected_annual_consumption ? 
    Math.round((formData.expected_annual_consumption / 12) * 100) / 100 : 0

  const monthlyVariableCost = monthlyConsumption * (formData.price_per_kwh || 0)
  const monthlyBill = (formData.base_monthly_fee || 0) + monthlyVariableCost

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-x-hidden">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
              <p className="text-white/70 mt-1 text-sm sm:text-base">Configure your energy consumption tracking</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 items-center w-full sm:w-auto">
              {isAuthenticated && user && (
                <div className="text-white/70 text-xs sm:text-sm mr-2 hidden sm:block truncate max-w-[150px]">
                  {user.email}
                </div>
              )}
              <Button asChild variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs sm:text-sm px-2 sm:px-4">
                <Link href="/">
                  <span className="hidden sm:inline">🏠 </span>Home
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs sm:text-sm px-2 sm:px-4">
                <Link href="/dashboard">
                  <span className="hidden sm:inline">📊 </span>Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 overflow-x-hidden">
        {!isAuthenticated ? (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="text-center text-white">
                <p className="text-lg mb-4">Please register or login to configure your settings.</p>
                <div className="flex gap-4 justify-center">
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Link href="/register">
                      Register
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Link href="/login">
                      Login
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : !config ? (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="text-center text-white">
                <p className="text-lg">Loading configuration...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Energy Pricing Configuration</CardTitle>
                <p className="text-white/70 text-sm mt-2">
                  Configure your energy prices and expected consumption to get accurate cost comparisons.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Price per kWh */}
                  <div>
                    <label htmlFor="price_per_kwh" className="block text-white font-medium mb-2">
                      Price per kWh ({formData.currency || 'EUR'})
                    </label>
                    <input
                      type="number"
                      id="price_per_kwh"
                      step="0.0001"
                      min="0"
                      value={formData.price_per_kwh || ''}
                      onChange={(e) => handleChange('price_per_kwh', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-white/60 text-sm mt-1">
                      Variable cost per kilowatt-hour (kWh) of energy consumed
                    </p>
                  </div>

                  {/* Base Monthly Fee */}
                  <div>
                    <label htmlFor="base_monthly_fee" className="block text-white font-medium mb-2">
                      Base Monthly Fee ({formData.currency || 'EUR'})
                    </label>
                    <input
                      type="number"
                      id="base_monthly_fee"
                      step="0.01"
                      min="0"
                      value={formData.base_monthly_fee || ''}
                      onChange={(e) => handleChange('base_monthly_fee', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-white/60 text-sm mt-1">
                      Fixed monthly fee regardless of consumption
                    </p>
                  </div>

                  {/* Expected Annual Consumption */}
                  <div>
                    <label htmlFor="expected_annual_consumption" className="block text-white font-medium mb-2">
                      Expected Annual Consumption (kWh/year)
                    </label>
                    <input
                      type="number"
                      id="expected_annual_consumption"
                      step="1"
                      min="0"
                      value={formData.expected_annual_consumption || ''}
                      onChange={(e) => handleChange('expected_annual_consumption', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-white/60 text-sm mt-1">
                      Your expected annual energy consumption in kWh
                    </p>
                    {monthlyConsumption > 0 && (
                      <p className="text-blue-300 text-sm mt-1">≈ {monthlyConsumption} kWh/month</p>
                    )}
                  </div>

                  {/* Currency */}
                  <div>
                    <label htmlFor="currency" className="block text-white font-medium mb-2">
                      Currency
                    </label>
                    <select
                      id="currency"
                      value={formData.currency || 'EUR'}
                      onChange={(e) => handleChange('currency', e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="MXN">MXN ($)</option>
                    </select>
                  </div>

                  {/* Country Code */}
                  <div>
                    <label htmlFor="country_code" className="block text-white font-medium mb-2">
                      Country Code
                    </label>
                    <input
                      type="text"
                      id="country_code"
                      maxLength={2}
                      value={formData.country_code || ''}
                      onChange={(e) => handleChange('country_code', e.target.value.toUpperCase())}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-white/60 text-sm mt-1">Country code (e.g., ES, US, GB)</p>
                  </div>

                  {/* Gas Conversion Factor */}
                  <div>
                    <label htmlFor="gas_conversion_factor" className="block text-white font-medium mb-2">
                      Gas Conversion Factor (m³ to kWh)
                    </label>
                    <input
                      type="number"
                      id="gas_conversion_factor"
                      step="0.1"
                      min="0"
                      value={formData.gas_conversion_factor || ''}
                      onChange={(e) => handleChange('gas_conversion_factor', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="10.5"
                      required
                    />
                    <p className="text-white/60 text-sm mt-1">
                      Conversion factor: m³ to kWh (default: 10.5 for Spain)
                    </p>
                  </div>

                  {/* Reading Unit */}
                  <div>
                    <label htmlFor="reading_unit" className="block text-white font-medium mb-2">
                      Meter Reading Unit
                    </label>
                    <select
                      id="reading_unit"
                      value={formData.reading_unit || 'm³'}
                      onChange={(e) => handleChange('reading_unit', e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="m³">m³ (Cubic meters - Gas)</option>
                      <option value="kWh">kWh (Kilowatt-hours - Electricity)</option>
                    </select>
                  </div>

                  {/* Summary */}
                  {monthlyBill > 0 && (
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                      <h3 className="text-white font-semibold mb-2">Expected Monthly Bill</h3>
                      <div className="text-blue-200 text-sm space-y-1">
                        <p><strong>Base fee:</strong> {formData.currency || 'EUR'} {formData.base_monthly_fee || 0}</p>
                        <p><strong>Variable:</strong> {formData.currency || 'EUR'} {Math.round(monthlyVariableCost * 100) / 100}</p>
                        <p className="text-lg font-bold text-blue-100 mt-2">
                          <strong>Total:</strong> {formData.currency || 'EUR'} {Math.round(monthlyBill * 100) / 100}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Save Message */}
                  {saveMessage && (
                    <div className={`p-4 rounded-lg ${
                      saveMessage.type === 'success' 
                        ? 'bg-green-500/20 border border-green-400/30 text-green-200' 
                        : 'bg-red-500/20 border border-red-400/30 text-red-200'
                    }`}>
                      {saveMessage.text}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      {isSaving ? 'Saving...' : '💾 Save Configuration'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (config) {
                          setFormData({
                            price_per_kwh: config.price_per_kwh,
                            base_monthly_fee: config.base_monthly_fee,
                            currency: config.currency,
                            expected_annual_consumption: config.expected_annual_consumption,
                            country_code: config.country_code,
                            gas_conversion_factor: config.gas_conversion_factor,
                            reading_unit: config.reading_unit
                          })
                          setSaveMessage(null)
                        }
                      }}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
