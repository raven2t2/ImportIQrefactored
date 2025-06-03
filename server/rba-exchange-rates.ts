// RBA Exchange Rate Service using publicly available data
// Scrapes official RBA exchange rate data from their public CSV files

import https from 'https';
import { parse } from 'csv-parse/sync';

interface RBAExchangeRate {
  date: string;
  audJpy: number;
  audUsd: number;
  source: string;
  lastUpdated: string;
}

// RBA publishes daily exchange rates in CSV format at this URL
const RBA_EXCHANGE_RATE_URL = 'https://www.rba.gov.au/statistics/tables/csv/f11-1.csv';

/**
 * Fetch current exchange rates from RBA's official public data
 * Uses the Reserve Bank of Australia's publicly available CSV files
 */
export async function fetchRBAExchangeRates(): Promise<RBAExchangeRate | null> {
  try {
    const csvData = await fetchCSVData(RBA_EXCHANGE_RATE_URL);
    
    if (!csvData) {
      console.log('RBA CSV data not available');
      return null;
    }

    // Parse CSV data to extract latest AUD/JPY and AUD/USD rates
    const rates = parseRBACSV(csvData);
    
    if (rates) {
      return {
        date: rates.date,
        audJpy: rates.audJpy,
        audUsd: rates.audUsd,
        source: "Reserve Bank of Australia - Official Data",
        lastUpdated: new Date().toISOString()
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching RBA exchange rates:', error);
    return null;
  }
}

/**
 * Fetch CSV data from RBA website
 */
async function fetchCSVData(url: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        console.log(`HTTP ${response.statusCode}: Unable to access RBA data`);
        resolve(null);
        return;
      }

      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        resolve(data);
      });
    }).on('error', (error) => {
      console.error('Network error accessing RBA data:', error);
      resolve(null);
    });
  });
}

/**
 * Parse RBA CSV format to extract exchange rates
 * RBA CSV format typically has headers and date/rate columns
 */
function parseRBACSV(csvData: string): { date: string; audJpy: number; audUsd: number } | null {
  try {
    // Split into lines and find data rows (skip metadata headers)
    const lines = csvData.split('\n');
    let dataStartIndex = -1;
    
    // Find where the actual data starts (after metadata)
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('Date') && (lines[i].includes('JPY') || lines[i].includes('USD'))) {
        dataStartIndex = i;
        break;
      }
    }

    if (dataStartIndex === -1) {
      console.log('Unable to locate data headers in RBA CSV');
      return null;
    }

    // Parse the CSV data starting from the header row
    const csvContent = lines.slice(dataStartIndex).join('\n');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    if (records.length === 0) {
      console.log('No exchange rate data found in RBA CSV');
      return null;
    }

    // Get the most recent record (last row)
    const latestRecord = records[records.length - 1];
    
    // Extract JPY and USD rates (column names may vary)
    let audJpy = null;
    let audUsd = null;
    
    // Look for JPY and USD columns (RBA uses various column naming conventions)
    for (const [key, value] of Object.entries(latestRecord)) {
      const keyLower = key.toLowerCase();
      if (keyLower.includes('jpy') || keyLower.includes('japan')) {
        audJpy = parseFloat(value as string);
      }
      if (keyLower.includes('usd') || keyLower.includes('united states')) {
        audUsd = parseFloat(value as string);
      }
    }

    if (audJpy && audUsd && latestRecord.Date) {
      return {
        date: latestRecord.Date,
        audJpy: audJpy,
        audUsd: audUsd
      };
    }

    console.log('Required exchange rate columns not found in RBA data');
    return null;

  } catch (error) {
    console.error('Error parsing RBA CSV data:', error);
    return null;
  }
}

/**
 * Get cached or fresh exchange rate data
 * Implements simple caching to avoid excessive requests to RBA
 */
let cachedRates: RBAExchangeRate | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function getCurrentExchangeRates(): Promise<RBAExchangeRate | null> {
  const now = Date.now();
  
  // Return cached data if it's still fresh
  if (cachedRates && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedRates;
  }

  // Fetch fresh data from RBA
  const freshRates = await fetchRBAExchangeRates();
  
  if (freshRates) {
    cachedRates = freshRates;
    lastFetchTime = now;
    return freshRates;
  }

  // Return cached data if fresh fetch failed
  return cachedRates;
}