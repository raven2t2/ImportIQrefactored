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

// Canada-specific form schema
const caCalculatorSchema = z.object({
  vehiclePrice: z.number().min(1000, "Vehicle price must be at least $1,000"),
  vehicleYear: z.number().min(1950).max(new Date().getFullYear() + 1),
  vehicleMake: z.string().min(1, "Vehicle make is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  shippingOrigin: z.enum(["japan", "usa", "uk", "other"]),
  canadianProvince: z.enum(["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"]),
  postalCode: z.string().min(6, "Valid Canadian postal code required"),
  over15Years: z.boolean().default(false), // For 15-year exemption
});

type CaCalculatorData = z.infer<typeof caCalculatorSchema>;

interface CaCalculationResult {
  vehiclePrice: number;
  shipping: number;
  customsDuty: number;
  gst: number;
  provincialTax: number;
  inspectionFee: number;
  registrationFee: number;
  exciseTax: number;
  provincialFees: {
    registration: number;
    safety: number;
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

export default function ImportCalculatorCA() {
  const [calculations, setCalculations] = useState<CaCalculationResult | null>(null);
  const [location] = useLocation();
  const { toast } = useToast();

  const form = useForm<CaCalculatorData>({
    resolver: zodResolver(caCalculatorSchema),
    defaultValues: {
      vehiclePrice: 0,
      vehicleYear: 2020,
      vehicleMake: "",
      vehicleModel: "",
      shippingOrigin: "japan",
      canadianProvince: "ON",
      postalCode: "",
      over15Years: false,
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
      const updates: Partial<CaCalculatorData> = {};
      
      if (make) updates.vehicleMake = make;
      if (model) updates.vehicleModel = model;
      if (year) {
        const yearNum = parseInt(year);
        updates.vehicleYear = yearNum || 2020;
        updates.over15Years = yearNum && (new Date().getFullYear() - yearNum >= 15);
      }
      if (vehiclePrice) updates.vehiclePrice = parseInt(vehiclePrice) || 0;
      if (origin) {
        const originMap: Record<string, "japan" | "usa" | "uk" | "other"> = {
          'japan': 'japan',
          'usa': 'usa',
          'us': 'usa',
          'uk': 'uk',
          'other': 'other'
        };
        updates.shippingOrigin = originMap[origin.toLowerCase()] || 'japan';
      }

      Object.entries(updates).forEach(([key, value]) => {
        form.setValue(key as keyof CaCalculatorData, value);
      });

      toast({
        title: "Vehicle Data Loaded",
        description: "Pre-filled calculator with vehicle details from import analysis.",
      });
    }
  }, [location, form, toast]);

  const calculateMutation = useMutation({
    mutationFn: async (data: CaCalculatorData): Promise<CaCalculationResult> => {
      const response = await apiRequest("POST", "/api/calculate-ca", data);
      return response.json();
    },
    onSuccess: (data) => {
      setCalculations(data);
      toast({
        title: "Calculation Complete",
        description: "Canadian import costs calculated using current Transport Canada rates.",
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

  const onSubmit = (data: CaCalculatorData) => {
    calculateMutation.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-red-600 rounded-lg">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Canadian Import Calculator</h1>
                <p className="text-sm text-gray-600">Accurate landed costs using current Transport Canada regulations</p>
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
                <MapPin className="h-5 w-5 text-red-600" />
                <span>Vehicle Import Details</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Calculate accurate Canadian import costs using current Transport Canada regulations
              </p>
              
              {/* What's Included */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 mb-2">Includes current Canadian rates:</p>
                  <div className="space-y-1 text-xs text-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                      <span>6.1% import duty on passenger vehicles</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                      <span>5% GST on CIF value + duty</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                      <span>Provincial sales tax (varies by province)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                      <span>Inspection and safety certification</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                      <span>Provincial registration fees</span>
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
                          <FormLabel>Vehicle Price (CAD) *</FormLabel>
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
                      name="canadianProvince"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Canadian Province *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white border-gray-300">
                                <SelectValue placeholder="Select province" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ON">Ontario</SelectItem>
                              <SelectItem value="BC">British Columbia</SelectItem>
                              <SelectItem value="AB">Alberta</SelectItem>
                              <SelectItem value="QC">Quebec</SelectItem>
                              <SelectItem value="MB">Manitoba</SelectItem>
                              <SelectItem value="SK">Saskatchewan</SelectItem>
                              <SelectItem value="NS">Nova Scotia</SelectItem>
                              <SelectItem value="NB">New Brunswick</SelectItem>
                              <SelectItem value="NL">Newfoundland and Labrador</SelectItem>
                              <SelectItem value="PE">Prince Edward Island</SelectItem>
                              <SelectItem value="YT">Yukon</SelectItem>
                              <SelectItem value="NT">Northwest Territories</SelectItem>
                              <SelectItem value="NU">Nunavut</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="M5V 3A8"
                              maxLength={7}
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
                    name="over15Years"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">15+ Year Vehicle</FormLabel>
                          <p className="text-sm text-gray-600">
                            Eligible for reduced compliance requirements
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
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={calculateMutation.isPending}
                  >
                    {calculateMutation.isPending ? "Calculating..." : "Calculate Canadian Import Costs"}
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
                  <DollarSign className="h-5 w-5 text-red-600" />
                  <span>Canadian Import Cost Breakdown</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Calculated using current Transport Canada regulations
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Total Cost */}
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Landed Cost</p>
                    <p className="text-3xl font-bold text-red-600">
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
                      <span>Customs Duty (6.1%):</span>
                      <span className="font-medium">{formatCurrency(calculations.customsDuty)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (5%):</span>
                      <span className="font-medium">{formatCurrency(calculations.gst)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Provincial Tax:</span>
                      <span className="font-medium">{formatCurrency(calculations.provincialTax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Provincial Fees:</span>
                      <span className="font-medium">
                        {formatCurrency(calculations.provincialFees.registration + calculations.provincialFees.safety + calculations.provincialFees.emissions)}
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