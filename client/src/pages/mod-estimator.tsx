import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Wrench, Target, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { Link } from "wouter";

const modEstimatorSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1990, "Year must be 1990 or later").max(new Date().getFullYear(), "Year cannot be in the future"),
  goal: z.enum(["daily", "drift", "show"], {
    required_error: "Please select a modification goal",
  }),
});

type FormData = z.infer<typeof modEstimatorSchema>;

interface ModEstimateResponse {
  success: boolean;
  vehicle: string;
  goal: string;
  stages: Array<{
    stage: number;
    name: string;
    description: string;
    cost: number;
    modifications: string[];
  }>;
  recommendedServiceTier: string;
  serviceTierDescription: string;
}

export default function ModEstimator() {
  const [results, setResults] = useState<ModEstimateResponse | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(modEstimatorSchema),
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      goal: undefined,
    },
  });

  const estimateMutation = useMutation({
    mutationFn: async (data: FormData): Promise<ModEstimateResponse> => {
      const response = await apiRequest("POST", "/api/mod-estimator", data);
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data);
      toast({
        title: "Estimate Complete",
        description: `Modification plan generated for your ${data.vehicle}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Estimation Failed",
        description: error.message || "An error occurred while generating modification estimate.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    estimateMutation.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const getGoalDisplay = (goal: string) => {
    switch (goal) {
      case "daily": return "Daily Driver";
      case "drift": return "Drift Build";
      case "show": return "Show Car";
      default: return goal;
    }
  };

  const getStageIcon = (stage: number) => {
    switch (stage) {
      case 1: return <Target className="h-5 w-5" />;
      case 2: return <Wrench className="h-5 w-5" />;
      case 3: return <Crown className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getStageColor = (stage: number) => {
    switch (stage) {
      case 1: return "from-green-50 to-green-100 border-green-200";
      case 2: return "from-blue-50 to-blue-100 border-blue-200";
      case 3: return "from-purple-50 to-purple-100 border-purple-200";
      default: return "from-gray-50 to-gray-100 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-brand-gold rounded-lg">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mod Package Estimator</h1>
                <p className="text-sm text-gray-600">Plan your build with staged modification packages</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Calculator</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Build Planning</h2>
                <p className="text-sm text-gray-600">Tell us about your project goals</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Make <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Toyota, Nissan, Honda"
                            className="w-full"
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
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Model <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Skyline, Supra, NSX"
                            className="w-full"
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
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Year <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="1990"
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
                    name="goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Build Goal <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your build goal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily Driver</SelectItem>
                            <SelectItem value="drift">Drift Build</SelectItem>
                            <SelectItem value="show">Show Car</SelectItem>
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
                    <Wrench className="h-4 w-4 mr-2" />
                    {estimateMutation.isPending ? "Planning..." : "Generate Mod Plan"}
                  </Button>
                </form>
              </Form>

              {/* Brand Message */}
              <div className="mt-6 p-4 bg-brand-gold bg-opacity-10 border border-brand-gold border-opacity-20 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Your Dream Car, Delivered.</h3>
                <p className="text-sm text-gray-700 mb-3">
                  From Japan and the U.S. to your driveway — fully compliant, mod-ready, and road-tested.
                </p>
                <p className="text-sm text-gray-700">
                  At Immaculate Imports, we don't sell cars — we source, verify, and deliver them with the accuracy of a logistics operation and the care of a collector.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {results && (
              <div className="space-y-6">
                {/* Summary Card */}
                <Card className="shadow-sm">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {results.vehicle} • {getGoalDisplay(results.goal)}
                      </h2>
                      <p className="text-gray-600">Staged modification plan with cost breakdown</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Modification Stages */}
                <div className="space-y-4">
                  {results.stages.map((stage) => (
                    <Card key={stage.stage} className="shadow-sm">
                      <CardContent className="p-6">
                        <div className={`bg-gradient-to-r ${getStageColor(stage.stage)} border rounded-lg p-4 mb-4`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full">
                                {getStageIcon(stage.stage)}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{stage.name}</h3>
                                <p className="text-sm text-gray-700">{stage.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stage.cost)}</p>
                              <p className="text-sm text-gray-600">Estimated cost</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Included Modifications:</h4>
                          <div className="grid md:grid-cols-2 gap-2">
                            {stage.modifications.map((mod, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-brand-gold rounded-full flex-shrink-0"></div>
                                <span className="text-sm text-gray-700">{mod}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Service Tier Recommendation */}
                <Card className="shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Service Tier</h3>
                    <div className="bg-brand-gold bg-opacity-10 border border-brand-gold border-opacity-20 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-brand-gold rounded-full flex-shrink-0">
                          <Crown className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{results.recommendedServiceTier} Service</h4>
                          <p className="text-sm text-gray-700 mb-3">{results.serviceTierDescription}</p>
                          
                          <div className="text-sm text-gray-700">
                            <p className="font-medium mb-2">Mod support includes:</p>
                            <ul className="space-y-1 text-xs">
                              <li>✔️ Sourcing + install via our partner shops</li>
                              <li>✔️ Tuned for Aussie roads</li>
                              <li>✔️ Cosmetic & performance options</li>
                              <li>✔️ Documentation for insurance/resale</li>
                              <li>✔️ Project tracking via your client portal</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-3">
                      <Button className="flex-1 bg-brand-gold hover:bg-brand-gold-dark">
                        Get Detailed Quote
                      </Button>
                      <Button variant="outline" className="flex-1">
                        View Partner Shops
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {!results && (
              <Card className="shadow-sm">
                <CardContent className="p-12 text-center">
                  <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Plan Your Build</h3>
                  <p className="text-gray-600 mb-4">
                    Enter your vehicle details and build goals to get a comprehensive modification plan with staged pricing.
                  </p>
                  <p className="text-sm text-gray-500">
                    All estimates include parts, labor, and coordination through our partner network.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}