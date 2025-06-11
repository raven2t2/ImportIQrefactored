// Session management utility for persistent vehicle journeys
class SessionManager {
  private static readonly SESSION_KEY = 'importiq_session_token';
  private static readonly VEHICLE_CACHE_KEY = 'importiq_vehicle_cache';
  
  // Get stored session token
  static getSessionToken(): string | null {
    try {
      return localStorage.getItem(this.SESSION_KEY);
    } catch {
      return null;
    }
  }
  
  // Generate new session token
  static generateSessionToken(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const token = `iq_${timestamp}_${random}`;
    this.setSessionToken(token);
    return token;
  }

  // Store session token
  static setSessionToken(token: string): void {
    try {
      localStorage.setItem(this.SESSION_KEY, token);
    } catch (error) {
      console.error('Failed to store session token:', error);
    }
  }
  
  // Clear session
  static clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem(this.VEHICLE_CACHE_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }
  
  // Cache vehicle data temporarily for form persistence
  static cacheVehicleData(vehicleData: any): void {
    try {
      localStorage.setItem(this.VEHICLE_CACHE_KEY, JSON.stringify({
        data: vehicleData,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to cache vehicle data:', error);
    }
  }
  
  // Get cached vehicle data
  static getCachedVehicleData(): any | null {
    try {
      const cached = localStorage.getItem(this.VEHICLE_CACHE_KEY);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      
      // Cache expires after 1 hour
      if (Date.now() - timestamp > 60 * 60 * 1000) {
        localStorage.removeItem(this.VEHICLE_CACHE_KEY);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to get cached vehicle data:', error);
      return null;
    }
  }
  
  // Fetch session from server
  static async fetchSession(sessionToken: string): Promise<any> {
    try {
      const response = await fetch(`/api/session/${sessionToken}`);
      if (!response.ok) {
        throw new Error('Session not found');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch session:', error);
      return null;
    }
  }
  
  // Reconstruct session from URL parameters
  static async reconstructSession(params: {
    make?: string;
    model?: string;
    chassis?: string;
    year?: string;
    destination?: string;
  }): Promise<{ sessionToken: string; session: any } | null> {
    try {
      const response = await fetch('/api/session/reconstruct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        return null;
      }
      
      const result = await response.json();
      
      // Store the reconstructed session token
      if (result.sessionToken) {
        this.setSessionToken(result.sessionToken);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to reconstruct session:', error);
      return null;
    }
  }
  
  // Parse URL parameters for vehicle data
  static parseUrlParams(): {
    make?: string;
    model?: string;
    chassis?: string;
    year?: string;
    destination?: string;
    query?: string;
  } {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Handle generic search query parameter
    const query = urlParams.get('q');
    let parsedVehicle = {};
    
    if (query) {
      // Try to parse the query for vehicle information
      parsedVehicle = this.parseVehicleQuery(query);
    }
    
    return {
      make: urlParams.get('make') || parsedVehicle.make || undefined,
      model: urlParams.get('model') || parsedVehicle.model || undefined,
      chassis: urlParams.get('chassis') || undefined,
      year: urlParams.get('year') || parsedVehicle.year || undefined,
      destination: urlParams.get('destination') || undefined,
      query: query || undefined
    };
  }
  
  // Parse a search query to extract vehicle information
  static parseVehicleQuery(query: string): {
    make?: string;
    model?: string;
    year?: string;
  } {
    const cleaned = query.trim().toLowerCase();
    
    // Common vehicle make patterns
    const makePatterns = {
      'toyota': ['toyota', 'toyata'],
      'nissan': ['nissan', 'nisan'],
      'honda': ['honda'],
      'mazda': ['mazda'],
      'subaru': ['subaru'],
      'mitsubishi': ['mitsubishi', 'mitsu'],
      'bmw': ['bmw'],
      'mercedes': ['mercedes', 'benz', 'mercedes-benz'],
      'audi': ['audi'],
      'volkswagen': ['volkswagen', 'vw'],
      'porsche': ['porsche'],
      'ferrari': ['ferrari'],
      'lamborghini': ['lamborghini', 'lambo'],
      'mclaren': ['mclaren'],
      'ford': ['ford'],
      'chevrolet': ['chevrolet', 'chevy'],
      'dodge': ['dodge'],
      'chrysler': ['chrysler']
    };
    
    // Common model patterns
    const modelPatterns = {
      'supra': ['supra'],
      'skyline': ['skyline', 'gtr', 'gt-r'],
      'silvia': ['silvia', 's13', 's14', 's15'],
      'rx7': ['rx7', 'rx-7'],
      'rx8': ['rx8', 'rx-8'],
      'lancer': ['lancer', 'evo', 'evolution'],
      'impreza': ['impreza', 'wrx', 'sti'],
      'm3': ['m3'],
      'm5': ['m5'],
      'golf': ['golf'],
      '911': ['911'],
      'camaro': ['camaro'],
      'mustang': ['mustang'],
      'corvette': ['corvette']
    };
    
    let detectedMake = '';
    let detectedModel = '';
    let detectedYear = '';
    
    // Extract year (4 digits)
    const yearMatch = cleaned.match(/\b(19[0-9]{2}|20[0-9]{2})\b/);
    if (yearMatch) {
      detectedYear = yearMatch[1];
    }
    
    // Detect make
    for (const [make, patterns] of Object.entries(makePatterns)) {
      if (patterns.some(pattern => cleaned.includes(pattern))) {
        detectedMake = make;
        break;
      }
    }
    
    // Detect model
    for (const [model, patterns] of Object.entries(modelPatterns)) {
      if (patterns.some(pattern => cleaned.includes(pattern))) {
        detectedModel = model;
        break;
      }
    }
    
    // If no specific make detected but model is found, try to infer make
    if (!detectedMake && detectedModel) {
      const modelToMake = {
        'supra': 'toyota',
        'skyline': 'nissan',
        'silvia': 'nissan',
        'rx7': 'mazda',
        'rx8': 'mazda',
        'lancer': 'mitsubishi',
        'impreza': 'subaru',
        'm3': 'bmw',
        'm5': 'bmw',
        'golf': 'volkswagen',
        '911': 'porsche',
        'camaro': 'chevrolet',
        'mustang': 'ford',
        'corvette': 'chevrolet'
      };
      detectedMake = modelToMake[detectedModel] || '';
    }
    
    return {
      make: detectedMake || undefined,
      model: detectedModel || undefined,
      year: detectedYear || undefined
    };
  }
  
  // Update URL with vehicle parameters for sharing
  static updateUrlParams(vehicle: any, destination?: string): void {
    const url = new URL(window.location.href);
    
    if (vehicle.make) url.searchParams.set('make', vehicle.make);
    if (vehicle.model) url.searchParams.set('model', vehicle.model);
    if (vehicle.chassis) url.searchParams.set('chassis', vehicle.chassis);
    if (vehicle.year) url.searchParams.set('year', vehicle.year.toString());
    if (destination) url.searchParams.set('destination', destination);
    
    // Update URL without triggering page reload
    window.history.replaceState({}, '', url.toString());
  }
  
  // Get recent queries for user
  static async getRecentQueries(sessionToken?: string): Promise<any[]> {
    const token = sessionToken || this.getSessionToken();
    if (!token) return [];
    
    try {
      const response = await fetch(`/api/session/${token}/recent-queries`);
      if (!response.ok) return [];
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get recent queries:', error);
      return [];
    }
  }
}

export default SessionManager;