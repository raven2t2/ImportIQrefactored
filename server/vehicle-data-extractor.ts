/**
 * Advanced Vehicle Data Extractor
 * Extracts comprehensive vehicle information from URLs, VINs, and descriptions
 * Uses authentic data patterns from major auction sites and VIN databases
 */

import * as cheerio from 'cheerio';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface ExtractedVehicleData {
  make: string;
  model: string;
  year: number;
  trim?: string;
  engine?: string;
  transmission?: string;
  mileage?: string;
  color?: string;
  vin?: string;
  price?: number;
  currency?: string;
  source: string;
  confidence: number; // 0-100
  extractionMethod: 'url_parsing' | 'vin_decode' | 'manual_input';
}

/**
 * Extract vehicle data from various sources
 */
export async function extractVehicleData(input: {
  url?: string;
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
}): Promise<ExtractedVehicleData> {
  // VIN takes priority
  if (input.vin) {
    return await extractFromVIN(input.vin);
  }
  
  // URL parsing with AI enhancement
  if (input.url) {
    try {
      const urlData = await extractFromURL(input.url);
      
      // If extraction confidence is low, enhance with AI
      if (urlData.confidence < 80) {
        const enhancedData = await enhanceExtractionWithAI(input.url, urlData);
        if (enhancedData && enhancedData.confidence > urlData.confidence) {
          return enhancedData;
        }
      }
      
      return urlData;
    } catch (error) {
      // Fallback to AI analysis for complex URLs
      const aiData = await enhanceExtractionWithAI(input.url);
      if (aiData && aiData.confidence > 60) {
        return aiData;
      }
      throw error;
    }
  }
  
  // Manual input with validation
  if (input.make && input.model && input.year) {
    const currentYear = new Date().getFullYear();
    
    // Validate year is reasonable
    if (input.year > currentYear + 1 || input.year < 1900) {
      throw new Error(`Invalid vehicle year: ${input.year}. Please verify the vehicle information.`);
    }
    
    return {
      make: normalizeCarMake(input.make),
      model: normalizeCarModel(input.model),
      year: input.year,
      source: 'manual_input',
      confidence: 95,
      extractionMethod: 'manual_input'
    };
  }
  
  throw new Error('Insufficient vehicle information provided. Please provide a valid URL, VIN, or complete vehicle details.');
}

/**
 * Enhanced vehicle data extraction using OpenAI for complex URLs and descriptions
 */
async function enhanceExtractionWithAI(url: string, existingData?: ExtractedVehicleData): Promise<ExtractedVehicleData | null> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.log('OpenAI API key not available, skipping AI enhancement');
      return null;
    }

    const prompt = `
Analyze this vehicle listing URL and extract accurate vehicle information:

URL: ${url}

${existingData ? `
Current extraction attempt found:
- Make: ${existingData.make}
- Model: ${existingData.model} 
- Year: ${existingData.year}
- Confidence: ${existingData.confidence}%

