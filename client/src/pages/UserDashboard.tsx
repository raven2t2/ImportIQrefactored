import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Car, Calculator, History, Heart, TrendingUp } from "lucide-react";
import { Link } from "wouter";

interface SavedVehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  price: string;
  estimatedTotal: string;
  savedAt: string;
  sourceSite: string;
}

interface CostEstimate {
  id: number;
  vehicleMake?: string;
  vehicleModel?: string;
  vehiclePrice: string;
  totalCost: string;
  createdAt: string;
  shippingOrigin: string;
}

interface UserJourney {
  id: number;
  journeyType: string;
  vehicleDetails: any;
  currentStep: string;
  completionPercent: number;
  lastActivity: string;
}

interface DashboardData {
  totalEstimates: number;
  totalSavings: string;
  recentActivity: number;
  favoriteMarket: string;
}

export default function UserDashboard() {
  const [savedVehicles, setSavedVehicles] = useState<SavedVehicle[]>([]);
  const [costEstimates, setCostEstimates] = useState<CostEstimate[]>([]);
  const [userJourneys, setUserJourneys] = useState<UserJourney[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch saved vehicles
      const savedResponse = await fetch('/api/user/saved-vehicles');
      if (savedResponse.ok) {
        const savedData = await savedResponse.json();
        setSavedVehicles(savedData.data || []);
      }

      // Fetch cost estimates
      const estimatesResponse = await fetch('/api/user/cost-estimates');
      if (estimatesResponse.ok) {
        const estimatesData = await estimatesResponse.json();
        setCostEstimates(estimatesData.data || []);
      }

      // Fetch user journeys
      const journeysResponse = await fetch('/api/user/journeys');
      if (journeysResponse.ok) {
        const journeysData = await journeysResponse.json();
        setUserJourneys(journeysData.data || []);
      }

      // Fetch dashboard overview
      const overviewResponse = await fetch('/api/user/dashboard-overview');
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
        setDashboardData(overviewData.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getJourneyProgress = (journey: UserJourney) => {
    const steps = ['search', 'calculate', 'compliance', 'shipping', 'complete'];
    const currentIndex = steps.indexOf(journey.currentStep);
    return Math.max(20, (currentIndex + 1) / steps.length * 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Import Dashboard</h1>
          <p className="text-muted-foreground">
            Track your vehicle import journey and manage your preferences
          </p>
        </div>
        <Link href="/import-calculator">
          <Button>
            <Calculator className="h-4 w-4 mr-2" />
            New Calculation
          </Button>
        </Link>
      </div>

      {/* Dashboard Overview Cards */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <Calculator className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Estimates</p>
                <p className="text-2xl font-bold">{dashboardData.totalEstimates}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potential Savings</p>
                <p className="text-2xl font-bold">{formatCurrency(dashboardData.totalSavings)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <History className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Activity</p>
                <p className="text-2xl font-bold">{dashboardData.recentActivity}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Car className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Favorite Market</p>
                <p className="text-lg font-bold">{dashboardData.favoriteMarket}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="estimates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="estimates">Cost Estimates</TabsTrigger>
          <TabsTrigger value="saved">Saved Vehicles</TabsTrigger>
          <TabsTrigger value="journeys">Import Journeys</TabsTrigger>
        </TabsList>

        <TabsContent value="estimates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Import Cost Estimates</CardTitle>
              <CardDescription>
                Your calculated import costs and vehicle comparisons
              </CardDescription>
            </CardHeader>
            <CardContent>
              {costEstimates.length > 0 ? (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {costEstimates.map((estimate) => (
                      <div key={estimate.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">
                            {estimate.vehicleMake} {estimate.vehicleModel}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            From {estimate.shippingOrigin} • {formatDate(estimate.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Vehicle Price</p>
                          <p className="font-medium">{formatCurrency(estimate.vehiclePrice)}</p>
                          <p className="text-sm text-muted-foreground">Total Cost</p>
                          <p className="text-lg font-bold text-primary">{formatCurrency(estimate.totalCost)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No cost estimates yet</p>
                  <Link href="/import-calculator">
                    <Button className="mt-4">Create Your First Estimate</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Vehicles</CardTitle>
              <CardDescription>
                Vehicles you've bookmarked for future consideration
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedVehicles.length > 0 ? (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {savedVehicles.map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center">
                          <Heart className="h-5 w-5 text-red-500 mr-3" />
                          <div>
                            <p className="font-medium">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {vehicle.sourceSite} • Saved {formatDate(vehicle.savedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Listed Price</p>
                          <p className="font-medium">{formatCurrency(vehicle.price)}</p>
                          <p className="text-sm text-muted-foreground">Est. Total</p>
                          <p className="text-lg font-bold text-primary">{formatCurrency(vehicle.estimatedTotal)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No saved vehicles yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Browse our vehicle search to save your favorites
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journeys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Journeys</CardTitle>
              <CardDescription>
                Track your ongoing vehicle import processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userJourneys.length > 0 ? (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {userJourneys.map((journey) => (
                      <div key={journey.id} className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium capitalize">{journey.journeyType} Journey</p>
                            <p className="text-sm text-muted-foreground">
                              Last activity: {formatDate(journey.lastActivity)}
                            </p>
                          </div>
                          <Badge variant={journey.completionPercent === 100 ? "default" : "secondary"}>
                            {journey.completionPercent}% Complete
                          </Badge>
                        </div>
                        
                        <div className="w-full bg-background rounded-full h-2 mb-3">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getJourneyProgress(journey)}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Current step: <span className="capitalize">{journey.currentStep}</span>
                          </p>
                          <Button size="sm" variant="outline">
                            Continue Journey
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active import journeys</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start your first vehicle import journey today
                  </p>
                  <Link href="/vehicle-lookup">
                    <Button className="mt-4">Begin Import Journey</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}