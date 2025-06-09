import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from "@tanstack/react-query";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, DollarSign, FileText, AlertCircle, ArrowRight, Calendar, MapPin, Truck, Shield, ExternalLink, MessageCircle, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  // Button handlers
  const handleStartImportProcess = () => {
    toast({
      title: "Import Process Started",
      description: `Beginning import process for ${vehicleData.make} ${vehicleData.model} to ${destInfo.name}`,
    });
    // Navigate to import calculator with pre-filled data
    window.location.href = `/import-calculator?make=${vehicleData.make}&model=${vehicleData.model}&destination=${destination}&cost=${importIntelligence?.costs?.total || 0}`;
  };

  const handleGetProfessionalQuote = () => {
    toast({
      title: "Professional Quote Request",
      description: "Connecting you with our import specialists for a detailed quote",
    });
    // Navigate to contact with vehicle details
    window.location.href = `/contact?vehicle=${vehicleData.make} ${vehicleData.model}&service=professional-quote&cost=${importIntelligence?.costs?.total || 0}`;
  };

  const handleConnectWithSpecialist = () => {
    toast({
      title: "Specialist Connection",
      description: "Opening direct communication channel with import experts",
    });
    // Navigate to specialist booking with vehicle context
    window.location.href = `/booking-calendar?vehicle=${vehicleData.make} ${vehicleData.model}&destination=${destination}&urgency=consultation`;
  };

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
      
      if (!token) {
        token = SessionManager.generateSessionToken();
      }
      
      setSessionToken(token);
      setIsInitialized(true);
    };

    initializeSession();
  }, [location]);

  // Fetch import intelligence data
  const { data: importIntelligence, isLoading, error } = useQuery({
    queryKey: ['import-intelligence', vehicleData.make, vehicleData.model, destination, sessionToken],
    queryFn: async () => {
      if (!vehicleData.make || !vehicleData.model || !sessionToken || !isInitialized) {
        return null;
      }

      console.log('Making import intelligence request with:', {
        vehicleData,
        destination,
        sessionToken
      });

      const response = await fetch('/api/import-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleData,
          destination,
          sessionToken
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      console.log('Import intelligence response:', data);
      return data;
    },
    enabled: !!(vehicleData.make && vehicleData.model && sessionToken && isInitialized),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getDestinationInfo = (dest: string) => {
    const destinations = {
      'australia': { name: 'Australia', flag: '🇦🇺' },
      'usa': { name: 'United States', flag: '🇺🇸' },
      'canada': { name: 'Canada', flag: '🇨🇦' },
      'uk': { name: 'United Kingdom', flag: '🇬🇧' },
      'new-zealand': { name: 'New Zealand', flag: '🇳🇿' }
    };
    return destinations[dest as keyof typeof destinations] || { name: dest, flag: '🌍' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'eligible': return 'bg-green-50 text-green-700 border-green-200';
      case 'conditional': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'restricted': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'prohibited': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const destInfo = getDestinationInfo(destination);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Building Your Import Intelligence</h2>
          <p className="text-gray-600">Analyzing eligibility, costs, and timeline for {vehicleData.make} {vehicleData.model}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Import Intelligence Error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Unable to Load Import Intelligence</h2>
          <p className="text-gray-600">API Error: {error?.message || 'Unknown error'}</p>
          <p className="text-gray-500 mt-2">Vehicle: {vehicleData.make} {vehicleData.model}</p>
          <p className="text-gray-500">Destination: {destination}</p>
        </div>
      </div>
    );
  }

  if (!importIntelligence && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">No Import Intelligence Data</h2>
          <p className="text-gray-600">Unable to generate analysis for this vehicle</p>
          <p className="text-gray-500 mt-2">Vehicle: {vehicleData.make} {vehicleData.model}</p>
          <p className="text-gray-500">Destination: {destination}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Clean Header */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {vehicleData.make} {vehicleData.model}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">{destInfo.flag}</span>
                  <span>Import to {destInfo.name}</span>
                </span>
                {vehicleData.chassis && (
                  <Badge variant="secondary" className="text-sm">
                    {vehicleData.chassis}
                  </Badge>
                )}
                {vehicleData.year && (
                  <Badge variant="outline" className="text-sm">
                    {vehicleData.year}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <Badge 
                variant={importIntelligence.eligibility?.status === 'eligible' ? 'default' : 'secondary'}
                className="text-base px-4 py-2 mb-2"
              >
                {importIntelligence.eligibility?.status?.toUpperCase() || 'CHECKING'}
              </Badge>
              <div className="text-sm text-gray-500">
                {importIntelligence.eligibility?.confidence}% confidence
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${importIntelligence.costs?.total?.toLocaleString() || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Timeline</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {importIntelligence.eligibility?.timeline || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Import Eligible Years</p>
                  <p className="text-lg font-bold text-gray-900">
                    {(() => {
                      const currentYear = new Date().getFullYear();
                      const eligibleYear = currentYear - 25;
                      return `${eligibleYear} and older`;
                    })()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">25-year rule applies</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Truck className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Shipping</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${importIntelligence.costs?.shipping?.toLocaleString() || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Intelligence & Next Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Live Auction Intelligence */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Live Auction Intelligence
              </CardTitle>
              <CardDescription>
                Real-time market data from authentic auction sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuctionIntelligenceDisplay 
                make={vehicleData.make} 
                model={vehicleData.model}
                year={vehicleData.year ? parseInt(vehicleData.year) : undefined}
              />
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-green-600" />
                Your Next Steps
              </CardTitle>
              <CardDescription>
                Ready to make this import happen?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  onClick={handleStartImportProcess}
                  className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  Start Import Process
                </Button>
                <Button 
                  onClick={handleGetProfessionalQuote}
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Get Professional Quote
                </Button>
                <Button 
                  onClick={handleConnectWithSpecialist}
                  variant="ghost" 
                  className="w-full text-purple-600 flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Connect with Specialist
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Import Process Timeline */}
        <Card className="bg-white mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Import Process Timeline
            </CardTitle>
            <CardDescription>
              Your step-by-step journey to importing this vehicle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {importIntelligence.timeline?.map((phase: any, index: number) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      phase.status === 'completed' ? 'bg-green-100 text-green-700' :
                      phase.status === 'current' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{phase.phase}</h4>
                    <p className="text-sm text-gray-600 mb-2">{phase.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {phase.duration}
                      </Badge>
                      <Badge variant={phase.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                        {phase.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Detailed Cost Breakdown
            </CardTitle>
            <CardDescription>
              Transparent pricing based on authentic market data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {importIntelligence.costs?.breakdown?.map((cost: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{cost.category}</p>
                    <p className="text-sm text-gray-600">{cost.description}</p>
                  </div>
                  <p className="font-bold text-gray-900">${cost.amount?.toLocaleString()}</p>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-gray-900">Total Import Cost</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${importIntelligence.costs?.total?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}