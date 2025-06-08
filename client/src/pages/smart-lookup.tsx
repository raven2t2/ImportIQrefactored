import { useState } from "react";
import { Zap, Shield, Globe, ArrowRight } from "lucide-react";
import { SmartInputParser } from "@/components/smart-input-parser";
import { DynamicResultsRenderer } from "@/components/dynamic-results-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ParsedInput {
  type: 'vin' | 'url' | 'model' | 'chassis';
  value: string;
  confidence: number;
  detectedInfo?: {
    make?: string;
    model?: string;
    year?: number;
    origin?: string;
    platform?: string;
  };
  intent: 'eligibility' | 'cost' | 'compliance' | 'general';
}

export function SmartLookupPage() {
  const [parsedInput, setParsedInput] = useState<ParsedInput | null>(null);
  const [eligibilityResults, setEligibilityResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  // Check eligibility mutation
  const eligibilityMutation = useMutation({
    mutationFn: async (data: { vehicleData: any; targetCountries: string[] }) => {
      const response = await fetch('/api/check-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      setEligibilityResults(data);
      setShowResults(true);
    }
  });

  const handleInputParsed = (parsed: ParsedInput) => {
    setParsedInput(parsed);
    
    // Automatically check eligibility for detected countries
    const vehicleData = {
      ...parsed.detectedInfo,
      estimatedAge: parsed.detectedInfo?.year ? new Date().getFullYear() - parsed.detectedInfo.year : 25,
      estimatedValue: 50000, // Default for calculation
      inputType: parsed.type,
      confidence: parsed.confidence
    };

    // Determine target countries based on intent and origin
    let targetCountries = ['AU', 'US', 'CA', 'UK', 'DE'];
    
    if (parsed.detectedInfo?.origin === 'Japan') {
      targetCountries = ['AU', 'NZ', 'UK', 'DE', 'CA'];
    } else if (parsed.detectedInfo?.origin === 'USA') {
      targetCountries = ['AU', 'CA', 'UK', 'DE'];
    } else if (parsed.detectedInfo?.origin === 'Europe') {
      targetCountries = ['AU', 'US', 'CA', 'UK'];
    }

    eligibilityMutation.mutate({ vehicleData, targetCountries });
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'cost': return '💰';
      case 'compliance': return '📋';
      case 'eligibility': return '✅';
      default: return '🔍';
    }
  };

  const getIntentAction = (intent: string) => {
    switch (intent) {
      case 'cost': return 'Calculate Import Costs';
      case 'compliance': return 'Check Requirements';
      case 'eligibility': return 'Verify Eligibility';
      default: return 'Get Information';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Smart Vehicle Import Intelligence
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Paste anything. Get instant answers. Feel smart within seconds.
          </p>
          
          {/* Trust Indicators */}
          <div className="flex justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span>100% Authentic Government Data</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600" />
              <span>17 Countries, 88 Regional Variations</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <span>Real-time Validation</span>
            </div>
          </div>
        </div>

        {/* Smart Input Parser */}
        <div className="mb-8">
          <SmartInputParser 
            onInputParsed={handleInputParsed}
            placeholder="Paste VIN, auction URL, chassis code, or type any car model..."
          />
        </div>

        {/* Loading State */}
        {eligibilityMutation.isPending && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-lg font-medium">Analyzing against global regulations...</span>
              </div>
              <div className="flex justify-center gap-2 text-sm text-gray-600">
                <span>Checking age requirements</span>
                <span>•</span>
                <span>Validating compliance rules</span>
                <span>•</span>
                <span>Calculating accurate costs</span>
              </div>
            </CardContent>
          </Card>
        )}



        {/* Results */}
        {showResults && eligibilityResults && (
          <div className="space-y-6">
            <DynamicResultsRenderer
              results={eligibilityResults.results}
              recommendations={eligibilityResults.recommendations}
              vehicleInfo={parsedInput?.detectedInfo}
            />

            {/* Next Step Call-to-Actions */}
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-purple-600" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
                    <div className="font-medium mb-2">Get Detailed Quote</div>
                    <div className="text-sm text-gray-600 mb-3">
                      Precise costs with shipping, duties, and compliance
                    </div>
                    <div className="text-xs text-blue-600">→ Import Calculator</div>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
                    <div className="font-medium mb-2">Find Local Workshops</div>
                    <div className="text-sm text-gray-600 mb-3">
                      Compliance specialists in your area
                    </div>
                    <div className="text-xs text-blue-600">→ Workshop Finder</div>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
                    <div className="font-medium mb-2">Market Intelligence</div>
                    <div className="text-sm text-gray-600 mb-3">
                      Live auction data and market trends
                    </div>
                    <div className="text-xs text-blue-600">→ Market Data</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feature Highlights */}
        {!parsedInput && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="font-semibold mb-2">Smart Detection</h3>
                <p className="text-sm text-gray-600">
                  Automatically recognizes VINs, auction URLs, chassis codes, and vehicle models
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="font-semibold mb-2">Global Coverage</h3>
                <p className="text-sm text-gray-600">
                  Authentic regulations from 17 countries with regional specificity
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="font-semibold mb-2">Instant Results</h3>
                <p className="text-sm text-gray-600">
                  Real-time eligibility, costs, and next steps within seconds
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Examples */}
        {!parsedInput && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Try These Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="font-medium">VIN Numbers:</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="p-2 bg-gray-50 rounded font-mono">JTD1234567890123456</div>
                    <div className="p-2 bg-gray-50 rounded font-mono">1G1BC5E07CB123456</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium">Chassis Codes:</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="p-2 bg-gray-50 rounded font-mono">BNR32</div>
                    <div className="p-2 bg-gray-50 rounded font-mono">JZX100</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium">Vehicle Models:</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="p-2 bg-gray-50 rounded">Toyota Supra</div>
                    <div className="p-2 bg-gray-50 rounded">BMW M3 E46</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium">Auction URLs:</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="p-2 bg-gray-50 rounded">yahoo.auctions.co.jp/...</div>
                    <div className="p-2 bg-gray-50 rounded">copart.com/lot/...</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}