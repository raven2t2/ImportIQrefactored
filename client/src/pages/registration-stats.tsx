import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Car, MapPin, Calendar, MessageCircle, HelpCircle, Bot } from "lucide-react";
import AIChatAssistant from "@/components/ai-chat-assistant";

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
    queryKey: ["/api/registration-stats", { state: selectedState, year: selectedYear, make: searchMake }],
    retry: false,
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Service Unavailable</h2>
          <p className="text-red-600">Registration statistics are currently unavailable. Please try again later.</p>
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
            Historical vehicle registration data across Australia. Track registration 
            trends, popular models, and geographic distribution patterns.
          </p>
        </div>

        {/* Filter Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Data</CardTitle>
            <CardDescription>Refine registration statistics by state, year, and vehicle make</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIC">Victoria</SelectItem>
                    <SelectItem value="NSW">New South Wales</SelectItem>
                    <SelectItem value="QLD">Queensland</SelectItem>
                    <SelectItem value="WA">Western Australia</SelectItem>
                    <SelectItem value="SA">South Australia</SelectItem>
                    <SelectItem value="TAS">Tasmania</SelectItem>
                    <SelectItem value="NT">Northern Territory</SelectItem>
                    <SelectItem value="ACT">Australian Capital Territory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                    <SelectItem value="2020">2020</SelectItem>
                    <SelectItem value="2019">2019</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Vehicle Make (Optional)</label>
                <Input
                  placeholder="e.g., Toyota, Ford, BMW"
                  value={searchMake}
                  onChange={(e) => setSearchMake(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Registrations</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalRegistrations.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Make</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.topMakes[0]?.make || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {stats.topMakes[0]?.count.toLocaleString()} registrations
                      </p>
                    </div>
                    <Car className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Most Popular Location</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.locationStats[0]?.location || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {stats.locationStats[0]?.count.toLocaleString()} vehicles
                      </p>
                    </div>
                    <MapPin className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Peak Year</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.yearDistribution[0]?.year || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {stats.yearDistribution[0]?.count.toLocaleString()} registrations
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Makes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Top Vehicle Makes</CardTitle>
                  <CardDescription>Most registered vehicle brands in {selectedState}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.topMakes.slice(0, 10).map((make, index) => (
                      <div key={make.make} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={index < 3 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                          <span className="font-medium">{make.make}</span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {make.count.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Models</CardTitle>
                  <CardDescription>Most registered vehicle models</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.topModels.slice(0, 5).map((model, index) => (
                      <div key={model.model} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={index < 3 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                          <span className="font-medium">{model.model}</span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {model.count.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Source and Contact Actions */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                  <p className="mb-4">
                    <strong>Data Source:</strong> Australian Government Open Data - data.vic.gov.au, data.nsw.gov.au
                  </p>
                  <p className="mb-4">
                    Historical registration data to understand market trends and popular vehicle types.
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
                      Have Questions? Contact Us
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
            
            {/* AI Chat Assistant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Ask ImportIQ Assistant
                </CardTitle>
                <CardDescription>
                  Get instant answers about registration statistics and vehicle preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIChatAssistant 
                  vehicleContext="Australian vehicle registration statistics and market trends"
                  userLocation="Australia"
                />
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}