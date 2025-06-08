import { useState, useEffect } from "react";
import { Search, Car, MapPin, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SmartVehicleLookupProps {
  onVehicleFound: (vehicleData: any) => void;
  targetCountry: string;
  targetRegion: string;
}

export function SmartVehicleLookup({ onVehicleFound, targetCountry, targetRegion }: SmartVehicleLookupProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('importiq-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const saveSearch = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('importiq-recent-searches', JSON.stringify(updated));
  };

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      let vehicleData = null;

      // Try VIN lookup first (17 characters)
      if (searchTerm.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/.test(searchTerm)) {
        const vinResponse = await fetch(`/api/vin-decode/${searchTerm}`);
        if (vinResponse.ok) {
          const vinData = await vinResponse.json();
          if (vinData.success) {
            vehicleData = {
              ...vinData.data,
              searchType: 'vin',
              marketData: vinData.auctionSamples || []
            };
          }
        }
      } 
      // Try chassis code lookup
      else if (searchTerm.length >= 3 && searchTerm.length <= 10) {
        const chassisResponse = await fetch('/api/vehicle-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: searchTerm })
        });
        if (chassisResponse.ok) {
          const chassisData = await chassisResponse.json();
          if (chassisData.success) {
            vehicleData = {
              ...chassisData.data,
              searchType: 'chassis',
              marketData: chassisData.auctionSamples || []
            };
          }
        }
      }
      // Try URL extraction
      else if (searchTerm.includes('http') || searchTerm.includes('auction') || searchTerm.includes('carsensor')) {
        const urlResponse = await fetch('/api/extract-vehicle-from-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: searchTerm })
        });
        if (urlResponse.ok) {
          const urlData = await urlResponse.json();
          if (urlData.success) {
            vehicleData = {
              ...urlData.vehicle,
              searchType: 'url',
              marketData: urlData.marketData || []
            };
          }
        }
      }

      if (vehicleData) {
        // Enhance with regional intelligence
        const intelligenceResponse = await fetch('/api/vehicle-intelligence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: searchTerm,
            targetCountry,
            targetRegion
          })
        });

        if (intelligenceResponse.ok) {
          const intelligence = await intelligenceResponse.json();
          vehicleData.intelligence = intelligence;
        }

        saveSearch(searchTerm);
        onVehicleFound(vehicleData);
      } else {
        // Show suggestions for partial matches
        const searchResponse = await fetch('/api/search-suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchTerm, targetCountry })
        });
        if (searchResponse.ok) {
          const suggestions = await searchResponse.json();
          setSuggestions(suggestions.suggestions || []);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch(query);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-600" />
          Smart Vehicle Lookup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter VIN, chassis code, or auction URL..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={() => performSearch(query)}
            disabled={loading || !query.trim()}
          >
            {loading ? "Searching..." : "Lookup"}
          </Button>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div>
            <span className="text-sm text-muted-foreground">Recent:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {recentSearches.map((search, idx) => (
                <Badge 
                  key={idx}
                  variant="secondary" 
                  className="cursor-pointer hover:bg-secondary/80"
                  onClick={() => {
                    setQuery(search);
                    performSearch(search);
                  }}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Search Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <span className="text-sm text-muted-foreground">Suggestions:</span>
            <div className="space-y-2 mt-2">
              {suggestions.map((suggestion, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2 bg-secondary/20 rounded cursor-pointer hover:bg-secondary/30"
                  onClick={() => {
                    setQuery(suggestion.identifier);
                    performSearch(suggestion.identifier);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{suggestion.make} {suggestion.model}</span>
                    <Badge variant="outline">{suggestion.year}</Badge>
                  </div>
                  {suggestion.marketPrice && (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-sm font-medium">
                        ${Math.round(suggestion.marketPrice).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location Context */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Targeting: {targetRegion}, {targetCountry.toUpperCase()}</span>
        </div>
      </CardContent>
    </Card>
  );
}