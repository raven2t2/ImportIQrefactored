import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Calculator, 
  Car, 
  FileText, 
  TrendingUp, 
  Shield, 
  MapPin, 
  Gavel, 
  Scale, 
  Wrench, 
  BarChart3, 
  Globe,
  Crown,
  ArrowRight,
  CheckCircle,
  Clock,
  Menu,
  X
} from "lucide-react";
import logoPath from "@assets/circular imi logo (3).png";

// Tool Card Component
interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

const ToolCard = ({ title, description, icon, color, onClick }: ToolCardProps) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 group-hover:bg-blue-500",
    green: "bg-green-100 text-green-600 group-hover:bg-green-500", 
    purple: "bg-purple-100 text-purple-600 group-hover:bg-purple-500",
    orange: "bg-orange-100 text-orange-600 group-hover:bg-orange-500",
    teal: "bg-teal-100 text-teal-600 group-hover:bg-teal-500",
    emerald: "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500",
    cyan: "bg-cyan-100 text-cyan-600 group-hover:bg-cyan-500",
    rose: "bg-rose-100 text-rose-600 group-hover:bg-rose-500",
    yellow: "bg-yellow-100 text-yellow-600 group-hover:bg-yellow-500",
    indigo: "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-500",
    red: "bg-red-100 text-red-600 group-hover:bg-red-500",
    pink: "bg-pink-100 text-pink-600 group-hover:bg-pink-500",
    gray: "bg-gray-100 text-gray-600 group-hover:bg-gray-500",
    amber: "bg-amber-100 text-amber-600 group-hover:bg-amber-500"
  };

  const buttonClasses = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    purple: "bg-purple-600 hover:bg-purple-700", 
    orange: "bg-orange-600 hover:bg-orange-700",
    teal: "bg-teal-600 hover:bg-teal-700",
    emerald: "bg-emerald-600 hover:bg-emerald-700",
    cyan: "bg-cyan-600 hover:bg-cyan-700",
    rose: "bg-rose-600 hover:bg-rose-700",
    yellow: "bg-yellow-600 hover:bg-yellow-700",
    indigo: "bg-indigo-600 hover:bg-indigo-700",
    red: "bg-red-600 hover:bg-red-700",
    pink: "bg-pink-600 hover:bg-pink-700",
    gray: "bg-gray-600 hover:bg-gray-700",
    amber: "bg-amber-600 hover:bg-amber-700"
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-amber-400" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-12 h-12 ${colorClasses[color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center transition-colors`}>
            <div className="group-hover:text-white transition-colors">
              {icon}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{title}</h4>
          </div>
        </div>
        <p className="text-xs text-gray-600 mb-4">{description}</p>
        <Button className={`w-full ${buttonClasses[color as keyof typeof buttonClasses]} text-white text-xs`}>
          Open Tool
        </Button>
      </CardContent>
    </Card>
  );
};

