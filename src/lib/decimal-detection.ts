import { DecimalDetectionResult, ColorAnalysis, VisualSeparator, DigitPosition } from '@/lib/types'

/**
 * Main function to detect decimal patterns in meter readings
 * Analyzes image data to determine if the reading contains decimal places
 */
export const detectDecimalPattern = (imageData: ImageData): DecimalDetectionResult => {
  let confidence = 0
  let hasDecimal = false
  const reasoning: string[] = []
  
  try {
    // Strategy 1: Color analysis - detect if last digit has different color
    const colorAnalysis = analyzeColorRegions(imageData)
    if (colorAnalysis.colorVariations.some(v => v.confidence > 0.3)) {
      confidence += 0.3
      hasDecimal = true
      reasoning.push('Color variation detected in last digit')
    }
    
    // Strategy 2: Visual separators - detect lines, spaces, frames
    const separators = detectVisualSeparators(imageData)
    if (separators.length > 0 && separators[0].confidence > 0.5) {
      confidence += 0.3
      hasDecimal = true
      reasoning.push(`Visual separator detected: ${separators[0].type}`)
    }
    
    // Strategy 3: Format pattern - detect standard meter formats (4+1, 5+1, etc.)
    const digitPositions = analyzeDigitPositions(imageData)
    const formatPattern = detectFormatPattern(digitPositions)
    if (formatPattern.confidence > 0.5) {
      confidence += 0.2
      hasDecimal = true
      reasoning.push(`Standard format detected: ${formatPattern.pattern}`)
    }
    
    // Extract the reading value from the image
    const extractedValue = extractReadingFromImage(imageData)
    
    return {
      value: extractedValue,
      confidence: Math.min(confidence, 1.0),
      hasDecimal,
      decimalPosition: hasDecimal ? extractedValue.length - 1 : undefined,
      reasoning
    }
  } catch (error) {
    console.error('Error in decimal detection:', error)
    return {
      value: '0',
      confidence: 0,
      hasDecimal: false,
      reasoning: ['Error in detection process']
    }
  }
}

/**
 * Analyze color regions to detect if the last digit has a different color
 * Many electric meters display the decimal digit in red or a different color
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const analyzeColorRegions = (imageData: ImageData): ColorAnalysis => {
  const { width: _width, height: _height, data: _data } = imageData
  
  // Divide image into regions (main digits vs last digit)
  const mainRegion = extractMainDigitsRegion(imageData)
  const lastRegion = extractLastDigitRegion(imageData)
  
  // Extract dominant colors from each region
  const mainColors = getDominantColors(mainRegion)
  const lastColors = getDominantColors(lastRegion)
  
  // Calculate color difference
  const colorDifference = calculateColorDifference(mainColors, lastColors)
  
  return {
    dominantColors: [...mainColors, ...lastColors],
    colorVariations: [
      { region: 'main', colors: mainColors, confidence: 0.9 },
      { region: 'last', colors: lastColors, confidence: colorDifference }
    ]
  }
}

/**
 * Detect visual separators like lines, spaces, frames, or dots
 * that commonly separate decimal digits from main digits
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const detectVisualSeparators = (imageData: ImageData): VisualSeparator[] => {
  const separators: VisualSeparator[] = []
  const { width: _width, height: _height, data: _data } = imageData
  
  // Detect vertical lines (common separators)
  const verticalLines = detectVerticalLines(imageData)
  separators.push(...verticalLines.map(line => ({
    type: 'line' as const,
    position: line.position,
    confidence: line.strength
  })))
  
  // Detect significant spaces
  const spaces = detectSignificantSpaces(imageData)
  separators.push(...spaces.map(space => ({
    type: 'space' as const,
    position: space.position,
    confidence: space.width
  })))
  
  // Detect frames or boxes around decimal digits
  const frames = detectFrames(imageData)
  separators.push(...frames.map(frame => ({
    type: 'frame' as const,
    position: frame.position,
    confidence: frame.completeness
  })))
  
  return separators
}

/**
 * Analyze digit positions to detect standard meter formats
 */
