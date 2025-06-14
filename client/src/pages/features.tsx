import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Calculator, 
  TrendingUp, 
  Shield, 
  Clock, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Globe, 
  Brain, 
  BarChart3,
  Search,
  Play,
  Zap,
  Award,
  Target,
  Menu,
  X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logoPath from "@assets/circular imi logo (3).png";

const tools = [
  {
    name: "Import Cost Calculator",
    description: "Know exactly what you'll pay — instantly. Real-time calculations with government data and live shipping rates.",
    icon: Calculator,
    category: "Cost Analysis",
    highlight: "Most Popular",
    route: "/import-calculator"
  },
  {
    name: "True Cost Explorer",
    description: "Explore every dollar — from shipping to rego. Complete financial breakdown with no hidden surprises.",
    icon: TrendingUp,
    category: "Financial Planning",
    route: "/true-cost-explorer"
  },
  {
    name: "Import Timeline",
    description: "Never miss a step. Track the whole process with automated notifications and milestone tracking.",
    icon: Clock,
    category: "Project Management",
    route: "/import-timeline"
  },
  {
    name: "BuildReady™",
    description: "Get mod-ready with AI compliance planning. Smart recommendations for modifications and certifications.",
    icon: Shield,
    category: "Compliance",
    highlight: "AI Powered",
    route: "/build-comply"
  },
  {
    name: "AI Recommendations",
    description: "ML suggests vehicles based on your taste & goals. Personalized recommendations that learn your preferences.",
    icon: Brain,
    category: "AI Intelligence",
    highlight: "Game Changer",
    route: "/ai-recommendations"
  },
  {
    name: "Expert Vehicle Picks",
    description: "Top-tier picks from seasoned importers. Curated selections from industry professionals.",
    icon: Star,
    category: "Expert Curation",
    route: "/expert-picks"
  },
  {
    name: "Compliance Estimate",
    description: "Understand what it'll take to comply — before you buy. Detailed compliance roadmap and cost breakdown.",
    icon: Shield,
    category: "Compliance",
    route: "/compliance-estimate"
  },
  {
    name: "Mod Cost Estimator",
    description: "Add it all up — parts, labor, compliance. Complete modification cost calculator with real pricing data.",
    icon: Calculator,
    category: "Modification Planning",
    route: "/mod-cost-estimator"
  },
  {
    name: "Value Estimator",
    description: "Know market value, resale range, and dealer markup. ML-powered valuation using real market data.",
    icon: BarChart3,
    category: "Market Analysis",
    route: "/value-estimator"
  },
  {
    name: "Vehicle Lookup",
    description: "JDM, Muscle, Euro — everything you need to know. Comprehensive database with detailed specifications.",
    icon: Search,
    category: "Database Access",
    route: "/vehicle-lookup"
  },
  {
    name: "Registration Stats",
    description: "How rare is it? We'll show you where it's landed. Detailed registration data and rarity analysis.",
    icon: Users,
    category: "Market Intelligence",
    route: "/registration-stats"
  },
  {
    name: "Import Volume Dashboard",
    description: "What's trending? Know before the masses do. Real-time import volume tracking and trend analysis.",
    icon: TrendingUp,
    category: "Market Trends",
    route: "/import-volume-dashboard"
  },
  {
    name: "Auction Sample Explorer",
    description: "See what's sold, where, and for how much. Live auction data from major Japanese auction houses.",
    icon: Globe,
    category: "Auction Intelligence",
    route: "/auction-sample-explorer"
  },
  {
    name: "Personal Dashboard",
    description: "All your tools and workflows, in one place. Centralized control center for all your import projects.",
    icon: Target,
    category: "Management",
    route: "/importiq"
  }
];

