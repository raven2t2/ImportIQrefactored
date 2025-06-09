import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { MapPin, Phone, Globe, Star, Clock, DollarSign, CheckCircle } from 'lucide-react';

interface ModShop {
  id: number;
  businessName: string;
  phone?: string;
  email?: string;
  website?: string;
  streetAddress: string;
  city: string;
  stateProvince: string;
  country: string;
  latitude?: string;
  longitude?: string;
  servicesOffered: string[];
  specialties: string[];
  certifications: string[];
  customerRating?: string;
  reviewCount?: number;
  averageCostRange?: string;
  typicalTurnaroundDays?: number;
  verifiedPartner: boolean;
  distance?: number;
  matchScore?: number;
  estimatedCost?: { min: number; max: number; currency: string };
  estimatedTimeline?: { min: number; max: number; unit: string };
  recommendationReason?: string;
}

interface SearchFilters {
  services: string[];
  specialties: string[];
  minRating: number;
  maxDistance: number;
  urgency: 'standard' | 'urgent' | 'emergency';
}

export default function ShopLocator() {
  const [searchLocation, setSearchLocation] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState({
    make: '',
    model: '',
    year: '',
    originCountry: 'japan'
  });
  const [destinationCountry, setDestinationCountry] = useState('usa');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    services: [],
    specialties: [],
    minRating: 3.0,
    maxDistance: 50,
    urgency: 'standard'
  });
  const [searchMode, setSearchMode] = useState<'location' | 'zipcode' | 'import-match'>('zipcode');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const queryClient = useQueryClient();

  // Get available filters
  const { data: filtersData } = useQuery({
    queryKey: ['mod-shop-filters'],
    queryFn: () => fetch('/api/mod-shops/filters').then(res => res.json())
  });

  // Location-based search
  const locationSearchMutation = useMutation({
    mutationFn: (searchParams: any) => 
      fetch('/api/mod-shops/search/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      }).then(res => res.json()),
    onSuccess: (data) => {
      queryClient.setQueryData(['shop-search-results'], data);
    }
  });

  // ZIP code search
  const zipSearchMutation = useMutation({
    mutationFn: (searchParams: any) => 
      fetch('/api/mod-shops/search/zipcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      }).then(res => res.json()),
    onSuccess: (data) => {
      queryClient.setQueryData(['shop-search-results'], data);
    }
  });

  // Import requirements matching
  const importMatchMutation = useMutation({
    mutationFn: (matchParams: any) => 
      fetch('/api/mod-shops/match-import-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchParams)
      }).then(res => res.json()),
    onSuccess: (data) => {
      queryClient.setQueryData(['import-match-results'], data);
    }
  });

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Search functions
  const handleLocationSearch = () => {
    if (!userLocation) {
      getCurrentLocation();
      return;
    }

    locationSearchMutation.mutate({
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      radius: searchFilters.maxDistance,
      services: searchFilters.services,
      specialties: searchFilters.specialties,
      minRating: searchFilters.minRating,
      limit: 20
    });
  };

  const handleZipSearch = () => {
    if (!zipCode) return;

    zipSearchMutation.mutate({
      zipCode,
      radius: searchFilters.maxDistance,
      services: searchFilters.services,
      urgency: searchFilters.urgency
    });
  };

  const handleImportMatch = () => {
    if (!userLocation || !vehicleDetails.make || !vehicleDetails.model) {
      alert('Please provide your location and vehicle details for import matching');
      return;
    }

    importMatchMutation.mutate({
      customerLocation: userLocation,
      vehicleDetails: {
        ...vehicleDetails,
        year: parseInt(vehicleDetails.year) || new Date().getFullYear() - 10
      },
      destinationCountry,
      urgency: searchFilters.urgency
    });
  };

  // Get search results
  const searchResults = queryClient.getQueryData(['shop-search-results']) as any;
  const importResults = queryClient.getQueryData(['import-match-results']) as any;
  const shops = searchMode === 'import-match' ? importResults?.recommendations : searchResults?.shops;

  const renderShopCard = (shop: ModShop) => (
    <Card key={shop.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {shop.businessName}
              {shop.verifiedPartner && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified Partner
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" />
              {shop.streetAddress}, {shop.city}, {shop.stateProvince}
              {shop.distance && (
                <span className="ml-2 text-sm text-muted-foreground">
                  ({shop.distance.toFixed(1)} miles away)
                </span>
              )}
            </CardDescription>
          </div>
          {shop.customerRating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{parseFloat(shop.customerRating).toFixed(1)}</span>
              {shop.reviewCount && (
                <span className="text-sm text-muted-foreground">({shop.reviewCount})</span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Contact Information */}
          <div className="flex flex-wrap gap-4 text-sm">
            {shop.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <a href={`tel:${shop.phone}`} className="text-blue-600 hover:underline">
                  {shop.phone}
                </a>
              </div>
            )}
            {shop.website && (
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <a 
                  href={shop.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>

          {/* Services Offered */}
          {shop.servicesOffered && shop.servicesOffered.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Services Offered</h4>
              <div className="flex flex-wrap gap-1">
                {shop.servicesOffered.map((service, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Specialties */}
          {shop.specialties && shop.specialties.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Specialties</h4>
              <div className="flex flex-wrap gap-1">
                {shop.specialties.map((specialty, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {specialty.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Pricing and Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {shop.averageCostRange && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>Cost: ${shop.averageCostRange}</span>
              </div>
            )}
            {shop.typicalTurnaroundDays && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Turnaround: {shop.typicalTurnaroundDays} days</span>
              </div>
            )}
            {shop.matchScore && (
              <div className="flex items-center gap-1">
                <span>Match: {shop.matchScore}%</span>
              </div>
            )}
          </div>

          {/* Estimated costs for import matching */}
          {shop.estimatedCost && (
            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="font-medium mb-1">Estimated Service Cost</h4>
              <p className="text-sm">
                {shop.estimatedCost.currency} ${shop.estimatedCost.min.toLocaleString()} - ${shop.estimatedCost.max.toLocaleString()}
              </p>
              {shop.estimatedTimeline && (
                <p className="text-xs text-muted-foreground mt-1">
                  Timeline: {shop.estimatedTimeline.min}-{shop.estimatedTimeline.max} {shop.estimatedTimeline.unit}
                </p>
              )}
            </div>
          )}

          {/* Recommendation reason */}
          {shop.recommendationReason && (
            <div className="bg-green-50 p-3 rounded-md">
              <p className="text-sm text-green-800">{shop.recommendationReason}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              Get Quote
            </Button>
            <Button size="sm" variant="outline">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Local Import Specialists</h1>
        <p className="text-lg text-muted-foreground">
          Connect with qualified mod shops and compliance specialists near you
        </p>
      </div>

      {/* Search Mode Selection */}
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <Button
            variant={searchMode === 'zipcode' ? 'default' : 'outline'}
            onClick={() => setSearchMode('zipcode')}
          >
            Search by ZIP Code
          </Button>
          <Button
            variant={searchMode === 'location' ? 'default' : 'outline'}
            onClick={() => setSearchMode('location')}
          >
            Use My Location
          </Button>
          <Button
            variant={searchMode === 'import-match' ? 'default' : 'outline'}
            onClick={() => setSearchMode('import-match')}
          >
            Import Requirements Match
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Search & Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Location Input */}
              {searchMode === 'zipcode' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">ZIP Code</label>
                  <Input
                    placeholder="Enter ZIP code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </div>
              )}

              {searchMode === 'location' && (
                <div>
                  <Button onClick={getCurrentLocation} variant="outline" className="w-full">
                    <MapPin className="w-4 h-4 mr-2" />
                    Get Current Location
                  </Button>
                  {userLocation && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Location detected: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              )}

              {/* Vehicle Details for Import Matching */}
              {searchMode === 'import-match' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Vehicle Make</label>
                    <Input
                      placeholder="e.g., Toyota"
                      value={vehicleDetails.make}
                      onChange={(e) => setVehicleDetails(prev => ({ ...prev, make: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Vehicle Model</label>
                    <Input
                      placeholder="e.g., Supra"
                      value={vehicleDetails.model}
                      onChange={(e) => setVehicleDetails(prev => ({ ...prev, model: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Year</label>
                    <Input
                      placeholder="e.g., 1995"
                      value={vehicleDetails.year}
                      onChange={(e) => setVehicleDetails(prev => ({ ...prev, year: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Origin Country</label>
                    <Select value={vehicleDetails.originCountry} onValueChange={(value) => setVehicleDetails(prev => ({ ...prev, originCountry: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="japan">Japan</SelectItem>
                        <SelectItem value="germany">Germany</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="italy">Italy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Destination Country</label>
                    <Select value={destinationCountry} onValueChange={setDestinationCountry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usa">United States</SelectItem>
                        <SelectItem value="canada">Canada</SelectItem>
                        <SelectItem value="australia">Australia</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Search Distance */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Search Radius: {searchFilters.maxDistance} miles
                </label>
                <Slider
                  value={[searchFilters.maxDistance]}
                  onValueChange={(value) => setSearchFilters(prev => ({ ...prev, maxDistance: value[0] }))}
                  max={200}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Urgency */}
              <div>
                <label className="text-sm font-medium mb-2 block">Urgency</label>
                <Select value={searchFilters.urgency} onValueChange={(value: any) => setSearchFilters(prev => ({ ...prev, urgency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (1-2 weeks)</SelectItem>
                    <SelectItem value="urgent">Urgent (3-5 days)</SelectItem>
                    <SelectItem value="emergency">Emergency (Same day)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Minimum Rating: {searchFilters.minRating.toFixed(1)} stars
                </label>
                <Slider
                  value={[searchFilters.minRating]}
                  onValueChange={(value) => setSearchFilters(prev => ({ ...prev, minRating: value[0] }))}
                  max={5}
                  min={1}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Services Filter */}
              {filtersData?.filters?.services && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Required Services</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filtersData.filters.services.slice(0, 8).map((service: string) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={service}
                          checked={searchFilters.services.includes(service)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSearchFilters(prev => ({
                                ...prev,
                                services: [...prev.services, service]
                              }));
                            } else {
                              setSearchFilters(prev => ({
                                ...prev,
                                services: prev.services.filter(s => s !== service)
                              }));
                            }
                          }}
                        />
                        <label htmlFor={service} className="text-sm">
                          {service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Button */}
              <Button 
                onClick={() => {
                  if (searchMode === 'location') handleLocationSearch();
                  else if (searchMode === 'zipcode') handleZipSearch();
                  else handleImportMatch();
                }}
                className="w-full"
                disabled={
                  locationSearchMutation.isPending || 
                  zipSearchMutation.isPending || 
                  importMatchMutation.isPending
                }
              >
                {(locationSearchMutation.isPending || zipSearchMutation.isPending || importMatchMutation.isPending) 
                  ? 'Searching...' 
                  : 'Find Shops'
                }
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3">
          {shops && shops.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {searchMode === 'import-match' ? 'Import Specialists for Your Vehicle' : 'Nearby Shops'}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {shops.length} results found
                </span>
              </div>
              <div className="grid gap-4">
                {shops.map((shop: ModShop) => renderShopCard(shop))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Use the search panel to find qualified import specialists near you
                </p>
                {searchMode === 'import-match' && (
                  <p className="text-sm text-muted-foreground text-center">
                    Import matching will find shops specifically equipped to handle your vehicle's compliance requirements
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}