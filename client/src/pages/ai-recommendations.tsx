import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Brain, Car, DollarSign, Target, Sparkles, ArrowRight, Save, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AIEmailGate from "@/components/ai-email-gate";
import { z } from "zod";
import { Link } from "wouter";

const aiRecommendationSchema = z.object({
  budget: z.coerce.number().min(20000, "Budget must be at least $20,000").max(500000, "Budget too high for our database"),
  intendedUse: z.enum(["daily", "weekend", "track", "show", "investment"], {
    required_error: "Please select intended use",
  }),
  experience: z.enum(["first-time", "some", "experienced"], {
    required_error: "Please select your experience level",
  }),
  preferences: z.string().min(10, "Please provide more details about your preferences"),
  timeline: z.enum(["asap", "3-months", "6-months", "flexible"], {
    required_error: "Please select your timeline",
  }),
});

type FormData = z.infer<typeof aiRecommendationSchema>;

interface AIRecommendation {
  vehicleName: string;
  estimatedPrice: number;
  category: string;
  reasoning: string;
  pros: string[];
  cons: string[];
  marketInsight: string;
  confidence: number;
}

interface AIRecommendationResponse {
  success: boolean;
  recommendations: AIRecommendation[];
  budgetAnalysis: string;
  marketTrends: string[];
  personalizedAdvice: string;
}

