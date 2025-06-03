import { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  Calculator, 
  Search, 
  Shield, 
  Clock, 
  Users, 
  TrendingUp, 
  FileText, 
  Car, 
  Settings, 
  Crown,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Brain,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import logoPath from "@assets/circular imi logo (3).png";

export default function TrialDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Get user data from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name') || localStorage.getItem('trial_user_name') || "User";
    const email = urlParams.get('email') || localStorage.getItem('trial_user_email') || "";
    setUserName(name);
    setUserEmail(email);
  }, []);

  // Fetch real trial status from database
  const { data: trialStatus } = useQuery({
    queryKey: ['/api/trial-status', userEmail],
    enabled: !!userEmail,
    refetchInterval: 60000, // Refresh every minute
  });

  const trialDaysLeft = trialStatus?.daysRemaining || 7;

  const tools = [
    {
      id: 1,
      name: "Import Cost Calculator",
      description: "Calculate exact import costs with taxes, duties, and fees",
      icon: Calculator,
      path: "/import-calculator",
      category: "Financial",
      premium: false
    },
    {
      id: 2,
      name: "Vehicle Lookup",
      description: "Search Japanese and US auction data for any vehicle",
      icon: Search,
      path: "/vehicle-lookup",
      category: "Research",
      premium: false
    },
    {
      id: 3,
      name: "Compliance Check",
      description: "Verify import eligibility and compliance requirements",
      icon: Shield,
      path: "/compliance-estimate",
      category: "Legal",
      premium: false
    },
    {
      id: 4,
      name: "BuildReady",
      description: "AI-powered modification compliance advisor",
      icon: Settings,
      path: "/build-comply",
      category: "Planning",
      premium: true
    },
    {
      id: 5,
      name: "Market Watch",
      description: "Real-time pricing trends and market analytics",
      icon: TrendingUp,
      path: "/import-volume-dashboard",
      category: "Analytics",
      premium: true
    },
    {
      id: 6,
      name: "Import Timeline",
      description: "Track your import progress with real-time updates",
      icon: Clock,
      path: "/import-timeline",
      category: "Tracking",
      premium: false
    },
    {
      id: 7,
      name: "AI Recommendations",
      description: "ML-powered vehicle suggestions based on your preferences",
      icon: Brain,
      path: "/ai-recommendations",
      category: "Planning",
      premium: true
    },
    {
      id: 8,
      name: "Value Estimator",
      description: "ML market value analysis and pricing insights",
      icon: BarChart3,
      path: "/value-estimator",
      category: "Analytics",
      premium: true
    }
  ];

  const categories = ["All", "Financial", "Research", "Legal", "Planning", "Analytics", "Tracking", "Management"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredTools = selectedCategory === "All" 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Header */}
      <nav className="bg-black border-b border-gray-800 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <img 
                src={logoPath} 
                alt="ImportIQ" 
                className="h-8 w-8 rounded-full"
              />
              <span className="text-xl font-bold text-white">ImportIQ</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Home</Link>
              <Link href="/features" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Features</Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Pricing</Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Our Mission</Link>
              <Link href="/affiliate-signup" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Refer & Earn</Link>
              <Button className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-2 rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-xl">
                Upgrade Now
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-amber-400"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-gray-900 border-t border-gray-800">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link href="/" className="block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-300">Home</Link>
                <Link href="/features" className="block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-300">Features</Link>
                <Link href="/pricing" className="block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-300">Pricing</Link>
                <Link href="/about" className="block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-300">Our Mission</Link>
                <Link href="/affiliate-signup" className="block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-300">Refer & Earn</Link>
                <Button className="w-full mt-2 bg-amber-400 hover:bg-amber-500 text-black font-medium">
                  Upgrade Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Trial Status Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="h-5 w-5 text-white" />
            <span className="text-white font-medium">
              Free Trial Active - {trialDaysLeft} days remaining
            </span>
          </div>
          <Button 
            size="sm" 
            className="bg-white text-amber-600 hover:bg-gray-100 font-medium"
            onClick={() => window.location.href = '/pricing'}
          >
            Upgrade Now
          </Button>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-gray-900 to-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Welcome to ImportIQ, {userName}!
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Your 7-day free trial is now active. Explore all our premium tools and see why thousands of Australians trust ImportIQ for their vehicle imports.
            </p>
            
            {/* Trial Progress */}
            <div className="max-w-md mx-auto mb-8">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Trial Progress</span>
                <span>Day {7 - trialDaysLeft + 1} of 7</span>
              </div>
              <Progress value={(7 - trialDaysLeft + 1) / 7 * 100} className="h-2" />
              
              {/* Trial Member Exclusive Offer */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                <p className="text-amber-800 font-medium text-sm mb-1">
                  🎯 Trial Member Exclusive: First month only $77
                </p>
                <p className="text-amber-700 text-xs">
                  Subscribe during your trial and save $20 on your first month. This offer expires when your trial ends.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-amber-400 hover:bg-amber-500 text-black px-8 py-3 rounded-full font-medium"
                onClick={() => document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Tools
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3 rounded-full font-medium"
                onClick={() => window.location.href = '/dashboard'}
              >
                My Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div id="tools-section" className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              14 Powerful Tools at Your Fingertips
            </h2>
            <p className="text-gray-400 text-lg">
              Everything you need to import vehicles successfully
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full ${
                  selectedCategory === category 
                    ? "bg-amber-400 text-black hover:bg-amber-500" 
                    : "border-gray-600 text-gray-300 hover:bg-gray-800"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map((tool) => (
              <Card key={tool.id} className="bg-gray-900 border-gray-700 hover:border-amber-400 transition-all duration-300 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-amber-400/10 rounded-lg">
                      <tool.icon className="h-6 w-6 text-amber-400" />
                    </div>
                    {tool.premium && (
                      <Badge className="bg-amber-400 text-black text-xs">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-white text-lg group-hover:text-amber-400 transition-colors">
                    {tool.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400 mb-4">
                    {tool.description}
                  </CardDescription>
                  <Button 
                    className="w-full bg-amber-400 hover:bg-amber-500 text-black font-medium"
                    onClick={() => window.location.href = tool.path}
                  >
                    Launch Tool
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Choose ImportIQ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-amber-400/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">100% Compliant</h3>
              <p className="text-gray-400">
                All tools ensure your imports meet Australian regulations and safety standards.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-amber-400/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Save Time</h3>
              <p className="text-gray-400">
                Complete import calculations and compliance checks in minutes, not hours.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-amber-400/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Expert Support</h3>
              <p className="text-gray-400">
                Backed by Immaculate Imports' years of import experience and expertise.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Continue Your Import Journey
          </h2>
          <p className="text-xl text-amber-100 mb-4">
            Keep using all 14 premium tools beyond your trial period for just $97/month.
          </p>
          <div className="bg-white/10 rounded-lg p-4 mb-8 border border-white/20">
            <p className="text-white font-medium mb-2">
              Ready to continue? Subscribe for $97/month
            </p>
            <p className="text-amber-100 text-sm mb-2">
              Keep all 14 tools active beyond your trial period and continue your import success.
            </p>
            <p className="text-amber-200 text-xs">
              💡 Remember: Trial members get first month for $77 - save $20 when you subscribe during your trial
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-amber-600 hover:bg-gray-100 px-8 py-3 rounded-full font-bold"
              onClick={() => window.location.href = '/pricing'}
            >
              Subscribe - First Month $77
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10 px-8 py-3 rounded-full font-medium"
              onClick={() => window.location.href = '/affiliate-signup'}
            >
              Refer & Earn 20%
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12">
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
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <div className="space-y-2 text-sm">
                <Link href="/features" className="text-gray-400 hover:text-amber-400 transition-colors block">Features</Link>
                <Link href="/pricing" className="text-gray-400 hover:text-amber-400 transition-colors block">Pricing</Link>
                <Link href="/trial-dashboard" className="text-gray-400 hover:text-amber-400 transition-colors block">Dashboard</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <div className="space-y-2 text-sm">
                <Link href="/about" className="text-gray-400 hover:text-amber-400 transition-colors block">About</Link>
                <Link href="/affiliate-signup" className="text-gray-400 hover:text-amber-400 transition-colors block">Partners</Link>
                <a href="https://driveimmaculate.com" className="text-gray-400 hover:text-amber-400 transition-colors block">Contact</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <div className="space-y-2 text-sm">
                <a href="https://driveimmaculate.com" className="text-gray-400 hover:text-amber-400 transition-colors block">Help Center</a>
                <a href="https://driveimmaculate.com" className="text-gray-400 hover:text-amber-400 transition-colors block">Contact Support</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2025 ImportIQ by Immaculate Imports. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}