import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Car, 
  Calendar, 
  DollarSign, 
  FileText, 
  Clock,
  MapPin,
  Star,
  Search,
  RotateCcw,
  CreditCard,
  Crown
} from "lucide-react";
import { useState } from "react";

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
  const [searchQuery, setSearchQuery] = useState("");

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  if (userLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSubscriptionStatus = () => {
    if (!dashboardData?.subscription) return { plan: "Free", status: "active", daysLeft: null };
    
    const { plan, status, currentPeriodEnd } = dashboardData.subscription;
    const daysLeft = Math.ceil((new Date(currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    return {
      plan: plan.charAt(0).toUpperCase() + plan.slice(1),
      status,
      daysLeft: daysLeft > 0 ? daysLeft : null
    };
  };

  const subscriptionInfo = getSubscriptionStatus();
  const totalVehicles = (dashboardData?.recentSearches?.length || 0) + (dashboardData?.savedJourneys?.length || 0);

  const handleNewSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/?query=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleRerunSearch = (searchQuery: string) => {
    window.location.href = `/?query=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.fullName || user?.email || 'User'}!
          </h1>
          <p className="text-gray-600">
            You've looked up {totalVehicles} vehicle{totalVehicles !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Start New Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Start New Vehicle Search
            </CardTitle>
            <CardDescription>
              Enter vehicle details to get instant import intelligence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Toyota Supra 1998, Nissan Skyline GT-R"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleNewSearch()}
                className="flex-1"
              />
              <Button onClick={handleNewSearch} disabled={!searchQuery.trim()}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Searches */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Recent Vehicle Searches</CardTitle>
            <CardDescription>
              {dashboardData?.recentSearches?.length || 0} vehicle lookups
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentSearches && dashboardData.recentSearches.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentSearches.slice(0, 5).map((search) => (
                  <div key={search.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">
                          {search.vehicleData.make} {search.vehicleData.model} ({search.vehicleData.year})
                        </h3>
                        {search.vehicleData.eligible && <Badge variant="outline">Eligible</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {search.destination}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(search.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {search.vehicleData.price}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRerunSearch(search.searchQuery)}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Re-run
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Car className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="mb-2">No searches yet</p>
                <p className="text-sm">Use the search box above to find your first vehicle</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saved Reports */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Saved Import Reports</CardTitle>
            <CardDescription>
              {dashboardData?.savedReports?.length || 0} detailed analyses saved
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.savedReports && dashboardData.savedReports.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.savedReports.slice(0, 3).map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{report.title}</h3>
                        {report.isBookmarked && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        <Badge variant="secondary">{report.reportType}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {report.destination}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(report.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="h-3 w-3 mr-1" />
                      View Report
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="mb-2">No saved reports</p>
                <p className="text-sm">Complete vehicle lookups to save detailed import reports</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Plan */}
        <Card className={subscriptionInfo.plan === "Free" ? "border-amber-200 bg-amber-50" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {subscriptionInfo.plan === "Free" ? (
                <Crown className="h-5 w-5 text-amber-600" />
              ) : (
                <CreditCard className="h-5 w-5" />
              )}
              Current Plan: {subscriptionInfo.plan}
            </CardTitle>
            <CardDescription>
              {subscriptionInfo.plan === "Free" 
                ? "Limited to 3 vehicle lookups per month"
                : `Active subscription • ${subscriptionInfo.daysLeft ? `${subscriptionInfo.daysLeft} days remaining` : 'Active'}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {subscriptionInfo.plan === "Free" ? (
                <>
                  <Button className="flex-1">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Starter - $29/month
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro - $99/month
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Billing Portal
                  </Button>
                  {subscriptionInfo.plan === "Starter" && (
                    <Button>
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}