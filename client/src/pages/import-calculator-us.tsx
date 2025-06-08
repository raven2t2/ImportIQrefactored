import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
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

// US-specific form schema
const usCalculatorSchema = z.object({
  vehiclePrice: z.number().min(1000, "Vehicle price must be at least $1,000"),
  vehicleYear: z.number().min(1950).max(new Date().getFullYear() + 1),
  vehicleMake: z.string().min(1, "Vehicle make is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  shippingOrigin: z.enum(["japan", "uk", "germany", "other"]),
  usState: z.enum([
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", 
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
    "DC", "PR", "VI", "GU", "AS", "MP"
  ]),
  zipCode: z.string().min(5, "Valid US ZIP code required"),
  over25Years: z.boolean().default(false), // For 25-year exemption
});

type UsCalculatorData = z.infer<typeof usCalculatorSchema>;

interface UsCalculationResult {
  vehiclePrice: number;
  shipping: number;
  customsDuty: number;
  epaFee: number;
  dotCompliance: number;
  gasGuzzlerTax: number;
  harborMaintenanceFee: number;
  merchandiseProcessingFee: number;
  stateFees: {
    registration: number;
    inspection: number;
    emissions: number;
  };
  totalLandedCost: number;
  breakdown: {
    cifValue: number;
    totalTaxes: number;
    totalFees: number;
  };
  region: string;
  complianceEligible: boolean;
  exemptionType?: string;
}

export default function ImportCalculatorUS() {
  const [calculations, setCalculations] = useState<UsCalculationResult | null>(null);
  const [location] = useLocation();
  const { toast } = useToast();

  const form = useForm<UsCalculatorData>({
    resolver: zodResolver(usCalculatorSchema),
    defaultValues: {
      vehiclePrice: 0,
      vehicleYear: 2020,
      vehicleMake: "",
      vehicleModel: "",
      shippingOrigin: "japan",
      usState: "CA",
      zipCode: "",
      over25Years: false,
    },
  });

  // Pre-fill form from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const make = urlParams.get('make');
    const model = urlParams.get('model');
    const year = urlParams.get('year');
    const vehiclePrice = urlParams.get('vehiclePrice');
    const origin = urlParams.get('origin');

    if (make || model || year || vehiclePrice || origin) {
      const updates: Partial<UsCalculatorData> = {};
      
      if (make) updates.vehicleMake = make;
      if (model) updates.vehicleModel = model;
      if (year) {
        const yearNum = parseInt(year);
        updates.vehicleYear = yearNum || 2020;
        updates.over25Years = yearNum && (new Date().getFullYear() - yearNum >= 25);
      }
      if (vehiclePrice) updates.vehiclePrice = parseInt(vehiclePrice) || 0;
      if (origin) {
        const originMap: Record<string, "japan" | "uk" | "germany" | "other"> = {
          'japan': 'japan',
          'uk': 'uk',
          'germany': 'germany',
          'other': 'other'
        };
        updates.shippingOrigin = originMap[origin.toLowerCase()] || 'japan';
      }

      Object.entries(updates).forEach(([key, value]) => {
        form.setValue(key as keyof UsCalculatorData, value);
      });

      toast({
        title: "Vehicle Data Loaded",
        description: "Pre-filled calculator with vehicle details from import analysis.",
      });
    }
  }, [location, form, toast]);

  const calculateMutation = useMutation({
    mutationFn: async (data: UsCalculatorData): Promise<UsCalculationResult> => {
      const response = await apiRequest("POST", "/api/calculate-us", data);
      return response.json();
    },
    onSuccess: (data) => {
      setCalculations(data);
      toast({
        title: "Calculation Complete",
        description: "US import costs calculated using current DOT/EPA rates.",
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

  const onSubmit = (data: UsCalculatorData) => {
    calculateMutation.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">US Import Calculator</h1>
                <p className="text-sm text-gray-600">Accurate landed costs using current DOT/EPA regulations</p>
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
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>Vehicle Import Details</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Calculate accurate US import costs using current DOT and EPA regulations
              </p>
              
              {/* What's Included */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 mb-2">Includes current US rates:</p>
                  <div className="space-y-1 text-xs text-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      <span>2.5% import duty on passenger vehicles</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      <span>DOT/EPA compliance requirements</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      <span>Gas Guzzler Tax (if applicable)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      <span>Harbor Maintenance Fee</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
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
                          <FormLabel>Vehicle Price (USD) *</FormLabel>
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
                            <SelectItem value="uk">United Kingdom (Container)</SelectItem>
                            <SelectItem value="germany">Germany (Container)</SelectItem>
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
                      name="usState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>US State *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white border-gray-300">
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CA">California</SelectItem>
                              <SelectItem value="NY">New York</SelectItem>
                              <SelectItem value="TX">Texas</SelectItem>
                              <SelectItem value="FL">Florida</SelectItem>
                              <SelectItem value="WA">Washington</SelectItem>
                              {/* Add more states as needed */}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="90210"
                              maxLength={5}
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
                    name="over25Years"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">25+ Year Vehicle</FormLabel>
                          <p className="text-sm text-gray-600">
                            Exempt from EPA/DOT compliance requirements
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
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={calculateMutation.isPending}
                  >
                    {calculateMutation.isPending ? "Calculating..." : "Calculate US Import Costs"}
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
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span>US Import Cost Breakdown</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Calculated using current DOT/EPA regulations
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Total Cost */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Landed Cost</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {formatCurrency(calculations.totalLandedCost)}
                    </p>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Cost Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Vehicle Price:</span>
                      <span className="font-medium">{formatCurrency(calculations.vehiclePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span className="font-medium">{formatCurrency(calculations.shipping)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customs Duty (2.5%):</span>
                      <span className="font-medium">{formatCurrency(calculations.customsDuty)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DOT Compliance:</span>
                      <span className="font-medium">{formatCurrency(calculations.dotCompliance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>EPA Fee:</span>
                      <span className="font-medium">{formatCurrency(calculations.epaFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State Fees:</span>
                      <span className="font-medium">
                        {formatCurrency(calculations.stateFees.registration + calculations.stateFees.inspection + calculations.stateFees.emissions)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}