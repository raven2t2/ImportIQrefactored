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
              <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
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
                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
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