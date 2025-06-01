import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, BarChart3, TrendingUp, AlertCircle, Calculator } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

const valueEstimatorSchema = z.object({
  make: z.string().min(1, "Vehicle make is required"),
  model: z.string().min(1, "Vehicle model is required"),
  year: z.number().min(1970, "Year must be 1970 or later").max(new Date().getFullYear(), "Year cannot be in the future"),
  country: z.enum(["japan", "usa"]),
  condition: z.enum(["excellent", "good", "fair"]).optional(),
});

type ValueEstimatorData = z.infer<typeof valueEstimatorSchema>;

interface ValueEstimateResponse {
  success: boolean;
  estimates: Array<{
    source: string;
    basePrice: number;
    finalPrice: number;
    markup: number;
    currency: string;
    description: string;
  }>;
  demandRating: "Low" | "Medium" | "High";
  marketInsights: string[];
  estimatedImportTotal: number;
  vehicleInfo: {
    category: string;
    popularity: string;
  };
}

export default function ValueEstimator() {
  const [results, setResults] = useState<ValueEstimateResponse | null>(null);

  const form = useForm<ValueEstimatorData>({
    resolver: zodResolver(valueEstimatorSchema),
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear() - 5,
      country: "japan",
      condition: "good",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ValueEstimatorData): Promise<ValueEstimateResponse> => {
      const response = await apiRequest("POST", "/api/value-estimator", data);
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data);
    },
    onError: (error) => {
      console.error('Value estimation error:', error);
    },
  });

  const onSubmit = (data: ValueEstimatorData) => {
    mutation.mutate(data);
  };

  const isSubmitting = mutation.isPending;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-[#D4AF37] rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1E1E1E]">ImportIQ Value Estimator</h1>
                <p className="text-sm text-gray-600">Professional vehicle valuation across global markets</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Tools</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#1E1E1E] mb-4">
            What's Your Dream Import Really Worth?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Use the ImportIQ Value Estimator to simulate dealer, auction, and broker pricing — before you spend a dollar.
            Get professional market insights across Japanese and U.S. vehicle markets.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Search Form */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[#1E1E1E] mb-2">Vehicle Details</h3>
                <p className="text-sm text-gray-600">Enter vehicle information for market value estimation</p>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      placeholder="e.g., Toyota"
                      {...form.register("make")}
                    />
                    {form.formState.errors.make && (
                      <p className="text-sm text-red-600">{form.formState.errors.make.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      placeholder="e.g., Supra"
                      {...form.register("model")}
                    />
                    {form.formState.errors.model && (
                      <p className="text-sm text-red-600">{form.formState.errors.model.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    min="1970"
                    max={new Date().getFullYear()}
                    {...form.register("year", { valueAsNumber: true })}
                  />
                  {form.formState.errors.year && (
                    <p className="text-sm text-red-600">{form.formState.errors.year.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country of Origin</Label>
                  <Select onValueChange={(value) => form.setValue("country", value as "japan" | "usa")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="japan">Japan</SelectItem>
                      <SelectItem value="usa">United States</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Condition (Optional)</Label>
                  <Select onValueChange={(value) => form.setValue("condition", value as "excellent" | "good" | "fair")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0A84FF] hover:bg-[#007AEB] text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Analyzing Market..." : "Get Value Estimate"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="lg:col-span-2">
            {!results && !isSubmitting && (
              <Card className="shadow-sm">
                <CardContent className="p-12 text-center">
                  <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">Professional Market Analysis</h3>
                  <p className="text-gray-600">
                    Enter your vehicle details to receive professional market value estimates across multiple buying channels.
                  </p>
                </CardContent>
              </Card>
            )}

            {isSubmitting && (
              <Card className="shadow-sm">
                <CardContent className="p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-600">Analyzing market data and pricing patterns...</p>
                </CardContent>
              </Card>
            )}

            {results && (
              <div className="space-y-6">
                {/* Market Overview */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Market Value Analysis</CardTitle>
                      <Badge 
                        variant={results.demandRating === 'High' ? 'default' : results.demandRating === 'Medium' ? 'secondary' : 'outline'}
                        className={results.demandRating === 'High' ? 'bg-green-600' : results.demandRating === 'Medium' ? 'bg-yellow-600' : ''}
                      >
                        {results.demandRating} Demand
                      </Badge>
                    </div>
                    <CardDescription>
                      {results.vehicleInfo.category} • {results.vehicleInfo.popularity}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.estimates.map((estimate, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-semibold text-[#1E1E1E]">{estimate.source}</div>
                            <div className="text-sm text-gray-600">{estimate.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Base: ${estimate.basePrice.toLocaleString()}</div>
                            <div className="text-lg font-bold text-[#1E1E1E]">${estimate.finalPrice.toLocaleString()}</div>
                            <div className="text-xs text-[#D4AF37]">+{estimate.markup}% markup</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Import Cost Projection */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-[#D4AF37]" />
                      <span>Total Import Cost Projection</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-[#1E1E1E] mb-2">
                        ${results.estimatedImportTotal.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Estimated total landed cost including vehicle price, shipping, duties, and compliance
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Insights */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span>Market Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.marketInsights.map((insight, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Data Disclaimer */}
                <Card className="shadow-sm border-amber-200 bg-amber-50">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-amber-800">
                        <div className="font-medium mb-1">Professional Estimate</div>
                        <div>
                          This estimate is based on real-world pricing patterns, not live auction data. 
                          For strategic planning only — not a guaranteed price quote.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}