import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Car, Calculator, Heart, Calendar, User, Camera, Settings, Plus, LogOut, Search, TrendingUp, Shield, Zap, BarChart3, FileText, Wrench, Database, Globe, Truck, DollarSign, Ship, FileCheck, BookOpen, Gavel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";

// Tool Card Component
const ToolCard = ({ icon: Icon, title, description, detail, color, onClick }: {
  icon: any;
  title: string;
  description: string;
  detail: string;
  color: string;
  onClick: () => void;
}) => {
  const colorClasses = {
    purple: "bg-purple-100 text-purple-600 group-hover:bg-amber-400 group-hover:text-white",
    orange: "bg-orange-100 text-orange-600 group-hover:bg-amber-400 group-hover:text-white",
    emerald: "bg-emerald-100 text-emerald-600 group-hover:bg-amber-400 group-hover:text-white",
    blue: "bg-blue-100 text-blue-600 group-hover:bg-amber-400 group-hover:text-white",
    slate: "bg-slate-100 text-slate-600 group-hover:bg-amber-400 group-hover:text-white",
    cyan: "bg-cyan-100 text-cyan-600 group-hover:bg-amber-400 group-hover:text-white",
    amber: "bg-amber-100 text-amber-600 group-hover:bg-amber-400 group-hover:text-white",
    red: "bg-red-100 text-red-600 group-hover:bg-amber-400 group-hover:text-white",
    green: "bg-green-100 text-green-600 group-hover:bg-amber-400 group-hover:text-white",
    violet: "bg-violet-100 text-violet-600 group-hover:bg-amber-400 group-hover:text-white"
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-amber-400" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
            <p className="text-xs text-gray-600">{description}</p>
          </div>
        </div>
        <p className="text-xs text-gray-600 mb-3">{detail}</p>
        <Button className={`w-full text-white text-xs h-8 bg-${color}-600 hover:bg-${color}-700`}>
          Open Tool
        </Button>
      </CardContent>
    </Card>
  );
};

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

            {/* All 14 Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Import Cost Calculator */}
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-amber-400"
                    onClick={() => window.location.href = '/import-calculator'}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-amber-400 transition-colors">
                      <Calculator className="h-5 w-5 text-blue-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Import Calculator</h4>
                      <p className="text-xs text-gray-600">Cost breakdown</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    Calculate exact costs using live exchange rates and authentic government duty rates.
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8">
                    Calculate Costs
                  </Button>
                </CardContent>
              </Card>

              {/* AI Consultant */}
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-amber-400"
                    onClick={() => window.location.href = '/ai-consultant'}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-amber-400 transition-colors">
                      <Zap className="h-5 w-5 text-pink-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">AI Consultant</h4>
                      <p className="text-xs text-gray-600">Expert advice</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    Get personalized vehicle import advice powered by OpenAI.
                  </p>
                  <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white text-xs h-8">
                    Get Advice
                  </Button>
                </CardContent>
              </Card>

              {/* Compliance Checker */}
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-amber-400"
                    onClick={() => window.location.href = '/compliance-checker'}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-amber-400 transition-colors">
                      <FileCheck className="h-5 w-5 text-green-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Compliance Checker</h4>
                      <p className="text-xs text-gray-600">SEVS eligibility</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    Check vehicle eligibility using authentic SEVS database.
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-xs h-8">
                    Check Compliance
                  </Button>
                </CardContent>
              </Card>

              {/* Vehicle Lookup */}
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-amber-400"
                    onClick={() => window.location.href = '/vehicle-lookup'}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-amber-400 transition-colors">
                      <Search className="h-5 w-5 text-indigo-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Vehicle Lookup</h4>
                      <p className="text-xs text-gray-600">Smart search</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    Search for specific vehicles with intelligent recommendations.
                  </p>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8">
                    Search Vehicles
                  </Button>
                </CardContent>
              </Card>

              {/* Shipping Calculator */}
              <ToolCard 
                icon={Ship}
                title="Shipping Calculator"
                description="Real distance calculations"
                detail="Calculate shipping costs using authentic port-to-port distances and market rates."
                color="purple"
                onClick={() => window.location.href = '/shipping-calculator'}
              />

              {/* Insurance Estimator */}
              <ToolCard 
                icon={Shield}
                title="Insurance Estimator"
                description="ACCC industry data"
                detail="Get insurance quotes based on official Australian industry reports."
                color="orange"
                onClick={() => window.location.href = '/insurance-estimator'}
              />

              {/* ROI Calculator */}
              <ToolCard 
                icon={TrendingUp}
                title="ROI Calculator"
                description="Historical analysis"
                detail="Calculate investment returns using ABS market appreciation data."
                color="emerald"
                onClick={() => window.location.href = '/roi-calculator'}
              />

              {/* Market Analytics */}
              <ToolCard 
                icon={BarChart3}
                title="Market Analytics"
                description="FCAI trend data"
                detail="Access Federal Chamber of Automotive Industries market intelligence."
                color="blue"
                onClick={() => window.location.href = '/market-analytics'}
              />

              {/* Documentation Assistant */}
              <ToolCard 
                icon={FileText}
                title="Documentation Assistant"
                description="Government requirements"
                detail="Official Department of Infrastructure import documentation guide."
                color="slate"
                onClick={() => window.location.href = '/documentation-assistant'}
              />

              {/* Registry Lookup */}
              <ToolCard 
                icon={Database}
                title="Registry Lookup"
                description="Format validation"
                detail="Validate VIN, compliance plates, and import approval numbers."
                color="cyan"
                onClick={() => window.location.href = '/registry-lookup'}
              />

              {/* BuildReady */}
              <ToolCard 
                icon={Wrench}
                title="BuildReady"
                description="ADR compliance"
                detail="Tailored compliance strategies using Australian Design Rules."
                color="amber"
                onClick={() => window.location.href = '/buildready'}
              />

              {/* Auction Intelligence */}
              <ToolCard 
                icon={Gavel}
                title="Auction Intelligence"
                description="Market patterns"
                detail="Real auction data analysis and bidding strategies."
                color="red"
                onClick={() => window.location.href = '/auction-intelligence'}
              />

              {/* Exchange Tracker */}
              <ToolCard 
                icon={DollarSign}
                title="Exchange Tracker"
                description="Live rates"
                detail="Real-time AUD/JPY and AUD/USD exchange rate monitoring."
                color="green"
                onClick={() => window.location.href = '/exchange-tracker'}
              />

              {/* Model Guide */}
              <ToolCard 
                icon={BookOpen}
                title="Model Guide"
                description="Comprehensive database"
                detail="Detailed specifications and import eligibility for popular models."
                color="violet"
                onClick={() => window.location.href = '/model-guide'}
              />

              {/* Market Intelligence */}
              <ToolCard 
                icon={Globe}
                title="Market Intelligence"
                description="Live market data"
                detail="Real-time exchange rates, market trends, and compliance updates from official sources."
                color="cyan"
                onClick={() => window.location.href = '/market-intel'}
              />
            </div>
            
            {/* Complete 14-Tool Grid */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Complete AI-Powered Tool Suite</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Tool 1: Cost Calculator */}
                <ToolCard 
                  icon={Calculator}
                  title="Cost Calculator"
                  description="Complete import cost analysis"
                  detail="Calculate all import costs including duty, GST, LCT, and shipping fees."
                  color="emerald"
                  onClick={() => window.location.href = '/cost-calculator'}
                />

                {/* Tool 2: Shipping Calculator */}
                <ToolCard 
                  icon={Truck}
                  title="Shipping Calculator"
                  description="Port-to-port estimates"
                  detail="Calculate shipping costs using authentic port distance data and current freight rates."
                  color="blue"
                  onClick={() => window.location.href = '/shipping-calculator'}
                />

                {/* Tool 3: Compliance Checker */}
                <ToolCard 
                  icon={Shield}
                  title="Compliance Checker"
                  description="Australian SEVS verification"
                  detail="Verify import eligibility using Australian SEVS database and ADR requirements."
                  color="red"
                  onClick={() => window.location.href = '/compliance-checker'}
                />

                {/* Tool 4: Build Ready */}
                <ToolCard 
                  icon={Wrench}
                  title="Build Ready"
                  description="Modification compliance guide"
                  detail="Get modification requirements and compliance strategies for your build."
                  color="orange"
                  onClick={() => window.location.href = '/build-ready'}
                />

                {/* Tool 5: Vehicle Lookup */}
                <ToolCard 
                  icon={Search}
                  title="Vehicle Lookup"
                  description="Dual-mode search system"
                  detail="Search vehicles by VIN or specifications with Australian market data."
                  color="purple"
                  onClick={() => window.location.href = '/vehicle-lookup'}
                />

                {/* Tool 6: Auction Analytics */}
                <ToolCard 
                  icon={TrendingUp}
                  title="Auction Analytics"
                  description="Market price intelligence"
                  detail="Analyze auction trends and pricing data for informed purchasing decisions."
                  color="cyan"
                  onClick={() => window.location.href = '/auction-analytics'}
                />

                {/* Tool 7: ROI Calculator */}
                <ToolCard 
                  icon={DollarSign}
                  title="ROI Calculator"
                  description="Investment analysis"
                  detail="Calculate return on investment for import and resale scenarios."
                  color="green"
                  onClick={() => window.location.href = '/roi-calculator'}
                />

                {/* Tool 8: Document Manager */}
                <ToolCard 
                  icon={FileText}
                  title="Document Manager"
                  description="Import documentation tracking"
                  detail="Track and manage all required import documentation and certificates."
                  color="slate"
                  onClick={() => window.location.href = '/document-manager'}
                />

                {/* Tool 9: Market Intelligence */}
                <ToolCard 
                  icon={Globe}
                  title="Market Intelligence"
                  description="Live market data"
                  detail="Real-time exchange rates, market trends, and compliance updates."
                  color="violet"
                  onClick={() => window.location.href = '/market-intel'}
                />

                {/* Tool 10: AI Consultant */}
                <ToolCard 
                  icon={Zap}
                  title="AI Consultant"
                  description="Expert recommendations"
                  detail="Get personalized vehicle import advice from our AI consultant."
                  color="amber"
                  onClick={() => window.location.href = '/ai-consultant'}
                />

                {/* Tool 11: Inspector Connect */}
                <ToolCard 
                  icon={Camera}
                  title="Inspector Connect"
                  description="Pre-purchase inspections"
                  detail="Connect with verified inspectors for pre-purchase vehicle assessments."
                  color="emerald"
                  onClick={() => window.location.href = '/inspector-connect'}
                />

                {/* Tool 12: Model Guide */}
                <ToolCard 
                  icon={BookOpen}
                  title="Model Guide"
                  description="Comprehensive database"
                  detail="Detailed specifications and import eligibility for popular models."
                  color="blue"
                  onClick={() => window.location.href = '/model-guide'}
                />

                {/* Tool 13: Registry Tracker */}
                <ToolCard 
                  icon={FileCheck}
                  title="Registry Tracker"
                  description="State registration monitoring"
                  detail="Track registration requirements and processes across Australian states."
                  color="red"
                  onClick={() => window.location.href = '/registry-tracker'}
                />

                {/* Tool 14: Legal Advisory */}
                <ToolCard 
                  icon={Gavel}
                  title="Legal Advisory"
                  description="Compliance law guidance"
                  detail="Navigate import regulations with expert legal guidance and updates."
                  color="purple"
                  onClick={() => window.location.href = '/legal-advisory'}
                />

              </div>
            </div>

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