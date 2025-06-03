import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, MapPin, Clock, DollarSign, AlertTriangle, CheckCircle, Info, ExternalLink } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface StateRequirement {
  state: string;
  stateCode: string;
  authority: string;
  website: string;
  registration: {
    importedVehicleProcess: string;
    inspectionRequired: boolean;
    inspectionType: string;
    compliancePlateRequired: boolean;
    modificationDeclaration: boolean;
    engineeringCertificate: boolean;
    difficultyLevel: "Easy" | "Moderate" | "Complex" | "Very Complex";
    estimatedCost: {
      inspection: number;
      registration: number;
      transferFee: number;
      stampDuty: number;
      ctp: number;
    };
    processingTime: string;
  };
  compliance: {
    adrCompliance: string;
    emissionStandards: string;
    safetyStandards: string;
    modifications: {
      allowed: string[];
      restricted: string[];
      engineeringRequired: string[];
    };
    importAge: {
      minimum: number;
      maximum: number | null;
      exemptions: string[];
    };
  };
  considerations: {
    challenges: string[];
    advantages: string[];
    commonIssues: string[];
    tips: string[];
  };
  documentation: {
    required: string[];
    recommended: string[];
    forms: {
      name: string;
      url: string;
      purpose: string;
    }[];
  };
  lastUpdated: string;
}

interface StateComparison {
  state: string;
  stateCode: string;
  totalCost: number;
  difficultyLevel: string;
  processingTime: string;
}

