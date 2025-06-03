import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Scale, AlertTriangle, CheckCircle, FileText, Shield, Book, Gavel, Info, ArrowRight, Home } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const legalAdvisorySchema = z.object({
  vehicleType: z.string().min(1, "Vehicle type is required"),
  year: z.string().min(4, "Year is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  intendedUse: z.string().min(1, "Intended use is required"),
  modifications: z.string().optional(),
  specificConcerns: z.string().optional(),
  state: z.string().min(1, "State is required"),
});

type LegalAdvisoryFormData = z.infer<typeof legalAdvisorySchema>;

interface LegalAdvice {
  importLegality: {
    status: "legal" | "restricted" | "prohibited";
    reason: string;
    requirements: string[];
  };
  complianceRequirements: {
    category: string;
    requirements: string[];
    estimated_cost: string;
    timeline: string;
  }[];
  modificationGuidance: {
    allowedMods: string[];
    prohibitedMods: string[];
    engineeringRequirements: string[];
  };
  registrationRequirements: {
    state: string;
    documents: string[];
    inspections: string[];
    fees: string;
  };
  legalRisks: {
    level: "low" | "medium" | "high";
    risks: string[];
    mitigation: string[];
  };
  recommendations: string[];
}

export default function LegalAdvisory() {
  const [advice, setAdvice] = useState<LegalAdvice | null>(null);
  const { toast } = useToast();

  const form = useForm<LegalAdvisoryFormData>({
    resolver: zodResolver(legalAdvisorySchema),
    defaultValues: {
      vehicleType: "",
      year: "",
      make: "",
      model: "",
      intendedUse: "",
      modifications: "",
      specificConcerns: "",
      state: "",
    },
  });

  const advisoryMutation = useMutation({
    mutationFn: async (data: LegalAdvisoryFormData): Promise<LegalAdvice> => {
      const response = await apiRequest("POST", "/api/legal-advisory", data);
      return response.json();
    },
    onSuccess: (data) => {
      setAdvice(data);
      toast({
        title: "Legal Analysis Complete",
        description: "Your comprehensive legal advisory report is ready.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LegalAdvisoryFormData) => {
    advisoryMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "legal": return "bg-green-100 text-green-800";
      case "restricted": return "bg-yellow-100 text-yellow-800";
      case "prohibited": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
            <Scale className="h-12 w-12 text-purple-600 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Legal Advisory</h1>
              <p className="text-gray-600 mt-2">Expert legal compliance guidance for vehicle imports</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-lg">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-purple-900 flex items-center">
                <Gavel className="h-5 w-5 mr-2" />
                Legal Consultation Request
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                              <SelectItem value="passenger">Passenger Vehicle</SelectItem>
                              <SelectItem value="commercial">Commercial Vehicle</SelectItem>
                              <SelectItem value="motorcycle">Motorcycle</SelectItem>
                              <SelectItem value="racing">Racing Vehicle</SelectItem>
                              <SelectItem value="classic">Classic/Vintage</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 1995" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Make</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Toyota" />
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
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Supra" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="intendedUse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intended Use</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="How will you use this vehicle?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily-driver">Daily Driver</SelectItem>
                            <SelectItem value="weekend-car">Weekend Car</SelectItem>
                            <SelectItem value="track-car">Track Car</SelectItem>
                            <SelectItem value="show-car">Show Car</SelectItem>
                            <SelectItem value="collection">Collection</SelectItem>
                            <SelectItem value="racing">Racing</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State for Registration</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NSW">New South Wales</SelectItem>
                            <SelectItem value="VIC">Victoria</SelectItem>
                            <SelectItem value="QLD">Queensland</SelectItem>
                            <SelectItem value="WA">Western Australia</SelectItem>
                            <SelectItem value="SA">South Australia</SelectItem>
                            <SelectItem value="TAS">Tasmania</SelectItem>
                            <SelectItem value="ACT">Australian Capital Territory</SelectItem>
                            <SelectItem value="NT">Northern Territory</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="modifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Planned Modifications (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Describe any modifications you plan to make..."
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specificConcerns"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specific Legal Concerns (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Any specific legal questions or concerns..."
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-3"
                    disabled={advisoryMutation.isPending}
                  >
                    <Scale className="h-4 w-4 mr-2" />
                    {advisoryMutation.isPending ? "Analyzing..." : "Get Legal Advisory"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Results */}
          {advice && (
            <div className="space-y-6">
              {/* Import Legality Status */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Import Legality
                    </span>
                    <Badge className={getStatusColor(advice.importLegality.status)}>
                      {advice.importLegality.status.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{advice.importLegality.reason}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Requirements:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {advice.importLegality.requirements.map((req, index) => (
                        <li key={index} className="text-sm text-gray-600">{req}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Requirements */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Compliance Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {advice.complianceRequirements.map((category, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{category.category}</h4>
                        <div className="grid md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <span className="text-sm font-medium text-gray-600">Estimated Cost:</span>
                            <p className="text-green-600 font-semibold">{category.estimated_cost}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">Timeline:</span>
                            <p className="text-blue-600 font-semibold">{category.timeline}</p>
                          </div>
                        </div>
                        <ul className="list-disc list-inside space-y-1">
                          {category.requirements.map((req, reqIndex) => (
                            <li key={reqIndex} className="text-sm text-gray-600">{req}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Legal Risk Assessment */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Legal Risk Assessment
                    </span>
                    <Badge className={getRiskColor(advice.legalRisks.level)}>
                      {advice.legalRisks.level.toUpperCase()} RISK
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Potential Risks:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {advice.legalRisks.risks.map((risk, index) => (
                          <li key={index} className="text-sm text-red-600">{risk}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Risk Mitigation:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {advice.legalRisks.mitigation.map((mitigation, index) => (
                          <li key={index} className="text-sm text-green-600">{mitigation}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Book className="h-5 w-5 mr-2" />
                    Expert Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {advice.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5" />
                        <p className="text-sm text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <Card className="mt-8 bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">Legal Disclaimer</h3>
                <p className="text-sm text-yellow-700">
                  This advisory tool provides general guidance based on Australian import regulations. 
                  Always consult with qualified legal professionals and licensed vehicle compliance specialists 
                  for definitive legal advice. Regulations may change, and specific circumstances may require 
                  specialized legal consultation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}