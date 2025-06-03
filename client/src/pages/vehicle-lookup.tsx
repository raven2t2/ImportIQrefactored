import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Car, Flag, AlertCircle, CheckCircle, RefreshCw, DollarSign, Calendar, Gauge, Wrench, Database, ArrowRight, Calculator, FileText, Ship } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

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
  recommendations?: Array<{
    tool: string;
    description: string;
    action: string;
    link: string;
    data: any;
  }>;
}

export default function VehicleLookup() {
  const [result, setResult] = useState<VehicleResult | null>(null);
  const [auctionData, setAuctionData] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; isReturning: boolean } | null>(null);
  const { toast } = useToast();

  // Check for existing trial login status
  useEffect(() => {
    const trialUserName = localStorage.getItem('trial_user_name');
    const trialUserEmail = localStorage.getItem('trial_user_email');
    
    if (trialUserName && trialUserEmail) {
      setUserInfo({
        name: trialUserName,
        email: trialUserEmail,
        isReturning: true
      });
    }
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(lookupSchema),
    defaultValues: {
      identifier: "",
    },
  });

  // Common vehicle builds for quick selection (JDM chassis codes only)
  const commonBuilds = [
    { label: "Nissan Skyline GT-R R34", value: "BNR34" },
    { label: "Nissan Skyline GT-R R33", value: "BNR33" },
    { label: "Nissan Skyline GT-R R32", value: "BNR32" },
    { label: "Toyota Supra A80", value: "JZA80" },
    { label: "Toyota AE86", value: "AE86" },
    { label: "Nissan Silvia S15", value: "S15" },
    { label: "Mitsubishi Lancer Evo", value: "CT9A" },
    { label: "Subaru Impreza STI", value: "GDB" },
    { label: "Honda NSX", value: "NA1" },
    { label: "Mazda RX-7 FD", value: "FD3S" },
    { label: "Toyota Chaser", value: "JZX100" },
    { label: "Nissan 300ZX", value: "Z32" }
  ];

  const handleQuickSelect = (chassisCode: string) => {
    form.setValue("identifier", chassisCode);
    form.handleSubmit(onSubmit)();
  };

  const { register, handleSubmit, watch, formState: { errors } } = form;

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/vehicle-lookup", data);
      return response.json();
    },
    onSuccess: (data) => {
      console.log("API Response:", data); // Debug log
      if (data.success) {
        // Handle different response structures
        const resultData = data.result || data.data;
        // Map API response fields to expected frontend fields
        const mappedResult = {
          ...resultData,
          yearRange: resultData.years,
          complianceNotes: resultData.compliance_notes,
          engine: resultData.engine,
          type: data.type
        };
        setResult(mappedResult);
      } else if (data.error && data.suggestions) {
        // Handle JDM chassis code not found with suggestions
        toast({
          title: "Chassis Code Not Found",
          description: `${data.error}. Try one of the suggested codes instead.`,
          variant: "destructive",
        });
        setResult(null);
      } else {
        // Handle other errors
        toast({
          title: "Vehicle Not Found",
          description: data.message || data.error || "Unable to find information for this vehicle",
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
            Decode American VINs (17 characters) or JDM chassis codes to get vehicle specs, year ranges, engine info, 
            and compliance insights. For American Muscle cars, use the full VIN. For JDM vehicles, use chassis codes - 
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

              {/* Quick Select Popular Builds */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-300">Quick Select Popular Builds</h3>
                  <span className="text-xs text-gray-500">Click to autofill</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {commonBuilds.map((build) => (
                    <Button
                      key={build.value}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-left justify-start h-auto py-2 px-3 text-xs border-amber-400/30 bg-gray-800/50 hover:bg-amber-400/10 hover:border-amber-400/50 text-white"
                      onClick={() => handleQuickSelect(build.value)}
                      disabled={mutation.isPending}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-mono font-medium text-amber-400">{build.value}</span>
                        <span className="text-gray-400 text-[10px] leading-tight">
                          {build.label}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
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
                      Import Compliance Pathway
                    </h3>
                    <div className="p-4 bg-amber-400/10 rounded-lg border border-amber-400/20 mb-4">
                      <p className="text-amber-100 font-medium mb-3">{result.complianceNotes}</p>
                      
                      {/* Compliance Explanation */}
                      <div className="mt-4 p-3 bg-amber-950/30 rounded border border-amber-400/30">
                        <h4 className="text-amber-200 font-medium mb-2">What this means:</h4>
                        {result.complianceNotes.includes("SEVS eligible") && (
                          <div className="text-amber-100 text-sm space-y-2">
                            <p><strong>SEVS (Specialist and Enthusiast Vehicle Scheme):</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-xs text-amber-200/80">
                              <li>For vehicles 15+ years old with historical/sporting significance</li>
                              <li>Requires pre-approval from Department of Infrastructure</li>
                              <li>Must be on the SEVS register or get individual approval</li>
                              <li>Compliance costs: $15,000-25,000 typically</li>
                              <li>Processing time: 3-6 months</li>
                            </ul>
                          </div>
                        )}
                        {result.complianceNotes.includes("25+ year rule eligible") && (
                          <div className="text-amber-100 text-sm space-y-2">
                            <p><strong>25+ Year Rule:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-xs text-amber-200/80">
                              <li>Vehicles 25+ years old can import as "classic vehicles"</li>
                              <li>Exempt from full ADR compliance requirements</li>
                              <li>Still requires safety inspection and registration</li>
                              <li>Compliance costs: $5,000-10,000 typically</li>
                              <li>Fastest pathway for eligible vehicles</li>
                            </ul>
                          </div>
                        )}
                        {result.complianceNotes.includes("specialist compliance") && (
                          <div className="text-amber-100 text-sm space-y-2">
                            <p><strong>Specialist Compliance Required:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-xs text-amber-200/80">
                              <li>Complex modifications needed for ADR compliance</li>
                              <li>Turbo systems may need engineering certification</li>
                              <li>Higher compliance costs due to complexity</li>
                              <li>Estimated costs: $20,000-35,000+</li>
                              <li>Longer processing times: 6-12 months</li>
                            </ul>
                          </div>
                        )}
                        {result.complianceNotes.includes("RAW (Racetrack)") && (
                          <div className="text-amber-100 text-sm space-y-2">
                            <p><strong>RAW (Racetrack) Only:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-xs text-amber-200/80">
                              <li>Cannot be registered for road use</li>
                              <li>Track/display use only</li>
                              <li>Lower import duties apply</li>
                              <li>No compliance workshop required</li>
                              <li>Cannot be converted to road legal later</li>
                            </ul>
                          </div>
                        )}
                      </div>
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

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <>
                  <Separator className="bg-amber-400/20" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <ArrowRight className="h-5 w-5 text-amber-400 mr-2" />
                      Recommended Next Steps
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {result.recommendations.map((rec, index) => (
                        <div key={index} className="p-4 bg-amber-950/20 rounded-lg border border-amber-400/20">
                          <div className="text-amber-400 text-sm font-medium mb-1">{rec.tool}</div>
                          <div className="text-white text-sm mb-3">{rec.description}</div>
                          <Link to={rec.link}>
                            <Button 
                              size="sm" 
                              className="bg-amber-400 text-black hover:bg-amber-500 font-medium"
                            >
                              {rec.action}
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Quick Actions */}
              <Separator className="bg-gray-600" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 text-center">Continue Your Import Journey</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link href="/value-estimator">
                    <Button 
                      variant="outline" 
                      className="w-full h-16 bg-blue-950/20 border-blue-400/30 text-blue-300 hover:bg-blue-950/60 hover:text-blue-200 hover:border-blue-300"
                    >
                      <div className="text-center">
                        <DollarSign className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-sm font-medium">Value Estimator</div>
                        <div className="text-xs opacity-75">Get market value estimate</div>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link href="/import-cost-calculator">
                    <Button 
                      variant="outline" 
                      className="w-full h-16 bg-green-950/20 border-green-400/30 text-green-300 hover:bg-green-950/60 hover:text-green-200 hover:border-green-300"
                    >
                      <div className="text-center">
                        <Calculator className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-sm font-medium">Import Calculator</div>
                        <div className="text-xs opacity-75">Calculate total costs</div>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link href="/state-requirements">
                    <Button 
                      variant="outline" 
                      className="w-full h-16 bg-purple-950/20 border-purple-400/30 text-purple-300 hover:bg-purple-950/60 hover:text-purple-200 hover:border-purple-300"
                    >
                      <div className="text-center">
                        <FileText className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-sm font-medium">State Requirements</div>
                        <div className="text-xs opacity-75">Check compliance needs</div>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link href="/port-intelligence">
                    <Button 
                      variant="outline" 
                      className="w-full h-16 bg-cyan-950/20 border-cyan-400/30 text-cyan-300 hover:bg-cyan-950/60 hover:text-cyan-200 hover:border-cyan-300"
                    >
                      <div className="text-center">
                        <Ship className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-sm font-medium">Port Intelligence</div>
                        <div className="text-xs opacity-75">Choose best arrival port</div>
                      </div>
                    </Button>
                  </Link>
                </div>
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