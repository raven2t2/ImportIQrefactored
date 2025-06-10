import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, Database, Users, FileText, TrendingUp } from "lucide-react";

interface CacheData {
  totalVehicles: number;
  lastUpdated: string;
  sources: string[];
  recentVehicles: Array<{
    make: string;
    model: string;
    year: number;
    price: string;
    sourceSite: string;
    timestamp: string;
  }>;
}

interface SessionData {
  activeCount: number;
  sessions: Array<{
    id: string;
    userId?: string;
    userAgent: string;
    ipAddress: string;
    createdAt: string;
    lastActivity: string;
  }>;
}

interface SubmissionData {
  recentCount: number;
  submissions: Array<{
    id: number;
    email: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehiclePrice: string;
    totalCost: string;
    createdAt: string;
  }>;
}

interface DatabaseCounts {
  vehiclePatterns: number;
  auctionListings: number;
  importCostCalculations: number;
  userSessions: number;
  totalSubmissions: number;
}

export default function Admin() {
  const [cacheData, setCacheData] = useState<CacheData | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [submissionData, setSubmissionData] = useState<SubmissionData | null>(null);
  const [databaseCounts, setDatabaseCounts] = useState<DatabaseCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch cache data
      const cacheResponse = await fetch('/api/admin/cache-status');
      const cacheResult = await cacheResponse.json();
      setCacheData(cacheResult.data);

      // Fetch session data
      const sessionResponse = await fetch('/api/admin/active-sessions');
      const sessionResult = await sessionResponse.json();
      setSessionData(sessionResult.data);

      // Fetch recent submissions
      const submissionResponse = await fetch('/api/admin/recent-submissions');
      const submissionResult = await submissionResponse.json();
      setSubmissionData(submissionResult.data);

      // Fetch database counts
      const dbResponse = await fetch('/api/admin/database-counts');
      const dbResult = await dbResponse.json();
      setDatabaseCounts(dbResult.data);

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAdminData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(num);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ImportIQ Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time system monitoring and analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Badge>
          <Button 
            onClick={fetchAdminData} 
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Database Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Database className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vehicle Patterns</p>
              <p className="text-2xl font-bold">{databaseCounts?.vehiclePatterns || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Auction Listings</p>
              <p className="text-2xl font-bold">{databaseCounts?.auctionListings || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <FileText className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cost Calculations</p>
              <p className="text-2xl font-bold">{databaseCounts?.importCostCalculations || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">User Sessions</p>
              <p className="text-2xl font-bold">{databaseCounts?.userSessions || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Database className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
              <p className="text-2xl font-bold">{databaseCounts?.totalSubmissions || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cache" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cache">Auction Cache</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="submissions">Recent Submissions</TabsTrigger>
          <TabsTrigger value="system">System Status</TabsTrigger>
        </TabsList>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Auction Data Cache</CardTitle>
              <CardDescription>
                In-memory cache status and recent vehicle data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cacheData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Cached Vehicles</p>
                      <p className="text-2xl font-bold">{cacheData.totalVehicles}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data Sources</p>
                      <div className="flex gap-2">
                        {cacheData.sources.map((source, index) => (
                          <Badge key={index} variant="secondary">{source}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="text-sm">{formatTimestamp(cacheData.lastUpdated)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Recent Cached Vehicles</h4>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {cacheData.recentVehicles.map((vehicle, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <p className="font-medium">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {vehicle.sourceSite} • {formatTimestamp(vehicle.timestamp)}
                              </p>
                            </div>
                            <Badge variant="outline">{formatCurrency(vehicle.price)}</Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Loading cache data...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active User Sessions</CardTitle>
              <CardDescription>
                Current active sessions and user activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessionData ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Sessions</p>
                    <p className="text-2xl font-bold">{sessionData.activeCount}</p>
                  </div>
                  
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {sessionData.sessions.map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">Session {session.id.substring(0, 8)}...</p>
                            <p className="text-sm text-muted-foreground">
                              {session.userAgent.substring(0, 50)}...
                            </p>
                            <p className="text-xs text-muted-foreground">
                              IP: {session.ipAddress}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">Created: {formatTimestamp(session.createdAt)}</p>
                            <p className="text-sm">Last: {formatTimestamp(session.lastActivity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <p className="text-muted-foreground">Loading session data...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent User Submissions</CardTitle>
              <CardDescription>
                Latest import cost calculations and user inquiries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissionData ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Recent Submissions (24h)</p>
                    <p className="text-2xl font-bold">{submissionData.recentCount}</p>
                  </div>
                  
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {submissionData.submissions.map((submission, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{submission.email}</p>
                            <p className="text-sm text-muted-foreground">
                              {submission.vehicleMake} {submission.vehicleModel}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTimestamp(submission.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">Vehicle: {formatCurrency(submission.vehiclePrice)}</p>
                            <p className="text-sm font-semibold">Total: {formatCurrency(submission.totalCost)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <p className="text-muted-foreground">Loading submission data...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health Status</CardTitle>
              <CardDescription>
                PostgreSQL and cache system performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">PostgreSQL Tables</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Vehicle Patterns:</span>
                      <Badge variant="secondary">{databaseCounts?.vehiclePatterns || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Auction Listings:</span>
                      <Badge variant="secondary">{databaseCounts?.auctionListings || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost Calculations:</span>
                      <Badge variant="secondary">{databaseCounts?.importCostCalculations || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>User Sessions:</span>
                      <Badge variant="secondary">{databaseCounts?.userSessions || 0}</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Cache Status</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Cached Vehicles:</span>
                      <Badge variant="secondary">{cacheData?.totalVehicles || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Sources:</span>
                      <Badge variant="secondary">{cacheData?.sources.length || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Sessions:</span>
                      <Badge variant="secondary">{sessionData?.activeCount || 0}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}