import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Calendar, MapPin, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MarketData {
  make: string;
  model: string;
  year: number;
  avgPrice: number;
  currency: string;
  sampleSize: number;
  priceRange: {
    min: number;
    max: number;
  };
  region: 'Japan' | 'USA';
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
}

export default function MarketPricing() {
  const [searchMake, setSearchMake] = useState("");
  const [searchModel, setSearchModel] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const { toast } = useToast();

  const { data: marketData, isLoading } = useQuery<MarketData[]>({
    queryKey: ["/api/market-pricing", searchMake, searchModel, selectedRegion],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchMake) params.append('make', searchMake);
      if (searchModel) params.append('model', searchModel);
      if (selectedRegion !== 'all') params.append('region', selectedRegion);
      
      const url = `/api/market-pricing?${params.toString()}`;
      const response = await fetch(url);
      const result = await response.json();
      return result.data || [];
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'JPY' ? '¥' : '$';
    return `${symbol}${price.toLocaleString()}`;
  };

  const formatTrend = (trend: string) => {
    switch (trend) {
      case 'up': return { icon: '↗', color: 'text-green-600', bg: 'bg-green-50' };
      case 'down': return { icon: '↘', color: 'text-red-600', bg: 'bg-red-50' };
      default: return { icon: '→', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const handleSearch = () => {
    // The query will automatically refetch when dependencies change
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Vehicle Import Pricing Guide
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Market pricing estimates for Japanese imports and US muscle cars based on established valuation methodologies
          </p>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Pricing estimates derived from automotive market research and industry valuation standards
            <br />
            <a href="/data-methodology" className="text-blue-600 hover:text-blue-800 underline">
              View our data methodology and integrity standards
            </a>
          </div>
        </div>

        {/* Search Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Market Data
            </CardTitle>
            <CardDescription>
              Find pricing for specific makes and models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Make (e.g., Toyota, Ford, Nissan)"
                  value={searchMake}
                  onChange={(e) => setSearchMake(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Model (e.g., Skyline, Mustang, Supra)"
                  value={searchModel}
                  onChange={(e) => setSearchModel(e.target.value)}
                />
              </div>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="Japan">Japan</SelectItem>
                  <SelectItem value="USA">USA</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} className="px-6">
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Market Data Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : marketData && marketData.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {marketData.map((item, index) => {
              const trendData = formatTrend(item.trend);
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {item.year} {item.make} {item.model}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {item.region}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${trendData.bg} ${trendData.color}`}>
                        {trendData.icon}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(item.avgPrice, item.currency)}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">avg</span>
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Range: {formatPrice(item.priceRange.min, item.currency)} - {formatPrice(item.priceRange.max, item.currency)}
                      </div>

                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{item.sampleSize} market samples</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(item.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {(item as any).dataSource && (
                        <div className="text-xs text-gray-400 mt-2 border-t pt-2">
                          Source: {(item as any).dataSource}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Market Data Found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Try searching for different makes or models, or check back later for updated data.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Market Summary */}
        {marketData && marketData.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Market Summary</CardTitle>
              <CardDescription>Overview of current market trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {marketData.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Models Tracked
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {marketData.reduce((sum, item) => sum + item.sampleSize, 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Total Sales Data
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.round(marketData.reduce((sum, item) => sum + item.avgPrice, 0) / marketData.length / 1000)}K
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Avg Price (USD)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}