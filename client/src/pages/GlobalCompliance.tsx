import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, DollarSign, Clock, Search, Globe, BarChart3 } from "lucide-react";

interface ComplianceResult {
  country: string;
  eligible: boolean;
  minimumAge: number;
  specialRequirements: string[];
  complianceCost: number;
  processingTimeWeeks: number;
  exemptions: any;
  sourceDocument: string;
  lastUpdated: string;
}

interface GlobalEligibilityData {
  vehicleAge: number;
  eligibility: Record<string, ComplianceResult>;
  recommendedDestinations: string[];
  totalCountriesChecked: number;
}

interface ComplianceStats {
  totalCountries: number;
  totalRegions: number;
  totalRules: number;
  lastUpdated: string;
  coverageByRuleType: Record<string, number>;
}

export default function GlobalCompliance() {
  const [vehicleYear, setVehicleYear] = useState<string>("2000");
  const [searchKeywords, setSearchKeywords] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("australia");

  // Global eligibility query
  const { data: globalData, isLoading: globalLoading } = useQuery<GlobalEligibilityData>({
    queryKey: ['/api/compliance/global', vehicleYear],
    enabled: vehicleYear !== ""
  });

  // Compliance statistics
  const { data: stats } = useQuery<ComplianceStats>({
    queryKey: ['/api/compliance/stats']
  });

  // Search results
  const { data: searchResults, isLoading: searchLoading } = useQuery<ComplianceResult[]>({
    queryKey: ['/api/compliance/search', searchKeywords],
    enabled: searchKeywords.length > 2
  });

  // Country-specific data
  const { data: countryData } = useQuery<ComplianceResult[]>({
    queryKey: ['/api/compliance/country', selectedCountry],
    enabled: selectedCountry !== ""
  });

  const currentYear = new Date().getFullYear();
  const calculatedAge = currentYear - parseInt(vehicleYear || "2000");

  const getEligibilityColor = (eligible: boolean) => 
    eligible ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";

  const getEligibilityIcon = (eligible: boolean) => 
    eligible ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Global Compliance Intelligence
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            PostgreSQL-powered vehicle import regulations for {stats?.totalCountries || 0} countries
          </p>
          
          {stats && (
            <div className="flex justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <span>{stats.totalRules.toLocaleString()} active rules</span>
              <span>{stats.totalRegions} regional variations</span>
              <span>Updated {new Date(stats.lastUpdated).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalCountries}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Countries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalRules.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Rules</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalRegions}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Regional Rules</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">Live</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Database</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="global" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="global">Global Eligibility</TabsTrigger>
            <TabsTrigger value="country">Country Details</TabsTrigger>
            <TabsTrigger value="search">Search Rules</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Global Eligibility Tab */}
          <TabsContent value="global" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Vehicle Eligibility Check</span>
                </CardTitle>
                <CardDescription>
                  Check import eligibility across all countries in our PostgreSQL database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="vehicleYear">Vehicle Year</Label>
                    <Input
                      id="vehicleYear"
                      type="number"
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(e.target.value)}
                      placeholder="Enter vehicle year"
                      min="1900"
                      max={currentYear + 1}
                    />
                  </div>
                  <div className="flex items-end">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {calculatedAge} years old
                    </Badge>
                  </div>
                </div>

                {globalLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Loading global compliance data...</p>
                  </div>
                )}

                {globalData && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {globalData.recommendedDestinations.length}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Eligible Countries</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {globalData.totalCountriesChecked}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Checked</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {Math.round((globalData.recommendedDestinations.length / globalData.totalCountriesChecked) * 100)}%
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(globalData.eligibility).map(([country, result]) => (
                        <Card key={country} className="hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between">
                              <span className="capitalize">{country.replace('_', ' ')}</span>
                              <div className={getEligibilityColor(result.eligible)}>
                                {getEligibilityIcon(result.eligible)}
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Minimum Age:</span>
                              <Badge variant={result.eligible ? "default" : "destructive"}>
                                {result.minimumAge} years
                              </Badge>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Cost:</span>
                              <span className="font-medium">
                                ${result.complianceCost.toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Processing:</span>
                              <span className="font-medium">
                                {result.processingTimeWeeks} weeks
                              </span>
                            </div>
                            
                            {result.specialRequirements.length > 0 && (
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Requirements:</p>
                                <div className="flex flex-wrap gap-1">
                                  {result.specialRequirements.slice(0, 2).map((req, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {req}
                                    </Badge>
                                  ))}
                                  {result.specialRequirements.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{result.specialRequirements.length - 2} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Country Details Tab */}
          <TabsContent value="country" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Country-Specific Compliance Rules</CardTitle>
                <CardDescription>
                  Detailed regulations from our PostgreSQL compliance database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="countrySelect">Select Country</Label>
                  <select
                    id="countrySelect"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="australia">Australia</option>
                    <option value="usa">United States</option>
                    <option value="canada">Canada</option>
                    <option value="uk">United Kingdom</option>
                    <option value="germany">Germany</option>
                    <option value="japan">Japan</option>
                    <option value="singapore">Singapore</option>
                    <option value="new_zealand">New Zealand</option>
                  </select>
                </div>

                {countryData && countryData.map((rule, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold capitalize">{rule.country.replace('_', ' ')}</h3>
                        <Badge variant={rule.eligible ? "default" : "destructive"}>
                          {rule.eligible ? "Eligible" : "Restricted"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Minimum Age:</span>
                          <p className="font-medium">{rule.minimumAge} years</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Processing Time:</span>
                          <p className="font-medium">{rule.processingTimeWeeks} weeks</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Compliance Cost:</span>
                          <p className="font-medium">${rule.complianceCost.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Source:</span>
                          <p className="font-medium text-xs">{rule.sourceDocument}</p>
                        </div>
                      </div>
                      
                      {rule.specialRequirements.length > 0 && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400 text-sm">Special Requirements:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {rule.specialRequirements.map((req, reqIdx) => (
                              <Badge key={reqIdx} variant="outline">
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Search Compliance Rules</span>
                </CardTitle>
                <CardDescription>
                  Search through all compliance rules in our PostgreSQL database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="searchInput">Search Keywords</Label>
                  <Input
                    id="searchInput"
                    value={searchKeywords}
                    onChange={(e) => setSearchKeywords(e.target.value)}
                    placeholder="e.g., 'modification', 'inspection', 'ADR'"
                  />
                </div>

                {searchLoading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                )}

                {searchResults && searchResults.length > 0 && (
                  <div className="space-y-3">
                    {searchResults.map((result, idx) => (
                      <Card key={idx}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold capitalize">{result.country.replace('_', ' ')}</h3>
                            <Badge variant="outline">${result.complianceCost.toLocaleString()}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {result.sourceDocument}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {result.specialRequirements.map((req, reqIdx) => (
                              <Badge key={reqIdx} variant="secondary" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {searchResults && searchResults.length === 0 && searchKeywords.length > 2 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No compliance rules found matching "{searchKeywords}"
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Database Analytics</CardTitle>
                <CardDescription>
                  Insights from our PostgreSQL compliance rule database
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Rule Type Coverage</h3>
                      <div className="space-y-3">
                        {Object.entries(stats.coverageByRuleType).map(([ruleType, count]) => (
                          <div key={ruleType} className="space-y-1">
                            <div className="flex justify-between">
                              <span className="capitalize text-sm">{ruleType.replace('_', ' ')}</span>
                              <span className="text-sm font-medium">{count} rules</span>
                            </div>
                            <Progress 
                              value={(count / stats.totalRules) * 100} 
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Database Health</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Total Rules</span>
                              <span className="font-medium">{stats.totalRules.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Countries Covered</span>
                              <span className="font-medium">{stats.totalCountries}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Regional Variations</span>
                              <span className="font-medium">{stats.totalRegions}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Last Updated</span>
                              <span className="font-medium">
                                {new Date(stats.lastUpdated).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Data Sources</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <p>✓ Government regulatory databases</p>
                            <p>✓ Official compliance documentation</p>
                            <p>✓ Regional authority sources</p>
                            <p>✓ Real-time regulatory updates</p>
                            <p className="mt-3 text-gray-600 dark:text-gray-400">
                              All data stored in PostgreSQL with full ACID compliance
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}