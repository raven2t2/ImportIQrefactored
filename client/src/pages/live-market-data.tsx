import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, TrendingUp, Globe, Calendar, MapPin, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface LiveMarketData {
  jdmVehicles: JDMVehicle[];
  usVehicles: USVehicle[];
  lastUpdated: string;
  nextUpdate: string;
  exchangeRates: {
    jpyToAud: number;
    usdToAud: number;
  };
  totalResults: {
    jdm: number;
    us: number;
  };
}

interface JDMVehicle {
  id: string;
  title: string;
  price: number;
  currency: string;
  priceAUD: number;
  make: string;
  model: string;
  year: number;
  mileage: string;
  location: string;
  url: string;
  images: string[];
  transmission: string;
  fuelType: string;
  engineSize: string;
  description: string;
  lastUpdated: string;
  source: 'GOONET';
}

interface USVehicle {
  id: string;
  title: string;
  price: number;
  currency: string;
  priceAUD: number;
  make: string;
  model: string;
  year: number;
  mileage: string;
  location: string;
  url: string;
  images: string[];
  transmission: string;
  fuelType: string;
  engineSize: string;
  description: string;
  lastUpdated: string;
  source: 'US_CLASSIC';
}

interface MarketAnalysis {
  totalVehicles: number;
  averagePriceAUD: number;
  jdmCount: number;
  usCount: number;
  priceRanges: { range: string; count: number }[];
  topMakes: { make: string; count: number; avgPrice: number }[];
}

export default function LiveMarketData() {
  const [filters, setFilters] = useState({
    make: "",
    source: "",
    maxPriceAUD: "",
    minYear: ""
  });

  const { data: marketData, isLoading: dataLoading, refetch: refetchData } = useQuery<LiveMarketData>({
    queryKey: ['/api/live-market-data', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return fetch(`/api/live-market-data?${params}`).then(res => res.json());
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const { data: analysis, isLoading: analysisLoading } = useQuery<MarketAnalysis>({
    queryKey: ['/api/live-market-analysis'],
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  const handleRefresh = async () => {
    try {
      await apiRequest("POST", "/api/refresh-market-data");
      refetchData();
    } catch (error) {
      console.error('Failed to refresh market data:', error);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency === 'AUD' ? 'AUD' : currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-AU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (dataLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading authentic market data...</span>
        </div>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium mb-2">Market Data Unavailable</h3>
            <p className="text-muted-foreground mb-4">
              Live market data is being refreshed from authentic sources. Please try again in a few minutes.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Live Market Intelligence</h1>
          <p className="text-muted-foreground">
            Real-time pricing from authentic JDM and US datasets • Updated every 12 hours
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Last updated: {formatLastUpdated(marketData.lastUpdated)}
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Exchange Rates & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">JPY → AUD</p>
                <p className="text-lg font-semibold">
                  {marketData.exchangeRates.jpyToAud.toFixed(4)}
                </p>
              </div>
              <Globe className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">USD → AUD</p>
                <p className="text-lg font-semibold">
                  {marketData.exchangeRates.usdToAud.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">JDM Vehicles</p>
                <p className="text-lg font-semibold">{marketData.totalResults.jdm}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">US Classics</p>
                <p className="text-lg font-semibold">{marketData.totalResults.us}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
          <CardDescription>Filter authentic market data by your preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                placeholder="e.g. Toyota, Ford"
                value={filters.make}
                onChange={(e) => setFilters(prev => ({ ...prev, make: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="source">Source</Label>
              <Select value={filters.source} onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Source</SelectItem>
                  <SelectItem value="jdm">JDM (GOONET)</SelectItem>
                  <SelectItem value="us">US Classic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxPrice">Max Price (AUD)</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="e.g. 50000"
                value={filters.maxPriceAUD}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPriceAUD: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="minYear">Min Year</Label>
              <Input
                id="minYear"
                type="number"
                placeholder="e.g. 2000"
                value={filters.minYear}
                onChange={(e) => setFilters(prev => ({ ...prev, minYear: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Analysis */}
      {analysis && !analysisLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Market Analysis</CardTitle>
            <CardDescription>Insights from authentic pricing data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-3">Price Ranges</h4>
                <div className="space-y-2">
                  {analysis.priceRanges.map((range, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{range.range}</span>
                      <Badge variant="secondary">{range.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Top Makes</h4>
                <div className="space-y-2">
                  {analysis.topMakes.slice(0, 5).map((make, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{make.make}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{make.count} cars</div>
                        <div className="text-xs text-muted-foreground">
                          Avg {formatPrice(make.avgPrice, 'AUD')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Market Summary</h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Vehicles</div>
                    <div className="text-lg font-semibold">{analysis.totalVehicles}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Average Price</div>
                    <div className="text-lg font-semibold">{formatPrice(analysis.averagePriceAUD, 'AUD')}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Listings */}
      <Tabs defaultValue="both" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="both">All Vehicles</TabsTrigger>
          <TabsTrigger value="jdm">JDM ({marketData.jdmVehicles.length})</TabsTrigger>
          <TabsTrigger value="us">US Classic ({marketData.usVehicles.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="both" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...marketData.jdmVehicles, ...marketData.usVehicles]
              .sort((a, b) => b.priceAUD - a.priceAUD)
              .slice(0, 12)
              .map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="jdm" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketData.jdmVehicles.slice(0, 12).map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="us" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketData.usVehicles.slice(0, 12).map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface VehicleCardProps {
  vehicle: JDMVehicle | USVehicle;
}

function VehicleCard({ vehicle }: VehicleCardProps) {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency === 'AUD' ? 'AUD' : currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <Badge variant={vehicle.source === 'GOONET' ? 'default' : 'secondary'}>
              {vehicle.source === 'GOONET' ? 'JDM' : 'US Classic'}
            </Badge>
            <div className="text-right">
              <div className="font-bold text-lg">{formatPrice(vehicle.priceAUD, 'AUD')}</div>
              <div className="text-sm text-muted-foreground">
                {formatPrice(vehicle.price, vehicle.currency)}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold line-clamp-2">{vehicle.title}</h3>
            <div className="text-sm text-muted-foreground mt-1">
              {vehicle.year} • {vehicle.make} {vehicle.model}
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{vehicle.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{vehicle.mileage} • {vehicle.transmission}</span>
            </div>
          </div>

          {vehicle.url && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => window.open(vehicle.url, '_blank')}
            >
              View Listing
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}