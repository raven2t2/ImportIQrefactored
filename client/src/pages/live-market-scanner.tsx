import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  RefreshCw, 
  Download, 
  Filter, 
  Globe, 
  Zap, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  ExternalLink
} from "lucide-react";

interface AuctionListing {
  id: number;
  title: string;
  price: string;
  currency: string;
  location: string;
  sourceSite: string;
  make?: string;
  model?: string;
  year?: number;
  condition?: string;
  mileage?: string;
  imageUrl?: string;
  listingUrl?: string;
  dataSource: string;
  createdAt: string;
}

interface SearchFilters {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  source?: string;
  yearFrom?: number;
  yearTo?: number;
}

export default function LiveMarketScanner() {
  const [selectedTab, setSelectedTab] = useState("scanner");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch auction listings with filters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (filters.make) params.append('make', filters.make);
    if (filters.model) params.append('model', filters.model);
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.source) params.append('source', filters.source);
    if (filters.yearFrom) params.append('yearFrom', filters.yearFrom.toString());
    if (filters.yearTo) params.append('yearTo', filters.yearTo.toString());
    params.append('limit', '50');
    return params.toString();
  };

  const { data: auctionData, isLoading, refetch } = useQuery<{ 
    listings: AuctionListing[]; 
    count: number; 
    filters: any; 
  }>({
    queryKey: ["/api/auction-listings", buildQueryParams()],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Manual scan trigger
  const scanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/trigger-manual-scan");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Scan Completed",
        description: `Found ${data.totalListings || 0} new auction listings`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auction-listings"] });
      setIsScanning(false);
    },
    onError: (error) => {
      toast({
        title: "Scan Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsScanning(false);
    },
  });

  const handleManualScan = () => {
    setIsScanning(true);
    scanMutation.mutate();
  };

  const handleSearch = () => {
    refetch();
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
    refetch();
  };

  const formatPrice = (price: string, currency: string) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'JPY' ? 'JPY' : 'USD',
      minimumFractionDigits: 0,
    }).format(numPrice);
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'copart': return 'bg-blue-500';
      case 'iaai': return 'bg-green-500';
      case 'manheim': return 'bg-purple-500';
      case 'goo-net': return 'bg-red-500';
      case 'yahoo-auctions': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getDataSourceIcon = (dataSource: string) => {
    switch (dataSource) {
      case 'webhook': return <Globe className="h-4 w-4" />;
      case 'direct_scrape': return <Zap className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const exportToCSV = () => {
    if (!auctionData?.listings?.length) return;
    
    const headers = ['Title', 'Make', 'Model', 'Year', 'Price', 'Currency', 'Location', 'Source', 'Data Source', 'URL'];
    const csvContent = [
      headers.join(','),
      ...auctionData.listings.map(listing => [
        `"${listing.title}"`,
        listing.make || '',
        listing.model || '',
        listing.year || '',
        listing.price,
        listing.currency,
        `"${listing.location}"`,
        listing.sourceSite,
        listing.dataSource,
        listing.listingUrl || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auction-listings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Live Market Scanner
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Real-time auction data from Japanese and US automotive markets
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scanner">Live Scanner</TabsTrigger>
            <TabsTrigger value="filters">Advanced Filters</TabsTrigger>
            <TabsTrigger value="analytics">Market Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="space-y-6">
            {/* Search and Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Market Search
                </CardTitle>
                <CardDescription>
                  Search across all connected auction platforms and data sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by make, model, or keywords..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={isLoading}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleManualScan}
                    disabled={isScanning || scanMutation.isPending}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                    {isScanning ? 'Scanning...' : 'Manual Scan'}
                  </Button>
                  <Button variant="outline" onClick={exportToCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {Object.entries(filters).map(([key, value]) => 
                    value && (
                      <Badge key={key} variant="secondary" className="gap-1">
                        {key}: {value}
                      </Badge>
                    )
                  )}
                  {(Object.keys(filters).length > 0 || searchTerm) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear All
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Total Listings</p>
                      <p className="text-2xl font-bold">{auctionData?.count || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">Webhook Sources</p>
                      <p className="text-2xl font-bold">
                        {auctionData?.listings?.filter(l => l.dataSource === 'webhook').length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm text-gray-600">Direct Scrapes</p>
                      <p className="text-2xl font-bold">
                        {auctionData?.listings?.filter(l => l.dataSource === 'direct_scrape').length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="text-sm font-medium">
                        {auctionData?.listings?.[0] ? 
                          new Date(auctionData.listings[0].createdAt).toLocaleTimeString() : 
                          'No data'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Auction Listings */}
            <Card>
              <CardHeader>
                <CardTitle>Live Auction Listings</CardTitle>
                <CardDescription>
                  Real-time data from multiple auction platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : auctionData?.listings?.length ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {auctionData.listings.map((listing) => (
                      <div key={listing.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{listing.title}</h3>
                              {getDataSourceIcon(listing.dataSource)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Vehicle Details</p>
                                <p className="font-medium">
                                  {listing.year} {listing.make} {listing.model}
                                </p>
                                {listing.mileage && (
                                  <p className="text-gray-500">{listing.mileage} miles</p>
                                )}
                              </div>
                              
                              <div>
                                <p className="text-gray-600">Location & Source</p>
                                <p className="font-medium">{listing.location}</p>
                                <Badge 
                                  className={`${getSourceBadgeColor(listing.sourceSite)} text-white text-xs`}
                                >
                                  {listing.sourceSite}
                                </Badge>
                              </div>
                              
                              <div>
                                <p className="text-gray-600">Listing Info</p>
                                <p className="text-xs text-gray-500">
                                  Added: {new Date(listing.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Source: {listing.dataSource === 'webhook' ? 'External API' : 'Direct Scrape'}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-green-600 mb-2">
                              {formatPrice(listing.price, listing.currency)}
                            </div>
                            {listing.listingUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={listing.listingUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View Listing
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No auction listings found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Try adjusting your search terms or filters, or trigger a manual scan
                    </p>
                    <Button onClick={handleManualScan} disabled={isScanning}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                      Start Scanning
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="filters" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Advanced Search Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="make">Make</Label>
                    <Select onValueChange={(value) => handleFilterChange('make', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select make" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Toyota">Toyota</SelectItem>
                        <SelectItem value="Nissan">Nissan</SelectItem>
                        <SelectItem value="Honda">Honda</SelectItem>
                        <SelectItem value="Mazda">Mazda</SelectItem>
                        <SelectItem value="Subaru">Subaru</SelectItem>
                        <SelectItem value="Mitsubishi">Mitsubishi</SelectItem>
                        <SelectItem value="Ford">Ford</SelectItem>
                        <SelectItem value="Chevrolet">Chevrolet</SelectItem>
                        <SelectItem value="Dodge">Dodge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      placeholder="e.g., Supra, GT-R, Civic"
                      onChange={(e) => handleFilterChange('model', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="source">Auction Source</Label>
                    <Select onValueChange={(value) => handleFilterChange('source', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All sources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="copart">Copart</SelectItem>
                        <SelectItem value="iaai">IAAI</SelectItem>
                        <SelectItem value="manheim">Manheim</SelectItem>
                        <SelectItem value="goo-net">Goo-net</SelectItem>
                        <SelectItem value="yahoo-auctions">Yahoo Auctions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="yearFrom">Year From</Label>
                    <Input
                      type="number"
                      placeholder="1990"
                      onChange={(e) => handleFilterChange('yearFrom', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="yearTo">Year To</Label>
                    <Input
                      type="number"
                      placeholder="2024"
                      onChange={(e) => handleFilterChange('yearTo', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="minPrice">Min Price (USD)</Label>
                    <Input
                      type="number"
                      placeholder="5000"
                      onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxPrice">Max Price (USD)</Label>
                    <Input
                      type="number"
                      placeholder="100000"
                      onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleSearch}>
                    Apply Filters
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Market Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Average Price</span>
                      <span className="font-semibold">
                        {auctionData?.listings?.length ? 
                          formatPrice(
                            (auctionData.listings.reduce((sum, l) => sum + parseFloat(l.price), 0) / auctionData.listings.length).toString(),
                            'USD'
                          ) : 
                          '$0'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Most Common Make</span>
                      <span className="font-semibold">
                        {auctionData?.listings?.length ? 
                          Object.entries(
                            auctionData.listings.reduce((acc, l) => {
                              const make = l.make || 'Unknown';
                              acc[make] = (acc[make] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>)
                          ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A' :
                          'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Sources</span>
                      <span className="font-semibold">
                        {auctionData?.listings ? 
                          new Set(auctionData.listings.map(l => l.dataSource)).size : 
                          0
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Freshness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Webhook Integration Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-500" />
                      <span>Real-time Data Processing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 text-purple-500" />
                      <span>Auto-refresh: 30 seconds</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}