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
import { Settings, AlertTriangle, CheckCircle, AlertCircle, FileText, Shield, ArrowRight, Brain, Calendar, CreditCard, Save, Clock, DollarSign, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import logoPath from "@assets/circular imi logo (3).png";

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
    description: "Significant modification requiring extensive compliance",
    requirements: ["Engineering certificate", "Emissions testing", "ICV plate", "Brake upgrade may be required"]
  },
  engine: {
    name: "Engine Swap",
    risk: "red", 
    description: "Major modification requiring comprehensive approval",
    requirements: ["Full engineering report", "Emissions compliance", "ICV approval", "Weight distribution check"]
  },
  bodykit: {
    name: "Body Kit/Aero",
    risk: "yellow",
    description: "Moderate risk depending on extent",
    requirements: ["No sharp edges", "Pedestrian safety compliance", "Ground clearance maintained"]
  }
};

export default function BuildComply() {
  const [showResults, setShowResults] = useState(false);
  const [selectedMods, setSelectedMods] = useState<string[]>([]);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(buildComplySchema),
    defaultValues: {
      modifications: [],
      planType: "pre-reg"
    }
  });

  // Risk calculation functions
  const getRiskLevel = () => {
    const highRiskMods = ['turbo', 'engine'];
    const mediumRiskMods = ['suspension', 'exhaust', 'bodykit'];
    
    const hasHighRisk = selectedMods.some(mod => highRiskMods.includes(mod));
    const hasMediumRisk = selectedMods.some(mod => mediumRiskMods.includes(mod));
    
    if (hasHighRisk) return 'high';
    if (hasMediumRisk || selectedMods.length >= 3) return 'medium';
    return 'low';
  };

  const getRiskExplanation = () => {
    const riskLevel = getRiskLevel();
    
    if (riskLevel === 'high') {
      return `Your build includes engine modifications or forced induction which require comprehensive engineering certification and emissions testing. Multiple compliance checkpoints needed.`;
    } else if (riskLevel === 'medium') {
      return `Your modifications require engineering assessment and may need ICV approval. Standard compliance process with moderate documentation requirements.`;
    } else {
      return `Your selected modifications have minimal compliance requirements. Most can be completed with basic engineering sign-off or are considered legal modifications.`;
    }
  };

  const getEstimatedEngineeringCost = () => {
    let baseCost = 0;
    if (selectedMods.includes('turbo') || selectedMods.includes('engine')) baseCost += 3000;
    if (selectedMods.includes('suspension')) baseCost += 1000;
    if (selectedMods.includes('exhaust')) baseCost += 400;
    if (selectedMods.includes('bodykit')) baseCost += 800;
    if (selectedMods.includes('wheels')) baseCost += 100;
    
    return `${baseCost.toLocaleString()} - ${(baseCost * 1.5).toLocaleString()}`;
  };

  const getEstimatedTimeline = () => {
    const riskLevel = getRiskLevel();
    
    if (riskLevel === 'high') return '3-6 months';
    if (riskLevel === 'medium') return '6-12 weeks';
    return '2-8 weeks';
  };

  const getStrategicTips = () => {
    const riskLevel = getRiskLevel();
    const planType = watch("planType");
    const hasEngineWork = selectedMods.includes('turbo') || selectedMods.includes('engine');
    const hasSuspension = selectedMods.includes('suspension');
    const hasExhaust = selectedMods.includes('exhaust');
    
    const tips = [];

    // Registration timing strategy
    if (riskLevel === 'high' && planType === 'pre-reg') {
      tips.push({
        icon: "⚠️",
        title: "Consider Post-Registration Strategy",
        description: "High-risk modifications like engine work are often easier to approve after initial registration. Register the vehicle first, then modify.",
        type: "warning"
      });
    }

    // Modification order strategy
    if (hasSuspension && hasEngineWork) {
      tips.push({
        icon: "🔧",
        title: "Modification Order Matters",
        description: "Complete suspension work before engine modifications. This allows proper weight distribution calculations during engineering assessment.",
        type: "info"
      });
    }

    // Documentation strategy
    if (riskLevel === 'medium' || riskLevel === 'high') {
      tips.push({
        icon: "📋",
        title: "Pre-Approval Documentation",
        description: "Get engineering pre-approval quotes before purchasing parts. Some modifications may require specific brand/model components for compliance.",
        type: "info"
      });
    }

    // Cost-saving strategy
    if (selectedMods.length >= 3) {
      tips.push({
        icon: "💰",
        title: "Bundle Engineering Assessments",
        description: "Combine multiple modifications into a single engineering assessment to reduce overall compliance costs by 20-40%.",
        type: "success"
      });
    }

    // State-specific strategy
    const state = watch("state");
    if (state === 'qld' && hasEngineWork) {
      tips.push({
        icon: "🏛️",
        title: "Queensland Engine Work Tip",
        description: "QLD requires emissions testing for engine modifications. Book testing slots early as wait times can exceed 6 weeks.",
        type: "warning"
      });
    }

    // Exhaust strategy
    if (hasExhaust && riskLevel !== 'high') {
      tips.push({
        icon: "🔊",
        title: "Exhaust Compliance Strategy",
        description: "Install exhaust modifications early in the build process. Sound testing is required and some exhausts may need modification to pass ADR standards.",
        type: "info"
      });
    }

    return (
      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div key={index} className={`p-4 rounded-xl border ${
            tip.type === 'warning' ? 'bg-red-950/20 border-red-500/20' :
            tip.type === 'success' ? 'bg-green-950/20 border-green-500/20' :
            'bg-blue-950/20 border-blue-500/20'
          }`}>
            <div className="flex items-start">
              <div className="text-2xl mr-3 mt-1">{tip.icon}</div>
              <div className="flex-1">
                <h4 className="font-medium text-white mb-2">{tip.title}</h4>
                <p className="text-sm text-gray-300">{tip.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/build-comply", data);
      return response.json();
    },
    onSuccess: () => {
      setShowResults(true);
      toast({
        title: "Analysis Complete",
        description: "Your compliance strategy has been generated",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const saveToDashboard = useMutation({
    mutationFn: async () => {
      const reportData = {
        email: watch("email"),
        reportType: "compliance-report",
        reportTitle: `BuildReady Analysis - ${watch("vehicle")} (${watch("state")})`,
        reportData: {
          vehicle: watch("vehicle"),
          state: watch("state"),
          modifications: selectedMods,
          planType: watch("planType"),
          riskLevel: getRiskLevel(),
          estimatedCost: getEstimatedEngineeringCost(),
          timeline: getEstimatedTimeline(),
          generatedAt: new Date().toISOString()
        }
      };
      const response = await apiRequest("POST", "/api/save-report", reportData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Report Saved",
        description: "Compliance report saved to your dashboard",
      });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleModificationChange = (modId: string, checked: boolean) => {
    const newMods = checked 
      ? [...selectedMods, modId]
      : selectedMods.filter(id => id !== modId);
    
    setSelectedMods(newMods);
    setValue("modifications", newMods);
  };

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  // Custom validation to check if form is ready
  const isFormValid = () => {
    const watchedValues = watch();
    return (
      watchedValues.email &&
      watchedValues.vehicle &&
      watchedValues.state &&
      watchedValues.budget &&
      watchedValues.timeline &&
      selectedMods.length > 0
    );
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "green": return "bg-green-50 text-green-800 border-green-200";
      case "yellow": return "bg-amber-50 text-amber-800 border-amber-200";
      case "red": return "bg-red-50 text-red-800 border-red-200";
      default: return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "green": return <CheckCircle className="h-4 w-4" />;
      case "yellow": return <AlertCircle className="h-4 w-4" />;
      case "red": return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-gray-800/50 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <img src={logoPath} alt="Immaculate Imports" className="h-10 w-10" />
                <div className="text-2xl font-semibold text-white">
                  Import<span className="text-amber-400">IQ</span>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Home</Link>
                <Link href="/features" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Features</Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Pricing</Link>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Our Mission</Link>
                <Button className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-2 rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-xl">
                  Dashboard
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-12 pt-32">
          {/* Header */}
          <div className="mb-12">
            <Button 
              variant="ghost" 
              onClick={() => setShowResults(false)}
              className="mb-6 text-gray-400 hover:text-amber-400"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Form
            </Button>
            
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl mb-4">
                <Shield className="h-8 w-8 text-black" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                Compliance Strategy
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Your personalized roadmap for legal vehicle modification and registration
              </p>
            </div>
          </div>

          {/* Overall Risk Rating */}
          <div className="mb-8">
            <Card className={`border-2 ${
              getRiskLevel() === 'high' ? 'border-red-500/50 bg-red-950/20' :
              getRiskLevel() === 'medium' ? 'border-amber-500/50 bg-amber-950/20' :
              'border-green-500/50 bg-green-950/20'
            } backdrop-blur-sm`}>
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  {getRiskLevel() === 'high' ? (
                    <AlertTriangle className="h-12 w-12 text-red-400" />
                  ) : getRiskLevel() === 'medium' ? (
                    <AlertCircle className="h-12 w-12 text-amber-400" />
                  ) : (
                    <CheckCircle className="h-12 w-12 text-green-400" />
                  )}
                </div>
                
                <h2 className="text-3xl font-bold mb-4">
                  <span className={`${
                    getRiskLevel() === 'high' ? 'text-red-400' :
                    getRiskLevel() === 'medium' ? 'text-amber-400' :
                    'text-green-400'
                  }`}>
                    {getRiskLevel().toUpperCase()} RISK
                  </span>
                  <span className="text-white"> COMPLIANCE</span>
                </h2>
                
                <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
                  {getRiskExplanation()}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Engineering Cost</p>
                    <p className="text-xl font-semibold text-white">${getEstimatedEngineeringCost()}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Timeline</p>
                    <p className="text-xl font-semibold text-white">{getEstimatedTimeline()}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Modifications</p>
                    <p className="text-xl font-semibold text-white">{selectedMods.length} Selected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save to Dashboard Button */}
          <div className="mb-8 text-center">
            <Button
              onClick={() => saveToDashboard.mutate()}
              disabled={saveToDashboard.isPending}
              className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-medium"
            >
              {saveToDashboard.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save to Dashboard
                </>
              )}
            </Button>
          </div>

          {/* Strategic Compliance Tips */}
          <Card className="border border-blue-400/20 bg-blue-950/20 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-semibold text-white flex items-center">
                <Brain className="h-6 w-6 text-blue-400 mr-3" />
                Strategic Compliance Tips
              </CardTitle>
              <CardDescription className="text-gray-400">
                Smart approaches based on your risk profile and selected modifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getStrategicTips()}
            </CardContent>
          </Card>

          {/* Results Grid */}
          <div className="space-y-8">
            {/* Selected Modifications */}
            {selectedMods.length > 0 && (
              <Card className="border border-amber-400/20 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-semibold text-white">
                    Modification Analysis
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Compliance requirements for your selected modifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedMods.map((modId) => {
                    const mod = modificationData[modId as keyof typeof modificationData];
                    return (
                      <div key={modId} className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-white mb-2">
                              {mod.name}
                            </h3>
                            <p className="text-gray-400 mb-4">
                              {mod.description}
                            </p>
                          </div>
                          <Badge className={`ml-4 ${getRiskColor(mod.risk)}`}>
                            {getRiskIcon(mod.risk)}
                            <span className="ml-2 capitalize">{mod.risk} Risk</span>
                          </Badge>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-white mb-3">
                            Requirements:
                          </h4>
                          <ul className="space-y-2">
                            {mod.requirements.map((req, index) => (
                              <li key={index} className="flex items-start text-sm text-gray-400">
                                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Action Items */}
            <Card className="border border-amber-400/20 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-semibold text-white">
                  Next Steps
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Recommended actions to ensure compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center p-4 bg-amber-400/10 rounded-xl border border-amber-400/20">
                    <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center mr-4">
                      <span className="text-black text-sm font-medium">1</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">Document Requirements</h4>
                      <p className="text-sm text-gray-400">Gather all necessary documentation before starting modifications</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-amber-400/10 rounded-xl border border-amber-400/20">
                    <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center mr-4">
                      <span className="text-black text-sm font-medium">2</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">Find Certified Engineer</h4>
                      <p className="text-sm text-gray-400">Locate an approved automotive engineer in your state</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-amber-400/10 rounded-xl border border-amber-400/20">
                    <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center mr-4">
                      <span className="text-black text-sm font-medium">3</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">Plan Modifications</h4>
                      <p className="text-sm text-gray-400">Complete modifications in the correct order for inspection</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="border-0 bg-gradient-to-br from-amber-400 to-yellow-500 text-black">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to Start Your Build?</h3>
                <p className="text-black/80 mb-6 max-w-2xl mx-auto">
                  Get expert guidance throughout your compliance journey with our professional consultation services.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="bg-black text-amber-400 hover:bg-gray-900 font-medium"
                    onClick={() => window.location.href = '/booking-calendar'}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Consultation
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-black/30 text-black hover:bg-black/10 font-medium"
                    onClick={() => window.open('https://driveimmaculate.com/compliance-guide/', '_blank')}
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Download Guide
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-gray-800/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src={logoPath} alt="Immaculate Imports" className="h-10 w-10" />
              <div className="text-2xl font-semibold text-white">
                Import<span className="text-amber-400">IQ</span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Home</Link>
              <Link href="/features" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Features</Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Pricing</Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Our Mission</Link>
              <Button className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-2 rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-xl">
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 pt-32">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl mb-6">
            <Settings className="h-8 w-8 text-black" />
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent mb-4">
            BuildReady
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get a personalized compliance strategy for your vehicle modifications before you start building
          </p>
        </div>

        {/* Main Form */}
        <Card className="border border-amber-400/20 bg-gray-900/50 backdrop-blur-sm">
          <CardHeader className="pb-8">
            <CardTitle className="text-2xl font-semibold text-white">
              Vehicle & Modification Details
            </CardTitle>
            <CardDescription className="text-gray-400">
              Tell us about your project to receive tailored compliance guidance
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-white">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="your@email.com"
                      className="h-12 border-gray-600 focus:border-amber-400 bg-gray-800 text-white placeholder:text-gray-400"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-400">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicle" className="text-sm font-medium text-white">
                      Vehicle
                    </Label>
                    <Select onValueChange={(value) => setValue("vehicle", value)}>
                      <SelectTrigger className="h-12 border-gray-600 focus:border-amber-400 bg-gray-800 text-white">
                        <SelectValue placeholder="Select your vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="skyline-gtr">Nissan Skyline GT-R</SelectItem>
                        <SelectItem value="supra">Toyota Supra</SelectItem>
                        <SelectItem value="evo">Mitsubishi Evolution</SelectItem>
                        <SelectItem value="impreza-sti">Subaru Impreza STI</SelectItem>
                        <SelectItem value="rx7">Mazda RX-7</SelectItem>
                        <SelectItem value="silvia">Nissan Silvia</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.vehicle && (
                      <p className="text-sm text-red-400">{errors.vehicle.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium text-white">
                      State
                    </Label>
                    <Select onValueChange={(value) => setValue("state", value)}>
                      <SelectTrigger className="h-12 border-gray-600 focus:border-amber-400 bg-gray-800 text-white">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nsw">NSW</SelectItem>
                        <SelectItem value="vic">VIC</SelectItem>
                        <SelectItem value="qld">QLD</SelectItem>
                        <SelectItem value="wa">WA</SelectItem>
                        <SelectItem value="sa">SA</SelectItem>
                        <SelectItem value="tas">TAS</SelectItem>
                        <SelectItem value="act">ACT</SelectItem>
                        <SelectItem value="nt">NT</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.state && (
                      <p className="text-sm text-red-400">{errors.state.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-sm font-medium text-white">
                      Modification Budget
                    </Label>
                    <Select onValueChange={(value) => setValue("budget", value)}>
                      <SelectTrigger className="h-12 border-gray-600 focus:border-amber-400 bg-gray-800 text-white">
                        <SelectValue placeholder="Budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-5k">Under $5,000</SelectItem>
                        <SelectItem value="5k-15k">$5,000 - $15,000</SelectItem>
                        <SelectItem value="15k-30k">$15,000 - $30,000</SelectItem>
                        <SelectItem value="30k-50k">$30,000 - $50,000</SelectItem>
                        <SelectItem value="over-50k">Over $50,000</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.budget && (
                      <p className="text-sm text-red-400">{errors.budget.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeline" className="text-sm font-medium text-white">
                      Timeline
                    </Label>
                    <Select onValueChange={(value) => setValue("timeline", value)}>
                      <SelectTrigger className="h-12 border-gray-600 focus:border-amber-400 bg-gray-800 text-white">
                        <SelectValue placeholder="Project timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-3months">1-3 months</SelectItem>
                        <SelectItem value="3-6months">3-6 months</SelectItem>
                        <SelectItem value="6-12months">6-12 months</SelectItem>
                        <SelectItem value="over-12months">Over 12 months</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.timeline && (
                      <p className="text-sm text-red-400">{errors.timeline.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Planned Modifications */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Planned Modifications
                  </h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Select all modifications you're planning to help us assess compliance requirements
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(modificationData).map(([id, mod]) => (
                    <div key={id} className="relative">
                      <div className={`p-6 rounded-xl border transition-all cursor-pointer ${
                        selectedMods.includes(id) 
                          ? 'border-amber-400 bg-amber-400/5' 
                          : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id={id}
                              checked={selectedMods.includes(id)}
                              onCheckedChange={(checked) => handleModificationChange(id, checked as boolean)}
                              className="mt-1 h-4 w-4"
                            />
                            <div className="flex-1">
                              <label htmlFor={id} className="text-sm font-medium text-white cursor-pointer">
                                {mod.name}
                              </label>
                              <p className="text-xs text-gray-400 mt-1">
                                {mod.description}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${getRiskColor(mod.risk)} text-xs`}>
                            {getRiskIcon(mod.risk)}
                            <span className="ml-1 capitalize">{mod.risk}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan Type */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Compliance Strategy
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className={`p-6 rounded-xl border cursor-pointer transition-all ${
                    watch("planType") === "pre-reg" 
                      ? "border-amber-400 bg-amber-400/5"
                      : "border-gray-700 hover:border-gray-600"
                  }`} onClick={() => setValue("planType", "pre-reg")}>
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        {...register("planType")}
                        value="pre-reg"
                        className="mt-1"
                      />
                      <div>
                        <h4 className="font-medium text-white">Pre-Registration</h4>
                        <p className="text-sm text-gray-400 mt-1">
                          Plan compliance before vehicle registration (recommended)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-6 rounded-xl border cursor-pointer transition-all ${
                    watch("planType") === "post-reg" 
                      ? "border-amber-400 bg-amber-400/5"
                      : "border-gray-700 hover:border-gray-600"
                  }`} onClick={() => setValue("planType", "post-reg")}>
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        {...register("planType")}
                        value="post-reg"
                        className="mt-1"
                      />
                      <div>
                        <h4 className="font-medium text-white">Post-Registration</h4>
                        <p className="text-sm text-gray-400 mt-1">
                          Vehicle already registered, need modification compliance
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={mutation.isPending || !isFormValid()}
                  className="w-full h-14 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-medium text-lg rounded-xl shadow-lg"
                >
                  {mutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-3" />
                      Analyzing Compliance...
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-3" />
                      Generate Compliance Strategy
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}