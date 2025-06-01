import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Calculator, Brain, Calendar, Settings, Star, Check, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-brand-gold to-amber-500 rounded-xl">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              ImportIQ
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The complete vehicle import intelligence platform for Australia. 
              From AI recommendations to compliance clarity - everything you need to import like a professional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                className="bg-brand-gold hover:bg-amber-600 text-white px-8 py-3 text-lg"
                onClick={() => window.location.href = '/api/login'}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="px-8 py-3 text-lg">
                See How It Works
              </Button>
            </div>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Import Vehicles
          </h2>
          <p className="text-xl text-gray-600">
            Professional-grade tools that save you time, money, and headaches
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Import Cost Calculator</CardTitle>
                  <CardDescription>Precise landed cost calculations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Real-time shipping rates
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Accurate duties and taxes
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Regional freight adjustments
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>AI Vehicle Recommendations</CardTitle>
                  <CardDescription>Smart vehicle matching</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Market trend analysis
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Investment potential forecasts
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Personalized matching
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Import Timeline Simulator</CardTitle>
                  <CardDescription>Visual delivery tracking</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Port-specific processing
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Seasonal delay factors
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Week-by-week breakdown
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
                  <Settings className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle>Build & Comply</CardTitle>
                  <CardDescription>Modification compliance planning</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  State compliance requirements
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Engineering certificate paths
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Risk assessment
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 bg-brand-gold rounded-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>Expert Picks</CardTitle>
                  <CardDescription>Pre-configured scenarios</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Professional import strategies
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Instant calculator setup
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Proven scenarios
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>AI Import Assistant</CardTitle>
                  <CardDescription>Always-available guidance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Instant compliance answers
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  State-specific guidance
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  24/7 availability
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Start Your Free Trial Today
          </h2>
          <Card className="max-w-md mx-auto bg-gradient-to-br from-brand-gold to-amber-500 text-white">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <Star className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl text-white">ImportIQ Pro</CardTitle>
              <CardDescription className="text-amber-100">
                Complete import intelligence platform
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
              <Button 
                className="w-full bg-white text-brand-gold hover:bg-gray-100"
                onClick={() => window.location.href = '/api/login'}
              >
                Start Free Trial
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}