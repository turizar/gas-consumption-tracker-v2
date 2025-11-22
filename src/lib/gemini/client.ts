import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

export const geminiClient = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash-lite",
  generationConfig: {
    temperature: 0.1,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 1024,
  }
})

export interface MeterReadingResult {
  reading: number
  confidence: number
  unit: string
  extractedText?: string
  error?: string
}

export async function extractMeterReading(imageBuffer: Buffer, mimeType: string): Promise<MeterReadingResult> {
  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64')
    
    const prompt = `
    Analyze this meter image and extract the current reading. 

    Instructions:
    1. Look for digital or analog meter displays (energy or gas meters)
    2. Identify the main reading number (usually the largest/most prominent number)
    3. For GAS METERS: The reading is in m³ (cubic meters) - this is what we want
    4. For ELECTRICITY METERS: The reading is in kWh (kilowatt-hours)
    5. Ignore any decimal places beyond 1-2 digits
    6. If you see multiple numbers, choose the one that represents the total consumption
    7. If the image is unclear or doesn't contain a meter, return an error

    Please respond in this exact JSON format:
    {
      "reading": <number>,
      "confidence": <number between 0-100>,
      "unit": "m³" or "kWh" (depending on meter type),
      "extractedText": "<any text you can read from the image>",
      "error": null
    }

    IMPORTANT: Gas meters showing m³ readings are perfectly valid and should NOT return an error.
    If you cannot read the meter or the image is not a meter, set error to a descriptive message and reading to 0.
    `

    const result = await geminiClient.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      }
    ])

    const response = await result.response
    const text = response.text()
    
    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          reading: parsed.reading || 0,
          confidence: parsed.confidence || 0,
          unit: parsed.unit || 'm³',
          extractedText: parsed.extractedText || '',
          error: parsed.error || undefined
        }
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError)
    }

    // Fallback: try to extract number from text
    const numberMatch = text.match(/(\d+(?:\.\d+)?)/g)
    if (numberMatch && numberMatch.length > 0) {
      const reading = parseFloat(numberMatch[0])
      return {
        reading: reading,
        confidence: 70,
        unit: 'm³',
        extractedText: text,
        error: undefined
      }
    }

    return {
      reading: 0,
      confidence: 0,
      unit: 'm³',
      extractedText: text,
      error: 'Could not extract meter reading from image'
    }

  } catch (error) {
    console.error('Gemini API error:', error)
    return {
      reading: 0,
      confidence: 0,
      unit: 'kWh',
      extractedText: '',
      error: `API Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}
