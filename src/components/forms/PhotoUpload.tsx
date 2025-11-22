'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ReadingCorrection } from '@/components/ReadingCorrection'
import { DecimalDetectionResult } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'
import { AuthModal } from '@/components/ui/auth-modal'

interface PhotoUploadProps {
  onPhotoUpload: (file: File) => void
  onReadingExtracted?: (reading: number, confidence: number, photoFile?: File) => void
  onReadingCorrected?: (originalReading: number, correctedReading: number, photoFile?: File) => void
  isLoading?: boolean
}

export function PhotoUpload({ onPhotoUpload, onReadingExtracted, onReadingCorrected, isLoading = false }: PhotoUploadProps) {
  const { isAuthenticated } = useAuth()
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [extractedReading, setExtractedReading] = useState<number | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [decimalDetection, setDecimalDetection] = useState<DecimalDetectionResult | null>(null)
  const [showCorrection, setShowCorrection] = useState(false)
  const [currentPhotoFile, setCurrentPhotoFile] = useState<File | null>(null)
  const [decimalPlaces, setDecimalPlaces] = useState<number>(0)
  const [readingUnit, setReadingUnit] = useState<string>('m³') // Unit from API
  const [showAuthModal, setShowAuthModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = async (file: File) => {
    // Allow in demo mode or if authenticated
    // Demo mode check will be done via props or context
    if (!isAuthenticated) {
      // Check if we're in demo mode via sessionStorage
      const isDemoMode = typeof window !== 'undefined' && sessionStorage.getItem('demo-mode') === 'true'
      if (!isDemoMode) {
        setShowAuthModal(true)
        return
      }
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      onPhotoUpload(file)
      setCurrentPhotoFile(file)
      
      // Process with AI
      setProcessing(true)
      try {
        const formData = new FormData()
        formData.append('photo', file)
        
        const response = await fetch('/api/ai/process-photo', {
          method: 'POST',
          body: formData,
        })
        
        const result = await response.json()
        
        if (result.success) {
          // Apply decimal places logic
          let finalReading = result.reading
          if (decimalPlaces > 0) {
            const readingStr = result.reading.toString()
            if (readingStr.length > decimalPlaces) {
              finalReading = parseInt(readingStr.slice(0, -decimalPlaces))
            }
          }
          
          setExtractedReading(finalReading)
          setConfidence(result.confidence)
          setReadingUnit(result.unit || 'm³')
          setDecimalDetection({
            value: finalReading.toString(),
            confidence: result.confidence,
            hasDecimal: decimalPlaces > 0,
            reasoning: decimalPlaces > 0 ? [`Removed ${decimalPlaces} decimal place(s)`] : ['No decimal places to remove']
          })
          setShowCorrection(true)
        } else {
          console.error('Failed to extract reading:', result.error)
        }
      } catch (error) {
        console.error('Error processing photo:', error)
      } finally {
        setProcessing(false)
      }
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const resetUpload = () => {
    setPreview(null)
    setExtractedReading(null)
    setConfidence(null)
    setDecimalDetection(null)
    setShowCorrection(false)
    setCurrentPhotoFile(null)
    setProcessing(false)
    setReadingUnit('m³')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleReadingConfirm = (value: string) => {
    const numericValue = parseFloat(value)
    if (!isNaN(numericValue)) {
      onReadingExtracted?.(numericValue, confidence || 0, currentPhotoFile || undefined)
      setShowCorrection(false)
    }
  }

  const handleReadingCorrect = (correctedValue: string) => {
    const originalValue = extractedReading || 0
    const numericCorrectedValue = parseFloat(correctedValue)
    
    if (!isNaN(numericCorrectedValue)) {
      setExtractedReading(numericCorrectedValue)
      onReadingCorrected?.(originalValue, numericCorrectedValue, currentPhotoFile || undefined)
      setShowCorrection(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        {preview ? (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={preview}
                alt="Meter preview"
                className="max-h-64 mx-auto rounded-lg shadow-lg"
              />
              <button
                onClick={resetUpload}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="text-green-600 dark:text-green-400 font-medium">
              ✅ Photo uploaded successfully!
            </div>
            {(processing || isLoading) && (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-blue-600 dark:text-blue-400">Processing with AI...</span>
              </div>
            )}
            {extractedReading && confidence && !showCorrection && (
              <div className="mt-4 p-4 bg-green-500/20 rounded-lg border border-green-400/30">
                <div className="text-green-300 font-bold text-xl">
                  {extractedReading.toLocaleString()} m³
                </div>
                <div className="text-green-200 text-sm">
                  Confidence: {confidence}%
                </div>
                <div className="text-green-200 text-xs mt-1">
                  ✨ Powered by Gemini AI
                </div>
              </div>
            )}
            
            {/* Reading Correction Component */}
            {showCorrection && decimalDetection && extractedReading && (
              <div className="mt-4">
                <ReadingCorrection
                  detectedValue={extractedReading.toString()}
                  confidence={decimalDetection.confidence}
                  onConfirm={handleReadingConfirm}
                  onCorrect={handleReadingCorrect}
                  isLoading={isLoading}
                  unit={readingUnit}
                />
              </div>
            )}
            
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Upload Your Gas Meter Photo
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Drag and drop your gas meter photo here, or click to browse. 
              Our AI will automatically extract the reading.
            </p>
            
            {/* Decimal Places Selector */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <label className="block text-sm font-medium text-white mb-2">
                How many decimal places does your meter show?
              </label>
              <div className="flex gap-2 justify-center">
                {[0, 1, 2, 3].map((places) => (
                  <button
                    key={places}
                    onClick={() => setDecimalPlaces(places)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      decimalPlaces === places
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {places === 0 ? 'None' : `${places} decimal${places > 1 ? 's' : ''}`}
                  </button>
                ))}
              </div>
              <p className="text-xs text-white/60 mt-2 text-center">
                {decimalPlaces === 0 
                  ? 'Reading will be used as-is (e.g., 12345 → 12345)'
                  : `Last ${decimalPlaces} digit${decimalPlaces > 1 ? 's' : ''} will be removed (e.g., 12345 → ${'12345'.slice(0, -decimalPlaces)})`
                }
              </p>
            </div>
            <Button
              onClick={openFileDialog}
              disabled={processing || isLoading}
              className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
            >
              {(processing || isLoading) ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                '📷 Choose Photo'
              )}
            </Button>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supports JPG, PNG, WebP up to 10MB
            </p>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          title="Registration Required"
          message="Please register or login to upload photos and extract meter readings."
          action="Register Now"
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  )
}
