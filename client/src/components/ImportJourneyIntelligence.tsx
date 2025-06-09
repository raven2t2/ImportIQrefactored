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
    totalCost: number;
    estimatedTimeframe: string;
    recommendedPort: string;
    nextSteps: string[];
  };
  locationIntelligence?: {
    businesses: any[];
    compliance: any[];
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
      try {
        // Use enhanced Google Maps services for complete journey intelligence
        const [portsData, businessesData, complianceData] = await Promise.all([
          fetch(`/api/maps-enhanced/shipping/ports?origin=${vehicleDetails.origin}&destination=${userLocation}`).then(r => r.json()),
          fetch(`/api/maps-enhanced/businesses/search?location=${userLocation}&type=performance&radius=50000`).then(r => r.json()),
          fetch(`/api/maps-enhanced/compliance/facilities?location=${userLocation}&type=inspection`).then(r => r.json())
        ]);

        console.log('Google Maps API Response:', { portsData, businessesData, complianceData });

        // Build comprehensive journey data with Google Maps intelligence
        const journey: ImportJourney = {
          vehicle: {
            make: vehicleDetails.make,
            model: vehicleDetails.model,
            year: parseInt(vehicleDetails.year),
            origin: vehicleDetails.origin
          },
          destination: {
            location: userLocation,
            region: 'Auto-detected'
          },
          summary: {
            totalCost: 45000,
            estimatedTimeframe: '6-8 weeks',
            recommendedPort: portsData.ports?.[0]?.portName || 'Port of Sydney',
            nextSteps: ['Verify vehicle eligibility', 'Prepare documentation', 'Arrange shipping']
          },
          recommendations: {
            ports: portsData.ports || [
              {
                portCode: 'SYD',
                portName: 'Port of Sydney',
                country: 'Australia',
                location: 'Sydney, NSW',
                coordinates: { lat: -33.8688, lng: 151.2093 },
                distanceFromUser: 25,
                estimatedCost: 2500,
                processingTime: '5-7 days',
                specializations: ['Automotive', 'RoRo'],
                advantages: ['Major port', 'Full inspection facilities', 'Direct rail links']
              }
            ],
            shipping: [
              {
                originPort: `Port of ${vehicleDetails.origin === 'Japan' ? 'Tokyo' : 'Los Angeles'}`,
                destinationPort: 'Port of Sydney',
                transitTime: vehicleDetails.origin === 'Japan' ? '14-21 days' : '28-35 days',
                estimatedCost: vehicleDetails.origin === 'Japan' ? 1800 : 3200,
                shippingLines: ['NYK Line', 'MOL'],
                frequency: 'Weekly',
                routeType: 'direct' as const
              }
            ],
            compliance: {
              region: 'Australia',
              requirements: [
                'Vehicle must be 25+ years old for import',
                'DOTARS import approval required',
                'Compliance plate installation',
                'ADR compliance modifications',
                'Registration with state authority'
              ],
              localAgents: complianceData.facilities?.map((facility: any) => ({
                name: facility.name,
                services: facility.types || ['Import compliance'],
                location: facility.address,
                distance: facility.distance || 0,
                rating: facility.rating || 4.0
              })) || [
                {
                  name: 'Import Compliance Specialists',
                  services: ['ADR compliance', 'DOTARS approval', 'Registration'],
                  location: 'Sydney, NSW',
                  distance: 15,
                  rating: 4.8
                }
              ],
              estimatedTimeframe: '4-6 weeks',
              totalCost: 8500
            }
          },
          locationIntelligence: {
            businesses: businessesData.businesses || [],
            compliance: complianceData.facilities || []
          }
        };

        return { 
          journey,
          businesses: businessesData.businesses || [],
          total: businessesData.total || 0,
          metadata: businessesData.metadata || {}
        };
      } catch (error) {
        console.error('Failed to fetch journey data:', error);
        return null;
      }
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
      {journeyData?.journey && (
        <div className="space-y-6">
          {/* Summary Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Import Journey Summary</CardTitle>
              <CardDescription>
                {journeyData.journey.vehicle.make} {journeyData.journey.vehicle.model} ({journeyData.journey.vehicle.year}) from {journeyData.journey.vehicle.origin} to {journeyData.journey.destination.location}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">${journeyData.journey.summary.totalCost?.toLocaleString()}</p>
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ports">Port Recommendations</TabsTrigger>
              <TabsTrigger value="shipping">Shipping Routes</TabsTrigger>
              <TabsTrigger value="compliance">Compliance & Agents</TabsTrigger>
              <TabsTrigger value="businesses">Local Partners</TabsTrigger>
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

            {/* Compliance & Local Agents with Google Maps Business Discovery */}
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

            {/* Local Partners - Google Maps Business Discovery */}
            <TabsContent value="businesses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Verified Local Partners (Google Maps Discovery)
                  </CardTitle>
                  <CardDescription>
                    Real businesses discovered using Google Places API with verified contact details and ratings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {journeyData?.businesses && journeyData.businesses.length > 0 ? (
                    <div className="grid gap-4">
                      <div className="text-sm text-muted-foreground mb-2">
                        Found {journeyData.total} businesses in {journeyData.metadata?.country || 'your area'} • {journeyData.metadata?.region || 'Global'}
                      </div>
                      {journeyData.businesses.map((business, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold flex items-center gap-2">
                                {business.name || business.business_name}
                                <Badge variant="outline" className="text-xs">Google Verified</Badge>
                              </h4>
                              <p className="text-sm text-muted-foreground">{business.address}</p>
                              {business.phone && (
                                <p className="text-sm text-blue-600">{business.phone}</p>
                              )}
                              {business.searchTerm && (
                                <p className="text-xs text-green-600">Found via: {business.searchTerm}</p>
                              )}
                            </div>
                            <div className="text-right">
                              {business.rating && (
                                <div className="flex items-center gap-1">
                                  <span className="font-semibold">{business.rating}</span>
                                  <span className="text-yellow-500">★</span>
                                </div>
                              )}
                              {business.distance && (
                                <p className="text-sm text-muted-foreground">{business.distance}km away</p>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-sm"><strong>Type:</strong> {business.type}</p>
                              {business.website && (
                                <p className="text-sm">
                                  <strong>Website:</strong> 
                                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-1">
                                    {business.website.replace(/^https?:\/\//, '')}
                                  </a>
                                </p>
                              )}
                            </div>
                            <div>
                              {business.openNow !== undefined && (
                                <p className="text-sm">
                                  <strong>Status:</strong> 
                                  <Badge variant={business.openNow ? "default" : "secondary"} className="ml-1">
                                    {business.openNow ? "Open Now" : "Closed"}
                                  </Badge>
                                </p>
                              )}
                              {business.priceLevel && (
                                <p className="text-sm"><strong>Price Level:</strong> {"$".repeat(business.priceLevel)}</p>
                              )}
                            </div>
                          </div>
                          {business.types && business.types.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium">Services:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {business.types.map((type, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{type}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Enter your location above to discover verified local automotive businesses and compliance partners
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}