import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, Users, FileText, TrendingUp, Search, Download, 
  UserCheck, Target, Calendar, BarChart3, AlertTriangle,
  DollarSign, Globe, TrendingDown, Activity, Clock, Phone, 
  Mail, User, Car, MessageSquare
} from "lucide-react";
import { format } from "date-fns";

interface Submission {
  id: number;
  fullName: string;
  email: string;
  vehiclePrice: string;
  totalCost: string;
  serviceTier: string;
  shippingOrigin: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  createdAt: string;
}

interface AdminStats {
  totalSubmissions: number;
  totalUsers: number;
  activeTrials: number;
  totalRevenue: number;
}

interface Affiliate {
  id: number;
  name: string;
  email: string;
  referralCode: string;
  totalClicks: number;
  totalSignups: number;
  currentBalance: number;
  totalEarnings: number;
  tier: string;
  isInfluencer: boolean;
}

interface Booking {
  id: number;
  name: string;
  email: string;
  phone: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  vehicleDetails?: string;
  message?: string;
  status: string;
  createdAt: string;
}

export default function SecureAdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");

  // Enhanced security - require re-authentication every 2 hours
  useEffect(() => {
    const adminAuth = localStorage.getItem('secure_admin_authenticated');
    const authTime = localStorage.getItem('secure_admin_auth_time');
    
    if (adminAuth === 'true' && authTime) {
      const timeDiff = Date.now() - parseInt(authTime);
      if (timeDiff < 2 * 60 * 60 * 1000) { // 2 hours
        setIsAuthenticated(true);
      } else {
        // Session expired
        localStorage.removeItem('secure_admin_authenticated');
        localStorage.removeItem('secure_admin_auth_time');
      }
    }
  }, []);

  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ["/api/admin/submissions"],
    enabled: isAuthenticated,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated,
  });

  const { data: affiliates = [], isLoading: affiliatesLoading } = useQuery({
    queryKey: ["/api/admin/affiliates"],
    enabled: isAuthenticated,
  });

  const { data: businessInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ["/api/admin/business-insights"],
    enabled: isAuthenticated,
  });

  const { data: aiAnalyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/admin/advanced-analytics"],
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/bookings"],
    enabled: isAuthenticated,
  });

  const { data: deposits = [], isLoading: depositsLoading } = useQuery({
    queryKey: ["/api/deposits"],
    enabled: isAuthenticated,
  });

  const handleAdminLogin = async () => {
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: adminUsername, password: adminPassword }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('secure_admin_authenticated', 'true');
        localStorage.setItem('secure_admin_auth_time', Date.now().toString());
        setAdminUsername("");
        setAdminPassword("");
      } else {
        alert("Invalid admin credentials");
      }
    } catch (error) {
      alert("Login failed");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('secure_admin_authenticated');
    localStorage.removeItem('secure_admin_auth_time');
  };

  // Analytics calculations
  const getInsights = () => {
    if (!submissions.length) return null;

    const totalImportValue = submissions.reduce((sum, sub) => sum + parseFloat(sub.totalCost || "0"), 0);
    const avgImportValue = totalImportValue / submissions.length;
    
    const tierDistribution = submissions.reduce((acc, sub) => {
      acc[sub.serviceTier] = (acc[sub.serviceTier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const originDistribution = submissions.reduce((acc, sub) => {
      acc[sub.shippingOrigin] = (acc[sub.shippingOrigin] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentSubmissions = submissions.filter(sub => {
      const submissionDate = new Date(sub.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return submissionDate > weekAgo;
    }).length;

    const conversionRate = stats ? (stats.activeTrials / stats.totalUsers * 100) : 0;

    return {
      totalImportValue,
      avgImportValue,
      tierDistribution,
      originDistribution,
      recentSubmissions,
      conversionRate,
      topTier: Object.entries(tierDistribution).sort(([,a], [,b]) => b - a)[0]?.[0] || "N/A",
      topOrigin: Object.entries(originDistribution).sort(([,a], [,b]) => b - a)[0]?.[0] || "N/A"
    };
  };

  const insights = getInsights();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-900 border-amber-500/20">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <CardTitle className="text-white">Secure Admin Access</CardTitle>
            <CardDescription className="text-gray-400">
              Enter admin credentials to access dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Enter admin username"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Enter admin password"
              />
            </div>
            <Button 
              onClick={handleAdminLogin} 
              className="w-full bg-amber-600 hover:bg-amber-700"
              disabled={!adminUsername || !adminPassword}
            >
              Access Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredSubmissions = submissions.filter((submission: Submission) =>
    submission.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.vehicleMake?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.vehicleModel?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-amber-500 mb-2">ImportIQ Admin Dashboard</h1>
            <p className="text-gray-400">Secure access • Real-time insights</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white">
            Logout
          </Button>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="bg-gray-900 border-amber-500/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-amber-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-amber-600">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="affiliates" className="data-[state=active]:bg-amber-600">
              <Target className="w-4 h-4 mr-2" />
              Affiliates
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-amber-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Advanced Analytics
            </TabsTrigger>
            <TabsTrigger value="targeting" className="data-[state=active]:bg-amber-600">
              <Target className="w-4 h-4 mr-2" />
              Ad Targeting AI
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-amber-600">
              <Calendar className="w-4 h-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="deposits" className="data-[state=active]:bg-amber-600">
              <DollarSign className="w-4 h-4 mr-2" />
              Deposits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-900 border-amber-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-500">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-gray-400 mt-1">Platform registrations</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-amber-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Active Trials</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">{stats?.activeTrials || 0}</div>
                  <p className="text-xs text-gray-400 mt-1">
                    {insights ? `${insights.conversionRate.toFixed(1)}% conversion` : "Calculating..."}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-amber-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    ${stats?.totalRevenue?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">From active trials</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-amber-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Calculations</CardTitle>
                  <FileText className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">{submissions.length}</div>
                  <p className="text-xs text-gray-400 mt-1">
                    {insights ? `${insights.recentSubmissions} this week` : "Loading..."}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-gray-900 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-amber-500" />
                  Recent Import Calculations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submissions.slice(0, 5).map((submission: Submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{submission.fullName}</span>
                        <span className="text-gray-400 text-sm">
                          {submission.vehicleMake} {submission.vehicleModel} • {submission.shippingOrigin}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-green-500 font-bold">
                          ${parseFloat(submission.totalCost || "0").toLocaleString()}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {submission.serviceTier}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-gray-900 border-amber-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">User Submissions</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">User</TableHead>
                      <TableHead className="text-gray-300">Vehicle</TableHead>
                      <TableHead className="text-gray-300">Import Cost</TableHead>
                      <TableHead className="text-gray-300">Service Tier</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission: Submission) => (
                      <TableRow key={submission.id} className="border-gray-700">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{submission.fullName}</span>
                            <span className="text-gray-400 text-sm">{submission.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {submission.vehicleMake && submission.vehicleModel ? 
                            `${submission.vehicleMake} ${submission.vehicleModel} ${submission.vehicleYear || ''}` : 
                            'Not specified'
                          }
                        </TableCell>
                        <TableCell className="text-green-500 font-bold">
                          ${parseFloat(submission.totalCost || "0").toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={submission.serviceTier === 'Elite' ? 'default' : 'secondary'}
                            className={
                              submission.serviceTier === 'Elite' ? 'bg-purple-600' :
                              submission.serviceTier === 'Concierge' ? 'bg-blue-600' : 'bg-green-600'
                            }
                          >
                            {submission.serviceTier}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {format(new Date(submission.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="affiliates" className="space-y-6">
            <Card className="bg-gray-900 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">Affiliate Performance</CardTitle>
                <CardDescription className="text-gray-400">
                  Track affiliate referrals and earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {affiliatesLoading ? (
                  <div className="text-center py-8 text-gray-400">Loading affiliate data...</div>
                ) : affiliates.affiliates?.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Affiliate</TableHead>
                        <TableHead className="text-gray-300">Tier</TableHead>
                        <TableHead className="text-gray-300">Clicks</TableHead>
                        <TableHead className="text-gray-300">Signups</TableHead>
                        <TableHead className="text-gray-300">Earnings</TableHead>
                        <TableHead className="text-gray-300">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {affiliates.affiliates.map((affiliate: Affiliate) => (
                        <TableRow key={affiliate.id} className="border-gray-700">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-white font-medium">{affiliate.name}</span>
                              <span className="text-gray-400 text-sm">{affiliate.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={affiliate.isInfluencer ? 'default' : 'secondary'}
                              className={affiliate.isInfluencer ? 'bg-purple-600' : 'bg-blue-600'}
                            >
                              {affiliate.tier}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-blue-500">{affiliate.totalClicks}</TableCell>
                          <TableCell className="text-green-500">{affiliate.totalSignups}</TableCell>
                          <TableCell className="text-green-500 font-bold">
                            ${affiliate.totalEarnings?.toFixed(2) || '0.00'}
                          </TableCell>
                          <TableCell className="text-amber-500 font-bold">
                            ${affiliate.currentBalance?.toFixed(2) || '0.00'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-400">No affiliate data available</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {insights && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-900 border-amber-500/20">
                    <CardHeader>
                      <CardTitle className="text-white">Service Tier Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(insights.tierDistribution).map(([tier, count]) => (
                        <div key={tier} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">{tier}</span>
                            <span className="text-white">{count} users</span>
                          </div>
                          <Progress 
                            value={(count / submissions.length) * 100} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-amber-500/20">
                    <CardHeader>
                      <CardTitle className="text-white">Market Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(insights.originDistribution).map(([origin, count]) => (
                        <div key={origin} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">{origin.toUpperCase()}</span>
                            <span className="text-white">{count} imports</span>
                          </div>
                          <Progress 
                            value={(count / submissions.length) * 100} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gray-900 border-amber-500/20">
                  <CardHeader>
                    <CardTitle className="text-white">Key Business Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-amber-500 font-bold text-lg">
                          ${insights.avgImportValue.toLocaleString()}
                        </div>
                        <div className="text-gray-400 text-sm">Average Import Value</div>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-green-500 font-bold text-lg">{insights.topTier}</div>
                        <div className="text-gray-400 text-sm">Most Popular Service</div>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-blue-500 font-bold text-lg">{insights.topOrigin.toUpperCase()}</div>
                        <div className="text-gray-400 text-sm">Top Import Market</div>
                      </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="text-amber-500 font-bold text-lg">
                        ${insights.totalImportValue.toLocaleString()}
                      </div>
                      <div className="text-gray-400 text-sm">Total Import Value Calculated</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Potential commission at 5%: ${(insights.totalImportValue * 0.05).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card className="bg-gray-900 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-amber-500 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Consultation Bookings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage and track consultation appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      No bookings yet
                    </h3>
                    <p className="text-gray-400">
                      When customers book consultations, they'll appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking: Booking) => (
                      <div key={booking.id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-750 px-4 py-3 border-b border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-white font-medium flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {booking.name}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                Booking #{booking.id} • {booking.service}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                className={
                                  booking.status === "confirmed" 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : booking.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                    : booking.status === "cancelled"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                }
                              >
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {format(new Date(booking.createdAt), "MMM dd, yyyy")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-300">{booking.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-300">{booking.phone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-300">{booking.preferredDate}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-300">{booking.preferredTime}</span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              {booking.vehicleDetails && (
                                <div className="flex items-start gap-2 text-sm">
                                  <Car className="h-4 w-4 text-gray-500 mt-0.5" />
                                  <div>
                                    <span className="text-gray-400 font-medium">Vehicle:</span>
                                    <p className="text-gray-300 mt-1">{booking.vehicleDetails}</p>
                                  </div>
                                </div>
                              )}
                              
                              {booking.message && (
                                <div className="flex items-start gap-2 text-sm">
                                  <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                                  <div>
                                    <span className="text-gray-400 font-medium">Message:</span>
                                    <p className="text-gray-300 mt-1">{booking.message}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-3 border-t border-gray-700">
                            {booking.status !== "confirmed" && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={async () => {
                                  try {
                                    await fetch(`/api/bookings/${booking.id}/status`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: 'confirmed' })
                                    });
                                    window.location.reload();
                                  } catch (error) {
                                    console.error('Error updating booking:', error);
                                  }
                                }}
                              >
                                Confirm
                              </Button>
                            )}
                            
                            {booking.status !== "completed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-600 text-blue-400 hover:bg-blue-600"
                                onClick={async () => {
                                  try {
                                    await fetch(`/api/bookings/${booking.id}/status`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: 'completed' })
                                    });
                                    window.location.reload();
                                  } catch (error) {
                                    console.error('Error updating booking:', error);
                                  }
                                }}
                              >
                                Mark Complete
                              </Button>
                            )}
                            
                            {booking.status !== "cancelled" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-600 text-red-400 hover:bg-red-600"
                                onClick={async () => {
                                  try {
                                    await fetch(`/api/bookings/${booking.id}/status`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: 'cancelled' })
                                    });
                                    window.location.reload();
                                  } catch (error) {
                                    console.error('Error updating booking:', error);
                                  }
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deposits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    Mod Package Deposits
                  </span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ${deposits.reduce((sum: number, deposit: any) => sum + (deposit.amount || 0), 0).toLocaleString()} Total
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Track all $500 deposits from mod package estimator get started flow
                </CardDescription>
              </CardHeader>
              <CardContent>
                {depositsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full"></div>
                  </div>
                ) : deposits.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No deposits received yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deposits.map((deposit: any) => (
                      <div key={deposit.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h4 className="font-medium text-gray-900">{deposit.customerName}</h4>
                                <p className="text-sm text-gray-600">{deposit.customerEmail}</p>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-green-600">${deposit.amount}</div>
                                <div className="text-xs text-gray-500">
                                  {new Date(deposit.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            {deposit.vehicleDetails && (
                              <div className="mt-2 text-sm text-gray-600">
                                <strong>Project:</strong> {deposit.vehicleDetails}
                              </div>
                            )}
                            {deposit.stripePaymentIntentId && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                  Payment ID: {deposit.stripePaymentIntentId}
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <Badge 
                              variant={deposit.status === 'completed' ? 'default' : 'secondary'}
                              className={deposit.status === 'completed' ? 'bg-green-600' : ''}
                            >
                              {deposit.status || 'completed'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Behavior Analytics */}
              {aiAnalyticsData?.userSegments && (
                <Card className="bg-gray-900 border-amber-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Users className="w-5 h-5 mr-2 text-amber-500" />
                      User Segments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(aiAnalyticsData.userSegments.budget_ranges || {}).map(([range, count]: [string, any]) => (
                      <div key={range} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <span className="text-gray-300">{range}</span>
                        <span className="text-amber-500 font-bold">{count} users</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Geographic Distribution */}
              {aiAnalyticsData?.locationAnalysis && (
                <Card className="bg-gray-900 border-amber-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-amber-500" />
                      Geographic Reach
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(aiAnalyticsData.locationAnalysis.states || {}).map(([state, count]: [string, any]) => (
                      <div key={state} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <span className="text-gray-300">{state}</span>
                        <span className="text-amber-500 font-bold">{count} users</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Vehicle Preferences */}
              {aiAnalyticsData?.vehicleAnalysis && (
                <Card className="bg-gray-900 border-amber-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Car className="w-5 h-5 mr-2 text-amber-500" />
                      Popular Vehicles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(aiAnalyticsData.vehicleAnalysis.makes || {}).slice(0, 5).map(([make, count]: [string, any]) => (
                      <div key={make} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <span className="text-gray-300">{make}</span>
                        <span className="text-amber-500 font-bold">{count} searches</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Time-based Analytics */}
              {aiAnalyticsData?.timePatterns && (
                <Card className="bg-gray-900 border-amber-500/20 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-amber-500" />
                      Activity Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(aiAnalyticsData.timePatterns.hourly || {}).slice(0, 8).map(([hour, activity]: [string, any]) => (
                        <div key={hour} className="text-center p-3 bg-gray-800 rounded-lg">
                          <div className="text-amber-500 font-bold">{hour}:00</div>
                          <div className="text-gray-300 text-sm">{activity} visits</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Conversion Funnel */}
              {aiAnalyticsData?.funnelAnalysis && (
                <Card className="bg-gray-900 border-amber-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <TrendingDown className="w-5 h-5 mr-2 text-amber-500" />
                      Conversion Funnel
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Visitors</span>
                        <span className="text-white font-bold">{aiAnalyticsData.funnelAnalysis.visitors}</span>
                      </div>
                      <Progress value={100} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Trial Signups</span>
                        <span className="text-blue-400 font-bold">{aiAnalyticsData.funnelAnalysis.trial_signups}</span>
                      </div>
                      <Progress value={aiAnalyticsData.funnelAnalysis.visitor_to_trial} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Active Trials</span>
                        <span className="text-green-400 font-bold">{aiAnalyticsData.funnelAnalysis.active_trials}</span>
                      </div>
                      <Progress value={aiAnalyticsData.funnelAnalysis.trial_to_calculation} className="h-2" />
                      
                      <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-amber-500">
                            {aiAnalyticsData.funnelAnalysis.overall_conversion?.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-400">Overall Conversion Rate</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="targeting" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* AI-Powered Ad Targeting Recommendations */}
              <Card className="bg-gray-900 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="w-5 h-5 mr-2 text-amber-500" />
                    AI-Powered Ad Targeting Recommendations
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Intelligent marketing insights generated from user behavior analysis using OpenAI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full"></div>
                      <span className="ml-3 text-gray-400">Analyzing data with AI...</span>
                    </div>
                  ) : aiAnalyticsData?.recommendations ? (
                    <div className="space-y-6">
                      {/* High Priority Actions */}
                      {aiAnalyticsData.recommendations.immediate_actions?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-amber-500 mb-3 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Immediate Actions (High Confidence)
                          </h3>
                          <div className="grid gap-4">
                            {aiAnalyticsData.recommendations.immediate_actions.map((rec: any, idx: number) => (
                              <div key={idx} className="bg-gray-800 border border-green-500/30 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-green-400">{rec.category}</h4>
                                  <Badge className="bg-green-600 text-white">
                                    {rec.confidence} Priority
                                  </Badge>
                                </div>
                                <p className="text-gray-300 mb-3">{rec.recommendation}</p>
                                <div className="space-y-2">
                                  <div className="text-sm text-gray-400">
                                    <strong>Data Support:</strong> {rec.data_support}
                                  </div>
                                  <div className="text-sm text-amber-400">
                                    <strong>Implementation:</strong> {rec.implementation}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Test Opportunities */}
                      {aiAnalyticsData.recommendations.test_opportunities?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Test Opportunities (Medium Confidence)
                          </h3>
                          <div className="grid gap-4">
                            {aiAnalyticsData.recommendations.test_opportunities.map((rec: any, idx: number) => (
                              <div key={idx} className="bg-gray-800 border border-blue-500/30 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-blue-400">{rec.category}</h4>
                                  <Badge variant="outline" className="border-blue-500 text-blue-400">
                                    {rec.confidence} Priority
                                  </Badge>
                                </div>
                                <p className="text-gray-300 mb-3">{rec.recommendation}</p>
                                <div className="space-y-2">
                                  <div className="text-sm text-gray-400">
                                    <strong>Data Support:</strong> {rec.data_support}
                                  </div>
                                  <div className="text-sm text-amber-400">
                                    <strong>Implementation:</strong> {rec.implementation}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Data Collection Needs */}
                      {aiAnalyticsData.recommendations.data_collection_needed?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-orange-400 mb-3 flex items-center">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Data Collection Needed
                          </h3>
                          <div className="grid gap-4">
                            {aiAnalyticsData.recommendations.data_collection_needed.map((rec: any, idx: number) => (
                              <div key={idx} className="bg-gray-800 border border-orange-500/30 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-orange-400">{rec.category}</h4>
                                  <Badge variant="outline" className="border-orange-500 text-orange-400">
                                    Data Needed
                                  </Badge>
                                </div>
                                <p className="text-gray-300 mb-3">{rec.recommendation}</p>
                                <div className="text-sm text-amber-400">
                                  <strong>Implementation:</strong> {rec.implementation}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No targeting data available yet</p>
                      <p className="text-sm">Drive traffic to cost calculator to generate AI insights</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}