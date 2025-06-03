import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { TrendingUp, Calculator, DollarSign, AlertTriangle, Info, Clock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

const roiSchema = z.object({
  purchasePrice: z.number().min(1000, "Purchase price must be at least $1,000"),
  importCosts: z.number().min(0, "Import costs cannot be negative"),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  holdingPeriod: z.number().min(1, "Holding period must be at least 1 year").max(25, "Maximum 25 years")
});

type FormData = z.infer<typeof roiSchema>;

interface ROIResponse {
  totalInvestment: number;
  projectedValue: number;
  totalReturn: number;
  annualReturn: number;
  breakEvenPoint: number;
  riskLevel: string;
  marketFactors: {
    appreciationRate: number;
    inflationAdjusted: number;
    volatilityRisk: string;
  };
  assumptions: string[];
  dataSource: string;
  disclaimer: string;
}

export default function ROICalculator() {
  const [result, setResult] = useState<ROIResponse | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(roiSchema),
    defaultValues: {
      purchasePrice: 35000,
      importCosts: 15000,
      vehicleType: "jdm",
      holdingPeriod: 5
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData): Promise<ROIResponse> => {
      const res = await apiRequest("POST", "/api/roi-calculator", data);
      return await res.json();
    },
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Calculation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReturnColor = (returns: number) => {
    if (returns > 0) return 'text-green-600';
    if (returns < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-amber-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ROI Calculator</h1>
                <p className="text-sm text-gray-600">Investment analysis and profit potential for imported vehicles</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Investment Parameters
              </CardTitle>
              <CardDescription>
                Enter your vehicle details to calculate potential investment returns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="purchasePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Price (AUD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="35000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="importCosts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Import Costs (AUD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="15000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select vehicle type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="jdm">JDM Classic (Skyline, Supra, etc.)</SelectItem>
                            <SelectItem value="vintage">Vintage Classic (Pre-1980)</SelectItem>
                            <SelectItem value="muscle">American Muscle</SelectItem>
                            <SelectItem value="supercar">Supercar/Exotic</SelectItem>
                            <SelectItem value="modern">Modern Performance</SelectItem>
                            <SelectItem value="practical">Practical Import</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="holdingPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Holding Period (Years)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="5"
                            min="1"
                            max="25"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    {mutation.isPending ? "Calculating..." : "Calculate ROI"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Investment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Investment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Investment</p>
                      <p className="text-xl font-bold">${result.totalInvestment.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Projected Value</p>
                      <p className="text-xl font-bold">${result.projectedValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Return</p>
                      <p className={`text-xl font-bold ${getReturnColor(result.totalReturn)}`}>
                        ${result.totalReturn.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Annual Return</p>
                      <p className={`text-xl font-bold ${getReturnColor(result.annualReturn)}`}>
                        {result.annualReturn}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge className={getRiskColor(result.riskLevel)}>
                      {result.riskLevel} Risk
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      Break-even: {result.breakEvenPoint} years
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Factors */}
              <Card>
                <CardHeader>
                  <CardTitle>Market Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Appreciation Rate</p>
                      <p className="font-semibold">{result.marketFactors.appreciationRate}% / year</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Inflation Adjusted</p>
                      <p className="font-semibold">{result.marketFactors.inflationAdjusted}% / year</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Market Volatility</p>
                    <Badge variant="outline">{result.marketFactors.volatilityRisk}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Assumptions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Key Assumptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.assumptions.map((assumption, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        {assumption}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Disclaimer */}
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 mb-1">Investment Disclaimer</p>
                      <p className="text-xs text-amber-700">{result.disclaimer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!result && (
            <Card className="flex items-center justify-center h-96">
              <CardContent className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Enter your investment details to see ROI analysis</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}