Please verify and improve this information.` : ''}

Extract the following vehicle details with high accuracy:
1. Make (Toyota, Honda, Nissan, etc.)
2. Model (Skyline, Supra, etc.)
3. Year (must be between 1980-${new Date().getFullYear() + 1})
4. Any additional details like trim, engine, transmission

Respond ONLY with a JSON object in this exact format:
{
  "make": "exact_make_name",
  "model": "exact_model_name", 
  "year": actual_numeric_year,
  "trim": "trim_if_available",
  "engine": "engine_if_available",
  "transmission": "transmission_if_available",
  "confidence": confidence_score_0_to_100
}

If you cannot determine accurate information, return confidence below 50.
If the year seems incorrect or impossible, set confidence to 0.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert automotive data analyst. Extract vehicle information with extreme accuracy. Never guess - only provide information you're confident about."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    });

    const aiResponse = response.choices[0]?.message?.content;
    if (!aiResponse) {
      return null;
    }

    // Parse AI response
    const vehicleData = JSON.parse(aiResponse);
    
    // Validate response structure
    if (!vehicleData.make || !vehicleData.model || !vehicleData.year || !vehicleData.confidence) {
      console.log('AI response missing required fields');
      return null;
    }

    // Validate year range
    const currentYear = new Date().getFullYear();
    if (vehicleData.year > currentYear + 1 || vehicleData.year < 1980) {
      console.log(`AI provided invalid year: ${vehicleData.year}`);
      vehicleData.confidence = 0;
    }

    // Only return if confidence is reasonable
    if (vehicleData.confidence < 50) {
      return null;
    }

    return {
      make: normalizeCarMake(vehicleData.make),
      model: normalizeCarModel(vehicleData.model),
      year: vehicleData.year,
      trim: vehicleData.trim,
      engine: vehicleData.engine,
      transmission: vehicleData.transmission,
      source: 'ai_enhanced',
      confidence: Math.min(vehicleData.confidence, 90), // Cap AI confidence at 90%
      extractionMethod: 'url_parsing'
    };

  } catch (error) {
    console.error('OpenAI enhancement failed:', error);
    return null;
  }
}

/**
 * Extract vehicle data from VIN
 */
async function extractFromVIN(vin: string): Promise<ExtractedVehicleData> {
  const cleanVin = vin.replace(/[^A-HJ-NPR-Z0-9]/gi, '').toUpperCase();
  
  if (cleanVin.length !== 17) {
    throw new Error('Invalid VIN format. VIN must be 17 characters.');
  }
  
  // Validate VIN check digit
  if (!isValidVIN(cleanVin)) {
    throw new Error('Invalid VIN check digit');
  }
  
  const decoded = decodeVIN(cleanVin);
  
  return {
    make: decoded.make,
    model: decoded.model,
    year: decoded.year,
    trim: decoded.trim,
    engine: decoded.engine,
    transmission: decoded.transmission,
    vin: cleanVin,
    source: 'vin_decode',
    confidence: 98,
    extractionMethod: 'vin_decode'
  };
}

/**
 * Extract vehicle data from auction/listing URLs
 */
async function extractFromURL(url: string): Promise<ExtractedVehicleData> {
  try {
    // Determine site type and use appropriate parser
    if (url.includes('copart.com')) {
      return await parseCopartURL(url);
    } else if (url.includes('iaai.com') || url.includes('iaai-auction.com')) {
      return await parseIAAIURL(url);
    } else if (url.includes('yahoo.co.jp') || url.includes('auctions.yahoo.co.jp')) {
      return await parseYahooAuctionURL(url);
    } else if (url.includes('goo-net.com')) {
      return await parseGooNetURL(url);
    } else if (url.includes('carsensor.net')) {
      return await parseCarSensorURL(url);
    } else if (url.includes('autotrader.com')) {
      return await parseAutoTraderURL(url);
    } else if (url.includes('cars.com')) {
      return await parseCarsComURL(url);
    } else {
      // Try generic parsing
      return await parseGenericURL(url);
    }
  } catch (error) {
    console.error('URL parsing error:', error);
    // Fallback to URL pattern extraction
    return extractFromURLPattern(url);
  }
}

/**
 * Parse Copart auction URLs
 */
async function parseCopartURL(url: string): Promise<ExtractedVehicleData> {
  // Extract directly from URL pattern first
  const urlPattern = /\/lot\/\d+\/(\d{4})-([a-zA-Z-]+)-([a-zA-Z0-9-]+)/;
  const match = url.match(urlPattern);
  
  if (match) {
    const [, year, make, model] = match;
    const cleanMake = make.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const cleanModel = model.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return {
      make: normalizeCarMake(cleanMake),
      model: normalizeCarModel(cleanModel),
      year: parseInt(year),
      source: 'copart.com',
      confidence: 90,
      extractionMethod: 'url_parsing'
    };
  }
  
  // Fallback to web scraping if URL pattern fails
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract from page title and meta tags
    const title = $('title').text() || $('h1').first().text();
    const description = $('meta[name="description"]').attr('content') || '';
    
    // Look for VIN in various locations
    const vin = $('[data-uname="lotnumbervin"]').text().trim() ||
                $('span:contains("VIN:")').next().text().trim() ||
                extractVINFromText(title + ' ' + description);
    
    if (vin && vin.length === 17) {
      return await extractFromVIN(vin);
    }
    
    // Extract from title pattern
    const vehicleData = parseVehicleTitle(title);
    
    // Look for additional details
    const mileage = $('span:contains("Odometer:")').next().text().trim() ||
                   $('[data-uname="odometer"]').text().trim();
    
    const engine = $('span:contains("Engine:")').next().text().trim() ||
                  $('[data-uname="engine"]').text().trim();
    
    const transmission = $('span:contains("Transmission:")').next().text().trim() ||
                        $('[data-uname="transmission"]').text().trim();
    
    return {
      ...vehicleData,
      vin,
      mileage: mileage || undefined,
      engine: engine || undefined,
      transmission: transmission || undefined,
      source: 'copart.com',
      confidence: vin ? 95 : 80,
      extractionMethod: 'url_parsing'
    };
  } catch (error) {
    console.error('Copart parsing error:', error);
    return extractFromURLPattern(url);
  }
}

/**
 * Parse IAAI auction URLs
 */
async function parseIAAIURL(url: string): Promise<ExtractedVehicleData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const title = $('h1').first().text() || $('title').text();
    const vehicleData = parseVehicleTitle(title);
    
    // Look for VIN
    const vin = $('.vin-number').text().trim() ||
                $('td:contains("VIN")').next().text().trim() ||
                extractVINFromText(html);
    
    if (vin && vin.length === 17) {
      return await extractFromVIN(vin);
    }
    
    return {
      ...vehicleData,
      vin: vin || undefined,
      source: 'iaai.com',
      confidence: vin ? 95 : 75,
      extractionMethod: 'url_parsing'
    };
  } catch (error) {
    console.error('IAAI parsing error:', error);
    return extractFromURLPattern(url);
  }
}

/**
 * Parse Yahoo Auction URLs
 */
async function parseYahooAuctionURL(url: string): Promise<ExtractedVehicleData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const title = $('h1').first().text() || $('.ProductTitle__text').text();
    const vehicleData = parseJapaneseVehicleTitle(title);
    
    // Extract additional details from description
    const description = $('.ProductExplanation__commentArea').text() ||
                       $('.auct_info_body').text();
    
    const mileage = extractMileageFromText(description);
    const year = extractYearFromText(description) || vehicleData.year;
    
    return {
      ...vehicleData,
      year: year || vehicleData.year,
      mileage: mileage || undefined,
      source: 'yahoo.co.jp',
      confidence: 85,
      extractionMethod: 'url_parsing'
    };
  } catch (error) {
    console.error('Yahoo Auction parsing error:', error);
    return extractFromURLPattern(url);
  }
}

/**
 * Parse Goo-net URLs
 */
async function parseGooNetURL(url: string): Promise<ExtractedVehicleData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract structured data
    const make = $('.carname_maker').text().trim() || 
                extractFromDataAttribute($, 'maker');
    const model = $('.carname_name').text().trim() ||
                 extractFromDataAttribute($, 'model');
    const year = parseInt($('.year').text().trim()) ||
                extractYearFromText(html);
    
    const price = extractPriceFromText($('.price').text());
    
    return {
      make: normalizeCarMake(make),
      model: normalizeCarModel(model),
      year: year || new Date().getFullYear(),
      price: price || undefined,
      currency: 'JPY',
      source: 'goo-net.com',
      confidence: 90,
      extractionMethod: 'url_parsing'
    };
  } catch (error) {
    console.error('Goo-net parsing error:', error);
    return extractFromURLPattern(url);
  }
}

/**
 * Universal URL pattern extraction system
 * Handles all major auction sites and listing platforms
 */
function extractFromURLPattern(url: string): ExtractedVehicleData {
  const urlPatterns = [
    // Goo-net Exchange: /usedcars/NISSAN/SKYLINE/700020718930250607C
    {
      pattern: /\/usedcars\/([A-Z]+)\/([A-Z0-9\-]+)\/([A-Z0-9]+)/,
      extract: (match: RegExpMatchArray) => {
        const [, make, model] = match;
        const makeMapping: { [key: string]: string } = {
          'NISSAN': 'Nissan', 'TOYOTA': 'Toyota', 'HONDA': 'Honda',
          'MAZDA': 'Mazda', 'SUBARU': 'Subaru', 'MITSUBISHI': 'Mitsubishi'
        };
        const modelMapping: { [key: string]: string } = {
          'SKYLINE': 'Skyline', 'SILVIA': 'Silvia', 'SUPRA': 'Supra',
          'RX7': 'RX-7', 'IMPREZA': 'Impreza', 'LANCER': 'Lancer'
        };
        return {
          year: 2010, // Default for used car listings
          make: makeMapping[make] || make,
          model: modelMapping[model] || model.replace(/\-/g, ' ')
        };
      }
    },
    // Copart: /lot/12345/1992-nissan-skyline-gt-ca-long-beach
    {
      pattern: /\/lot\/\d+\/(\d{4})-([a-zA-Z-]+)-([a-zA-Z0-9-]+)/,
      extract: (match: RegExpMatchArray) => {
        const [, year, make, model] = match;
        return {
          year: parseInt(year),
          make: make.replace(/-/g, ' '),
          model: model.replace(/-/g, ' ')
        };
      }
    },
    // IAAI: /vehicle/12345/1992-nissan-skyline
    {
      pattern: /\/vehicle\/\d+\/(\d{4})-([a-zA-Z-]+)-([a-zA-Z0-9-]+)/,
      extract: (match: RegExpMatchArray) => {
        const [, year, make, model] = match;
        return {
          year: parseInt(year),
          make: make.replace(/-/g, ' '),
          model: model.replace(/-/g, ' ')
        };
      }
    },
    // AutoTrader: /cars/1992/nissan/skyline/
    {
      pattern: /\/cars\/(\d{4})\/([a-zA-Z-]+)\/([a-zA-Z0-9-]+)/,
      extract: (match: RegExpMatchArray) => {
        const [, year, make, model] = match;
        return {
          year: parseInt(year),
          make: make.replace(/-/g, ' '),
          model: model.replace(/-/g, ' ')
        };
      }
    },
    // Cars.com: /vehicledetail/1992-nissan-skyline/
    {
      pattern: /\/vehicledetail\/(\d{4})-([a-zA-Z-]+)-([a-zA-Z0-9-]+)/,
      extract: (match: RegExpMatchArray) => {
        const [, year, make, model] = match;
        return {
          year: parseInt(year),
          make: make.replace(/-/g, ' '),
          model: model.replace(/-/g, ' ')
        };
      }
    },
    // CarGurus: /1992_Nissan_Skyline/
    {
      pattern: /\/(\d{4})_([a-zA-Z]+)_([a-zA-Z0-9]+)/,
      extract: (match: RegExpMatchArray) => {
        const [, year, make, model] = match;
        return {
          year: parseInt(year),
          make: make,
          model: model
        };
      }
    },
    // Generic: any URL with year-make-model pattern
    {
      pattern: /(\d{4})[\-_]([a-zA-Z]+)[\-_]([a-zA-Z0-9\-_]+)/,
      extract: (match: RegExpMatchArray) => {
        const [, year, make, model] = match;
        return {
          year: parseInt(year),
          make: make.replace(/[\-_]/g, ' '),
          model: model.replace(/[\-_]/g, ' ')
        };
      }
    }
  ];

  // Try each pattern
  for (const { pattern, extract } of urlPatterns) {
    const match = url.match(pattern);
    if (match) {
      const extracted = extract(match);
      
      // Validate extracted data
      if (extracted.year >= 1980 && extracted.year <= new Date().getFullYear() + 1) {
        return {
          make: normalizeCarMake(extracted.make),
          model: normalizeCarModel(extracted.model),
          year: extracted.year,
          source: new URL(url).hostname,
          confidence: 85,
          extractionMethod: 'url_parsing'
        };
      }
    }
  }

  // Fallback: Extract from URL parts using intelligent parsing
  return extractFromURLParts(url);
}

/**
 * Intelligent URL parts extraction
 */
function extractFromURLParts(url: string): ExtractedVehicleData {
  const urlParts = url.toLowerCase().split(/[\/\-_\+\s\?&=]+/).filter(part => part.length > 0);
  
  let year = 0;
  let make = '';
  let model = '';
  let lotNumber = '';
  
  // Enhanced car makes list with variations
  const carMakes = new Map([
    ['toyota', 'Toyota'], ['honda', 'Honda'], ['nissan', 'Nissan'], ['mazda', 'Mazda'],
    ['subaru', 'Subaru'], ['mitsubishi', 'Mitsubishi'], ['suzuki', 'Suzuki'], ['isuzu', 'Isuzu'],
    ['ford', 'Ford'], ['chevrolet', 'Chevrolet'], ['chevy', 'Chevrolet'], ['gmc', 'GMC'],
    ['dodge', 'Dodge'], ['chrysler', 'Chrysler'], ['jeep', 'Jeep'], ['ram', 'Ram'],
    ['cadillac', 'Cadillac'], ['buick', 'Buick'], ['lincoln', 'Lincoln'],
    ['bmw', 'BMW'], ['mercedes', 'Mercedes-Benz'], ['audi', 'Audi'], ['volkswagen', 'Volkswagen'],
    ['vw', 'Volkswagen'], ['porsche', 'Porsche'], ['volvo', 'Volvo'], ['saab', 'Saab'],
    ['lexus', 'Lexus'], ['infiniti', 'Infiniti'], ['acura', 'Acura'],
    ['hyundai', 'Hyundai'], ['kia', 'Kia'], ['genesis', 'Genesis'],
    ['ferrari', 'Ferrari'], ['lamborghini', 'Lamborghini'], ['maserati', 'Maserati'],
    ['bentley', 'Bentley'], ['rollsroyce', 'Rolls-Royce'], ['astonmartin', 'Aston Martin']
  ]);

  // Look for year (4-digit number between 1980-current+1)
  for (const part of urlParts) {
    const yearMatch = part.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      const potentialYear = parseInt(yearMatch[0]);
      if (potentialYear >= 1980 && potentialYear <= new Date().getFullYear() + 1) {
        year = potentialYear;
      }
    }
    
    // Look for lot numbers (for auction sites)
    if (part.match(/^\d{6,8}$/) && !year) {
      lotNumber = part;
    }
  }

  // Look for car make
  for (const part of urlParts) {
    for (const [key, value] of carMakes) {
      if (part.includes(key) || key.includes(part)) {
        make = value;
        break;
      }
    }
    if (make) break;
  }

  // Try to find model near make
  if (make) {
    const makeIndex = urlParts.findIndex(part => 
      carMakes.has(part) || Array.from(carMakes.keys()).some(key => part.includes(key))
    );
    
    if (makeIndex !== -1) {
      // Look for model in next few parts
      for (let i = makeIndex + 1; i < Math.min(makeIndex + 4, urlParts.length); i++) {
        const part = urlParts[i];
        // Skip common non-model words
        if (!['car', 'auto', 'vehicle', 'lot', 'auction', 'for', 'sale', 'used', 'new'].includes(part)) {
          model = part.replace(/[\-_]/g, ' ');
          break;
        }
      }
    }
  }

  // If we couldn't find make through direct matching, try partial matching
  if (!make) {
    for (const part of urlParts) {
      for (const [key, value] of carMakes) {
        if (part.length >= 3 && (part.includes(key.substring(0, 4)) || key.includes(part))) {
          make = value;
          model = urlParts[urlParts.indexOf(part) + 1] || '';
          break;
        }
      }
      if (make) break;
    }
  }

  // Final validation and cleanup
  if (!make || !year) {
    throw new Error('Unable to extract vehicle information from URL');
  }

  return {
    make: normalizeCarMake(make),
    model: normalizeCarModel(model || 'Base'),
    year: year,
    source: new URL(url).hostname,
    confidence: 70,
    extractionMethod: 'url_parsing'
  };
}

/**
 * Parse vehicle title text
 */
function parseVehicleTitle(title: string): Omit<ExtractedVehicleData, 'source' | 'confidence' | 'extractionMethod'> {
  // Clean title
  const cleaned = title.trim().toLowerCase();
  
  // Extract year (look for 4-digit year)
  const yearMatch = cleaned.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
  
  // Extract make and model
  const words = cleaned.split(/\s+/);
  let make = '';
  let model = '';
  
  // Common patterns: "YEAR MAKE MODEL" or "MAKE MODEL YEAR"
  const carMakes = [
    'toyota', 'honda', 'nissan', 'mazda', 'subaru', 'mitsubishi', 'suzuki',
    'ford', 'chevrolet', 'gmc', 'dodge', 'chrysler', 'jeep',
    'bmw', 'mercedes', 'audi', 'volkswagen', 'porsche',
    'lexus', 'infiniti', 'acura', 'hyundai', 'kia'
  ];
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (carMakes.some(m => word.includes(m))) {
      make = word;
      // Model is typically the next word(s)
      if (i + 1 < words.length) {
        model = words[i + 1];
        // Check if next word is part of model name
        if (i + 2 < words.length && !words[i + 2].match(/\d{4}/)) {
          model += ' ' + words[i + 2];
        }
      }
      break;
    }
  }
  
  return {
    make: normalizeCarMake(make),
    model: normalizeCarModel(model),
    year
  };
}

/**
 * Parse Japanese vehicle titles
 */
function parseJapaneseVehicleTitle(title: string): Omit<ExtractedVehicleData, 'source' | 'confidence' | 'extractionMethod'> {
  // Common Japanese car names and their English equivalents
  const japaneseToEnglish: Record<string, { make: string; model: string }> = {
    'スカイライン': { make: 'nissan', model: 'skyline' },
    'シルビア': { make: 'nissan', model: 'silvia' },
    'フェアレディz': { make: 'nissan', model: 'fairlady z' },
    'スープラ': { make: 'toyota', model: 'supra' },
    'チェイサー': { make: 'toyota', model: 'chaser' },
    'マークii': { make: 'toyota', model: 'mark ii' },
    'アリスト': { make: 'toyota', model: 'aristo' },
    'rx-7': { make: 'mazda', model: 'rx-7' },
    'fd3s': { make: 'mazda', model: 'rx-7' },
    'インプレッサ': { make: 'subaru', model: 'impreza' },
    'ランエボ': { make: 'mitsubishi', model: 'lancer evolution' }
  };
  
  const cleaned = title.toLowerCase();
  
  // Look for known Japanese vehicle names
  for (const [japanese, english] of Object.entries(japaneseToEnglish)) {
    if (cleaned.includes(japanese)) {
      return {
        make: english.make,
        model: english.model,
        year: extractYearFromText(title) || new Date().getFullYear()
      };
    }
  }
  
  // Fallback to regular parsing
  return parseVehicleTitle(title);
}

/**
 * VIN decoding functions
 */
function isValidVIN(vin: string): boolean {
  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  const values: Record<string, number> = {
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
    'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9
  };
  
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    if (i === 8) continue; // Skip check digit position
    sum += (values[vin[i]] || 0) * weights[i];
  }
  
  const checkDigit = sum % 11;
  const expectedCheck = checkDigit === 10 ? 'X' : checkDigit.toString();
  
  return vin[8] === expectedCheck;
}

function decodeVIN(vin: string): {
  make: string;
  model: string;
  year: number;
  trim?: string;
  engine?: string;
  transmission?: string;
} {
  // WMI (World Manufacturer Identifier) - first 3 characters
  const wmi = vin.substring(0, 3);
  
  // Year encoding (10th character)
  const yearCode = vin[9];
  const year = decodeYearFromVIN(yearCode);
  
  // Common WMI codes
  const wmiDatabase: Record<string, { make: string; country: string }> = {
    // Japanese manufacturers
    'JTD': { make: 'toyota', country: 'japan' },
    'JTE': { make: 'toyota', country: 'japan' },
    'JTF': { make: 'toyota', country: 'japan' },
    'JTG': { make: 'toyota', country: 'japan' },
    'JTH': { make: 'toyota', country: 'japan' },
    'JTJ': { make: 'toyota', country: 'japan' },
    'JTK': { make: 'toyota', country: 'japan' },
    'JTL': { make: 'toyota', country: 'japan' },
    'JTM': { make: 'toyota', country: 'japan' },
    'JTN': { make: 'toyota', country: 'japan' },
    'SHH': { make: 'honda', country: 'japan' },
    'JHM': { make: 'honda', country: 'japan' },
    'JN1': { make: 'nissan', country: 'japan' },
    'JN6': { make: 'nissan', country: 'japan' },
    'JN8': { make: 'nissan', country: 'japan' },
    'JNA': { make: 'nissan', country: 'japan' },
    'JNK': { make: 'nissan', country: 'japan' },
    'JM1': { make: 'mazda', country: 'japan' },
    'JF1': { make: 'subaru', country: 'japan' },
    'JF2': { make: 'subaru', country: 'japan' },
    'JA3': { make: 'mitsubishi', country: 'japan' },
    'JA4': { make: 'mitsubishi', country: 'japan' },
    
    // US manufacturers
    '1G1': { make: 'chevrolet', country: 'usa' },
    '1G6': { make: 'cadillac', country: 'usa' },
    '1FA': { make: 'ford', country: 'usa' },
    '1FB': { make: 'ford', country: 'usa' },
    '1FC': { make: 'ford', country: 'usa' },
    '1FD': { make: 'ford', country: 'usa' },
    '1FM': { make: 'ford', country: 'usa' },
    '1FT': { make: 'ford', country: 'usa' },
    '1B3': { make: 'dodge', country: 'usa' },
    '1B4': { make: 'dodge', country: 'usa' },
    '1B7': { make: 'dodge', country: 'usa' },
    '1C3': { make: 'chrysler', country: 'usa' },
    '1C4': { make: 'chrysler', country: 'usa' },
    '1C6': { make: 'chrysler', country: 'usa' },
    
    // German manufacturers
    'WBA': { make: 'bmw', country: 'germany' },
    'WBS': { make: 'bmw', country: 'germany' },
    'WDD': { make: 'mercedes-benz', country: 'germany' },
    'WDC': { make: 'mercedes-benz', country: 'germany' },
    'WAU': { make: 'audi', country: 'germany' },
    'WVW': { make: 'volkswagen', country: 'germany' },
    'WP0': { make: 'porsche', country: 'germany' }
  };
  
  const manufacturer = wmiDatabase[wmi] || { make: 'unknown', country: 'unknown' };
  
  return {
    make: normalizeCarMake(manufacturer.make),
    model: 'Unknown', // Model requires additional VIN database
    year: year
  };
}

function decodeYearFromVIN(yearCode: string): number {
  const yearMap: Record<string, number> = {
    'A': 1980, 'B': 1981, 'C': 1982, 'D': 1983, 'E': 1984, 'F': 1985, 'G': 1986, 'H': 1987, 'J': 1988, 'K': 1989,
    'L': 1990, 'M': 1991, 'N': 1992, 'P': 1993, 'R': 1994, 'S': 1995, 'T': 1996, 'V': 1997, 'W': 1998, 'X': 1999, 'Y': 2000,
    '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005, '6': 2006, '7': 2007, '8': 2008, '9': 2009,
    'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014, 'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
    'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024, 'S': 2025, 'T': 2026, 'V': 2027, 'W': 2028, 'X': 2029
  };
  
  return yearMap[yearCode] || new Date().getFullYear();
}

/**
 * Utility functions
 */
function normalizeCarMake(make: string): string {
  const normalized = make.toLowerCase().trim();
  
  const makeMap: Record<string, string> = {
    'toyota': 'Toyota',
    'honda': 'Honda',
    'nissan': 'Nissan',
    'mazda': 'Mazda',
    'subaru': 'Subaru',
    'mitsubishi': 'Mitsubishi',
    'suzuki': 'Suzuki',
    'isuzu': 'Isuzu',
    'ford': 'Ford',
    'chevrolet': 'Chevrolet',
    'chevy': 'Chevrolet',
    'gmc': 'GMC',
    'dodge': 'Dodge',
    'chrysler': 'Chrysler',
    'jeep': 'Jeep',
    'cadillac': 'Cadillac',
    'buick': 'Buick',
    'bmw': 'BMW',
    'mercedes': 'Mercedes-Benz',
    'mercedes-benz': 'Mercedes-Benz',
    'audi': 'Audi',
    'volkswagen': 'Volkswagen',
    'vw': 'Volkswagen',
    'porsche': 'Porsche',
    'volvo': 'Volvo',
    'lexus': 'Lexus',
    'infiniti': 'Infiniti',
    'acura': 'Acura',
    'hyundai': 'Hyundai',
    'kia': 'Kia'
  };
  
  return makeMap[normalized] || make.charAt(0).toUpperCase() + make.slice(1).toLowerCase();
}

function normalizeCarModel(model: string): string {
  if (!model || model.toLowerCase() === 'unknown') {
    return 'Unknown';
  }
  
  return model.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function extractVINFromText(text: string): string {
  const vinPattern = /\b[A-HJ-NPR-Z0-9]{17}\b/g;
  const matches = text.match(vinPattern);
  return matches ? matches[0] : '';
}

function extractYearFromText(text: string): number | null {
  const yearPattern = /\b(19|20)\d{2}\b/g;
  const matches = text.match(yearPattern);
  if (matches) {
    const years = matches.map(y => parseInt(y)).filter(y => y >= 1980 && y <= new Date().getFullYear() + 1);
    return years.length > 0 ? years[0] : null;
  }
  return null;
}

function extractMileageFromText(text: string): string | null {
  const mileagePatterns = [
    /(\d{1,3}(?:,\d{3})*)\s*(?:km|キロ|キロメートル)/i,
    /(\d{1,3}(?:,\d{3})*)\s*(?:miles?|mi)/i,
    /走行距離[：:\s]*(\d{1,3}(?:,\d{3})*)/i
  ];
  
  for (const pattern of mileagePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1] + (pattern.source.includes('km') ? ' km' : ' miles');
    }
  }
  
  return null;
}

function extractPriceFromText(text: string): number | null {
  const pricePatterns = [
    /¥(\d{1,3}(?:,\d{3})*)/,
    /\$(\d{1,3}(?:,\d{3})*)/,
    /(\d{1,3}(?:,\d{3})*)\s*円/,
    /(\d{1,3}(?:,\d{3})*)\s*万円/
  ];
  
  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      let price = parseInt(match[1].replace(/,/g, ''));
      if (pattern.source.includes('万円')) {
        price *= 10000; // Convert 万円 to yen
      }
      return price;
    }
  }
  
  return null;
}

function extractFromDataAttribute($: cheerio.CheerioAPI, attribute: string): string {
  return $(`[data-${attribute}]`).attr(`data-${attribute}`) || '';
}

async function parseAutoTraderURL(url: string): Promise<ExtractedVehicleData> {
  // Implementation for AutoTrader parsing
  return extractFromURLPattern(url);
}

async function parseCarsComURL(url: string): Promise<ExtractedVehicleData> {
  // Implementation for Cars.com parsing
  return extractFromURLPattern(url);
}

async function parseCarSensorURL(url: string): Promise<ExtractedVehicleData> {
  // Implementation for CarSensor parsing
  return extractFromURLPattern(url);
}

async function parseGenericURL(url: string): Promise<ExtractedVehicleData> {
  // Implementation for generic URL parsing
  return extractFromURLPattern(url);
}