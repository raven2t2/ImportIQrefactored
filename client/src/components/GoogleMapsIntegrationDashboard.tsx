import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Ship, Search, Navigation, Building2, FileCheck, Globe, Star, Phone, ExternalLink } from 'lucide-react';

interface GoogleMapsBusiness {
  id: string;
  name: string;
  business_name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  types: string[];
  reviews?: Array<{
    rating: number;
    text: string;
  }>;
}

interface OptimalPort {
  name: string;
  coords: { lat: number; lng: number };
  distanceToDestination: number;
}

interface ComplianceFacility {
  name: string;
  address: string;
  rating?: number;
  distance_km: number;
  place_id: string;
  types: string[];
}

export default function GoogleMapsIntegrationDashboard() {
  const [searchLocation, setSearchLocation] = useState('');
  const [businessType, setBusinessType] = useState('performance');
  const [originCountry, setOriginCountry] = useState('japan');
  const [activeTab, setActiveTab] = useState('businesses');

  // Real automotive businesses using Google Places API
  const { data: businessData, isLoading: businessLoading, refetch: refetchBusinesses } = useQuery({
    queryKey: ['/api/maps-enhanced/businesses/search', searchLocation, businessType],
    enabled: searchLocation.length > 2,
    refetchOnWindowFocus: false
  });

  // Optimal shipping ports using Google Maps geocoding
  const { data: portsData, isLoading: portsLoading, refetch: refetchPorts } = useQuery({
    queryKey: ['/api/maps-enhanced/shipping/ports', originCountry, searchLocation],
    enabled: searchLocation.length > 2,
    refetchOnWindowFocus: false
  });

  // Compliance facilities using Google Places API
  const { data: complianceData, isLoading: complianceLoading, refetch: refetchCompliance } = useQuery({
    queryKey: ['/api/maps-enhanced/compliance/facilities', searchLocation, 'inspection'],
    enabled: searchLocation.length > 2,
    refetchOnWindowFocus: false
  });

  const handleSearch = () => {
    if (searchLocation.trim()) {
      refetchBusinesses();
      refetchPorts();
      refetchCompliance();
    }
  };

  const businesses = businessData?.businesses as GoogleMapsBusiness[] || [];
  const ports = portsData?.ports as OptimalPort[] || [];
  const facilities = complianceData?.facilities as ComplianceFacility[] || [];

  return (
    <div className="space-y-6">
      {/* Google Maps API Integration Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Google Maps API Integration Dashboard
          </CardTitle>
          <CardDescription>
            Comprehensive location intelligence powered by Google Maps Places API, Geocoding API, and Directions API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Search Location</label>
              <Input
                placeholder="Enter city, address, or region (e.g., London, UK)"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="w-48">
              <label className="text-sm font-medium mb-2 block">Business Type</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
              >
                <option value="performance">Performance Shops</option>
                <option value="jdm">JDM Specialists</option>
                <option value="tuning">Tuning Centers</option>
                <option value="modification">Modification Shops</option>
              </select>
            </div>
            <div className="w-32">
              <label className="text-sm font-medium mb-2 block">Origin</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={originCountry}
                onChange={(e) => setOriginCountry(e.target.value)}
              >
                <option value="japan">Japan</option>
                <option value="usa">USA</option>
              </select>
            </div>
            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Google Maps Results Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="businesses" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Real Businesses ({businesses.length})
          </TabsTrigger>
          <TabsTrigger value="ports" className="flex items-center gap-2">
            <Ship className="h-4 w-4" />
            Optimal Ports ({ports.length})
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Compliance Facilities ({facilities.length})
          </TabsTrigger>
        </TabsList>

        {/* Real Automotive Businesses from Google Places API */}
        <TabsContent value="businesses">
          <Card>
            <CardHeader>
              <CardTitle>Authentic Automotive Businesses</CardTitle>
              <CardDescription>
                Real businesses discovered using Google Places API with verified locations and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {businessLoading ? (
                <div className="text-center py-8">Searching Google Places API...</div>
              ) : businesses.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {businesses.map((business, index) => (
                    <Card key={business.id || index} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{business.name}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">{business.address}</p>
                          </div>
                          {business.rating && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {business.rating}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {/* Business Types */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {business.types.slice(0, 3).map((type, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {type.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-2">
                          {business.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span>{business.phone}</span>
                            </div>
                          )}
                          {business.website && (
                            <div className="flex items-center gap-2 text-sm">
                              <ExternalLink className="h-4 w-4 text-gray-500" />
                              <a 
                                href={business.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline truncate"
                              >
                                {business.website.replace(/^https?:\/\//, '')}
                              </a>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>
                              {business.coordinates.lat.toFixed(4)}, {business.coordinates.lng.toFixed(4)}
                            </span>
                          </div>
                        </div>

                        {/* Customer Reviews */}
                        {business.reviews && business.reviews.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-medium text-gray-700 mb-2">Recent Review:</p>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              "{business.reviews[0].text}"
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : searchLocation ? (
                <div className="text-center py-8 text-gray-500">
                  No authentic businesses found in this location. Try a different search area.
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Enter a location to discover real automotive businesses using Google Maps
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimal Shipping Ports */}
        <TabsContent value="ports">
          <Card>
            <CardHeader>
              <CardTitle>Optimal Shipping Ports</CardTitle>
              <CardDescription>
                Port recommendations based on Google Maps distance calculations from origin to destination
              </CardDescription>
            </CardHeader>
            <CardContent>
              {portsLoading ? (
                <div className="text-center py-8">Calculating optimal routes...</div>
              ) : ports.length > 0 ? (
                <div className="space-y-4">
                  {ports.map((port, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{port.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {port.coords.lat.toFixed(4)}, {port.coords.lng.toFixed(4)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Navigation className="h-3 w-3" />
                              {port.distanceToDestination.toLocaleString()}km
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">Distance to destination</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : searchLocation ? (
                <div className="text-center py-8 text-gray-500">
                  No optimal ports found for this route configuration.
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Enter a destination to calculate optimal shipping routes
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Facilities */}
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance & Inspection Facilities</CardTitle>
              <CardDescription>
                Government and certified facilities for vehicle compliance, discovered via Google Places API
              </CardDescription>
            </CardHeader>
            <CardContent>
              {complianceLoading ? (
                <div className="text-center py-8">Finding compliance facilities...</div>
              ) : facilities.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {facilities.map((facility, index) => (
                    <Card key={facility.place_id || index} className="border-l-4 border-l-purple-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold">{facility.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{facility.address}</p>
                          </div>
                          {facility.rating && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {facility.rating}
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {facility.types.slice(0, 3).map((type, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {type.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Navigation className="h-4 w-4 text-gray-500" />
                          <span>{facility.distance_km}km away</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : searchLocation ? (
                <div className="text-center py-8 text-gray-500">
                  No compliance facilities found in this area.
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Enter a location to find nearby compliance and inspection facilities
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}