import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MapPin, 
  Route, 
  Search, 
  Zap, 
  Target, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Star,
  Navigation,
  Radar,
  BarChart3,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProximityResult {
  shopId: number;
  businessName: string;
  location: {
    driveTimeMinutes: number;
    distanceKm: number;
    routePolyline: string;
  };
  intelligence: {
    confidenceScore: number;
    availabilityStatus: string;
    serviceCapacity: number;
    estimatedCost: number;
  };
  traffic: any;
  recommendations: {
    optimal: boolean;
    available: boolean;
    preferred: boolean;
  };
}

interface GeospatialQuery {
  customerLocation: { lat: number; lng: number };
  vehicleType: string;
  requiredServices: string[];
  maxRadius: number;
  urgency: 'standard' | 'urgent' | 'emergency';
}

export default function EnterpriseGeospatial() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('proximity');
  const [searchQuery, setSearchQuery] = useState<GeospatialQuery>({
    customerLocation: { lat: -33.8688, lng: 151.2093 }, // Sydney default
    vehicleType: 'JDM Sports Car',
    requiredServices: ['turbo_installation', 'ecu_tuning'],
    maxRadius: 25,
    urgency: 'standard'
  });
  
  const [locationInput, setLocationInput] = useState('Sydney, NSW 2000');
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  // System status query
  const { data: systemStatus } = useQuery({
    queryKey: ['/api/geospatial/system-status'],
    refetchInterval: 30000
  });

  // Proximity search mutation
  const proximitySearch = useMutation({
    mutationFn: async (query: GeospatialQuery) => {
      const response = await fetch('/api/geospatial/proximity-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
      });
      if (!response.ok) throw new Error('Proximity search failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Proximity Search Complete",
        description: `Found ${data.results?.length || 0} optimal shops with ${data.metadata?.averageConfidence || 0}% confidence`,
      });
    },
    onError: (error) => {
      toast({
        title: "Search Failed",
        description: "Unable to complete proximity search. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Predictive routing mutation
  const predictiveRouting = useMutation({
    mutationFn: async (query: GeospatialQuery) => {
      const response = await fetch('/api/geospatial/predictive-routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
      });
      if (!response.ok) throw new Error('Predictive routing failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Route Optimization Complete",
        description: "Generated predictive routes with traffic analysis",
      });
    }
  });

  // Shop discovery mutation
  const shopDiscovery = useMutation({
    mutationFn: async (location: { lat: number; lng: number }) => {
      const response = await fetch('/api/geospatial/discover-shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, radius: 25000 })
      });
      if (!response.ok) throw new Error('Shop discovery failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Shop Discovery Complete",
        description: `Discovered ${data.discovery?.shopsFound || 0} new automotive businesses`,
      });
    }
  });

  // Market analysis mutation
  const marketAnalysis = useMutation({
    mutationFn: async (region: string) => {
      const response = await fetch('/api/geospatial/market-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region, analysisType: 'competition' })
      });
      if (!response.ok) throw new Error('Market analysis failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Market Analysis Complete",
        description: "Generated competitive intelligence report",
      });
    }
  });

  // Geocode location input
  const geocodeLocation = async () => {
    if (!locationInput.trim()) return;
    
    setIsGeocoding(true);
    try {
      const response = await fetch(`/api/maps-enhanced/geocode?address=${encodeURIComponent(locationInput)}`);
      const data = await response.json();
      
      if (data.success && data.coordinates) {
        setSearchQuery(prev => ({
          ...prev,
          customerLocation: {
            lat: data.coordinates.lat,
            lng: data.coordinates.lng
          }
        }));
        toast({
          title: "Location Found",
          description: `Updated search location to ${data.formattedAddress || locationInput}`,
        });
      }
    } catch (error) {
      toast({
        title: "Geocoding Failed",
        description: "Unable to find location. Please try a different address.",
        variant: "destructive"
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleProximitySearch = () => {
    proximitySearch.mutate(searchQuery);
  };

  const handlePredictiveRouting = () => {
    predictiveRouting.mutate(searchQuery);
  };

  const handleShopDiscovery = () => {
    shopDiscovery.mutate(searchQuery.customerLocation);
  };

  const handleMarketAnalysis = () => {
    const region = locationInput.split(',')[0].trim(); // Extract city/region
    marketAnalysis.mutate(region);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Enterprise Geospatial Intelligence
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Advanced PostGIS-powered Google Maps integration with intelligent proximity matching, 
            predictive routing, and real-time capacity intelligence
          </p>
        </div>

        {/* System Status */}
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              System Status & Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Badge variant={systemStatus?.system?.postgisEnabled ? "default" : "secondary"}>
                  PostGIS {systemStatus?.system?.postgisEnabled ? "Active" : "Inactive"}
                </Badge>
                <p className="text-xs text-gray-500 mt-1">Spatial Database</p>
              </div>
              <div className="text-center">
                <Badge variant={systemStatus?.system?.googleMapsIntegration ? "default" : "secondary"}>
                  Google Maps {systemStatus?.system?.googleMapsIntegration ? "Connected" : "Disconnected"}
                </Badge>
                <p className="text-xs text-gray-500 mt-1">API Integration</p>
              </div>
              <div className="text-center">
                <Badge variant={systemStatus?.system?.spatialIndexes === 'active' ? "default" : "secondary"}>
                  Spatial Indexes {systemStatus?.system?.spatialIndexes === 'active' ? "Active" : "Inactive"}
                </Badge>
                <p className="text-xs text-gray-500 mt-1">Performance</p>
              </div>
              <div className="text-center">
                <Badge variant={systemStatus?.system?.realTimeCapacity === 'operational' ? "default" : "secondary"}>
                  Real-time Intel {systemStatus?.system?.realTimeCapacity === 'operational' ? "Operational" : "Offline"}
                </Badge>
                <p className="text-xs text-gray-500 mt-1">Capacity Tracking</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Input */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Global Location Input
            </CardTitle>
            <CardDescription>
              Enter any location worldwide - cities, postal codes, or full addresses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="location">Customer Location</Label>
                <Input
                  id="location"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="Sydney NSW 2000, 90210, Toronto M5V 3A8, London SW1A 1AA"
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={geocodeLocation} 
                disabled={isGeocoding}
                className="mt-6"
              >
                {isGeocoding ? "Locating..." : "Update Location"}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Input
                  id="vehicleType"
                  value={searchQuery.vehicleType}
                  onChange={(e) => setSearchQuery(prev => ({ ...prev, vehicleType: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxRadius">Search Radius (km)</Label>
                <Input
                  id="maxRadius"
                  type="number"
                  value={searchQuery.maxRadius}
                  onChange={(e) => setSearchQuery(prev => ({ ...prev, maxRadius: parseInt(e.target.value) || 25 }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="urgency">Urgency Level</Label>
                <select
                  id="urgency"
                  value={searchQuery.urgency}
                  onChange={(e) => setSearchQuery(prev => ({ ...prev, urgency: e.target.value as any }))}
                  className="mt-1 w-full p-2 border rounded-md"
                >
                  <option value="standard">Standard</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div className="flex items-end">
                <Badge variant="outline">
                  Lat: {searchQuery.customerLocation.lat.toFixed(4)}, 
                  Lng: {searchQuery.customerLocation.lng.toFixed(4)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enterprise Features Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="proximity" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Proximity Search
            </TabsTrigger>
            <TabsTrigger value="routing" className="flex items-center gap-2">
              <Route className="h-4 w-4" />
              Predictive Routing
            </TabsTrigger>
            <TabsTrigger value="discovery" className="flex items-center gap-2">
              <Radar className="h-4 w-4" />
              Shop Discovery
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Market Analysis
            </TabsTrigger>
          </TabsList>

          {/* Intelligent Proximity Matching */}
          <TabsContent value="proximity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Intelligent Proximity Matching
                </CardTitle>
                <CardDescription>
                  PostGIS spatial queries with Google Distance Matrix API for precise shop selection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleProximitySearch}
                  disabled={proximitySearch.isPending}
                  className="w-full"
                  size="lg"
                >
                  {proximitySearch.isPending ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-spin" />
                      Searching {searchQuery.maxRadius}km radius...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Find Optimal Shops
                    </>
                  )}
                </Button>

                {proximitySearch.data?.success && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {proximitySearch.data.results?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Shops Found</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {proximitySearch.data.metadata?.averageConfidence || 0}%
                        </div>
                        <div className="text-sm text-gray-600">Avg Confidence</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {proximitySearch.data.metadata?.searchTechnology?.split('_').pop() || 'Advanced'}
                        </div>
                        <div className="text-sm text-gray-600">Technology</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {proximitySearch.data.results?.slice(0, 5).map((shop: ProximityResult, index: number) => (
                        <div key={shop.shopId} className="border rounded-lg p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{shop.businessName}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {shop.location.driveTimeMinutes} min
                                </span>
                                <span className="flex items-center gap-1">
                                  <Navigation className="h-3 w-3" />
                                  {shop.location.distanceKm} km
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  ${shop.intelligence.estimatedCost}
                                </span>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <Badge variant={shop.intelligence.confidenceScore > 0.8 ? "default" : "secondary"}>
                                {Math.round(shop.intelligence.confidenceScore * 100)}% confidence
                              </Badge>
                              <div className="text-xs text-gray-500">
                                {shop.intelligence.serviceCapacity}% capacity
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {shop.recommendations.optimal && (
                              <Badge variant="default" className="text-xs">Optimal</Badge>
                            )}
                            {shop.recommendations.available && (
                              <Badge variant="outline" className="text-xs">Available</Badge>
                            )}
                            {shop.recommendations.preferred && (
                              <Badge variant="secondary" className="text-xs">Preferred</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predictive Routing */}
          <TabsContent value="routing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5 text-green-600" />
                  Predictive Routing Engine
                </CardTitle>
                <CardDescription>
                  Google Roads API with traffic pattern analysis and route optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handlePredictiveRouting}
                  disabled={predictiveRouting.isPending}
                  className="w-full"
                  size="lg"
                >
                  {predictiveRouting.isPending ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing traffic patterns...
                    </>
                  ) : (
                    <>
                      <Route className="h-4 w-4 mr-2" />
                      Generate Optimal Routes
                    </>
                  )}
                </Button>

                {predictiveRouting.data?.success && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Primary Route</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-medium">{predictiveRouting.data.routing.primary.businessName}</div>
                          <div className="text-gray-600">Recommended Shop</div>
                        </div>
                        <div>
                          <div className="font-medium">{predictiveRouting.data.routing.primary.totalTime} min</div>
                          <div className="text-gray-600">Drive Time</div>
                        </div>
                        <div>
                          <div className="font-medium">${predictiveRouting.data.routing.primary.estimatedCost}</div>
                          <div className="text-gray-600">Est. Cost</div>
                        </div>
                        <div>
                          <div className="font-medium">{Math.round(predictiveRouting.data.routing.primary.confidence * 100)}%</div>
                          <div className="text-gray-600">Confidence</div>
                        </div>
                      </div>
                    </div>

                    {predictiveRouting.data.routing.alternatives?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Alternative Routes</h4>
                        {predictiveRouting.data.routing.alternatives.map((alt: any, index: number) => (
                          <div key={index} className="border rounded p-3 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium">{alt.businessName}</span>
                              <span className="text-gray-600">{alt.timeComparison}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automated Shop Discovery */}
          <TabsContent value="discovery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radar className="h-5 w-5 text-orange-600" />
                  Automated Shop Discovery
                </CardTitle>
                <CardDescription>
                  Google Places API with AI-powered suitability analysis for new partner recruitment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleShopDiscovery}
                  disabled={shopDiscovery.isPending}
                  className="w-full"
                  size="lg"
                >
                  {shopDiscovery.isPending ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-spin" />
                      Scanning 25km radius...
                    </>
                  ) : (
                    <>
                      <Radar className="h-4 w-4 mr-2" />
                      Discover New Shops
                    </>
                  )}
                </Button>

                {shopDiscovery.data?.success && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {shopDiscovery.data.discovery?.shopsFound || 0}
                        </div>
                        <div className="text-sm text-gray-600">Total Found</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {shopDiscovery.data.discovery?.highQualityShops || 0}
                        </div>
                        <div className="text-sm text-gray-600">High Quality</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {shopDiscovery.data.recommendations?.highPriority?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">High Priority</div>
                      </div>
                    </div>

                    {shopDiscovery.data.recommendations?.highPriority?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">High Priority Prospects</h4>
                        {shopDiscovery.data.recommendations.highPriority.slice(0, 3).map((shopName: string, index: number) => (
                          <div key={index} className="border rounded p-3 flex justify-between items-center">
                            <span className="font-medium">{shopName}</span>
                            <Badge variant="default">Contact Recommended</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Intelligence */}
          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-red-600" />
                  Competitive Market Analysis
                </CardTitle>
                <CardDescription>
                  PostGIS spatial analysis with competitive intelligence and market opportunity assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleMarketAnalysis}
                  disabled={marketAnalysis.isPending}
                  className="w-full"
                  size="lg"
                >
                  {marketAnalysis.isPending ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing market dynamics...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Analyze Market Competition
                    </>
                  )}
                </Button>

                {marketAnalysis.data?.success && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-2">Competition Level</h4>
                        <div className="text-2xl font-bold text-red-600">
                          {marketAnalysis.data.marketIntelligence?.competition?.level || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {marketAnalysis.data.marketIntelligence?.competition?.density || 'Market analysis'}
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Growth Potential</h4>
                        <div className="text-2xl font-bold text-green-600">
                          {marketAnalysis.data.marketIntelligence?.insights?.growthPotential || 'Moderate'}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Investment opportunity
                        </div>
                      </div>
                    </div>

                    {marketAnalysis.data.marketIntelligence?.recommendations?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Strategic Recommendations</h4>
                        <div className="space-y-2">
                          {marketAnalysis.data.marketIntelligence.recommendations.map((rec: string, index: number) => (
                            <div key={index} className="border-l-4 border-blue-500 pl-3 py-2">
                              <span className="text-sm">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Technology Differentiators */}
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              Enterprise Technology Stack
            </CardTitle>
            <CardDescription>
              Advanced capabilities that set ImportIQ apart from competitors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemStatus?.differentiators?.map((diff: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Star className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                  <span className="text-sm">{diff}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}