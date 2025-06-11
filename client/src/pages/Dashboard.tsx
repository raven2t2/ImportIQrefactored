import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { Clock, FileText, CreditCard, Search, Bookmark, ExternalLink, Crown, Zap } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

interface RecentSearch {
  id: number;
  searchQuery: string;
  destination: string;
  vehicleData: any;
  createdAt: string;
}

interface SavedReport {
  id: number;
  title: string;
  searchQuery: string;
  destination: string;
  reportType: string;
  isBookmarked: boolean;
  createdAt: string;
}

interface SavedJourney {
  id: number;
  vehicleData: any;
  destinationCountry: string;
  savedAt: string;
}

interface UserSubscription {
  id: number;
  plan: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface DashboardData {
  recentSearches: RecentSearch[];
  savedReports: SavedReport[];
  savedJourneys: SavedJourney[];
  subscription: UserSubscription | null;
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    enabled: isAuthenticated,
  });

  if (isLoading || dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subscription = dashboardData?.subscription;
  const isSubscribed = subscription && subscription.status === 'active';
  const planName = subscription?.plan || 'free';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.fullName || user?.email}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your vehicle imports and track your progress
            </p>
          </div>
          
          {/* Plan Status */}
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              {planName === 'pro' && <Crown className="h-4 w-4 text-yellow-500" />}
              {planName === 'starter' && <Zap className="h-4 w-4 text-blue-500" />}
              <Badge variant={isSubscribed ? "default" : "secondary"}>
                {planName === 'free' ? 'Free Plan' : 
                 planName === 'starter' ? 'Starter Plan' : 
                 planName === 'pro' ? 'Pro Plan' : 'Unknown Plan'}
              </Badge>
            </div>
            {subscription && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {subscription.cancelAtPeriodEnd ? 'Cancels' : 'Renews'} {format(new Date(subscription.currentPeriodEnd), "MMM dd, yyyy")}
              </p>
            )}
          </div>
        </div>

        {/* Upgrade Banner for Non-Subscribers */}
        {!isSubscribed && (
          <Card className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Unlock Premium Features
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Get unlimited lookups, CSV imports, bulk VIN processing, and API access
                </p>
              </div>
              <Link href="/pricing">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Upgrade Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Searches */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Your Recent Searches
                  </CardTitle>
                  <CardDescription>Last 5 vehicle lookups</CardDescription>
                </div>
                <Link href="/import-calculator">
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    New Search
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {dashboardData?.recentSearches?.length ? (
                  <div className="space-y-4">
                    {dashboardData.recentSearches.map((search) => (
                      <div key={search.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{search.searchQuery}</span>
                            <Badge variant="outline" size="sm">{search.destination}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(search.createdAt), "MMM dd, HH:mm")}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Re-run
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent searches yet</p>
                    <Link href="/import-calculator">
                      <Button className="mt-4" size="sm">Start Your First Search</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Plan Management */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Your Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Current Plan</span>
                    <Badge variant={isSubscribed ? "default" : "secondary"}>
                      {planName === 'free' ? 'Free' : 
                       planName === 'starter' ? 'Starter' : 
                       planName === 'pro' ? 'Pro' : 'Unknown'}
                    </Badge>
                  </div>
                  
                  {subscription && (
                    <>
                      <Separator />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Status</span>
                          <span className="capitalize">{subscription.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Next billing</span>
                          <span>{format(new Date(subscription.currentPeriodEnd), "MMM dd")}</span>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <Separator />
                  <div className="space-y-2">
                    {!isSubscribed && (
                      <Link href="/pricing">
                        <Button className="w-full" size="sm">
                          Upgrade Plan
                        </Button>
                      </Link>
                    )}
                    {isSubscribed && planName === 'starter' && (
                      <Link href="/upgrade?plan=pro">
                        <Button className="w-full" size="sm">
                          Upgrade to Pro
                        </Button>
                      </Link>
                    )}
                    {isSubscribed && (
                      <Button variant="outline" className="w-full" size="sm">
                        Manage Billing
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Searches</span>
                    <span className="font-medium">{dashboardData?.recentSearches?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Saved Reports</span>
                    <span className="font-medium">{dashboardData?.savedReports?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Saved Journeys</span>
                    <span className="font-medium">{dashboardData?.savedJourneys?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Saved Reports */}
        <div className="mt-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Your Saved Reports
                </CardTitle>
                <CardDescription>Bookmarked vehicle import analyses</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {dashboardData?.savedReports?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.savedReports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{report.title}</h4>
                        {report.isBookmarked && <Bookmark className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" size="sm">{report.destination}</Badge>
                        <Badge variant="secondary" size="sm">{report.reportType}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(report.createdAt), "MMM dd")}
                        </span>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No saved reports yet</p>
                  <p className="text-sm">Save reports from your searches to access them later</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}