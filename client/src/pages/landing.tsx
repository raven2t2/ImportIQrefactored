import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Calculator, Brain, Calendar, Settings, Star, Check, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-brand-gold to-amber-500 rounded-full shadow-2xl">
                <Zap className="h-10 w-10 text-white" />
              </div>
            </div>
            
            {/* Attention-Grabbing Headline */}
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-brand-gold to-amber-400 bg-clip-text text-transparent">
                ImportIQ
              </span>
            </h1>
            
            <div className="text-3xl md:text-4xl font-bold mb-4 text-gray-100">
              The $50,000+ Mistake Most Importers Make
            </div>
            
            <div className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
              They wing it with outdated calculators, miss compliance deadlines, and pay <em>thousands</em> in unexpected costs. 
              <span className="text-brand-gold font-semibold"> What if there was a smarter way?</span>
            </div>

            {/* Value Proposition */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-12 max-w-5xl mx-auto border border-white/20">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
                Meet the Import Intelligence Platform That Professionals Guard Like a Trade Secret
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-brand-gold mt-1 flex-shrink-0" />
                    <span className="text-gray-200"><strong>Vehicle Lookup + Auction Explorer:</strong> Decode any VIN or JDM chassis code instantly, see real Japanese auction prices from USS Tokyo, HAA Kobe, and 15+ auction houses</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-brand-gold mt-1 flex-shrink-0" />
                    <span className="text-gray-200"><strong>AI Import Assistant:</strong> Get instant answers to complex compliance questions that used to require expensive consultants</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-brand-gold mt-1 flex-shrink-0" />
                    <span className="text-gray-200"><strong>True Cost Explorer:</strong> See the REAL ownership costs over 3-5 years (insurance, rego, fuel, depreciation) before you buy</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-brand-gold mt-1 flex-shrink-0" />
                    <span className="text-gray-200"><strong>Timeline Simulator:</strong> Visual Gantt charts showing exactly when your car arrives, accounting for port delays and seasonal factors</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-brand-gold mt-1 flex-shrink-0" />
                    <span className="text-gray-200"><strong>Build & Comply:</strong> Plan modifications with state-specific compliance mapping and engineering requirements</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-brand-gold mt-1 flex-shrink-0" />
                    <span className="text-gray-200"><strong>Expert Picks:</strong> Pre-configured scenarios from professionals who've imported 500+ vehicles successfully</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-brand-gold mt-1 flex-shrink-0" />
                    <span className="text-gray-200"><strong>AI Market Intelligence:</strong> Real auction data analysis with investment potential forecasting</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Urgency & CTA */}
            <div className="bg-red-600/20 border border-red-400/30 rounded-xl p-6 mb-8 max-w-3xl mx-auto">
              <div className="text-red-300 font-semibold mb-2">⚠️ WARNING: Import Costs Are Rising</div>
              <div className="text-gray-300">
                Shipping rates up 40% this quarter. Compliance delays at all-time highs. 
                Smart importers are using every advantage available. Join them.
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Button 
                className="bg-gradient-to-r from-brand-gold to-amber-500 hover:from-amber-500 hover:to-brand-gold text-white px-12 py-4 text-xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-200"
                onClick={() => window.location.href = '/api/login'}
              >
                START FREE 14-DAY TRIAL
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-300">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                <span>14-Day Free Trial</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                <span>Instant Access</span>
              </div>
            </div>
            
            <div className="mt-8 text-gray-400 text-sm">
              Join 847 smart importers who stopped gambling with their investments
            </div>
          </div>
        </div>
      </div>

      {/* Problem/Solution Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Stop Losing Money On "Educated Guesses"
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Every import decision you make without complete information costs you money. Period. 
              <span className="font-semibold text-gray-900"> Here's what ImportIQ clients save on every single import:</span>
            </p>
          </div>

          {/* Savings Showcase */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">$3,200</div>
              <div className="text-sm text-green-700 font-medium">Average compliance cost savings</div>
              <div className="text-xs text-gray-600 mt-2">By knowing exact requirements upfront</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">6-8 weeks</div>
              <div className="text-sm text-blue-700 font-medium">Faster delivery times</div>
              <div className="text-xs text-gray-600 mt-2">With accurate timeline planning</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">$8,500</div>
              <div className="text-sm text-purple-700 font-medium">Hidden ownership cost visibility</div>
              <div className="text-xs text-gray-600 mt-2">Over 5-year ownership period</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              The Complete Import Intelligence Arsenal
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Six professional-grade tools that eliminate guesswork and maximize your ROI. 
              Used by importers who treat this as a business, not a hobby.
            </p>
          </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <Card className="border-2 border-brand-gold shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                  <Calculator className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">True Cost Explorer</CardTitle>
                  <CardDescription className="text-lg">The calculator that shows what dealerships don't want you to see</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="font-semibold text-blue-900 mb-2">Why This Matters:</div>
                  <div className="text-blue-800 text-sm">Most importers focus only on landed cost, then get hit with $15,000+ in unexpected ownership expenses. Our 5-year TCO analysis shows the real financial picture.</div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>Real insurance costs</strong> - Get accurate premiums for high-value imports before you buy</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>Registration complexity mapping</strong> - State-specific requirements and fees</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>Depreciation modeling</strong> - Investment vs liability classification</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>Maintenance cost projections</strong> - Parts availability and specialist labor rates</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-500 shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">AI Market Intelligence</CardTitle>
                  <CardDescription className="text-lg">Like having a professional buyer's agent who never sleeps</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="font-semibold text-purple-900 mb-2">Smart Vehicle Guidance:</div>
                  <div className="text-purple-800 text-sm">Get AI-powered recommendations based on your budget, preferences, and import goals to make smarter vehicle selection decisions.</div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>Market research guidance</strong> - Tips for evaluating vehicle values and trends</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>Vehicle recommendation engine</strong> - Smart suggestions based on your criteria</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>Personalized matching</strong> - Budget, use case, and experience level optimization</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>Smart timing guidance</strong> - Best practices for import planning</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-500 shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Import Timeline Simulator</CardTitle>
                  <CardDescription className="text-lg">Visual project management for your import journey</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="font-semibold text-green-900 mb-2">Plan Like a Professional:</div>
                  <div className="text-green-800 text-sm">No more calling every week asking "where's my car?" Get week-by-week visibility with buffer time for delays you didn't know existed.</div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>Port congestion modeling</strong> - Real delays based on current conditions</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>Seasonal adjustment factors</strong> - Holiday impacts and weather delays</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>Critical path analysis</strong> - Which delays actually matter</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>Action item scheduling</strong> - Never miss a compliance deadline</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-500 shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Build & Comply</CardTitle>
                  <CardDescription className="text-lg">Modification planning that prevents expensive mistakes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="font-semibold text-orange-900 mb-2">Avoid the $20,000 Compliance Trap:</div>
                  <div className="text-orange-800 text-sm">Many imports fail compliance due to modifications made overseas. Plan your build path before you buy to avoid costly reversions.</div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>State-specific compliance mapping</strong> - Requirements vary dramatically by state</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>Engineering certification paths</strong> - ICV vs RAWS route optimization</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>Modification cost estimating</strong> - Real workshop quotes and timelines</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>Risk assessment scoring</strong> - Compliance confidence ratings</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-gradient-to-br from-brand-gold to-amber-500 text-white border-0">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Expert Picks</CardTitle>
                  <CardDescription className="text-amber-100">Professional scenarios that actually work</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-white mr-2" />
                  <span className="text-amber-100">Battle-tested import strategies</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-white mr-2" />
                  <span className="text-amber-100">One-click calculator pre-fills</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-white mr-2" />
                  <span className="text-amber-100">Insider knowledge documentation</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">AI Import Assistant</CardTitle>
                  <CardDescription className="text-blue-100">Your personal compliance expert</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-white mr-2" />
                  <span className="text-blue-100">Instant compliance answers</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-white mr-2" />
                  <span className="text-blue-100">State-specific guidance</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-white mr-2" />
                  <span className="text-blue-100">24/7 availability</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Results That Speak Louder Than Claims
            </h2>
            <p className="text-xl text-gray-600">
              Real savings from real ImportIQ users who stopped gambling with their money
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">"Saved $12,400"</div>
              <div className="text-gray-600 text-sm mb-4">
                "Found compliance issues before shipping. ImportIQ timeline helped me avoid peak season delays."
              </div>
              <div className="text-xs text-gray-500">— Melbourne Importer</div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">"3 weeks faster"</div>
              <div className="text-gray-600 text-sm mb-4">
                "Timeline simulator was spot-on. Had compliance ready before the car arrived."
              </div>
              <div className="text-xs text-gray-500">— Sydney Business Owner</div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">"Best $97/month"</div>
              <div className="text-gray-600 text-sm mb-4">
                "Already saved 10x the subscription cost on my second import. The AI recommendations are unreal."
              </div>
              <div className="text-xs text-gray-500">— Perth Collector</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Choose Your Import Intelligence Level
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Professional-grade tools that pay for themselves on the first import. 
              <span className="text-brand-gold"> Most clients save 10x the subscription cost.</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <Card className="relative bg-white border-2 border-gray-200 shadow-xl">
              <CardHeader>
                <div className="text-center">
                  <CardTitle className="text-2xl text-gray-900 mb-2">Monthly</CardTitle>
                  <CardDescription className="text-gray-600">Perfect for testing the waters</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-8">
                  <div className="text-5xl font-bold text-gray-900 mb-2">$97</div>
                  <div className="text-gray-600">per month</div>
                  <div className="text-sm text-gray-500 mt-2">
                    Cancel anytime • Full access
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span>All 6 professional tools</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span>AI Import Assistant</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span>Expert Picks library</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span>Email reports & social sharing</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Start 14-Day Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Yearly Plan */}
            <Card className="relative bg-gradient-to-br from-brand-gold to-amber-500 text-white border-0 shadow-2xl transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-red-600 text-white px-4 py-1 text-sm font-bold">
                  SAVE $232
                </Badge>
              </div>
              <CardHeader>
                <div className="text-center">
                  <CardTitle className="text-2xl text-white mb-2">Yearly</CardTitle>
                  <CardDescription className="text-amber-100">For serious importers (Most Popular)</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-8">
                  <div className="text-lg text-amber-200 line-through mb-1">$1,164</div>
                  <div className="text-5xl font-bold text-white mb-2">$932</div>
                  <div className="text-amber-100">per year</div>
                  <div className="text-sm text-amber-200 mt-2">
                    Just $77.67/month • 20% savings
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-white mr-3" />
                    <span className="text-amber-100">Everything in Monthly</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-white mr-3" />
                    <span className="text-amber-100">30% Affiliate Commission</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-white mr-3" />
                    <span className="text-amber-100">Advanced market insights</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-white mr-3" />
                    <span className="text-amber-100">Early access to new tools</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-white mr-3" />
                    <span className="text-amber-100">VIP support channel</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-white text-brand-gold hover:bg-gray-100 font-bold"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Start Free Trial (Save $232)
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-white mb-4">
                🎯 30% Affiliate Program (Yearly Plans Only)
              </h3>
              <p className="text-gray-300 mb-4">
                Share ImportIQ results on social media and earn 30% commission on referrals. 
                Turn your import success into passive income.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-400 mr-2" />
                  <span className="text-gray-300">Share results to social media</span>
                </div>
                <div className="flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-400 mr-2" />
                  <span className="text-gray-300">Get trackable referral links</span>
                </div>
                <div className="flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-400 mr-2" />
                  <span className="text-gray-300">Earn $29+ per referral</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                <span>14-Day Free Trial</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                <span>Upgrade/Downgrade Anytime</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                <span>Cancel Within 30 Seconds</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Stop Gambling With Your Import Investments
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Every day you wait is another day of making decisions without complete information. 
            Your next import should be your most profitable. Make it happen.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
            <div className="text-red-800 font-semibold mb-2">🚨 Limited Time:</div>
            <div className="text-red-700">
              Import costs rising across all ports. Smart importers are locking in their strategies now 
              before Q2 shipping rate increases hit.
            </div>
          </div>

          <Button 
            className="bg-gradient-to-r from-brand-gold to-amber-500 hover:from-amber-500 hover:to-brand-gold text-white px-16 py-4 text-2xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-200"
            onClick={() => window.location.href = '/api/login'}
          >
            CLAIM YOUR FREE TRIAL NOW
            <ArrowRight className="ml-4 h-8 w-8" />
          </Button>
          
          <div className="mt-6 text-gray-500 text-sm">
            Join 847+ smart importers • No risk • Cancel anytime
          </div>
        </div>
      </div>
    </div>
  );
}