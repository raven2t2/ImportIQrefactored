import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Ship, DollarSign, Clock } from 'lucide-react';
import ImportJourneyIntelligence from "@/components/ImportJourneyIntelligence";

export default function ImportJourneySimple() {
  const [location] = useLocation();
  const [vehicleData, setVehicleData] = useState({
    make: '',
    model: '',
    year: '',
    chassis: ''
  });
  const [destination, setDestination] = useState('');

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setVehicleData({
      make: urlParams.get('make') || '',
      model: urlParams.get('model') || '',
      year: urlParams.get('year') || '',
      chassis: urlParams.get('chassis') || ''
    });
    setDestination(urlParams.get('destination') || '');
  }, [location]);

  const hasVehicleData = vehicleData.make && vehicleData.model;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Import Journey Intelligence
          </h1>
          <p className="text-gray-600">
            Discover verified service providers and optimal shipping routes for your vehicle import
          </p>
        </div>

        {/* Vehicle Info Display */}
        {hasVehicleData && (
          <Card className="bg-white mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5 text-blue-600" />
                Import Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Make</p>
                  <p className="font-semibold">{vehicleData.make}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Model</p>
                  <p className="font-semibold">{vehicleData.model}</p>
                </div>
                {vehicleData.year && (
                  <div>
                    <p className="text-sm text-gray-600">Year</p>
                    <p className="font-semibold">{vehicleData.year}</p>
                  </div>
                )}
                {vehicleData.chassis && (
                  <div>
                    <p className="text-sm text-gray-600">Chassis</p>
                    <p className="font-semibold">{vehicleData.chassis}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Import Journey Intelligence Component */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              Location-Based Intelligence
            </CardTitle>
            <CardDescription>
              Find authentic service providers and shipping information based on your destination
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImportJourneyIntelligence destination={destination} />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {hasVehicleData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Ship className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-700">14-28</p>
                    <p className="text-sm text-blue-600">Days Shipping</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-700">$3,500</p>
                    <p className="text-sm text-green-600">Avg. Shipping Cost</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-purple-700">6-12</p>
                    <p className="text-sm text-purple-600">Weeks Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}