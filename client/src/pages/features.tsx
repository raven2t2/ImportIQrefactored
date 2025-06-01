import { useState, useEffect } from "react";
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
  Target
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
    highlight: "Most Popular"
  },
  {
    name: "True Cost Explorer",
    description: "Explore every dollar — from shipping to rego. Complete financial breakdown with no hidden surprises.",
    icon: TrendingUp,
    category: "Financial Planning"
  },
  {
    name: "Import Timeline",
    description: "Never miss a step. Track the whole process with automated notifications and milestone tracking.",
    icon: Clock,
    category: "Project Management"
  },
  {
    name: "BuildReady™",
    description: "Get mod-ready with AI compliance planning. Smart recommendations for modifications and certifications.",
    icon: Shield,
    category: "Compliance",
    highlight: "AI Powered"
  },
  {
    name: "AI Recommendations",
    description: "ML suggests vehicles based on your taste & goals. Personalized recommendations that learn from your preferences.",
    icon: Brain,
    category: "Intelligence",
    highlight: "Machine Learning"
  },
  {
    name: "Expert Vehicle Picks",
    description: "Top-tier picks from seasoned importers. Curated selections from industry professionals with proven track records.",
    icon: Star,
    category: "Expert Insights"
  },
  {
    name: "Compliance Estimate",
    description: "Understand what it'll take to comply — before you buy. Detailed compliance roadmap with cost projections.",
    icon: Award,
    category: "Legal Compliance"
  },
  {
    name: "Mod Cost Estimator",
    description: "Add it all up — parts, labor, compliance. Complete modification budget planning with supplier integration.",
    icon: Calculator,
    category: "Modification Planning"
  },
  {
    name: "Value Estimator",
    description: "Know market value, resale range, and dealer markup. ML-powered market analysis with trend predictions.",
    icon: BarChart3,
    category: "Market Analysis",
    highlight: "ML Powered"
  },
  {
    name: "Vehicle Lookup",
    description: "JDM, Muscle, Euro — everything you need to know. Comprehensive database with detailed specifications and history.",
    icon: Search,
    category: "Research Tools"
  },
  {
    name: "Registration Stats",
    description: "How rare is it? We'll show you where it's landed. Registration data and rarity analysis across Australia.",
    icon: BarChart3,
    category: "Market Intelligence"
  },
  {
    name: "Import Volume Dashboard",
    description: "What's trending? Know before the masses do. Real-time import trends and market movement analysis.",
    icon: TrendingUp,
    category: "Market Trends"
  },
  {
    name: "Auction Sample Explorer",
    description: "See what's sold, where, and for how much. Historical auction data with price trend analysis.",
    icon: Globe,
    category: "Auction Intelligence"
  },
  {
    name: "Personal Dashboard",
    description: "All your tools and workflows, in one place. Centralized command center for all your import projects.",
    icon: Users,
    category: "Management"
  }
];

const comparisonFeatures = [
  { feature: "Cost Transparency", importiq: true, broker: false, diy: false },
  { feature: "Real-time Data", importiq: true, broker: false, diy: false },
  { feature: "AI-Powered Insights", importiq: true, broker: false, diy: false },
  { feature: "Compliance Tools", importiq: true, broker: true, diy: false },
  { feature: "Expert Support", importiq: true, broker: true, diy: false },
  { feature: "Complete Control", importiq: true, broker: false, diy: true },
  { feature: "Time Efficiency", importiq: true, broker: false, diy: false },
];

