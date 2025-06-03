import { useState } from "react";
import { Link } from "wouter";
import { Check, Calculator, TrendingUp, Shield, Clock, Users, ArrowRight, Menu, X, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import logoPath from "@assets/circular imi logo (3).png";

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, isLoading } = useAuth();
  
  // Debug logging
  console.log('Auth Debug:', { isAuthenticated, user, isLoading });

  const monthlyPrice = 97;
  const yearlyPrice = Math.round(monthlyPrice * 12 * 0.8); // 20% discount
  const yearlySavings = (monthlyPrice * 12) - yearlyPrice;

  return (
    <div className="min-h-screen bg-black">
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
              <Link href="/pricing" className="text-amber-400 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Pricing</Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Our Mission</Link>
              <Link href="/affiliate-signup" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Refer & Earn</Link>
              <Button 
                className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-2 rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                onClick={() => window.location.href = '/?trial=true'}
              >
                Start Free Trial
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-full text-white hover:bg-gray-800"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-6 border-t border-gray-800/50">
              <div className="flex flex-col space-y-4">
                <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-300 py-3 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Home</Link>
                <Link href="/features" className="text-gray-300 hover:text-white transition-colors duration-300 py-3 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Features</Link>
                <Link href="/pricing" className="text-amber-400 py-3 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Pricing</Link>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors duration-300 py-3 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Our Mission</Link>
                <Link href="/affiliate-signup" className="text-gray-300 hover:text-white transition-colors duration-300 py-3 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Refer & Earn</Link>
                <Button 
                  className="bg-amber-400 hover:bg-amber-500 text-black w-full rounded-full mt-4 font-medium"
                  onClick={() => { setMobileMenuOpen(false); window.location.href = '/?trial=true'; }}
                >
                  Start Free Trial
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 tracking-tight leading-none">
            Save $5,000+ 
            <br />
            <span className="text-amber-400">Per Import</span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Members typically save more in their first month than a full year subscription costs. 
            Get instant access to all 14 professional-grade tools.
          </p>

          {/* ROI Stats */}
          <div className="bg-amber-400/10 border border-amber-400/20 rounded-2xl p-8 mb-16 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-amber-400 mb-2">$3,200</div>
                <div className="text-gray-300">Broker markup avoided</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-400 mb-2">$2,800</div>
                <div className="text-gray-300">Compliance savings</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-400 mb-2">$4,500</div>
                <div className="text-gray-300">Better vehicle selection</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Toggle */}
      <div className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8 tracking-tight">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-300 mb-8 font-light">
              Start your 7-day free trial. Cancel anytime.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-gray-800 rounded-full p-1 mb-12">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  !isYearly 
                    ? 'bg-amber-400 text-black' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 relative ${
                  isYearly 
                    ? 'bg-amber-400 text-black' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Yearly
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5">
                  Save 20%
                </Badge>
              </button>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="max-w-md mx-auto">
            <Card className="bg-gray-800 border-amber-400/20 border-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-500"></div>
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/20 mb-4">
                    Most Popular
                  </Badge>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    ImportIQ Pro
                  </h3>
                  <p className="text-gray-400">
                    All 14 tools included
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-5xl font-bold text-white">
                      ${isYearly ? Math.round(yearlyPrice / 12) : monthlyPrice}
                    </span>
                    <span className="text-gray-400 ml-2">/month</span>
                  </div>
                  
                  {isYearly && (
                    <div className="text-sm">
                      <span className="text-gray-400 line-through">${monthlyPrice * 12}/year</span>
                      <span className="text-green-400 ml-2">Save ${yearlySavings}/year</span>
                    </div>
                  )}
                  
                  {!isYearly && (
                    <div className="text-sm text-gray-400">
                      Billed monthly
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full bg-amber-400 hover:bg-amber-500 text-black py-3 text-lg font-semibold mb-6 transition-all duration-300 hover:scale-105"
                  onClick={() => window.location.href = isAuthenticated ? '/subscribe' : '/?trial=true'}
                >
                  {isAuthenticated ? 'Subscribe Now' : 'Start 7-Day Free Trial'}
                </Button>

                <div className="text-xs text-gray-400 mb-8">
                  No credit card required • Cancel anytime
                </div>

                {/* Features List */}
                <div className="space-y-4 text-left">
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Import Cost Calculator with real-time rates</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">AI-powered vehicle recommendations</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">BuildReady™ compliance planning</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Complete auction data access</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Expert vehicle picks & recommendations</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Mod cost estimation & planning</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Import timeline & project management</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Market intelligence & trends</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Personal dashboard & project tracking</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Zap className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 font-medium">Priority support & updates</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8 tracking-tight">
              Why ImportIQ Pays for Itself
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light">
              Professional importers save thousands with better decisions and avoiding costly mistakes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-amber-400 transition-all duration-500 group-hover:scale-110">
                <Calculator className="h-10 w-10 text-amber-400 group-hover:text-black transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6">Avoid Broker Markups</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Skip the middleman and import directly. Our tools show you exactly what you're paying and why.
              </p>
              <div className="text-amber-400 font-bold text-lg">
                Average savings: $3,200
              </div>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-amber-400 transition-all duration-500 group-hover:scale-110">
                <Shield className="h-10 w-10 text-amber-400 group-hover:text-black transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6">Smart Compliance</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Get compliance right the first time. Avoid expensive re-work and delays.
              </p>
              <div className="text-amber-400 font-bold text-lg">
                Average savings: $2,800
              </div>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-amber-400 transition-all duration-500 group-hover:scale-110">
                <TrendingUp className="h-10 w-10 text-amber-400 group-hover:text-black transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6">Better Vehicle Selection</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                AI-powered recommendations help you find vehicles with better value and resale potential.
              </p>
              <div className="text-amber-400 font-bold text-lg">
                Average savings: $4,500
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="bg-amber-400/10 border border-amber-400/20 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Total Average Savings: $10,500
              </h3>
              <p className="text-gray-300 mb-6">
                ImportIQ pays for itself 108x over on your first import alone.
              </p>
              <Button className="bg-amber-400 hover:bg-amber-500 text-black px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105">
                Start Saving Today
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                What happens after my free trial?
              </h3>
              <p className="text-gray-300">
                Your 7-day free trial gives you full access to all tools. After the trial, you'll be charged based on your selected plan. You can cancel anytime with no questions asked.
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                How accurate are the cost calculations?
              </h3>
              <p className="text-gray-300">
                Our calculations use real-time data from government sources, shipping companies, and industry databases. We update rates daily to ensure accuracy within 2-3% of actual costs.
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                Do you support imports from all countries?
              </h3>
              <p className="text-gray-300">
                Currently, we support imports from Japan, USA, and UK to Australia. We're expanding to more countries based on member demand.
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                Is there customer support?
              </h3>
              <p className="text-gray-300">
                Yes! All members get priority email support. We typically respond within 4 hours during business days, often much faster.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 bg-gradient-to-br from-amber-400 to-yellow-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-black mb-6">
            Ready to Import Smarter?
          </h2>
          <p className="text-xl text-amber-900 mb-8">
            Join professionals who save thousands on every import
          </p>
          <Button className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-xl mb-4">
            Start Your Free Trial
          </Button>
          <p className="text-sm text-amber-800">
            7-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-semibold text-white mb-4">
                Import<span className="text-amber-400">IQ</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Australia's premier vehicle import intelligence platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-6">Product</h4>
              <div className="space-y-3 text-sm">
                <Link href="/" className="text-gray-400 hover:text-amber-400 transition-colors block">Home</Link>
                <Link href="/features" className="text-gray-400 hover:text-amber-400 transition-colors block">Features</Link>
                <Link href="/pricing" className="text-gray-400 hover:text-amber-400 transition-colors block">Pricing</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-6">Company</h4>
              <div className="space-y-3 text-sm">
                <Link href="/affiliate-signup" className="text-gray-400 hover:text-amber-400 transition-colors block">Partners</Link>
                <Link href="/about" className="text-gray-400 hover:text-amber-400 transition-colors block">Our Mission</Link>
                <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors block">Contact</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-6">Support</h4>
              <div className="space-y-3 text-sm">
                <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors block">Help Center</a>
                <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors block">Documentation</a>
                <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors block">API</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            © 2025 ImportIQ. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}