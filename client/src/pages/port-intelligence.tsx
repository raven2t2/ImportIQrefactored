import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Anchor, MapPin, Clock, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Truck, Ship, Navigation, Globe } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AustralianPort {
  code: string;
  name: string;
  city: string;
  state: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  authority: string;
  website: string;
  operations: {
    vehicleTerminal: boolean;
    roroCapable: boolean;
    containerCapable: boolean;
    operatingHours: string;
    vehicleProcessingCapacity: number;
    averageProcessingDays: number;
  };
  costs: {
    portHandling: number;
    quarantineInspection: number;
    customsProcessing: number;
    storagePerDay: number;
    additionalFees: {
      afterHours: number;
      inspection: number;
      documentation: number;
    };
  };
  traffic: {
    currentStatus: "Low" | "Moderate" | "High" | "Congested";
    averageWaitDays: number;
    peakSeasons: string[];
    vehicleVolumeMonthly: number;
    congestionFactors: string[];
  };
  compliance: {
    quarantineStrictness: "Standard" | "High" | "Very High";
    customsComplexity: "Simple" | "Moderate" | "Complex";
    additionalRequirements: string[];
    recommendedAgents: string[];
  };
  geographic: {
    proximityToMajorCities: {
      [cityName: string]: {
        distance: number;
        driveTime: string;
      };
    };
    railConnections: boolean;
    highwayAccess: string;
    regionServed: string[];
  };
  bestFor: string[];
  challenges: string[];
  tips: string[];
  lastUpdated: string;
}

interface PortData {
  ports: AustralianPort[];
  totalPorts: number;
  dataSource: string;
  disclaimer: string;
}

interface RecommendationRequest {
  postcode: string;
  priorityCost: boolean;
  prioritySpeed: boolean;
  priorityConvenience: boolean;
}

interface PortRecommendations {
  postcode: string;
  preferences: {
    priorityCost: boolean;
    prioritySpeed: boolean;
    priorityConvenience: boolean;
  };
  recommendations: {
    primary: AustralianPort[];
    alternatives: AustralianPort[];
    reasoning: string[];
  };
  seasonalConsiderations: {
    avoid: string[];
    recommended: string[];
    notes: string[];
  };
  dataSource: string;
  disclaimer: string;
}

interface CostCalculation {
  port: AustralianPort;
  costs: {
    handling: number;
    quarantine: number;
    customs: number;
    storage: number;
    total: number;
  };
  timeline: string;
  vehicleValue: number;
  storageDays: number;
  dataSource: string;
  disclaimer: string;
}

const getTrafficStatusColor = (status: string) => {
  switch (status) {
    case "Low": return "text-green-600 bg-green-50";
    case "Moderate": return "text-yellow-600 bg-yellow-50";
    case "High": return "text-orange-600 bg-orange-50";
    case "Congested": return "text-red-600 bg-red-50";
    default: return "text-gray-600 bg-gray-50";
  }
};

const getDifficultyColor = (level: string) => {
  switch (level) {
    case "Standard": case "Simple": return "text-green-600 bg-green-50";
    case "Moderate": return "text-yellow-600 bg-yellow-50";
    case "High": case "Complex": return "text-orange-600 bg-orange-50";
    case "Very High": return "text-red-600 bg-red-50";
    default: return "text-gray-600 bg-gray-50";
  }
};

