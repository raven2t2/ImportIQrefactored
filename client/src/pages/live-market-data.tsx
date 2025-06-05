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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RefreshCw, TrendingUp, Globe, Calendar, MapPin, DollarSign, Eye, Calculator, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

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
                  {marketData.exchangeRates.usdToAud.toFixed(4)}
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
                <p className="text-sm text-muted-foreground">JDM Classics</p>
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

      {/* Vehicle Listings */}
      <Tabs defaultValue="both" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="both">All Vehicles</TabsTrigger>
          <TabsTrigger value="jdm">JDM ({marketData.jdmVehicles.length})</TabsTrigger>
          <TabsTrigger value="us">US Classic ({marketData.usVehicles.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="both" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketData.jdmVehicles && marketData.usVehicles && [...marketData.jdmVehicles, ...marketData.usVehicles]
              .sort((a, b) => b.priceAUD - a.priceAUD)
              .slice(0, 12)
              .map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="jdm" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketData.jdmVehicles && marketData.jdmVehicles.slice(0, 12).map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="us" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketData.usVehicles && marketData.usVehicles.slice(0, 12).map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Images className="w-4 h-4 mr-2" />
          View Images ({images.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl" aria-describedby="image-gallery-description">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p id="image-gallery-description" className="sr-only">
          Browse through vehicle images using navigation controls or thumbnail selection
        </p>
        <div className="relative">
          <img
            src={images[currentIndex]}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="w-full h-96 object-cover rounded-lg"
          />
          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2"
                onClick={prevImage}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={nextImage}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className={`w-16 h-16 object-cover rounded cursor-pointer border-2 flex-shrink-0 ${
                index === currentIndex ? 'border-primary' : 'border-transparent'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-video relative bg-gray-100">
        {vehicle.images && vehicle.images.length > 0 ? (
          <div className="relative w-full h-full">
            <img
              src={vehicle.images[0]}
              alt={vehicle.title}
              className="w-full h-full object-cover"
            />
            {vehicle.images.length > 1 && (
              <div className="absolute top-2 left-2">
                <Badge variant="outline" className="text-xs bg-white/90">
                  +{vehicle.images.length - 1} more
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image Available
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs">
            {vehicle.source === 'GOONET' ? 'JDM' : 'US'}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{vehicle.title}</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Price (Original):</span>
            <span className="font-medium">{formatPrice(vehicle.price, vehicle.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>Price (AUD):</span>
            <span className="font-medium text-primary">{formatPrice(vehicle.priceAUD, 'AUD')}</span>
          </div>
          <div className="flex justify-between">
            <span>Year:</span>
            <span>{vehicle.year}</span>
          </div>
          <div className="flex justify-between">
            <span>Mileage:</span>
            <span>{vehicle.mileage}</span>
          </div>
          <div className="flex justify-between">
            <span>Location:</span>
            <span>{vehicle.location}</span>
          </div>
          {vehicle.transmission && (
            <div className="flex justify-between">
              <span>Transmission:</span>
              <span>{vehicle.transmission}</span>
            </div>
          )}
        </div>
        <Separator className="my-3" />
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Updated: {new Date(vehicle.lastUpdated).toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            {vehicle.images && vehicle.images.length > 0 && (
              <ImageGallery images={vehicle.images} title={vehicle.title} />
            )}
            <Link
              href={`/import-cost-calculator?price=${vehicle.priceAUD}&year=${vehicle.year}&make=${encodeURIComponent(vehicle.make)}&model=${encodeURIComponent(vehicle.model)}`}
              className="flex-1"
            >
              <Button variant="default" size="sm" className="w-full">
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Import Cost
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}