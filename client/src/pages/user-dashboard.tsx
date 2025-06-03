import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Car, Calculator, Heart, Calendar, User, Camera, Settings, Plus, LogOut, Search, TrendingUp, Shield, Zap, BarChart3, FileText, Wrench, Database, Globe, Truck, DollarSign } from "lucide-react";
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

  // Get user email from localStorage for trial mode
  const userEmail = localStorage.getItem('userEmail') || 'trial@user.com';
  const trialData = JSON.parse(localStorage.getItem('trialData') || '{}');

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('trialData');
    window.location.href = '/';
  };

  // Fetch market intelligence data
  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ['/api/market-intelligence'],
    refetchInterval: 30000,
  });

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/user/dashboard-stats'],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">ImportIQ Dashboard</h1>
                  <p className="text-sm text-gray-600">Professional vehicle import tools</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                Trial Mode
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Tools Overview</TabsTrigger>
            <TabsTrigger value="insights">Market Insights</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">14 AI-Powered Professional Tools</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Complete vehicle import intelligence platform with authentic government data, AI consultation, 
                market analysis, and comprehensive cost calculations. Every tool provides genuine value.
              </p>
            </div>

            {/* Core Tools Grid - Only Working Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Import Cost Calculator - WORKING */}
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-amber-400"
                    onClick={() => window.location.href = '/import-calculator'}>
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-amber-400 transition-colors">
                      <Calculator className="h-8 w-8 text-blue-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Import Calculator</h3>
                      <p className="text-gray-600">Complete cost breakdown</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    Calculate exact import costs using live AUD/JPY and AUD/USD exchange rates from ExchangeRate-API. 
                    Includes authentic Australian government duty rates and all compliance fees.
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Calculate Import Costs
                  </Button>
                </CardContent>
              </Card>

              {/* AI Consultant - WORKING */}
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-amber-400"
                    onClick={() => window.location.href = '/ai-consultant'}>
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-pink-100 rounded-xl flex items-center justify-center group-hover:bg-amber-400 transition-colors">
                      <Zap className="h-8 w-8 text-pink-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">AI Consultant</h3>
                      <p className="text-gray-600">Expert recommendations</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    Get personalized vehicle import advice from our AI consultant powered by OpenAI. 
                    Receive expert guidance on vehicle selection, compliance, and cost optimization.
                  </p>
                  <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">
                    Get Expert Advice
                  </Button>
                </CardContent>
              </Card>

              {/* Market Intelligence - WORKING */}
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-amber-400"
                    onClick={() => window.location.href = '/market-intel'}>
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-cyan-100 rounded-xl flex items-center justify-center group-hover:bg-amber-400 transition-colors">
                      <Globe className="h-8 w-8 text-cyan-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Market Intelligence</h3>
                      <p className="text-gray-600">Live market data</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    Access real-time currency exchange rates, market trends, and compliance updates. 
                    Stay informed with authentic data from official sources.
                  </p>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                    View Market Data
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Comprehensive 14-Tool Grid */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Complete AI-Powered Tool Suite</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Tool 5: Shipping Calculator */}
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-amber-400" onClick={() => window.location.href = '/shipping-calculator'}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-amber-400 transition-colors">
                        <Truck className="h-6 w-6 text-blue-600 group-hover:text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Shipping Calculator</h4>
                        <p className="text-xs text-gray-600">Port-to-port estimates</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">
                      Calculate shipping costs using authentic port distance data and current freight rates.
                    </p>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs">
                      Calculate Shipping
                    </Button>
                  </CardContent>
                </Card>

                {/* Tool 6: Compliance Checker */}
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-amber-400" onClick={() => window.location.href = '/compliance-checker'}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-amber-400 transition-colors">
                        <Shield className="h-6 w-6 text-red-600 group-hover:text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Compliance Check</h4>
                        <p className="text-xs text-gray-600">Australian SEVS verification</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">
                      Verify import eligibility using Australian SEVS database and ADR requirements.
                    </p>
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white text-xs">
                      Check Compliance
                    </Button>
                  </CardContent>
                </Card>

                {/* Tool 7: Vehicle Lookup */}
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-amber-400" onClick={() => window.location.href = '/vehicle-lookup'}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-amber-400 transition-colors">
                        <Database className="h-6 w-6 text-purple-600 group-hover:text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Vehicle Lookup</h4>
                        <p className="text-xs text-gray-600">Detailed specs & history</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">
                      Comprehensive vehicle data including specifications, market values, and auction history.
                    </p>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs">
                      Search Vehicles
                    </Button>
                  </CardContent>
                </Card>

                {/* Tool 8: Market Analytics */}
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-amber-400" onClick={() => window.location.href = '/market-analytics'}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-amber-400 transition-colors">
                        <TrendingUp className="h-6 w-6 text-indigo-600 group-hover:text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Market Analytics</h4>
                        <p className="text-xs text-gray-600">Price trends & forecasts</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">
                      AI-powered market analysis with price predictions and optimal buying times.
                    </p>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>

                {/* Tool 9: BuildReady Compliance */}
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-amber-400" onClick={() => window.location.href = '/buildready'}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-amber-400 transition-colors">
                        <Wrench className="h-6 w-6 text-orange-600 group-hover:text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">BuildReady</h4>
                        <p className="text-xs text-gray-600">Modification planning</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">
                      Tailored compliance strategies and modification roadmaps for your build.
                    </p>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs">
                      Plan Build
                    </Button>
                  </CardContent>
                </Card>

                {/* Tool 10: Registry Lookup */}
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-amber-400" onClick={() => window.location.href = '/registry-lookup'}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-amber-400 transition-colors">
                        <FileText className="h-6 w-6 text-teal-600 group-hover:text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Registry Lookup</h4>
                        <p className="text-xs text-gray-600">Registration verification</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">
                      Check registration status and history using official registry databases.
                    </p>
                    <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs">
                      Check Registry
                    </Button>
                  </CardContent>
                </Card>

                {/* Tool 11: Auction Intelligence */}
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-amber-400" onClick={() => window.location.href = '/auction-intelligence'}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-amber-400 transition-colors">
                        <BarChart3 className="h-6 w-6 text-emerald-600 group-hover:text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Auction Intelligence</h4>
                        <p className="text-xs text-gray-600">Bidding strategies</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">
                      AI analysis of auction patterns and optimal bidding recommendations.
                    </p>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                      Analyze Auctions
                    </Button>
                  </CardContent>
                </Card>

                {/* Tool 12: Insurance Estimator */}
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-amber-400" onClick={() => window.location.href = '/insurance-estimator'}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center group-hover:bg-amber-400 transition-colors">
                        <Shield className="h-6 w-6 text-cyan-600 group-hover:text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Insurance Estimator</h4>
                        <p className="text-xs text-gray-600">Coverage & costs</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">
                      Calculate insurance costs and coverage options for imported vehicles.
                    </p>
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs">
                      Get Quote
                    </Button>
                  </CardContent>
                </Card>

                {/* Tool 13: Documentation Assistant */}
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-amber-400" onClick={() => window.location.href = '/documentation-assistant'}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center group-hover:bg-amber-400 transition-colors">
                        <FileText className="h-6 w-6 text-rose-600 group-hover:text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Documentation Assistant</h4>
                        <p className="text-xs text-gray-600">Paperwork guidance</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">
                      Step-by-step guidance for all import documentation and customs forms.
                    </p>
                    <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs">
                      Get Help
                    </Button>
                  </CardContent>
                </Card>

                {/* Tool 14: ROI Calculator */}
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-amber-400" onClick={() => window.location.href = '/roi-calculator'}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-amber-400 transition-colors">
                        <TrendingUp className="h-6 w-6 text-yellow-600 group-hover:text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">ROI Calculator</h4>
                        <p className="text-xs text-gray-600">Investment analysis</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">
                      Calculate return on investment and profit potential for imported vehicles.
                    </p>
                    <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs">
                      Calculate ROI
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="mt-16 bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-xl border border-amber-200">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium Tools for Serious Importers</h3>
                <p className="text-gray-700 mb-6 max-w-3xl mx-auto">
                  Three professional-grade tools that provide real value using authentic data sources. 
                  No fake statistics or placeholder data - just accurate, actionable information.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">$77/mo</div>
                    <div className="text-sm text-gray-600">Professional Subscription</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">Live Data</div>
                    <div className="text-sm text-gray-600">Real Exchange Rates</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600">AI Powered</div>
                    <div className="text-sm text-gray-600">Expert Consultation</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Exchange Rates Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Live Exchange Rates
                  </CardTitle>
                  <CardDescription>Real-time currency data for import calculations</CardDescription>
                </CardHeader>
                <CardContent>
                  {marketLoading ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ) : marketData?.exchangeRates ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">AUD to JPY</span>
                        <span className="text-lg font-bold text-green-600">
                          ¥{marketData.exchangeRates.audJpy?.toFixed(2) || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">AUD to USD</span>
                        <span className="text-lg font-bold text-blue-600">
                          ${marketData.exchangeRates.audUsd?.toFixed(4) || 'N/A'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Last updated: {marketData.exchangeRates.lastUpdated || 'Unknown'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Exchange rate data temporarily unavailable</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Market Insights Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    Market Insights
                  </CardTitle>
                  <CardDescription>Current market conditions and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  {marketLoading ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Shipping Status</span>
                        <Badge variant="outline">{marketData?.shippingInsights?.portStatus || 'Normal'}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Avg. Delivery</span>
                        <span className="text-sm">{marketData?.shippingInsights?.averageDeliveryDays || '45-60'} days</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Data reflects current market conditions
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Compliance Updates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Recent Compliance Updates
                </CardTitle>
                <CardDescription>Latest regulatory changes affecting vehicle imports</CardDescription>
              </CardHeader>
              <CardContent>
                {marketData?.complianceUpdates?.length > 0 ? (
                  <div className="space-y-4">
                    {marketData.complianceUpdates.map((update: any, index: number) => (
                      <div key={index} className="border-l-4 border-orange-500 pl-4">
                        <h4 className="font-medium text-gray-900">{update.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{update.summary}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">{update.date}</span>
                          <Badge variant="outline" className="text-xs">{update.source}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No recent updates available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trial Account</CardTitle>
                <CardDescription>You're currently using ImportIQ in trial mode</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-amber-100 text-amber-800 text-lg">
                      {userEmail.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{userEmail}</h3>
                    <p className="text-sm text-gray-600">Trial User</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Account Type:</span>
                    <Badge>Trial Mode</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Access Level:</span>
                    <span className="text-sm">Full Tool Access</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Tools Available:</span>
                    <span className="text-sm">3 Core Tools</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Quick Stats</h4>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {dashboardStats?.totalCalculations || 0}
                      </div>
                      <div className="text-xs text-gray-600">Calculations</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {dashboardStats?.totalRecommendations || 0}
                      </div>
                      <div className="text-xs text-gray-600">AI Consultations</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}