export default function UserDashboard() {
  const { user, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation Menu */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src={logoPath} alt="ImportIQ" className="h-8 w-8" />
              <span className="text-xl font-bold text-gray-900">ImportIQ</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-amber-600 transition-colors">
                Home
              </Link>
              <Link href="/features" className="text-gray-700 hover:text-amber-600 transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-amber-600 transition-colors">
                Pricing
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-amber-600 transition-colors">
                Our Mission
              </Link>
              <Link href="/affiliate-signup" className="text-gray-700 hover:text-amber-600 transition-colors">
                Refer & Earn
              </Link>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg">
                Upgrade Now
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-amber-600">
                  Home
                </Link>
                <Link href="/features" className="block px-3 py-2 text-gray-700 hover:text-amber-600">
                  Features
                </Link>
                <Link href="/pricing" className="block px-3 py-2 text-gray-700 hover:text-amber-600">
                  Pricing
                </Link>
                <Link href="/about" className="block px-3 py-2 text-gray-700 hover:text-amber-600">
                  Our Mission
                </Link>
                <Link href="/affiliate-signup" className="block px-3 py-2 text-gray-700 hover:text-amber-600">
                  Refer & Earn
                </Link>
                <div className="px-3 py-2">
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-amber-500 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              ImportIQ Dashboard
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-4">
            Professional Vehicle Import Intelligence Platform
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
              <CheckCircle className="w-4 h-4 mr-1" />
              Premium Active
            </Badge>
            <Badge variant="outline" className="border-amber-200 text-amber-700">
              17 AI-Powered Tools
            </Badge>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          
          <ToolCard
            title="Live Market Data"
            description="Real-time auction listings from Japanese and US markets with authentic vehicle photos."
            icon={<Gavel className="h-6 w-6" />}
            color="amber"
            onClick={() => window.location.href = '/live-market-data'}
          />

          <ToolCard
            title="Import Calculator"
            description="Calculate total import costs with authentic Australian government duty rates and fees."
            icon={<Calculator className="h-6 w-6" />}
            color="blue"
            onClick={() => window.location.href = '/import-calculator'}
          />

          <ToolCard
            title="Vehicle Lookup"
            description="Comprehensive vehicle verification using official registry and compliance databases."
            icon={<Car className="h-6 w-6" />}
            color="green"
            onClick={() => window.location.href = '/vehicle-lookup'}
          />

          <ToolCard
            title="Compliance Checker"
            description="ADR compliance verification with official Australian Design Rules database."
            icon={<Shield className="h-6 w-6" />}
            color="purple"
            onClick={() => window.location.href = '/compliance-checker'}
          />

          <ToolCard
            title="Shipping Calculator"
            description="Real shipping costs between major ports using current freight rates."
            icon={<Globe className="h-6 w-6" />}
            color="orange"
            onClick={() => window.location.href = '/shipping-calculator'}
          />

          <ToolCard
            title="Market Intelligence"
            description="Live exchange rates and market trends from Reserve Bank of Australia."
            icon={<TrendingUp className="h-6 w-6" />}
            color="teal"
            onClick={() => window.location.href = '/market-intelligence'}
          />

          <ToolCard
            title="Auction Intelligence"
            description="Auction analysis and bidding strategies based on historical data."
            icon={<BarChart3 className="h-6 w-6" />}
            color="emerald"
            onClick={() => window.location.href = '/auction-intelligence'}
          />

          <ToolCard
            title="Insurance Estimator" 
            description="Calculate insurance costs for imported vehicles with major providers."
            icon={<Shield className="h-6 w-6" />}
            color="cyan"
            onClick={() => window.location.href = '/insurance-estimator'}
          />

          <ToolCard
            title="Legal Advisory"
            description="Legal compliance guidance for vehicle imports and modifications."
            icon={<Scale className="h-6 w-6" />}
            color="purple"
            onClick={() => window.location.href = '/legal-advisory'}
          />

          <ToolCard
            title="BuildReady"
            description="Modification compliance strategies and build planning assistance."
            icon={<Wrench className="h-6 w-6" />}
            color="orange"
            onClick={() => window.location.href = '/buildready'}
          />

          <ToolCard
            title="Registry Lookup"
            description="Vehicle registration verification using official state databases."
            icon={<FileText className="h-6 w-6" />}
            color="teal"
            onClick={() => window.location.href = '/registry-lookup'}
          />

          <ToolCard
            title="Documentation Assistant"
            description="Step-by-step guidance for import paperwork and customs forms."
            icon={<FileText className="h-6 w-6" />}
            color="rose"
            onClick={() => window.location.href = '/documentation-assistant'}
          />

          <ToolCard
            title="Value Estimator"
            description="Professional market valuation using authentic dealer, auction, and broker pricing data."
            icon={<Calculator className="h-6 w-6" />}
            color="green"
            onClick={() => window.location.href = '/value-estimator'}
          />

          <ToolCard
            title="ROI Calculator"
            description="Investment analysis and profit potential for imported vehicles."
            icon={<TrendingUp className="h-6 w-6" />}
            color="yellow"
            onClick={() => window.location.href = '/roi-calculator'}
          />

          <ToolCard
            title="State Requirements"
            description="State-specific registration and compliance requirements."
            icon={<MapPin className="h-6 w-6" />}
            color="indigo"
            onClick={() => window.location.href = '/state-requirements'}
          />

          <ToolCard
            title="Port Intelligence"
            description="Real-time port status and shipping schedules for major Australian ports."
            icon={<MapPin className="h-6 w-6" />}
            color="amber"
            onClick={() => window.location.href = '/port-intelligence'}
          />

          <ToolCard
            title="Import Timeline"
            description="Complete timeline and milestones for vehicle import process in Australia."
            icon={<Clock className="h-6 w-6" />}
            color="purple"
            onClick={() => window.location.href = '/import-timeline'}
          />



        </div>

        {/* Value Proposition */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-xl border border-amber-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium Tools for Serious Importers</h3>
            <p className="text-gray-700 mb-6 max-w-3xl mx-auto">
              Professional-grade tools delivering real value through authentic data sources. 
              Built for importers who demand accurate, actionable intelligence.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-amber-600 mb-2">$97/month</div>
                <div className="text-sm text-gray-600">$77 upgrade special during trial</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-600 mb-2">17 Tools</div>
                <div className="text-sm text-gray-600">AI-powered intelligence</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-600 mb-2">100% Authentic</div>
                <div className="text-sm text-gray-600">Government data sources</div>
              </div>
            </div>
            <div className="mt-8">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8"
                onClick={() => window.location.href = 'https://driveimmaculate.com'}
              >
                Visit Immaculate Imports
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}