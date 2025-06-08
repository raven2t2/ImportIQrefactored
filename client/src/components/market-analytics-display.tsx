import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Clock } from "lucide-react";

interface MarketAnalyticsDisplayProps {
  make: string;
  model: string;
  year?: number;
}

interface MarketAnalytics {
  id: number;
  make: string;
  model: string;
  year?: number;
  averagePrice: string;
  priceVariance: string;
  activeListings: number;
  marketTrend: string;
  importVolume: string;
  bestImportWindow: string;
  timingInsight: string;
  lastUpdated: string;
}

export function MarketAnalyticsDisplay({ make, model, year }: MarketAnalyticsDisplayProps) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/market-intelligence', make, model, year],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (year) params.append('year', year.toString());
      
      const response = await fetch(`/api/market-intelligence/${make}/${model}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch market analytics');
      return response.json();
    },
    enabled: Boolean(make && model)
  }) as { data: MarketAnalytics | undefined, isLoading: boolean };

  if (isLoading) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Loading Market Analytics...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Market Analytics
          </CardTitle>
          <CardDescription>
            No market data available for this vehicle
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising': return 'text-green-400';
      case 'falling': return 'text-red-400';
      case 'stable': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getVolumeColor = (volume: string) => {
    switch (volume) {
      case 'high': return 'text-green-400';
      case 'moderate': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Market Analytics
        </CardTitle>
        <CardDescription>
          Real-time insights from global auction networks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                {parseFloat(analytics.priceVariance).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-400">Price Variance</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {analytics.activeListings}
              </div>
              <div className="text-xs text-gray-400">Active Listings</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Market Trend</span>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 ${analytics.marketTrend === 'stable' ? 'bg-green-400' : analytics.marketTrend === 'rising' ? 'bg-blue-400' : 'bg-red-400'} rounded-full`}></div>
                <span className={`text-sm ${getTrendColor(analytics.marketTrend)}`}>
                  {analytics.marketTrend.charAt(0).toUpperCase() + analytics.marketTrend.slice(1)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Import Volume</span>
              <span className={`text-sm ${getVolumeColor(analytics.importVolume)}`}>
                {analytics.importVolume.charAt(0).toUpperCase() + analytics.importVolume.slice(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Best Import Window</span>
              <span className="text-sm text-blue-400">{analytics.bestImportWindow}</span>
            </div>
          </div>
          
          <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-blue-400 mt-0.5" />
              <div>
                <p className="text-xs text-blue-300 font-medium mb-1">Timing Insight</p>
                <p className="text-xs text-blue-200">
                  {analytics.timingInsight}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}