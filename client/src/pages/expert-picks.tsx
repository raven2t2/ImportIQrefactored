import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  TrendingUp, 
  Shield, 
  DollarSign,
  ArrowLeft,
  Clock,
  Zap,
  Award,
  Users,
  Calculator
} from "lucide-react";
import { Link } from "wouter";

interface ExpertPick {
  id: string;
  make: string;
  model: string;
  year: string;
  category: string;
  expertRating: number;
  importDifficulty: "Easy" | "Medium" | "Hard";
  estimatedCost: number;
  popularity: number;
  reasons: string[];
  pros: string[];
  cons: string[];
  expertTip: string;
  expertName: string;
  imageUrl?: string;
}

const expertPicks: ExpertPick[] = [
  {
    id: "1",
    make: "Nissan",
    model: "Skyline R32 GT-R",
    year: "1989-1994",
    category: "Legends",
    expertRating: 9.2,
    importDifficulty: "Medium",
    estimatedCost: 85000,
    popularity: 95,
    reasons: ["Iconic status", "Strong aftermarket", "Investment potential"],
    pros: ["Legendary performance", "Strong community", "Appreciating value"],
    cons: ["High maintenance", "Parts can be expensive", "Right-hand drive only"],
    expertTip: "Look for examples with documented service history. The RB26 engine is bulletproof when maintained properly.",
    expertName: "Marcus Chen"
  },
  {
    id: "2",
    make: "Toyota",
    model: "Supra A80",
    year: "1993-1998",
    category: "Performance",
    expertRating: 9.5,
    importDifficulty: "Medium",
    estimatedCost: 120000,
    popularity: 98,
    reasons: ["2JZ engine potential", "Timeless design", "Pop culture icon"],
    pros: ["Legendary engine", "Excellent build quality", "Strong resale"],
    cons: ["Very expensive", "Hard to find clean examples", "High insurance"],
    expertTip: "The 2JZ-GTE engine can handle massive power. Focus on finding rust-free examples over low mileage.",
    expertName: "David Kim"
  },
  {
    id: "3",
    make: "Honda",
    model: "NSX NA1/NA2",
    year: "1990-2005",
    category: "Supercars",
    expertRating: 9.0,
    importDifficulty: "Hard",
    estimatedCost: 180000,
    popularity: 88,
    reasons: ["F1 heritage", "Daily usable supercar", "Honda reliability"],
    pros: ["Supercar performance", "Honda reliability", "Excellent handling"],
    cons: ["Very expensive", "Limited availability", "Complex maintenance"],
    expertTip: "Early cars (1990-1996) are more affordable. Check for timing belt service - it's critical on these engines.",
    expertName: "Sarah Mitchell"
  },
  {
    id: "4",
    make: "Mazda",
    model: "RX-7 FD3S",
    year: "1992-2002",
    category: "Enthusiast",
    expertRating: 8.8,
    importDifficulty: "Hard",
    estimatedCost: 65000,
    popularity: 92,
    reasons: ["Rotary engine unique", "Perfect weight balance", "Racing pedigree"],
    pros: ["Unique rotary engine", "Exceptional handling", "Affordable entry"],
    cons: ["Rotary maintenance", "Not reliable daily driver", "Fuel consumption"],
    expertTip: "Find an expert rotary mechanic before buying. These engines need specialized knowledge and frequent maintenance.",
    expertName: "Tom Rodriguez"
  },
  {
    id: "5",
    make: "Subaru",
    model: "Impreza STI (22B)",
    year: "1998",
    category: "Rally Legends",
    expertRating: 9.8,
    importDifficulty: "Hard",
    estimatedCost: 250000,
    popularity: 85,
    reasons: ["Ultra rare", "Rally heritage", "Perfect condition examples"],
    pros: ["Extreme rarity", "Rally DNA", "Collector status"],
    cons: ["Extremely expensive", "Very hard to find", "High maintenance"],
    expertTip: "Only 424 were made. Verify authenticity carefully - many replicas exist. Documentation is everything.",
    expertName: "Mike Johnson"
  },
  {
    id: "6",
    make: "Mitsubishi",
    model: "Lancer Evolution IV-IX",
    year: "1996-2006",
    category: "Performance",
    expertRating: 8.7,
    importDifficulty: "Medium",
    estimatedCost: 45000,
    popularity: 89,
    reasons: ["Rally heritage", "AWD system", "Modification potential"],
    pros: ["Advanced AWD", "Strong aftermarket", "Rally proven"],
    cons: ["Harsh ride", "Interior quality", "Maintenance intensive"],
    expertTip: "Evolution VI is the sweet spot for value and performance. Check for rust in rear quarters.",
    expertName: "James Lee"
  }
];

