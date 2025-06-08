import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Sparkles, Database, Target } from "lucide-react";
import { SmartParserResult } from "@/components/SmartParserResult";
import { apiRequest } from "@/lib/queryClient";

interface SmartParserResponse {
  data: any;
  confidenceScore: number;
  sourceAttribution: string;
  sourceBreakdown: Array<{
    dataPoint: string;
    source: string;
    confidence: number;
    lastVerified: string;
    url?: string;
  }>;
  whyThisResult: string;
  nextSteps: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    actionUrl?: string;
    estimatedTime?: string;
  }>;
  userIntent?: {
    category: string;
    subcategory: string;
    confidence: number;
    riskFactors: string[];
    detectedKeywords: string[];
  };
  importRiskIndex?: {
    score: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: Array<{
      name: string;
      impact: number;
      description: string;
    }>;
    explanation: string;
  };
  strategicRecommendations?: Array<{
    type: string;
    title: string;
    description: string;
    timing: string;
    alternatives: string[];
    confidence: number;
    priority: 'low' | 'medium' | 'high';
  }>;
  fallbackSuggestions?: string[];
  lastUpdated?: string;
  disclaimer?: string;
}

export function VehicleLookup() {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: result, isLoading, error } = useQuery({
    queryKey: ['/api/smart-parser/intelligent-lookup', searchQuery],
    queryFn: () => apiRequest('/api/smart-parser/intelligent-lookup', {
      method: 'POST',
      body: { query: searchQuery }
    }),
    enabled: !!searchQuery
  });

  const handleSearch = () => {
    if (query.trim()) {
      setSearchQuery(query.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddToWatchlist = async (vehicleData: any) => {
    try {
      await apiRequest('/api/watchlist/add', {
        method: 'POST',
        body: {
          make: vehicleData.make,
          model: vehicleData.model,
          chassisCode: vehicleData.chassisCode,
          userIntent: 'purchase_research'
        }
      });
      // Show success message
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
    }
  };

  const handleSuggestPattern = async (pattern: string, make: string, model: string) => {
    try {
      await apiRequest('/api/admin/suggest-pattern', {
        method: 'POST',
        body: {
          pattern: query,
          make,
          model,
          confidence: 85
        }
      });
      // Show success message
    } catch (error) {
      console.error('Failed to suggest pattern:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Intelligence Lookup</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Find out if you can import any car in 30 seconds with strategic intelligence and compliance guidance.
        </p>
      </div>

      {/* Search Interface */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Smart Vehicle Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter vehicle details: e.g., 'skyline gtr', 'supra mk4', 'evo 6'"
                className="text-lg py-3"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={!query.trim() || isLoading}
              className="px-6 py-3"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </Button>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Popular searches:</span>
            {['skyline gtr', 'supra mk4', 'rx7 fd', 'evo 6', 'nsx'].map((suggestion) => (
              <Badge 
                key={suggestion}
                variant="outline" 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setQuery(suggestion);
                  setSearchQuery(suggestion);
                }}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchQuery && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-gray-600" />
            <span className="text-lg font-medium text-gray-900">
              Search Results for "{searchQuery}"
            </span>
          </div>
          
          {isLoading && (
            <Card>
              <CardContent className="py-12">
                <div className="flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-lg text-gray-600">
                    Analyzing vehicle data...
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
          
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-6">
                <div className="text-red-800">
                  Search failed. Please try again or contact support if the problem persists.
                </div>
              </CardContent>
            </Card>
          )}
          
          {result && (
            <SmartParserResult
              result={result as SmartParserResponse}
              onAddToWatchlist={handleAddToWatchlist}
              onSuggestPattern={handleSuggestPattern}
            />
          )}
        </div>
      )}

      {/* Information Cards */}
      {!searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">Smart Recognition</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Our AI understands natural language queries like "skyline gtr" or "evo 6" and matches them to specific chassis codes and model variants.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Database className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Confidence Scoring</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Every result includes confidence scores and source attribution so you know exactly how reliable the information is.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Strategic Intelligence</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Get import risk assessments, compliance guidance, and strategic recommendations tailored to your specific vehicle and destination.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}