export default function AIRecommendations() {
  const [results, setResults] = useState<AIRecommendationResponse | null>(null);
  // For authenticated users, skip email gate completely
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(aiRecommendationSchema),
    defaultValues: {
      budget: 85000,
      intendedUse: undefined,
      experience: undefined,
      preferences: "",
      timeline: undefined,
    },
  });

  const recommendMutation = useMutation({
    mutationFn: async (data: FormData): Promise<AIRecommendationResponse> => {
      const response = await apiRequest("POST", "/api/ai-recommendations", data);
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data);
      toast({
        title: "AI Analysis Complete",
        description: `Found ${data.recommendations.length} personalized vehicle recommendations for you.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "An error occurred while generating recommendations.",
        variant: "destructive",
      });
    },
  });

  // Save report mutation
  const saveReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      return await apiRequest("POST", "/api/save-report", reportData);
    },
    onSuccess: () => {
      toast({
        title: "Report Saved!",
        description: "Your AI recommendations have been saved to your ImportIQ dashboard.",
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

  const onSubmit = (data: FormData) => {
    recommendMutation.mutate(data);
  };

  const handleSaveReport = () => {
    if (results) {
      const reportData = {
        reportType: "ai-recommendations",
        reportTitle: "AI Vehicle Recommendations",
        reportData: {
          ...results,
          formData: form.getValues(),
          generatedAt: new Date().toISOString(),
        }
      };
      
      saveReportMutation.mutate(reportData);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const getExperienceDisplay = (experience: string) => {
    switch (experience) {
      case "first-time": return "First-time importer";
      case "some": return "Some experience";
      case "experienced": return "Very experienced";
      default: return experience;
    }
  };

  const getIntendedUseDisplay = (use: string) => {
    switch (use) {
      case "daily": return "Daily driving";
      case "weekend": return "Weekend fun";
      case "track": return "Track/Racing";
      case "show": return "Show car";
      case "investment": return "Investment";
      default: return use;
    }
  };

  // For authenticated users, skip email gate completely

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-brand-gray">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-brand-gold rounded-lg">
                <Brain className="h-5 w-5 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-brand-white">Immaculate AI Vehicle Matcher</h1>
                <p className="text-sm text-brand-gray">Military-precision sourcing intel meets advanced AI — find your perfect import</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href="/">
                <Button variant="outline" size="sm">Calculator</Button>
              </Link>
              <Link href="/compliance-estimate">
                <Button variant="outline" size="sm">Compliance</Button>
              </Link>
              <Link href="/mod-estimator">
                <Button variant="outline" size="sm">Mods</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <Card className="shadow-sm lg:col-span-1">
            <CardContent className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Vehicle Recommendation Engine</h2>
                <p className="text-sm text-gray-600 mb-4">Advanced AI analysis powered by our global sourcing network</p>
                
                {/* Company Expertise */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-gray-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 mb-1">Global Sourcing Intelligence</p>
                      <p className="text-blue-800 text-xs">Our AI leverages Immaculate Imports' network across Australia, Japan, and the U.S. — sourcing intel from auction houses, specialist dealers, and private collections most importers never access.</p>
                    </div>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Full Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your full name"
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Email Address <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="your.email@example.com"
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Total Budget (AUD) <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                            <Input
                              {...field}
                              type="number"
                              min="20000"
                              max="500000"
                              step="5000"
                              placeholder="85,000"
                              className="pl-8"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <p className="text-xs text-gray-600">Include vehicle cost, shipping, compliance, and any modifications</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="intendedUse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Intended Use <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="How will you use this car?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily driving</SelectItem>
                            <SelectItem value="weekend">Weekend fun</SelectItem>
                            <SelectItem value="track">Track/Racing</SelectItem>
                            <SelectItem value="show">Show car</SelectItem>
                            <SelectItem value="investment">Investment</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Import Experience <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Your experience level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="first-time">First-time importer</SelectItem>
                            <SelectItem value="some">Some experience</SelectItem>
                            <SelectItem value="experienced">Very experienced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Vehicle Preferences <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe your dream car... (e.g., JDM sports car, manual transmission, under 100k km, prefer Honda/Nissan, want something reliable but fun)"
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <p className="text-xs text-gray-600">Be specific about brands, features, and what matters most to you</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Timeline <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="When do you want your car?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="asap">ASAP (1-2 months)</SelectItem>
                            <SelectItem value="3-months">Within 3 months</SelectItem>
                            <SelectItem value="6-months">Within 6 months</SelectItem>
                            <SelectItem value="flexible">Flexible timing</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-brand-gold hover:bg-brand-gold-dark text-white font-semibold text-lg py-4"
                    disabled={recommendMutation.isPending}
                  >
                    <Brain className="h-5 w-5 mr-2" />
                    {recommendMutation.isPending ? "Analyzing..." : "Get Vehicle Recommendations"}
                  </Button>

                  <div className="text-center text-xs text-gray-600">
                    Military-grade analysis • 3-market intelligence • Zero obligation
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {results && (
              <div className="space-y-6">
                {/* Market Intelligence Brief */}
                <Card className="shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Intelligence Brief</h2>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-gray-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-gray-800 font-medium mb-2">Budget Analysis:</p>
                      <p className="text-sm text-gray-800">{results.budgetAnalysis}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Vehicle Recommendations */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Sourcing Intelligence: Your Perfect Matches</h3>
                  {results.recommendations.map((recommendation, index) => (
                    <Card key={index} className="shadow-sm border-l-4 border-l-brand-gold">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">{recommendation.vehicleName}</h4>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-sm text-gray-600">{recommendation.category}</span>
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-green-700 font-medium">
                                  {recommendation.confidence}% intelligence match
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-brand-gold">
                              {formatCurrency(recommendation.estimatedPrice)}
                            </p>
                            <p className="text-sm text-gray-600">All-in landed cost</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Why this car is perfect for you:</h5>
                            <p className="text-sm text-gray-700">{recommendation.reasoning}</p>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h6 className="font-medium text-green-800 mb-2">Pros:</h6>
                              <ul className="text-sm text-gray-700 space-y-1">
                                {recommendation.pros.map((pro, i) => (
                                  <li key={i} className="flex items-start space-x-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>{pro}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h6 className="font-medium text-amber-800 mb-2">Consider:</h6>
                              <ul className="text-sm text-gray-700 space-y-1">
                                {recommendation.cons.map((con, i) => (
                                  <li key={i} className="flex items-start space-x-2">
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>{con}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="p-3 bg-gray-50 rounded border-l-4 border-brand-gold">
                            <h6 className="font-medium text-gray-900 mb-1">Market Intelligence:</h6>
                            <p className="text-sm text-gray-700">{recommendation.marketInsight}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Strategic Recommendations */}
                <Card className="shadow-sm bg-card border-brand-gray">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-brand-white mb-4">Strategic Recommendations</h3>
                    <div className="p-4 bg-brand-dark-gray border border-brand-gold rounded-lg">
                      <p className="text-sm text-brand-white">{results.personalizedAdvice}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Button 
                    onClick={handleSaveReport}
                    disabled={saveReportMutation.isPending}
                    className="bg-brand-gold hover:bg-brand-gold-dark text-black"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveReportMutation.isPending ? "Saving..." : "Save to Dashboard"}
                  </Button>
                  
                  <Button 
                    onClick={() => window.location.href = '/booking'}
                    variant="outline"
                    className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-black"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Consultation
                  </Button>
                  
                  <Button 
                    onClick={() => window.location.href = '/checkout'}
                    className="bg-brand-gold hover:bg-brand-gold-dark text-black"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Secure Vehicle - $500
                  </Button>
                </div>

                {/* Exclusive Access CTA */}
                <Card className="shadow-lg bg-gradient-to-r from-slate-800 to-slate-900 text-white border-2 border-brand-gold">
                  <CardContent className="p-8 text-center">
                    <div className="mb-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-gold rounded-full mb-4">
                        <Target className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Secure Your Vehicle Now</h3>
                      <p className="text-lg opacity-90 mb-2">Exclusive Immaculate Imports Client Access</p>
                    </div>
                    
                    <div className="bg-slate-700 bg-opacity-50 rounded-lg p-4 mb-6">
                      <p className="text-sm mb-3">
                        <strong>Warning:</strong> These vehicles won't last. Michael's network sees the best cars first, 
                        but they move fast — especially in the current market.
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <div className="font-bold text-brand-gold">72 hours</div>
                          <div>Average time to sale</div>
                        </div>
                        <div>
                          <div className="font-bold text-brand-gold">3 markets</div>
                          <div>Exclusive access</div>
                        </div>
                        <div>
                          <div className="font-bold text-brand-gold">$0 risk</div>
                          <div>Refundable deposit</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <a 
                        href="https://driveimmaculate.com/checkout" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button className="w-full bg-brand-gold hover:bg-yellow-500 text-slate-900 font-bold text-lg py-4 px-8 text-center">
                          <ArrowRight className="h-5 w-5 mr-2" />
                          Secure My Vehicle Access — $500 Deposit
                        </Button>
                      </a>
                      <p className="text-xs opacity-75">
                        100% refundable • Guarantees first access to matching vehicles
                      </p>
                    </div>

                    <div className="border-t border-slate-600 pt-4">
                      <p className="text-sm opacity-90">
                        <strong>Concierge Import Service</strong> — Michael handles everything from sourcing to compliance to delivery. 
                        Military precision. Zero shortcuts. Your dream car, delivered immaculately.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {!results && (
              <Card className="shadow-sm">
                <CardContent className="p-12 text-center">
                  <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Vehicle Matching</h3>
                  <p className="text-gray-600 mb-4">
                    Our advanced AI analyzes your preferences, budget, and current market conditions to recommend the perfect vehicles for you.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-brand-gold" />
                      <span>Personalized matches</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-brand-gold" />
                      <span>Budget optimization</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Car className="h-4 w-4 text-brand-gold" />
                      <span>Market insights</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-brand-gold" />
                      <span>AI-powered analysis</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}