import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Calculator, Clock, Shield, Truck, FileText, TrendingUp, Star, Check, Zap, AlertCircle } from "lucide-react";
import EmailGate from "@/components/email-gate";
import { useQuery } from "@tanstack/react-query";

export default function ImportIQ() {
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; isReturning: boolean } | null>(null);

  // Handle email gate success
  const handleEmailGateSuccess = (userData: { name: string; email: string; isReturning: boolean }) => {
    setUserInfo(userData);
  };

  // Show email gate if user hasn't provided contact info yet
  if (!userInfo) {
    return (
      <EmailGate
        title="Start Your 14-Day ImportIQ Trial"
        description="The complete vehicle import intelligence platform. Get AI recommendations, cost calculators, compliance estimates, and mod planning tools - all in one place. No credit card required for your free trial."
        buttonText="Start Free Trial"
        onSuccess={handleEmailGateSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-brand-gold to-amber-500 rounded-xl">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ImportIQ</h1>
                <p className="text-sm text-gray-600">Complete Vehicle Import Intelligence Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <Clock className="h-3 w-3 mr-1" />
                14 Days Free Trial
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Welcome, {userInfo.name}</p>
                <p className="text-xs text-gray-600">{userInfo.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Import Vehicles Like a Pro
          </h2>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            From AI-powered vehicle recommendations to precise cost calculations - ImportIQ gives you the intelligence to make smart import decisions and maximize your ROI.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-600 mr-2" />
              <span>Real auction data</span>
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-600 mr-2" />
              <span>Accurate cost modeling</span>
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-600 mr-2" />
              <span>AI market insights</span>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Import Calculator */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link href="/import-calculator">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Calculator className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Import Cost Calculator</CardTitle>
                    <CardDescription>Precise landed cost calculations with regional freight</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                    <span>Real-time shipping rates from Japan & USA</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                    <span>Accurate duties, GST, LCT calculations</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                    <span>Regional freight adjustments by postcode</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                    <span>Service tier recommendations</span>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Calculate Import Costs
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* AI Recommendations */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link href="/ai-recommendations">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">AI Vehicle Recommendations</CardTitle>
                    <CardDescription>Smart vehicle matching based on market data</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                    <span>AI analysis of auction data & market trends</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                    <span>Investment potential forecasts</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                    <span>Personalized vehicle matching</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                    <span>Detailed pros/cons analysis</span>
                  </div>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Get AI Recommendations
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Compliance Estimator */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link href="/compliance-estimate">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Compliance Timeline</CardTitle>
                    <CardDescription>Accurate timeframes for vehicle compliance</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                    <span>AI-powered timeline predictions</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                    <span>Vehicle eligibility assessment</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                    <span>Complexity factor analysis</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                    <span>Workshop recommendations</span>
                  </div>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Estimate Compliance
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Mod Estimator */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link href="/mod-estimator">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Modification Planner</CardTitle>
                    <CardDescription>Stage-by-stage mod planning with cost estimates</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                    <span>Progressive modification stages</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                    <span>Cost estimates for each stage</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                    <span>Performance goal planning</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                    <span>Service tier matching</span>
                  </div>
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Plan Modifications
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Pricing Section */}
        <div className="text-center">
          <Card className="max-w-md mx-auto bg-gradient-to-br from-brand-gold to-amber-500 text-white">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <Star className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl text-white">ImportIQ Pro</CardTitle>
              <CardDescription className="text-amber-100">
                Full access to all tools and AI insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold mb-2">$97</div>
                <div className="text-amber-100">per month</div>
                <div className="text-sm text-amber-200 mt-2">
                  14-day free trial • No credit card required
                </div>
              </div>
              <div className="space-y-3 mb-6 text-left">
                <div className="flex items-center text-sm">
                  <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Unlimited import cost calculations</span>
                </div>
                <div className="flex items-center text-sm">
                  <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>AI vehicle recommendations</span>
                </div>
                <div className="flex items-center text-sm">
                  <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Compliance timeline estimates</span>
                </div>
                <div className="flex items-center text-sm">
                  <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Modification planning tools</span>
                </div>
                <div className="flex items-center text-sm">
                  <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Real-time market data access</span>
                </div>
                <div className="flex items-center text-sm">
                  <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Priority email support</span>
                </div>
              </div>
              <div className="text-center text-sm text-amber-200 bg-white/10 p-3 rounded-lg">
                <strong>Trial Active:</strong> You have full access to all ImportIQ tools for 14 days. 
                Explore everything risk-free.
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}