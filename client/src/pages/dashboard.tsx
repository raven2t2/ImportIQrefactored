import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Users, Calculator, Brain, FileText, Download, Calendar, Clock, Phone, Mail, Menu, X } from "lucide-react";
import { Plus, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import logoPath from "@assets/circular imi logo (3).png";

interface Submission {
  id: number;
  fullName: string;
  email: string;
  vehiclePrice: string;
  shippingOrigin: string;
  totalCost: string;
  serviceTier: string;
  createdAt: string;
  zipCode?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
}

interface AIRecommendation {
  id: number;
  name: string;
  email: string;
  budget: number;
  intendedUse: string;
  experience: string;
  preferences: string;
  timeline: string;
  createdAt: string;
}

interface DashboardStats {
  totalSubmissions: number;
  totalAIRecommendations: number;
  totalRevenuePotential: number;
  conversionRate: number;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ["/api/admin/submissions"],
    refetchInterval: 30000,
  });

  const { data: aiRecommendations = [] } = useQuery({
    queryKey: ["/api/admin/ai-recommendations"],
    refetchInterval: 30000,
  });

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getServiceTierColor = (tier: string) => {
    switch (tier) {
      case "Essentials": return "bg-green-100 text-green-800";
      case "Concierge": return "bg-blue-100 text-blue-800";
      case "Elite": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const exportToCsv = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(header => `"${row[header] || ""}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-black border-b border-gray-800 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <img 
                src={logoPath} 
                alt="ImportIQ" 
                className="h-8 w-8 rounded-full"
              />
              <span className="text-xl font-bold text-white">ImportIQ</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Home</Link>
              <Link href="/features" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Features</Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Pricing</Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Our Mission</Link>
              <Link href="/affiliate-signup" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Refer & Earn</Link>
              <Link href="/subscribe">
                <Button className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-2 rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-xl">
                  Upgrade Now
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-amber-400"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-gray-900 border-t border-gray-800">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link href="/" className="block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-300">Home</Link>
                <Link href="/features" className="block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-300">Features</Link>
                <Link href="/pricing" className="block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-300">Pricing</Link>
                <Link href="/about" className="block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-300">Our Mission</Link>
                <Link href="/affiliate-signup" className="block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-300">Refer & Earn</Link>
                <Link href="/subscribe">
                  <Button className="w-full mt-2 bg-amber-400 hover:bg-amber-500 text-black font-medium">
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-brand-gold rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Immaculate Imports Dashboard</h1>
                <p className="text-sm text-gray-600">Lead management and analytics</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex w-full overflow-x-auto">
            <TabsTrigger value="overview" className="whitespace-nowrap">Overview</TabsTrigger>
            <TabsTrigger value="market" className="whitespace-nowrap">Market Data</TabsTrigger>
            <TabsTrigger value="calculator" className="whitespace-nowrap">Calculator Leads</TabsTrigger>
            <TabsTrigger value="ai-recs" className="whitespace-nowrap">AI Recommendations</TabsTrigger>
            <TabsTrigger value="garage" className="whitespace-nowrap">My Garage</TabsTrigger>
            <TabsTrigger value="watchlist" className="whitespace-nowrap">Parts Watchlist</TabsTrigger>
            <TabsTrigger value="events" className="whitespace-nowrap">Car Events</TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Market Data Backend</h2>
              <Button onClick={() => fetch('/api/refresh-market-data', { method: 'POST' })}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">70</div>
                  <div className="text-sm text-gray-600">Total Vehicles</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">510</div>
                  <div className="text-sm text-gray-600">Total Images</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">Live</div>
                  <div className="text-sm text-gray-600">Data Status</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">12h</div>
                  <div className="text-sm text-gray-600">Refresh Interval</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(submissions.length + aiRecommendations.length)}</div>
                  <p className="text-xs text-muted-foreground">
                    All calculator and AI leads
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Calculator Submissions</CardTitle>
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{submissions.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Import cost calculations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Recommendations</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{aiRecommendations.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Vehicle recommendation requests
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue Potential</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      submissions.reduce((sum, sub) => sum + parseFloat(sub.totalCost || "0"), 0)
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total project value
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...submissions, ...aiRecommendations]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 10)
                    .map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-brand-gold rounded-full">
                          {"totalCost" in item ? <Calculator className="h-4 w-4 text-white" /> : <Brain className="h-4 w-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {"fullName" in item ? item.fullName : item.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {"totalCost" in item ? `Calculator: ${formatCurrency(item.totalCost)}` : `AI Recs: ${formatCurrency(item.budget)} budget`}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(item.createdAt)}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Calculator Submissions</h2>
              <Button 
                onClick={() => exportToCsv(submissions, "calculator-leads.csv")}
                className="bg-brand-gold hover:bg-brand-gold-dark"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Service Tier</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.fullName}</TableCell>
                        <TableCell>{submission.email}</TableCell>
                        <TableCell>
                          {submission.vehicleYear && submission.vehicleMake && submission.vehicleModel 
                            ? `${submission.vehicleYear} ${submission.vehicleMake} ${submission.vehicleModel}`
                            : "Not specified"
                          }
                        </TableCell>
                        <TableCell>{submission.zipCode || "Not provided"}</TableCell>
                        <TableCell>{formatCurrency(submission.totalCost)}</TableCell>
                        <TableCell>
                          <Badge className={getServiceTierColor(submission.serviceTier)}>
                            {submission.serviceTier}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(submission.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-recs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">AI Recommendation Requests</h2>
              <Button 
                onClick={() => exportToCsv(aiRecommendations, "ai-recommendation-leads.csv")}
                className="bg-brand-gold hover:bg-brand-gold-dark"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Intended Use</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Timeline</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiRecommendations.map((rec) => (
                      <TableRow key={rec.id}>
                        <TableCell className="font-medium">{rec.name}</TableCell>
                        <TableCell>{rec.email}</TableCell>
                        <TableCell>{formatCurrency(rec.budget)}</TableCell>
                        <TableCell className="capitalize">{rec.intendedUse}</TableCell>
                        <TableCell className="capitalize">{rec.experience}</TableCell>
                        <TableCell className="capitalize">{rec.timeline}</TableCell>
                        <TableCell>{formatDate(rec.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="garage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Vehicle Builds</CardTitle>
                <p className="text-sm text-muted-foreground">Track your imported vehicles and modification projects</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="border-dashed border-2 border-gray-300 hover:border-brand-gold transition-colors">
                    <CardContent className="flex flex-col items-center justify-center h-40 text-center">
                      <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center mb-3">
                        <Plus className="h-6 w-6 text-brand-gold" />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">Add New Build</h3>
                      <p className="text-sm text-gray-500">Document your next import project</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="watchlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Parts Watchlist</CardTitle>
                <p className="text-sm text-muted-foreground">Track prices on parts you want for your builds</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No parts in watchlist</h3>
                  <p className="text-gray-500 mb-4">Add parts to track their prices and get alerts when they drop</p>
                  <Button className="bg-brand-gold hover:bg-brand-gold/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Part
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Car Events</CardTitle>
                <p className="text-sm text-muted-foreground">Discover car meets, shows, and events near you</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-500 mb-4">Check back later for car events in your area</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-semibold text-white mb-4">
                Import<span className="text-amber-400">IQ</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Australia's premier vehicle import intelligence platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <div className="space-y-2 text-sm">
                <Link href="/features" className="text-gray-400 hover:text-amber-400 transition-colors block">Features</Link>
                <Link href="/pricing" className="text-gray-400 hover:text-amber-400 transition-colors block">Pricing</Link>
                <Link href="/trial-dashboard" className="text-gray-400 hover:text-amber-400 transition-colors block">Dashboard</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <div className="space-y-2 text-sm">
                <Link href="/about" className="text-gray-400 hover:text-amber-400 transition-colors block">About</Link>
                <Link href="/affiliate-signup" className="text-gray-400 hover:text-amber-400 transition-colors block">Partners</Link>
                <a href="https://driveimmaculate.com" className="text-gray-400 hover:text-amber-400 transition-colors block">Contact</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <div className="space-y-2 text-sm">
                <a href="https://driveimmaculate.com" className="text-gray-400 hover:text-amber-400 transition-colors block">Help Center</a>
                <a href="https://driveimmaculate.com" className="text-gray-400 hover:text-amber-400 transition-colors block">Contact Support</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2025 ImportIQ by Immaculate Imports. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}