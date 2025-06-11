import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Users, FileText, TrendingUp, Search, Download } from "lucide-react";
import { format } from "date-fns";

interface Submission {
  id: number;
  fullName?: string;
  name?: string;
  email: string;
  vehicleMake?: string;
  make?: string;
  vehicleModel?: string;
  model?: string;
  vehicleYear?: number;
  year?: number;
  vehiclePrice?: string;
  totalCost?: string;
  budget?: number;
  shippingOrigin?: string;
  serviceTier?: string;
  location?: string;
  createdAt: string;
}

interface AdminStats {
  totalSubmissions: number;
  totalUsers: number;
  activeTrials: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  // Check if admin is already authenticated
  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_authenticated');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const { data: submissions = [], isLoading: submissionsLoading } = useQuery<Submission[]>({
    queryKey: ["/api/admin/submissions"],
    enabled: isAuthenticated,
  });

  const { data: stats = { totalSubmissions: 0, totalUsers: 0, activeTrials: 0, totalRevenue: 0 }, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated,
  });

  const handleAdminLogin = async () => {
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: adminPassword }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('admin_authenticated', 'true');
        setAdminPassword("");
      } else {
        alert("Invalid admin password");
      }
    } catch (error) {
      alert("Login failed");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
  };

  const filteredSubmissions = (submissions || []).filter((submission: Submission) =>
    (submission.fullName || submission.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (submission.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (submission.vehicleMake || submission.make || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (submission.vehicleModel || submission.model || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const csvContent = [
      ["Name", "Email", "Make", "Model", "Year", "Budget", "Location", "Date"],
      ...filteredSubmissions.map((sub: Submission) => [
        sub.name,
        sub.email,
        sub.make,
        sub.model,
        sub.year,
        sub.budget,
        sub.location,
        format(new Date(sub.createdAt), "yyyy-MM-dd HH:mm")
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `importiq-submissions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Enter admin password to access dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              />
            </div>
            <Button onClick={handleAdminLogin} className="w-full">
              Access Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">ImportIQ Administration Panel</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Trials</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeTrials}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue (Est.)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>All Submissions</CardTitle>
                <CardDescription>
                  View and manage all ImportIQ submissions
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {submissionsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Search Query</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission: Submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.fullName || 'Unknown Query'}</TableCell>
                        <TableCell>{submission.email || 'Anonymous'}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {submission.vehicleMake || 'Unknown'} {submission.vehicleModel || 'Model'}
                            </span>
                            <span className="text-sm text-gray-500">{submission.vehicleYear || 2024}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {submission.vehiclePrice || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>{submission.totalCost || 'Unknown'}</TableCell>
                        <TableCell>
                          {submission.createdAt ? format(new Date(submission.createdAt), "MMM dd, yyyy") : 'Unknown'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredSubmissions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No submissions found matching your search.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}