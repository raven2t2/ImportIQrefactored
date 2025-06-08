import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Shield, Globe, AlertTriangle, CheckCircle, Clock, DollarSign, FileText, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

// Global eligibility check schema
const eligibilitySchema = z.object({
  // Input method: URL or manual entry
  inputMethod: z.enum(["url", "manual"]),
  
  // For URL-based lookup
  auctionUrl: z.string().optional(),
  
  // For manual entry
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1950).max(new Date().getFullYear() + 1),
  vin: z.string().optional(),
  engineSize: z.number().optional(),
  fuelType: z.enum(["petrol", "diesel", "hybrid", "electric", "other"]).optional(),
  bodyType: z.enum(["sedan", "hatchback", "wagon", "suv", "coupe", "convertible", "motorcycle", "truck", "van"]).optional(),
  driveType: z.enum(["LHD", "RHD"]),
  transmission: z.enum(["manual", "automatic", "cvt"]).optional(),
  origin: z.enum(["japan", "usa", "uk", "europe", "other"]),
  estimatedValue: z.number().min(1000, "Estimated value must be at least $1,000"),
  
  // Target countries for import
  targetCountries: z.array(z.enum(["AU", "US", "UK", "CA"])).min(1, "Select at least one target country"),
});

type EligibilityData = z.infer<typeof eligibilitySchema>;

interface CountryEligibilityResult {
  targetCountry: 'AU' | 'US' | 'UK' | 'CA';
  eligible: boolean;
  eligibilityType: string;
  ageRequirement: {
    minimumAge: number;
    currentAge: number;
    meetsRequirement: boolean;
    ruleDescription: string;
  };
  complianceRequirements: {
    standardsCompliance: boolean;
    safetyModifications: string[];
    emissionsModifications: string[];
    inspectionRequired: boolean;
    testingRequired: boolean;
  };
  estimatedCosts: {
    complianceCost: number;
    modificationCost: number;
    inspectionFees: number;
    dutyAndTaxes: number;
  };
  restrictions: string[];
  nextSteps: string[];
  warnings: string[];
  timeline: {
    totalWeeks: number;
    phases: { phase: string; weeks: number; description: string }[];
  };
}

interface EligibilityResults {
  vehicle: {
    make: string;
    model: string;
    year: number;
    origin: string;
    estimatedValue: number;
  };
  results: CountryEligibilityResult[];
  overallSummary: {
    eligibleCountries: number;
    easiestCountry: string;
    cheapestCountry: string;
    fastestCountry: string;
  };
}