export default function Features() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visibleTools, setVisibleTools] = useState<string[]>([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const toolId = entry.target.getAttribute('data-tool');
            if (toolId) {
              setVisibleTools(prev => {
                if (!prev.includes(toolId)) {
                  return [...prev, toolId];
                }
                return prev;
              });
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    // Delay to ensure elements are in DOM
    const timeoutId = setTimeout(() => {
      const toolElements = document.querySelectorAll('[data-tool]');
      toolElements.forEach(el => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

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
              <Link href="/features" className="text-amber-400 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Features</Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Pricing</Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Our Mission</Link>
              
              {/* Show different nav based on auth status */}
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Dashboard</Link>
                  <Link href="/affiliate-signup" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Refer & Earn</Link>
                  <Link href="/api/logout" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Logout</Link>
                </>
              ) : (
                <Button 
                  className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-2 rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                  onClick={() => window.location.href = '/subscribe'}
                >
                  Subscribe Now
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
                <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-300 py-3 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Home</Link>
                <Link href="/features" className="text-amber-400 py-3 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Features</Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors duration-300 py-3 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Pricing</Link>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors duration-300 py-3 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Our Mission</Link>
                
                {/* Show different mobile nav based on auth status */}
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-300 py-3 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Dashboard</Link>
                    <Link href="/affiliate-signup" className="text-gray-300 hover:text-white transition-colors duration-300 py-3 text-sm font-medium" onClick={() => window.scrollTo(0, 0)}>Refer & Earn</Link>
                    <Link href="/api/logout" className="text-gray-300 hover:text-white transition-colors duration-300 py-3 text-sm font-medium">Logout</Link>
                  </>
                ) : (
                  <Button 
                    className="bg-amber-400 hover:bg-amber-500 text-black w-full rounded-full mt-4 font-medium"
                    onClick={() => { setMobileMenuOpen(false); window.location.href = '/subscribe'; }}
                  >
                    Subscribe Now
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 tracking-tight leading-none">
            Import Smarter.
            <br />
            <span className="text-amber-400">Save Thousands.</span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            16 professional-grade tools worth $2,000+ individually. Get the complete vehicle import intelligence platform for just $97/month.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button 
              className="bg-amber-400 hover:bg-amber-500 text-black px-8 py-4 text-lg rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-xl"
              onClick={() => {
                if (isAuthenticated) {
                  window.location.href = '/subscribe';
                } else {
                  window.location.href = '/?trial=true';
                }
              }}
            >
              {isAuthenticated ? 'Subscribe Now' : 'Start 7-Day Free Trial'}
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-900 hover:bg-gray-800 hover:text-white px-8 py-4 text-lg rounded-full font-semibold">
              <Play className="h-5 w-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="text-gray-400 text-sm space-y-2">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              <span>Professional-grade tools</span>
              <span className="hidden sm:inline">•</span>
              <span>Real-time data integration</span>
              <span className="hidden sm:inline">•</span>
              <span>Comprehensive import intelligence</span>
            </div>
          </div>
        </div>
      </div>

      {/* Why ImportIQ Section */}
      <div className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8 tracking-tight">
              Why Import<span className="text-amber-400">IQ</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light">
              Built by industry experts for professionals who demand accuracy and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-amber-400 transition-all duration-500 group-hover:scale-110">
                <Shield className="h-10 w-10 text-amber-400 group-hover:text-black transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6">Industry-Leading Accuracy</h3>
              <p className="text-gray-300 leading-relaxed">
                Real-time data from government sources and industry databases ensures you get the most accurate calculations every time.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-amber-400 transition-all duration-500 group-hover:scale-110">
                <Brain className="h-10 w-10 text-amber-400 group-hover:text-black transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6">AI-Powered Insights</h3>
              <p className="text-gray-300 leading-relaxed">
                ML that learns what you want before you do. Advanced AI analyzes market trends and provides personalized recommendations.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-amber-400 transition-all duration-500 group-hover:scale-110">
                <Users className="h-10 w-10 text-amber-400 group-hover:text-black transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6">Expert Support</h3>
              <p className="text-gray-300 leading-relaxed">
                We've done this 1000+ times — now you don't have to. Access to industry experts and comprehensive guidance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8 tracking-tight">
              Professional-Grade Tools
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light">
              Every tool you need to import vehicles like a professional, powered by cutting-edge AI and real-time data.
            </p>
          </div>

          <div className="space-y-32">
            {tools.map((tool, index) => (
              <div
                key={tool.name}
                data-tool={tool.name}
                className={`flex flex-col lg:flex-row items-center gap-16 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                } ${
                  visibleTools.includes(tool.name) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-12'
                } transition-all duration-1000 ease-out`}
              >
                {/* Tool Visual */}
                <div className="flex-1 max-w-2xl">
                  <div className="bg-gray-900 rounded-3xl p-12 border border-gray-800 hover:border-amber-400/30 transition-all duration-500 group">
                    <div className="flex items-center justify-center h-64">
                      <tool.icon className="h-32 w-32 text-amber-400 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  </div>
                </div>

                {/* Tool Description */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="mb-4">
                    <Badge variant="secondary" className="bg-amber-400/10 text-amber-400 border-amber-400/20">
                      {tool.category}
                    </Badge>
                    {tool.highlight && (
                      <Badge variant="secondary" className="bg-green-400/10 text-green-400 border-green-400/20 ml-2">
                        {tool.highlight}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-3xl font-bold text-white mb-6">
                    {tool.name}
                  </h3>
                  
                  <p className="text-xl text-gray-300 leading-relaxed mb-8">
                    {tool.description}
                  </p>
                  
                  <Link href={tool.route}>
                    <Button className="bg-amber-400 hover:bg-amber-500 text-black px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105">
                      Try This Tool
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8 tracking-tight">
              Why Choose Import<span className="text-amber-400">IQ</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Compare our comprehensive platform against traditional methods
            </p>
          </div>

          <div className="bg-black rounded-3xl border border-gray-800 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
              {/* Header */}
              <div className="bg-gray-800 p-6 lg:p-8">
                <h3 className="text-lg font-semibold text-white">Features</h3>
              </div>
              <div className="bg-amber-400 p-6 lg:p-8 text-center">
                <h3 className="text-lg font-bold text-black">ImportIQ</h3>
              </div>
              <div className="bg-gray-800 p-6 lg:p-8 text-center">
                <h3 className="text-lg font-semibold text-white">Traditional Broker</h3>
              </div>
              <div className="bg-gray-800 p-6 lg:p-8 text-center">
                <h3 className="text-lg font-semibold text-white">DIY Import</h3>
              </div>

              {/* Rows */}
              {[
                { feature: "Cost Clarity", importiq: "✓ Real-time accurate", broker: "~ Estimates only", diy: "✗ Unknown costs" },
                { feature: "Data Access", importiq: "✓ Live gov sources", broker: "~ Limited access", diy: "✗ Manual research" },
                { feature: "AI Support", importiq: "✓ Advanced ML", broker: "✗ Human only", diy: "✗ No assistance" },
                { feature: "Compliance Tools", importiq: "✓ Automated checks", broker: "~ Basic guidance", diy: "✗ Figure it out" },
                { feature: "Community Perks", importiq: "✓ Expert network", broker: "~ Limited", diy: "✗ Alone" }
              ].map((row, index) => (
                <div key={row.feature} className={`contents ${index % 2 === 0 ? 'bg-gray-900/50' : ''}`}>
                  <div className="p-6 lg:p-8 border-t border-gray-800">
                    <span className="text-white font-medium">{row.feature}</span>
                  </div>
                  <div className="p-6 lg:p-8 border-t border-gray-800 text-center">
                    <span className="text-green-400 font-medium">{row.importiq}</span>
                  </div>
                  <div className="p-6 lg:p-8 border-t border-gray-800 text-center">
                    <span className="text-yellow-400 font-medium">{row.broker}</span>
                  </div>
                  <div className="p-6 lg:p-8 border-t border-gray-800 text-center">
                    <span className="text-red-400 font-medium">{row.diy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8 tracking-tight">
              Import Success Stories
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Real results from real importers using ImportIQ
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Michael R.",
                role: "JDM Enthusiast",
                content: "ImportIQ saved me $8,000 on hidden costs I never knew existed. The compliance tools alone paid for the subscription 10x over.",
                rating: 5
              },
              {
                name: "Sarah K.", 
                role: "Classic Car Collector",
                content: "Finally, accurate import calculations before I commit. No more surprise bills or compliance nightmares. This platform is a game-changer.",
                rating: 5
              },
              {
                name: "David L.",
                role: "Performance Tuner",
                content: "The AI recommendations found me the exact Skyline I was looking for at 30% below market rate. Worth every penny of the subscription.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-gray-900 border-gray-800 hover:border-amber-400/30 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Pricing Banner */}
      <div id="pricing" className="py-20 bg-gradient-to-br from-amber-400 to-yellow-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-black mb-6">
            Start Your 7-Day Free Trial
          </h2>
          <p className="text-xl text-amber-900 mb-8">
            $97/month — all 16 tools included
          </p>
          <Button className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-xl mb-4">
            Start Free Trial
          </Button>
          <p className="text-sm text-amber-800">
            Cancel anytime during your trial. No card required.
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
                <a href="/" className="text-gray-400 hover:text-amber-400 transition-colors block">Home</a>
                <a href="/features" className="text-gray-400 hover:text-amber-400 transition-colors block">Features</a>
                <a href="#pricing" className="text-gray-400 hover:text-amber-400 transition-colors block">Pricing</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-6">Company</h4>
              <div className="space-y-3 text-sm">
                <a href="/affiliate-signup" className="text-gray-400 hover:text-amber-400 transition-colors block">Partners</a>
                <a href="/about" className="text-gray-400 hover:text-amber-400 transition-colors block">Our Mission</a>
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