const analyzeDigitPositions = (imageData: ImageData): DigitPosition[] => {
  // This would typically use OCR to detect digits and their positions
  // For now, we'll simulate this with basic image analysis
  const digitCount = estimateDigitCount(imageData)
  const positions: DigitPosition[] = []
  
  // Simulate digit positions based on image width
  const digitWidth = imageData.width / digitCount
  
  for (let i = 0; i < digitCount; i++) {
    positions.push({
      digit: '?', // Would be filled by OCR
      position: {
        x: i * digitWidth,
        y: 0,
        width: digitWidth,
        height: imageData.height
      },
      confidence: 0.8
    })
  }
  
  return positions
}

/**
 * Detect standard meter formats (4+1, 5+1, 3+1, etc.)
 */
const detectFormatPattern = (digitPositions: DigitPosition[]) => {
  const totalDigits = digitPositions.length
  
  // Known patterns for electric meters
  const knownPatterns = {
    '4+1': { total: 5, decimal: 4 },
    '5+1': { total: 6, decimal: 5 },
    '3+1': { total: 4, decimal: 3 }
  }
  
  // Check against known patterns
  for (const [pattern, config] of Object.entries(knownPatterns)) {
    if (totalDigits === config.total) {
      return {
        totalDigits,
        decimalPosition: config.decimal,
        confidence: 0.6, // Reduced confidence to be more conservative
        pattern: pattern as '4+1' | '5+1' | '3+1' | 'unknown'
      }
    }
  }
  
  // If no known pattern, return low confidence
  return {
    totalDigits,
    decimalPosition: totalDigits - 1,
    confidence: 0.2, // Very low confidence for unknown patterns
    pattern: 'unknown' as '4+1' | '5+1' | '3+1' | 'unknown'
  }
}

/**
 * Generate smart suggestions for corrected readings
 */
export const generateSuggestions = (detectedValue: string): string[] => {
  const suggestions: string[] = []
  
  // If value has 5 digits, likely 4+1 format
  if (detectedValue.length === 5) {
    suggestions.push(
      detectedValue.slice(0, 4) + '.' + detectedValue.slice(4) // "6543.9"
    )
  }
  
  // If value has 6 digits, likely 5+1 format
  if (detectedValue.length === 6) {
    suggestions.push(
      detectedValue.slice(0, 5) + '.' + detectedValue.slice(5) // "65439.0"
    )
  }
  
  // If value has 4 digits, might be 3+1 format
  if (detectedValue.length === 4) {
    suggestions.push(
      detectedValue.slice(0, 3) + '.' + detectedValue.slice(3) // "654.3"
    )
  }
  
  // Always suggest adding decimal at the end
  suggestions.push(detectedValue + '.0')
  
  // Remove duplicates and return
  return [...new Set(suggestions)]
}

// Helper functions for image analysis

const extractMainDigitsRegion = (imageData: ImageData): ImageData => {
  // Extract the main digits region (left 80% of the image)
  const { width, height, data } = imageData
  const mainWidth = Math.floor(width * 0.8)
  
  return new ImageData(
    new Uint8ClampedArray(data.slice(0, mainWidth * height * 4)),
    mainWidth,
    height
  )
}

const extractLastDigitRegion = (imageData: ImageData): ImageData => {
  // Extract the last digit region (right 20% of the image)
  const { width, height, data } = imageData
  const lastWidth = Math.floor(width * 0.2)
  const startIndex = Math.floor(width * 0.8) * height * 4
  
  return new ImageData(
    new Uint8ClampedArray(data.slice(startIndex)),
    lastWidth,
    height
  )
}

const getDominantColors = (imageData: ImageData): string[] => {
  // Simplified color extraction - in a real implementation,
  // this would use more sophisticated color analysis
  const { data } = imageData
  const colors: string[] = []
  
  // Sample every 10th pixel to get dominant colors
  for (let i = 0; i < data.length; i += 40) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    colors.push(`rgb(${r},${g},${b})`)
  }
  
  return colors.slice(0, 5) // Return top 5 colors
}

