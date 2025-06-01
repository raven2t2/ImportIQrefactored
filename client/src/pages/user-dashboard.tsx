import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Car, Calculator, Heart, Calendar, User, Camera, Settings, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // For demo purposes, using a test email - in production this would come from authentication
  const userEmail = "mragland@driveimmaculate.com";
  const userId = "user_123"; // Would come from auth session

  // Real API calls to fetch user's actual data
  const { data: userCalculations = [] } = useQuery({
    queryKey: ["/api/user/my-calculations", userEmail],
    queryFn: () => fetch(`/api/user/my-calculations?email=${userEmail}`).then(res => res.json()),
  });

  const { data: userRecommendations = [] } = useQuery({
    queryKey: ["/api/user/my-recommendations", userEmail],
    queryFn: () => fetch(`/api/user/my-recommendations?email=${userEmail}`).then(res => res.json()),
  });

  const { data: userBuilds = [] } = useQuery({
    queryKey: ["/api/user/my-builds", userId],
    queryFn: () => fetch(`/api/user/my-builds?userId=${userId}`).then(res => res.json()),
  });

  const { data: userWatchlist = [] } = useQuery({
    queryKey: ["/api/user/my-watchlist", userId],
    queryFn: () => fetch(`/api/user/my-watchlist?userId=${userId}`).then(res => res.json()),
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/user/dashboard-stats", userEmail, userId],
    queryFn: () => fetch(`/api/user/dashboard-stats?email=${userEmail}&userId=${userId}`).then(res => res.json()),
  });

  // User profile data (would come from auth in production)
  const userData = {
    name: userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1),
    email: userEmail,
    avatar: null,
    joinDate: "2024-01-15"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Profile */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-brand-gold text-white text-lg font-medium">
                  {userData.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {userData.name}</h1>
                <p className="text-gray-600">Your import garage dashboard</p>
              </div>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="garage" className="flex items-center space-x-2">
              <Car className="h-4 w-4" />
              <span>My Garage</span>
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Watchlist</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Import Calculations</p>
                      <p className="text-3xl font-bold text-blue-900">{dashboardStats?.totalCalculations || 0}</p>
                    </div>
                    <Calculator className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Vehicle Builds</p>
                      <p className="text-3xl font-bold text-green-900">{dashboardStats?.totalBuilds || 0}</p>
                    </div>
                    <Car className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-600 text-sm font-medium">Parts Watching</p>
                      <p className="text-3xl font-bold text-amber-900">{dashboardStats?.watchlistItems || 0}</p>
                    </div>
                    <Heart className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Calculations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Calculations</span>
                  <Button size="sm" className="bg-brand-gold hover:bg-brand-gold/90">
                    <Plus className="h-4 w-4 mr-2" />
                    New Calculation
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userCalculations.length > 0 ? (
                    userCalculations.slice(0, 3).map((calc: any) => (
                      <div key={calc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-brand-gold/10 rounded-lg flex items-center justify-center">
                            <Car className="h-5 w-5 text-brand-gold" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{calc.vehicleMake} {calc.vehicleModel} {calc.vehicleYear}</h4>
                            <p className="text-sm text-gray-600">From {calc.shippingOrigin} • {new Date(calc.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${parseFloat(calc.totalCost).toLocaleString()}</p>
                          <Badge variant="secondary" className="text-xs">
                            Completed
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No calculations yet. Start with your first import cost calculation!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="garage" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Garage</h2>
                <p className="text-gray-600">Track your imported vehicles and modification projects</p>
              </div>
              <Button className="bg-brand-gold hover:bg-brand-gold/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBuilds.length > 0 ? userBuilds.map((build: any) => (
                <Card key={build.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-200 relative">
                    {build.image ? (
                      <img src={build.image} alt={build.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{build.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{build.vehicle}</p>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">{build.stage}</Badge>
                      <span className="text-sm font-medium">${build.budget.toLocaleString()} budget</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Planned mods:</p>
                      <div className="flex flex-wrap gap-1">
                        {build.targetMods.map((mod, index) => (
                          <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {mod}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="col-span-full text-center py-12">
                  <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles in your garage yet</h3>
                  <p className="text-gray-500 mb-4">Start tracking your imported vehicles and modification projects</p>
                  <Button className="bg-brand-gold hover:bg-brand-gold/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Vehicle
                  </Button>
                </div>
              )}

              <Card className="border-dashed border-2 border-gray-300 hover:border-brand-gold transition-colors">
                <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center mb-3">
                    <Plus className="h-6 w-6 text-brand-gold" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Add New Build</h3>
                  <p className="text-sm text-gray-500">Document your next import project</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="watchlist" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Parts Watchlist</h2>
                <p className="text-gray-600">Track prices on parts you want for your builds</p>
              </div>
              <Button className="bg-brand-gold hover:bg-brand-gold/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Part
              </Button>
            </div>

            <div className="space-y-4">
              {userWatchlist.length > 0 ? userWatchlist.map((item: any) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.partName}</h3>
                        <p className="text-sm text-gray-600">For {item.vehicle}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-xs text-gray-500">Target</p>
                            <p className="font-medium">${item.targetPrice}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Current</p>
                            <p className="font-medium">${item.currentPrice}</p>
                          </div>
                        </div>
                        <Badge 
                          variant={item.priceAlert ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {item.priceAlert ? "Price Alert!" : "Watching"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No parts in watchlist</h3>
                  <p className="text-gray-500 mb-4">Start tracking prices on parts you want for your builds</p>
                  <Button className="bg-brand-gold hover:bg-brand-gold/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Part
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Car Events</h2>
              <p className="text-gray-600">Discover car meets, shows, and events near you</p>
            </div>

            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500 mb-4">Check back later for car events in your area</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}