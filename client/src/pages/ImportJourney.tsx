import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from "@tanstack/react-query";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, DollarSign, FileText, AlertCircle, ArrowRight, Calendar, MapPin, Truck, Shield } from 'lucide-react';

import { apiRequest } from "@/lib/queryClient";

interface ImportIntelligence {
  vehicle: {
    make: string;
    model: string;
    chassis: string;
    year: string;
  };
  destination: {
    country: string;
    flag: string;
    name: string;
  };
  eligibility: {
    status: 'eligible' | 'conditional' | 'restricted' | 'prohibited';
    confidence: number;
    timeline: string;
    keyFactors: string[];
  };
  costs: {
    vehicle: number;
    shipping: number;
    duties: number;
    compliance: number;
    total: number;
    breakdown: Array<{
      category: string;
      amount: number;
      description: string;
    }>;
  };
  timeline: Array<{
    phase: string;
    duration: string;
    status: 'completed' | 'current' | 'upcoming';
    description: string;
    requirements: string[];
  }>;
  nextSteps: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    timeline: string;
    description: string;
  }>;
  alternatives: Array<{
    make: string;
    model: string;
    reason: string;
    advantage: string;
  }>;
}

export default function ImportJourney() {
  const [location] = useLocation();
  const [vehicleData, setVehicleData] = useState<any>({});
  const [destination, setDestination] = useState('');

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    setVehicleData({
      make: params.get('make') || '',
      model: params.get('model') || '',
      chassis: params.get('chassis') || '',
      year: params.get('year') || ''
    });
    setDestination(params.get('destination') || '');
  }, [location]);

  const { data: importIntelligence, isLoading } = useQuery({
    queryKey: ['/api/import-intelligence', vehicleData, destination],
    queryFn: () => apiRequest('/api/import-intelligence', {
      method: 'POST',
      body: { vehicle: vehicleData, destination }
    }),
    enabled: !!(vehicleData.make && destination)
  });

  const getDestinationInfo = (dest: string) => {
    const destinations: Record<string, any> = {
      australia: { flag: '🇦🇺', name: 'Australia', rule: '25-year rule' },
      usa: { flag: '🇺🇸', name: 'United States', rule: '25-year rule' },
      uk: { flag: '🇬🇧', name: 'United Kingdom', rule: 'EU standards' },
      canada: { flag: '🇨🇦', name: 'Canada', rule: '15-year rule' }
    };
    return destinations[dest] || { flag: '🌍', name: 'International', rule: 'Various rules' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'eligible': return 'bg-green-900/50 text-green-300 border-green-700';
      case 'conditional': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
      case 'restricted': return 'bg-orange-900/50 text-orange-300 border-orange-700';
      case 'prohibited': return 'bg-red-900/50 text-red-300 border-red-700';
      default: return 'bg-gray-900/50 text-gray-300 border-gray-700';
    }
  };

  const destInfo = getDestinationInfo(destination);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Building Your Import Intelligence</h2>
          <p className="text-gray-400">Analyzing eligibility, costs, and timeline for {vehicleData.make} {vehicleData.model}...</p>
        </div>
      </div>
    );
  }

  if (!importIntelligence) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Unable to Load Import Intelligence</h2>
          <p className="text-gray-400">Please try again or contact support</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 mb-8 border border-blue-700/30">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {vehicleData.make} {vehicleData.model} Import Journey
              </h1>
              <div className="flex items-center gap-4 text-blue-300">
                <span className="flex items-center gap-2">
                  <span className="text-2xl">{destInfo.flag}</span>
                  <span>to {destInfo.name}</span>
                </span>
                {vehicleData.chassis && (
                  <Badge variant="outline" className="border-blue-600 text-blue-300">
                    {vehicleData.chassis}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <Badge className={getStatusColor(importIntelligence.eligibility?.status || 'unknown')}>
                {importIntelligence.eligibility?.status?.toUpperCase() || 'CHECKING'}
              </Badge>
              <div className="text-sm text-gray-400 mt-2">
                {importIntelligence.eligibility?.confidence}% confidence
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <span className="font-medium">Total Cost</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                ${importIntelligence.costs?.total?.toLocaleString() || 'Calculating'}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-blue-400" />
                <span className="font-medium">Timeline</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {importIntelligence.eligibility?.timeline || '6-9 months'}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-5 w-5 text-purple-400" />
                <span className="font-medium">Compliance</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {destInfo.rule}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Truck className="h-5 w-5 text-orange-400" />
                <span className="font-medium">Shipping</span>
              </div>
              <div className="text-2xl font-bold text-orange-400">
                ${importIntelligence.costs?.shipping?.toLocaleString() || '4,500'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Process & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Import Process Timeline */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Import Process Timeline
                </CardTitle>
                <CardDescription>
                  Your step-by-step journey to importing this vehicle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {importIntelligence.timeline?.map((phase, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          phase.status === 'completed' ? 'bg-green-600' :
                          phase.status === 'current' ? 'bg-blue-600' : 'bg-gray-600'
                        }`}>
                          {phase.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-white" />
                          ) : (
                            <span className="text-white font-bold">{index + 1}</span>
                          )}
                        </div>
                        {index < (importIntelligence.timeline?.length || 0) - 1 && (
                          <div className="w-0.5 h-16 bg-gray-600 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-white">{phase.phase}</h3>
                          <Badge variant="outline" className="text-xs">
                            {phase.duration}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{phase.description}</p>
                        {phase.requirements && phase.requirements.length > 0 && (
                          <div className="space-y-2">
                            {phase.requirements.map((req, reqIndex) => (
                              <div key={reqIndex} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-3 w-3 text-green-400" />
                                <span className="text-gray-300">{req}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )) || (
                    // Default timeline if none provided
                    [
                      { phase: 'Vehicle Purchase', duration: '1-2 weeks', description: 'Locate and purchase vehicle in origin country' },
                      { phase: 'Export Documentation', duration: '2-3 weeks', description: 'Obtain export permits and documentation' },
                      { phase: 'Shipping', duration: '4-6 weeks', description: 'Ocean freight to destination port' },
                      { phase: 'Customs Clearance', duration: '1-2 weeks', description: 'Import duties and customs processing' },
                      { phase: 'Compliance & Registration', duration: '6-12 weeks', description: 'Vehicle compliance and local registration' }
                    ].map((phase, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold">{index + 1}</span>
                          </div>
                          {index < 4 && <div className="w-0.5 h-16 bg-gray-600 mt-2"></div>}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-white">{phase.phase}</h3>
                            <Badge variant="outline" className="text-xs">{phase.duration}</Badge>
                          </div>
                          <p className="text-gray-400 text-sm">{phase.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Complete Cost Breakdown
                </CardTitle>
                <CardDescription>
                  Transparent pricing with no hidden fees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {importIntelligence.costs?.breakdown?.map((cost, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <div>
                        <span className="font-medium text-white">{cost.category}</span>
                        <p className="text-sm text-gray-400">{cost.description}</p>
                      </div>
                      <span className="font-bold text-green-400">
                        ${cost.amount.toLocaleString()}
                      </span>
                    </div>
                  )) || (
                    // Default cost breakdown
                    [
                      { category: 'Vehicle Purchase', amount: 25000, description: 'Estimated market price in origin country' },
                      { category: 'Shipping & Logistics', amount: 4500, description: 'Ocean freight and handling' },
                      { category: 'Import Duties & Taxes', amount: 6200, description: 'Government fees and taxes' },
                      { category: 'Compliance & Certification', amount: 8500, description: 'Testing, modifications, and registration' },
                      { category: 'Documentation & Fees', amount: 1800, description: 'Permits, inspections, and processing' }
                    ].map((cost, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <div>
                          <span className="font-medium text-white">{cost.category}</span>
                          <p className="text-sm text-gray-400">{cost.description}</p>
                        </div>
                        <span className="font-bold text-green-400">
                          ${cost.amount.toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                  
                  <div className="border-t border-gray-600 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-white">Total Estimated Cost</span>
                      <span className="text-2xl font-bold text-green-400">
                        ${importIntelligence.costs?.total?.toLocaleString() || '46,000'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions & Next Steps */}
          <div className="space-y-6">
            {/* Next Actions */}
            <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-700/30">
              <CardHeader>
                <CardTitle>Your Next Steps</CardTitle>
                <CardDescription>
                  Ready to make this import happen?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Start Import Process
                </Button>
                <Button variant="outline" className="w-full border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white">
                  Get Professional Quote
                </Button>
                <Button variant="outline" className="w-full border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white">
                  Connect with Specialist
                </Button>
              </CardContent>
            </Card>

            {/* Alternatives */}
            {importIntelligence.alternatives && importIntelligence.alternatives.length > 0 && (
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle>Consider These Alternatives</CardTitle>
                  <CardDescription>
                    Similar vehicles that might be easier to import
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {importIntelligence.alternatives.map((alt, index) => (
                    <div key={index} className="p-3 bg-white/5 rounded-lg">
                      <div className="font-medium text-white mb-1">
                        {alt.make} {alt.model}
                      </div>
                      <div className="text-sm text-gray-400 mb-2">{alt.reason}</div>
                      <div className="text-sm text-green-400">{alt.advantage}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Save & Track */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle>Save This Search</CardTitle>
                <CardDescription>
                  Get updates when eligibility or costs change
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                  />
                  <Button variant="outline" className="w-full">
                    Save & Get Updates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}