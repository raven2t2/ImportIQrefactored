import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, DollarSign, Clock, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const expertScenarios = [
  {
    id: "r34-skyline",
    title: "Import an R34 Skyline GT-R",
    description: "The ultimate enthusiast import - complete roadmap to owning a legend",
    difficulty: "Expert",
    budget: "75000-120000",
    timeline: "12-16 weeks",
    highlights: ["Premium compliance path", "VIN authenticity check", "Engine bay inspection"],
    prefillData: {
      tool: "import-calculator",
      data: {
        vehiclePrice: 85000,
        vehicleMake: "Nissan",
        vehicleModel: "Skyline GT-R R34",
        vehicleYear: 1999,
        shippingOrigin: "japan",
        zipCode: "2000"
      }
    },
    tips: [
      "Verify chassis authenticity before purchase",
      "Budget extra for potential engine rebuild",
      "NSW has strictest compliance requirements"
    ]
  },
  {
    id: "hellcat-qld",
    title: "Get a Hellcat into QLD",
    description: "Navigate US muscle car import with Queensland's unique requirements",
    difficulty: "Advanced",
    budget: "120000-180000",
    timeline: "14-18 weeks",
    highlights: ["RAWS compliance", "Emissions modifications", "LHD to RHD conversion"],
    prefillData: {
      tool: "import-calculator",
      data: {
        vehiclePrice: 140000,
        vehicleMake: "Dodge",
        vehicleModel: "Challenger Hellcat",
        vehicleYear: 2019,
        shippingOrigin: "usa",
        zipCode: "4000"
      }
    },
    tips: [
      "Factor in LHD conversion costs (~$25K)",
      "Emissions compliance is critical",
      "QLD registration process is streamlined"
    ]
  },
  {
    id: "budget-import",
    title: "Budget Import Under $25K",
    description: "Maximum value path for first-time importers on a tight budget",
    difficulty: "Beginner",
    budget: "20000-25000",
    timeline: "8-12 weeks",
    highlights: ["Cost-effective compliance", "Minimal modifications", "Quick registration"],
    prefillData: {
      tool: "import-calculator",
      data: {
        vehiclePrice: 18000,
        vehicleMake: "Toyota",
        vehicleModel: "Chaser JZX100",
        vehicleYear: 1998,
        shippingOrigin: "japan",
        zipCode: "3000"
      }
    },
    tips: [
      "Focus on naturally aspirated engines",
      "Avoid heavily modified vehicles",
      "VIC has reasonable compliance costs"
    ]
  },
  {
    id: "drift-build",
    title: "Purpose-Built Drift Machine",
    description: "Create the ultimate drift weapon with smart modification planning",
    difficulty: "Advanced",
    budget: "45000-70000",
    timeline: "16-20 weeks",
    highlights: ["Modification compliance", "Roll cage requirements", "Track eligibility"],
    prefillData: {
      tool: "mod-estimator",
      data: {
        make: "Nissan",
        model: "Silvia S15",
        year: 2002,
        goal: "drift"
      }
    },
    tips: [
      "Plan modifications before compliance",
      "Engineering certificates required",
      "Consider track-only registration"
    ]
  },
  {
    id: "investment-classic",
    title: "Investment-Grade Classic",
    description: "Secure appreciating assets with proper documentation and storage",
    difficulty: "Expert",
    budget: "80000-200000",
    timeline: "10-14 weeks",
    highlights: ["Authenticity verification", "Climate-controlled storage", "Appreciation potential"],
    prefillData: {
      tool: "ai-recommendations",
      data: {
        budget: 150000,
        intendedUse: "investment",
        experience: "experienced",
        timeline: "flexible"
      }
    },
    tips: [
      "Documentation is everything",
      "Factor in storage and insurance costs",
      "Consider collector vehicle registration"
    ]
  },
  {
    id: "daily-driver",
    title: "Reliable Daily Driver",
    description: "Import a practical vehicle that won't break the bank to run",
    difficulty: "Beginner",
    budget: "30000-50000",
    timeline: "10-14 weeks",
    highlights: ["Reliability focus", "Running cost analysis", "Insurance-friendly"],
    prefillData: {
      tool: "true-cost-explorer",
      data: {
        vehiclePrice: 35000,
        importCosts: 8000,
        state: "NSW",
        insuranceTier: "standard",
        fuelType: "petrol",
        yearlyDriving: 15000,
        ownershipYears: 5
      }
    },
    tips: [
      "Consider total ownership costs",
      "Choose proven reliable models",
      "Factor in parts availability"
    ]
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner": return "bg-green-100 text-green-800 border-green-200";
    case "Advanced": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Expert": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function ExpertPicks() {
  const handleScenarioClick = (scenario: any) => {
    // Store the prefill data in sessionStorage for the target tool
    sessionStorage.setItem('importiq-prefill', JSON.stringify(scenario.prefillData));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-brand-gold rounded-lg">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Expert Picks</h1>
              <p className="text-gray-600">Pre-configured scenarios from import professionals</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-700">
              <strong>How it works:</strong> Select a scenario below to automatically populate our calculators 
              with expert-recommended parameters. Each scenario includes real market data, compliance insights, 
              and professional tips from seasoned importers.
            </p>
          </div>
        </div>

        {/* Scenarios Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {expertScenarios.map((scenario) => (
            <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg leading-tight">{scenario.title}</CardTitle>
                  <Badge className={getDifficultyColor(scenario.difficulty)}>
                    {scenario.difficulty}
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {scenario.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <DollarSign className="h-3 w-3 text-green-600" />
                    </div>
                    <div className="font-medium">${scenario.budget.split('-')[0]}K</div>
                    <div className="text-gray-500">Budget</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="font-medium">{scenario.timeline.split('-')[0]}w</div>
                    <div className="text-gray-500">Timeline</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="h-3 w-3 text-purple-600" />
                    </div>
                    <div className="font-medium">{scenario.highlights.length}</div>
                    <div className="text-gray-500">Key Steps</div>
                  </div>
                </div>

                {/* Highlights */}
                <div>
                  <div className="text-sm font-medium mb-2">Includes:</div>
                  <div className="space-y-1">
                    {scenario.highlights.slice(0, 3).map((highlight, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-600">
                        <div className="w-1.5 h-1.5 bg-brand-gold rounded-full mr-2 flex-shrink-0"></div>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pro Tips */}
                <div>
                  <div className="text-sm font-medium mb-2">Pro Tips:</div>
                  <div className="space-y-1">
                    {scenario.tips.slice(0, 2).map((tip, index) => (
                      <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Link 
                  href={`/${scenario.prefillData.tool}`}
                  onClick={() => handleScenarioClick(scenario)}
                >
                  <Button className="w-full bg-brand-gold hover:bg-amber-600 text-white">
                    <span>Load Scenario</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Need a Custom Strategy?
              </h3>
              <p className="text-gray-600 mb-6">
                These scenarios cover common import paths, but every situation is unique. 
                Use our AI Import Assistant for personalized advice on your specific vehicle and requirements.
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/ai-recommendations">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Get AI Recommendations
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}