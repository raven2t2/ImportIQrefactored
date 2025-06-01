import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Ship, DollarSign, MapPin, Calendar, MessageCircle, HelpCircle } from "lucide-react";

interface ImportVolumeData {
  year: number;
  month: string;
  port: string;
  vehicleCount: number;
  totalValue: number;
  averageValue: number;
  country: string;
}

interface PortStats {
  port: string;
  totalVolume: number;
  totalValue: number;
  percentage: number;
}

interface ImportVolumeDashboard {
  totalAnnualVolume: number;
  totalAnnualValue: number;
  averageVehicleValue: number;
  topPorts: PortStats[];
  monthlyTrends: Array<{
    month: string;
    volume: number;
    value: number;
  }>;
  countryBreakdown: Array<{
    country: string;
    volume: number;
    value: number;
    percentage: number;
  }>;
}

export default function ImportVolumeDashboard() {
  const [selectedYear, setSelectedYear] = useState<string>("2023");
  const [selectedPort, setSelectedPort] = useState<string>("all");

  const { data: dashboard, isLoading, error } = useQuery<ImportVolumeDashboard>({
    queryKey: ["/api/import-volume-dashboard", selectedYear, selectedPort],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading import volume data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center">
                <Ship className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Data Connection Error
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Unable to load import data from National Freight Data Hub. Please verify connection.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This service requires authenticated access to Australian government freight data.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Import Volume Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Historical vehicle import statistics from Australian ports. Track import 
            volumes, values, and port distribution patterns across Australia.
          </p>
        </div>

        {/* Filter Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Data Filters
            </CardTitle>
            <CardDescription>
              Filter import data by year and port
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                    <SelectItem value="2020">2020</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Port</label>
                <Select value={selectedPort} onValueChange={setSelectedPort}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select port" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ports</SelectItem>
                    <SelectItem value="melbourne">Melbourne</SelectItem>
                    <SelectItem value="sydney">Sydney</SelectItem>
                    <SelectItem value="brisbane">Brisbane</SelectItem>
                    <SelectItem value="fremantle">Fremantle</SelectItem>
                    <SelectItem value="adelaide">Adelaide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {dashboard && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Ship className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {dashboard.totalAnnualVolume.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Vehicles</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${(dashboard.totalAnnualValue / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Value</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${dashboard.averageVehicleValue.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Average Value</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {dashboard.topPorts.length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Active Ports</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Port Distribution and Country Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Top Import Ports</CardTitle>
                  <CardDescription>Vehicle import volume by Australian port</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboard.topPorts.map((port, index) => (
                      <div key={port.port} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium">{port.port}</p>
                            <p className="text-sm text-gray-500">
                              ${(port.totalValue / 1000000).toFixed(1)}M total value
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{port.totalVolume.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{port.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Source Countries</CardTitle>
                  <CardDescription>Import volume by country of origin</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboard.countryBreakdown.map((country, index) => (
                      <div key={country.country} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium">{country.country}</p>
                            <p className="text-sm text-gray-500">
                              ${(country.value / 1000000).toFixed(1)}M total value
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{country.volume.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{country.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trends Chart */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Monthly Import Trends - {selectedYear}</CardTitle>
                <CardDescription>
                  Vehicle import volume and value trends throughout the year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {dashboard.monthlyTrends.map((month) => (
                    <div key={month.month} className="text-center p-4 border rounded-lg">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                        {month.month}
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {month.volume.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        ${(month.value / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Source and Disclaimer */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                  <p className="mb-4">
                    <strong>Data Source:</strong> National Freight Data Hub - Australian Government Department of Infrastructure
                  </p>
                  <p className="mb-4">
                    Import statistics compiled from customs declarations and port authority records.
                  </p>
                  
                  {/* Contact Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6">
                    <a
                      href="https://driveimmaculate.com/contact-us/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Questions About Import Data? Contact Us
                    </a>
                    <a
                      href="https://driveimmaculate.com/quiz/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      ImportIQ Pathfinder™ Quiz
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}