export default function PortIntelligence() {
  const { toast } = useToast();
  const [selectedPort, setSelectedPort] = useState<string>("");
  const [postcode, setPostcode] = useState("");
  const [priorityCost, setPriorityCost] = useState(false);
  const [prioritySpeed, setPrioritySpeed] = useState(false);
  const [priorityConvenience, setPriorityConvenience] = useState(false);
  const [vehicleValue, setVehicleValue] = useState("");
  const [storageDays, setStorageDays] = useState("7");
  const [selectedPorts, setSelectedPorts] = useState<string[]>([]);

  // Fetch all ports data
  const { data: portData, isLoading: isLoadingPorts } = useQuery<PortData>({
    queryKey: ["/api/port-intelligence"],
  });

  // Port recommendations mutation
  const recommendationsMutation = useMutation({
    mutationFn: async (request: RecommendationRequest) => {
      const res = await apiRequest("POST", "/api/port-recommendations", request);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/port-recommendations"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Recommendation Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cost calculation mutation
  const costCalculationMutation = useMutation({
    mutationFn: async (request: { portCode: string; vehicleValue: number; storageDays: number }) => {
      const res = await apiRequest("POST", "/api/port-cost-calculator", request);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/port-cost-calculator"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Cost Calculation Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Port comparison mutation
  const comparisonMutation = useMutation({
    mutationFn: async (request: { ports: string[]; vehicleValue: number; storageDays: number }) => {
      const res = await apiRequest("POST", "/api/port-comparison", request);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/port-comparison"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Comparison Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGetRecommendations = () => {
    if (!postcode.trim()) {
      toast({
        title: "Postcode Required",
        description: "Please enter your postcode for recommendations",
        variant: "destructive",
      });
      return;
    }

    recommendationsMutation.mutate({
      postcode: postcode.trim(),
      priorityCost,
      prioritySpeed,
      priorityConvenience
    });
  };

  const handleCalculateCosts = () => {
    if (!selectedPort || !vehicleValue) {
      toast({
        title: "Missing Information",
        description: "Please select a port and enter vehicle value",
        variant: "destructive",
      });
      return;
    }

    const value = parseFloat(vehicleValue);
    if (isNaN(value) || value <= 0) {
      toast({
        title: "Invalid Value",
        description: "Please enter a valid vehicle value",
        variant: "destructive",
      });
      return;
    }

    costCalculationMutation.mutate({
      portCode: selectedPort,
      vehicleValue: value,
      storageDays: parseInt(storageDays) || 7
    });
  };

  const handleComparePorts = () => {
    if (selectedPorts.length < 2 || !vehicleValue) {
      toast({
        title: "Missing Information",
        description: "Please select at least 2 ports and enter vehicle value",
        variant: "destructive",
      });
      return;
    }

    const value = parseFloat(vehicleValue);
    if (isNaN(value) || value <= 0) {
      toast({
        title: "Invalid Value",
        description: "Please enter a valid vehicle value",
        variant: "destructive",
      });
      return;
    }

    comparisonMutation.mutate({
      ports: selectedPorts,
      vehicleValue: value,
      storageDays: parseInt(storageDays) || 7
    });
  };

  const togglePortSelection = (portCode: string) => {
    setSelectedPorts(prev => 
      prev.includes(portCode) 
        ? prev.filter(p => p !== portCode)
        : [...prev, portCode]
    );
  };

  if (isLoadingPorts) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading Australian port intelligence...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Anchor className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Port Intelligence</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive Australian port data and recommendations for vehicle imports. 
            Make informed decisions based on authentic port authority information.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Port Overview
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cost Calculator
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Port Comparison
            </TabsTrigger>
          </TabsList>

          {/* Port Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Australian Vehicle Import Ports
                </CardTitle>
                <CardDescription>
                  Comprehensive data on {portData?.totalPorts || 0} major Australian ports handling vehicle imports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {portData && (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {portData.ports.map((port) => (
                      <Card key={port.code} className="border border-gray-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{port.name}</CardTitle>
                              <CardDescription>{port.city}, {port.state}</CardDescription>
                            </div>
                            <Badge className={getTrafficStatusColor(port.traffic.currentStatus)}>
                              {port.traffic.currentStatus}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Operations */}
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Operations</h4>
                            <div className="flex flex-wrap gap-1">
                              {port.operations.vehicleTerminal && (
                                <Badge variant="outline" className="text-xs">Vehicle Terminal</Badge>
                              )}
                              {port.operations.roroCapable && (
                                <Badge variant="outline" className="text-xs">RoRo Capable</Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {port.operations.vehicleProcessingCapacity}/month
                              </Badge>
                            </div>
                          </div>

                          {/* Costs */}
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Base Costs</h4>
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span>Port Handling:</span>
                                <span className="font-medium">${port.costs.portHandling}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Quarantine:</span>
                                <span className="font-medium">${port.costs.quarantineInspection}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Storage/day:</span>
                                <span className="font-medium">${port.costs.storagePerDay}</span>
                              </div>
                            </div>
                          </div>

                          {/* Timeline */}
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Processing Time</h4>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{port.operations.averageProcessingDays} days average</span>
                            </div>
                          </div>

                          {/* Best For */}
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Best For</h4>
                            <ul className="text-xs space-y-1">
                              {port.bestFor.slice(0, 2).map((item, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Compliance */}
                          {port.compliance && (
                            <div className="flex gap-2">
                              <Badge className={getDifficultyColor(port.compliance.quarantineStrictness)}>
                                {port.compliance.quarantineStrictness} Bio-security
                              </Badge>
                              <Badge className={getDifficultyColor(port.compliance.customsComplexity)}>
                                {port.compliance.customsComplexity} Customs
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {portData && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Data Source:</strong> {portData.dataSource}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{portData.disclaimer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Port Recommendations for Your Location
                </CardTitle>
                <CardDescription>
                  Get personalized port recommendations based on your postcode and priorities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="postcode">Your Postcode</Label>
                    <Input
                      id="postcode"
                      placeholder="e.g., 2000, 3000, 4000"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Priorities</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="cost"
                          checked={priorityCost}
                          onCheckedChange={(checked) => setPriorityCost(!!checked)}
                        />
                        <Label htmlFor="cost" className="text-sm">Lowest cost</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="speed"
                          checked={prioritySpeed}
                          onCheckedChange={(checked) => setPrioritySpeed(!!checked)}
                        />
                        <Label htmlFor="speed" className="text-sm">Fastest processing</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="convenience"
                          checked={priorityConvenience}
                          onCheckedChange={(checked) => setPriorityConvenience(!!checked)}
                        />
                        <Label htmlFor="convenience" className="text-sm">Maximum convenience</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleGetRecommendations}
                  disabled={recommendationsMutation.isPending}
                  className="w-full"
                >
                  {recommendationsMutation.isPending ? "Getting Recommendations..." : "Get Port Recommendations"}
                </Button>

                {recommendationsMutation.data && (
                  <div className="space-y-6">
                    <Separator />
                    
                    {/* Primary Recommendations */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Recommended Ports for {recommendationsMutation.data.postcode}</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {recommendationsMutation.data.recommendations.primary.map((port: AustralianPort) => (
                          <Card key={port.code} className="border-green-200 bg-green-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                {port.name}
                              </CardTitle>
                              <CardDescription>{port.city}, {port.state}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                  <span>Processing Time:</span>
                                  <span className="font-medium">{port.operations.averageProcessingDays} days</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Traffic Status:</span>
                                  <Badge className={getTrafficStatusColor(port.traffic.currentStatus)}>
                                    {port.traffic.currentStatus}
                                  </Badge>
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">Best for: </span>
                                  {port.bestFor.slice(0, 2).join(", ")}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Reasoning */}
                    {recommendationsMutation.data.recommendations.reasoning.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Why These Ports?</h4>
                        <ul className="text-sm space-y-1">
                          {recommendationsMutation.data.recommendations.reasoning.map((reason: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Seasonal Considerations */}
                    {(recommendationsMutation.data.seasonalConsiderations.notes.length > 0 || 
                      recommendationsMutation.data.seasonalConsiderations.avoid.length > 0) && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Seasonal Considerations:</strong>
                          {recommendationsMutation.data.seasonalConsiderations.notes.map((note: string, index: number) => (
                            <div key={index} className="mt-1">{note}</div>
                          ))}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Port Cost Calculator
                </CardTitle>
                <CardDescription>
                  Calculate detailed port costs for your vehicle import
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="port-select">Select Port</Label>
                    <Select value={selectedPort} onValueChange={setSelectedPort}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a port" />
                      </SelectTrigger>
                      <SelectContent>
                        {portData?.ports.map((port) => (
                          <SelectItem key={port.code} value={port.code}>
                            {port.name} ({port.state})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-value">Vehicle Value (AUD)</Label>
                    <Input
                      id="vehicle-value"
                      type="number"
                      placeholder="50000"
                      value={vehicleValue}
                      onChange={(e) => setVehicleValue(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storage-days">Storage Days</Label>
                    <Input
                      id="storage-days"
                      type="number"
                      placeholder="7"
                      value={storageDays}
                      onChange={(e) => setStorageDays(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleCalculateCosts}
                  disabled={costCalculationMutation.isPending}
                  className="w-full"
                >
                  {costCalculationMutation.isPending ? "Calculating..." : "Calculate Port Costs"}
                </Button>

                {costCalculationMutation.data && (
                  <div className="space-y-6">
                    <Separator />
                    
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">{costCalculationMutation.data.port.name}</CardTitle>
                          <CardDescription>{costCalculationMutation.data.port.city}, {costCalculationMutation.data.port.state}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span>Port Handling:</span>
                              <span className="font-medium">${costCalculationMutation.data.costs.handling}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Quarantine Inspection:</span>
                              <span className="font-medium">${costCalculationMutation.data.costs.quarantine}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Customs Processing:</span>
                              <span className="font-medium">${costCalculationMutation.data.costs.customs}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Storage ({costCalculationMutation.data.storageDays} days):</span>
                              <span className="font-medium">${costCalculationMutation.data.costs.storage}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-lg font-semibold">
                              <span>Total Port Costs:</span>
                              <span>${costCalculationMutation.data.costs.total}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Timeline & Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-blue-500" />
                              <div>
                                <div className="font-medium">Processing Time</div>
                                <div className="text-sm text-gray-600">{costCalculationMutation.data.timeline}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Truck className="h-5 w-5 text-green-500" />
                              <div>
                                <div className="font-medium">Vehicle Capacity</div>
                                <div className="text-sm text-gray-600">
                                  {costCalculationMutation.data.port.operations.vehicleProcessingCapacity} vehicles/month
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-purple-500" />
                              <div>
                                <div className="font-medium">Operating Hours</div>
                                <div className="text-sm text-gray-600">
                                  {costCalculationMutation.data.port.operations.operatingHours}
                                </div>
                              </div>
                            </div>

                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="text-sm">
                                {costCalculationMutation.data.disclaimer}
                              </AlertDescription>
                            </Alert>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Port Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Compare Multiple Ports
                </CardTitle>
                <CardDescription>
                  Compare costs, timelines, and features across multiple ports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="comparison-vehicle-value">Vehicle Value (AUD)</Label>
                    <Input
                      id="comparison-vehicle-value"
                      type="number"
                      placeholder="50000"
                      value={vehicleValue}
                      onChange={(e) => setVehicleValue(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comparison-storage-days">Storage Days</Label>
                    <Input
                      id="comparison-storage-days"
                      type="number"
                      placeholder="7"
                      value={storageDays}
                      onChange={(e) => setStorageDays(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Select Ports to Compare (minimum 2)</Label>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {portData?.ports.map((port) => (
                      <div key={port.code} className="flex items-center space-x-2">
                        <Checkbox
                          id={`compare-${port.code}`}
                          checked={selectedPorts.includes(port.code)}
                          onCheckedChange={() => togglePortSelection(port.code)}
                        />
                        <Label htmlFor={`compare-${port.code}`} className="text-sm">
                          {port.name} ({port.state})
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">Selected: {selectedPorts.length} ports</p>
                </div>

                <Button 
                  onClick={handleComparePorts}
                  disabled={comparisonMutation.isPending || selectedPorts.length < 2}
                  className="w-full"
                >
                  {comparisonMutation.isPending ? "Comparing..." : "Compare Selected Ports"}
                </Button>

                {comparisonMutation.data && (
                  <div className="space-y-6">
                    <Separator />
                    
                    {/* Summary */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card className="border-green-200 bg-green-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-green-700">Most Affordable</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg font-semibold">{comparisonMutation.data.summary.cheapest.port.name}</div>
                          <div className="text-sm text-gray-600">${comparisonMutation.data.summary.cheapest.costs.total}</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-red-200 bg-red-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-red-700">Most Expensive</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg font-semibold">{comparisonMutation.data.summary.mostExpensive.port.name}</div>
                          <div className="text-sm text-gray-600">${comparisonMutation.data.summary.mostExpensive.costs.total}</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-blue-200 bg-blue-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-blue-700">Average Cost</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg font-semibold">${Math.round(comparisonMutation.data.summary.averageCost)}</div>
                          <div className="text-sm text-gray-600">Across all ports</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Detailed Comparison */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Detailed Comparison</h3>
                      <div className="space-y-3">
                        {comparisonMutation.data.comparison.map((comp: any, index: number) => (
                          <Card key={comp.port.code} className={index === 0 ? "border-green-200" : ""}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-lg">{comp.port.name}</CardTitle>
                                  <CardDescription>{comp.port.city}, {comp.port.state}</CardDescription>
                                </div>
                                {index === 0 && (
                                  <Badge className="bg-green-100 text-green-700">Best Value</Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-4 md:grid-cols-4">
                                <div>
                                  <div className="text-sm font-medium">Total Cost</div>
                                  <div className="text-lg font-semibold">${comp.costs.total}</div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium">Processing Time</div>
                                  <div className="text-sm">{comp.timeline}</div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium">Traffic Status</div>
                                  <Badge className={getTrafficStatusColor(comp.port.traffic.currentStatus)}>
                                    {comp.port.traffic.currentStatus}
                                  </Badge>
                                </div>
                                <div>
                                  <div className="text-sm font-medium">Operating Hours</div>
                                  <div className="text-sm">{comp.port.operations.operatingHours}</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}