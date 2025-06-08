import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Clock, DollarSign, Database } from "lucide-react";

interface AuctionIntelligence {
  make: string;
  model: string;
  year?: number;
  priceRange: {
    min: number;
    max: number;
    average: number;
    currency: string;
  };
  marketTrend: "rising" | "falling" | "stable";
  sampleSize: number;
  lastUpdated: string;
  timingRecommendation: string;
  confidenceLevel: "high" | "medium" | "low";
}

interface AuctionIntelligenceDisplayProps {
  make: string;
  model: string;
  year?: number;
}

export function AuctionIntelligenceDisplay({ make, model, year }: AuctionIntelligenceDisplayProps) {
  const { data: auctionData, isLoading } = useQuery({
    queryKey: ['/api/auction-data/market-pricing', make, model, year],
    queryFn: async () => {
      const params = new URLSearchParams({ make, model });
      if (year) params.append('year', year.toString());
      
      const response = await fetch(`/api/auction-data/market-pricing?${params}`);
      if (!response.ok) throw new Error('Failed to fetch auction data');
      return response.json();
    },
    enabled: Boolean(make && model)
  });

  if (isLoading) {
    return (
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
            <Database className="h-4 w-4" />
            Loading Market Intelligence...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!auctionData?.marketData) {
    return (
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Database className="h-4 w-4" />
            No Recent Auction Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Auction intelligence will be available once market data is collected for this vehicle.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { marketData } = auctionData;
  const formatPrice = (price: number) => `$${price.toLocaleString()}`;
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'falling': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'falling': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
          <Database className="h-4 w-4" />
          Live Auction Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Range */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Market Price Range</span>
            <Badge variant="outline" className={getConfidenceColor(marketData.confidenceLevel || 'medium')}>
              {marketData.confidenceLevel || 'medium'} confidence
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white dark:bg-gray-800 p-2 rounded border">
              <div className="text-xs text-gray-500 dark:text-gray-400">Min</div>
              <div className="font-semibold text-sm">{formatPrice(marketData.minPrice)}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-2 rounded border">
              <div className="text-xs text-gray-500 dark:text-gray-400">Average</div>
              <div className="font-semibold text-sm text-blue-600 dark:text-blue-400">
                {formatPrice(marketData.averagePrice)}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-2 rounded border">
              <div className="text-xs text-gray-500 dark:text-gray-400">Max</div>
              <div className="font-semibold text-sm">{formatPrice(marketData.maxPrice)}</div>
            </div>
          </div>
        </div>

        {/* Sample Size and Trend */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <DollarSign className="h-3 w-3" />
            Based on {marketData.sampleSize} recent {marketData.sampleSize === 1 ? 'listing' : 'listings'}
          </div>
          {marketData.trend && (
            <Badge variant="outline" className={getTrendColor(marketData.trend)}>
              {getTrendIcon(marketData.trend)}
              {marketData.trend}
            </Badge>
          )}
        </div>

        {/* Timing Recommendation */}
        {marketData.timingRecommendation && (
          <div className="bg-white dark:bg-gray-800 p-3 rounded border">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Clock className="h-4 w-4" />
              Import Timing Insight
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {marketData.timingRecommendation}
            </p>
          </div>
        )}

        {/* Recent Listings Summary */}
        {marketData.recentListings && marketData.recentListings.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Activity</div>
            <div className="space-y-1">
              {marketData.recentListings.slice(0, 3).map((listing: any, index: number) => (
                <div key={index} className="flex justify-between text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded">
                  <span>{listing.source} • {listing.location}</span>
                  <span className="font-medium">{formatPrice(parseFloat(listing.price))}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Source Attribution */}
        <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
          Data from live auction sources • Last updated: {new Date(marketData.lastUpdated || Date.now()).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}