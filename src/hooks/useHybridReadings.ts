'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { convertGasToEnergy } from '@/lib/utils'
import { useAuth } from './useAuth'

export interface ReadingData {
  id: string
  date: string
  reading: number
  consumption: number
  cost: number
  confidence?: number
  imageUrl?: string
}

export interface HouseConfig {
  id: string
  price_per_kwh: number // Precio variable por kWh (€/kWh)
  base_monthly_fee: number // Precio base fijo mensual (€/mes)
  currency: string
  expected_monthly_consumption: number
  expected_annual_consumption: number // Consumo anual estimado (kWh/año)
  country_code: string
  // Gas to energy conversion
  gas_conversion_factor: number // m³ to kWh conversion factor (default: 10.5)
  meter_type: 'gas' | 'electricity' // Type of meter
  reading_unit: string // Unit displayed on meter (m³, kWh, etc.)
}

export function useHybridReadings() {
  const { user, isAuthenticated } = useAuth()
  const [readings, setReadings] = useState<ReadingData[]>([])
  const [config, setConfig] = useState<HouseConfig | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)

  // Check if Supabase is configured
  useEffect(() => {
    const hasSupabaseConfig = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    setIsSupabaseConfigured(hasSupabaseConfig)
  }, [])

  // SessionStorage methods (for demo mode) - defined before use
  const loadReadingsFromSessionStorage = () => {
    try {
      const stored = sessionStorage.getItem('demo-readings')
      if (stored) {
        const data = JSON.parse(stored)
        setReadings(data)
      } else {
        setReadings([])
      }
    } catch (error) {
      console.error('Error loading demo readings from sessionStorage:', error)
      setReadings([])
    } finally {
      setLoading(false)
    }
  }

  const saveReadingsToSessionStorage = (newReadings: ReadingData[]) => {
    try {
      sessionStorage.setItem('demo-readings', JSON.stringify(newReadings))
    } catch (error) {
      console.error('Error saving demo readings to sessionStorage:', error)
    }
  }

  const loadConfigFromSessionStorage = () => {
    try {
      const stored = sessionStorage.getItem('demo-config')
      if (stored) {
        const parsedConfig = JSON.parse(stored)
        setConfig(parsedConfig)
      } else {
        // Default demo config
        const defaultConfig: HouseConfig = {
          id: 'demo',
          price_per_kwh: 0.1117,
          base_monthly_fee: 14.76,
          currency: 'EUR',
          expected_monthly_consumption: 364,
          expected_annual_consumption: 4370,
          country_code: 'ES',
          gas_conversion_factor: 10.5,
          meter_type: 'gas',
          reading_unit: 'm³'
        }
        setConfig(defaultConfig)
        sessionStorage.setItem('demo-config', JSON.stringify(defaultConfig))
      }
    } catch (error) {
      console.error('Error loading demo config from sessionStorage:', error)
      const defaultConfig: HouseConfig = {
        id: 'demo',
        price_per_kwh: 0.1117,
        base_monthly_fee: 14.76,
        currency: 'EUR',
        expected_monthly_consumption: 364,
        expected_annual_consumption: 4370,
        country_code: 'ES',
        gas_conversion_factor: 10.5,
        meter_type: 'gas',
        reading_unit: 'm³'
      }
      setConfig(defaultConfig)
    }
  }

  const saveConfigToSessionStorage = (newConfig: HouseConfig) => {
    try {
      sessionStorage.setItem('demo-config', JSON.stringify(newConfig))
    } catch (error) {
      console.error('Error saving demo config to sessionStorage:', error)
    }
  }

  // Activate demo mode
  const activateDemoMode = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('demo-mode', 'true')
      setIsDemoMode(true)
      
      // Initialize with default config if no config exists
      if (!config) {
        const defaultConfig: HouseConfig = {
          id: 'demo',
          price_per_kwh: 0.1117,
          base_monthly_fee: 14.76,
          currency: 'EUR',
          expected_monthly_consumption: 364,
          expected_annual_consumption: 4370,
          country_code: 'ES',
          gas_conversion_factor: 10.5,
          meter_type: 'gas',
          reading_unit: 'm³'
        }
        setConfig(defaultConfig)
        saveConfigToSessionStorage(defaultConfig)
      }
      
      setReadings([])
      setLoading(false)
    }
  }, [config])

  // Check for demo mode on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const demoMode = sessionStorage.getItem('demo-mode') === 'true'
      setIsDemoMode(demoMode)
      
      if (demoMode) {
        // Load demo data from sessionStorage
        loadReadingsFromSessionStorage()
        loadConfigFromSessionStorage()
      }
    }
  }, [])

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Demo mode: data already loaded in previous effect
        if (isDemoMode) {
          setLoading(false)
          return
        }

        // Only load data for authenticated users
        if (!isAuthenticated || !user) {
          setReadings([])
          setConfig(null)
          setLoading(false)
          return
        }

        // Authenticated users: load from Supabase or localStorage
        if (isSupabaseConfigured) {
          await Promise.all([
            loadReadingsFromSupabase(),
            loadConfigFromSupabase()
          ])
        } else {
          loadReadingsFromLocalStorage()
          loadConfigFromLocalStorage()
        }
      } catch (error) {
        console.error('Error loading data:', error)
        setLoading(false)
      }
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupabaseConfigured, isAuthenticated, user, isDemoMode])

  // LocalStorage methods
  const loadReadingsFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('energy-readings')
      if (stored) {
        const data = JSON.parse(stored)
        setReadings(data)
        console.log('Loaded from localStorage:', data.length, 'readings')
      } else {
        console.log('No data in localStorage')
      }
    } catch (error) {
      console.error('Error loading readings from localStorage:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveReadingsToLocalStorage = (newReadings: ReadingData[]) => {
    try {
      localStorage.setItem('energy-readings', JSON.stringify(newReadings))
    } catch (error) {
      console.error('Error saving readings to localStorage:', error)
    }
  }

  const saveConfigToLocalStorage = (newConfig: HouseConfig) => {
    try {
      localStorage.setItem('energy-config', JSON.stringify(newConfig))
    } catch (error) {
      console.error('Error saving config to localStorage:', error)
    }
  }

  const loadConfigFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('energy-config')
      if (stored) {
        const parsedConfig = JSON.parse(stored)
        
        // 🔧 AUTO-FIX: Detect and correct old/incorrect price values
        let pricePerKwh = parsedConfig.price_per_kwh
        if (pricePerKwh > 0.2) {
          // Old incorrect price detected (0.36 or 0.15 instead of 0.1117)
          console.log('🔧 Auto-fixing incorrect price:', pricePerKwh, '→ 0.1117 €/kWh')
          pricePerKwh = 0.1117 // Correct Octopus Energy price: 11,17 ct/kWh
        }
        
        // Migrate old configs by adding missing fields and fixing prices
        const migratedConfig: HouseConfig = {
          ...parsedConfig,
          price_per_kwh: pricePerKwh, // Use corrected price
          gas_conversion_factor: parsedConfig.gas_conversion_factor || 10.5,
          meter_type: parsedConfig.meter_type || 'gas',
          reading_unit: parsedConfig.reading_unit || 'm³'
        }
        setConfig(migratedConfig)
        // Save migrated config back to localStorage
        localStorage.setItem('energy-config', JSON.stringify(migratedConfig))
        console.log('✅ Configuration loaded and migrated:', migratedConfig)
      } else {
        // Default config based on real gas bill
        const defaultConfig: HouseConfig = {
          id: 'default',
          price_per_kwh: 0.1117, // 11,17 céntimos/kWh
          base_monthly_fee: 14.76, // Precio base fijo mensual
          currency: 'EUR',
          expected_monthly_consumption: 364, // 4370 kWh/año ÷ 12
          expected_annual_consumption: 4370, // Consumo real según factura
          country_code: 'ES',
          gas_conversion_factor: 10.5, // m³ to kWh conversion factor for Spain
          meter_type: 'gas', // Default to gas meter
          reading_unit: 'm³' // Default to cubic meters
        }
        setConfig(defaultConfig)
        localStorage.setItem('energy-config', JSON.stringify(defaultConfig))
      }
    } catch (error) {
      console.error('Error loading config from localStorage:', error)
    }
  }

  // Supabase methods
  const loadReadingsFromSupabase = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('house_readings')
        .select('*')
        .eq('user_id', user.id)
        .order('reading_date', { ascending: false })

      if (error) throw error

      const formattedReadings: ReadingData[] = data.map((item: Record<string, unknown>) => ({
        id: item.id as string,
        date: item.reading_date as string,
        reading: item.reading_value as number,
        consumption: item.consumption_since_last as number,
        cost: item.cost_since_last as number,
        confidence: item.confidence_score as number,
        imageUrl: item.photo_url as string
      }))

      setReadings(formattedReadings)
    } catch (error) {
      console.error('Error loading readings from Supabase:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadConfigFromSupabase = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('house_config')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        // If no config found, create default one
        const defaultConfig: HouseConfig = {
          id: 'default',
          price_per_kwh: 0.1117,
          base_monthly_fee: 14.76,
          currency: 'EUR',
          expected_monthly_consumption: 364,
          expected_annual_consumption: 4370,
          country_code: 'ES',
          gas_conversion_factor: 10.5,
          meter_type: 'gas',
          reading_unit: 'm³'
        }
        
        // Try to insert default config (remove 'id' field, Supabase will generate UUID)
        const { id, ...configWithoutId } = defaultConfig
        const { data: newConfig, error: insertError } = await supabase
          .from('house_config')
          .insert({
            user_id: user.id,
            ...configWithoutId
          })
          .select()
          .single()
        
        if (insertError) {
          console.error('Error creating config:', insertError)
          setConfig(defaultConfig)
        } else {
          setConfig({ ...newConfig, ...defaultConfig })
        }
        return
      }
      // Migrate old configs by adding missing fields
      const migratedConfig: HouseConfig = {
        ...data,
        gas_conversion_factor: data.gas_conversion_factor || 10.5,
        meter_type: data.meter_type || 'gas',
        reading_unit: data.reading_unit || 'm³',
        base_monthly_fee: data.base_monthly_fee || 14.76,
        expected_annual_consumption: data.expected_annual_consumption || 4370
      }
      
      setConfig(migratedConfig)
    } catch (error) {
      console.error('Unexpected error loading config from Supabase:', error)
      
      // Fallback to default config
      const defaultConfig: HouseConfig = {
        id: 'default',
        price_per_kwh: 0.1117,
        base_monthly_fee: 14.76,
        currency: 'EUR',
        expected_monthly_consumption: 364,
        expected_annual_consumption: 4370,
        country_code: 'ES',
        gas_conversion_factor: 10.5,
        meter_type: 'gas',
        reading_unit: 'm³'
      }
      setConfig(defaultConfig)
    }
  }

  // Calculate consumption between readings (returns kWh for cost calculations)
  const calculateConsumption = useCallback((currentReading: number, previousReading?: number): number => {
    if (!previousReading || !config) return 0
    
    let rawConsumption = currentReading - previousReading
    
    // Limit to positive consumption
    if (rawConsumption < 0) rawConsumption = 0
    
    // Convert to energy (kWh) if it's a gas meter
    let energyConsumption: number
    if (config?.meter_type === 'gas') {
      energyConsumption = convertGasToEnergy(rawConsumption, config?.gas_conversion_factor || 10.5)
    } else {
      energyConsumption = rawConsumption // Already in kWh
    }
    
    // Limit consumption to realistic values (0-1000 kWh per day)
    if (energyConsumption > 1000) energyConsumption = 1000
    
    return Math.round(energyConsumption * 100) / 100
  }, [config])

  // Calculate raw consumption in meter units (m³ for gas, kWh for electricity)
  const calculateRawConsumption = useCallback((currentReading: number, previousReading?: number): number => {
    if (!previousReading) return 0
    
    let consumption = currentReading - previousReading
    
    // Limit to positive consumption
    if (consumption < 0) consumption = 0
    
    return Math.round(consumption * 100) / 100
  }, [])

  // Calculate variable cost based on consumption (only energy cost, not base fee)
  const calculateCost = useCallback((consumption: number): number => {
    const pricePerKwh = config?.price_per_kwh || 0.1117
    return Math.round(consumption * pricePerKwh * 100) / 100
  }, [config])

  // Calculate total monthly cost (base fee + variable cost)
  const calculateMonthlyBill = useCallback((monthlyConsumption: number): number => {
    const baseFee = config?.base_monthly_fee || 14.76
    const variableCost = calculateCost(monthlyConsumption)
    return Math.round((baseFee + variableCost) * 100) / 100
  }, [config, calculateCost])

  // Calculate expected monthly bill based on annual consumption
  const getExpectedMonthlyBill = useCallback((): number => {
    if (!config) return 55.44 // Default from bill
    
    const baseFee = config.base_monthly_fee || 14.76
    const annualVariableCost = config.expected_annual_consumption * config.price_per_kwh
    const monthlyVariableCost = annualVariableCost / 12
    
    return Math.round((baseFee + monthlyVariableCost) * 100) / 100
  }, [config])

  // Upload photo to Supabase Storage (if configured)
  const uploadPhoto = useCallback(async (file: File): Promise<string | null> => {
    if (!isSupabaseConfigured) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
    }

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `meter-photos/${fileName}`

      const { error } = await supabase.storage
        .from('meter-photos')
        .upload(filePath, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('meter-photos')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading photo:', error)
      return null
    }
  }, [isSupabaseConfigured])

  // Add a new reading
  const addReading = useCallback(async (reading: number, confidence?: number, photoFile?: File) => {
    // Allow in demo mode or if authenticated
    if (!isDemoMode && (!isAuthenticated || !user)) {
      throw new Error('Please register or login to add readings')
    }

    setIsProcessing(true)
    
    try {
      // Upload photo if provided
      let photoUrl: string | null = null
      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile)
      }

      // Calculate consumption
      const sortedReadings = [...readings].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      
      // Get the most recent reading (last in sorted array)
      const previousReading = sortedReadings.length > 0 ? sortedReadings[sortedReadings.length - 1] : null
      const consumption = calculateConsumption(reading, previousReading?.reading)
      const cost = calculateCost(consumption)
      
      const confidenceDecimal = confidence ? confidence / 100 : undefined

      const newReading: ReadingData = {
        id: `reading_${Date.now()}`,
        date: new Date().toISOString(),
        reading,
        consumption,
        cost,
        confidence,
        imageUrl: photoUrl || undefined
      }

      if (isDemoMode) {
        // Demo mode: just use timestamp ID
        newReading.id = `demo_reading_${Date.now()}`
      } else if (isSupabaseConfigured && user) {
        // Save to Supabase with user_id
        const { data, error } = await supabase
          .from('house_readings')
          .insert({
            user_id: user.id,
            reading_value: reading,
            photo_url: photoUrl,
            reading_date: new Date().toISOString(),
            confidence_score: confidenceDecimal,
            consumption_since_last: consumption,
            cost_since_last: cost
          })
          .select()
          .single()

        if (error) throw error

        newReading.id = data.id
      }

      // Update local state
      const updatedReadings = [newReading, ...readings]
      setReadings(updatedReadings)

      // Save based on mode
      if (isDemoMode) {
        saveReadingsToSessionStorage(updatedReadings)
      } else {
        saveReadingsToLocalStorage(updatedReadings)
      }

    } catch (error) {
      console.error('Error adding reading:', error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [readings, calculateConsumption, calculateCost, isSupabaseConfigured, isAuthenticated, user, uploadPhoto, isDemoMode])

  // Get latest reading
  const getLatestReading = useCallback((): ReadingData | null => {
    if (readings.length === 0) return null
    return readings.reduce((latest, current) => 
      new Date(current.date) > new Date(latest.date) ? current : latest
    )
  }, [readings])

  // Utility functions to get consumption in different units
  const getRawConsumptionFromReading = useCallback((reading: ReadingData): number => {
    if (!config) return 0
    // For existing data, we need to reverse-calculate raw consumption from energy consumption
    if (config.meter_type === 'gas') {
      // Convert back from kWh to m³
      return Math.round((reading.consumption / config.gas_conversion_factor) * 100) / 100
    }
    return reading.consumption // Already in kWh for electricity
  }, [config])

  const getEnergyConsumptionFromReading = useCallback((reading: ReadingData): number => {
    // Reading.consumption is always stored in kWh for cost calculations
    return reading.consumption
  }, [])

  // Update the latest reading with corrected value
  const updateLatestReading = useCallback(async (correctedReading: number, photoFile?: File) => {
    // Block if not authenticated (demo mode)
    if (!isAuthenticated || !user) {
      throw new Error('Please register or login to update readings')
    }

    if (readings.length === 0) {
      console.warn('No readings to update')
      return
    }

    setIsProcessing(true)

    try {
      // Get the latest reading
      const latestReading = getLatestReading()
      if (!latestReading) {
        console.warn('No latest reading found')
        return
      }

      // Upload photo if provided
      let photoUrl: string | null = null
      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile)
      }

      // Calculate new consumption based on corrected reading
      const sortedReadings = [...readings].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      
      // Get the reading before the latest one
      const previousReading = sortedReadings.length > 1 ? sortedReadings[sortedReadings.length - 2] : null
      const newConsumption = calculateConsumption(correctedReading, previousReading?.reading)
      const newCost = calculateCost(newConsumption)

      console.log('📊 Updated consumption calculation:', {
        correctedReading,
        previousReading: previousReading?.reading,
        newConsumption,
        newCost
      })

      // Update the latest reading
      const updatedReading: ReadingData = {
        ...latestReading,
        reading: correctedReading,
        consumption: newConsumption,
        cost: newCost,
        confidence: 100, // Manual corrections have 100% confidence
        imageUrl: photoUrl || latestReading.imageUrl
      }

      console.log('🔄 Creating updated reading:', {
        originalReading: latestReading.reading,
        correctedReading: correctedReading,
        updatedReading: updatedReading.reading,
        originalId: latestReading.id,
        updatedId: updatedReading.id
      })

      if (isSupabaseConfigured && user) {
        const { error } = await supabase
          .from('house_readings')
          .update({
            reading_value: correctedReading,
            consumption_since_last: newConsumption,
            cost_since_last: newCost,
            confidence_score: 1.0, // 100% confidence
            photo_url: photoUrl || latestReading.imageUrl
          })
          .eq('id', latestReading.id)
          .eq('user_id', user.id)

        if (error) throw error
      }

      // Update local state
      const updatedReadings = readings.map(reading => {
        if (reading.id === latestReading.id) {
          console.log('🔄 Replacing reading:', {
            oldReading: reading.reading,
            newReading: updatedReading.reading,
            id: reading.id
          })
          return updatedReading
        }
        return reading
      })
      
      console.log('🔄 Before state update:', {
        readingsCount: readings.length,
        latestReadingId: latestReading.id,
        latestReadingValue: latestReading.reading
      })
      
      setReadings(updatedReadings)
      saveReadingsToLocalStorage(updatedReadings)

      console.log('📈 After state update:', {
        oldReading: latestReading.reading,
        newReading: correctedReading,
        oldConsumption: latestReading.consumption,
        newConsumption: newConsumption,
        updatedReadingsCount: updatedReadings.length,
        updatedLatestReading: updatedReadings.find(r => r.id === latestReading.id)?.reading,
        allReadings: updatedReadings.map(r => ({ id: r.id, reading: r.reading, date: r.date }))
      })

    } catch (error) {
      console.error('Error updating reading:', error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [readings, getLatestReading, calculateConsumption, calculateCost, isSupabaseConfigured, isAuthenticated, user, uploadPhoto])

  // Delete a reading
  const deleteReading = useCallback(async (id: string) => {
    // Allow in demo mode or if authenticated
    if (!isDemoMode && (!isAuthenticated || !user)) {
      throw new Error('Please register or login to delete readings')
    }

    try {
      if (isSupabaseConfigured && user) {
        const { error } = await supabase
          .from('house_readings')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) throw error
      }

      const updatedReadings = readings.filter(reading => reading.id !== id)
      setReadings(updatedReadings)
      
      // Save based on mode
      if (isDemoMode) {
        saveReadingsToSessionStorage(updatedReadings)
      } else {
        saveReadingsToLocalStorage(updatedReadings)
      }
    } catch (error) {
      console.error('Error deleting reading:', error)
      throw error
    }
  }, [readings, isSupabaseConfigured, isAuthenticated, user])

  // Get total consumption for current month
  const getMonthlyConsumption = useCallback((): number => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Filter readings for current month
    const monthlyReadings = readings.filter(reading => {
      const readingDate = new Date(reading.date)
      return readingDate.getMonth() === currentMonth && 
             readingDate.getFullYear() === currentYear
    })
    
    if (monthlyReadings.length === 0) return 0
    if (monthlyReadings.length === 1) return 0 // Can't calculate difference with only one reading
    
    // Sort by date to get first and last readings of the month
    const sortedReadings = monthlyReadings.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    const firstReading = sortedReadings[0]
    const lastReading = sortedReadings[sortedReadings.length - 1]
    
    // Calculate difference between last and first reading of the month
    const monthlyConsumption = lastReading.reading - firstReading.reading
    
    // Debug logging
    console.log('Monthly consumption calculation:', {
      month: currentMonth + 1,
      year: currentYear,
      totalReadings: monthlyReadings.length,
      firstReading: {
        date: firstReading.date,
        value: firstReading.reading
      },
      lastReading: {
        date: lastReading.date,
        value: lastReading.reading
      },
      monthlyConsumption: monthlyConsumption
    })
    
    // Ensure non-negative consumption
    return Math.max(0, monthlyConsumption)
  }, [readings])

  // Get total cost for current month
  const getMonthlyCost = useCallback((): number => {
    const monthlyConsumption = getMonthlyConsumption()
    const pricePerKwh = config?.price_per_kwh || 0.1117 // 11,17 ct/kWh
    return Math.round(monthlyConsumption * pricePerKwh * 100) / 100
  }, [getMonthlyConsumption, config])

  // Get average daily consumption
  const getAverageDailyConsumption = useCallback((): number => {
    if (readings.length < 2) return 0
    
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Filter readings for current month
    const monthlyReadings = readings.filter(reading => {
      const readingDate = new Date(reading.date)
      return readingDate.getMonth() === currentMonth && 
             readingDate.getFullYear() === currentYear
    })
    
    if (monthlyReadings.length < 2) return 0
    
    // Sort by date to get first and last readings of the month
    const sortedReadings = monthlyReadings.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    const firstReading = sortedReadings[0]
    const lastReading = sortedReadings[sortedReadings.length - 1]
    
    // Calculate total consumption for the month (difference between last and first)
    const totalMonthlyConsumption = lastReading.reading - firstReading.reading
    
    // Calculate days between first and last reading
    const daysDiff = Math.max(1, 
      Math.ceil((new Date(lastReading.date).getTime() - new Date(firstReading.date).getTime()) / (1000 * 60 * 60 * 24))
    )
    
    // Return average daily consumption
    return Math.round((totalMonthlyConsumption / daysDiff) * 100) / 100
  }, [readings])

  // NEW: Get monthly consumption with 30-day projection logic
  const getMonthlyConsumption30Days = useCallback((year?: number, month?: number) => {
    const now = new Date()
    const targetYear = year ?? now.getFullYear()
    const targetMonth = month ?? now.getMonth()
    
    // Filter readings for target month only
    const monthlyReadings = readings.filter(reading => {
      const readingDate = new Date(reading.date)
      return readingDate.getMonth() === targetMonth && 
             readingDate.getFullYear() === targetYear
    })
    
    // Case 1: Less than 2 readings in target month
    if (monthlyReadings.length < 2) {
      // Special case: If we have exactly 1 reading in target month, try cross-month projection
      if (monthlyReadings.length === 1) {
        // Get all readings from previous month
        const prevMonth = targetMonth === 0 ? 11 : targetMonth - 1
        const prevYear = targetMonth === 0 ? targetYear - 1 : targetYear
        
        const prevMonthReadings = readings.filter(reading => {
          const readingDate = new Date(reading.date)
          return readingDate.getMonth() === prevMonth && 
                 readingDate.getFullYear() === prevYear
        })
        
        // If we have at least 1 reading from previous month, use it for cross-month projection
        if (prevMonthReadings.length > 0) {
          // Get the last reading from previous month
          const lastPrevMonthReading = prevMonthReadings.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0]
          
          const currentMonthReading = monthlyReadings[0]
          const lastPrevDate = new Date(lastPrevMonthReading.date)
          const currentDate = new Date(currentMonthReading.date)
          
          // Calculate consumption between the two readings
          const observedConsumptionRaw = Math.max(0, currentMonthReading.reading - lastPrevMonthReading.reading)
          
          // Convert to energy (kWh) if it's a gas meter
          const observedConsumption = config?.meter_type === 'gas' 
            ? convertGasToEnergy(observedConsumptionRaw, config?.gas_conversion_factor || 10.5)
            : observedConsumptionRaw
          
          // Calculate total days between readings
          const lastPrevDateOnly = new Date(lastPrevDate.getFullYear(), lastPrevDate.getMonth(), lastPrevDate.getDate())
          const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
          const totalDays = Math.max(1, Math.round((currentDateOnly.getTime() - lastPrevDateOnly.getTime()) / (1000 * 60 * 60 * 24)))
          
          // Calculate how many days fall into the target month
          const firstDayOfTargetMonth = new Date(targetYear, targetMonth, 1)
          const daysInTargetMonth = Math.max(1, Math.round((currentDateOnly.getTime() - firstDayOfTargetMonth.getTime()) / (1000 * 60 * 60 * 24)))
          
          // Project to 30 days based on daily average
          const dailyAverage = observedConsumption / totalDays
          const consumption30Days = dailyAverage * 30
          
          return {
            consumption30Days: Math.round(consumption30Days * 100) / 100,
            isProjected: true,
            confidence: 'very_low' as 'high' | 'medium' | 'low' | 'insufficient' | 'very_low',
            photosCount: 1,
            daysObserved: daysInTargetMonth,
            status: 'cross_month' as 'complete' | 'projected' | 'insufficient_data' | 'cross_month',
            observedConsumption: Math.round(observedConsumption * 100) / 100,
            observedConsumptionRaw: Math.round(observedConsumptionRaw * 100) / 100,
            crossMonthProjection: true,
            totalDaysSpan: totalDays
          }
        }
      }
      
      // No readings or can't do cross-month projection
      return {
        consumption30Days: 0,
        isProjected: false,
        confidence: 'insufficient' as 'high' | 'medium' | 'low' | 'insufficient',
        photosCount: monthlyReadings.length,
        daysObserved: 0,
        status: 'insufficient_data' as 'complete' | 'projected' | 'insufficient_data',
        observedConsumption: 0,
        observedConsumptionRaw: 0
      }
    }
    
    // Sort by date to get first and last reading of the month
    const sortedReadings = monthlyReadings.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    // Remove duplicate readings from the same day (keep only the last one per day)
    const readingsByDay = new Map<string, typeof sortedReadings[0]>()
    sortedReadings.forEach(reading => {
      const dateKey = new Date(reading.date).toISOString().split('T')[0] // YYYY-MM-DD
      readingsByDay.set(dateKey, reading) // Keep the last reading for each day
    })
    const uniqueReadings = Array.from(readingsByDay.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    // If we only have one unique reading (all readings from same day), we can't calculate consumption
    if (uniqueReadings.length < 2) {
      return {
        consumption30Days: 0,
        isProjected: false,
        confidence: 'insufficient' as 'high' | 'medium' | 'low' | 'insufficient',
        photosCount: monthlyReadings.length,
        daysObserved: 0,
        status: 'insufficient_data' as 'complete' | 'projected' | 'insufficient_data',
        observedConsumption: 0,
        observedConsumptionRaw: 0
      }
    }
    
    const firstReading = uniqueReadings[0]
    const lastReading = uniqueReadings[uniqueReadings.length - 1]
    const firstDate = new Date(firstReading.date)
    const lastDate = new Date(lastReading.date)
    
    // Calculate consumption between first and last reading (in meter units, e.g., m³)
    const observedConsumptionRaw = Math.max(0, lastReading.reading - firstReading.reading)
    
    // Convert to energy (kWh) if it's a gas meter
    const observedConsumption = config?.meter_type === 'gas' 
      ? convertGasToEnergy(observedConsumptionRaw, config?.gas_conversion_factor || 10.5)
      : observedConsumptionRaw
    
    // Calculate days between first and last reading (calendar days only, no hours)
    // This counts the difference in calendar days, ignoring time of day
    const firstDateOnly = new Date(
      firstDate.getFullYear(),
      firstDate.getMonth(),
      firstDate.getDate()
    )
    const lastDateOnly = new Date(
      lastDate.getFullYear(),
      lastDate.getMonth(),
      lastDate.getDate()
    )
    
    const daysDifference = Math.round(
      (lastDateOnly.getTime() - firstDateOnly.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    // Ensure we have at least 1 day difference for valid projection
    if (daysDifference < 1) {
      return {
        consumption30Days: 0,
        isProjected: false,
        confidence: 'insufficient' as 'high' | 'medium' | 'low' | 'insufficient',
        photosCount: monthlyReadings.length,
        daysObserved: 0,
        status: 'insufficient_data' as 'complete' | 'projected' | 'insufficient_data',
        observedConsumption: 0,
        observedConsumptionRaw: 0
      }
    }
    
    const daysObserved = daysDifference
    
    // If no consumption observed, return 0
    if (observedConsumption <= 0) {
      return {
        consumption30Days: 0,
        isProjected: false,
        confidence: 'insufficient' as 'high' | 'medium' | 'low' | 'insufficient',
        photosCount: monthlyReadings.length,
        daysObserved: daysObserved,
        status: 'insufficient_data' as 'complete' | 'projected' | 'insufficient_data',
        observedConsumption: 0,
        observedConsumptionRaw: 0
      }
    }
    
    // Project to 30 days standard (now in kWh)
    const dailyAverage = observedConsumption / daysObserved
    const consumption30Days = dailyAverage * 30
    
    // Determine if month is complete
    const isCurrentMonth = targetYear === now.getFullYear() && targetMonth === now.getMonth()
    const totalDaysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate()
    const isMonthComplete = !isCurrentMonth || lastDate.getDate() >= totalDaysInMonth - 2
    
    let status: 'complete' | 'projected' | 'insufficient_data'
    let confidence: 'high' | 'medium' | 'low' | 'insufficient'
    let isProjected: boolean
    
    if (isMonthComplete && daysObserved >= totalDaysInMonth * 0.8) {
      status = 'complete'
      confidence = 'high'
      isProjected = false
    } else if (daysObserved >= 15) {
      status = 'projected'
      confidence = 'high'
      isProjected = true
    } else if (daysObserved >= 7) {
      status = 'projected'
      confidence = 'medium'
      isProjected = true
    } else {
      status = 'projected'
      confidence = 'low'
      isProjected = true
    }
    
    return {
      consumption30Days: Math.round(consumption30Days * 100) / 100, // kWh (30-day equivalent)
      isProjected,
      confidence,
      photosCount: monthlyReadings.length,
      daysObserved,
      status,
      observedConsumption: Math.round(observedConsumption * 100) / 100, // kWh (actual observed)
      observedConsumptionRaw: Math.round(observedConsumptionRaw * 100) / 100 // m³ or kWh (raw meter units)
    }
  }, [readings, config])

  // NEW: Get monthly comparison with 30-day normalization
  const getMonthlyComparison30Days = useCallback((year?: number, month?: number) => {
    const expectedMonthlyConsumption = (config?.expected_annual_consumption || 4370) / 12 // 364 kWh/month (30-day equivalent)
    const monthlyData = getMonthlyConsumption30Days(year, month)
    
    const difference = monthlyData.consumption30Days - expectedMonthlyConsumption
    const percentageDiff = expectedMonthlyConsumption > 0 
      ? Math.round((difference / expectedMonthlyConsumption) * 10000) / 100 // 2 decimals
      : 0
    
    // Calculate costs with correct pricing
    const pricePerKwh = config?.price_per_kwh || 0.1117 // 11.17 ct/kWh
    const baseFeeMonthly = config?.base_monthly_fee || 14.76 // €/month
    
    const realMonthlyCost = baseFeeMonthly + (monthlyData.consumption30Days * pricePerKwh)
    const expectedMonthlyCost = baseFeeMonthly + (expectedMonthlyConsumption * pricePerKwh)
    const costDifference = realMonthlyCost - expectedMonthlyCost
    
    return {
      expected: Math.round(expectedMonthlyConsumption * 100) / 100,
      real: monthlyData.consumption30Days,
      difference: Math.round(difference * 100) / 100,
      percentageDiff,
      // Cost details
      realMonthlyCost: Math.round(realMonthlyCost * 100) / 100,
      expectedMonthlyCost: Math.round(expectedMonthlyCost * 100) / 100,
      costDifference: Math.round(costDifference * 100) / 100,
      // Data quality
      isProjected: monthlyData.isProjected,
      confidence: monthlyData.confidence,
      status: monthlyData.status,
      photosCount: monthlyData.photosCount,
      daysObserved: monthlyData.daysObserved,
      observedConsumption: monthlyData.observedConsumption
    }
  }, [getMonthlyConsumption30Days, config])

  // NEW: Get multiple months comparison data (last N months)
  const getMonthlyComparisonTableData = useCallback((monthsBack: number = 6) => {
    const now = new Date()
    const monthsData = []
    
    for (let i = monthsBack - 1; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = targetDate.getFullYear()
      const month = targetDate.getMonth()
      
      const comparison = getMonthlyComparison30Days(year, month)
      
      monthsData.push({
        month: targetDate.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        fullMonth: targetDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        year,
        monthIndex: month,
        // Consumption data
        expected: comparison.expected,
        real: comparison.real,
        difference: comparison.difference,
        percentageDiff: comparison.percentageDiff,
        // Cost data
        realMonthlyCost: comparison.realMonthlyCost,
        expectedMonthlyCost: comparison.expectedMonthlyCost,
        costDifference: comparison.costDifference,
        // Data quality
        confidence: comparison.confidence,
        isProjected: comparison.isProjected,
        status: comparison.status,
        photosCount: comparison.photosCount,
        daysObserved: comparison.daysObserved,
        observedConsumption: comparison.observedConsumption
      })
    }
    
    return monthsData
  }, [getMonthlyComparison30Days])

  // Update configuration
  const updateConfig = useCallback(async (newConfig: Partial<HouseConfig>) => {
    if (!config) return { success: false, error: 'No config loaded' }

    const updatedConfig = { ...config, ...newConfig }
    setConfig(updatedConfig)

    // Save based on mode
    if (isDemoMode) {
      saveConfigToSessionStorage(updatedConfig)
      return { success: true }
    }

    // Save to Supabase or localStorage
    if (isSupabaseConfigured && user) {
      // Remove 'id' field if it's not a valid UUID (Supabase will generate it)
      const { id, ...configWithoutId } = updatedConfig
      
      // Use UPSERT to insert or update (handles case where config doesn't exist yet)
      const { error } = await supabase
        .from('house_config')
        .upsert({
          user_id: user.id,
          ...configWithoutId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) return { success: false, error: error.message }
      return { success: true }
    }

    saveConfigToLocalStorage(updatedConfig)
    return { success: true }
  }, [config, isSupabaseConfigured, user, isDemoMode])


  return {
    readings,
    config,
    isProcessing,
    loading,
    isSupabaseConfigured,
    isAuthenticated,
    isDemoMode,
    activateDemoMode,
    addReading,
    updateLatestReading,
    deleteReading,
    getLatestReading,
    getMonthlyConsumption,
    getMonthlyCost,
    getAverageDailyConsumption,
    calculateMonthlyBill,
    getExpectedMonthlyBill,
    // NEW: 30-day normalized monthly comparison functions
    getMonthlyConsumption30Days,
    getMonthlyComparison30Days,
    getMonthlyComparisonTableData,
    getRawConsumptionFromReading,
    getEnergyConsumptionFromReading,
    calculateRawConsumption,
    updateConfig,
    refreshData: isSupabaseConfigured && user ? loadReadingsFromSupabase : loadReadingsFromLocalStorage
  }
}


