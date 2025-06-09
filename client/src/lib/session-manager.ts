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
  } {
    const urlParams = new URLSearchParams(window.location.search);
    
    return {
      make: urlParams.get('make') || undefined,
      model: urlParams.get('model') || undefined,
      chassis: urlParams.get('chassis') || undefined,
      year: urlParams.get('year') || undefined,
      destination: urlParams.get('destination') || undefined
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