import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Ship, Clock, DollarSign, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface PortRecommendation {
  portName: string;
  portCode: string;
  country: string;
  location: string;
  coordinates: { lat: number; lng: number };
  distanceFromUser: number;
  estimatedCost: number;
  processingTime: string;
  specializations: string[];
  advantages: string[];
}

interface ShippingRoute {
  originPort: string;
  destinationPort: string;
  transitTime: string;
  estimatedCost: number;
  shippingLines: string[];
  frequency: string;
  routeType: 'direct' | 'transshipment';
}

interface ComplianceRequirement {
  region: string;
  requirements: string[];
  localAgents: Array<{
    name: string;
    services: string[];
    location: string;
    distance: number;
    rating: number;
  }>;
  estimatedTimeframe: string;
  totalCost: number;
}

interface ImportJourney {
  vehicle: {
    make: string;
    model: string;
    year: number;
    origin: string;
  };
  destination: {
    location: string;
    region: string;
  };
  recommendations: {
    ports: PortRecommendation[];
    shipping: ShippingRoute[];
    compliance: ComplianceRequirement;
  };
  summary: {
    estimatedTotalCost: number;
    estimatedTimeframe: string;
    recommendedPort: string;
    nextSteps: string[];
  };
}

export default function ImportJourneyIntelligence() {
  const [userLocation, setUserLocation] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState({
    make: 'Toyota',
    model: 'Supra',
    year: '1995',
    origin: 'Japan'
  });
  const [searchTriggered, setSearchTriggered] = useState(false);

  // Enhanced Google Maps integration for comprehensive journey planning
  const { data: journeyData, isLoading } = useQuery({
    queryKey: ['/api/maps-enhanced/journey/complete', userLocation, vehicleDetails],
    enabled: searchTriggered && userLocation.length > 2,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      // Use enhanced Google Maps services for complete journey intelligence
      const [portsData, businessesData, complianceData] = await Promise.all([
        fetch(`/api/maps-enhanced/shipping/ports?origin=${vehicleDetails.origin}&destination=${userLocation}`).then(r => r.json()),
        fetch(`/api/maps-enhanced/businesses/search?location=${userLocation}&type=automotive&radius=100000`).then(r => r.json()),
        fetch(`/api/maps-enhanced/compliance/facilities?location=${userLocation}&type=inspection`).then(r => r.json())
      ]);

      return {
        journey: {
          vehicle: vehicleDetails,
          destination: { location: userLocation, region: 'Auto-detected' },
          recommendations: {
            ports: portsData.ports || [],
            businesses: businessesData.businesses || [],
            compliance: complianceData.facilities || []
          }
        }
      };
    }
  });

  const handleSearch = () => {
    if (userLocation.trim()) {
      setSearchTriggered(true);
    }
  };

  const journey = journeyData?.journey as ImportJourney | undefined;

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Smart Import Journey Intelligence
          </CardTitle>
          <CardDescription>
            Get personalized port recommendations, shipping routes, and compliance requirements based on your exact location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Your Location</label>
              <Input
                placeholder="Enter your city, postal code, or address"
                value={userLocation}
                onChange={(e) => setUserLocation(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Make</label>
                <Input
                  value={vehicleDetails.make}
                  onChange={(e) => setVehicleDetails(prev => ({ ...prev, make: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Model</label>
                <Input
                  value={vehicleDetails.model}
                  onChange={(e) => setVehicleDetails(prev => ({ ...prev, model: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Year</label>
              <Input
                value={vehicleDetails.year}
                onChange={(e) => setVehicleDetails(prev => ({ ...prev, year: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Origin Country</label>
              <Input
                value={vehicleDetails.origin}
                onChange={(e) => setVehicleDetails(prev => ({ ...prev, origin: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          <Button 
            onClick={handleSearch} 
            className="w-full"
            disabled={!userLocation.trim() || isLoading}
          >
            {isLoading ? 'Analyzing Import Journey...' : 'Get Smart Recommendations'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {journey && (
        <div className="space-y-6">
          {/* Summary Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Import Journey Summary</CardTitle>
              <CardDescription>
                {journey.vehicle.make} {journey.vehicle.model} ({journey.vehicle.year}) from {journey.vehicle.origin} to {journey.destination.location}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">${journey.summary.estimatedTotalCost?.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Estimated Cost</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{journey.summary.estimatedTimeframe}</p>
                    <p className="text-sm text-muted-foreground">Total Timeline</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Ship className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-lg font-bold">{journey.summary.recommendedPort}</p>
                    <p className="text-sm text-muted-foreground">Recommended Port</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="ports" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ports">Port Recommendations</TabsTrigger>
              <TabsTrigger value="shipping">Shipping Routes</TabsTrigger>
              <TabsTrigger value="compliance">Compliance & Agents</TabsTrigger>
            </TabsList>

            {/* Port Recommendations */}
            <TabsContent value="ports" className="space-y-4">
              <div className="grid gap-4">
                {journey.recommendations.ports.map((port, index) => (
                  <Card key={port.portCode} className={index === 0 ? 'border-blue-500 bg-blue-50/50' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {port.portName}
                            {index === 0 && <Badge variant="default">Recommended</Badge>}
                          </CardTitle>
                          <CardDescription>{port.location}</CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${port.estimatedCost}</p>
                          <p className="text-sm text-muted-foreground">{port.distanceFromUser}km away</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">Processing time: {port.processingTime}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Specializations:</p>
                          <div className="flex flex-wrap gap-1">
                            {port.specializations.map((spec) => (
                              <Badge key={spec} variant="secondary">{spec}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Key Advantages:</p>
                          <ul className="text-sm space-y-1">
                            {port.advantages.map((advantage, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                {advantage}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Shipping Routes */}
            <TabsContent value="shipping" className="space-y-4">
              <div className="grid gap-4">
                {journey.recommendations.shipping.map((route, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Ship className="h-5 w-5" />
                        {route.originPort} → {route.destinationPort}
                      </CardTitle>
                      <CardDescription>
                        <Badge variant={route.routeType === 'direct' ? 'default' : 'secondary'}>
                          {route.routeType}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium">Transit Time</p>
                          <p className="text-lg">{route.transitTime}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Cost</p>
                          <p className="text-lg font-bold">${route.estimatedCost}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Frequency</p>
                          <p className="text-lg">{route.frequency}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Shipping Lines</p>
                          <div className="flex flex-wrap gap-1">
                            {route.shippingLines.map((line) => (
                              <Badge key={line} variant="outline" className="text-xs">{line}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Compliance & Local Agents */}
            <TabsContent value="compliance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {journey.recommendations.compliance.region} Requirements
                  </CardTitle>
                  <CardDescription>
                    Estimated timeframe: {journey.recommendations.compliance.estimatedTimeframe} | 
                    Total cost: ${journey.recommendations.compliance.totalCost}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium mb-3">Required Documentation & Steps:</p>
                      <div className="space-y-2">
                        {journey.recommendations.compliance.requirements.map((req, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                            <span className="text-sm">{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Local Service Providers */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recommended Local Agents</h3>
                {journey.recommendations.compliance.localAgents.map((agent, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                          <CardDescription>{agent.location}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-bold">{agent.rating}</span>
                            <span className="text-yellow-500">★</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{agent.distance}km away</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <p className="text-sm font-medium mb-2">Services Offered:</p>
                        <div className="flex flex-wrap gap-1">
                          {agent.services.map((service) => (
                            <Badge key={service} variant="outline">{service}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}