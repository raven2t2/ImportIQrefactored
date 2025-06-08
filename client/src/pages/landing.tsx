import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Check, Zap, Menu, X } from 'lucide-react';

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
              ImportIQ
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Calculate import costs, check compliance, and track your vehicle import journey.
          </p>

          {/* Region Selection */}
          <div className="mb-12">
            <h3 className="text-lg font-medium mb-6 text-white">Where are you importing to?</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-lg mx-auto">
              <Link href="/dashboard?region=AU">
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-amber-400 transition-all duration-200 hover:bg-gray-800 cursor-pointer">
                  <div className="text-2xl mb-2">🇦🇺</div>
                  <div className="text-white font-medium text-sm">Australia</div>
                </div>
              </Link>
              
              <Link href="/dashboard?region=US">
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-amber-400 transition-all duration-200 hover:bg-gray-800 cursor-pointer">
                  <div className="text-2xl mb-2">🇺🇸</div>
                  <div className="text-white font-medium text-sm">United States</div>
                </div>
              </Link>
              
              <Link href="/dashboard?region=UK">
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-amber-400 transition-all duration-200 hover:bg-gray-800 cursor-pointer">
                  <div className="text-2xl mb-2">🇬🇧</div>
                  <div className="text-white font-medium text-sm">United Kingdom</div>
                </div>
              </Link>
              
              <Link href="/dashboard?region=CA">
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-amber-400 transition-all duration-200 hover:bg-gray-800 cursor-pointer">
                  <div className="text-2xl mb-2">🇨🇦</div>
                  <div className="text-white font-medium text-sm">Canada</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Simple Benefits */}
          <div className="max-w-md mx-auto mb-8">
            <div className="space-y-3 text-gray-400 text-sm">
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-amber-400" />
                <span>Calculate import costs and duties</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-amber-400" />
                <span>Check vehicle compliance requirements</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-amber-400" />
                <span>Track your import timeline</span>
              </div>
            </div>
          </div>

          <p className="text-gray-500 text-sm">
            Select your region above to get started
          </p>
        </div>
      </div>

      {/* Business Value Section */}
      <div className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Power Your Import Business
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Professional import intelligence tools designed for automotive businesses, 
              dealers, freight forwarders, and customs brokers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🚗</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Import Dealers</h3>
              <p className="text-gray-400 mb-4">
                Provide instant quotes, check compliance, and track multiple imports simultaneously.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  Batch import calculations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  Client portal access
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  Profit margin analysis
                </li>
              </ul>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🏢</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Freight Forwarders</h3>
              <p className="text-gray-400 mb-4">
                Integrate compliance checking and cost estimation into your existing workflows.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  API integration
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  Automated reporting
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  Multi-region support
                </li>
              </ul>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">⚖️</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Customs Brokers</h3>
              <p className="text-gray-400 mb-4">
                Access comprehensive compliance data and documentation requirements.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  Real-time duty rates
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  Documentation checklists
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  Regulatory updates
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

          {/* CTA */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-white">Ready to scale your import business?</h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Access professional-grade import intelligence tools with authentic government data 
              and comprehensive compliance checking across multiple regions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-amber-400 hover:bg-amber-500 text-black font-medium px-8 py-3"
                onClick={() => window.location.href = '/api/login'}
              >
                Start Free Trial
              </Button>
              <Button 
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3"
                onClick={() => window.location.href = '/contact'}
              >
                Schedule Demo
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