export default function VehicleEligibilityChecker() {
  const [results, setResults] = useState<EligibilityResults | null>(null);
  const [activeTab, setActiveTab] = useState("input");
  const { toast } = useToast();

  const form = useForm<EligibilityData>({
    resolver: zodResolver(eligibilitySchema),
    defaultValues: {
      inputMethod: "manual",
      make: "",
      model: "",
      year: 2020,
      driveType: "RHD",
      origin: "japan",
      estimatedValue: 50000,
      targetCountries: ["AU"],
    },
  });

  const inputMethod = form.watch("inputMethod");

  const checkEligibilityMutation = useMutation({
    mutationFn: async (data: EligibilityData): Promise<EligibilityResults> => {
      const response = await apiRequest("POST", "/api/check-vehicle-eligibility", data);
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data);
      setActiveTab("results");
      toast({
        title: "Eligibility Check Complete",
        description: `Checked eligibility for ${data.results.length} countries`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Eligibility Check Failed",
        description: error.message || "An error occurred while checking eligibility",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EligibilityData) => {
    checkEligibilityMutation.mutate(data);
  };

  const formatCurrency = (amount: number, country: string) => {
    const currencies = { AU: 'AUD', US: 'USD', UK: 'GBP', CA: 'CAD' };
    const currency = currencies[country as keyof typeof currencies] || 'USD';
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const getCountryName = (code: string) => {
    const names = { AU: 'Australia', US: 'United States', UK: 'United Kingdom', CA: 'Canada' };
    return names[code as keyof typeof names] || code;
  };

  const getEligibilityColor = (eligible: boolean) => {
    return eligible ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Global Vehicle Eligibility Checker</h1>
                <p className="text-sm text-gray-600">Check import eligibility across Australia, US, UK, and Canada</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href="/">
                <Button variant="outline" size="sm">← Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input">Vehicle Details</TabsTrigger>
            <TabsTrigger value="results" disabled={!results}>Eligibility Results</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-6">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span>Vehicle Information</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Enter vehicle details or paste an auction URL for automatic detection
                </p>
                
                {/* What We Check */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900 mb-2">Comprehensive eligibility check includes:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-blue-500" />
                        <span>Age-based import rules (25-year, 15-year)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-blue-500" />
                        <span>Safety and emissions compliance</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-blue-500" />
                        <span>Special scheme eligibility (SEVS, EPA, etc.)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-blue-500" />
                        <span>Modification requirements & costs</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-blue-500" />
                        <span>Import duties, taxes & timeline</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-blue-500" />
                        <span>Country-specific restrictions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Input Method Selection */}
                    <FormField
                      control={form.control}
                      name="inputMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How would you like to enter vehicle details?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="manual">Enter details manually</SelectItem>
                              <SelectItem value="url">Paste auction URL (Auto-detect)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* URL Input */}
                    {inputMethod === "url" && (
                      <FormField
                        control={form.control}
                        name="auctionUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Auction URL</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="https://auctions.yahoo.co.jp/... or https://copart.com/..."
                                className="bg-white border-gray-300"
                              />
                            </FormControl>
                            <p className="text-xs text-gray-600">
                              Supports Yahoo Auctions Japan, Copart, Manheim, BCA, and other major auction sites
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Manual Entry Fields */}
                    {inputMethod === "manual" && (
                      <>
                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="make"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Make *</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Toyota"
                                    className="bg-white border-gray-300"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="model"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Model *</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Supra"
                                    className="bg-white border-gray-300"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="year"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Year *</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    min="1950"
                                    max={new Date().getFullYear() + 1}
                                    placeholder="1995"
                                    className="bg-white border-gray-300"
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="origin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country of Origin *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-white border-gray-300">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="japan">Japan</SelectItem>
                                    <SelectItem value="usa">United States</SelectItem>
                                    <SelectItem value="uk">United Kingdom</SelectItem>
                                    <SelectItem value="europe">Europe (Other)</SelectItem>
                                    <SelectItem value="other">Other Country</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="driveType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Drive Type *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-white border-gray-300">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="RHD">Right-Hand Drive (RHD)</SelectItem>
                                    <SelectItem value="LHD">Left-Hand Drive (LHD)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="estimatedValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estimated Value (USD) *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="1000"
                                  placeholder="50000"
                                  className="bg-white border-gray-300"
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <p className="text-xs text-gray-600">
                                Used for duty and tax calculations
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Optional Details */}
                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="bodyType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Body Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-white border-gray-300">
                                      <SelectValue placeholder="Select body type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="sedan">Sedan</SelectItem>
                                    <SelectItem value="hatchback">Hatchback</SelectItem>
                                    <SelectItem value="wagon">Wagon</SelectItem>
                                    <SelectItem value="suv">SUV</SelectItem>
                                    <SelectItem value="coupe">Coupe</SelectItem>
                                    <SelectItem value="convertible">Convertible</SelectItem>
                                    <SelectItem value="motorcycle">Motorcycle</SelectItem>
                                    <SelectItem value="truck">Truck</SelectItem>
                                    <SelectItem value="van">Van</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="fuelType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fuel Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-white border-gray-300">
                                      <SelectValue placeholder="Select fuel type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="petrol">Petrol/Gasoline</SelectItem>
                                    <SelectItem value="diesel">Diesel</SelectItem>
                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                    <SelectItem value="electric">Electric</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="vin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>VIN (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="17-character VIN"
                                    maxLength={17}
                                    className="bg-white border-gray-300"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    )}

                    {/* Target Countries */}
                    <FormField
                      control={form.control}
                      name="targetCountries"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check eligibility for:</FormLabel>
                          <div className="grid grid-cols-4 gap-4">
                            {[
                              { code: 'AU', name: 'Australia', flag: '🇦🇺' },
                              { code: 'US', name: 'United States', flag: '🇺🇸' },
                              { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
                              { code: 'CA', name: 'Canada', flag: '🇨🇦' }
                            ].map((country) => (
                              <div key={country.code} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={country.code}
                                  checked={field.value.includes(country.code as any)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      field.onChange([...field.value, country.code]);
                                    } else {
                                      field.onChange(field.value.filter(c => c !== country.code));
                                    }
                                  }}
                                  className="h-4 w-4"
                                />
                                <label htmlFor={country.code} className="text-sm font-medium">
                                  {country.flag} {country.name}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={checkEligibilityMutation.isPending}
                    >
                      {checkEligibilityMutation.isPending ? "Checking Eligibility..." : "Check Vehicle Eligibility"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {results && (
              <>
                {/* Vehicle Summary */}
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span>Vehicle Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Vehicle</p>
                        <p className="font-semibold">{results.vehicle.year} {results.vehicle.make} {results.vehicle.model}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Origin</p>
                        <p className="font-semibold">{results.vehicle.origin.toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Value</p>
                        <p className="font-semibold">${results.vehicle.estimatedValue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Age</p>
                        <p className="font-semibold">{new Date().getFullYear() - results.vehicle.year} years</p>
                      </div>
                    </div>

                    {/* Overall Summary */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Import Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Eligible Countries:</span>
                          <span className="ml-2 font-semibold">{results.overallSummary.eligibleCountries} of {results.results.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Easiest:</span>
                          <span className="ml-2 font-semibold">{results.overallSummary.easiestCountry}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Cheapest:</span>
                          <span className="ml-2 font-semibold">{results.overallSummary.cheapestCountry}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Fastest:</span>
                          <span className="ml-2 font-semibold">{results.overallSummary.fastestCountry}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Country Results */}
                <div className="grid gap-6">
                  {results.results.map((result) => (
                    <Card key={result.targetCountry} className={`border-2 ${result.eligible ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center space-x-2">
                            <Globe className="h-5 w-5" />
                            <span>{getCountryName(result.targetCountry)}</span>
                          </span>
                          <Badge className={getEligibilityColor(result.eligible)}>
                            {result.eligible ? 'Eligible' : 'Not Eligible'}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-gray-600">{result.eligibilityType}</p>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        {/* Age Requirement */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Age Requirement</h4>
                            <div className="flex items-center space-x-2">
                              {result.ageRequirement.meetsRequirement ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="text-sm">
                                {result.ageRequirement.currentAge} years (min: {result.ageRequirement.minimumAge})
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{result.ageRequirement.ruleDescription}</p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Timeline</h4>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">{result.timeline.totalWeeks} weeks total</span>
                            </div>
                            <div className="mt-1 space-y-1">
                              {result.timeline.phases.slice(0, 2).map((phase, index) => (
                                <div key={index} className="text-xs text-gray-600">
                                  • {phase.phase}: {phase.weeks} weeks
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Costs Breakdown */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Estimated Costs</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-white rounded-lg border">
                              <DollarSign className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                              <p className="text-xs text-gray-600">Compliance</p>
                              <p className="font-semibold">{formatCurrency(result.estimatedCosts.complianceCost, result.targetCountry)}</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg border">
                              <DollarSign className="h-4 w-4 mx-auto text-orange-500 mb-1" />
                              <p className="text-xs text-gray-600">Modifications</p>
                              <p className="font-semibold">{formatCurrency(result.estimatedCosts.modificationCost, result.targetCountry)}</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg border">
                              <DollarSign className="h-4 w-4 mx-auto text-green-500 mb-1" />
                              <p className="text-xs text-gray-600">Inspections</p>
                              <p className="font-semibold">{formatCurrency(result.estimatedCosts.inspectionFees, result.targetCountry)}</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg border">
                              <DollarSign className="h-4 w-4 mx-auto text-red-500 mb-1" />
                              <p className="text-xs text-gray-600">Duty & Tax</p>
                              <p className="font-semibold">{formatCurrency(result.estimatedCosts.dutyAndTaxes, result.targetCountry)}</p>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-gray-100 rounded-lg text-center">
                            <p className="text-sm text-gray-600">Total Import Cost</p>
                            <p className="text-xl font-bold text-gray-900">
                              {formatCurrency(
                                result.estimatedCosts.complianceCost + 
                                result.estimatedCosts.modificationCost + 
                                result.estimatedCosts.inspectionFees + 
                                result.estimatedCosts.dutyAndTaxes,
                                result.targetCountry
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Warnings & Restrictions */}
                        {(result.warnings.length > 0 || result.restrictions.length > 0) && (
                          <div className="space-y-3">
                            {result.warnings.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-orange-600 mb-2">⚠️ Warnings</h4>
                                <ul className="text-sm text-orange-700 space-y-1">
                                  {result.warnings.map((warning, index) => (
                                    <li key={index}>• {warning}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {result.restrictions.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-red-600 mb-2">🚫 Restrictions</h4>
                                <ul className="text-sm text-red-700 space-y-1">
                                  {result.restrictions.map((restriction, index) => (
                                    <li key={index}>• {restriction}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Next Steps */}
                        {result.nextSteps.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-green-600 mb-2">✅ Next Steps</h4>
                            <ul className="text-sm text-green-700 space-y-1">
                              {result.nextSteps.map((step, index) => (
                                <li key={index}>• {step}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  <Button onClick={() => setActiveTab("input")} variant="outline">
                    Check Another Vehicle
                  </Button>
                  <Link href="/import-calculator-au">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Get Detailed Australian Quote
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}