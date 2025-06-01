import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Settings, AlertTriangle, CheckCircle, AlertCircle, FileText, Shield, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import CTASection from "@/components/cta-section";

const buildComplySchema = z.object({
  email: z.string().email("Valid email required"),
  vehicle: z.string().min(1, "Vehicle selection required"),
  state: z.string().min(1, "State selection required"),
  budget: z.string().min(1, "Budget range required"),
  timeline: z.string().min(1, "Timeline required"),
  modifications: z.array(z.string()),
  planType: z.enum(["pre-reg", "post-reg"]).default("pre-reg"),
});

type FormData = z.infer<typeof buildComplySchema>;

const modificationData = {
  wheels: {
    name: "Aftermarket Wheels",
    risk: "green",
    description: "Generally compliant if within size limits",
    requirements: ["Must not exceed +3 inch diameter", "Offset within ±25mm", "Load rating adequate"]
  },
  suspension: {
    name: "Lowered Suspension",
    risk: "yellow",
    description: "Engineering certificate required",
    requirements: ["Maximum 50mm drop", "Engineer certification", "ICV compliance", "Headlight aim check"]
  },
  exhaust: {
    name: "Aftermarket Exhaust",
    risk: "yellow",
    description: "Must meet noise regulations",
    requirements: ["ADR 83/00 compliance", "Sound level under 90dB", "Catalytic converter retained"]
  },
  turbo: {
    name: "Turbocharger/Supercharger",
    risk: "red",
    description: "Major modification requiring full compliance",
    requirements: ["VASS approval", "Engineer certification", "Emissions testing", "RAWS compliance"]
  },
  engine: {
    name: "Engine Swap",
    risk: "red",
    description: "Significant modification with extensive requirements",
    requirements: ["VASS Category SV", "Complete re-certification", "ADR compliance", "RAWS approval"]
  },
  brakes: {
    name: "Brake Upgrade",
    risk: "yellow",
    description: "Performance brakes need verification",
    requirements: ["Brake performance test", "ABS compatibility", "Engineer approval"]
  },
  body: {
    name: "Body Kit/Spoilers",
    risk: "green",
    description: "Visual modifications with minimal requirements",
    requirements: ["No sharp edges", "Secure mounting", "Ground clearance maintained"]
  },
  interior: {
    name: "Interior Modifications",
    risk: "green",
    description: "Usually compliant with basic safety checks",
    requirements: ["Seat mounting secure", "Airbag compatibility", "Seatbelt functionality"]
  }
};

const stateCompliance = {
  NSW: {
    name: "New South Wales",
    authority: "Transport for NSW",
    strictness: "High",
    notes: "Strict VSI requirements"
  },
  VIC: {
    name: "Victoria",
    authority: "VicRoads",
    strictness: "Medium",
    notes: "VIV process required"
  },
  QLD: {
    name: "Queensland",
    authority: "TMR",
    strictness: "Medium",
    notes: "QTI compliance needed"
  },
  SA: {
    name: "South Australia",
    authority: "DPTI",
    strictness: "High",
    notes: "Regency Park testing"
  },
  WA: {
    name: "Western Australia",
    authority: "DoT WA",
    strictness: "Medium",
    notes: "DVS inspection required"
  },
  TAS: {
    name: "Tasmania",
    authority: "Transport Tasmania",
    strictness: "Low",
    notes: "Simplified process"
  },
  NT: {
    name: "Northern Territory",
    authority: "DoI NT",
    strictness: "Low",
    notes: "Flexible requirements"
  },
  ACT: {
    name: "Australian Capital Territory",
    authority: "Access Canberra",
    strictness: "High",
    notes: "Follows NSW standards"
  }
};

