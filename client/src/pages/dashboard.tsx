import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Users, Calculator, Brain, FileText, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="calculator">Calculator Leads</TabsTrigger>
            <TabsTrigger value="ai-recs">AI Recommendations</TabsTrigger>
          </TabsList>

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
        </Tabs>
      </main>
    </div>
  );
}