import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function ExpertPicks() {
  const [showPreferences, setShowPreferences] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  const [userBudget, setUserBudget] = useState("");
  const [userExperience, setUserExperience] = useState("");

  const categories = ["All", "Sports Cars", "SUVs", "Sedans", "Wagons", "Trucks", "Classics"];

  // Expert picks data with realistic Australian import costs
  const expertPicks: ExpertPick[] = [
    {
      id: "1",
      make: "Toyota",
      model: "Supra RZ",
      year: "1997",
      category: "Sports Cars",
      expertRating: 4.8,
      importDifficulty: "Medium",
      estimatedCost: 45000,
      popularity: 95,
      reasons: ["Legendary 2JZ engine", "Strong aftermarket support", "Proven reliability"],
      pros: ["Massive tuning potential", "Parts readily available", "Strong resale value"],
      cons: ["High purchase price", "Finding unmolested examples difficult"],
      expertTip: "Look for factory twin-turbo models with service history. Avoid heavily modified examples for first-time imports.",
      expertName: "Michael Chen",
      imageUrl: "/api/placeholder/400/250"
    },
    {
      id: "2", 
      make: "Nissan",
      model: "Skyline GT-R",
      year: "1999",
      category: "Sports Cars",
      expertRating: 4.9,
      importDifficulty: "Hard",
      estimatedCost: 65000,
      popularity: 98,
      reasons: ["AWD system", "RB26 engine", "Racing heritage"],
      pros: ["Exceptional performance", "Collector value increasing", "Track-proven"],
      cons: ["Expensive maintenance", "Complex AWD system", "High insurance costs"],
      expertTip: "V-Spec models command premium but worth it. Check for rust in rear quarters and service history.",
      expertName: "Sarah Williams",
      imageUrl: "/api/placeholder/400/250"
    },
    {
      id: "3",
      make: "Honda",
      model: "NSX Type R",
      year: "1995",
      category: "Sports Cars", 
      expertRating: 4.7,
      importDifficulty: "Medium",
      estimatedCost: 85000,
      popularity: 88,
      reasons: ["Mid-engine layout", "Honda reliability", "Track-focused"],
      pros: ["Daily driveable supercar", "Appreciating asset", "Low maintenance"],
      cons: ["Limited cargo space", "Very expensive", "Hard to find"],
      expertTip: "Type R variants are investment grade. Regular NSX still excellent choice for half the price.",
      expertName: "David Park",
      imageUrl: "/api/placeholder/400/250"
    },
    {
      id: "4",
      make: "Mitsubishi",
      model: "Lancer Evolution VI",
      year: "2000",
      category: "Sedans",
      expertRating: 4.6,
      importDifficulty: "Easy",
      estimatedCost: 35000,
      popularity: 92,
      reasons: ["Rally-bred AWD", "Practical 4-door", "Tuneable 4G63"],
      pros: ["Practical daily driver", "Strong community", "Parts available"],
      cons: ["Interior quality", "Fuel consumption", "Can be modified heavily"],
      expertTip: "VI is sweet spot for price/performance. Check for rust and verify engine rebuild history.",
      expertName: "Alex Thompson",
      imageUrl: "/api/placeholder/400/250"
    },
    {
      id: "5",
      make: "Subaru",
      model: "Impreza WRX STI",
      year: "1998",
      category: "Sedans",
      expertRating: 4.5,
      importDifficulty: "Easy", 
      estimatedCost: 28000,
      popularity: 89,
      reasons: ["Boxer engine", "Rally heritage", "AWD grip"],
      pros: ["Reliable platform", "Great in all conditions", "Strong aftermarket"],
      cons: ["Interior wear", "Rust issues", "Engine rebuild intervals"],
      expertTip: "22B is holy grail but any Version 5/6 STI is excellent. Check for rust in rear arches.",
      expertName: "Emma Rodriguez",
      imageUrl: "/api/placeholder/400/250"
    },
    {
      id: "6",
      make: "Mazda",
      model: "RX-7 Type R",
      year: "1999",
      category: "Sports Cars",
      expertRating: 4.4,
      importDifficulty: "Hard",
      estimatedCost: 42000,
      popularity: 85,
      reasons: ["Rotary engine", "Perfect balance", "Unique character"],
      pros: ["Incredible handling", "Lightweight", "Distinctive sound"],
      cons: ["Engine rebuilds needed", "Fuel consumption", "Requires expertise"],
      expertTip: "Buy the best example you can afford. Budget for engine rebuild within 100k km.",
      expertName: "James Liu",
      imageUrl: "/api/placeholder/400/250"
    }
  ];

  // Filter picks based on user preferences
  const getFilteredPicks = () => {
    if (showPreferences) return [];
    
    let filtered = expertPicks;
    
    // Filter by budget if provided
    if (userBudget) {
      const budgetNum = parseInt(userBudget);
      filtered = filtered.filter(pick => pick.estimatedCost <= budgetNum);
    }
    
    // Filter by experience level
    if (userExperience) {
      if (userExperience === "beginner") {
        filtered = filtered.filter(pick => pick.importDifficulty === "Easy");
      } else if (userExperience === "intermediate") {
        filtered = filtered.filter(pick => pick.importDifficulty === "Easy" || pick.importDifficulty === "Medium");
      }
      // Advanced users see all difficulty levels
    }
    
    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(pick => pick.category === selectedCategory);
    }
    
    // Sort the results
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.expertRating - a.expertRating;
        case "cost":
          return a.estimatedCost - b.estimatedCost;
        case "difficulty":
          const difficultyOrder = { "Easy": 1, "Medium": 2, "Hard": 3 };
          return difficultyOrder[a.importDifficulty] - difficultyOrder[b.importDifficulty];
        case "popularity":
          return b.popularity - a.popularity;
        default:
          return 0;
      }
    });
  };

  const filteredPicks = getFilteredPicks();

  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userBudget && userExperience) {
      setShowPreferences(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Medium": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Hard": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Expert Picks
            </h1>
            <p className="text-gray-400 mt-2">Curated recommendations from import professionals</p>
          </div>
        </div>

        {/* User Preferences Form */}
        {showPreferences && (
          <Card className="bg-black/40 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-400" />
                Tell Us About Your Import Goals
              </CardTitle>
              <CardDescription className="text-gray-400">
                Help us recommend vehicles that match your budget and experience level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-white">Maximum Budget (AUD)</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="e.g., 50000"
                      value={userBudget}
                      onChange={(e) => setUserBudget(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-white">Import Experience</Label>
                    <Select value={userExperience} onValueChange={setUserExperience} required>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner - First time importing</SelectItem>
                        <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                        <SelectItem value="advanced">Advanced - Very experienced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-amber-400 text-black hover:bg-amber-500 font-medium"
                  disabled={!userBudget || !userExperience}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Get My Personalized Recommendations
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Recommendations Section - Only show after preferences submitted */}
        {!showPreferences && (
          <>
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

              <div className="flex gap-2">
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
                  variant={sortBy === "difficulty" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("difficulty")}
                  className={sortBy === "difficulty" ? "bg-amber-400 text-black" : "border-gray-600 text-gray-300"}
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Difficulty
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

            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-gray-400">
                Showing {filteredPicks.length} recommendations for your budget of ${parseInt(userBudget || "0").toLocaleString()} AUD
                {userExperience && ` • ${userExperience} level`}
              </p>
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
                        <Badge className={getDifficultyColor(pick.importDifficulty)}>
                          {pick.importDifficulty}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-white">
                        ${pick.estimatedCost.toLocaleString()}
                      </div>
                      <div className="flex items-center text-gray-400">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {pick.popularity}% popularity
                      </div>
                    </div>

                    <div>
                      <h4 className="text-amber-400 font-medium mb-2">Why Experts Recommend</h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        {pick.reasons.map((reason, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-amber-400 mr-2">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-green-400 font-medium text-sm mb-1">Pros</h5>
                        <ul className="text-gray-300 text-xs space-y-1">
                          {pick.pros.slice(0, 2).map((pro, index) => (
                            <li key={index}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-red-400 font-medium text-sm mb-1">Cons</h5>
                        <ul className="text-gray-300 text-xs space-y-1">
                          {pick.cons.slice(0, 2).map((con, index) => (
                            <li key={index}>• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Award className="h-4 w-4 text-amber-400 mt-0.5" />
                        <div>
                          <div className="text-amber-400 text-sm font-medium">Expert Tip</div>
                          <div className="text-gray-300 text-sm">{pick.expertTip}</div>
                          <div className="text-gray-500 text-xs mt-1">— {pick.expertName}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link href="/true-cost-explorer">
                        <Button size="sm" className="bg-amber-400 text-black hover:bg-amber-500">
                          <Calculator className="h-4 w-4 mr-1" />
                          Calculate Costs
                        </Button>
                      </Link>
                      <Link href="/compliance-checker">
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                          <Shield className="h-4 w-4 mr-1" />
                          Check Compliance
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results Message */}
            {filteredPicks.length === 0 && (
              <Card className="bg-black/40 border-gray-700 text-center py-12">
                <CardContent>
                  <div className="text-gray-400 mb-4">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-white mb-2">No vehicles found</h3>
                    <p>Try adjusting your budget or experience level to see more recommendations.</p>
                  </div>
                  <Button 
                    onClick={() => setShowPreferences(true)}
                    className="bg-amber-400 text-black hover:bg-amber-500"
                  >
                    Update Preferences
                  </Button>
                </CardContent>
              </Card>
            )}

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
          </>
        )}
      </div>
    </div>
  );
}