import { useState, useEffect } from "react";
import { Shield, CheckCircle, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  sources: string[];
  lastVerified: string;
  discrepancies: string[];
  recommendations: string[];
}

interface MarketCoverage {
  totalCountries: number;
  totalRegions: number;
  authenticDataPoints: number;
  competitorComparison: string;
  validationStatus: string;
}

export function DataIntegrityDashboard() {
  const [selectedCountry, setSelectedCountry] = useState("UK");
  
  const { data: marketCoverage } = useQuery({
    queryKey: ['/api/global-market-coverage'],
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  const { data: countryValidation, refetch: refetchValidation } = useQuery({
    queryKey: ['/api/admin/validate-country-data', selectedCountry],
    queryFn: () => fetch('/api/admin/validate-country-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ countryCode: selectedCountry })
    }).then(res => res.json()),
    enabled: !!selectedCountry
  });

  const countries = ["US", "CA", "UK", "DE", "JP", "FR", "IT", "NL", "BE", "SE", "NO", "DK", "SG", "HK", "NZ", "ZA"];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600 bg-green-50";
    if (confidence >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (confidence >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Data Integrity Dashboard</h2>
        <Badge variant="outline" className="ml-auto">
          Live Validation System
        </Badge>
      </div>

      {/* Market Coverage Summary */}
      {marketCoverage?.success && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Global Market Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {marketCoverage.summary.totalCountries}
                </div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {marketCoverage.summary.totalRegions}
                </div>
                <div className="text-sm text-gray-600">Regional Variations</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {marketCoverage.summary.authenticDataPoints}
                </div>
                <div className="text-sm text-gray-600">Data Points</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">Competitive Advantage</div>
                <div className="text-sm text-gray-600">{marketCoverage.summary.competitorComparison}</div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-900">Data Quality</div>
                <div className="text-sm text-green-700">{marketCoverage.summary.validationStatus}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Authentic Data Examples */}
      {marketCoverage?.authenticDataExamples && (
        <Card>
          <CardHeader>
            <CardTitle>Verified Government Data Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marketCoverage.authenticDataExamples.map((example: any, idx: number) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{example.country}</Badge>
                    <span className="text-xs text-gray-500">Verified {example.verified}</span>
                  </div>
                  <div className="font-medium text-gray-900 mb-1">{example.example}</div>
                  <a 
                    href={example.source} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Official Source
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Country-Specific Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Country Data Validation
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetchValidation()}
              disabled={!selectedCountry}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Validate
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Country for Validation
              </label>
              <select 
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {countryValidation?.success && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  {getConfidenceIcon(countryValidation.validation.confidence)}
                  <div className="flex-1">
                    <div className="font-medium">Data Confidence Score</div>
                    <div className="text-sm text-gray-600">
                      {countryValidation.validation.confidence}% confidence in data accuracy
                    </div>
                  </div>
                  <Badge className={getConfidenceColor(countryValidation.validation.confidence)}>
                    {countryValidation.validation.confidence >= 90 ? "Excellent" :
                     countryValidation.validation.confidence >= 70 ? "Good" : "Needs Review"}
                  </Badge>
                </div>

                {countryValidation.dataSnapshot && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="font-medium mb-2">Government Authority</div>
                      <div className="text-sm text-gray-600 mb-2">
                        {countryValidation.dataSnapshot.authority}
                      </div>
                      <a 
                        href={countryValidation.dataSnapshot.governmentWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Official Website
                      </a>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="font-medium mb-2">Data Freshness</div>
                      <div className="text-sm text-gray-600">
                        Last Updated: {new Date(countryValidation.dataSnapshot.lastUpdated).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {countryValidation.validation.isValid ? "✓ Validated" : "⚠ Needs Review"}
                      </div>
                    </div>
                  </div>
                )}

                {countryValidation.sourceCheck && (
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">Source Verification</div>
                    <div className="text-sm text-gray-600 mb-3">
                      {countryValidation.sourceCheck.verificationStatus}
                    </div>
                    <div className="space-y-2">
                      {countryValidation.sourceCheck.availableSources.map((source: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="text-sm">
                            <div className="font-medium">{source.authority}</div>
                            <div className="text-gray-500">{source.type} source</div>
                          </div>
                          <Badge variant={source.status === 'active' ? 'default' : 'secondary'}>
                            {source.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {countryValidation.validation.recommendations.length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="font-medium text-yellow-800 mb-2">Recommendations</div>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {countryValidation.validation.recommendations.map((rec: string, idx: number) => (
                        <li key={idx}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}