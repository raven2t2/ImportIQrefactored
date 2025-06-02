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

  // Your actual user credentials - personalized for you
  const userEmail = "mragland@driveimmaculate.com";
  const userId = "user_123";
  const userName = "Michael"; // Your first name for personalization

  // Real API calls to fetch your saved data
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

  // Add saved reports data
  const { data: savedReports = [] } = useQuery({
    queryKey: ["/api/user-reports", userEmail],
    queryFn: () => fetch(`/api/user-reports?email=${userEmail}`).then(res => res.json()),
  });

  // Your personalized profile data
  const userData = {
    name: userName,
    fullName: "Michael T. Ragland",
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

            {/* Saved Reports Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Saved Reports</span>
                  <Button size="sm" variant="outline">
                    View All Reports
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savedReports.length > 0 ? (
                    savedReports.slice(0, 3).map((report: any) => (
                      <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-brand-gold/10 rounded-lg flex items-center justify-center">
                            <Calculator className="h-5 w-5 text-brand-gold" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{report.reportType}</h4>
                            <p className="text-sm text-gray-600">Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Button size="sm" variant="outline">
                            View Report
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No reports saved yet. Use any of the ImportIQ tools to generate your first report!</p>
                      <Button className="mt-4 bg-brand-gold hover:bg-brand-gold/90">
                        Explore ImportIQ Tools
                      </Button>
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
                <h2 className="text-2xl font-bold text-gray-900">Your Personal Hub</h2>
                <p className="text-gray-600">Price alerts, local events, member perks, and exclusive updates</p>
              </div>
              <Button className="bg-brand-gold hover:bg-brand-gold/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Alert
              </Button>
            </div>

            {/* Location Permission Banner */}
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Unlock Local Car Events & Workshops</h3>
                      <p className="text-sm text-gray-600">Share your location to get notified about nearby car meets, track days, and mod workshops in your area</p>
                    </div>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Enable Location
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Member-Only Mod Shop Discounts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🔥 Member-Only Mod Shop Deals</span>
                  <Badge variant="outline">COMING SOON</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-brand-gold" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Exclusive Partnerships in Development</h3>
                  <p className="text-gray-600 mb-4">We're negotiating exclusive discounts with premium mod shops for ImportIQ members. Be the first to know when deals go live!</p>
                  <Button className="bg-brand-gold hover:bg-brand-gold/90">
                    Notify Me When Available
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Price Alerts & Watchlist */}
            <Card>
              <CardHeader>
                <CardTitle>Price Alerts & Parts Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userWatchlist.length > 0 ? userWatchlist.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.partName}</h3>
                        <p className="text-sm text-gray-600">Target: ${item.targetPrice} • Current: ${item.currentPrice}</p>
                      </div>
                      <Badge variant={item.priceAlert ? "destructive" : "secondary"}>
                        {item.priceAlert ? "Price Drop!" : "Watching"}
                      </Badge>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="font-medium text-gray-900 mb-2">No price alerts set</h3>
                      <p className="text-gray-500 mb-4">Start tracking prices on parts you want for your builds</p>
                      <Button className="bg-brand-gold hover:bg-brand-gold/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Part
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Coming Soon Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🚀 Coming Soon to ImportIQ</span>
                  <Badge variant="outline">PREVIEW</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Live Auction Tracker</h4>
                    <p className="text-sm text-gray-600 mb-3">Real-time notifications for Japanese auction houses with your dream cars</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Join Early Access
                    </Button>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Mobile App</h4>
                    <p className="text-sm text-gray-600 mb-3">Access all ImportIQ tools on-the-go with push notifications for price alerts</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Get Notified
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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