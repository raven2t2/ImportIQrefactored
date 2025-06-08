import { useState } from "react";
import { CheckCircle, XCircle, Clock, DollarSign, FileText, ArrowRight, MapPin, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface EligibilityResult {
  country: string;
  eligible: boolean;
  confidence: number;
  costs: {
    import: number;
    vat?: number;
    compliance?: number;
    registration?: number;
    total: number;
  };
  requirements: string[];
  timeline: string;
  regulations: {
    authority: string;
    website: string;
    complexity: string;
  };
  nextSteps: string[];
}

interface Recommendations {
  primary: string;
  secondary: string;
  breakdown?: Array<{
    country: string;
    cost: number;
    timeline: string;
    complexity: string;
  }>;
  alternatives?: Array<{
    country: string;
    reason: string;
    waitTime: string;
  }>;
}

interface DynamicResultsRendererProps {
  results: EligibilityResult[];
  recommendations: Recommendations;
  vehicleInfo?: {
    make?: string;
    model?: string;
    year?: number;
    origin?: string;
    technicalSpecs?: {
      name?: string;
      years?: string;
      engine?: {
        code?: string;
        type?: string;
        displacement?: string;
        power?: string;
        torque?: string;
        compression?: string;
      };
      drivetrain?: string;
      transmission?: string;
      modifications?: {
        potential?: string;
        popular?: string[];
        powerPotential?: string;
        difficulty?: string;
        notes?: string;
      };
    };
  };
}

export function DynamicResultsRenderer({ results, recommendations, vehicleInfo }: DynamicResultsRendererProps) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  
  const eligibleResults = results.filter(r => r.eligible);
  const ineligibleResults = results.filter(r => !r.eligible);

  const getCountryName = (code: string) => {
    const names: Record<string, string> = {
      'AU': 'Australia',
      'US': 'United States', 
      'CA': 'Canada',
      'UK': 'United Kingdom',
      'DE': 'Germany',
      'JP': 'Japan',
      'NZ': 'New Zealand'
    };
    return names[code] || code;
  };

  const getCountryFlag = (code: string) => {
    const flags: Record<string, string> = {
      'AU': '🇦🇺',
      'US': '🇺🇸',
      'CA': '🇨🇦', 
      'UK': '🇬🇧',
      'DE': '🇩🇪',
      'JP': '🇯🇵',
      'NZ': '🇳🇿'
    };
    return flags[code] || '🌍';
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'Complex': return 'bg-orange-100 text-orange-800';
      case 'Very Complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, country: string) => {
    const currencies: Record<string, { symbol: string; locale: string }> = {
      'AU': { symbol: 'AUD', locale: 'en-AU' },
      'US': { symbol: 'USD', locale: 'en-US' },
      'CA': { symbol: 'CAD', locale: 'en-CA' },
      'UK': { symbol: 'GBP', locale: 'en-GB' },
      'DE': { symbol: 'EUR', locale: 'de-DE' }
    };
    
    const currency = currencies[country] || currencies['AU'];
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.symbol
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Summary */}
      {vehicleInfo && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">Vehicle Analysis Complete</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Make:</span>
                <span className="ml-2 font-medium">{vehicleInfo.make || 'Detected'}</span>
              </div>
              <div>
                <span className="text-gray-600">Model:</span>
                <span className="ml-2 font-medium">{vehicleInfo.model || 'Various'}</span>
              </div>
              <div>
                <span className="text-gray-600">Year:</span>
                <span className="ml-2 font-medium">{vehicleInfo.year || 'Estimated'}</span>
              </div>
              <div>
                <span className="text-gray-600">Origin:</span>
                <span className="ml-2 font-medium">{vehicleInfo.origin || 'Multiple'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Banner */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
            <div className="flex-1">
              <div className="font-semibold text-green-900 mb-1">
                {recommendations.primary}
              </div>
              <div className="text-green-700 text-sm">
                {recommendations.secondary}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eligible Countries */}
      {eligibleResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Eligible Markets ({eligibleResults.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eligibleResults.map((result) => (
              <Card 
                key={result.country} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedCountry === result.country ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedCountry(selectedCountry === result.country ? null : result.country)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCountryFlag(result.country)}</span>
                      <span>{getCountryName(result.country)}</span>
                    </div>
                    <Badge className={getComplexityColor(result.regulations.complexity)}>
                      {result.regulations.complexity}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Total Cost</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(result.costs.total, result.country)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Timeline</span>
                      </div>
                      <span className="text-blue-600">{result.timeline}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">Requirements</span>
                      </div>
                      <Badge variant="outline">{result.requirements.length} items</Badge>
                    </div>

                    <Progress value={result.confidence} className="h-2" />
                    <div className="text-xs text-gray-600 text-right">
                      {result.confidence}% confidence
                    </div>
                  </div>

                  {selectedCountry === result.country && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      {/* Cost Breakdown */}
                      <div>
                        <h4 className="font-medium mb-2">Cost Breakdown</h4>
                        <div className="space-y-1 text-sm">
                          {Object.entries(result.costs).map(([key, value]) => {
                            if (key === 'total' || typeof value !== 'number') return null;
                            return (
                              <div key={key} className="flex justify-between">
                                <span className="capitalize">{key}:</span>
                                <span>{formatCurrency(value, result.country)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Requirements */}
                      <div>
                        <h4 className="font-medium mb-2">Required Steps</h4>
                        <ul className="space-y-1 text-sm">
                          {result.requirements.map((req, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Next Steps */}
                      <div>
                        <h4 className="font-medium mb-2">Next Steps</h4>
                        <div className="space-y-2">
                          {result.nextSteps.map((step, idx) => (
                            <Button 
                              key={idx} 
                              variant="outline" 
                              size="sm" 
                              className="w-full justify-between"
                            >
                              {step}
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Official Authority */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm">
                          <div className="font-medium">Official Authority</div>
                          <div className="text-gray-600">{result.regulations.authority}</div>
                          <a 
                            href={result.regulations.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            View official regulations →
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Ineligible Countries */}
      {ineligibleResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Currently Ineligible ({ineligibleResults.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ineligibleResults.map((result) => (
              <Card key={result.country} className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getCountryFlag(result.country)}</span>
                      <span className="font-medium">{getCountryName(result.country)}</span>
                    </div>
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span>Age/compliance restrictions apply</span>
                    </div>
                    <div className="text-gray-600">
                      Estimated timeline: {result.timeline}
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="font-medium mb-1">Alternative Options</h4>
                    <div className="space-y-1">
                      {result.nextSteps.map((step, idx) => (
                        <div key={idx} className="text-xs text-gray-600">• {step}</div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Recommendations */}
      {recommendations.breakdown && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Country</th>
                    <th className="text-left py-2">Cost</th>
                    <th className="text-left py-2">Timeline</th>
                    <th className="text-left py-2">Complexity</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendations.breakdown.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <span>{getCountryFlag(item.country)}</span>
                          <span>{getCountryName(item.country)}</span>
                        </div>
                      </td>
                      <td className="py-2 font-medium">
                        {formatCurrency(item.cost, item.country)}
                      </td>
                      <td className="py-2">{item.timeline}</td>
                      <td className="py-2">
                        <Badge className={getComplexityColor(item.complexity)}>
                          {item.complexity}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}