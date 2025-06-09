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
  description: string;
  website: string;
  location: string;
  specialty: string;
  is_active: boolean;
}

interface ModShopIntelligenceProps {
  vehicleMake: string;
  vehicleModel: string;
  destination: string;
}

export function ModShopIntelligence({ vehicleMake, vehicleModel, destination }: ModShopIntelligenceProps) {
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

  // Fetch recommended mod shops based on vehicle specialty
  const { data: recommendedShops, isLoading: loadingRecommended } = useQuery({
    queryKey: ['/api/mod-shops/specialty', specialty],
    queryFn: async () => {
      const response = await fetch(`/api/mod-shops/specialty/${specialty}?limit=3`);
      if (!response.ok) throw new Error('Failed to fetch specialty shops');
      return response.json();
    }
  });

  // Fetch all available shops for fallback
  const { data: allShops, isLoading: loadingAll } = useQuery({
    queryKey: ['/api/mod-shops/search'],
    queryFn: async () => {
      const response = await fetch('/api/mod-shops/search?limit=6');
      if (!response.ok) throw new Error('Failed to fetch shops');
      return response.json();
    }
  });

  const [showAll, setShowAll] = useState(false);

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
                <div>
                  <h4 className="font-semibold text-gray-900">{shop.name}</h4>
                  <p className="text-sm text-gray-600">{shop.business_name}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={shop.specialty?.toLowerCase().includes('jdm') ? 'border-blue-300 text-blue-700' : 
                             shop.specialty?.toLowerCase().includes('european') ? 'border-green-300 text-green-700' : 
                             'border-orange-300 text-orange-700'}
                >
                  {shop.specialty}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-700 mb-3">{shop.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {shop.location}
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
                      Visit
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