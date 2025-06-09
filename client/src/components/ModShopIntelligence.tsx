import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Wrench, Star, Globe, Phone, ExternalLink, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ModShop {
  id: number;
  name: string;
  business_name: string;
  contact_person: string;
  email: string;
  phone: string;
  description: string;
  website: string;
  location: string;
  address: string;
  country: string;
  specialty: string;
  services_offered: string[];
  years_in_business: number;
  certifications: string[];
  average_rating: number;
  distance_km?: number;
  is_active: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface ModShopIntelligenceProps {
  vehicleMake: string;
  vehicleModel: string;
  destination: string;
}

export function ModShopIntelligence({ vehicleMake, vehicleModel, destination }: ModShopIntelligenceProps) {
  const [userLocation, setUserLocation] = useState('');
  const [locationSearch, setLocationSearch] = useState('');

  // Determine specialty based on vehicle make
  const getVehicleSpecialty = (make: string) => {
    const makeLower = make.toLowerCase();
    if (['nissan', 'toyota', 'honda', 'mazda', 'subaru', 'mitsubishi'].includes(makeLower)) {
      return 'JDM';
    }
    if (['bmw', 'mercedes', 'audi', 'volkswagen', 'porsche'].includes(makeLower)) {
      return 'European';
    }
    return 'Performance';
  };

  const specialty = getVehicleSpecialty(vehicleMake);

  // Fetch recommended mod shops using authentic business data with Google Maps integration
  const { data: recommendedShops, isLoading: loadingRecommended } = useQuery({
    queryKey: ['/api/authentic-shops/nearby', specialty, locationSearch],
    queryFn: async () => {
      if (!locationSearch) {
        // Get all authentic shops and filter by specialty
        const response = await fetch(`/api/authentic-shops/all?specialty=${specialty}&limit=3`);
        if (!response.ok) throw new Error('Failed to fetch authentic shops');
        return response.json();
      }
      
      // Use Google Maps API for precise location-based search with authentic businesses
      const url = `/api/authentic-shops/nearby?location=${encodeURIComponent(locationSearch)}&specialty=${specialty}&radius=200&limit=5`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch nearby authentic shops');
      return response.json();
    }
  });

  // Fetch all authentic shops for comprehensive listing
  const { data: allShops, isLoading: loadingAll } = useQuery({
    queryKey: ['/api/authentic-shops/all', locationSearch],
    queryFn: async () => {
      let url = '/api/authentic-shops/all?limit=10';
      if (locationSearch) {
        // For authentic shops, we filter by location using Google Maps geocoding
        const nearbyUrl = `/api/authentic-shops/nearby?location=${encodeURIComponent(locationSearch)}&radius=500&limit=10`;
        const response = await fetch(nearbyUrl);
        if (!response.ok) throw new Error('Failed to fetch authentic shops');
        return response.json();
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch authentic shops');
      return response.json();
    }
  });

  const [showAll, setShowAll] = useState(false);

  const handleLocationSearch = () => {
    setLocationSearch(userLocation);
  };

  if (loadingRecommended || loadingAll) {
    return (
      <Card className="border-purple-200 bg-purple-50 mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wrench className="w-5 h-5 text-purple-600" />
            Local Service Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-2"></div>
            <span className="text-sm text-purple-600">Loading service providers...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const shopsToShow = showAll ? allShops?.shops || [] : recommendedShops?.shops || [];

  return (
    <Card className="border-purple-200 bg-purple-50 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wrench className="w-5 h-5 text-purple-600" />
          Local Service Providers
        </CardTitle>
        <p className="text-sm text-purple-700 mt-1">
          Qualified specialists for {vehicleMake} {vehicleModel} import preparation and modifications
        </p>
        
        {/* Location Input for Geographic Targeting */}
        <div className="mt-4 flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter your location (postal code, city, or state)"
              value={userLocation}
              onChange={(e) => setUserLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
            />
          </div>
          <button
            onClick={handleLocationSearch}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-sm"
          >
            Search
          </button>
        </div>
        
        {locationSearch && (
          <div className="mt-2 text-sm text-purple-600">
            Showing results near: {locationSearch}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Specialty Recommendation */}
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {specialty} Specialists
            </Badge>
            <span className="text-sm text-gray-600">Recommended for your vehicle</span>
          </div>
          <p className="text-sm text-gray-700">
            {specialty === 'JDM' && 'Japanese import specialists with compliance experience and authentic parts access.'}
            {specialty === 'European' && 'European vehicle experts with factory-trained technicians and diagnostic equipment.'}
            {specialty === 'Performance' && 'High-performance tuning specialists with dyno facilities and race experience.'}
          </p>
        </div>

        {/* Shop Listings */}
        <div className="space-y-3">
          {shopsToShow.map((shop: any) => (
            <div key={shop.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-300 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{shop.name}</h4>
                  <p className="text-sm text-gray-600">{shop.business_name}</p>
                  {shop.contact_person && (
                    <p className="text-xs text-gray-500">Contact: {shop.contact_person}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge 
                    variant="outline" 
                    className={shop.specialty?.toLowerCase().includes('jdm') ? 'border-blue-300 text-blue-700' : 
                               shop.specialty?.toLowerCase().includes('european') ? 'border-green-300 text-green-700' : 
                               'border-orange-300 text-orange-700'}
                  >
                    {shop.specialty}
                  </Badge>
                  {shop.average_rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">{shop.average_rating}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-3">{shop.description}</p>
              
              {/* Business Details */}
              <div className="grid grid-cols-2 gap-4 mb-3 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {shop.location}
                  {shop.distance_km && (
                    <Badge variant="outline" className="ml-1 text-xs bg-blue-50 text-blue-700">
                      {shop.distance_km}km away
                    </Badge>
                  )}
                  {shop.country && shop.country !== 'United States' && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {shop.country}
                    </Badge>
                  )}
                </div>
                {shop.years_in_business && (
                  <div className="text-xs text-gray-500">
                    {shop.years_in_business} years experience
                  </div>
                )}
              </div>

              {/* Services and Certifications */}
              {(shop.services_offered || shop.certifications) && (
                <div className="mb-3 space-y-1">
                  {shop.services_offered && shop.services_offered.length > 0 && (
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Services:</span> {shop.services_offered.slice(0, 3).join(', ')}
                    </div>
                  )}
                  {shop.certifications && shop.certifications.length > 0 && (
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Certified:</span> {shop.certifications.join(', ')}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {shop.phone && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`tel:${shop.phone}`, '_self')}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Phone className="w-3 h-3" />
                      Call
                    </Button>
                  )}
                  {shop.email && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`mailto:${shop.email}`, '_self')}
                      className="flex items-center gap-1 text-xs"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Email
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {shop.website && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(shop.website, '_blank')}
                      className="flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" />
                      Website
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Toggle */}
        {!showAll && allShops?.shops?.length > 3 && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => setShowAll(true)}
              className="border-purple-300 text-purple-700 hover:bg-purple-100"
            >
              View All Service Providers ({allShops.total})
            </Button>
          </div>
        )}

        {/* Provider Network Summary */}
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-600">
            <span className="font-medium">{allShops?.total || recommendedShops?.total || 0}</span> verified service providers in our network
          </p>
          <p className="text-xs text-gray-500 mt-1">
            All partners verified for import compliance and vehicle modifications
          </p>
        </div>
      </CardContent>
    </Card>
  );
}