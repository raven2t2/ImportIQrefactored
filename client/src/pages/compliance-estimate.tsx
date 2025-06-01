import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Clock, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { Link } from "wouter";

const complianceSchema = z.object({
  year: z.coerce.number().min(1970, "Year must be 1970 or later").max(new Date().getFullYear(), "Year cannot be in the future"),
  category: z.enum(["passenger", "suv", "kei", "commercial"], {
    required_error: "Please select a vehicle category",
  }),
});

type FormData = z.infer<typeof complianceSchema>;

interface ComplianceResponse {
  success: boolean;
  estimatedWeeks: string;
  category: string;
  explanation: string;
  factors: string[];
  isEligible: boolean;
}

export default function ComplianceEstimate() {
  const [results, setResults] = useState<ComplianceResponse | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(complianceSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      category: undefined,
    },
  });

  const estimateMutation = useMutation({
    mutationFn: async (data: FormData): Promise<ComplianceResponse> => {
      const response = await apiRequest("POST", "/api/compliance-estimate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data);
      toast({
        title: "Estimate Complete",
        description: `Compliance timeline estimated: ${data.estimatedWeeks}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Estimation Failed",
        description: error.message || "An error occurred while estimating compliance timeline.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    estimateMutation.mutate(data);
  };

  const getCategoryDisplay = (category: string) => {
    switch (category) {
      case "passenger": return "Passenger Vehicle";
      case "suv": return "SUV/4WD";
      case "kei": return "Kei Car";
      case "commercial": return "Commercial Vehicle";
      default: return category;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-brand-gold rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Compliance Timeline Estimator</h1>
                <p className="text-sm text-gray-600">Get realistic timeframes for Australian vehicle compliance</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Calculator</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Vehicle Details</h2>
                <p className="text-sm text-gray-600">Enter your vehicle information for compliance timeline estimate</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Year of Manufacture <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="1970"
                            max={new Date().getFullYear()}
                            placeholder="2000"
                            className="w-full"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Vehicle Category <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select vehicle category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="passenger">Passenger Vehicle</SelectItem>
                            <SelectItem value="suv">SUV/4WD</SelectItem>
                            <SelectItem value="kei">Kei Car</SelectItem>
                            <SelectItem value="commercial">Commercial Vehicle</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-brand-gold hover:bg-brand-gold-dark"
                    disabled={estimateMutation.isPending}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {estimateMutation.isPending ? "Calculating..." : "Get Timeline Estimate"}
                  </Button>
                </form>
              </Form>

              {/* Info Section */}
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Timeline Factors</p>
                      <ul className="text-xs space-y-1">
                        <li>• Vehicle age and SEVS eligibility</li>
                        <li>• Current port backlog conditions</li>
                        <li>• Inspector availability</li>
                        <li>• Required modifications</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div>
            {results && (
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                      results.isEligible ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {results.isEligible ? (
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-8 w-8 text-yellow-600" />
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {results.estimatedWeeks}
                    </h2>
                    <p className="text-gray-600">
                      {getCategoryDisplay(results.category)} • {form.getValues('year')}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Timeline Explanation</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {results.explanation}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Factors Affecting Timeline</h3>
                      <ul className="space-y-2">
                        {results.factors.map((factor, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-brand-gold rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700">{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {!results.isEligible && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-yellow-800">
                            <p className="font-medium mb-1">Complex Compliance</p>
                            <p>This vehicle may require special approval or extensive modifications. Contact us for detailed assessment.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Button className="w-full bg-brand-gold hover:bg-brand-gold-dark">
                      Get Detailed Compliance Quote
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {!results && (
              <Card className="shadow-sm">
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Timeline Estimation</h3>
                  <p className="text-gray-600">Enter your vehicle details to get realistic compliance timeframes based on current market conditions.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}