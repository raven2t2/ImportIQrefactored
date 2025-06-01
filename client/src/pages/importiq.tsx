import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Calculator, Clock, Shield, Truck, FileText, TrendingUp, Star, Check, Zap, AlertCircle, DollarSign, Calendar, Settings, Search } from "lucide-react";
import EmailGate from "@/components/email-gate";
import AIChatAssistant from "@/components/ai-chat-assistant";
import { useQuery } from "@tanstack/react-query";

export default function ImportIQ() {
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; isReturning: boolean } | null>(null);

  // Fetch trial status when user info is available
  const { data: trialStatus } = useQuery({
    queryKey: [`/api/trial-status/${userInfo?.email}`],
    enabled: !!userInfo?.email,
  });

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

  // Show trial expired message if trial is inactive
  if (trialStatus && !trialStatus.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-amber-500" />
            </div>
            <CardTitle className="text-2xl">Trial Expired</CardTitle>
            <CardDescription>
              Your 14-day ImportIQ trial has ended. Subscribe to continue accessing all tools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Ready to unlock the full power of ImportIQ?
              </p>
              <Button className="w-full bg-brand-gold hover:bg-amber-600 text-white">
                Subscribe for $97/month
              </Button>
              <p className="text-xs text-gray-500">
                Cancel anytime • Full access to all tools
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
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
              {trialStatus && trialStatus.isActive ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Clock className="h-3 w-3 mr-1" />
                  {trialStatus.daysRemaining} Days Remaining
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Trial Active
                </Badge>
              )}
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

        {/* Quick Access Tools */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/import-calculator">
            <Button className="w-full h-20 bg-blue-600 hover:bg-blue-700 flex flex-col items-center justify-center space-y-2">
              <Calculator className="h-6 w-6" />
              <span className="text-sm font-medium">Import Calculator</span>
            </Button>
          </Link>
          <Link href="/ai-recommendations">
            <Button className="w-full h-20 bg-purple-600 hover:bg-purple-700 flex flex-col items-center justify-center space-y-2">
              <Brain className="h-6 w-6" />
              <span className="text-sm font-medium">AI Recommendations</span>
            </Button>
          </Link>
          <Link href="/true-cost-explorer">
            <Button className="w-full h-20 bg-green-600 hover:bg-green-700 flex flex-col items-center justify-center space-y-2">
              <DollarSign className="h-6 w-6" />
              <span className="text-sm font-medium">True Cost Explorer</span>
            </Button>
          </Link>
          <Link href="/vehicle-lookup">
            <Button className="w-full h-20 bg-orange-600 hover:bg-orange-700 flex flex-col items-center justify-center space-y-2">
              <Search className="h-6 w-6" />
              <span className="text-sm font-medium">Vehicle Lookup</span>
            </Button>
          </Link>
        </div>

        {/* Main Tools Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {/* Core Import Tools */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link href="/import-calculator">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Calculator className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Import Cost Calculator</CardTitle>
                    <CardDescription className="text-sm">Precise landed cost calculations</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-gray-600">
                    <Check className="h-3 w-3 text-green-600 mr-2" />
                    <span>Real-time shipping rates</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Check className="h-3 w-3 text-green-600 mr-2" />
                    <span>Regional freight adjustments</span>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link href="/true-cost-explorer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">True Cost Explorer</CardTitle>
                    <CardDescription className="text-sm">Real ownership cost analysis</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-gray-600">
                    <Check className="h-3 w-3 text-green-600 mr-2" />
                    <span>Multi-year ownership costs</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Check className="h-3 w-3 text-green-600 mr-2" />
                    <span>State-specific calculations</span>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link href="/import-timeline">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Import Timeline</CardTitle>
                    <CardDescription className="text-sm">Visual delivery timeline</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-gray-600">
                    <Check className="h-3 w-3 text-green-600 mr-2" />
                    <span>Port-specific processing</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Check className="h-3 w-3 text-green-600 mr-2" />
                    <span>Seasonal delay factors</span>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link href="/build-comply">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <Settings className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Build & Comply</CardTitle>
                    <CardDescription className="text-sm">Modification compliance planning</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-gray-600">
                    <Check className="h-3 w-3 text-green-600 mr-2" />
                    <span>State compliance requirements</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Check className="h-3 w-3 text-green-600 mr-2" />
                    <span>Engineering certificate paths</span>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link href="/ai-recommendations">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Brain className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AI Recommendations</CardTitle>
                    <CardDescription className="text-sm">Smart vehicle matching</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-gray-600">
                    <Check className="h-3 w-3 text-green-600 mr-2" />
                    <span>Market trend analysis</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Check className="h-3 w-3 text-green-600 mr-2" />
                    <span>Investment potential forecasts</span>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link href="/expert-picks">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-brand-gold rounded-lg group-hover:bg-amber-200 transition-colors">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Expert Picks</CardTitle>
                    <CardDescription className="text-sm">Pre-configured scenarios</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-gray-600">
                    <Check className="h-3 w-3 text-green-600 mr-2" />
                    <span>Professional import strategies</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Check className="h-3 w-3 text-green-600 mr-2" />
                    <span>Instant calculator setup</span>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* AI Assistant Promotion */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Import Assistant Available</h3>
                    <p className="text-sm text-gray-600">
                      Get instant answers about eligibility, compliance, and state requirements
                    </p>
                  </div>
                </div>
                <Badge className="bg-blue-600 text-white animate-pulse">
                  Ask Anything
                </Badge>
              </div>
            </CardContent>
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

      {/* AI Chat Assistant */}
      <AIChatAssistant 
        vehicleContext="ImportIQ Dashboard"
        userLocation="Australia"
      />
    </div>
  );
}