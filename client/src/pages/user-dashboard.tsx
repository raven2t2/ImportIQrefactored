import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Car, Calculator, Heart, Calendar, User, Camera, Settings, Plus, LogOut, Search, TrendingUp, Shield, Zap, BarChart3, FileText, Wrench, Database, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showWatchlistForm, setShowWatchlistForm] = useState(false);
  const queryClient = useQueryClient();

  // Logout function
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('userEmail');
    localStorage.removeItem('trialData');
    
    // Redirect to homepage
    window.location.href = '/';
  };

  // Location enable function
  const handleEnableLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Store location data
            const response = await apiRequest("POST", "/api/user/location", {
              email: userEmail,
              latitude,
              longitude,
              timestamp: new Date().toISOString()
            });

            if (response.ok) {
              alert("Location enabled! You'll now see local car events and workshops in your area.");
              // Refresh the page to show updated location-based content
              window.location.reload();
            } else {
              throw new Error("Failed to save location");
            }
          } catch (error) {
            console.error("Location save error:", error);
            alert("Location captured but failed to save. Please try again.");
          }
        },
        (error) => {
          let message = "Location access denied. You can still use all other features.";
          switch(error.code) {
            case error.PERMISSION_DENIED:
              message = "Location access denied. Please enable location permissions in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              message = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              message = "Location request timed out.";
              break;
          }
          alert(message);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

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

  // Watchlist mutation
  const createWatchlistMutation = useMutation({
    mutationFn: async (itemData: any) => {
      return await apiRequest("POST", "/api/user/my-watchlist", itemData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/my-watchlist", userId] });
      setShowWatchlistForm(false);
    },
  });

  // Fetch real market intelligence data
  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ["/api/market-intelligence"],
    refetchInterval: 300000, // Refresh every 5 minutes
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
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>ImportIQ Tools</span>
            </TabsTrigger>
            <TabsTrigger value="garage" className="flex items-center space-x-2">
              <Car className="h-4 w-4" />
              <span>My Garage</span>
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Market Intel</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>My Reports</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">ImportIQ Professional Tools</h2>
              <p className="text-gray-600 text-lg">Everything you need to make informed import decisions in one place</p>
            </div>

            {/* Core Tools Grid - All 14 ImportIQ Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              
              {/* Import Cost Calculator */}
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-brand-gold"
                    onClick={() => window.location.href = '/import-calculator'}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                      <Calculator className="h-5 w-5 text-blue-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Import Calculator</h3>
                      <p className="text-xs text-gray-600">Complete cost breakdown</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-xs">
                    Calculate Costs
                  </Button>
                </CardContent>
              </Card>

              {/* Value Estimator */}
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-brand-gold"
                    onClick={() => window.location.href = '/value-estimator'}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                      <TrendingUp className="h-5 w-5 text-green-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Value Estimator</h3>
                      <p className="text-xs text-gray-600">Market value analysis</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-xs">
                    Estimate Value
                  </Button>
                </CardContent>
              </Card>

              {/* Compliance Check */}
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-brand-gold"
                    onClick={() => window.location.href = '/compliance-check'}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                      <Shield className="h-5 w-5 text-red-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Compliance Check</h3>
                      <p className="text-xs text-gray-600">Regulatory verification</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-red-600 hover:bg-red-700 text-xs">
                    Check Compliance
                  </Button>
                </CardContent>
              </Card>

              {/* Vehicle Lookup */}
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-brand-gold"
                    onClick={() => window.location.href = '/vehicle-lookup'}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                      <Search className="h-5 w-5 text-purple-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Vehicle Lookup</h3>
                      <p className="text-xs text-gray-600">Detailed specifications</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-xs">
                    Search Vehicle
                  </Button>
                </CardContent>
              </Card>

              {/* Build Ready Tool */}
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-brand-gold"
                    onClick={() => window.location.href = '/build-ready'}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                      <Wrench className="h-5 w-5 text-amber-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">BuildReady</h3>
                      <p className="text-xs text-gray-600">Modification planning</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-xs">
                    Plan Build
                  </Button>
                </CardContent>
              </Card>

              {/* Registration Stats */}
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-brand-gold"
                    onClick={() => window.location.href = '/registration-stats'}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                      <BarChart3 className="h-5 w-5 text-indigo-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Registration Stats</h3>
                      <p className="text-xs text-gray-600">Market insights</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs">
                    View Stats
                  </Button>
                </CardContent>
              </Card>

              {/* AI Consultant */}
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-brand-gold"
                    onClick={() => window.location.href = '/ai-consultant'}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                      <Zap className="h-5 w-5 text-pink-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">AI Consultant</h3>
                      <p className="text-xs text-gray-600">Expert recommendations</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-pink-600 hover:bg-pink-700 text-xs">
                    Get Advice
                  </Button>
                </CardContent>
              </Card>

              {/* Market Intel */}
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-brand-gold"
                    onClick={() => window.location.href = '/market-intel'}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                      <Globe className="h-5 w-5 text-cyan-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Market Intel</h3>
                      <p className="text-xs text-gray-600">Real-time insights</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-cyan-600 hover:bg-cyan-700 text-xs">
                    View Market
                  </Button>
                </CardContent>
              </Card>

              {/* Vehicle Database */}
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-brand-gold"
                    onClick={() => window.location.href = '/vehicle-database'}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                      <Database className="h-5 w-5 text-slate-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Vehicle Database</h3>
                      <p className="text-xs text-gray-600">Complete specifications</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-slate-600 hover:bg-slate-700 text-xs">
                    Browse Database
                  </Button>
                </CardContent>
              </Card>

              {/* Import Timeline */}
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-brand-gold"
                    onClick={() => window.location.href = '/import-timeline'}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                      <Calendar className="h-5 w-5 text-orange-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Import Timeline</h3>
                      <p className="text-xs text-gray-600">Project planning</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700 text-xs">
                    Plan Timeline
                  </Button>
                </CardContent>
              </Card>

              {/* Cost Optimizer */}
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-brand-gold"
                    onClick={() => window.location.href = '/cost-optimizer'}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                      <TrendingUp className="h-5 w-5 text-emerald-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Cost Optimizer</h3>
                      <p className="text-xs text-gray-600">Save money tips</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs">
                    Optimize Costs
                  </Button>
                </CardContent>
              </Card>

              {/* Risk Assessor */}
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-brand-gold"
                    onClick={() => window.location.href = '/risk-assessor'}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                      <Shield className="h-5 w-5 text-yellow-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Risk Assessor</h3>
                      <p className="text-xs text-gray-600">Import risk analysis</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-yellow-600 hover:bg-yellow-700 text-xs">
                    Assess Risk
                  </Button>
                </CardContent>
              </Card>

              {/* Documentation Hub */}
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-brand-gold"
                    onClick={() => window.location.href = '/documentation-hub'}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                      <FileText className="h-5 w-5 text-teal-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Documentation Hub</h3>
                      <p className="text-xs text-gray-600">All paperwork</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700 text-xs">
                    Manage Docs
                  </Button>
                </CardContent>
              </Card>

              {/* Shipping Tracker */}
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-brand-gold"
                    onClick={() => window.location.href = '/shipping-tracker'}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                      <Car className="h-5 w-5 text-rose-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Shipping Tracker</h3>
                      <p className="text-xs text-gray-600">Real-time tracking</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-rose-600 hover:bg-rose-700 text-xs">
                    Track Shipment
                  </Button>
                </CardContent>
              </Card>

            </div>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-r from-brand-gold/10 to-amber-100 border-brand-gold/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Import?</h3>
                    <p className="text-gray-600">Get professional help with your import project</p>
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white"
                      onClick={() => window.location.href = '/subscribe'}
                    >
                      Upgrade Plan
                    </Button>
                    <Button 
                      className="bg-brand-gold hover:bg-amber-600"
                      onClick={() => window.location.href = '/contact'}
                    >
                      Get Expert Help
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Recent Calculations</span>
                    <Badge variant="outline" className="text-xs">{userCalculations?.length || 0} total</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userCalculations?.length > 0 ? (
                    <div className="space-y-3">
                      {userCalculations.slice(0, 3).map((calc: any) => (
                        <div key={calc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Calculator className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{calc.vehicleMake} {calc.vehicleModel}</p>
                              <p className="text-xs text-gray-600">${parseFloat(calc.totalCost).toLocaleString()}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs cursor-pointer">View</Badge>
                        </div>
                      ))}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-3"
                        onClick={() => setActiveTab('events')}
                      >
                        View All Calculations
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Calculator className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 mb-3">No calculations yet</p>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => window.location.href = '/import-calculator'}
                      >
                        Start First Calculation
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>My Reports</span>
                    <Badge variant="outline" className="text-xs">{savedReports?.length || 0} saved</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {savedReports?.length > 0 ? (
                    <div className="space-y-3">
                      {savedReports.slice(0, 3).map((report: any) => (
                        <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <FileText className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{report.reportType}</p>
                              <p className="text-xs text-gray-600">{new Date(report.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs cursor-pointer">Open</Badge>
                        </div>
                      ))}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-3"
                        onClick={() => setActiveTab('events')}
                      >
                        View All Reports
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 mb-3">No reports yet</p>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => window.location.href = '/value-estimator'}
                      >
                        Generate First Report
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
                <h2 className="text-2xl font-bold text-gray-900">Market Intelligence Hub</h2>
                <p className="text-gray-600">Live exchange rates, compliance updates, and shipping intelligence</p>
              </div>
              <Button 
                onClick={() => window.location.href = '/features'}
                className="bg-brand-gold hover:bg-brand-gold/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Explore Tools
              </Button>
            </div>

            {/* Market Intelligence - Primary Feature */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📊 Live Market Data</span>
                  <Badge variant="outline">LIVE</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {marketLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-600">Loading market data...</p>
                  </div>
                ) : marketData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Exchange Rates */}
                      {marketData.exchangeRates && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h3 className="font-semibold text-blue-900 mb-3">Exchange Rate Impact</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-700 font-medium">AUD/JPY:</span>
                              <span className="font-semibold text-blue-900">
                                ¥{marketData.exchangeRates.audJpy}
                                <span className={`ml-2 text-xs ${marketData.exchangeRates.change24h > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {marketData.exchangeRates.change24h > 0 ? '↗' : '↘'} {Math.abs(marketData.exchangeRates.change24h)}%
                                </span>
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-700 font-medium">AUD/USD:</span>
                              <span className="font-semibold text-blue-900">${marketData.exchangeRates.audUsd}</span>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                            <p className="text-xs text-blue-800 font-medium mb-1">💡 Smart Buying Tip:</p>
                            <p className="text-xs text-blue-800 mb-2">
                              {marketData.exchangeRates.change24h > 0 
                                ? 'Japanese cars cost more AUD today. Consider waiting for better rates or explore US muscle cars.'
                                : 'Excellent time to buy from Japan! Your AUD goes further on JDM classics and sports cars.'}
                            </p>
                            <a href="/calculator" className="text-blue-600 underline text-xs hover:text-blue-800">
                              Calculate your total import costs →
                            </a>
                          </div>
                          <p className="text-xs text-blue-600 mt-2">Updated: {new Date(marketData.exchangeRates.timestamp).toLocaleDateString()}</p>
                        </div>
                      )}

                      {/* Shipping Insights */}
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <h3 className="font-semibold text-orange-900 mb-3">Shipping Intelligence</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-orange-700 font-medium">Current delivery:</span>
                            <span className="font-semibold text-orange-900">{marketData.shippingInsights.averageDeliveryDays} days</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-orange-700 font-medium">Port operations:</span>
                            <span className="font-semibold text-orange-900">{marketData.shippingInsights.portStatus}</span>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-orange-100 rounded-lg">
                          <p className="text-xs text-orange-800 font-medium mb-1">📦 Delivery Timeline:</p>
                          <p className="text-xs text-orange-800 mb-2">
                            {marketData.shippingInsights.averageDeliveryDays <= 25 
                              ? 'Faster than usual! Your car could arrive sooner than expected. Great time to place an order.'
                              : 'Expect longer delivery times. Plan for extra weeks when scheduling compliance and pickup.'}
                          </p>
                          <a href="/timeline" className="text-orange-600 underline text-xs hover:text-orange-800">
                            Track your import timeline →
                          </a>
                        </div>
                        <p className="text-xs text-orange-600 mt-2">Updated: {marketData.shippingInsights.lastUpdated}</p>
                      </div>

                      {/* Compliance Updates */}
                      {marketData.complianceUpdates.map((update: any, index: number) => (
                        <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <h3 className="font-semibold text-purple-900 mb-2">{update.title}</h3>
                          <p className="text-sm text-purple-700 mb-3">{update.summary}</p>
                          <div className="p-2 bg-purple-100 rounded text-xs text-purple-800">
                            <strong>What this means for you:</strong> {index === 0 
                              ? 'New safety requirements may affect your import. Use our BuildReady tool to check compliance for your specific vehicle.'
                              : 'Import duties have changed. Use our cost calculator to get updated total import costs.'}
                          </div>
                          <div className="mt-2">
                            <a href={index === 0 ? "/compliance" : "/calculator"} className="text-purple-600 underline text-xs hover:text-purple-800">
                              {index === 0 ? "Check vehicle compliance →" : "Calculate new import costs →"}
                            </a>
                          </div>
                          <p className="text-xs text-purple-600 mt-2">{update.source} • {update.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Unable to load market data</p>
                  </div>
                )}
              </CardContent>
            </Card>

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
                  <Button 
                    onClick={handleEnableLocation}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
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



            {/* Watchlist Form */}
            {showWatchlistForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Add to Price Watchlist</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    createWatchlistMutation.mutate({
                      userId,
                      partName: formData.get('partName'),
                      targetPrice: parseInt(formData.get('targetPrice') as string) || null,
                      source: formData.get('source'),
                      notes: formData.get('notes'),
                    });
                  }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Input name="partName" placeholder="Part Name (e.g., Front Bumper)" className="bg-white" required />
                      <Input name="targetPrice" type="number" placeholder="Target Price ($)" className="bg-white" />
                      <Input name="source" placeholder="Source (eBay, Yahoo JP, etc.)" className="bg-white" />
                    </div>
                    <Textarea name="notes" placeholder="Notes (vehicle, condition preferences, etc.)" className="bg-white mb-4" />
                    <div className="flex space-x-2">
                      <Button 
                        type="submit" 
                        className="bg-brand-gold hover:bg-brand-gold/90"
                        disabled={createWatchlistMutation.isPending}
                      >
                        {createWatchlistMutation.isPending ? "Adding..." : "Add to Watchlist"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowWatchlistForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

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

          <TabsContent value="profile" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
              <p className="text-gray-600">Manage your account details and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Photo */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Photo</CardTitle>
                  <CardDescription>Upload or update your profile picture</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="bg-brand-gold text-white text-2xl font-medium">
                        {userData.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <input
                        type="file"
                        id="profile-photo"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            console.log("Photo selected:", file.name);
                            // TODO: Handle photo upload
                          }
                        }}
                      />
                      <label htmlFor="profile-photo">
                        <Button variant="outline" className="cursor-pointer">
                          Upload Photo
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 5MB.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Update your email and personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">Full Name</Label>
                    <Input
                      id="profile-name"
                      value={userData.name}
                      onChange={(e) => {
                        // TODO: Handle name update
                        console.log("Name updated:", e.target.value);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-email">Email Address</Label>
                    <Input
                      id="profile-email"
                      type="email"
                      value={userData.email}
                      onChange={(e) => {
                        // TODO: Handle email update
                        console.log("Email updated:", e.target.value);
                      }}
                    />
                  </div>
                  <Button className="w-full bg-brand-gold hover:bg-brand-gold/90">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button className="w-full bg-brand-gold hover:bg-brand-gold/90">
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              {/* Trial Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Trial Status</CardTitle>
                  <CardDescription>Your current subscription details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <h4 className="font-medium text-green-900">7-Day Trial Active</h4>
                      <p className="text-sm text-green-700">Expires June 9, 2025</p>
                    </div>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      5 days left
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/pricing'}
                  >
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}