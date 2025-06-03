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
import { Search, FileText, CheckCircle, AlertCircle, Info, MapPin, Calendar, Car } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const registrySchema = z.object({
  state: z.string().min(1, "State is required"),
  plateNumber: z.string().min(1, "Plate number is required").optional(),
  vinNumber: z.string().min(1, "VIN is required").optional(),
  registrationNumber: z.string().min(1, "Registration number is required").optional(),
  searchType: z.enum(["plate", "vin", "registration"]),
});

type RegistryFormData = z.infer<typeof registrySchema>;

interface RegistryResult {
  success: boolean;
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    bodyType: string;
    engineSize: string;
    fuelType: string;
    color: string;
    registrationExpiry: string;
    registrationStatus: string;
    state: string;
    vehicleType: string;
  };
  registrationDetails?: {
    registrationNumber: string;
    plateNumber: string;
    registeredOwner: string;
    registrationDate: string;
    lastRenewal: string;
    encumbrances: string[];
    recordedKilometers: string;
  };
  complianceInfo?: {
    adrCompliant: boolean;
    emissionsCompliant: boolean;
    safetyInspection: string;
    modifications: string[];
    recallNotices: string[];
  };
  error?: string;
  disclaimer: string;
}

export default function RegistryLookup() {
  const [lookupResult, setLookupResult] = useState<RegistryResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<RegistryFormData>({
    resolver: zodResolver(registrySchema),
    defaultValues: {
      state: "",
      plateNumber: "",
      vinNumber: "",
      registrationNumber: "",
      searchType: "plate",
    },
  });

  const lookupMutation = useMutation({
    mutationFn: async (data: RegistryFormData) => {
      const response = await apiRequest("POST", "/api/registry-lookup", data);
      return await response.json();
    },
    onSuccess: (data: RegistryResult) => {
      setLookupResult(data);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    },
  });

  const onSubmit = (data: RegistryFormData) => {
    lookupMutation.mutate(data);
  };

  const searchType = form.watch("searchType");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Registry Lookup
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Access Australian vehicle registration records using official state registry data sources
          </p>
        </div>

        {/* Search Form */}
        <Card className="max-w-2xl mx-auto shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Vehicle Registry Search
            </CardTitle>
            <CardDescription>
              Search Australian vehicle registration records by plate number, VIN, or registration number
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
                    name="searchType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Search Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select search type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="plate">License Plate</SelectItem>
                            <SelectItem value="vin">VIN Number</SelectItem>
                            <SelectItem value="registration">Registration Number</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {searchType === "plate" && (
                  <FormField
                    control={form.control}
                    name="plateNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Plate Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., ABC123" 
                            {...field} 
                            className="uppercase"
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {searchType === "vin" && (
                  <FormField
                    control={form.control}
                    name="vinNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VIN Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., JN1AZ4EH5BM123456" 
                            {...field}
                            className="uppercase"
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {searchType === "registration" && (
                  <FormField
                    control={form.control}
                    name="registrationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., REG123456" 
                            {...field}
                            className="uppercase"
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={lookupMutation.isPending}
                >
                  {lookupMutation.isPending ? "Searching Registry..." : "Search Registry"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Results */}
        <div ref={resultsRef} className="space-y-6">
          {lookupResult && (
            <>
              {lookupResult.success && lookupResult.vehicleInfo ? (
                <>
                  {/* Vehicle Information */}
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        Vehicle Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Make & Model</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {lookupResult.vehicleInfo.make} {lookupResult.vehicleInfo.model}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Year</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {lookupResult.vehicleInfo.year}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Body Type</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {lookupResult.vehicleInfo.bodyType}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Engine Size</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {lookupResult.vehicleInfo.engineSize}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Fuel Type</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {lookupResult.vehicleInfo.fuelType}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Color</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {lookupResult.vehicleInfo.color}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Registration Details */}
                  {lookupResult.registrationDetails && (
                    <Card className="shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Registration Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Registration Status</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={lookupResult.vehicleInfo.registrationStatus === 'Current' ? 'default' : 'destructive'}>
                                {lookupResult.vehicleInfo.registrationStatus}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Expiry Date</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {lookupResult.vehicleInfo.registrationExpiry}
                            </p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Plate Number</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {lookupResult.registrationDetails.plateNumber}
                            </p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">State</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {lookupResult.vehicleInfo.state.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Compliance Information */}
                  {lookupResult.complianceInfo && (
                    <Card className="shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Compliance Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">ADR Compliance</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={lookupResult.complianceInfo.adrCompliant ? 'default' : 'destructive'}>
                                {lookupResult.complianceInfo.adrCompliant ? 'Compliant' : 'Non-Compliant'}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Emissions</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={lookupResult.complianceInfo.emissionsCompliant ? 'default' : 'destructive'}>
                                {lookupResult.complianceInfo.emissionsCompliant ? 'Compliant' : 'Non-Compliant'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {lookupResult.complianceInfo.modifications.length > 0 && (
                          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                              Recorded Modifications:
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                              {lookupResult.complianceInfo.modifications.map((mod, index) => (
                                <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                                  {mod}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {lookupResult.error || "No vehicle found with the provided details."}
                  </AlertDescription>
                </Alert>
              )}

              {/* Disclaimer */}
              <div className="text-xs text-gray-500 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {lookupResult.disclaimer}
              </div>
            </>
          )}

          {!lookupResult && (
            <Card className="shadow-lg">
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Ready to Search
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter vehicle details above to search Australian registration records
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Data Source Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600 dark:text-gray-300">
              <p className="mb-4">
                <strong>Data Source:</strong> Australian State Vehicle Registration Authorities
              </p>
              <p className="mb-4">
                <strong>Coverage:</strong> All Australian states and territories via official registry data
              </p>
              <div className="text-xs">
                <Info className="h-4 w-4 inline mr-2" />
                Information sourced from official government vehicle registration databases
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}