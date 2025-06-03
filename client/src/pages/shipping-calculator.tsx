import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Ship, MapPin, Calculator, Clock, DollarSign, Truck, Home, Info, ArrowRight, Package } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const shippingCalculatorSchema = z.object({
  originPort: z.string().min(1, "Origin port is required"),
  destinationPort: z.string().min(1, "Destination port is required"),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  shippingMethod: z.string().min(1, "Shipping method is required"),
  vehicleValue: z.string().min(1, "Vehicle value is required"),
  urgency: z.string().min(1, "Urgency is required"),
});

type ShippingCalculatorFormData = z.infer<typeof shippingCalculatorSchema>;

interface ShippingQuote {
  route: {
    origin: string;
    destination: string;
    distance: number;
    estimatedDays: number;
  };
  costs: {
    roro: {
      low: number;
      high: number;
      currency: string;
    };
    container: {
      low: number;
      high: number;
      currency: string;
    };
  };
  additionalFees: {
    handling: number;
    documentation: number;
    insurance: number;
    quarantine: number;
    portCharges: number;
  };
  totalEstimate: {
    roroLow: number;
    roroHigh: number;
    containerLow: number;
    containerHigh: number;
  };
  recommendations: string[];
  shippingTips: string[];
}

export default function ShippingCalculator() {
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const { toast } = useToast();

  const form = useForm<ShippingCalculatorFormData>({
    resolver: zodResolver(shippingCalculatorSchema),
    defaultValues: {
      originPort: "",
      destinationPort: "",
      vehicleType: "",
      shippingMethod: "",
      vehicleValue: "",
      urgency: "",
    },
  });

  const shippingMutation = useMutation({
    mutationFn: async (data: ShippingCalculatorFormData): Promise<ShippingQuote> => {
      const response = await apiRequest("POST", "/api/shipping-calculator", data);
      return response.json();
    },
    onSuccess: (data) => {
      setQuote(data);
      toast({
        title: "Shipping Quote Generated",
        description: "Your detailed shipping analysis is ready.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Quote Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ShippingCalculatorFormData) => {
    shippingMutation.mutate(data);
  };

  const formatCurrency = (amount: number, currency: string = "AUD") => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Button
              onClick={() => window.location.href = '/dashboard'}
              variant="outline"
              className="mr-4"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Ship className="h-12 w-12 text-blue-600 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Shipping Calculator</h1>
              <p className="text-gray-600 mt-2">Get accurate shipping quotes for your vehicle import</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-lg">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-900 flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Shipping Quote Request
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="originPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Origin Port</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select origin port" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="yokohama">Yokohama, Japan</SelectItem>
                              <SelectItem value="osaka">Osaka, Japan</SelectItem>
                              <SelectItem value="tokyo">Tokyo, Japan</SelectItem>
                              <SelectItem value="nagoya">Nagoya, Japan</SelectItem>
                              <SelectItem value="los-angeles">Los Angeles, USA</SelectItem>
                              <SelectItem value="new-york">New York, USA</SelectItem>
                              <SelectItem value="savannah">Savannah, USA</SelectItem>
                              <SelectItem value="baltimore">Baltimore, USA</SelectItem>
                              <SelectItem value="hamburg">Hamburg, Germany</SelectItem>
                              <SelectItem value="southampton">Southampton, UK</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="destinationPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destination Port</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select destination" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sydney">Sydney, NSW</SelectItem>
                              <SelectItem value="melbourne">Melbourne, VIC</SelectItem>
                              <SelectItem value="brisbane">Brisbane, QLD</SelectItem>
                              <SelectItem value="perth">Perth, WA</SelectItem>
                              <SelectItem value="adelaide">Adelaide, SA</SelectItem>
                              <SelectItem value="fremantle">Fremantle, WA</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="vehicleType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select vehicle type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sedan">Sedan</SelectItem>
                              <SelectItem value="coupe">Coupe</SelectItem>
                              <SelectItem value="suv">SUV</SelectItem>
                              <SelectItem value="hatchback">Hatchback</SelectItem>
                              <SelectItem value="wagon">Wagon</SelectItem>
                              <SelectItem value="truck">Truck</SelectItem>
                              <SelectItem value="motorcycle">Motorcycle</SelectItem>
                              <SelectItem value="van">Van</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shippingMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select shipping method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="roro">RoRo (Roll-on/Roll-off)</SelectItem>
                              <SelectItem value="container">Container Shipping</SelectItem>
                              <SelectItem value="both">Compare Both Methods</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="vehicleValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Value (AUD)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 45000" type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Urgency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select urgency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="standard">Standard (6-8 weeks)</SelectItem>
                              <SelectItem value="expedited">Expedited (4-6 weeks)</SelectItem>
                              <SelectItem value="express">Express (3-4 weeks)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
                    disabled={shippingMutation.isPending}
                  >
                    <Ship className="h-4 w-4 mr-2" />
                    {shippingMutation.isPending ? "Calculating..." : "Get Shipping Quote"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Results */}
          {quote && (
            <div className="space-y-6">
              {/* Route Information */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Route Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Route:</span>
                      <span className="font-semibold">{quote.route.origin} → {quote.route.destination}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Distance:</span>
                      <span className="font-semibold">{quote.route.distance.toLocaleString()} km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Estimated Transit:</span>
                      <Badge variant="outline" className="bg-blue-50">
                        <Clock className="h-3 w-3 mr-1" />
                        {quote.route.estimatedDays} days
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Costs */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Shipping Costs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                          <Truck className="h-4 w-4 mr-1" />
                          RoRo Shipping
                        </h3>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(quote.costs.roro.low)} - {formatCurrency(quote.costs.roro.high)}
                        </p>
                        <p className="text-sm text-green-600 mt-1">Drive-on, Drive-off</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                          <Package className="h-4 w-4 mr-1" />
                          Container Shipping
                        </h3>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(quote.costs.container.low)} - {formatCurrency(quote.costs.container.high)}
                        </p>
                        <p className="text-sm text-blue-600 mt-1">Enclosed Protection</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Fees */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Additional Fees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Port Handling:</span>
                      <span className="font-semibold">{formatCurrency(quote.additionalFees.handling)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Documentation:</span>
                      <span className="font-semibold">{formatCurrency(quote.additionalFees.documentation)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Insurance:</span>
                      <span className="font-semibold">{formatCurrency(quote.additionalFees.insurance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quarantine Inspection:</span>
                      <span className="font-semibold">{formatCurrency(quote.additionalFees.quarantine)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Port Charges:</span>
                      <span className="font-semibold">{formatCurrency(quote.additionalFees.portCharges)}</span>
                    </div>
                    <Separator />
                    <div className="text-lg font-bold">
                      <div className="flex justify-between text-green-600">
                        <span>Total RoRo Estimate:</span>
                        <span>{formatCurrency(quote.totalEstimate.roroLow)} - {formatCurrency(quote.totalEstimate.roroHigh)}</span>
                      </div>
                      <div className="flex justify-between text-blue-600 mt-2">
                        <span>Total Container Estimate:</span>
                        <span>{formatCurrency(quote.totalEstimate.containerLow)} - {formatCurrency(quote.totalEstimate.containerHigh)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Expert Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quote.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <ArrowRight className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <p className="text-sm text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Tips */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Shipping Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {quote.shippingTips.map((tip, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                        <p className="text-sm text-gray-600">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Shipping Estimate Disclaimer</h3>
                <p className="text-sm text-blue-700">
                  These estimates are based on current market rates and typical shipping patterns. 
                  Actual costs may vary based on seasonal demand, fuel prices, specific vehicle dimensions, 
                  and chosen shipping company. Always obtain official quotes from licensed freight forwarders 
                  for binding estimates.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}