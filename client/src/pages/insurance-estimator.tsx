import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Calculator, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InsuranceQuote {
  provider: string;
  premium: {
    annual: number;
    monthly: number;
  };
  coverage: string;
  features: string[];
  excess: number;
  recommended: boolean;
}

interface InsuranceEstimate {
  quotes: InsuranceQuote[];
  factors: {
    vehicleAge: string;
    importStatus: string;
    location: string;
    riskLevel: string;
  };
  averageMarket: number;
  recommendations: string[];
  disclaimer: string;
}

export default function InsuranceEstimator() {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    value: "",
    location: "",
    driverAge: "",
    usageType: "personal"
  });

  const [estimateData, setEstimateData] = useState<InsuranceEstimate | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    if (!formData.make || !formData.model || !formData.year || !formData.value) {
      return;
    }

    setIsCalculating(true);
    
    try {
      const response = await fetch("/api/insurance-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      console.log("Insurance response data:", data);
      console.log("First quote premium:", data.quotes?.[0]?.premium);
      setEstimateData(data);
    } catch (error) {
      console.error("Insurance calculation error:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-100 dark:bg-cyan-900 rounded-full mb-4">
            <Shield className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Insurance Estimator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Calculate comprehensive insurance costs for imported vehicles with quotes from major Australian providers
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Vehicle Details
              </CardTitle>
              <CardDescription>
                Enter your vehicle information for accurate insurance quotes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    placeholder="e.g., Toyota"
                    value={formData.make}
                    onChange={(e) => handleInputChange("make", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    placeholder="e.g., Supra"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="e.g., 1995"
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Vehicle Value (AUD)</Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="e.g., 45000"
                    value={formData.value}
                    onChange={(e) => handleInputChange("value", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">State/Territory</Label>
                <Select onValueChange={(value) => handleInputChange("location", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your location" />
                  </SelectTrigger>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driverAge">Driver Age</Label>
                  <Input
                    id="driverAge"
                    type="number"
                    placeholder="e.g., 28"
                    value={formData.driverAge}
                    onChange={(e) => handleInputChange("driverAge", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usageType">Usage Type</Label>
                  <Select onValueChange={(value) => handleInputChange("usageType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select usage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal Use</SelectItem>
                      <SelectItem value="business">Business Use</SelectItem>
                      <SelectItem value="weekend">Weekend/Leisure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleCalculate}
                disabled={isCalculating || !formData.make || !formData.model || !formData.year || !formData.value}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
              >
                {isCalculating ? "Calculating..." : "Get Insurance Quotes"}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {estimateData && (
              <>
                {/* Market Overview */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Market Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Average Premium</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ${estimateData.averageMarket?.toLocaleString() || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">per year</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Risk Level</p>
                        <Badge variant={estimateData.factors.riskLevel === "Low" ? "default" : "secondary"}>
                          {estimateData.factors.riskLevel}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">Import vehicle</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Insurance Quotes */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Insurance Quotes</CardTitle>
                    <CardDescription>
                      Comprehensive insurance estimates from major Australian providers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {estimateData.quotes.map((quote, index) => (
                      <div key={index} className={`p-4 border rounded-lg ${quote.recommended ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold flex items-center gap-2">
                              {quote.provider}
                              {quote.recommended && <CheckCircle className="h-4 w-4 text-green-600" />}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{quote.coverage}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">${quote.premium?.annual?.toLocaleString() || 'N/A'}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">${quote.premium?.monthly || 'N/A'}/month</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          {quote.features.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        
                        <p className="text-xs text-gray-500">Excess: ${quote.excess.toLocaleString()}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recommendations */}
                {estimateData.recommendations.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Insurance Tips:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {estimateData.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm">{rec}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Disclaimer */}
                <div className="text-xs text-gray-500 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {estimateData.disclaimer}
                </div>
              </>
            )}

            {!estimateData && (
              <Card className="shadow-lg">
                <CardContent className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Ready to Calculate
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter your vehicle details to get comprehensive insurance quotes from major Australian providers
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}