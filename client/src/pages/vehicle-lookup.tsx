import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Search, RefreshCw, Car, Flag, Info, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { Link } from "wouter";

const vehicleLookupSchema = z.object({
  identifier: z.string().min(1, "Please enter a VIN or chassis code"),
});

type FormData = z.infer<typeof vehicleLookupSchema>;

interface VinResult {
  make: string;
  model: string;
  year: string;
  trim?: string;
  engine?: string;
  fuelType?: string;
}

interface JdmResult {
  make: string;
  model: string;
  years: string;
  engine: string;
  compliance_notes: string;
}

interface AuctionSample {
  year: number;
  mileage: string;
  auctionHouse: string;
  priceJpy: string;
  priceAud: string;
}

interface LookupResponse {
  success: boolean;
  type: "vin" | "jdm";
  data?: VinResult | JdmResult;
  error?: string;
  auctionSamples?: AuctionSample[];
  suggestions?: Array<{
    code: string;
    description: string;
  }>;
}

export default function VehicleLookup() {
  const { toast } = useToast();
  const [result, setResult] = useState<LookupResponse | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(vehicleLookupSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const lookupMutation = useMutation({
    mutationFn: async (data: FormData): Promise<LookupResponse> => {
      const response = await apiRequest("POST", "/api/vehicle-lookup", data);
      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      setResult(data);
      if (!data.success) {
        toast({
          title: "Lookup Failed",
          description: data.error || "Could not find vehicle information",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to lookup vehicle information",
        variant: "destructive",
      });
      console.error("Lookup error:", error);
    },
  });

  const onSubmit = (data: FormData) => {
    lookupMutation.mutate(data);
  };

  const handleUseThisInfo = () => {
    if (!result?.data) return;
    
    // Navigate to import calculator with pre-filled data
    const searchParams = new URLSearchParams();
    
    if (result.type === "vin") {
      const vinData = result.data as VinResult;
      searchParams.set("make", vinData.make);
      searchParams.set("model", vinData.model);
      searchParams.set("year", vinData.year);
    } else {
      const jdmData = result.data as JdmResult;
      searchParams.set("make", jdmData.make);
      searchParams.set("model", jdmData.model);
      // Extract first year from range like "1996–2001"
      const yearMatch = jdmData.years.match(/(\d{4})/);
      if (yearMatch) {
        searchParams.set("year", yearMatch[1]);
      }
    }
    
    window.location.href = `/import-calculator?${searchParams.toString()}`;
  };

  const detectInputType = (value: string) => {
    if (value.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/i.test(value)) {
      return "vin";
    }
    return "jdm";
  };

  const currentInput = form.watch("identifier");
  const inputType = currentInput ? detectInputType(currentInput) : null;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Instant Vehicle Lookup
            </h1>
            <p className="text-xl text-gray-300 mb-6 max-w-3xl mx-auto">
              Easily decode U.S. VINs or JDM chassis codes to get vehicle specs, year ranges, engine info, 
              and compliance insights — all in one place. Whether you're researching a Skyline, Chaser, 
              or WRX, this tool gives you clarity <em>before</em> you commit.
            </p>
            
            <div className="flex justify-center items-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>No guessing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>No spreadsheet browsing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Just type, and ImportIQ figures it out</span>
              </div>
            </div>
          </div>

          {/* Search Form */}
          <Card className="bg-gray-900 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Car className="h-5 w-5" />
                Vehicle Search
                {inputType && (
                  <Badge variant="outline" className="ml-2">
                    {inputType === "vin" ? "🇺🇸 VIN Mode" : "🇯🇵 JDM Mode"}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Enter VIN or JDM Chassis Code
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., 1HGCM82633A123456 or JZA80"
                            className="text-lg py-3 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                            onChange={(e) => {
                              field.onChange(e.target.value.toUpperCase());
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        {inputType && (
                          <p className="text-sm text-gray-400 flex items-center gap-2">
                            <Flag className="h-4 w-4" />
                            {inputType === "vin" 
                              ? "Detected: 17-character VIN (will use NHTSA database)" 
                              : "Detected: JDM chassis code (will search internal database)"
                            }
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-semibold"
                    disabled={lookupMutation.isPending}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {lookupMutation.isPending ? "Looking up..." : "Lookup Vehicle"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className="bg-gray-900 border-gray-700 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Car className="h-5 w-5" />
                  Vehicle Information
                  <Badge variant="outline">
                    {result.type === "vin" ? "🇺🇸 VIN Decoded" : "🇯🇵 JDM Lookup"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.success && result.data ? (
                  <div className="space-y-6">
                    {result.type === "vin" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(() => {
                          const vinData = result.data as VinResult;
                          return (
                            <>
                              <div>
                                <p className="text-sm text-gray-400">Make</p>
                                <p className="text-lg font-semibold text-white">{vinData.make}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">Model</p>
                                <p className="text-lg font-semibold text-white">{vinData.model}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">Year</p>
                                <p className="text-lg font-semibold text-white">{vinData.year}</p>
                              </div>
                              {vinData.trim && (
                                <div>
                                  <p className="text-sm text-gray-400">Trim</p>
                                  <p className="text-lg font-semibold text-white">{vinData.trim}</p>
                                </div>
                              )}
                              {vinData.engine && (
                                <div>
                                  <p className="text-sm text-gray-400">Engine</p>
                                  <p className="text-lg font-semibold text-white">{vinData.engine}</p>
                                </div>
                              )}
                              {vinData.fuelType && (
                                <div>
                                  <p className="text-sm text-gray-400">Fuel Type</p>
                                  <p className="text-lg font-semibold text-white">{vinData.fuelType}</p>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(() => {
                          const jdmData = result.data as JdmResult;
                          return (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-400">Make</p>
                                  <p className="text-lg font-semibold text-white">{jdmData.make}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">Model</p>
                                  <p className="text-lg font-semibold text-white">{jdmData.model}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">Year Range</p>
                                  <p className="text-lg font-semibold text-white">{jdmData.years}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">Engine Code</p>
                                  <p className="text-lg font-semibold text-white">{jdmData.engine}</p>
                                </div>
                              </div>
                              
                              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                  <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm text-blue-400 font-medium mb-1">Compliance Notes</p>
                                    <p className="text-sm text-gray-300">{jdmData.compliance_notes}</p>
                                  </div>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    <Button 
                      onClick={handleUseThisInfo}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-semibold"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      🔄 Use This Info in Import Calculator
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-red-400 mb-2">Lookup Failed</p>
                    <p className="text-gray-400">{result.error}</p>
                    
                    {/* Display suggestions when lookup fails */}
                    {result.suggestions && result.suggestions.length > 0 && (
                      <div className="mt-6">
                        <p className="text-yellow-400 mb-3 font-medium">Try these similar vehicles:</p>
                        <div className="space-y-2">
                          {result.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                form.setValue("identifier", suggestion.code);
                                const formData = { identifier: suggestion.code };
                                lookupMutation.mutate(formData);
                              }}
                              className="block w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 transition-colors"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-yellow-400 font-mono">{suggestion.code}</span>
                                <span className="text-gray-300 text-sm">{suggestion.description}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Auction Sample Explorer */}
          {result && result.success && result.auctionSamples && result.auctionSamples.length > 0 && (
            <Card className="bg-gray-900 border-gray-700 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <DollarSign className="h-5 w-5" />
                  Auction Sample Explorer
                  <Badge variant="outline" className="ml-2">
                    🇯🇵 Historical Data
                  </Badge>
                </CardTitle>
                <p className="text-gray-400">
                  See how recent vehicles like yours performed at Japanese auctions:
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.auctionSamples.map((sample, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Year</p>
                          <p className="text-lg font-semibold text-white">{sample.year}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Mileage</p>
                          <p className="text-lg font-semibold text-white">{sample.mileage}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Auction House</p>
                          <p className="text-lg font-semibold text-white">{sample.auctionHouse}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Sample Auction Price</p>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-300">{sample.priceJpy}</p>
                            <p className="text-lg font-semibold text-yellow-400">{sample.priceAud}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                  <p className="text-sm text-blue-400 font-medium mb-2">Important Notice</p>
                  <p className="text-sm text-gray-300">
                    These are historical auction samples—not live feeds. Use for planning only. 
                    Actual auction prices vary based on condition, market demand, and specific vehicle features.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}



          {/* Disclaimer */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-400">
              <strong>Disclaimer:</strong> ImportIQ uses official VIN registries and curated JDM reference data. 
              Information is accurate to the best of our ability but does not replace physical inspection or formal compliance approval.
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-8 text-center">
            <Link href="/importiq">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                ← Back to ImportIQ Tools
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}