'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { generateSuggestions } from '@/lib/decimal-detection'

interface ReadingCorrectionProps {
  detectedValue: string
  confidence: number
  onCorrect: (correctedValue: string) => void
  onConfirm: (value: string) => void
  isLoading?: boolean
  unit?: string // Unit of measurement (m³, kWh, etc.)
}

export function ReadingCorrection({ 
  detectedValue, 
  confidence, 
  onCorrect, 
  onConfirm, 
  isLoading = false,
  unit = 'm³'
}: ReadingCorrectionProps) {
  // Normalize confidence: if it's > 1, assume it's in 0-100 range, convert to 0-1
  const normalizedConfidence = confidence > 1 ? confidence / 100 : confidence
  const [isCorrecting, setIsCorrecting] = useState(false)
  const [correctedValue, setCorrectedValue] = useState(detectedValue)
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const suggestions = generateSuggestions(detectedValue)
  
  const handleConfirm = () => {
    onConfirm(detectedValue)
  }
  
  const handleCorrect = () => {
    onCorrect(correctedValue)
    setIsCorrecting(false)
  }
  
  const handleSuggestionSelect = (suggestion: string) => {
    setCorrectedValue(suggestion)
    setShowSuggestions(false)
  }
  
  const getConfidenceColor = () => {
    if (normalizedConfidence > 0.8) return 'text-green-600 dark:text-green-400'
    if (normalizedConfidence > 0.6) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }
  
  const getConfidenceIcon = () => {
    if (normalizedConfidence > 0.8) return '🎯'
    if (normalizedConfidence > 0.6) return '⚠️'
    return '❌'
  }
  
  const getConfidenceText = () => {
    if (normalizedConfidence > 0.8) return 'High Accuracy'
    if (normalizedConfidence > 0.6) return 'Medium Accuracy'
    return 'Low Accuracy - Please Review'
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
        {/* Detected Reading Display */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {detectedValue} {unit}
          </div>
          
          {/* Confidence Indicator */}
          <div className={`flex items-center justify-center space-x-2 text-sm font-medium ${getConfidenceColor()}`}>
            <span className="text-lg">{getConfidenceIcon()}</span>
            <span>{getConfidenceText()}</span>
            <span className="text-xs opacity-75">({Math.round(normalizedConfidence * 100)}%)</span>
          </div>
        </div>

        {/* Action Buttons */}
        {!isCorrecting ? (
          <div className="flex space-x-3">
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Confirming...</span>
                </div>
              ) : (
                <>
                  <span className="mr-2">✅</span>
                  Confirm Reading
                </>
              )}
            </Button>
            
            <Button
              onClick={() => setIsCorrecting(true)}
              disabled={isLoading}
              variant="outline"
              className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20"
            >
              <span className="mr-2">✏️</span>
              Correct Value
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Correction Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter the correct reading:
              </label>
              <input
                type="text"
                value={correctedValue}
                onChange={(e) => setCorrectedValue(e.target.value)}
                placeholder="e.g., 6543.9"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Smart Suggestions */}
            <div>
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                💡 Smart suggestions
              </button>
              
              {showSuggestions && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Common decimal formats:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Correction Actions */}
            <div className="flex space-x-3">
              <Button
                onClick={handleCorrect}
                disabled={isLoading || !correctedValue.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <>
                    <span className="mr-2">💾</span>
                    Save Correction
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => {
                  setIsCorrecting(false)
                  setCorrectedValue(detectedValue)
                  setShowSuggestions(false)
                }}
                variant="outline"
                className="px-4"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          <p>
            💡 Tip: If the reading looks incorrect, click &quot;Correct Value&quot; to enter the accurate reading manually.
          </p>
        </div>
      </div>
    </div>
  )
}

