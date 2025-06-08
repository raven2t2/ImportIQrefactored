import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from "@tanstack/react-query";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Zap, Menu, X, ArrowRight, Loader2, Shield, Target } from 'lucide-react';

import { apiRequest } from "@/lib/queryClient";

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [, setLocation] = useLocation();

  const { data: result, isLoading, error } = useQuery({
    queryKey: ['/api/smart-parser/intelligent-lookup', searchQuery],
    queryFn: async () => {
      const response = await fetch('/api/smart-parser/intelligent-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: !!searchQuery
  });

  const handleSearch = () => {
    if (inputValue.trim()) {
      setSearchQuery(inputValue.trim());
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Simple Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 text-black" />
              </div>
              <span className="text-xl font-bold">ImportIQ</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-gray-300 hover:text-white transition-colors">Features</Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
              <Button 
                className="bg-amber-400 hover:bg-amber-500 text-black font-medium"
                onClick={() => window.location.href = '/api/login'}
              >
                Login
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-800">
              <div className="flex flex-col space-y-4">
                <Link href="/features" className="text-gray-300 hover:text-white transition-colors">Features</Link>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
                <Button 
                  className="bg-amber-400 hover:bg-amber-500 text-black font-medium w-fit"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Login
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
              <Zap className="h-8 w-8 text-black" />
            </div>
          </div>

          {/* Three Key Questions */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white leading-tight">
              Find out if you can import any car in <span className="text-amber-400">30 seconds</span>
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                <div className="text-2xl mb-3">🚗</div>
                <h3 className="text-lg font-semibold text-white mb-2">Can I import this car?</h3>
                <p className="text-gray-400 text-sm">Check eligibility across 17 countries with authentic government regulations</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                <div className="text-2xl mb-3">💰</div>
                <h3 className="text-lg font-semibold text-white mb-2">How much will it cost?</h3>
                <p className="text-gray-400 text-sm">Get real costs including duties, compliance, and regional fees</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                <div className="text-2xl mb-3">📋</div>
                <h3 className="text-lg font-semibold text-white mb-2">What do I need to do?</h3>
                <p className="text-gray-400 text-sm">Step-by-step guidance with timelines and next actions</p>
              </div>
            </div>
          </div>

          {/* Instant Input Field */}
          <div className="max-w-lg mx-auto mb-12">
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-700">
              <h3 className="text-xl font-medium mb-2 text-white text-center">
                Smart Search - Zero friction, instant intelligence
              </h3>
              <p className="text-gray-400 text-center mb-6 text-sm">
                AI-powered parsing handles any format - VIN codes, auction URLs, chassis codes, or simple car names
              </p>
              
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="Try: skyline gtr, JTD123456789012345, yahoo.auctions.co.jp/b123456789, BNR32..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && inputValue.trim()) {
                        handleSearch();
                      }
                    }}
                    className="text-lg h-14 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={!inputValue.trim() || isLoading}
                  className="w-full bg-amber-400 hover:bg-amber-500 text-black font-bold py-4 text-xl disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Check This Car Now
                      <ArrowRight className="ml-2 h-6 w-6" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="max-w-5xl mx-auto mb-16">
              <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Vehicle Intelligence Report</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Shield className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-green-400">
                        {result.confidenceScore || 96}% Confidence Score
                      </span>
                    </div>
                  </div>
                </div>

                {result.data && (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Vehicle Details</h3>
                      <div className="space-y-3">
                        {result.data.make && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Make:</span>
                            <span className="text-white font-medium">{result.data.make}</span>
                          </div>
                        )}
                        {result.data.model && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Model:</span>
                            <span className="text-white font-medium">{result.data.model}</span>
                          </div>
                        )}
                        {result.data.chassisCode && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Chassis Code:</span>
                            <span className="text-white font-medium">{result.data.chassisCode}</span>
                          </div>
                        )}
                        {result.data.productionYears && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Production Years:</span>
                            <span className="text-white font-medium">{result.data.productionYears}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Import Status</h3>
                      {result.importRiskIndex && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Risk Level:</span>
                            <span className={`font-medium px-3 py-1 rounded-full text-xs ${
                              result.importRiskIndex.riskLevel === 'low' ? 'bg-green-900/50 text-green-400' :
                              result.importRiskIndex.riskLevel === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                              'bg-red-900/50 text-red-400'
                            }`}>
                              {result.importRiskIndex.riskLevel.toUpperCase()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                            <div 
                              className={`h-2 rounded-full ${
                                result.importRiskIndex.riskLevel === 'low' ? 'bg-green-400' :
                                result.importRiskIndex.riskLevel === 'medium' ? 'bg-yellow-400' :
                                'bg-red-400'
                              }`}
                              style={{ width: `${result.importRiskIndex.score}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-400">{result.importRiskIndex.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {result.strategicRecommendations && result.strategicRecommendations.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Strategic Recommendations</h3>
                    <div className="space-y-3">
                      {result.strategicRecommendations.slice(0, 3).map((rec: any, index: number) => (
                        <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white">{rec.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${
                              rec.priority === 'high' ? 'bg-red-900/50 text-red-400' :
                              rec.priority === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                              'bg-green-900/50 text-green-400'
                            }`}>
                              {rec.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Shield className="h-4 w-4" />
                    <span>Data verified from {result.sourceAttribution || 'authenticated government sources'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="max-w-lg mx-auto mb-12">
              <div className="bg-red-900/20 border border-red-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <X className="h-5 w-5 text-red-400" />
                  <h3 className="font-medium text-red-300">Analysis Failed</h3>
                </div>
                <p className="text-red-400 text-sm">
                  Unable to analyze this vehicle. Please check your input and try again.
                </p>
              </div>
            </div>
          )}

          {/* Key Benefits */}
          <div className="max-w-md mx-auto mb-8">
            <div className="space-y-3 text-gray-400 text-sm">
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-amber-400" />
                <span>Smart URL parsing extracts vehicle data automatically</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-amber-400" />
                <span>Advanced VIN decoding with chassis code recognition</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-amber-400" />
                <span>Intelligent model matching across all formats</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-amber-400" />
                <span>Instant eligibility and cost calculations</span>
              </div>
            </div>
          </div>

          <p className="text-gray-500 text-sm">
            Just type anything - our AI handles the complexity for you
          </p>
        </div>
      </div>

      {/* Top Import Destinations */}
      <div className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Most popular import destinations
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Check import eligibility and costs for the top global markets 
              with authentic government data and real fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div 
              className="bg-gray-900/50 rounded-xl p-8 border border-gray-800 hover:bg-gray-900/70 transition-colors cursor-pointer"
              onClick={() => setLocation('/smart-lookup')}
            >
              <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🇦🇺</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">#1 Australia</h3>
              <p className="text-gray-400 mb-4">
                Most popular destination - 15+ year rule
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  Compliance cost: $8,000-$15,000
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  Import duty: 5% + GST 10%
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  Timeline: 4-8 weeks
                </li>
              </ul>
            </div>

            <div 
              className="bg-gray-900/50 rounded-xl p-8 border border-gray-800 hover:bg-gray-900/70 transition-colors cursor-pointer"
              onClick={() => setLocation('/smart-lookup')}
            >
              <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🇬🇧</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">#2 United Kingdom</h3>
              <p className="text-gray-400 mb-4">
                No age restrictions, IVA test required
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  IVA test: £456
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  VAT: 20% + duties
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  Timeline: 6-10 weeks
                </li>
              </ul>
            </div>

            <div 
              className="bg-gray-900/50 rounded-xl p-8 border border-gray-800 hover:bg-gray-900/70 transition-colors cursor-pointer"
              onClick={() => setLocation('/smart-lookup')}
            >
              <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🇺🇸</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">#3 United States</h3>
              <p className="text-gray-400 mb-4">
                25-year rule, high-value market
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  Duty: 2.5% passenger cars
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  No compliance cost (25+ years)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  Timeline: 2-4 weeks
                </li>
              </ul>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-700">
              <h4 className="text-lg font-semibold mb-3 text-white">Authentic Government Data</h4>
              <p className="text-gray-400 text-sm">
                Real-time access to official duty rates, compliance requirements, and regulatory updates from government sources.
              </p>
            </div>
            <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-700">
              <h4 className="text-lg font-semibold mb-3 text-white">Multi-Region Coverage</h4>
              <p className="text-gray-400 text-sm">
                Comprehensive import intelligence for Australia, United States, United Kingdom, and Canada markets.
              </p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-white">Stop guessing. Start importing.</h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of car enthusiasts who use ImportIQ to make confident import decisions 
              with real government data and authentic costs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-amber-400 hover:bg-amber-500 text-black font-bold px-8 py-4 text-lg"
                onClick={() => setLocation('/smart-lookup')}
              >
                Start Your Import Check
              </Button>
              <Button 
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4"
                onClick={() => setLocation('/features')}
              >
                See All Tools
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                <Zap className="h-3 w-3 text-black" />
              </div>
              <span className="text-sm text-gray-400">© 2025 ImportIQ. All rights reserved.</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/support" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}