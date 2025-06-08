import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, MapPin, Calculator } from "lucide-react";

interface Region {
  code: string;
  name: string;
  flag: string;
  currency: string;
  drivingSide: string;
  measurementUnit: string;
}

const REGIONS: Region[] = [
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD', drivingSide: 'left', measurementUnit: 'metric' },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', drivingSide: 'right', measurementUnit: 'imperial' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', drivingSide: 'left', measurementUnit: 'mixed' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', drivingSide: 'right', measurementUnit: 'metric' }
];

interface RegionSelectorProps {
  onRegionSelect: (regionCode: string) => void;
  selectedRegion?: string;
}

export function RegionSelector({ onRegionSelect, selectedRegion }: RegionSelectorProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {REGIONS.map((region) => (
        <Card 
          key={region.code}
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
            selectedRegion === region.code 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onRegionSelect(region.code)}
        >
          <CardHeader className="text-center pb-2">
            <div className="text-4xl mb-2">{region.flag}</div>
            <CardTitle className="text-lg">{region.name}</CardTitle>
            <Badge variant="outline" className="w-fit mx-auto">
              {region.currency}
            </Badge>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{region.drivingSide === 'left' ? 'LHD' : 'RHD'} traffic</span>
              </div>
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                <span>{region.measurementUnit === 'metric' ? 'Metric' : region.measurementUnit === 'imperial' ? 'Imperial' : 'Mixed'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}