const getDifficultyColor = (level: string) => {
  switch (level) {
    case "Easy": return "bg-green-100 text-green-800 border-green-200";
    case "Moderate": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Complex": return "bg-orange-100 text-orange-800 border-orange-200";
    case "Very Complex": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function StateRequirements() {
  const [selectedState, setSelectedState] = useState<string>("");
  const [vehicleValue, setVehicleValue] = useState<string>("");
  const [showComparison, setShowComparison] = useState(false);

  // Fetch all states data
  const { data: statesData, isLoading: statesLoading } = useQuery({
    queryKey: ["/api/state-requirements"],
  });

  // Fetch individual state data
  const { data: stateData, isLoading: stateLoading, refetch: refetchState } = useQuery({
    queryKey: ["/api/state-requirements", selectedState],
    queryFn: () => apiRequest("GET", `/api/state-requirements?state=${selectedState}`).then(res => res.json()),
    enabled: !!selectedState,
  });

  // Cost comparison mutation
  const costComparisonMutation = useMutation({
    mutationFn: async (value: number) => {
      const res = await apiRequest("POST", "/api/state-cost-comparison", { vehicleValue: value });
      return await res.json();
    },
  });

  const handleCompareStates = () => {
    const value = parseFloat(vehicleValue);
    if (value > 0) {
      costComparisonMutation.mutate(value);
      setShowComparison(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/dashboard'}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Australian State Requirements Guide
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive state-by-state vehicle registration and compliance requirements
              using authentic data from Australian transport authorities.
            </p>
          </div>
        </div>

        {/* Real-World Examples Alert */}
        <Alert className="mb-8 bg-amber-50 border-amber-200">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Real-World Examples:</strong> A Camaro ZL1 owner had to upgrade from a compliant quiet exhaust to a performance system post-import. 
            A Cobra replica owner registered in QLD due to SA complications around exhaust and mirror requirements. 
            This tool helps you avoid these costly surprises.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">State Overview</TabsTrigger>
            <TabsTrigger value="details">Detailed Requirements</TabsTrigger>
            <TabsTrigger value="comparison">Cost Comparison</TabsTrigger>
            <TabsTrigger value="scenarios">Real Scenarios</TabsTrigger>
          </TabsList>

          {/* State Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {statesLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">States by Difficulty Level</h2>
                
                {statesData?.statesByDifficulty && Object.entries(statesData.statesByDifficulty).map(([difficulty, states]: [string, StateRequirement[]]) => (
                  <div key={difficulty} className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Badge className={getDifficultyColor(difficulty)}>
                        {difficulty}
                      </Badge>
                      {states.length} States
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {states.map((state) => (
                        <Card key={state.stateCode} className="hover:shadow-lg transition-shadow cursor-pointer"
                              onClick={() => setSelectedState(state.stateCode)}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center justify-between">
                              {state.state}
                              <Badge variant="outline">{state.stateCode}</Badge>
                            </CardTitle>
                            <CardDescription>{state.authority}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-gray-500" />
                              {state.registration.processingTime}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="h-4 w-4 text-gray-500" />
                              Inspection: ${state.registration.estimatedCost.inspection}
                            </div>
                            <div className="text-sm text-gray-600">
                              {state.registration.inspectionType}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Detailed Requirements Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="state-select">Select State for Detailed Requirements</Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a state" />
                </SelectTrigger>
                <SelectContent>
                  {statesData?.statesByDifficulty && Object.values(statesData.statesByDifficulty).flat().map((state: StateRequirement) => (
                    <SelectItem key={state.stateCode} value={state.stateCode}>
                      {state.state} ({state.stateCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedState && stateData && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {stateData.state} Registration Requirements
                      <Badge className={getDifficultyColor(stateData.registration.difficultyLevel)}>
                        {stateData.registration.difficultyLevel}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Authority: {stateData.authority} | Processing Time: {stateData.registration.processingTime}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Registration Process */}
                    <div>
                      <h4 className="font-semibold mb-3">Registration Process</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p><strong>Process:</strong> {stateData.registration.importedVehicleProcess}</p>
                        <p><strong>Inspection Type:</strong> {stateData.registration.inspectionType}</p>
                        <div className="flex items-center gap-2">
                          {stateData.registration.compliancePlateRequired ? 
                            <CheckCircle className="h-4 w-4 text-green-600" /> : 
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          }
                          <span>Compliance Plate Required</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {stateData.registration.engineeringCertificate ? 
                            <CheckCircle className="h-4 w-4 text-green-600" /> : 
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          }
                          <span>Engineering Certificate May Be Required</span>
                        </div>
                      </div>
                    </div>

                    {/* Estimated Costs */}
                    <div>
                      <h4 className="font-semibold mb-3">Estimated Costs</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">Inspection</div>
                          <div className="text-lg font-semibold">${stateData.registration.estimatedCost.inspection}</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">Registration</div>
                          <div className="text-lg font-semibold">${stateData.registration.estimatedCost.registration}</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">CTP Insurance</div>
                          <div className="text-lg font-semibold">${stateData.registration.estimatedCost.ctp}</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">Transfer Fee</div>
                          <div className="text-lg font-semibold">${stateData.registration.estimatedCost.transferFee}</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">Stamp Duty</div>
                          <div className="text-lg font-semibold">{stateData.registration.estimatedCost.stampDuty}% of value</div>
                        </div>
                      </div>
                    </div>

                    {/* Compliance Requirements */}
                    <div>
                      <h4 className="font-semibold mb-3">Compliance Requirements</h4>
                      <div className="space-y-3">
                        <div>
                          <strong>ADR Compliance:</strong> {stateData.compliance.adrCompliance}
                        </div>
                        <div>
                          <strong>Emission Standards:</strong> {stateData.compliance.emissionStandards}
                        </div>
                        <div>
                          <strong>Import Age Requirements:</strong> Minimum {stateData.compliance.importAge.minimum} years
                          {stateData.compliance.importAge.exemptions.length > 0 && (
                            <div className="text-sm text-gray-600 mt-1">
                              Exemptions: {stateData.compliance.importAge.exemptions.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Modifications */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <h5 className="font-medium text-green-700 mb-2">Allowed Modifications</h5>
                        <ul className="text-sm space-y-1">
                          {stateData.compliance.modifications.allowed.map((mod, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {mod}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-red-700 mb-2">Restricted Modifications</h5>
                        <ul className="text-sm space-y-1">
                          {stateData.compliance.modifications.restricted.map((mod, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <AlertTriangle className="h-3 w-3 text-red-600" />
                              {mod}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-orange-700 mb-2">Engineering Required</h5>
                        <ul className="text-sm space-y-1">
                          {stateData.compliance.modifications.engineeringRequired.map((mod, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Info className="h-3 w-3 text-orange-600" />
                              {mod}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Key Considerations */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-red-700 mb-2">Challenges</h5>
                        <ul className="text-sm space-y-1">
                          {stateData.considerations.challenges.map((challenge, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5" />
                              {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-green-700 mb-2">Advantages</h5>
                        <ul className="text-sm space-y-1">
                          {stateData.considerations.advantages.map((advantage, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
                              {advantage}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Expert Tips */}
                    <div>
                      <h5 className="font-medium text-blue-700 mb-2">Expert Tips</h5>
                      <ul className="text-sm space-y-2">
                        {stateData.considerations.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2 bg-blue-50 p-2 rounded">
                            <Info className="h-3 w-3 text-blue-600 mt-0.5" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Official Links */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">Official Resources</h5>
                      <a 
                        href={stateData.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        {stateData.authority} Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Cost Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>State Cost Comparison</CardTitle>
                <CardDescription>
                  Compare registration costs across all Australian states for your vehicle value
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="vehicle-value">Vehicle Value (AUD)</Label>
                    <Input
                      id="vehicle-value"
                      type="number"
                      value={vehicleValue}
                      onChange={(e) => setVehicleValue(e.target.value)}
                      placeholder="e.g. 45000"
                      min="1000"
                      max="1000000"
                    />
                  </div>
                  <Button 
                    onClick={handleCompareStates}
                    disabled={!vehicleValue || costComparisonMutation.isPending}
                  >
                    {costComparisonMutation.isPending ? "Calculating..." : "Compare States"}
                  </Button>
                </div>

                {costComparisonMutation.data && showComparison && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Cost Summary for ${parseInt(vehicleValue).toLocaleString()}</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <strong>Cheapest:</strong> {costComparisonMutation.data.cheapestState.state} 
                          (${costComparisonMutation.data.cheapestState.totalCost.toLocaleString()})
                        </div>
                        <div>
                          <strong>Most Expensive:</strong> {costComparisonMutation.data.mostExpensiveState.state}
                          (${costComparisonMutation.data.mostExpensiveState.totalCost.toLocaleString()})
                        </div>
                        <div>
                          <strong>Average:</strong> ${costComparisonMutation.data.averageCost.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {costComparisonMutation.data.states.map((state: StateComparison, index: number) => (
                        <div key={state.stateCode} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-semibold text-gray-500 w-8">
                              #{index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{state.state}</div>
                              <div className="text-sm text-gray-600 flex items-center gap-4">
                                <Badge className={getDifficultyColor(state.difficultyLevel)} variant="outline">
                                  {state.difficultyLevel}
                                </Badge>
                                <span>{state.processingTime}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-lg font-semibold">
                            ${state.totalCost.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Real Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-6">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Real-World Import Scenarios</h2>
              
              <div className="grid gap-6">
                {/* Camaro ZL1 Scenario */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800">Complex Case</Badge>
                      Chevrolet Camaro ZL1 - Exhaust Compliance
                    </CardTitle>
                    <CardDescription>
                      American muscle car with performance exhaust system compliance challenges
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <h4 className="font-semibold text-amber-800 mb-2">The Challenge</h4>
                      <p className="text-amber-700">
                        Owner imported a 2018 Camaro ZL1 with factory performance exhaust that exceeded Australian noise regulations. 
                        The compliance workshop had to install a quieter exhaust system to meet ADR standards for initial registration.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">The Solution</h4>
                      <ul className="text-blue-700 space-y-1">
                        <li>• Temporary compliant exhaust installed for registration ($1,200)</li>
                        <li>• Vehicle registered successfully in NSW</li>
                        <li>• Original performance exhaust reinstalled after registration ($800)</li>
                        <li>• Engineering certificate obtained for modification ($2,500)</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">Key Learnings</h4>
                      <ul className="text-green-700 space-y-1">
                        <li>• Factor in compliance modifications during import planning</li>
                        <li>• Budget extra $3,000-$5,000 for exhaust compliance issues</li>
                        <li>• Consider keeping original parts for reinstallation</li>
                        <li>• Engage automotive engineer early in the process</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Cobra Replica Scenario */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge className="bg-orange-100 text-orange-800">State Shopping</Badge>
                      AC Cobra Replica - Cross-State Registration
                    </CardTitle>
                    <CardDescription>
                      Kit car with compliance complications leading to interstate registration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <h4 className="font-semibold text-amber-800 mb-2">The Challenge</h4>
                      <p className="text-amber-700">
                        Owner attempted to register AC Cobra replica in South Australia but faced complications with 
                        exhaust noise levels, mirror placement, and seatbelt mounting points that didn't meet SA's strict interpretation of ADR requirements.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">The Solution</h4>
                      <ul className="text-blue-700 space-y-1">
                        <li>• Researched alternative state requirements</li>
                        <li>• Found Queensland had more flexible interpretation for replica vehicles</li>
                        <li>• Established temporary QLD address</li>
                        <li>• Successfully registered in QLD with minimal modifications</li>
                        <li>• Later transferred registration back to SA</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">Key Learnings</h4>
                      <ul className="text-green-700 space-y-1">
                        <li>• Research state-specific compliance interpretations before building/importing</li>
                        <li>• Some states are more flexible with replica and kit cars</li>
                        <li>• Interstate registration is a legitimate compliance strategy</li>
                        <li>• Factor in additional costs and time for cross-state registration</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* JDM Success Story */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Success Story</Badge>
                      Nissan Skyline GT-R R34 - Smooth Process
                    </CardTitle>
                    <CardDescription>
                      Well-planned JDM import with comprehensive preparation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">The Success</h4>
                      <p className="text-green-700">
                        Owner purchased a 1999 Nissan Skyline GT-R R34 V-Spec in Japan, used an experienced 
                        compliance workshop, and had all documentation ready before the vehicle arrived in Australia.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">What Went Right</h4>
                      <ul className="text-blue-700 space-y-1">
                        <li>• Vehicle was over 25 years old (import legal)</li>
                        <li>• Engaged RAW compliance workshop before purchase</li>
                        <li>• All Japanese export documentation was complete</li>
                        <li>• Vehicle required minimal modifications for compliance</li>
                        <li>• Registered in Victoria within 3 weeks of arrival</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-2">Total Costs Breakdown</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>Purchase Price: $65,000</div>
                        <div>Shipping: $3,200</div>
                        <div>Compliance: $4,500</div>
                        <div>Registration (VIC): $850</div>
                        <div>Import Duty (5%): $3,250</div>
                        <div>GST (10%): $6,500</div>
                        <div className="font-semibold col-span-2">Total: $83,300</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Data sourced from official Australian state transport authorities</p>
          <p>Last updated: December 2024 | Always verify current requirements with relevant authorities</p>
        </div>
      </div>
    </div>
  );
}