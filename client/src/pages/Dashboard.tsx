import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  TrendingUp, 
  Eye, 
  Star, 
  DollarSign, 
  BarChart3,
  Search,
  Bookmark,
  History,
  AlertTriangle,
  CheckCircle,
  Activity
} from "lucide-react";
import { format } from "date-fns";

interface RecentLookup {
  id: number;
  vehicleMake: string;
  vehicleModel: string;
  destination: string;
  totalCost: number;
  confidenceScore: number;
  createdAt: string;
  status: string;
}

interface SavedJourney {
  id: number;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear?: number;
  currentPhase: string;
  estimatedCost: number;
  progressPercentage: number;
  nextAction: string;
  createdAt: string;
  lastUpdated: string;
}

interface WatchedVehicle {
  id: number;
  make: string;
  model: string;
  targetPrice: number;
  currentPrice: number;
  priceChange: number;
  changePercent: number;
  alertsEnabled: boolean;
  lastPriceUpdate: string;
}

interface AuctionTrend {
  make: string;
  model: string;
  avgPrice: number;
  priceChange: number;
  changePercent: number;
  listingCount: number;
  confidenceScore: number;
}

interface DashboardStats {
  totalLookups: number;
  totalSaved: number;
  totalWatched: number;
  avgConfidence: number;
}

export default function Dashboard() {
  const queryClient = useQueryClient();

  // Fetch dashboard data
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: recentLookups } = useQuery<RecentLookup[]>({
    queryKey: ['/api/dashboard/recent-lookups'],
  });

  const { data: savedJourneys } = useQuery<SavedJourney[]>({
    queryKey: ['/api/dashboard/saved-journeys'],
  });

  const { data: watchedVehicles } = useQuery<WatchedVehicle[]>({
    queryKey: ['/api/dashboard/watched-vehicles'],
  });

  const { data: auctionTrends } = useQuery<AuctionTrend[]>({
    queryKey: ['/api/dashboard/auction-trends'],
  });

  // Remove from watchlist mutation
  const removeFromWatchlist = useMutation({
    mutationFn: async (vehicleId: number) => {
      const response = await fetch(`/api/watchlist/${vehicleId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove from watchlist');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/watched-vehicles'] });
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Import Intelligence Dashboard</h1>
          <p className="text-muted-foreground">Track your vehicle import research and market insights</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lookups</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLookups || 0}</div>
            <p className="text-xs text-muted-foreground">Vehicle searches performed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Journeys</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSaved || 0}</div>
            <p className="text-xs text-muted-foreground">Import projects tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watched Vehicles</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalWatched || 0}</div>
            <p className="text-xs text-muted-foreground">Price alerts active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgConfidence || 0}%</div>
            <p className="text-xs text-muted-foreground">Data accuracy score</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recent">Recent Lookups</TabsTrigger>
          <TabsTrigger value="journeys">Saved Journeys</TabsTrigger>
          <TabsTrigger value="watchlist">Price Watchlist</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Vehicle Lookups
              </CardTitle>
              <CardDescription>
                Your latest import cost calculations and eligibility checks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {recentLookups?.map((lookup) => (
                    <div key={lookup.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {lookup.vehicleMake} {lookup.vehicleModel}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Import to {lookup.destination}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            ${lookup.totalCost.toLocaleString()}
                          </div>
                          <Badge variant={lookup.confidenceScore > 80 ? "default" : "secondary"}>
                            {lookup.confidenceScore}% confidence
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{format(new Date(lookup.createdAt), 'MMM dd, yyyy')}</span>
                        <Badge variant={lookup.status === 'eligible' ? "default" : "destructive"}>
                          {lookup.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journeys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="h-5 w-5" />
                Active Import Journeys
              </CardTitle>
              <CardDescription>
                Track progress on your vehicle import projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {savedJourneys?.map((journey) => (
                    <div key={journey.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">
                            {journey.vehicleMake} {journey.vehicleModel}
                            {journey.vehicleYear && ` (${journey.vehicleYear})`}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Current Phase: {journey.currentPhase}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            ${journey.estimatedCost.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{journey.progressPercentage}%</span>
                        </div>
                        <Progress value={journey.progressPercentage} className="h-2" />
                      </div>
                      
                      <div className="mt-3 p-2 bg-muted rounded">
                        <p className="text-sm font-medium">Next Action:</p>
                        <p className="text-sm text-muted-foreground">{journey.nextAction}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>Started {format(new Date(journey.createdAt), 'MMM dd, yyyy')}</span>
                        <span>Updated {format(new Date(journey.lastUpdated), 'MMM dd')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="watchlist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Price Watchlist
              </CardTitle>
              <CardDescription>
                Monitor auction prices for vehicles you're interested in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {watchedVehicles?.map((vehicle) => (
                    <div key={vehicle.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {vehicle.make} {vehicle.model}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Target: ${vehicle.targetPrice.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            ${vehicle.currentPrice.toLocaleString()}
                          </div>
                          <div className={`text-sm flex items-center gap-1 ${
                            vehicle.priceChange > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            <TrendingUp className="h-3 w-3" />
                            {vehicle.priceChange > 0 ? '+' : ''}
                            {vehicle.changePercent.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          {vehicle.alertsEnabled ? (
                            <Badge variant="default">Alerts On</Badge>
                          ) : (
                            <Badge variant="secondary">Alerts Off</Badge>
                          )}
                          {vehicle.currentPrice <= vehicle.targetPrice && (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Target Reached
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromWatchlist.mutate(vehicle.id)}
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        Last updated {format(new Date(vehicle.lastPriceUpdate), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Market Auction Trends
              </CardTitle>
              <CardDescription>
                Real-time pricing intelligence from authenticated auction sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {auctionTrends?.map((trend, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {trend.make} {trend.model}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {trend.listingCount} active listings
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            ${trend.avgPrice.toLocaleString()}
                          </div>
                          <div className={`text-sm flex items-center gap-1 ${
                            trend.priceChange > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <TrendingUp className="h-3 w-3" />
                            {trend.priceChange > 0 ? '+' : ''}
                            {trend.changePercent.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant={trend.confidenceScore > 80 ? "default" : "secondary"}>
                          {trend.confidenceScore}% confidence
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3" />
                          Authentic auction data
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}