const categories = ["All", "Legends", "Performance", "Supercars", "Enthusiast", "Rally Legends"];

export default function ExpertPicks() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("rating");

  const filteredPicks = expertPicks
    .filter(pick => selectedCategory === "All" || pick.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === "rating") return b.expertRating - a.expertRating;
      if (sortBy === "cost") return a.estimatedCost - b.estimatedCost;
      if (sortBy === "popularity") return b.popularity - a.popularity;
      return 0;
    });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Hard": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Star className="h-8 w-8 text-amber-400" />
                Expert Vehicle Picks
              </h1>
              <p className="text-gray-300 mt-2">Top-tier selections from seasoned import professionals</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-amber-400/20 text-amber-400 border-amber-400/30">
            Expert Curation
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex gap-2">
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
          
          <div className="flex gap-2 ml-auto">
            <Button
              variant={sortBy === "rating" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("rating")}
              className={sortBy === "rating" ? "bg-amber-400 text-black" : "border-gray-600 text-gray-300"}
            >
              <Star className="h-4 w-4 mr-1" />
              Rating
            </Button>
            <Button
              variant={sortBy === "cost" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("cost")}
              className={sortBy === "cost" ? "bg-amber-400 text-black" : "border-gray-600 text-gray-300"}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Cost
            </Button>
            <Button
              variant={sortBy === "popularity" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("popularity")}
              className={sortBy === "popularity" ? "bg-amber-400 text-black" : "border-gray-600 text-gray-300"}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Popularity
            </Button>
          </div>
        </div>

        {/* Expert Picks Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredPicks.map((pick) => (
            <Card key={pick.id} className="bg-black/40 border-gray-700 hover:border-amber-400/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-xl">
                      {pick.make} {pick.model}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {pick.year} • {pick.category}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-amber-400/20 px-2 py-1 rounded-full">
                      <Star className="h-4 w-4 text-amber-400 mr-1" />
                      <span className="text-amber-400 font-bold">{pick.expertRating}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Key Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-gray-400 text-xs">Import Difficulty</div>
                    <Badge variant="outline" className={getDifficultyColor(pick.importDifficulty)}>
                      {pick.importDifficulty}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 text-xs">Est. Total Cost</div>
                    <div className="text-white font-bold">{formatCurrency(pick.estimatedCost)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 text-xs">Popularity</div>
                    <div className="flex items-center justify-center">
                      <Users className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-white font-bold">{pick.popularity}%</span>
                    </div>
                  </div>
                </div>

                {/* Why Experts Pick This */}
                <div>
                  <div className="text-white font-medium mb-2">Why Experts Pick This:</div>
                  <div className="flex flex-wrap gap-2">
                    {pick.reasons.map((reason, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Pros and Cons */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-green-400 font-medium mb-2 flex items-center">
                      <Shield className="h-4 w-4 mr-1" />
                      Pros
                    </div>
                    <ul className="space-y-1">
                      {pick.pros.map((pro, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start">
                          <span className="text-green-400 mr-2">•</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-red-400 font-medium mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Cons
                    </div>
                    <ul className="space-y-1">
                      {pick.cons.map((con, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start">
                          <span className="text-red-400 mr-2">•</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Expert Tip */}
                <div className="bg-amber-400/10 border border-amber-400/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-amber-400 mt-0.5" />
                    <div>
                      <div className="text-amber-400 font-medium">Expert Tip from {pick.expertName}</div>
                      <div className="text-gray-300 text-sm mt-1">{pick.expertTip}</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Link to="/calculator" className="flex-1">
                    <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Costs
                    </Button>
                  </Link>
                  <Link to="/compliance" className="flex-1">
                    <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                      <Shield className="h-4 w-4 mr-2" />
                      Check Compliance
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Expert Disclaimer */}
        <div className="mt-12 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Star className="h-6 w-6 text-amber-400 mt-1" />
            <div>
              <h3 className="text-white font-bold text-lg mb-2">About Our Expert Picks</h3>
              <p className="text-gray-300 mb-4">
                Our expert picks are curated by experienced import professionals with decades of combined experience. 
                These recommendations are based on factors including reliability, parts availability, modification potential, 
                resale value, and overall ownership experience.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-amber-400 font-medium">Expert Panel</div>
                  <div className="text-gray-400">6 seasoned professionals</div>
                </div>
                <div>
                  <div className="text-amber-400 font-medium">Experience</div>
                  <div className="text-gray-400">Combined 50+ years</div>
                </div>
                <div>
                  <div className="text-amber-400 font-medium">Updates</div>
                  <div className="text-gray-400">Monthly market reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}