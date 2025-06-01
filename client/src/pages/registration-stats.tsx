import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Car, MapPin, Calendar } from "lucide-react";

interface RegistrationData {
  year: number;
  make: string;
  model: string;
  location: string;
  count: number;
  state: string;
}

interface RegistrationStats {
  totalRegistrations: number;
  topMakes: Array<{ make: string; count: number }>;
  topModels: Array<{ model: string; count: number }>;
  yearDistribution: Array<{ year: number; count: number }>;
  locationStats: Array<{ location: string; count: number }>;
  data: RegistrationData[];
}

export default function RegistrationStats() {
  const [selectedState, setSelectedState] = useState<string>("VIC");
  const [selectedYear, setSelectedYear] = useState<string>("2023");
  const [searchMake, setSearchMake] = useState<string>("");

  const { data: stats, isLoading, error } = useQuery<RegistrationStats>({
    queryKey: ["/api/registration-stats", selectedState, selectedYear, searchMake],
    enabled: !!selectedState,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading registration statistics...</p>
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
                <Car className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Data Connection Error
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Unable to load registration data from data.vic.gov.au. Please check your connection and try again.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This service requires live data from Australian government sources.
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
            Australian Registration Statistics
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Live vehicle registration data from Australian state governments. Track registration 
            trends, popular models, and geographic distribution patterns.
          </p>
        </div>

        {/* Filter Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Data Filters
            </CardTitle>
            <CardDescription>
              Filter registration data by state, year, and manufacturer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">State</label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIC">Victoria</SelectItem>
                    <SelectItem value="NSW">New South Wales</SelectItem>
                    <SelectItem value="QLD">Queensland</SelectItem>
                    <SelectItem value="SA">South Australia</SelectItem>
                    <SelectItem value="WA">Western Australia</SelectItem>
                    <SelectItem value="TAS">Tasmania</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                <label className="text-sm font-medium mb-2 block">Search Make</label>
                <Input
                  placeholder="e.g. Toyota, Honda, Nissan"
                  value={searchMake}
                  onChange={(e) => setSearchMake(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {stats && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Car className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalRegistrations.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Registrations</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.topMakes.length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Active Brands</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedYear}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Data Year</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedState}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Selected State</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Makes and Models */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Top Makes by Registration Volume</CardTitle>
                  <CardDescription>Most registered vehicle manufacturers in {selectedState}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.topMakes.slice(0, 8).map((make, index) => (
                      <div key={make.make} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <span className="font-medium">{make.make}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{make.count.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">
                            {((make.count / stats.totalRegistrations) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Models</CardTitle>
                  <CardDescription>Most registered vehicle models in {selectedState}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.topModels.slice(0, 8).map((model, index) => (
                      <div key={model.model} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <span className="font-medium">{model.model}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{model.count.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">
                            {((model.count / stats.totalRegistrations) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Source and Disclaimer */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                  <p className="mb-2">
                    <strong>Data Source:</strong> Australian Government Open Data - data.vic.gov.au, data.nsw.gov.au
                  </p>
                  <p className="mb-2">
                    Registration statistics are updated periodically and may not reflect real-time data.
                  </p>
                  <p>
                    This information is provided for research purposes. Verify current registration 
                    requirements with relevant state authorities.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}