import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Search, Car, TrendingUp, DollarSign, MapPin, Clock, ExternalLink, Filter, RefreshCw, Globe, Camera, Gavel } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

const searchSchema = z.object({
  make: z.string().min(1, "Please select a make"),
  model: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  location: z.string().optional(),
  yearFrom: z.string().optional(),
  yearTo: z.string().optional(),
});

type SearchData = z.infer<typeof searchSchema>;

interface CarListing {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileage?: string;
  location: string;
  source: string;
  sourceUrl: string;
  description: string;
  images: string[];
  listedDate: string;
  seller: string;
  features: string[];
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  isImport?: boolean;
  compliance?: string;
  auctionData?: {
    auctionHouse: string;
    lotNumber: string;
    inspectionGrade?: string;
    auctionDate?: string;
    estimatedBid?: number;
    bidIncrement?: number;
    reservePrice?: number;
    conditionReport?: string;
    exportReadyCertificate?: boolean;
  };
}

interface MarketInsights {
  averagePrice: number;
  priceRange: { min: number; max: number };
  totalListings: number;
  topLocations: string[];
  priceTrend: "rising" | "falling" | "stable";
  popularVariants: Array<{ variant: string; count: number; avgPrice: number }>;
  importPercentage: number;
}

export default function LiveMarketScanner() {
  const [listings, setListings] = useState<CarListing[]>([]);
  const [insights, setInsights] = useState<MarketInsights | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<SearchData>({
    make: "",
    model: "",
    minPrice: "",
    maxPrice: "",
    location: "",
    yearFrom: "",
    yearTo: "",
  });

  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SearchData>({
    resolver: zodResolver(searchSchema),
    defaultValues: selectedFilters,
  });

  const mutation = useMutation({
    mutationFn: async (data: SearchData) => {
      const response = await apiRequest("POST", "/api/live-market-scanner", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setListings(data.listings || []);
        setInsights(data.insights || null);
        toast({
          title: "Live Market Intelligence Retrieved",
          description: `${data.totalResults || 0} authentic listings from verified auction houses and marketplaces`,
        });
      } else {
        toast({
          title: "Market Data Unavailable",
          description: "Unable to access live auction and marketplace data",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Source Connection Failed",
        description: "Cannot connect to Japanese auction houses and marketplace APIs",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SearchData) => {
    setSelectedFilters(data);
    mutation.mutate(data);
  };

  const popularMakes = [
    "Toyota", "Nissan", "Honda", "Mazda", "Subaru", "Mitsubishi",
    "Ford", "Chevrolet", "Dodge", "BMW", "Mercedes-Benz", "Audi",
    "Volkswagen", "Porsche", "Ferrari", "Lamborghini"
  ];

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency === 'JPY' ? 'JPY' : 'AUD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'carsales': return 'bg-blue-600';
      case 'autotrader': return 'bg-green-600';
      case 'gumtree': return 'bg-purple-600';
      case 'facebook': return 'bg-blue-500';
      case 'japanese auction': return 'bg-red-600';
      case 'private': return 'bg-gray-600';
      default: return 'bg-orange-600';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center mr-4">
              <Globe className="h-8 w-8 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Live Market Scanner
              </h1>
              <p className="text-xl text-gray-400">
                Real-time listings from Australia's major car platforms
              </p>
            </div>
          </div>
          
          <p className="text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Scan live listings from Carsales, AutoTrader, Gumtree, Facebook Marketplace, and Japanese auction houses. 
            Get real market prices, trends, and find your dream import ready for purchase.
          </p>
          
          {/* Data Source Status Indicator */}
          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-400">Live Data Sources Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="text-gray-400">Authentic Data Only</span>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <Card className="bg-gray-900 border-amber-400/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="h-5 w-5 text-amber-400" />
              Market Search Filters
            </CardTitle>
            <CardDescription className="text-gray-400">
              Configure your search to find specific vehicles across all platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Make Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Make *</label>
                  <Select onValueChange={(value) => setValue("make", value)} required>
                    <SelectTrigger className="bg-black border-amber-400/30 text-white">
                      <SelectValue placeholder="Select make..." />
                    </SelectTrigger>
                    <SelectContent>
                      {popularMakes.map((make) => (
                        <SelectItem key={make} value={make}>{make}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.make && (
                    <p className="text-red-400 text-sm">{errors.make.message}</p>
                  )}
                </div>

                {/* Model */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Model</label>
                  <Input
                    {...register("model")}
                    placeholder="e.g., Skyline, Supra, Mustang"
                    className="bg-black border-amber-400/30 text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Location</label>
                  <Input
                    {...register("location")}
                    placeholder="e.g., Sydney, Melbourne, All"
                    className="bg-black border-amber-400/30 text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Min Price (AUD)</label>
                  <Input
                    {...register("minPrice")}
                    type="number"
                    placeholder="e.g., 20000"
                    className="bg-black border-amber-400/30 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Max Price (AUD)</label>
                  <Input
                    {...register("maxPrice")}
                    type="number"
                    placeholder="e.g., 150000"
                    className="bg-black border-amber-400/30 text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Year Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Year Range</label>
                  <div className="flex gap-2">
                    <Input
                      {...register("yearFrom")}
                      type="number"
                      placeholder="From"
                      className="bg-black border-amber-400/30 text-white placeholder:text-gray-500"
                    />
                    <Input
                      {...register("yearTo")}
                      type="number"
                      placeholder="To"
                      className="bg-black border-amber-400/30 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="bg-amber-400 hover:bg-amber-500 text-black font-semibold px-8 py-3"
              >
                {mutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Scanning Markets...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Scan Live Markets
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Professional Sourcing Call-to-Action */}
        {listings.length > 0 && (
          <Card className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 border-amber-400 shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Found Your Dream Car?</h3>
                  <p className="text-amber-100 mb-3">
                    Let our licensed import specialists secure it with professional bidding and compliance handling
                  </p>
                  <div className="flex items-center gap-4 text-sm text-amber-200">
                    <span>✓ Licensed auction bidding</span>
                    <span>✓ Full compliance check</span>
                    <span>✓ Door-to-door delivery</span>
                  </div>
                </div>
                <div className="text-right">
                  <Link href="/deposit">
                    <Button size="lg" className="bg-amber-400 hover:bg-amber-500 text-black font-semibold">
                      Secure Your Vehicle
                      <span className="text-xs block">$500 deposit</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Market Insights */}
        {insights && (
          <Card className="bg-gray-900 border-amber-400/30 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-400" />
                Live Market Intelligence
                <Badge className="ml-2 bg-green-600 text-white">Real-time Data</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">
                    {formatPrice(insights.averagePrice, 'AUD')}
                  </div>
                  <div className="text-sm text-gray-400">Average Price</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{insights.totalListings}</div>
                  <div className="text-sm text-gray-400">Active Listings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{insights.importPercentage}%</div>
                  <div className="text-sm text-gray-400">Import Vehicles</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    insights.priceTrend === 'rising' ? 'text-red-400' :
                    insights.priceTrend === 'falling' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {insights.priceTrend.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-400">Price Trend</div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-400 text-center">
                  <span className="font-medium text-amber-400">Data Sources:</span> Japanese Auction Houses (USS, TAA, JU), 
                  Australian Marketplaces (Carsales, AutoTrader), US Import Networks, Real-time Exchange Rates
                </div>
                <div className="text-xs text-gray-500 text-center mt-1">
                  Professional-grade market intelligence typically reserved for licensed import agents
                </div>
                <div className="text-xs text-yellow-400 text-center mt-2 bg-yellow-900/20 p-2 rounded border border-yellow-400/30">
                  Note: Source links direct to marketplace search results. Individual listings may vary by availability.
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Listings */}
        {listings.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              Current Market Listings ({listings.length})
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="bg-gray-900 border-amber-400/30 hover:border-amber-400/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white text-lg">
                          {listing.year} {listing.make} {listing.model}
                        </CardTitle>
                        <CardDescription className="text-gray-400 flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4" />
                          {listing.location}
                          <Clock className="h-4 w-4 ml-2" />
                          {listing.listedDate}
                        </CardDescription>
                      </div>
                      <Badge className={`${getSourceBadgeColor(listing.source)} text-white`}>
                        {listing.source}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Vehicle Image */}
                    {listing.images && listing.images.length > 0 && (
                      <div className="relative overflow-hidden rounded-lg bg-gray-800">
                        <img 
                          src={listing.images[0]} 
                          alt={`${listing.year} ${listing.make} ${listing.model}`}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=300&fit=crop&auto=format&q=80';
                          }}
                        />
                        {listing.isImport && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-blue-600 text-white text-xs">Import</Badge>
                          </div>
                        )}
                        {listing.auctionData && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-yellow-600 text-white text-xs">
                              Grade {listing.auctionData.inspectionGrade}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-amber-400">
                        {formatPrice(listing.price, listing.currency)}
                        {listing.location.includes('Japan') && (
                          <div className="text-xs text-gray-400 mt-1">
                            Converted from Japanese auction price
                          </div>
                        )}
                      </div>
                      {listing.mileage && (
                        <div className="text-gray-400">
                          {listing.mileage}
                        </div>
                      )}
                    </div>

                    {listing.description && (
                      <p className="text-gray-300 text-sm line-clamp-2">
                        {listing.description}
                      </p>
                    )}

                    {listing.features.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {listing.features.slice(0, 4).map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs border-gray-600 text-gray-300">
                            {feature}
                          </Badge>
                        ))}
                        {listing.features.length > 4 && (
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                            +{listing.features.length - 4} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {listing.isImport && (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 text-white">Import Vehicle</Badge>
                        {listing.compliance && (
                          <Badge variant="outline" className="border-green-600 text-green-400">
                            {listing.compliance}
                          </Badge>
                        )}
                      </div>
                    )}

                    {listing.auctionData && (
                      <div className="bg-yellow-900/30 p-4 rounded border border-yellow-400/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Gavel className="h-4 w-4 text-yellow-400" />
                          <div className="text-sm text-yellow-400 font-semibold">Live Auction Intelligence</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="text-gray-300">
                              <span className="text-yellow-400">House:</span> {listing.auctionData.auctionHouse}
                            </div>
                            <div className="text-gray-300">
                              <span className="text-yellow-400">Lot:</span> #{listing.auctionData.lotNumber}
                            </div>
                            {listing.auctionData.inspectionGrade && (
                              <div className="text-gray-300">
                                <span className="text-yellow-400">Grade:</span> {listing.auctionData.inspectionGrade}
                              </div>
                            )}
                            {listing.auctionData.auctionDate && (
                              <div className="text-gray-300">
                                <span className="text-yellow-400">Date:</span> {listing.auctionData.auctionDate}
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            {listing.auctionData.estimatedBid && (
                              <div className="text-gray-300">
                                <span className="text-yellow-400">Est. Bid:</span> {formatPrice(listing.auctionData.estimatedBid, 'AUD')}
                              </div>
                            )}
                            {listing.auctionData.reservePrice && (
                              <div className="text-gray-300">
                                <span className="text-yellow-400">Reserve:</span> {formatPrice(listing.auctionData.reservePrice, 'AUD')}
                              </div>
                            )}
                            {listing.auctionData.exportReadyCertificate !== undefined && (
                              <div className="text-gray-300">
                                <span className="text-yellow-400">Export Ready:</span> {listing.auctionData.exportReadyCertificate ? "✓" : "⚠"}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {listing.auctionData.conditionReport && (
                          <div className="mt-3 pt-2 border-t border-yellow-400/20">
                            <div className="text-gray-300 text-xs">
                              <span className="text-yellow-400 font-medium">Condition:</span> {listing.auctionData.conditionReport}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-3 pt-2 border-t border-yellow-400/20 text-xs text-yellow-300">
                          Professional auction data - same intelligence import agents use
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
                          onClick={() => window.open(listing.sourceUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Source
                        </Button>
                        <Link href="/vehicle-lookup">
                          <Button 
                            variant="outline"
                            size="sm" 
                            className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
                          >
                            <Search className="h-4 w-4 mr-2" />
                            VIN Lookup
                          </Button>
                        </Link>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link href="/true-cost-explorer" className="flex-1">
                          <Button 
                            size="sm" 
                            className="w-full bg-amber-400 hover:bg-amber-500 text-black font-semibold"
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Calculate Total Cost
                          </Button>
                        </Link>
                        <Link href="/deposit">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6"
                          >
                            Secure Vehicle
                          </Button>
                        </Link>
                      </div>
                      
                      {listing.isImport && (
                        <div className="text-xs text-amber-400 text-center font-medium">
                          Professional import service available - we handle everything
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!mutation.isPending && listings.length === 0 && (
          <Card className="bg-gray-900 border-amber-400/30">
            <CardContent className="text-center py-12">
              <Car className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Results Yet</h3>
              <p className="text-gray-400 mb-6">
                Configure your search filters above and scan the market for available vehicles
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" className="border-amber-400/30 text-amber-400" asChild>
                  <Link href="/vehicle-lookup">Try Vehicle Lookup</Link>
                </Button>
                <Button variant="outline" className="border-amber-400/30 text-amber-400" asChild>
                  <Link href="/true-cost-explorer">Import Calculator</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}