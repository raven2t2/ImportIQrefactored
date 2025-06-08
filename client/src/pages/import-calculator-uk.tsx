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

// UK-specific form schema
const ukCalculatorSchema = z.object({
  vehiclePrice: z.number().min(1000, "Vehicle price must be at least £1,000"),
  vehicleYear: z.number().min(1950).max(new Date().getFullYear() + 1),
  vehicleMake: z.string().min(1, "Vehicle make is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  shippingOrigin: z.enum(["japan", "usa", "europe", "other"]),
  postcode: z.string().min(5, "Valid UK postcode required"),
  isClassicVehicle: z.boolean().default(false), // For 40+ year vehicles
});

type UkCalculatorData = z.infer<typeof ukCalculatorSchema>;

interface UkCalculationResult {
  vehiclePrice: number;
  shipping: number;
  customsDuty: number;
  vat: number;
  dvlaFee: number;
  motTest: number;
  registrationFee: number;
  firstRegistrationTax: number;
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

export default function ImportCalculatorUK() {
  const [calculations, setCalculations] = useState<UkCalculationResult | null>(null);
  const [location] = useLocation();
  const { toast } = useToast();

  const form = useForm<UkCalculatorData>({
    resolver: zodResolver(ukCalculatorSchema),
    defaultValues: {
      vehiclePrice: 0,
      vehicleYear: 2020,
      vehicleMake: "",
      vehicleModel: "",
      shippingOrigin: "japan",
      postcode: "",
      isClassicVehicle: false,
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
      const updates: Partial<UkCalculatorData> = {};
      
      if (make) updates.vehicleMake = make;
      if (model) updates.vehicleModel = model;
      if (year) {
        const yearNum = parseInt(year);
        updates.vehicleYear = yearNum || 2020;
        updates.isClassicVehicle = yearNum && (new Date().getFullYear() - yearNum >= 40);
      }
      if (vehiclePrice) updates.vehiclePrice = parseInt(vehiclePrice) || 0;
      if (origin) {
        const originMap: Record<string, "japan" | "usa" | "europe" | "other"> = {
          'japan': 'japan',
          'usa': 'usa',
          'us': 'usa',
          'europe': 'europe',
          'uk': 'europe',
          'other': 'other'
        };
        updates.shippingOrigin = originMap[origin.toLowerCase()] || 'japan';
      }

      Object.entries(updates).forEach(([key, value]) => {
        form.setValue(key as keyof UkCalculatorData, value);
      });

      toast({
        title: "Vehicle Data Loaded",
        description: "Pre-filled calculator with vehicle details from import analysis.",
      });
    }
  }, [location, form, toast]);

  const calculateMutation = useMutation({
    mutationFn: async (data: UkCalculatorData): Promise<UkCalculationResult> => {
      const response = await apiRequest("POST", "/api/calculate-uk", data);
      return response.json();
    },
    onSuccess: (data) => {
      setCalculations(data);
      toast({
        title: "Calculation Complete",
        description: "UK import costs calculated using current DVLA rates.",
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

  const onSubmit = (data: UkCalculatorData) => {
    calculateMutation.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-600 rounded-lg">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">UK Import Calculator</h1>
                <p className="text-sm text-gray-600">Accurate landed costs using current DVLA regulations</p>
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
                <MapPin className="h-5 w-5 text-purple-600" />
                <span>Vehicle Import Details</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Calculate accurate UK import costs using current DVLA regulations
              </p>
              
              {/* What's Included */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 mb-2">Includes current UK rates:</p>
                  <div className="space-y-1 text-xs text-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                      <span>10% import duty on passenger vehicles</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                      <span>20% VAT on CIF value + duty</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                      <span>DVLA registration and licensing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                      <span>MOT testing and certification</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                      <span>Individual Vehicle Approval (if required)</span>
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
                          <FormLabel>Vehicle Price (GBP) *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="1000"
                              placeholder="35000"
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
                            <SelectItem value="europe">Europe (Road transport)</SelectItem>
                            <SelectItem value="other">Other Country</SelectItem>
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
                        <FormLabel>UK Postcode *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="SW1A 1AA"
                            className="bg-white border-gray-300"
                          />
                        </FormControl>
                        <p className="text-xs text-gray-600">For accurate freight costs</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isClassicVehicle"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Classic Vehicle (40+ years)</FormLabel>
                          <p className="text-sm text-gray-600">
                            Reduced requirements for vehicles over 40 years old
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
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={calculateMutation.isPending}
                  >
                    {calculateMutation.isPending ? "Calculating..." : "Calculate UK Import Costs"}
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
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  <span>UK Import Cost Breakdown</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Calculated using current DVLA regulations
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Total Cost */}
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Landed Cost</p>
                    <p className="text-3xl font-bold text-purple-600">
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
                      <span>Customs Duty (10%):</span>
                      <span className="font-medium">{formatCurrency(calculations.customsDuty)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT (20%):</span>
                      <span className="font-medium">{formatCurrency(calculations.vat)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DVLA Registration:</span>
                      <span className="font-medium">{formatCurrency(calculations.dvlaFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MOT Test:</span>
                      <span className="font-medium">{formatCurrency(calculations.motTest)}</span>
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