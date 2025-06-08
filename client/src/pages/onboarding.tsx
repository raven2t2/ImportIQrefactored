import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, MapPin, Calculator, Search, Clipboard, Info } from "lucide-react";
import { SUPPORTED_REGIONS, regionManager } from "../../../shared/utils/regionManager.js";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [selectedRegion, setSelectedRegion] = useState(null);

  const handleRegionSelect = (regionCode) => {
    regionManager.setRegion(regionCode);
    setSelectedRegion(regionCode);
    
    // Navigate to main dashboard after selection
    setTimeout(() => {
      setLocation('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Globe className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to ImportIQ
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            Your global vehicle import intelligence platform
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Select your region to get started with region-specific tools and compliance information
          </p>
        </div>

        {/* Region Selection */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Object.entries(SUPPORTED_REGIONS).map(([code, region]) => (
            <Card 
              key={code}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                selectedRegion === code 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleRegionSelect(code)}
            >
              <CardHeader className="text-center pb-2">
                <div className="text-4xl mb-2">{region.flag}</div>
                <CardTitle className="text-lg">{region.name}</CardTitle>
                <Badge variant="outline" className="w-fit mx-auto">
                  {region.config.currency}
                </Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{region.config.drivingSide === 'left' ? 'LHD' : 'RHD'} traffic</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    <span>{region.config.measurementUnit === 'metric' ? 'Metric' : 'Imperial'}</span>
                  </div>
                  <div className="text-xs text-center mt-3 font-medium">
                    {region.subdivisions.length} states/provinces
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Preview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              What you'll get access to
            </CardTitle>
            <CardDescription>
              Region-specific tools and compliance information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Search className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Vehicle Lookup</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  VIN decoding, auction search, market scanning, and vehicle history
                </p>
              </div>
              <div className="text-center">
                <Calculator className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Cost Estimation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Import costs, compliance fees, shipping, and ROI calculations
                </p>
              </div>
              <div className="text-center">
                <Clipboard className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Import Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dashboard tracking, documentation, timelines, and port intelligence
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {selectedRegion && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-blue-700 dark:text-blue-300 font-medium">
                  Setting up your {SUPPORTED_REGIONS[selectedRegion].name} workspace...
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}