import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Calculator, TrendingUp, Shield, Clock, Users, ArrowRight, CheckCircle, Menu, X, Star, Globe, Zap, Brain, BarChart3, Package, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmailGate from "@/components/email-gate";
import { useAuth } from "@/hooks/useAuth";
import logoPath from "@assets/circular imi logo (3).png";

export default function ImportIQ() {
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Check if user has active trial
  const userEmail = localStorage.getItem('trial_user_email');
  const { data: trialStatus } = useQuery({
    queryKey: [`/api/trial-status/${userEmail}`],
    enabled: !!userEmail && !isAuthenticated,
  });

  const tools = [
    { name: "Import Cost Calculator", path: "/import-calculator", icon: Calculator, description: "Calculate total import costs with authentic Australian government duty rates and fees." },
    { name: "Vehicle Lookup", path: "/vehicle-lookup", icon: Globe, description: "Comprehensive vehicle verification using official registry and compliance databases." },
    { name: "Compliance Checker", path: "/compliance-checker", icon: Shield, description: "ADR compliance verification with official Australian Design Rules database." },
    { name: "Shipping Calculator", path: "/shipping-calculator", icon: Package, description: "Real shipping costs between major ports using current freight rates." },
    { name: "Market Intelligence", path: "/market-intelligence", icon: TrendingUp, description: "Live exchange rates and market trends from Reserve Bank of Australia." },
    { name: "Auction Intelligence", path: "/auction-intelligence", icon: BarChart3, description: "Auction analysis and bidding strategies based on historical data." },
    { name: "Insurance Estimator", path: "/insurance-estimator", icon: Shield, description: "Calculate insurance costs for imported vehicles with major providers." },
    { name: "Legal Advisory", path: "/legal-advisory", icon: Users, description: "Legal compliance guidance for vehicle imports and modifications." },
    { name: "BuildReady", path: "/buildready", icon: Settings, description: "Modification compliance strategies and build planning assistance." },
    { name: "Registry Lookup", path: "/registry-lookup", icon: Globe, description: "Vehicle registration verification using official state databases." },
    { name: "Documentation Assistant", path: "/documentation-assistant", icon: Users, description: "Step-by-step guidance for import paperwork and customs forms." },
    { name: "Value Estimator", path: "/value-estimator", icon: Calculator, description: "Professional market valuation using authentic dealer, auction, and broker pricing data." },
    { name: "ROI Calculator", path: "/roi-calculator", icon: TrendingUp, description: "Investment analysis and profit potential for imported vehicles." },
    { name: "State Requirements", path: "/state-requirements", icon: Users, description: "State-specific registration and compliance requirements." },
    { name: "Port Intelligence", path: "/port-intelligence", icon: Package, description: "Real-time port status and shipping schedules for major Australian ports." },
    { name: "Import Timeline", path: "/import-timeline", icon: Clock, description: "Complete timeline and milestones for vehicle import process in Australia." },
    { name: "US Market Intelligence", path: "/us-market-intelligence", icon: BarChart3, description: "Real-time market analysis using authentic AutoTrader data with price trends and comparisons." }
  ];

  const handleToolAccess = (toolName: string, toolPath: string) => {
    setSelectedTool(toolName);
    
    // Check if user is authenticated (logged in) or has active trial
    if (isAuthenticated || trialStatus?.isActive) {
      window.location.href = toolPath;
    } else {
      setShowEmailGate(true);
    }
  };

  const handleEmailSuccess = (userData: { name: string; email: string; isReturning: boolean }) => {
    setShowEmailGate(false);
    
    // Store user data for trial dashboard
    localStorage.setItem('trial_user_name', userData.name);
    localStorage.setItem('trial_user_email', userData.email);
    localStorage.setItem('trial_start_date', new Date().toISOString());
    
    // Redirect to trial dashboard with user data
    setTimeout(() => {
      window.location.href = `/trial-dashboard?name=${encodeURIComponent(userData.name)}&email=${encodeURIComponent(userData.email)}`;
    }, 500);
  };

  if (showEmailGate) {
    return (
      <EmailGate
        onSuccess={handleEmailSuccess}
        title={`Unlock ${selectedTool}`}
        description="Start your 7-day free trial to access all ImportIQ tools"
        buttonText="Start Free Trial"
      />
    );
  }

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
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-amber-400 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Home</Link>
              <Link href="/features" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Features</Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Pricing</Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Our Mission</Link>
              
              {/* Show different nav based on auth status */}
              {isAuthenticated || trialStatus?.isActive ? (
                <>
                  <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Dashboard</Link>
                  <Link href="/affiliate-signup" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Refer & Earn</Link>
                  <Link href="/api/logout" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Logout</Link>
                </>
              ) : (
                <Link href="/login" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Login</Link>
              )}
              
              {/* Show trial button only if not authenticated */}
              {!isAuthenticated && !trialStatus?.isActive && (
                <Button 
                  className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-2 rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                  onClick={() => {
                    setSelectedTool("ImportIQ Platform");
                    setShowEmailGate(true);
                  }}
                >
                  Start Free Trial
                </Button>
              )}
              
              {/* Show upgrade button for trial users */}
              {trialStatus?.isActive && !isAuthenticated && (
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                  onClick={() => window.location.href = '/subscribe'}
                >
                  Upgrade Now
                </Button>
              )}
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
                <Link href="/" className="text-amber-400 py-3 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Home</Link>
                <Link href="/features" className="text-gray-300 hover:text-white transition-colors duration-300 py-3 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Features</Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors duration-300 py-3 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Pricing</Link>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors duration-300 py-3 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Our Mission</Link>
                
                {/* Show different nav based on auth status */}
                {isAuthenticated || trialStatus?.isActive ? (
                  <>
                    <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-300 py-3 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Dashboard</Link>
                    <Link href="/affiliate-signup" className="text-gray-300 hover:text-white transition-colors duration-300 py-3 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Refer & Earn</Link>
                    <Link href="/api/logout" className="text-gray-300 hover:text-white transition-colors duration-300 py-3 text-sm font-medium">Logout</Link>
                  </>
                ) : (
                  <Link href="/login" className="text-gray-300 hover:text-white transition-colors duration-300 py-3 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Login</Link>
                )}
                
                {/* Show trial button only if not authenticated */}
                {!isAuthenticated && !trialStatus?.isActive && (
                  <Button 
                    className="bg-amber-400 hover:bg-amber-500 text-black w-full rounded-full mt-4 font-medium"
                    onClick={() => {
                      setSelectedTool("ImportIQ Platform");
                      setShowEmailGate(true);
                    }}
                  >
                    Start Free Trial
                  </Button>
                )}
                
                {/* Show upgrade button for trial users */}
                {trialStatus?.isActive && !isAuthenticated && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white w-full rounded-full mt-4 font-medium"
                    onClick={() => window.location.href = '/subscribe'}
                  >
                    Upgrade Now
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Trial Status Banner */}
      {trialStatus?.isActive && (
        <div className="bg-yellow-400/10 text-yellow-400 py-3 px-4 text-center text-sm font-medium mt-16 border-b border-yellow-400/20">
          Free Trial Active - {trialStatus.daysRemaining} days remaining
        </div>
      )}

      {/* Hero Section */}
      <div className={`${trialStatus?.isActive ? 'pt-8' : 'pt-32'} pb-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center bg-amber-400/10 border border-amber-400/20 rounded-full px-6 py-2 text-amber-400 text-sm font-medium">
              <Brain className="h-4 w-4 mr-2" />
              AI & Machine Learning Powered
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 tracking-tight leading-none">
            Import Smarter.
            <br />
            <span className="text-amber-400">Save Thousands.</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto mb-6 leading-relaxed font-light">
            16 professional-grade tools worth $2,000+ individually. Get the complete vehicle import intelligence platform for just $97/month.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-6">
            <Button 
              size="lg" 
              className="bg-amber-400 hover:bg-amber-500 text-black px-12 py-4 text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 font-semibold"
              onClick={() => {
                if (isAuthenticated) {
                  window.location.href = '/subscribe';
                } else {
                  setSelectedTool("ImportIQ Platform");
                  setShowEmailGate(true);
                }
              }}
            >
              {isAuthenticated ? 'Subscribe Now' : 'Start 7-Day Free Trial'}
            </Button>
            <Button 
              size="lg" 
              className="bg-gray-800 text-white hover:bg-gray-700 border-2 border-gray-600 px-12 py-4 text-lg rounded-full transition-all duration-300 font-medium"
            >
              Watch Demo
            </Button>
          </div>

          {/* Trust Elements */}
          <div className="mb-8">
            <p className="text-gray-400 text-sm">
              No credit card required • Cancel anytime during trial
            </p>
          </div>

          <div className="mb-16">
            <p className="text-gray-400 text-sm mb-2">Brought to you by</p>
            <a 
              href="https://driveimmaculate.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-amber-400 hover:text-amber-300 transition-colors duration-300 font-medium"
            >
              <img src={logoPath} alt="Immaculate Imports" className="h-6 w-6 mr-2" />
              Immaculate Imports
            </a>
          </div>

          {/* Benefits Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6 bg-gray-900/50 rounded-2xl border border-gray-800/50 shadow-lg">
              <div className="mb-4">
                <Package className="h-8 w-8 text-amber-400 mx-auto" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Real Cost Clarity</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Landed cost, GST, duty, LCT & compliance — all calculated in one click.
              </p>
            </div>
            
            <div className="text-center p-6 bg-gray-900/50 rounded-2xl border border-gray-800/50 shadow-lg">
              <div className="mb-4">
                <Settings className="h-8 w-8 text-amber-400 mx-auto" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Built for Compliance</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Understand what's legal, what needs certification, and what won't pass.
              </p>
            </div>
            
            <div className="text-center p-6 bg-gray-900/50 rounded-2xl border border-gray-800/50 shadow-lg">
              <div className="mb-4">
                <BarChart3 className="h-8 w-8 text-amber-400 mx-auto" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Powered by Importers</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Tools modeled after how pros plan — refined through real-world experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div id="tools" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight">
              17 AI-Powered Tools.
              <br />
              <span className="text-amber-400">One Platform.</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light">
              Everything you need to import vehicles successfully, from ML-powered cost calculations to AI compliance guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <Card 
                key={tool.name}
                className="group cursor-pointer bg-black border border-gray-800 hover:border-amber-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-400/10 hover:-translate-y-2 rounded-2xl overflow-hidden"
                onClick={() => handleToolAccess(tool.name, tool.path)}
              >
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-400 transition-all duration-500 group-hover:scale-110">
                      <tool.icon className="h-7 w-7 text-amber-400 group-hover:text-black transition-colors duration-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-amber-400 transition-colors duration-300">{tool.name}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{tool.description}</p>
                  </div>
                  <div className="flex items-center text-amber-400 text-sm font-medium group-hover:translate-x-2 transition-all duration-300">
                    Try it now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight">
              Why Import<span className="text-yellow-400">IQ</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light">
              Built by industry experts for professionals who demand accuracy and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-yellow-400 transition-all duration-500 group-hover:scale-110">
                <Shield className="h-10 w-10 text-yellow-400 group-hover:text-black transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6">Industry Leading Accuracy</h3>
              <p className="text-gray-300 leading-relaxed">
                Real-time data from government sources and industry databases ensures you get the most accurate calculations every time.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-yellow-400 transition-all duration-500 group-hover:scale-110">
                <Zap className="h-10 w-10 text-yellow-400 group-hover:text-black transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6">AI-Powered Insights</h3>
              <p className="text-gray-300 leading-relaxed">
                Advanced AI analyzes market trends and provides personalized recommendations for your import projects.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-yellow-400 transition-all duration-500 group-hover:scale-110">
                <Users className="h-10 w-10 text-yellow-400 group-hover:text-black transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6">Expert Support</h3>
              <p className="text-gray-300 leading-relaxed">
                Access to industry experts and comprehensive guidance throughout your entire import journey.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight">
            Save $5,000+ Per Import
          </h2>
          <p className="text-xl text-gray-300 mb-8 font-light">
            Members typically save more in their first month than a full year subscription costs.
          </p>
          <div className="bg-amber-400/10 border border-amber-400/20 rounded-2xl p-6 mb-16 max-w-2xl mx-auto">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-amber-400">$3,200</div>
                <div className="text-sm text-gray-300">Broker markup avoided</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400">$2,800</div>
                <div className="text-sm text-gray-300">Compliance savings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400">$4,500</div>
                <div className="text-sm text-gray-300">Better vehicle selection</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <div className="bg-black border border-gray-800 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Monthly</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-amber-400">$97</span>
                <span className="text-gray-300 ml-2 text-lg">/month</span>
              </div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-amber-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Access to all 14 AI tools</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-amber-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Unlimited calculations</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-amber-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">ML-powered recommendations</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-amber-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Expert support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-amber-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Cancel anytime</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 text-base rounded-full font-medium transition-all duration-300"
                onClick={() => {
                  if (isAuthenticated) {
                    window.location.href = '/subscribe';
                  } else {
                    setSelectedTool("ImportIQ Platform");
                    setShowEmailGate(true);
                  }
                }}
              >
                {isAuthenticated ? 'Subscribe Now' : 'Start 7-Day Free Trial'}
              </Button>
            </div>

            {/* Yearly Plan - Featured */}
            <div className="bg-gradient-to-br from-amber-400 to-yellow-500 border-0 rounded-3xl p-8 relative transform scale-105 shadow-2xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                  SAVE $232/YEAR
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-black mb-2">Yearly</h3>
              <p className="text-sm text-amber-900 mb-4">Most Popular Choice</p>
              
              <div className="mb-6">
                <div className="text-lg text-amber-800 line-through mb-1">$1,164</div>
                <span className="text-5xl font-bold text-black">$77</span>
                <span className="text-black ml-2 text-lg">/month</span>
                <div className="text-sm text-amber-900 mt-1">$932 billed annually</div>
              </div>
              
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-black mr-3 flex-shrink-0" />
                  <span className="text-amber-900 text-sm font-medium">Everything in Monthly</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-black mr-3 flex-shrink-0" />
                  <span className="text-amber-900 text-sm font-medium">20% discount (2+ months free)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-black mr-3 flex-shrink-0" />
                  <span className="text-amber-900 text-sm font-medium">Priority support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-black mr-3 flex-shrink-0" />
                  <span className="text-amber-900 text-sm font-medium">Early access to new tools</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-black mr-3 flex-shrink-0" />
                  <span className="text-amber-900 text-sm font-medium">Exclusive import guides & reports</span>
                </li>
              </ul>
              
              <Button 
                className="w-full bg-black hover:bg-gray-800 text-white py-3 text-base rounded-full font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                onClick={() => {
                  if (isAuthenticated) {
                    window.location.href = '/subscribe';
                  } else {
                    setSelectedTool("ImportIQ Platform");
                    setShowEmailGate(true);
                  }
                }}
              >
                {isAuthenticated ? 'Subscribe Now' : 'Start 7-Day Free Trial'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-semibold text-white mb-4">
                Import<span className="text-yellow-400">IQ</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Australia's premier vehicle import intelligence platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-6">Product</h4>
              <div className="space-y-3 text-sm">
                <a href="#tools" className="text-gray-400 hover:text-yellow-400 transition-colors block">Tools</a>
                <a href="#features" className="text-gray-400 hover:text-yellow-400 transition-colors block">Features</a>
                <a href="#pricing" className="text-gray-400 hover:text-yellow-400 transition-colors block">Pricing</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-6">Company</h4>
              <div className="space-y-3 text-sm">
                <a href="/affiliate-signup" className="text-gray-400 hover:text-yellow-400 transition-colors block">Partners</a>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors block">About</a>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors block">Contact</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-6">Support</h4>
              <div className="space-y-3 text-sm">
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors block">Help Center</a>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors block">Documentation</a>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors block">API</a>
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