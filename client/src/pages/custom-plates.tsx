import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Car, Star, DollarSign, CheckCircle, XCircle, Info } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const plateSchema = z.object({
  state: z.string().min(1, "State is required"),
  desiredPlate: z.string().min(2, "Plate must be at least 2 characters").max(8, "Plate cannot exceed 8 characters"),
  plateType: z.enum(["standard", "personalized", "euro", "prestige"]),
});

type PlateFormData = z.infer<typeof plateSchema>;

interface PlateAvailabilityResult {
  success: boolean;
  plateNumber: string;
  state: string;
  availability: {
    isAvailable: boolean;
    status: "available" | "taken" | "reserved" | "invalid" | "restricted";
    reason?: string;
  };
  pricing?: {
    applicationFee: number;
    annualFee: number;
    totalFirstYear: number;
    currency: string;
  };
  alternatives?: string[];
  requirements?: {
    minLength: number;
    maxLength: number;
    allowedCharacters: string;
    restrictions: string[];
  };
  processInfo?: {
    processingTime: string;
    applicationMethod: string;
    renewalPeriod: string;
    transferable: boolean;
  };
  error?: string;
  disclaimer: string;
}

export default function CustomPlates() {
  const [plateResult, setPlateResult] = useState<PlateAvailabilityResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<PlateFormData>({
    resolver: zodResolver(plateSchema),
    defaultValues: {
      state: "",
      desiredPlate: "",
      plateType: "personalized",
    },
  });

  const plateCheckMutation = useMutation({
    mutationFn: async (data: PlateFormData) => {
      const response = await apiRequest("POST", "/api/plate-availability", data);
      return await response.json();
    },
    onSuccess: (data: PlateAvailabilityResult) => {
      setPlateResult(data);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    },
  });

  const onSubmit = (data: PlateFormData) => {
    plateCheckMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <Car className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Custom License Plate Checker
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Check availability and pricing for personalized license plates across Australian states
          </p>
        </div>

        {/* Search Form */}
        <Card className="max-w-2xl mx-auto shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Plate Availability Check
            </CardTitle>
            <CardDescription>
              Enter your desired custom plate combination to check availability and pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Territory</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="nsw">New South Wales</SelectItem>
                            <SelectItem value="vic">Victoria</SelectItem>
                            <SelectItem value="qld">Queensland</SelectItem>
                            <SelectItem value="wa">Western Australia</SelectItem>
                            <SelectItem value="sa">South Australia</SelectItem>
                            <SelectItem value="tas">Tasmania</SelectItem>
                            <SelectItem value="act">Australian Capital Territory</SelectItem>
                            <SelectItem value="nt">Northern Territory</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="plateType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plate Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select plate type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="personalized">Personalized Plates</SelectItem>
                            <SelectItem value="standard">Standard Custom</SelectItem>
                            <SelectItem value="euro">Euro Style</SelectItem>
                            <SelectItem value="jdm">JDM Style (Japanese)</SelectItem>
                            <SelectItem value="prestige">Prestige Plates</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="desiredPlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desired Plate Text</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., SKYLINE, JDM123, IMPORT" 
                          {...field} 
                          className="uppercase text-center text-lg font-mono"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          maxLength={8}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={plateCheckMutation.isPending}
                >
                  {plateCheckMutation.isPending ? "Checking Availability..." : "Check Plate Availability"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Results */}
        <div ref={resultsRef} className="space-y-6">
          {plateResult && (
            <>
              {plateResult.success ? (
                <>
                  {/* Availability Status */}
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {plateResult.availability.isAvailable ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        Plate Availability: {plateResult.plateNumber}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={plateResult.availability.isAvailable ? 'default' : 'destructive'}>
                              {plateResult.availability.status.toUpperCase()}
                            </Badge>
                          </div>
                          {plateResult.availability.reason && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              {plateResult.availability.reason}
                            </p>
                          )}
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">State</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {plateResult.state.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pricing Information */}
                  {plateResult.pricing && (
                    <Card className="shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          Pricing Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-sm text-green-700 dark:text-green-300">Application Fee</p>
                            <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                              ${plateResult.pricing.applicationFee}
                            </p>
                          </div>
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-300">Annual Fee</p>
                            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                              ${plateResult.pricing.annualFee}
                            </p>
                          </div>
                          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <p className="text-sm text-purple-700 dark:text-purple-300">Total First Year</p>
                            <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                              ${plateResult.pricing.totalFirstYear}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Alternative Suggestions */}
                  {plateResult.alternatives && plateResult.alternatives.length > 0 && (
                    <Card className="shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Star className="h-5 w-5" />
                          Alternative Suggestions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {plateResult.alternatives.map((alt, index) => (
                            <div 
                              key={index}
                              className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center font-mono text-lg font-semibold"
                            >
                              {alt}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Process Information */}
                  {plateResult.processInfo && (
                    <Card className="shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Info className="h-5 w-5" />
                          Application Process
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Processing Time</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {plateResult.processInfo.processingTime}
                            </p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Application Method</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {plateResult.processInfo.applicationMethod}
                            </p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Renewal Period</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {plateResult.processInfo.renewalPeriod}
                            </p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Transferable</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={plateResult.processInfo.transferable ? 'default' : 'secondary'}>
                                {plateResult.processInfo.transferable ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    {plateResult.error || "Unable to check plate availability at this time."}
                  </AlertDescription>
                </Alert>
              )}

              {/* Disclaimer */}
              <div className="text-xs text-gray-500 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {plateResult.disclaimer}
              </div>
            </>
          )}

          {!plateResult && (
            <Card className="shadow-lg">
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Ready to Check Availability
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter your desired plate combination above to check availability and pricing
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Import Plates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>JDM related:</span>
                  <span className="font-mono">SKYLINE, GTR, JDM123</span>
                </div>
                <div className="flex justify-between">
                  <span>American Muscle:</span>
                  <span className="font-mono">MUSCLE, V8PWR, CAMARO</span>
                </div>
                <div className="flex justify-between">
                  <span>Generic Import:</span>
                  <span className="font-mono">IMPORT, MODDED, TUNED</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">State Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>NSW/VIC:</strong> 2-6 characters, letters and numbers</p>
                <p><strong>QLD:</strong> 2-6 characters, specific format restrictions</p>
                <p><strong>WA/SA:</strong> 2-7 characters, state-specific rules</p>
                <p><strong>Processing:</strong> 2-4 weeks typically</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}