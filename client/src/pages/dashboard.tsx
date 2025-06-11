import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, FileText, Crown, TrendingUp, Car, Star } from "lucide-react";

interface DashboardData {
  recentSearches: Array<{
    id: number;
    searchQuery: string;
    destination: string;
    vehicleData: {
      make: string;
      model: string;
      year: number;
      price: string;
      eligible: boolean;
    };
    createdAt: string;
  }>;
  savedReports: Array<{
    id: number;
    title: string;
    searchQuery: string;
    destination: string;
    reportType: string;
    vehicleData: any;
    isBookmarked: boolean;
    createdAt: string;
  }>;
  savedJourneys: Array<{
    id: number;
    vehicleData: {
      make: string;
      model: string;
      year: number;
      price: string;
    };
    destinationCountry: string;
    savedAt: string;
  }>;
  subscription: {
    id: number;
    plan: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export default function Dashboard() {
  // Force cache invalidation
  React.useEffect(() => {
    document.title = "Dashboard - ImportIQ";
  }, []);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  if (userLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Subscription status logic
  const currentPlan = dashboardData?.subscription?.plan || "Free";
  const isSubscribed = dashboardData?.subscription?.status === "active";
  
  // Calculate total searches/journeys for vehicle count
  const totalVehicles = (dashboardData?.recentSearches?.length || 0) + (dashboardData?.savedJourneys?.length || 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to import journey page with query
      window.location.href = `/import-journey?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleRerunSearch = (search: any) => {
    window.location.href = `/import-journey?q=${encodeURIComponent(search.searchQuery)}&destination=${search.destination}`;
  };

  const handleViewReport = (report: any) => {
    window.location.href = `/report/${report.id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {(user as any)?.fullName || (user as any)?.email || "Demo User"}
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                You've searched {totalVehicles} vehicles with ImportIQ
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Plan</p>
                <Badge variant={isSubscribed ? "default" : "secondary"} className="text-sm">
                  {currentPlan}
                </Badge>
              </div>
              <Car className="h-12 w-12 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Start New Search */}
        <Card className="rounded-2xl shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              Start New Vehicle Search
            </CardTitle>
            <CardDescription>
              Search for any vehicle and get instant import eligibility, costs, and compliance requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearchSubmit} className="flex gap-3">
              <Input
                placeholder="Enter vehicle make, model, year, or VIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Search Now
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Searches */}
        <Card className="rounded-2xl shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Recent Searches
            </CardTitle>
            <CardDescription>
              Your recent vehicle lookups - click to re-run with updated data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentSearches?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent searches yet. Start by searching for a vehicle above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData?.recentSearches?.map((search: any) => (
                  <div key={search.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">
                          {search.vehicleData.make} {search.vehicleData.model} ({search.vehicleData.year})
                        </h3>
                        <Badge variant={search.vehicleData.eligible ? "default" : "destructive"} className="text-xs">
                          {search.vehicleData.eligible ? "Eligible" : "Restricted"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        To {search.destination} • {search.vehicleData.price} • {new Date(search.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRerunSearch(search)}
                      className="ml-4"
                    >
                      Re-run
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saved Reports */}
        <Card className="rounded-2xl shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Saved Reports
            </CardTitle>
            <CardDescription>
              Your bookmarked import analyses and compliance reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.savedReports?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No saved reports yet. Bookmark reports from your searches to save them here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData?.savedReports?.map((report: any) => (
                  <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">{report.title}</h3>
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {report.reportType} • To {report.destination} • Saved {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewReport(report)}
                      className="ml-4"
                    >
                      View Report
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Plan */}
        <Card className="rounded-2xl shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-blue-600" />
              Current Plan: {currentPlan}
            </CardTitle>
            <CardDescription>
              {isSubscribed 
                ? "You have access to all ImportIQ premium features" 
                : "Upgrade to unlock unlimited searches and premium features"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                {isSubscribed ? (
                  <div>
                    <p className="text-green-600 font-medium">✓ Active Subscription</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Renews on {dashboardData?.subscription ? new Date(dashboardData.subscription.currentPeriodEnd).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600">Get unlimited searches, compliance reports, and priority support</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="text-sm">
                        <span className="font-medium">Starter</span> - $29/month
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Pro</span> - $99/month
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-x-3">
                {!isSubscribed && (
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Upgrade Now
                  </Button>
                )}
                <Button variant="outline">
                  {isSubscribed ? "Manage Plan" : "View Pricing"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}