export default function Features() {
  const [scrollY, setScrollY] = useState(0);
  const [visibleTools, setVisibleTools] = useState(new Set());

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleTools(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    const toolElements = document.querySelectorAll('[data-tool]');
    toolElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
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
              <a href="/" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Home</a>
              <a href="/features" className="text-amber-400 text-sm font-medium">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Pricing</a>
              <a href="/affiliate-signup" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Partners</a>
              <Button className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-2 rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-xl">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-transparent to-amber-400/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="mb-8">
            <div className="inline-flex items-center bg-amber-400/10 border border-amber-400/20 rounded-full px-8 py-3 text-amber-400 text-sm font-medium mb-8">
              <Brain className="h-4 w-4 mr-2" />
              14 AI & Machine Learning Powered Tools
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 tracking-tight leading-none">
            Import Smarter.
            <br />
            <span className="text-amber-400">Save Thousands.</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed font-light">
            14 professional-grade tools worth $2,000+ individually. Get the complete vehicle import intelligence platform for just $97/month.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              size="lg" 
              className="bg-amber-400 hover:bg-amber-500 text-black px-12 py-4 text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 font-medium"
            >
              Start 7-Day Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-gray-600 text-white hover:bg-gray-800 hover:border-gray-500 px-12 py-4 text-lg rounded-full transition-all duration-300 font-medium group"
            >
              <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-amber-400" />
              <span>Trusted by 10,000+ importers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-amber-400" />
              <span>$50M+ in savings generated</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-amber-400" />
              <span>Industry leading AI accuracy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Why ImportIQ Section */}
      <div className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight">
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
              <h3 className="text-2xl font-semibold text-white mb-6">Industry Leading Accuracy</h3>
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
                ML that learns what you want before you do. Advanced algorithms analyze market trends and provide personalized recommendations.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-amber-400 transition-all duration-500 group-hover:scale-110">
                <Users className="h-10 w-10 text-amber-400 group-hover:text-black transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6">Expert Support</h3>
              <p className="text-gray-300 leading-relaxed">
                We've done this 1000+ times — now you don't have to. Access to industry experts and comprehensive guidance throughout your journey.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Showcase */}
      <div className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight">
              14 Professional Tools.
              <br />
              <span className="text-amber-400">One Platform.</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light">
              Everything you need to import vehicles successfully, from ML-powered cost calculations to AI compliance guidance.
            </p>
          </div>

          <div className="space-y-32">
            {tools.map((tool, index) => (
              <div 
                key={tool.name}
                id={`tool-${index}`}
                data-tool
                className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                } ${
                  visibleTools.has(`tool-${index}`) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-16'
                } transition-all duration-1000 ease-out`}
              >
                {/* Tool Preview */}
                <div className={`${index % 2 === 1 ? 'lg:col-start-2' : ''} relative`}>
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 border border-gray-700 hover:border-amber-400/50 transition-all duration-500 group">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center group-hover:bg-amber-400 transition-all duration-500">
                        <tool.icon className="h-8 w-8 text-amber-400 group-hover:text-black transition-colors duration-500" />
                      </div>
                      {tool.highlight && (
                        <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/20">
                          {tool.highlight}
                        </Badge>
                      )}
                    </div>
                    <div className="h-48 bg-gray-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gray-750 transition-colors duration-500">
                      <div className="text-gray-500 text-center">
                        <tool.icon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Tool Preview</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                        {tool.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Tool Description */}
                <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''} space-y-6`}>
                  <div>
                    <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                      {tool.name}
                    </h3>
                    <p className="text-xl text-gray-300 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button className="bg-amber-400 hover:bg-amber-500 text-black px-8 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105">
                      Try This Tool
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 rounded-full font-medium">
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="py-20 bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
              How We Compare
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See why ImportIQ is the clear choice for serious importers
            </p>
          </div>

          <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">
            <div className="grid grid-cols-4 gap-4 p-6 border-b border-gray-800">
              <div></div>
              <div className="text-center">
                <div className="text-lg font-semibold text-white mb-2">ImportIQ</div>
                <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/20">
                  Recommended
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-gray-400">Traditional Broker</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-gray-400">DIY Approach</div>
              </div>
            </div>

            {comparisonFeatures.map((feature, index) => (
              <div key={feature.feature} className={`grid grid-cols-4 gap-4 p-6 ${index !== comparisonFeatures.length - 1 ? 'border-b border-gray-800' : ''}`}>
                <div className="font-medium text-white">{feature.feature}</div>
                <div className="text-center">
                  {feature.importiq ? (
                    <CheckCircle className="h-6 w-6 text-amber-400 mx-auto" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-gray-700 mx-auto"></div>
                  )}
                </div>
                <div className="text-center">
                  {feature.broker ? (
                    <CheckCircle className="h-6 w-6 text-green-400 mx-auto" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-gray-700 mx-auto"></div>
                  )}
                </div>
                <div className="text-center">
                  {feature.diy ? (
                    <CheckCircle className="h-6 w-6 text-green-400 mx-auto" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-gray-700 mx-auto"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
              Trusted by Professionals
            </h2>
            <p className="text-xl text-gray-300">Real results from real importers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "ImportIQ saved me $8,000 on my R34 GTR import. The AI recommendations were spot-on and the compliance tools made the whole process seamless.",
                author: "Michael Chen",
                title: "JDM Enthusiast",
                rating: 5
              },
              {
                quote: "As a professional importer, accuracy is everything. ImportIQ's real-time data and expert insights have become essential to my business.",
                author: "Sarah Williams",
                title: "Import Specialist",
                rating: 5
              },
              {
                quote: "The transparency and control ImportIQ provides is unmatched. I knew exactly what I was paying for every step of the way.",
                author: "David Rodriguez",
                title: "Car Collector",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-gray-900 border-gray-800 hover:border-amber-400/50 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-300 mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-gray-400 text-sm">{testimonial.title}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Pricing CTA */}
      <div className="py-20 bg-gradient-to-r from-amber-400/10 via-amber-400/5 to-amber-400/10 border-t border-amber-400/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8 tracking-tight">
            Start Your Free Trial Today
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            $97/month — all 14 tools included. Cancel anytime during your trial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-amber-400 hover:bg-amber-500 text-black px-12 py-4 text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 font-medium"
            >
              Start 7-Day Free Trial
            </Button>
            <p className="text-gray-400 text-sm">No card required</p>
          </div>
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
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Australia's premier vehicle import intelligence platform.
              </p>
              <div className="text-gray-400 text-sm">
                Brought to you by{" "}
                <a 
                  href="https://driveimmaculate.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Immaculate Imports
                </a>
              </div>
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
                <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors block">About</a>
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