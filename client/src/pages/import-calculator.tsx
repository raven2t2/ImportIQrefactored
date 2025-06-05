import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Calculator, Ship, Crown, FileText, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSubmissionSchema, type CalculationResult } from "@shared/schema";
import EmailGate from "@/components/email-gate";
import CTASection from "@/components/cta-section";
import type { z } from "zod";

type FormData = z.infer<typeof insertSubmissionSchema>;

interface CalculationResponse {
  success: boolean;
  calculations: CalculationResult;
  submission: any;
}

export default function ImportCalculator() {
  const [calculations, setCalculations] = useState<CalculationResult | null>(null);
  const [selectedServiceTier, setSelectedServiceTier] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; isReturning: boolean } | null>(null);
  const { toast } = useToast();

  // Check for existing trial login status and URL parameters
  useEffect(() => {
    const trialUserName = localStorage.getItem('trial_user_name');
    const trialUserEmail = localStorage.getItem('trial_user_email');
    
    if (trialUserName && trialUserEmail) {
      setUserInfo({
        name: trialUserName,
        email: trialUserEmail,
        isReturning: true
      });
    }
  }, []);

  // Save report mutation
  const saveReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      return await apiRequest("POST", "/api/save-report", reportData);
    },
    onSuccess: () => {
      toast({
        title: "Report Saved!",
        description: "Your import calculation has been saved to your ImportIQ dashboard.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Unable to save report. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Extract URL parameters for vehicle data
  const getUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      price: urlParams.get('price') ? parseInt(urlParams.get('price')!) : 0,
      year: urlParams.get('year') ? parseInt(urlParams.get('year')!) : 2020,
      make: urlParams.get('make') || '',
      model: urlParams.get('model') || '',
    };
  };

  const urlParams = getUrlParams();

  const form = useForm<FormData>({
    resolver: zodResolver(insertSubmissionSchema),
    defaultValues: {
      vehiclePrice: urlParams.price,
      shippingOrigin: undefined,
      zipCode: "",
      vehicleMake: urlParams.make,
      vehicleModel: urlParams.model,
      vehicleYear: urlParams.year,
    },
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: FormData): Promise<CalculationResponse> => {
      const response = await apiRequest("POST", "/api/calculate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setCalculations(data.calculations);
      toast({
        title: "Calculation Complete",
        description: "Your import costs have been calculated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Calculation Failed",
        description: error.message || "An error occurred while calculating costs.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    calculateMutation.mutate(data);
  };

  // Function to calculate costs with different service tiers
  const handleSaveReport = () => {
    if (calculations && userInfo) {
      const reportData = {
        email: userInfo.email,
        reportType: "import-calculation",
        reportTitle: `Import Cost Report - ${form.getValues("vehicleMake")} ${form.getValues("vehicleModel")}`,
        reportData: {
          ...calculations,
          vehicleDetails: {
            make: form.getValues("vehicleMake"),
            model: form.getValues("vehicleModel"),
            year: form.getValues("vehicleYear"),
            price: form.getValues("vehiclePrice"),
            origin: form.getValues("shippingOrigin"),
          },
          customerInfo: {
            name: userInfo.name,
            email: userInfo.email,
          }
        }
      };
      
      saveReportMutation.mutate(reportData);
    }
  };

  const calculateWithServiceTier = (baseCosts: CalculationResult, tier: string) => {
    if (!baseCosts) return baseCosts;
    
    const baseLandedCost = baseCosts.vehiclePrice + baseCosts.shipping + baseCosts.customsDuty + baseCosts.gst + baseCosts.lct + baseCosts.inspection;
    
    let serviceFee: number;
    let serviceTierDescription: string;
    
    switch (tier) {
      case "Essentials":
        serviceFee = 3000;
        serviceTierDescription = "For confident buyers who just want clean sourcing and smooth delivery. Verified partner referrals, transparent costs, progress tracking.";
        break;
      case "Concierge":
        serviceFee = 5000;
        serviceTierDescription = "For busy professionals or first-timers who want hands-on project management. Includes mod shop liaison, priority sourcing, enhanced updates.";
        break;
      case "Elite":
        serviceFee = 10000;
        serviceTierDescription = "For collectors and complex builds that turn heads. Exclusive sourcing, full build coordination, white-glove delivery experience.";
        break;
      default:
        return baseCosts;
    }
    
    return {
      ...baseCosts,
      serviceFee,
      totalCost: baseLandedCost + serviceFee,
      serviceTier: tier,
      serviceTierDescription,
    };
  };

  // Get the displayed calculations based on selected tier or original
  const displayedCalculations = selectedServiceTier && calculations 
    ? calculateWithServiceTier(calculations, selectedServiceTier)
    : calculations;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const getServiceTierColor = (tier: string) => {
    switch (tier) {
      case "Essentials":
        return "from-blue-50 to-blue-100 border-blue-200";
      case "Concierge":
        return "from-purple-50 to-purple-100 border-purple-200";
      case "Elite":
        return "from-amber-50 to-orange-50 border-amber-200";
      default:
        return "from-gray-50 to-gray-100 border-gray-200";
    }
  };

  const getServiceTierIcon = (tier: string) => {
    switch (tier) {
      case "Elite":
        return <Crown className="h-4 w-4 text-amber-600" />;
      default:
        return <Calculator className="h-4 w-4 text-blue-600" />;
    }
  };

  // For authenticated users, skip email gate completely

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-amber-500 rounded-lg">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Import Cost Calculator</h1>
                <p className="text-sm text-gray-600">Calculate total landed costs for importing vehicles to Australia</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href="/ai-recommendations">
                <Button variant="outline" size="sm" className="border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white">AI Recommendations</Button>
              </Link>
              <Link href="/compliance-estimate">
                <Button variant="outline" size="sm" className="border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white">Compliance</Button>
              </Link>
              <Link href="/mod-estimator">
                <Button variant="outline" size="sm" className="border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white">Mods</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Pre-populated Data Banner */}
        {(urlParams.price > 0 || urlParams.make || urlParams.model) && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-900">
                Vehicle data pre-populated from Market Intelligence
              </span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              {urlParams.make && urlParams.model ? `${urlParams.make} ${urlParams.model}` : 'Vehicle details'} 
              {urlParams.year && ` (${urlParams.year})`}
              {urlParams.price > 0 && ` - $${urlParams.price.toLocaleString()} AUD`}
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Vehicle Import Calculator</h2>
                <p className="text-sm text-gray-600 mb-4">Calculate accurate landed costs for importing vehicles to Australia</p>
                
                {/* What's Included */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900 mb-2">This calculation includes:</p>
                    <div className="space-y-1 text-xs text-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                        <span>Complete landed cost breakdown</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                        <span>Service tier recommendation</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                        <span>All duties, taxes, and fees</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                        <span>Service tier comparison</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  {/* Show logged-in user info only if available */}
                  {userInfo && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700">Logged in as</span>
                      </div>
                      <div className="text-sm text-gray-900">
                        <div><strong>{userInfo.name}</strong></div>
                        <div className="text-gray-600">{userInfo.email}</div>
                      </div>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          Delivery Zip/Postal Code <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., 2000, 3000, 4000"
                            className="w-full bg-white border-gray-300 text-gray-900"
                          />
                        </FormControl>
                        <p className="text-xs text-gray-600">For accurate freight costs to your location</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Vehicle Details Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="vehicleYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">
                            Year <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="1950"
                              max={new Date().getFullYear() + 1}
                              placeholder="2020"
                              className="bg-white border-gray-300 text-gray-900"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vehicleMake"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">
                            Make <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Toyota"
                              className="w-full bg-white border-gray-300 text-gray-900"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vehicleModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">
                            Model <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Supra"
                              className="w-full bg-white border-gray-300 text-gray-900"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="vehiclePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          Vehicle Purchase Price (AUD) <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                            <Input
                              {...field}
                              type="number"
                              min="1000"
                              step="1000"
                              placeholder="85,000"
                              className="pl-8 bg-white border-gray-300 text-gray-900"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        
                        {/* Price Anchoring Examples */}
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium text-gray-700">Most popular price ranges our clients choose:</p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => field.onChange(45000)}
                              className="p-2 bg-blue-50 hover:bg-blue-100 rounded border text-center transition-colors"
                            >
                              <div className="font-medium text-blue-700">$45,000</div>
                              <div className="text-blue-600">JDM Classics</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange(85000)}
                              className="p-2 bg-amber-50 hover:bg-amber-100 rounded border border-amber-300 text-center transition-colors"
                            >
                              <div className="font-medium text-amber-700">$85,000</div>
                              <div className="text-gray-700">Premium Sports</div>
                              <div className="text-xs text-amber-700 font-medium">MOST POPULAR</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange(150000)}
                              className="p-2 bg-purple-50 hover:bg-purple-100 rounded border text-center transition-colors"
                            >
                              <div className="font-medium text-purple-700">$150,000</div>
                              <div className="text-purple-600">Supercars</div>
                            </button>
                          </div>
                        </div>

                        {/* Helpful Info */}
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="text-xs text-green-800">
                              <p className="font-medium mb-1">Popular import price ranges</p>
                              <p>Most clients import vehicles between $45,000-$150,000 AUD including all costs. Use these ranges as a starting point if you're unsure.</p>
                            </div>
                          </div>
                        </div>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shippingOrigin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-white">
                          Shipping Origin <span className="text-red-400">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select shipping origin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="japan">Japan</SelectItem>
                            <SelectItem value="usa">United States</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3"
                    disabled={calculateMutation.isPending}
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    {calculateMutation.isPending ? "Calculating..." : "Calculate Import Costs"}
                  </Button>

                  <div className="mt-3 text-center text-xs text-gray-600">
                    Calculation includes all duties, taxes, and compliance costs
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Results Section */}
          {calculations && displayedCalculations && (
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Cost Breakdown</h2>
                  <p className="text-sm text-gray-600">Detailed breakdown of all import costs</p>
                </div>

                {/* Service Tier Selector */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Compare Service Tiers:</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedServiceTier("Essentials")}
                      className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                        (selectedServiceTier === "Essentials" || (!selectedServiceTier && displayedCalculations?.serviceTier === "Essentials"))
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Essentials
                      <div className="text-xs opacity-75">$3,000</div>
                    </button>
                    <button
                      onClick={() => setSelectedServiceTier("Concierge")}
                      className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                        (selectedServiceTier === "Concierge" || (!selectedServiceTier && displayedCalculations?.serviceTier === "Concierge"))
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Concierge
                      <div className="text-xs opacity-75">$5,000</div>
                    </button>
                    <button
                      onClick={() => setSelectedServiceTier("Elite")}
                      className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                        (selectedServiceTier === "Elite" || (!selectedServiceTier && displayedCalculations?.serviceTier === "Elite"))
                          ? "bg-amber-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Elite
                      <div className="text-xs opacity-75">$10,000</div>
                    </button>
                  </div>
                  {selectedServiceTier && (
                    <button
                      onClick={() => setSelectedServiceTier(null)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                    >
                      Reset to recommended tier
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Vehicle Cost */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700 font-medium">Vehicle Price</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(displayedCalculations.vehiclePrice)}</span>
                  </div>

                  {/* Shipping Cost */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-700 font-medium">Shipping</span>
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        from {form.getValues("shippingOrigin") === "japan" ? "Japan" : "USA"}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">{formatCurrency(displayedCalculations.shipping)}</span>
                  </div>

                  {/* Customs Duty */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-700 font-medium">Customs Duty</span>
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">5%</span>
                    </div>
                    <span className="font-semibold text-gray-900">{formatCurrency(displayedCalculations.customsDuty)}</span>
                  </div>

                  {/* GST */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-700 font-medium">GST</span>
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">10%</span>
                    </div>
                    <span className="font-semibold text-gray-900">{formatCurrency(displayedCalculations.gst)}</span>
                  </div>

                  {/* LCT */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-700 font-medium">Luxury Car Tax (LCT)</span>
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">33%</span>
                    </div>
                    <span className="font-semibold text-gray-900">{formatCurrency(displayedCalculations.lct)}</span>
                  </div>

                  {/* Inspection */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700 font-medium">Inspection Fee</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(displayedCalculations.inspection)}</span>
                  </div>

                  {/* Service Fee */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-700 font-medium">Service Fee</span>
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{displayedCalculations.serviceTier}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{formatCurrency(displayedCalculations.serviceFee)}</span>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center py-4 mt-4 bg-gray-50 rounded-lg px-4 border-2 border-blue-600">
                    <span className="text-lg font-bold text-gray-900">Total Landed Cost</span>
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(displayedCalculations.totalCost)}</span>
                  </div>
                </div>

                {/* Service Tier Recommendation */}
                <div className={`mt-6 p-4 bg-gradient-to-r ${getServiceTierColor(displayedCalculations.serviceTier)} border rounded-lg`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full flex-shrink-0 mt-1">
                      {getServiceTierIcon(displayedCalculations.serviceTier)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{displayedCalculations.serviceTier} Service Tier</h3>
                        {selectedServiceTier && selectedServiceTier !== calculations?.serviceTier && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Custom Selection</span>
                        )}
                        {!selectedServiceTier && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Recommended</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{displayedCalculations.serviceTierDescription}</p>
                      <div className="mt-2 text-xs text-gray-600">
                        <span className="font-medium">
                          {displayedCalculations.serviceTier === "Essentials" && "Service Fee: $3,000 AUD - For confident buyers"}
                          {displayedCalculations.serviceTier === "Concierge" && "Service Fee: $5,000 AUD - For hands-on project management"}
                          {displayedCalculations.serviceTier === "Elite" && "Service Fee: $10,000 AUD - For collectors & complex builds"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save to Dashboard Button */}
                <div className="mt-6 flex gap-3">
                  <Button 
                    onClick={handleSaveReport}
                    disabled={saveReportMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {saveReportMutation.isPending ? "Saving..." : "Save to Dashboard"}
                  </Button>
                  
                  <Button 
                    onClick={() => window.location.href = '/checkout'}
                    className="flex-1 bg-[#D4AF37] hover:bg-amber-500"
                  >
                    Get Started - $500 Deposit
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                {/* Powerful CTA Section */}
                <div className="mt-6 p-6 bg-gradient-to-r from-[#D4AF37] to-yellow-400 rounded-xl text-white">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold mb-2">Want This Exact Car Delivered to Your Driveway?</h3>
                    <p className="text-sm opacity-90">We'll source, inspect, ship, and make it road-legal for you.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div className="bg-white bg-opacity-20 p-2 rounded text-center">
                      <div className="font-bold">6-12 Weeks</div>
                      <div className="opacity-90">Average Delivery</div>
                    </div>
                    <div className="bg-white bg-opacity-20 p-2 rounded text-center">
                      <div className="font-bold">$12,300</div>
                      <div className="opacity-90">Avg. Savings vs Local</div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => window.location.href = '/booking-calendar'}
                    className="w-full bg-white text-amber-600 hover:bg-gray-100 font-bold text-lg py-4 mb-3"
                  >
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Book My FREE Strategy Call (Value: $500)
                  </Button>
                  
                  <p className="text-center text-xs opacity-90">
                    Next available: Tomorrow 2:30pm • Only 23 slots left this month
                  </p>
                </div>

                {/* Client Success Story */}
                <div className="mt-6 p-4 bg-gray-50 border-l-4 border-brand-gold rounded">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-brand-gold rounded-full flex items-center justify-center text-white font-bold text-sm">
                      JM
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-800 mb-2">"Saved me $18,000 on my R34 GTR compared to what dealers wanted locally. The entire process was seamless - from auction bidding to compliance. Couldn't recommend them enough."</p>
                      <p className="text-gray-600 font-medium">James Mitchell • Melbourne • 2023 GTR Import</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Calculation Details */}
        <Card className="mt-8 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How We Calculate Your Costs</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Calculation Method */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Base Costs</h4>
                    <p className="text-sm text-gray-600">Vehicle price + shipping fees based on origin country</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Import Duties & Taxes</h4>
                    <p className="text-sm text-gray-600">Customs duty (5%) + GST (10%) + LCT if applicable (33%)</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Processing Fees</h4>
                    <p className="text-sm text-gray-600">Inspection ($2,000) + fixed service fee (varies by tier)</p>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                  <Ship className="h-4 w-4 text-blue-600" />
                  <span>Shipping Costs</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">From Japan:</span>
                    <span className="font-medium text-gray-900">$3,200 AUD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">From USA:</span>
                    <span className="font-medium text-gray-900">$4,500 AUD</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  Includes container shipping, port handling, and basic transit insurance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-600">© 2024 Vehicle Import Calculator. All calculations are estimates.</p>
              <p className="text-xs text-gray-600 mt-1">Consult with customs brokers for official import duties and taxes.</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.open('mailto:support@driveimmaculate.com', '_blank')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => window.open('mailto:support@driveimmaculate.com', '_blank')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => window.open('mailto:support@driveimmaculate.com', '_blank')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
