import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar, Gauge, Car, Search, Filter, AlertCircle } from "lucide-react";

interface VehicleListing {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number | string;
  title: string;
  engine?: {
    name: string;
    code: string;
  };
  fuelType?: {
    name: string;
    code: string;
  };
  specifications?: {
    driveType?: string;
    transmission?: string;
    exterior?: string;
  };
  features?: {
    mechanical?: string[];
    safety?: string[];
    technology?: string[];
  };
  daysOnSite?: number;
}

interface MarketAnalysis {
  averagePrice: number;
  medianPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  averageMileage: number;
  totalListings: number;
  yearDistribution: Record<string, number>;
  priceByYear: Record<string, number>;
  depreciationRate: number;
  marketTrend: "rising" | "falling" | "stable";
  popularFeatures: string[];
  averageDaysOnMarket: number;
}

export default function USMarketIntelligence() {
  const [searchBrand, setSearchBrand] = useState("");
  const [searchModel, setSearchModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [maxMileage, setMaxMileage] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: marketData, isLoading, error } = useQuery<{
    listings: VehicleListing[];
    analysis: MarketAnalysis;
    brands: string[];
    models: string[];
    years: number[];
  }>({
    queryKey: ["/api/us-market-intelligence", searchBrand, searchModel, selectedYear, maxPrice, maxMileage],
  });

  const { data: comparisonData } = useQuery<{
    brandComparison: Record<string, { avgPrice: number; count: number; avgMileage: number }>;
    yearTrends: Record<string, { avgPrice: number; count: number; depreciation: number }>;
  }>({
    queryKey: ["/api/us-market-comparison", searchBrand, searchModel],
    enabled: !!(searchBrand || searchModel),
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number | string) => {
    const miles = typeof mileage === 'string' ? parseInt(mileage.replace(/,/g, '')) : mileage;
    return isNaN(miles) ? 'N/A' : miles.toLocaleString() + ' miles';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">Unable to load market data. Please try again.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">US Market Intelligence</h1>
          <p className="text-gray-600">Real-time market analysis using authentic AutoTrader data</p>
        </div>

        {/* Search Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Search & Filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Select value={searchBrand} onValueChange={setSearchBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Brand</SelectItem>
                    {marketData?.brands.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="Model name"
                  value={searchModel}
                  onChange={(e) => setSearchModel(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="year">Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Year</SelectItem>
                    {marketData?.years.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maxPrice">Max Price</Label>
                <Input
                  id="maxPrice"
                  placeholder="$50,000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="maxMileage">Max Mileage</Label>
                <Input
                  id="maxMileage"
                  placeholder="100,000"
                  value={maxMileage}
                  onChange={(e) => setMaxMileage(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Overview Stats */}
        {marketData?.analysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Price</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(marketData.analysis.averagePrice)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Listings</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {marketData.analysis.totalListings?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <Car className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Mileage</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {marketData.analysis.averageMileage?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <Gauge className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Market Trend</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-gray-900 capitalize">
                        {marketData.analysis.marketTrend}
                      </p>
                      {marketData.analysis.marketTrend === 'rising' && <TrendingUp className="h-5 w-5 text-green-500" />}
                      {marketData.analysis.marketTrend === 'falling' && <TrendingDown className="h-5 w-5 text-red-500" />}
                      {marketData.analysis.marketTrend === 'stable' && <BarChart3 className="h-5 w-5 text-gray-500" />}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Analysis Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Price Trends</TabsTrigger>
            <TabsTrigger value="comparison">Brand Comparison</TabsTrigger>
            <TabsTrigger value="listings">Vehicle Listings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Price Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {marketData?.analysis && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Minimum</span>
                        <span className="font-semibold">{formatPrice(marketData.analysis.priceRange.min)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Median</span>
                        <span className="font-semibold">{formatPrice(marketData.analysis.medianPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Average</span>
                        <span className="font-semibold">{formatPrice(marketData.analysis.averagePrice)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Maximum</span>
                        <span className="font-semibold">{formatPrice(marketData.analysis.priceRange.max)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {marketData?.analysis.popularFeatures.slice(0, 10).map((feature, index) => (
                      <Badge key={index} variant="secondary">{feature}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Year-over-Year Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {marketData?.analysis.yearDistribution && (
                  <div className="space-y-4">
                    {Object.entries(marketData.analysis.yearDistribution)
                      .sort(([a], [b]) => parseInt(b) - parseInt(a))
                      .slice(0, 8)
                      .map(([year, count]) => {
                        const avgPrice = marketData.analysis.priceByYear[year] || 0;
                        const percentage = (count / marketData.analysis.totalListings) * 100;
                        
                        return (
                          <div key={year} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{year}</span>
                              <div className="text-right">
                                <div className="text-sm font-semibold">{formatPrice(avgPrice)}</div>
                                <div className="text-xs text-gray-500">{count} listings</div>
                              </div>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            {comparisonData?.brandComparison && (
              <Card>
                <CardHeader>
                  <CardTitle>Brand Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(comparisonData.brandComparison)
                      .sort(([,a], [,b]) => b.count - a.count)
                      .slice(0, 10)
                      .map(([brand, data]) => (
                        <div key={brand} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{brand}</div>
                            <div className="text-sm text-gray-600">{data.count} listings</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatPrice(data.avgPrice)}</div>
                            <div className="text-sm text-gray-600">{data.avgMileage?.toLocaleString() || '0'} mi avg</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {marketData?.listings.slice(0, 12).map((listing) => (
                <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{listing.title}</h3>
                        <p className="text-sm text-gray-600">{listing.brand} {listing.model}</p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-green-600">{formatPrice(listing.price)}</span>
                        <Badge variant="outline">{listing.year}</Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Mileage:</span>
                          <span>{formatMileage(listing.mileage)}</span>
                        </div>
                        {listing.specifications?.transmission && (
                          <div className="flex justify-between">
                            <span>Transmission:</span>
                            <span>{listing.specifications.transmission}</span>
                          </div>
                        )}
                        {listing.specifications?.driveType && (
                          <div className="flex justify-between">
                            <span>Drive Type:</span>
                            <span>{listing.specifications.driveType}</span>
                          </div>
                        )}
                        {listing.daysOnSite && (
                          <div className="flex justify-between">
                            <span>Days on Market:</span>
                            <span>{listing.daysOnSite} days</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Data Source Attribution */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Authentic Market Data</p>
                <p className="text-sm text-blue-700">
                  Analysis based on real AutoTrader listings. Data refreshed regularly for accuracy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}