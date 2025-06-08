import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from "@tanstack/react-query";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Globe, MapPin, FileText, Clock, DollarSign } from 'lucide-react';

import { apiRequest } from "@/lib/queryClient";

interface EligibilityResult {
  country: string;
  eligible: boolean;
  status: 'eligible' | 'restricted' | 'prohibited' | 'conditional';
  requirements: string[];
  restrictions: string[];
  estimatedTimeframe: string;
  estimatedCost: number;
  confidence: number;
  notes: string;
  documentationRequired: string[];
  complianceStandards: string[];
}

export default function EligibilityCheck() {
  const [location] = useLocation();
  const [selectedCountry, setSelectedCountry] = useState('australia');
  const [vehicleData, setVehicleData] = useState({
    make: '',
    model: '',
    chassis: '',
    year: ''
  });

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    setVehicleData({
      make: params.get('make') || '',
      model: params.get('model') || '',
      chassis: params.get('chassis') || '',
      year: params.get('year') || ''
    });
  }, [location]);

  const { data: eligibilityResults, isLoading, refetch } = useQuery({
    queryKey: ['/api/eligibility-check', vehicleData, selectedCountry],
    queryFn: () => apiRequest('/api/eligibility-check', {
      method: 'POST',
      body: {
        vehicle: vehicleData,
        targetCountry: selectedCountry
      }
    }),
    enabled: !!(vehicleData.make && vehicleData.model && selectedCountry)
  });

  const countries = [
    { code: 'australia', name: 'Australia', flag: '🇦🇺' },
    { code: 'usa', name: 'United States', flag: '🇺🇸' },
    { code: 'canada', name: 'Canada', flag: '🇨🇦' },
    { code: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'germany', name: 'Germany', flag: '🇩🇪' },
    { code: 'japan', name: 'Japan', flag: '🇯🇵' },
    { code: 'nz', name: 'New Zealand', flag: '🇳🇿' },
    { code: 'singapore', name: 'Singapore', flag: '🇸🇬' },
    { code: 'uae', name: 'UAE', flag: '🇦🇪' },
    { code: 'south_africa', name: 'South Africa', flag: '🇿🇦' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'eligible': return 'bg-green-900/50 text-green-300 border-green-700';
      case 'conditional': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
      case 'restricted': return 'bg-orange-900/50 text-orange-300 border-orange-700';
      case 'prohibited': return 'bg-red-900/50 text-red-300 border-red-700';
      default: return 'bg-gray-900/50 text-gray-300 border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'eligible': return <CheckCircle className="h-5 w-5" />;
      case 'conditional': return <AlertCircle className="h-5 w-5" />;
      case 'restricted': return <AlertCircle className="h-5 w-5" />;
      case 'prohibited': return <XCircle className="h-5 w-5" />;
      default: return <AlertCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Vehicle Import Eligibility Check
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Check if your vehicle can be imported to any country with real government regulations and compliance requirements
          </p>
        </div>

        {/* Vehicle Info Display */}
        {vehicleData.make && vehicleData.model && (
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 mb-8 border border-blue-700/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Globe className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {vehicleData.make} {vehicleData.model}
                </h2>
                <div className="flex gap-4 text-blue-400 text-sm">
                  {vehicleData.chassis && <span>Chassis: {vehicleData.chassis}</span>}
                  {vehicleData.year && <span>Year: {vehicleData.year}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Country Selection */}
        <Card className="bg-gray-900/50 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Select Target Country
            </CardTitle>
            <CardDescription>
              Choose the country where you want to import this vehicle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-full bg-gray-800 border-gray-600">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Checking eligibility with government databases...</p>
          </div>
        )}

        {eligibilityResults && (
          <div className="space-y-6">
            {/* Main Status */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    {getStatusIcon(eligibilityResults.status)}
                    Import Eligibility Status
                  </CardTitle>
                  <Badge className={getStatusColor(eligibilityResults.status)}>
                    {eligibilityResults.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="font-medium">Timeframe</p>
                      <p className="text-sm text-gray-400">{eligibilityResults.estimatedTimeframe}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="font-medium">Est. Cost</p>
                      <p className="text-sm text-gray-400">${eligibilityResults.estimatedCost?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="font-medium">Confidence</p>
                      <p className="text-sm text-gray-400">{eligibilityResults.confidence}% certainty</p>
                    </div>
                  </div>
                </div>
                
                {eligibilityResults.notes && (
                  <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
                    <p className="text-blue-200">{eligibilityResults.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Requirements */}
            {eligibilityResults.requirements && eligibilityResults.requirements.length > 0 && (
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {eligibilityResults.requirements.map((req, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-900/10 rounded-lg border border-green-700/20">
                        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-green-200">{req}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Restrictions */}
            {eligibilityResults.restrictions && eligibilityResults.restrictions.length > 0 && (
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Restrictions & Limitations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {eligibilityResults.restrictions.map((restriction, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-yellow-900/10 rounded-lg border border-yellow-700/20">
                        <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span className="text-yellow-200">{restriction}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documentation Required */}
            {eligibilityResults.documentationRequired && eligibilityResults.documentationRequired.length > 0 && (
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Required Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {eligibilityResults.documentationRequired.map((doc, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-blue-900/10 rounded-lg border border-blue-700/20">
                        <FileText className="h-4 w-4 text-blue-400" />
                        <span className="text-blue-200">{doc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-700/30">
              <CardHeader>
                <CardTitle>Ready for the Next Step?</CardTitle>
                <CardDescription>
                  Continue your import journey with detailed cost calculations and step-by-step guidance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Calculate Import Costs
                  </Button>
                  <Button variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white">
                    Get Import Roadmap
                  </Button>
                  <Button variant="outline" className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white">
                    Find Import Specialists
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}