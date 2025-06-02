import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Car, Flag, AlertCircle, CheckCircle, RefreshCw, DollarSign, Calendar, Gauge, Wrench, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const lookupSchema = z.object({
  identifier: z.string().min(1, "Please enter a VIN or chassis code"),
});

type FormData = z.infer<typeof lookupSchema>;

interface VehicleResult {
  type: 'vin' | 'chassis';
  make: string;
  model: string;
  year?: string;
  yearRange?: string;
  engine?: string;
  engineCode?: string;
  fuelType?: string;
  trim?: string;
  complianceNotes?: string;
  auctionData?: {
    averagePrice: number;
    currency: string;
    sampleCount: number;
    priceRange: string;
    popularAuctions: string[];
  };
}

export default function VehicleLookup() {
  const [result, setResult] = useState<VehicleResult | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(lookupSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/vehicle-lookup", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setResult(data.result);
      } else {
        toast({
          title: "Vehicle Not Found",
          description: data.message || "Unable to find information for this vehicle",
          variant: "destructive",
        });
        setResult(null);
      }
    },
    onError: (error) => {
      toast({
        title: "Lookup Failed",
        description: "Unable to search for vehicle information",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const identifier = watch("identifier");
  const isVIN = identifier.length === 17;
  const isChassisCode = identifier.length > 0 && identifier.length < 17;

  const getVehicleTypeIcon = () => {
    if (result?.type === 'vin') return <span className="text-lg">🇺🇸</span>;
    if (result?.type === 'chassis') return <span className="text-lg">🇯🇵</span>;
    return <Car className="h-5 w-5" />;
  };

  const useThisInfo = () => {
    if (!result) return;
    
    // Store vehicle info in localStorage for other tools to use
    const vehicleInfo = {
      make: result.make,
      model: result.model,
      year: result.year || result.yearRange?.split('–')[0],
      engine: result.engine || result.engineCode,
      lastLookup: new Date().toISOString()
    };
    
    localStorage.setItem('selectedVehicle', JSON.stringify(vehicleInfo));
    
    toast({
      title: "Vehicle Info Saved",
      description: "This vehicle's details can now be used in other ImportIQ tools",
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center mr-4">
              <Database className="h-8 w-8 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Instant Vehicle Lookup
              </h1>
              <p className="text-xl text-gray-400">
                Decode VINs or JDM chassis codes instantly
              </p>
            </div>
          </div>
          
          <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Easily decode U.S. VINs or JDM chassis codes to get vehicle specs, year ranges, engine info, 
            and compliance insights — all in one place. Whether you're researching a Skyline, Chaser, or WRX, 
            this tool gives you clarity before you commit.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-gray-400">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
              No guessing
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
              No spreadsheet browsing
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
              Just type, and ImportIQ figures it out
            </div>
          </div>
        </div>

        {/* Search Form */}
        <Card className="border border-amber-400/20 bg-gray-900/50 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Search className="h-5 w-5 mr-2" />
              Vehicle Search
            </CardTitle>
            <CardDescription className="text-gray-400">
              Enter a 17-character VIN or JDM chassis code (e.g., R34, JZX100, AE86)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <div className="relative">
                  <Input
                    {...register("identifier")}
                    placeholder="Enter VIN or JDM Chassis Code..."
                    className="bg-black border-amber-400/30 text-white placeholder:text-gray-500 pr-20"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    {identifier && identifier.length > 0 && (
                      <Badge variant="outline" className={`text-xs ${
                        isVIN ? 'border-blue-400 text-blue-400' : 
                        isChassisCode ? 'border-green-400 text-green-400' : 
                        'border-gray-400 text-gray-400'
                      }`}>
                        {isVIN ? '🇺🇸 VIN' : isChassisCode ? '🇯🇵 JDM' : 'Type...'}
                      </Badge>
                    )}
                  </div>
                </div>
                {errors.identifier && (
                  <p className="text-red-400 text-sm mt-1">{errors.identifier.message}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-amber-400 text-black hover:bg-amber-500 font-medium"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Lookup Vehicle
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className="border border-green-400/20 bg-green-950/20 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                {getVehicleTypeIcon()}
                <span className="ml-3">Vehicle Information</span>
                <Badge className="ml-auto" variant="outline">
                  {result.type === 'vin' ? 'NHTSA Database' : 'JDM Database'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Vehicle Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Make:</span>
                        <span className="text-white font-medium">{result.make}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Model:</span>
                        <span className="text-white font-medium">{result.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Year:</span>
                        <span className="text-white font-medium">
                          {result.year || result.yearRange}
                        </span>
                      </div>
                      {result.trim && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Trim:</span>
                          <span className="text-white font-medium">{result.trim}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Engine & Performance</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Engine:</span>
                        <span className="text-white font-medium">
                          {result.engine || result.engineCode || 'N/A'}
                        </span>
                      </div>
                      {result.fuelType && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Fuel Type:</span>
                          <span className="text-white font-medium">{result.fuelType}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Notes */}
              {result.complianceNotes && (
                <>
                  <Separator className="bg-amber-400/20" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <AlertCircle className="h-5 w-5 text-amber-400 mr-2" />
                      Compliance Notes
                    </h3>
                    <div className="p-4 bg-amber-400/10 rounded-lg border border-amber-400/20">
                      <p className="text-amber-100">{result.complianceNotes}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Auction Data */}
              {result.auctionData && (
                <>
                  <Separator className="bg-blue-400/20" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <DollarSign className="h-5 w-5 text-blue-400 mr-2" />
                      Historical Auction Reference Data
                    </h3>
                    <p className="text-sm text-blue-300 mb-4">
                      Based on historical Japanese auction records. Prices are reference only and actual market values may vary.
                    </p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-950/20 rounded-lg border border-blue-400/20">
                        <div className="text-blue-400 text-sm font-medium mb-1">Average Price</div>
                        <div className="text-white text-lg font-bold">
                          ¥{result.auctionData.averagePrice.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-4 bg-blue-950/20 rounded-lg border border-blue-400/20">
                        <div className="text-blue-400 text-sm font-medium mb-1">Price Range</div>
                        <div className="text-white text-lg font-bold">{result.auctionData.priceRange}</div>
                      </div>
                      <div className="p-4 bg-blue-950/20 rounded-lg border border-blue-400/20">
                        <div className="text-blue-400 text-sm font-medium mb-1">Sample Size</div>
                        <div className="text-white text-lg font-bold">{result.auctionData.sampleCount} vehicles</div>
                      </div>
                    </div>
                    {result.auctionData.popularAuctions && result.auctionData.popularAuctions.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm text-gray-400 mb-2">Popular Auction Houses:</div>
                        <div className="flex flex-wrap gap-2">
                          {result.auctionData.popularAuctions.map((auction, index) => (
                            <Badge key={index} variant="outline" className="text-blue-400 border-blue-400/50">
                              {auction}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Action Button */}
              <Separator className="bg-gray-600" />
              <div className="flex justify-center">
                <Button
                  onClick={useThisInfo}
                  size="lg"
                  className="bg-amber-400 text-black hover:bg-amber-500 font-medium"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Use This Info in Other Tools
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <Card className="border border-gray-600 bg-gray-900/30">
          <CardContent className="p-4">
            <p className="text-sm text-gray-400 text-center">
              ImportIQ uses official VIN registries and curated JDM reference data. 
              Information is accurate to the best of our ability but does not replace 
              physical inspection or formal compliance approval.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}