import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Calculator, MapPin, DollarSign, FileText } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

// Australian-specific form schema
const auCalculatorSchema = z.object({
  vehiclePrice: z.number().min(1000, "Vehicle price must be at least $1,000"),
  vehicleYear: z.number().min(1950).max(new Date().getFullYear() + 1),
  vehicleMake: z.string().min(1, "Vehicle make is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  shippingOrigin: z.enum(["japan", "usa", "uk", "other"]),
  australianState: z.enum(["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"]),
  postcode: z.string().min(4, "Valid Australian postcode required"),
  fuelEfficient: z.boolean().default(false), // For LCT calculation
});

type AuCalculatorData = z.infer<typeof auCalculatorSchema>;

interface AuCalculationResult {
  vehiclePrice: number;
  shipping: number;
  customsDuty: number;
  gst: number;
  luxuryCarTax: number;
  inspectionFee: number;
  quarantineFee: number;
  customsProcessing: number;
  complianceCost: number;
  stateFees: {
    registration: number;
    ctp: number;
    inspection: number;
  };
  totalLandedCost: number;
  breakdown: {
    cifValue: number;
    taxableValue: number;
    totalTaxes: number;
    totalFees: number;
  };
  region: string;
  complianceEligible: boolean;
  exemptionType?: string;
}

export default function ImportCalculatorAU() {
  const [calculations, setCalculations] = useState<AuCalculationResult | null>(null);
  const { toast } = useToast();

  const form = useForm<AuCalculatorData>({
    resolver: zodResolver(auCalculatorSchema),
    defaultValues: {
      vehiclePrice: 0,
      vehicleYear: 2020,
      vehicleMake: "",
      vehicleModel: "",
      shippingOrigin: "japan",
      australianState: "NSW",
      postcode: "",
      fuelEfficient: false,
    },
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: AuCalculatorData): Promise<AuCalculationResult> => {
      const response = await apiRequest("POST", "/api/calculate-au", data);
      return response.json();
    },
    onSuccess: (data) => {
      setCalculations(data);
      toast({
        title: "Calculation Complete",
        description: "Australian import costs calculated using current government rates.",
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

  const onSubmit = (data: AuCalculatorData) => {
    calculateMutation.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-lg">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Australian Import Calculator</h1>
                <p className="text-sm text-gray-600">Accurate landed costs using 2024-25 government rates</p>
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
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-green-600" />
                <span>Vehicle Import Details</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Calculate accurate Australian import costs using current Department of Home Affairs rates
              </p>
              
              {/* What's Included */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 mb-2">Includes current 2024-25 rates:</p>
                  <div className="space-y-1 text-xs text-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      <span>5% Import duty on passenger vehicles</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      <span>10% GST on CIF value + duty</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      <span>LCT: $71,849/$84,916 thresholds</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      <span>ACIS inspection + quarantine fees</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      <span>State-specific registration costs</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="vehiclePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Price (AUD) *</FormLabel>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vehicleYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="1950"
                              max={new Date().getFullYear() + 1}
                              placeholder="2020"
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
                      name="vehicleMake"
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
                      name="vehicleModel"
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
                  </div>

                  <FormField
                    control={form.control}
                    name="shippingOrigin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Origin *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white border-gray-300">
                              <SelectValue placeholder="Select origin country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="japan">Japan (RoRo shipping)</SelectItem>
                            <SelectItem value="usa">United States (Container)</SelectItem>
                            <SelectItem value="uk">United Kingdom (Container)</SelectItem>
                            <SelectItem value="other">Other Country</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="australianState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Australian State *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white border-gray-300">
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="NSW">New South Wales</SelectItem>
                              <SelectItem value="VIC">Victoria</SelectItem>
                              <SelectItem value="QLD">Queensland</SelectItem>
                              <SelectItem value="SA">South Australia</SelectItem>
                              <SelectItem value="WA">Western Australia</SelectItem>
                              <SelectItem value="TAS">Tasmania</SelectItem>
                              <SelectItem value="NT">Northern Territory</SelectItem>
                              <SelectItem value="ACT">Australian Capital Territory</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postcode *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="2000"
                              maxLength={4}
                              className="bg-white border-gray-300"
                            />
                          </FormControl>
                          <p className="text-xs text-gray-600">For accurate freight costs</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="fuelEfficient"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Fuel Efficient Vehicle</FormLabel>
                          <p className="text-sm text-gray-600">
                            Lower LCT threshold applies ($71,849 vs $84,916)
                          </p>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={calculateMutation.isPending}
                  >
                    {calculateMutation.isPending ? "Calculating..." : "Calculate Australian Import Costs"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Results Section */}
          {calculations && (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span>Australian Import Cost Breakdown</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Calculated using current Department of Home Affairs rates
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Total Cost */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Landed Cost</p>
                    <p className="text-3xl font-bold text-green-700">
                      {formatCurrency(calculations.totalLandedCost)}
                    </p>
                    <p className="text-xs text-gray-500">All fees and taxes included</p>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Government Fees & Taxes</h4>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-700">Vehicle Price</span>
                    <span className="font-medium">{formatCurrency(calculations.vehiclePrice)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-700">Shipping & Freight</span>
                    <span className="font-medium">{formatCurrency(calculations.shipping)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-700">Customs Duty (5%)</span>
                    <span className="font-medium">{formatCurrency(calculations.customsDuty)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-700">GST (10%)</span>
                    <span className="font-medium">{formatCurrency(calculations.gst)}</span>
                  </div>
                  
                  {calculations.luxuryCarTax > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-700">Luxury Car Tax (33%)</span>
                      <span className="font-medium text-red-600">{formatCurrency(calculations.luxuryCarTax)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-700">ACIS Inspection</span>
                    <span className="font-medium">{formatCurrency(calculations.inspectionFee)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-700">Quarantine Fee</span>
                    <span className="font-medium">{formatCurrency(calculations.quarantineFee)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-700">Customs Processing</span>
                    <span className="font-medium">{formatCurrency(calculations.customsProcessing)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-700">Compliance Cost</span>
                    <span className="font-medium">{formatCurrency(calculations.complianceCost)}</span>
                  </div>
                </div>

                {/* State-specific costs */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">{calculations.region} State Fees</h4>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-700">Registration</span>
                    <span className="font-medium">{formatCurrency(calculations.stateFees.registration)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-700">CTP Insurance</span>
                    <span className="font-medium">{formatCurrency(calculations.stateFees.ctp)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-700">State Inspection</span>
                    <span className="font-medium">{formatCurrency(calculations.stateFees.inspection)}</span>
                  </div>
                </div>

                {/* Compliance Info */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Compliance Status</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {calculations.complianceEligible 
                      ? `✓ Vehicle is eligible for import${calculations.exemptionType ? ` (${calculations.exemptionType})` : ''}`
                      : "✗ Vehicle may not be eligible for import - check age requirements"
                    }
                  </p>
                </div>

                {/* Disclaimer */}
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">Disclaimer:</p>
                  <p>
                    Calculations use current Australian Government rates as of 2024-25. 
                    Actual costs may vary based on specific vehicle details, currency fluctuations, 
                    and changes to government regulations. This is an estimate only.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}