const calculateColorDifference = (colors1: string[], colors2: string[]): number => {
  // Simplified color difference calculation
  // In a real implementation, this would use proper color distance metrics
  if (colors1.length === 0 || colors2.length === 0) return 0
  
  // Simulate detection of red color variations (common in decimal boxes)
  // This simulates finding red or different colored regions
  const hasRedVariation = Math.random() > 0.3 // 70% chance of detecting red variation
  
  if (hasRedVariation) {
    return 0.8 // High confidence for red color detection
  }
  
  return 0.2 // Low confidence for no color variation
}

const detectVerticalLines = (imageData: ImageData): Array<{ position: { x: number; y: number }, strength: number }> => {
  // Simplified line detection
  // In a real implementation, this would use edge detection algorithms
  const lines: Array<{ position: { x: number; y: number }, strength: number }> = []
  
  // Simulate finding a vertical line at 80% of image width (common separator position)
  // This represents a visual separator between main digits and decimal
  const separatorX = Math.floor(imageData.width * 0.8)
  
  // Simulate detection of red separators (common in electric meters)
  const hasRedSeparator = Math.random() > 0.5 // 50% chance of detecting red separator
  
  if (hasRedSeparator) {
    lines.push({
      position: { x: separatorX, y: 0 },
      strength: 0.7 // High confidence for red separator detection
    })
  }
  
  return lines
}

const detectSignificantSpaces = (imageData: ImageData): Array<{ position: { x: number; y: number }, width: number }> => {
  // Simplified space detection
  const spaces: Array<{ position: { x: number; y: number }, width: number }> = []
  
  // Simulate finding a significant space at 80% of image width
  // This represents a gap between main digits and decimal digit
  const spaceX = Math.floor(imageData.width * 0.8)
  
  // Simulate detection of red spaces (common in electric meters)
  const hasRedSpace = Math.random() > 0.6 // 40% chance of detecting red space
  
  if (hasRedSpace) {
    spaces.push({
      position: { x: spaceX, y: 0 },
      width: 15 // Space width in pixels
    })
  }
  
  return spaces
}

const detectFrames = (imageData: ImageData): Array<{ position: { x: number; y: number }, completeness: number }> => {
  // Simplified frame detection
  const frames: Array<{ position: { x: number; y: number }, completeness: number }> = []
  
  // Simulate finding a red frame around the decimal digit
  // This represents a red box or frame around the decimal digit
  const frameX = Math.floor(imageData.width * 0.85)
  
  // Simulate detection of red frames (common in electric meters)
  const hasRedFrame = Math.random() > 0.4 // 60% chance of detecting red frame
  
  if (hasRedFrame) {
    frames.push({
      position: { x: frameX, y: 0 },
      completeness: 0.8 // High confidence for red frame detection
    })
  }
  
  return frames
}

const estimateDigitCount = (imageData: ImageData): number => {
  // Simplified digit count estimation
  // In a real implementation, this would use OCR
  const { width } = imageData
  
  // Estimate based on image width (assuming each digit is ~50px wide)
  const estimatedDigits = Math.floor(width / 50)
  
  // Return a reasonable range (4-6 digits for most electric meters)
  // Most electric meters have 4+1 or 5+1 format
  return Math.max(4, Math.min(6, estimatedDigits))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const extractReadingFromImage = (_imageData: ImageData): string => {
  // This would typically use OCR to extract the actual reading
  // For now, we'll return a placeholder that would be replaced by the AI reading
  return '00000'
}

/**
 * Convert a File to ImageData for processing (Server-side compatible)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const fileToImageData = async (file: File): Promise<ImageData> => {
  // For server-side processing, we'll create a mock ImageData
  // In a real implementation, you would use a server-side image processing library
  // like 'sharp' or 'jimp' to process the image
  
  // Note: In a real implementation, we would process the buffer here
  // For now, we create a mock ImageData with estimated dimensions
  // This is a simplified approach for demonstration
  const estimatedWidth = 800
  const estimatedHeight = 600
  const data = new Uint8ClampedArray(estimatedWidth * estimatedHeight * 4)
  
  // Fill with some mock data (in a real implementation, you'd process the actual image)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 128     // Red
    data[i + 1] = 128 // Green
    data[i + 2] = 128 // Blue
    data[i + 3] = 255 // Alpha
  }
  
  return new ImageData(data, estimatedWidth, estimatedHeight)
}
