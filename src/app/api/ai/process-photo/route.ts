import { NextRequest, NextResponse } from 'next/server'
import { extractMeterReading } from '@/lib/gemini/client'
import { detectDecimalPattern, fileToImageData } from '@/lib/decimal-detection'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('photo') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No photo provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Check if Gemini API key is configured
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract meter reading using Gemini
    const result = await extractMeterReading(buffer, file.type)

    if (result.error) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error,
          extractedText: result.extractedText
        },
        { status: 400 }
      )
    }

    // Perform decimal detection analysis
    let decimalDetection = null
    try {
      // Convert file to ImageData for decimal detection
      const imageData = await fileToImageData(file)
      decimalDetection = detectDecimalPattern(imageData)
      
      // Log the detection results for debugging
      console.log('Decimal detection result:', {
        hasDecimal: decimalDetection.hasDecimal,
        confidence: decimalDetection.confidence,
        reasoning: decimalDetection.reasoning,
        originalReading: result.reading
      })
      
      // DECIMAL DETECTION LOGIC: If decimals detected, remove them
      if (decimalDetection.hasDecimal && decimalDetection.confidence > 0.3) {
        const originalReading = result.reading.toString()
        
        // Remove the last digit if we detected decimals
        if (originalReading.length >= 4) {
          const adjustedReading = originalReading.slice(0, -1)
          const newReading = parseFloat(adjustedReading)
          
          console.log('🔧 Decimal detected - removing last digit:', { 
            original: originalReading, 
            adjusted: adjustedReading, 
            newReading: newReading,
            confidence: decimalDetection.confidence,
            reasoning: decimalDetection.reasoning
          })
          
          result.reading = newReading
        }
      }
    } catch (error) {
      console.error('Error in decimal detection:', error)
      // Continue without decimal detection if it fails
    }

    return NextResponse.json({
      success: true,
      reading: result.reading,
      confidence: result.confidence,
      unit: result.unit,
      extractedText: result.extractedText,
      decimalDetection: decimalDetection,
      timestamp: new Date().toISOString(),
      message: 'Reading extracted successfully using Gemini AI'
    })

  } catch (error) {
    console.error('Error processing photo:', error)
    return NextResponse.json(
      { error: 'Failed to process photo' },
      { status: 500 }
    )
  }
}
