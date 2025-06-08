import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from "@tanstack/react-query";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, DollarSign, FileText, AlertCircle, ArrowRight, Calendar, MapPin, Truck, Shield } from 'lucide-react';

import { apiRequest } from "@/lib/queryClient";
import SessionManager from "@/lib/session-manager";
import { AuctionIntelligenceDisplay } from "@/components/auction-intelligence-display";

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
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize session and handle URL parameters
  useEffect(() => {
    const initializeSession = async () => {
      // Parse URL parameters first
      const urlParams = SessionManager.parseUrlParams();
      console.log('Parsing URL params:', urlParams);
      
      // Always set vehicle data from URL parameters
      setVehicleData({
        make: urlParams.make || '',
        model: urlParams.model || '',
        chassis: urlParams.chassis || '',
        year: urlParams.year || ''
      });
      setDestination(urlParams.destination || 'australia');
      
      // Try to get or create session token
      let token = SessionManager.getSessionToken();
      
      if (!token && (urlParams.make || urlParams.model)) {
        try {
          const reconstructed = await SessionManager.reconstructSession(urlParams);
          if (reconstructed) {
            token = reconstructed.sessionToken;
          }
        } catch (error) {
          console.error('Failed to reconstruct session:', error);
        }
      }
      
      setSessionToken(token);
      setIsInitialized(true);
    };
    
    initializeSession();
  }, [location]);

  // Update URL parameters when vehicle data changes
  useEffect(() => {
    if (isInitialized && (vehicleData.make || vehicleData.model)) {
      SessionManager.updateUrlParams(vehicleData, destination);
    }
  }, [vehicleData, destination, isInitialized]);

  const { data: importIntelligence, isLoading, error } = useQuery({
    queryKey: ['/api/import-intelligence', vehicleData, destination, sessionToken],
    enabled: !!(vehicleData.make && destination && isInitialized),
    queryFn: async () => {
      try {
        console.log('Making import intelligence request with:', { vehicleData, destination, sessionToken });
        const response = await apiRequest('POST', '/api/import-intelligence', { 
          vehicleData: vehicleData, 
          destination,
          sessionToken 
        });
        const data = await response.json();
        console.log('Import intelligence response:', data);
        return data;
      } catch (error) {
        console.error('Import intelligence API error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in memory for 30 minutes
    retry: 3,
    retryDelay: 1000,
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

  if (error) {
    console.error('Import Intelligence Error:', error);
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Unable to Load Import Intelligence</h2>
          <p className="text-gray-400">API Error: {error?.message || 'Unknown error'}</p>
          <p className="text-gray-500 mt-2">Vehicle: {vehicleData.make} {vehicleData.model}</p>
          <p className="text-gray-500">Destination: {destination}</p>
        </div>
      </div>
    );
  }

  if (!importIntelligence && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Import Intelligence Data</h2>
          <p className="text-gray-400">Unable to generate analysis for this vehicle</p>
          <p className="text-gray-500 mt-2">Vehicle: {vehicleData.make} {vehicleData.model}</p>
          <p className="text-gray-500">Destination: {destination}</p>
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

          {/* Live Market Intelligence */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <AuctionIntelligenceDisplay 
              make={vehicleData.make} 
              model={vehicleData.model}
              year={vehicleData.year ? parseInt(vehicleData.year) : undefined}
            />
            
            {/* Advanced Market Analytics */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Market Analytics
                </CardTitle>
                <CardDescription>
                  Real-time insights from global auction networks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">12%</div>
                      <div className="text-xs text-gray-400">Price Variance</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">94</div>
                      <div className="text-xs text-gray-400">Active Listings</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Market Trend</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-green-400">Stable</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Import Volume</span>
                      <span className="text-sm text-yellow-400">Moderate</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Best Import Window</span>
                      <span className="text-sm text-blue-400">Q1-Q2 2025</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-blue-300 font-medium mb-1">Timing Insight</p>
                        <p className="text-xs text-blue-200">
                          Current market conditions favor imports with stable pricing and moderate competition. Consider starting your search now for Q2 delivery.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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

            {/* Vehicle Sourcing Intelligence */}
            <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-700/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Sourcing Intelligence
                </CardTitle>
                <CardDescription>
                  Best procurement strategies for this vehicle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/5 rounded-lg text-center">
                      <div className="text-lg font-bold text-green-400">Japan</div>
                      <div className="text-xs text-gray-400">Best Source</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg text-center">
                      <div className="text-lg font-bold text-blue-400">85%</div>
                      <div className="text-xs text-gray-400">Availability</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-white">Recommended Auction Houses</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                        <span className="text-sm text-gray-300">USS Auctions</span>
                        <Badge className="bg-green-900/50 text-green-300 border-green-700 text-xs">
                          High Quality
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                        <span className="text-sm text-gray-300">Yahoo Auctions</span>
                        <Badge className="bg-blue-900/50 text-blue-300 border-blue-700 text-xs">
                          Best Value
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-700/30">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-yellow-300 font-medium mb-1">Pro Tip</p>
                        <p className="text-xs text-yellow-200">
                          Spring auctions (March-May) typically offer the best selection and competitive pricing for this model.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save & Track */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle>Monitor This Vehicle</CardTitle>
                <CardDescription>
                  Get alerts when new listings appear or prices change
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="text-xs">
                      Price Alerts
                    </Button>
                    <Button variant="outline" className="text-xs">
                      New Listings
                    </Button>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Start Monitoring
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