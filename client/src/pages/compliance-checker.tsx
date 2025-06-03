import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Shield, CheckCircle, XCircle, AlertTriangle, Clock, Car, FileText, DollarSign, Calendar, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ComplianceResult {
  complianceData: {
    make: string;
    model: string;
    year: number;
    vin?: string;
    eligibilityStatus: 'sevs_eligible' | 'general_import' | 'ineligible' | 'requires_modification' | 'unknown';
    complianceDetails: {
      adr: {
        compliant: boolean;
        notes: string;
      };
      sevs: {
        eligible: boolean;
        status: string;
        notes: string;
      };
      importAge: {
        eligible: boolean;
        ageInYears: number;
        rule: string;
      };
    };
    modifications: {
      required: boolean;
      items: string[];
      estimatedCost: string;
    };
    sources: {
      infrastructure: string;
      sevs: string;
      lastChecked: string;
    };
  };
  guidance: string[];
  sources: any;
}

export default function ComplianceChecker() {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    vin: ''
  });
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const { toast } = useToast();

  const complianceMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/check-compliance', {
        make: data.make,
        model: data.model,
        year: parseInt(data.year),
        vin: data.vin || undefined
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Compliance Check Complete",
        description: "Vehicle compliance assessment completed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Compliance Check Failed",
        description: error.message || "Unable to check vehicle compliance",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.make || !formData.model || !formData.year) {
      toast({
        title: "Missing Information",
        description: "Please provide at least make, model, and year",
        variant: "destructive",
      });
      return;
    }
    complianceMutation.mutate(formData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sevs_eligible':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'general_import':
        return <CheckCircle className="h-6 w-6 text-blue-600" />;
      case 'ineligible':
        return <XCircle className="h-6 w-6 text-red-600" />;
      case 'requires_modification':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      default:
        return <Clock className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sevs_eligible':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'general_import':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'ineligible':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'requires_modification':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-red-500 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Vehicle Compliance Checker</h1>
                  <p className="text-sm text-gray-600">Verify import eligibility using Australian ADR and SEVS standards</p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/user-dashboard'}
              className="flex items-center space-x-2"
            >
              <Car className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="make">Make *</Label>
                    <Input
                      id="make"
                      value={formData.make}
                      onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                      placeholder="e.g., Toyota, Nissan, Honda"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="e.g., Skyline, Supra, NSX"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      min="1950"
                      max={new Date().getFullYear()}
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="e.g., 1995"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="vin">VIN (Optional)</Label>
                    <Input
                      id="vin"
                      value={formData.vin}
                      onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value.toUpperCase() }))}
                      placeholder="17-character VIN"
                      maxLength={17}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={complianceMutation.isPending}
                >
                  {complianceMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Checking Compliance...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Check Compliance
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Data Sources</h4>
                <p className="text-sm text-blue-700">
                  This tool uses authentic data from Australian Department of Infrastructure and SEVS 
                  (Specialist and Enthusiast Vehicle Scheme) databases to verify vehicle compliance with Australian import regulations.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {result ? (
            <div className="space-y-6">
              {/* Status Overview */}
              <Card className={`border-2 ${getStatusColor(result.complianceData.eligibilityStatus)}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.complianceData.eligibilityStatus)}
                      <div>
                        <h3 className="font-bold text-lg">
                          {result.complianceData.make} {result.complianceData.model} ({result.complianceData.year})
                        </h3>
                        <p className="text-sm font-medium capitalize">
                          {result.complianceData.eligibilityStatus.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {result.complianceData.complianceDetails.importAge.ageInYears} years old
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Compliance Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* ADR Compliance */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {result.complianceData.complianceDetails.adr.compliant ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-medium">Australian Design Rules (ADR)</h4>
                        <p className="text-sm text-gray-600">
                          {result.complianceData.complianceDetails.adr.notes}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* SEVS Eligibility */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {result.complianceData.complianceDetails.sevs.eligible ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-medium">SEVS (Specialist & Enthusiast Vehicle Scheme)</h4>
                        <p className="text-sm text-gray-600">
                          Status: {result.complianceData.complianceDetails.sevs.status}
                        </p>
                        <p className="text-sm text-gray-600">
                          {result.complianceData.complianceDetails.sevs.notes}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* 25-Year Rule */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {result.complianceData.complianceDetails.importAge.eligible ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-medium">25-Year Import Rule</h4>
                        <p className="text-sm text-gray-600">
                          Vehicle age: {result.complianceData.complianceDetails.importAge.ageInYears} years
                        </p>
                        <p className="text-sm text-gray-600">
                          {result.complianceData.complianceDetails.importAge.eligible 
                            ? "Eligible for import under 25-year exemption rule"
                            : `Eligible in ${25 - result.complianceData.complianceDetails.importAge.ageInYears} years`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Modifications Required */}
              {result.complianceData.modifications.required && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-orange-600" />
                      Required Modifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Estimated Cost:</span>
                        <Badge variant="outline" className="text-sm">
                          {result.complianceData.modifications.estimatedCost}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Required Modifications:</h4>
                        <ul className="space-y-1">
                          {result.complianceData.modifications.items.map((item, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Import Guidance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Import Guidance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.guidance.map((item, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Data Sources */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Official Data Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Infrastructure Dept: {result.complianceData.sources.infrastructure}</p>
                    <p>SEVS Database: {result.complianceData.sources.sevs}</p>
                    <p>Last Checked: {new Date(result.complianceData.sources.lastChecked).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="h-fit">
              <CardContent className="p-8 text-center">
                <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Vehicle Compliance Check
                </h3>
                <p className="text-gray-600 mb-4">
                  Enter vehicle information to check import compliance using official NHTSA and EPA data.
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>✓ Real-time NHTSA VIN decoder integration</p>
                  <p>✓ Official EPA emissions compliance</p>
                  <p>✓ 25-year import rule verification</p>
                  <p>✓ Modification cost estimates</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}