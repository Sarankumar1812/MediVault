// lib/text-extractor.ts
export interface ExtractedData {
  text: string
  vitals: string[]
  metadata: Record<string, any>
}

export async function extractTextFromUrl(url: string, fileType: string): Promise<ExtractedData> {
  try {
    console.log(`Extracting text from: ${url}, type: ${fileType}`)
    
    // For local testing, skip fetch for now and return mock data
    if (url.includes('cloudinary') || url.includes('http')) {
      try {
        const response = await fetch(url)
        if (!response.ok) {
          console.warn(`Failed to fetch file from ${url}: ${response.statusText}`)
          return {
            text: `File uploaded: ${url}`,
            vitals: [],
            metadata: { type: fileType, url, error: 'Failed to fetch file' }
          }
        }

        if (fileType.includes('csv') || fileType.includes('text') || fileType.includes('plain')) {
          const text = await response.text()
          return extractDataFromCSV(text)
        }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError)
      }
    }
    
    // Return basic info for other file types
    return {
      text: `File uploaded: ${url}`,
      vitals: [],
      metadata: { type: fileType, url }
    }
  } catch (error) {
    console.error('Error in extractTextFromUrl:', error)
    return {
      text: '',
      vitals: [],
      metadata: { error: 'Failed to extract text', type: fileType, url }
    }
  }
}

function extractDataFromCSV(csvText: string): ExtractedData {
  try {
    const lines = csvText.split('\n').filter(line => line.trim() !== '')
    const vitals: string[] = []
    let extractedText = ''
    
    console.log(`Processing CSV with ${lines.length} lines`)
    
    // Medical test keywords to look for
    const medicalKeywords = [
      'WBC', 'White Blood Cells',
      'RBC', 'Red Blood Cells',
      'Hemoglobin', 'Hb',
      'Hematocrit', 'Hct',
      'Platelets',
      'Cholesterol',
      'Glucose',
      'ALT', 'AST', 'ALP',
      'Creatinine',
      'BUN', 'Blood Urea Nitrogen',
      'TSH', 'T3', 'T4',
      'Blood Pressure', 'BP',
      'Heart Rate', 'HR',
      'Temperature', 'Temp'
    ]
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      extractedText += trimmedLine + '\n'
      
      // Parse CSV format (comma-separated)
      if (trimmedLine.includes(',')) {
        const parts = trimmedLine.split(',').map(p => p.trim().replace(/"/g, ''))
        
        // Look for test name in first column
        if (parts.length >= 2) {
          const testName = parts[0]
          const value = parts[1]
          
          // Check if this looks like a medical test
          const isMedicalTest = medicalKeywords.some(keyword => 
            testName.toLowerCase().includes(keyword.toLowerCase())
          )
          
          if (testName && value && isMedicalTest && !isNaN(parseFloat(value))) {
            let vitalEntry = `${testName}: ${value}`
            if (parts[2]) vitalEntry += ` ${parts[2]}` // Add unit if present
            if (parts[3]) vitalEntry += ` (Ref: ${parts[3]})` // Add reference range if present
            
            vitals.push(vitalEntry)
          }
        }
      }
    }
    
    console.log(`Extracted ${vitals.length} vitals from CSV`)
    
    return {
      text: extractedText.trim(),
      vitals: [...new Set(vitals)], // Remove duplicates
      metadata: {
        lines: lines.length,
        containsCSV: csvText.includes(','),
        extractedVitals: vitals.length
      }
    }
  } catch (error) {
    console.error('Error parsing CSV:', error)
    return {
      text: csvText,
      vitals: [],
      metadata: { error: 'Failed to parse CSV' }
    }
  }
}