export default function BuildComply() {
  const [results, setResults] = useState<any>(null);
  const [selectedMods, setSelectedMods] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(buildComplySchema),
    defaultValues: {
      vehicle: "",
      state: "",
      modifications: [],
    },
  });

  const handleModificationChange = (modId: string, checked: boolean) => {
    let newMods;
    if (checked) {
      newMods = [...selectedMods, modId];
    } else {
      newMods = selectedMods.filter(id => id !== modId);
    }
    setSelectedMods(newMods);
    form.setValue("modifications", newMods);
  };

  const onSubmit = (data: FormData) => {
    const selectedModData = data.modifications.map(modId => ({
      id: modId,
      ...modificationData[modId as keyof typeof modificationData]
    }));

    const state = stateCompliance[data.state as keyof typeof stateCompliance];
    
    // Calculate overall risk
    const riskLevels = selectedModData.map(mod => mod.risk);
    let overallRisk = "green";
    if (riskLevels.includes("red")) overallRisk = "red";
    else if (riskLevels.includes("yellow")) overallRisk = "yellow";

    // Generate compliance path
    const engineeringRequired = selectedModData.some(mod => mod.risk === "red" || mod.risk === "yellow");
    const vassRequired = selectedModData.some(mod => mod.risk === "red");

    const compliancePath = [
      "Vehicle inspection and documentation",
      engineeringRequired ? "Engineering certificate required" : null,
      vassRequired ? "VASS approval needed" : null,
      "State authority inspection",
      "Registration compliance certificate",
      "Road-ready certification"
    ].filter(Boolean);

    setResults({
      vehicle: data.vehicle,
      state,
      modifications: selectedModData,
      overallRisk,
      engineeringRequired,
      vassRequired,
      compliancePath,
      estimatedCost: vassRequired ? 8000 : engineeringRequired ? 3500 : 1200,
      estimatedTime: vassRequired ? "8-12 weeks" : engineeringRequired ? "4-6 weeks" : "2-3 weeks"
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "green": return "bg-green-100 text-green-800 border-green-200";
      case "yellow": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "red": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "green": return <CheckCircle className="h-4 w-4" />;
      case "yellow": return <AlertTriangle className="h-4 w-4" />;
      case "red": return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900" title="BuildReady™ shows you which modifications will pass compliance in your state — before you commit to costly changes.">BuildReady™</h1>
              <div className="text-sm text-gray-500 mb-2">
                Powered by ImportIQ's BuildReady™ Engine
              </div>
              <p className="text-gray-600">Design your build with clarity, compliance, and confidence.</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle & State Setup</CardTitle>
                <CardDescription>
                  Configure your build parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="vehicle">Vehicle Make/Model</Label>
                    <Input
                      id="vehicle"
                      {...form.register("vehicle")}
                      placeholder="e.g., Nissan Skyline R34 GT-R"
                    />
                  </div>

                  <div>
                    <Label>State/Territory</Label>
                    <Select onValueChange={(value) => form.setValue("state", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(stateCompliance).map(([code, state]) => (
                          <SelectItem key={code} value={code}>
                            {state.name} - {state.strictness} compliance
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Planned Modifications</Label>
                    <div className="space-y-3 mt-3">
                      {Object.entries(modificationData).map(([id, mod]) => (
                        <div key={id} className="flex items-start space-x-3">
                          <Checkbox
                            id={id}
                            checked={selectedMods.includes(id)}
                            onCheckedChange={(checked) => handleModificationChange(id, checked as boolean)}
                          />
                          <div className="flex-1 min-w-0">
                            <label
                              htmlFor={id}
                              className="text-sm font-medium text-gray-900 cursor-pointer"
                            >
                              {mod.name}
                            </label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={`text-xs ${getRiskColor(mod.risk)}`}>
                                {getRiskIcon(mod.risk)}
                                <span className="ml-1 capitalize">{mod.risk} Risk</span>
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{mod.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={!form.watch("vehicle") || !form.watch("state") || selectedMods.length === 0}
                  >
                    Generate BuildReady Plan
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          {results && (
            <div className="lg:col-span-2 space-y-6">
              {/* Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Your BuildReady Summary</span>
                  </CardTitle>
                  <CardDescription>
                    {results.vehicle} build plan for {results.state.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className={`p-4 rounded-lg border ${getRiskColor(results.overallRisk)}`}>
                      <div className="flex items-center space-x-2">
                        {getRiskIcon(results.overallRisk)}
                        <span className="font-medium capitalize">{results.overallRisk} Risk</span>
                      </div>
                      <div className="text-xs mt-1">Overall compliance risk</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="text-lg font-bold text-blue-600">
                        ${results.estimatedCost.toLocaleString()}
                      </div>
                      <div className="text-xs text-blue-700">Estimated compliance cost</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="text-lg font-bold text-green-600">
                        {results.estimatedTime}
                      </div>
                      <div className="text-xs text-green-700">Estimated timeline</div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <strong>Authority:</strong> {results.state.authority} • 
                    <strong> Strictness:</strong> {results.state.strictness} • 
                    <strong> Notes:</strong> {results.state.notes}
                  </div>
                </CardContent>
              </Card>

              {/* Selected Modifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Selected Modifications</CardTitle>
                  <CardDescription>
                    Requirements and compliance notes for each modification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.modifications.map((mod: any) => (
                      <div key={mod.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{mod.name}</h4>
                          <Badge className={getRiskColor(mod.risk)}>
                            {getRiskIcon(mod.risk)}
                            <span className="ml-1 capitalize">{mod.risk} Risk</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{mod.description}</p>
                        <div>
                          <div className="text-sm font-medium mb-2">Requirements:</div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {mod.requirements.map((req: string, index: number) => (
                              <li key={index} className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Path */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Compliance Pathway</span>
                  </CardTitle>
                  <CardDescription>
                    Step-by-step process to get your build road-ready
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.compliancePath.map((step: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-sm font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{step}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {results.vassRequired && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-red-900">VASS Approval Required</div>
                          <div className="text-sm text-red-700 mt-1">
                            Your modifications require Vehicle Assessment Signatory Scheme approval. 
                            This is a comprehensive process involving detailed engineering assessments.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {results.engineeringRequired && !results.vassRequired && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-yellow-900">Engineering Certificate Required</div>
                          <div className="text-sm text-yellow-700 mt-1">
                            Your modifications require professional engineering assessment and certification.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}