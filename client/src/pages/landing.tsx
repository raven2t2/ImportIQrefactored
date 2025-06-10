import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Search, Target, X, Loader2, RotateCcw, Globe } from 'lucide-react';

export default function Landing() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [lastLookup, setLastLookup] = useState<any>(null);
  const [locationDetected, setLocationDetected] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const placeholders = [
    "Toyota Supra RZ",
    "WDBBA48D3KA093827",
    "https://yahoo.co.jp/auction/car",
    "Skyline R34 GT-R"
  ];

  const countries = [
    { code: 'australia', name: 'Australia', flag: '🇦🇺' },
    { code: 'usa', name: 'United States', flag: '🇺🇸' },
    { code: 'canada', name: 'Canada', flag: '🇨🇦' },
    { code: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'japan', name: 'Japan', flag: '🇯🇵' },
    { code: 'germany', name: 'Germany', flag: '🇩🇪' },
    { code: 'france', name: 'France', flag: '🇫🇷' },
    { code: 'netherlands', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'belgium', name: 'Belgium', flag: '🇧🇪' },
    { code: 'norway', name: 'Norway', flag: '🇳🇴' },
    { code: 'sweden', name: 'Sweden', flag: '🇸🇪' },
    { code: 'finland', name: 'Finland', flag: '🇫🇮' },
    { code: 'newzealand', name: 'New Zealand', flag: '🇳🇿' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-detect location on component mount
  useEffect(() => {
    const detectLocation = async () => {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        setGeoError('Location detection not supported');
        return;
      }

      try {
        // Get user's position
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: false
          });
        });

        // Use reverse geocoding to get country from coordinates
        const { latitude, longitude } = position.coords;
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        
        if (response.ok) {
          const data = await response.json();
          const detectedCountry = mapCountryToCode(data.countryName);
          
          if (detectedCountry) {
            setSelectedCountry(detectedCountry);
            setLocationDetected(true);
            
            // Save to localStorage for future visits
            localStorage.setItem('importiq_detected_country', detectedCountry);
          }
        }
      } catch (error) {
        // Try to use saved country from localStorage
        const savedCountry = localStorage.getItem('importiq_detected_country');
        if (savedCountry) {
          setSelectedCountry(savedCountry);
          setLocationDetected(true);
        } else {
          setGeoError('Location access denied - please select your country manually');
        }
      }
    };

    detectLocation();
  }, []);

  // Map country names to our country codes
  const mapCountryToCode = (countryName: string): string | null => {
    const mapping: Record<string, string> = {
      'Australia': 'australia',
      'United States': 'usa',
      'United States of America': 'usa',
      'Canada': 'canada',
      'United Kingdom': 'uk',
      'Great Britain': 'uk',
      'Japan': 'japan',
      'Germany': 'germany',
      'France': 'france',
      'Netherlands': 'netherlands',
      'Belgium': 'belgium',
      'Norway': 'norway',
      'Sweden': 'sweden',
      'Finland': 'finland',
      'New Zealand': 'newzealand'
    };
    
    return mapping[countryName] || null;
  };

  // Check for previous lookups on component mount
  useEffect(() => {
    const lastSearch = localStorage.getItem('importiq_last_search');
    if (lastSearch) {
      try {
        const parsedSearch = JSON.parse(lastSearch);
        setLastLookup(parsedSearch);
      } catch (e) {
        // Invalid data, ignore
      }
    }
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    if (!selectedCountry) {
      setError('Please select your destination country');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/smart-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: query.trim(),
          destination: selectedCountry
        })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResult(data);
      
      // Save successful lookup to localStorage for smart behavior
      if (data && data.vehicle) {
        const lookupData = {
          query: query.trim(),
          vehicle: data.vehicle,
          destination: selectedCountry,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('importiq_last_search', JSON.stringify(lookupData));
        setLastLookup(lookupData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-black to-black"></div>
        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-32 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white to-amber-400 bg-clip-text text-transparent">
            ImportIQ
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            The world's smartest vehicle import intelligence platform. 
            Paste any car listing, VIN, or description to check instant eligibility, compliance, and real costs.
          </p>

          {/* Smart Search Input - Primary Focus */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholders[placeholderIndex]}
                className="w-full h-20 px-6 pr-32 text-xl bg-gray-900/50 border-gray-700 rounded-xl placeholder:text-gray-500 focus:border-amber-400 transition-all shadow-2xl"
              />
              <Button
                onClick={handleSearch}
                disabled={isLoading || !query.trim() || !selectedCountry}
                className="absolute right-2 top-2 h-16 px-8 bg-amber-400 hover:bg-amber-500 text-black font-bold text-lg disabled:opacity-50 rounded-lg"
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <Search className="h-6 w-6 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Country/Location Selector - Secondary */}
          <div className="max-w-xl mx-auto mb-4">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-full h-12 px-4 bg-gray-900/30 border-gray-700/50 rounded-lg text-gray-300 text-sm">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-amber-400" />
                    <SelectValue placeholder="🌍 Select destination country" />
                  </div>
                  {locationDetected && (
                    <div className="flex items-center gap-1 text-xs text-green-400">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      Auto-detected
                    </div>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code} className="text-gray-300 hover:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {geoError && !selectedCountry && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <X className="h-3 w-3" />
                {geoError}
              </p>
            )}
          </div>

          {/* Previous Search Indicator - Tertiary */}
          {lastLookup && (
            <div className="max-w-xl mx-auto mb-8">
              <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-amber-400" />
                  <div>
                    <p className="text-xs text-gray-400">
                      Last checked: <span className="text-white font-medium">
                        {typeof lastLookup.vehicle === 'string' 
                          ? lastLookup.vehicle 
                          : `${lastLookup.vehicle?.make || ''} ${lastLookup.vehicle?.model || ''}`.trim()
                        }
                      </span> → {lastLookup.destination}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-400/50 text-amber-400 hover:bg-amber-400/10 text-xs h-8 px-3"
                  onClick={() => setLocation('/user-dashboard')}
                >
                  View Journey
                </Button>
              </div>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="font-semibold mb-2">Instant Analysis</h3>
              <p className="text-sm text-gray-400">AI-powered vehicle recognition from any input format</p>
              <p className="text-xs text-gray-500 mt-2">Delivered automatically after your search</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="font-semibold mb-2">Real Data</h3>
              <p className="text-sm text-gray-400">Live government compliance and auction pricing</p>
              <p className="text-xs text-gray-500 mt-2">Delivered automatically after your search</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="font-semibold mb-2">Major Markets</h3>
              <p className="text-sm text-gray-400">Australia, US, UK, Canada + 6 other key markets</p>
              <p className="text-xs text-gray-500 mt-2">Delivered automatically after your search</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="max-w-5xl mx-auto mb-16 px-4">
          <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Analysis Complete</h3>
                <p className="text-gray-400">Vehicle identified and processed</p>
              </div>
            </div>
            
            {result.vehicle && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Vehicle Details</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">
                        <span className="text-gray-500">Make:</span> {result.vehicle.make}
                      </p>
                      <p className="text-gray-300">
                        <span className="text-gray-500">Model:</span> {result.vehicle.model}
                      </p>
                      {result.vehicle.year && (
                        <p className="text-gray-300">
                          <span className="text-gray-500">Year:</span> {result.vehicle.year}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {result.eligibility && (
                    <div>
                      <h4 className="font-semibold text-white mb-2">Import Eligibility</h4>
                      <div className="space-y-2 text-sm">
                        {result.eligibility.countries?.map((country: any, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-400" />
                            <span className="text-gray-300">{country.name}: {country.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <Button 
                    onClick={() => {
                      const vehicleParams = new URLSearchParams({
                        make: result.vehicle.make,
                        model: result.vehicle.model,
                        year: result.vehicle.year?.toString() || '',
                        destination: result.destination || 'australia'
                      });
                      setLocation(`/import-journey?${vehicleParams.toString()}`);
                    }}
                    className="bg-amber-400 hover:bg-amber-500 text-black font-semibold px-6 py-2"
                  >
                    Continue Import Journey →
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-lg mx-auto mb-12">
          <div className="bg-red-900/20 border border-red-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <X className="h-5 w-5 text-red-400" />
              <h3 className="font-medium text-red-300">Analysis Failed</h3>
            </div>
            <p className="text-red-400 text-sm">
              Unable to analyze this vehicle. Please check your input and try again.
            </p>
          </div>
        </div>
      )}

      {/* Most Popular Import Destinations */}
      <div className="py-16 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              🌎 Most Popular Import Destinations
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              We'll calculate all of this for you instantly after your input.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800 opacity-70">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🇦🇺</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">Australia</h3>
                  <p className="text-sm text-gray-400">25-year rule</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Real-time compliance + duty calculations</p>
            </div>
            
            <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800 opacity-70">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🇺🇸</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">United States</h3>
                  <p className="text-sm text-gray-400">25-year rule</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">DOT/EPA compliance tracking</p>
            </div>
            
            <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800 opacity-70">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🇬🇧</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">United Kingdom</h3>
                  <p className="text-sm text-gray-400">IVA testing</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">DVLA registration guidance</p>
            </div>
            
            <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800 opacity-70">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🇨🇦</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">Canada</h3>
                  <p className="text-sm text-gray-400">15-year rule</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">RIV eligibility verification</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="py-16 bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
            Ready to start your import journey?
          </h2>
          <Button 
            onClick={() => {
              document.querySelector('input')?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
              });
              document.querySelector('input')?.focus();
            }}
            className="w-full max-w-md bg-amber-400 hover:bg-amber-500 text-black font-bold py-4 text-xl mb-4"
          >
            Start Your Import Check Now
          </Button>
          <p className="text-gray-400 text-sm">
            🚗 Powered by real data from government sources, auction platforms, and compliance agencies
          </p>
        </div>
      </div>
    </div>
  );
}