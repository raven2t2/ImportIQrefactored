import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Fuel,
  Settings,
  DollarSign,
  ArrowRight,
  RefreshCw,
  Camera,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface ApifyVehicle {
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
  source: 'APIFY_DATASET';
}

interface LiveMarketData {
  vehicles: ApifyVehicle[];
  lastUpdated: string;
  exchangeRates: {
    jpyToAud: number;
    usdToAud: number;
  };
  totalResults: number;
}

function ImageZoomModal({ images, initialIndex, title }: { images: string[], initialIndex: number, title: string }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  };

  return (
    <DialogContent 
      className="max-w-7xl max-h-[95vh] p-0 bg-black/95" 
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <DialogHeader className="sr-only">
        <DialogTitle>{title} - Image {currentIndex + 1} of {images.length}</DialogTitle>
        <DialogDescription>Vehicle inspection photos with navigation controls</DialogDescription>
      </DialogHeader>
      <div className="relative flex items-center justify-center min-h-[80vh]">
        <img
          src={images[currentIndex]}
          alt={`${title} - Image ${currentIndex + 1}`}
          className="max-w-full max-h-[90vh] object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder-car.jpg";
          }}
        />
        
        {/* Navigation Controls */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-white/20"
              onClick={prevImage}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-white/20"
              onClick={nextImage}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
        
        {/* Image Counter */}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg">
          <div className="font-medium">{title}</div>
          <div className="text-sm opacity-90">Image {currentIndex + 1} of {images.length}</div>
        </div>
        
        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/70 p-2 rounded-lg max-w-[90vw] overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden ${
                  index === currentIndex ? 'border-white' : 'border-white/30'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </DialogContent>
  );
}

function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <Camera className="h-12 w-12 text-gray-400" />
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-2">
      {/* Main Image */}
      <div className="relative">
        <img
          src={images[currentImageIndex]}
          alt={title}
          className="w-full h-48 object-cover rounded-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.parentElement!.innerHTML = `
              <div class="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <div class="text-center text-gray-500">
                  <svg class="h-12 w-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <div class="text-sm">Image unavailable</div>
                </div>
              </div>
            `;
          }}
        />
        
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      
      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              className={`flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden ${
                index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
              }`}
              onClick={() => setCurrentImageIndex(index)}
            >
              <img
                src={image}
                alt={`${title} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function VehicleCard({ vehicle }: { vehicle: ApifyVehicle }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCalculateImport = () => {
    const params = new URLSearchParams({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      price: vehicle.priceAUD.toString(),
      country: vehicle.location.toLowerCase().includes('japan') ? 'japan' : 'usa'
    });
    
    window.location.href = `/import-cost-calculator?${params.toString()}`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <Dialog>
          <DialogTrigger asChild>
            <div className="cursor-pointer">
              <ImageGallery images={vehicle.images} title={vehicle.title} />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{vehicle.title}</DialogTitle>
              <DialogDescription>
                {vehicle.make} {vehicle.model} {vehicle.year} - {formatCurrency(vehicle.priceAUD)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicle.images.map((image, index) => (
                  <div key={index} className="relative group cursor-pointer">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="relative">
                          <img
                            src={image}
                            alt={`${vehicle.title} - View ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.parentElement?.parentElement?.parentElement?.remove();
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                              Click to expand
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {index + 1}/{vehicle.images.length}
                          </div>
                        </div>
                      </DialogTrigger>
                      <ImageZoomModal images={vehicle.images} initialIndex={index} title={vehicle.title} />
                    </Dialog>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Make:</span> {vehicle.make}
                </div>
                <div>
                  <span className="font-medium">Model:</span> {vehicle.model}
                </div>
                <div>
                  <span className="font-medium">Year:</span> {vehicle.year}
                </div>
                <div>
                  <span className="font-medium">Mileage:</span> {vehicle.mileage}
                </div>
                <div>
                  <span className="font-medium">Transmission:</span> {vehicle.transmission}
                </div>
                <div>
                  <span className="font-medium">Engine:</span> {vehicle.engineSize}
                </div>
                <div>
                  <span className="font-medium">Fuel Type:</span> {vehicle.fuelType}
                </div>
                <div>
                  <span className="font-medium">Location:</span> {vehicle.location}
                </div>
              </div>
              <p className="text-gray-600">{vehicle.description}</p>
              <div className="flex justify-between items-center pt-4">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(vehicle.priceAUD)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {vehicle.currency} {vehicle.price.toLocaleString()}
                  </div>
                </div>
                <Button 
                  onClick={handleCalculateImport}
                  className="bg-[#D4AF37] hover:bg-amber-500"
                >
                  Calculate Import Cost
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 flex-1 mr-2">
              {vehicle.title}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {vehicle.images.length} photos
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {vehicle.year}
            </div>
            <div className="flex items-center">
              <Settings className="h-3 w-3 mr-1" />
              {vehicle.transmission}
            </div>
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {vehicle.location}
            </div>
            <div className="flex items-center">
              <Fuel className="h-3 w-3 mr-1" />
              {vehicle.fuelType}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xl font-bold text-blue-600">
                {formatCurrency(vehicle.priceAUD)}
              </div>
              <div className="text-xs text-gray-500">
                {vehicle.currency} {vehicle.price.toLocaleString()}
              </div>
            </div>
            <Button 
              onClick={handleCalculateImport}
              size="sm"
              className="bg-[#D4AF37] hover:bg-amber-500"
            >
              Calculate Import
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LiveMarketDataPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMake, setSelectedMake] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minYear, setMinYear] = useState("");

  const { data: marketData, isLoading, error, refetch } = useQuery<LiveMarketData>({
    queryKey: ['/api/live-market-data'],
    staleTime: 0, // Always fetch fresh data to reflect admin changes immediately
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading live market data...</p>
        </div>
      </div>
    );
  }

  if (error || !marketData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load market data</p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const vehicles = marketData.vehicles || [];

  // Filter vehicles based on search criteria
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = !searchTerm || 
      vehicle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMake = !selectedMake || selectedMake === "all" || vehicle.make.toLowerCase().includes(selectedMake.toLowerCase());
    const matchesPrice = !maxPrice || vehicle.priceAUD <= parseInt(maxPrice);
    const matchesYear = !minYear || vehicle.year >= parseInt(minYear);
    
    return matchesSearch && matchesMake && matchesPrice && matchesYear;
  });

  // Get unique makes for filter dropdown
  const availableMakes = Array.from(new Set(vehicles.map(v => v.make))).sort();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Live Market Intelligence
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Browse authentic vehicle listings with comprehensive image galleries. 
          Click any vehicle to view all available photos and calculate import costs.
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by make, model, or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedMake} onValueChange={setSelectedMake}>
              <SelectTrigger>
                <SelectValue placeholder="Make" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Makes</SelectItem>
                {availableMakes.map((make) => (
                  <SelectItem key={make} value={make}>{make}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Max Price (AUD)"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            <Input
              placeholder="Min Year"
              type="number"
              value={minYear}
              onChange={(e) => setMinYear(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Grid */}
      {filteredVehicles.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}