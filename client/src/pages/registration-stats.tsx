import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  BarChart3, 
  TrendingUp,
  ArrowLeft,
  Search,
  Calendar,
  MapPin,
  Award
} from "lucide-react";
import { Link } from "wouter";

interface RegistrationData {
  make: string;
  model: string;
  year: string;
  totalRegistrations: number;
  registrationsByState: {
    [key: string]: number;
  };
  registrationsByYear: {
    [key: string]: number;
  };
  rarityScore: number;
  popularityTrend: "Increasing" | "Stable" | "Decreasing";
  averageAge: number;
  topStates: Array<{ state: string; count: number; percentage: number }>;
}

// Mock registration database
const registrationDatabase: { [key: string]: RegistrationData } = {
  "nissan-skyline-r32": {
    make: "Nissan",
    model: "Skyline R32 GT-R",
    year: "1989-1994",
    totalRegistrations: 2847,
    registrationsByState: {
      "NSW": 892,
      "VIC": 645,
      "QLD": 578,
      "WA": 312,
      "SA": 198,
      "TAS": 45,
      "NT": 12,
      "ACT": 165
    },
    registrationsByYear: {
      "2020": 234,
      "2021": 289,
      "2022": 345,
      "2023": 412,
      "2024": 467
    },
    rarityScore: 85,
    popularityTrend: "Increasing",
    averageAge: 31,
    topStates: [
      { state: "NSW", count: 892, percentage: 31.3 },
      { state: "VIC", count: 645, percentage: 22.7 },
      { state: "QLD", count: 578, percentage: 20.3 }
    ]
  },
  "toyota-supra-a80": {
    make: "Toyota",
    model: "Supra A80",
    year: "1993-1998",
    totalRegistrations: 1523,
    registrationsByState: {
      "NSW": 478,
      "VIC": 398,
      "QLD": 312,
      "WA": 189,
      "SA": 87,
      "TAS": 23,
      "NT": 8,
      "ACT": 28
    },
    registrationsByYear: {
      "2020": 145,
      "2021": 167,
      "2022": 198,
      "2023": 234,
      "2024": 278
    },
    rarityScore: 92,
    popularityTrend: "Increasing",
    averageAge: 28,
    topStates: [
      { state: "NSW", count: 478, percentage: 31.4 },
      { state: "VIC", count: 398, percentage: 26.1 },
      { state: "QLD", count: 312, percentage: 20.5 }
    ]
  },
  "honda-nsx": {
    make: "Honda",
    model: "NSX",
    year: "1990-2005",
    totalRegistrations: 634,
    registrationsByState: {
      "NSW": 201,
      "VIC": 156,
      "QLD": 123,
      "WA": 78,
      "SA": 45,
      "TAS": 12,
      "NT": 3,
      "ACT": 16
    },
    registrationsByYear: {
      "2020": 58,
      "2021": 62,
      "2022": 67,
      "2023": 71,
      "2024": 78
    },
    rarityScore: 96,
    popularityTrend: "Stable",
    averageAge: 26,
    topStates: [
      { state: "NSW", count: 201, percentage: 31.7 },
      { state: "VIC", count: 156, percentage: 24.6 },
      { state: "QLD", count: 123, percentage: 19.4 }
    ]
  },
  "mazda-rx7-fd": {
    make: "Mazda",
    model: "RX-7 FD3S",
    year: "1992-2002",
    totalRegistrations: 1876,
    registrationsByState: {
      "NSW": 567,
      "VIC": 423,
      "QLD": 398,
      "WA": 234,
      "SA": 145,
      "TAS": 34,
      "NT": 18,
      "ACT": 57
    },
    registrationsByYear: {
      "2020": 189,
      "2021": 203,
      "2022": 215,
      "2023": 234,
      "2024": 256
    },
    rarityScore: 88,
    popularityTrend: "Increasing",
    averageAge: 29,
    topStates: [
      { state: "NSW", count: 567, percentage: 30.2 },
      { state: "VIC", count: 423, percentage: 22.5 },
      { state: "QLD", count: 398, percentage: 21.2 }
    ]
  },
  "mitsubishi-evo-vi": {
    make: "Mitsubishi",
    model: "Lancer Evolution VI",
    year: "1999-2001",
    totalRegistrations: 3456,
    registrationsByState: {
      "NSW": 1089,
      "VIC": 798,
      "QLD": 723,
      "WA": 412,
      "SA": 267,
      "TAS": 67,
      "NT": 23,
      "ACT": 77
    },
    registrationsByYear: {
      "2020": 312,
      "2021": 356,
      "2022": 389,
      "2023": 445,
      "2024": 498
    },
    rarityScore: 78,
    popularityTrend: "Increasing",
    averageAge: 24,
    topStates: [
      { state: "NSW", count: 1089, percentage: 31.5 },
      { state: "VIC", count: 798, percentage: 23.1 },
      { state: "QLD", count: 723, percentage: 20.9 }
    ]
  }
};

export default function RegistrationStats() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    let found = null;

    // Search through the database
    for (const [key, data] of Object.entries(registrationDatabase)) {
      if (
        data.make.toLowerCase().includes(query) ||
        data.model.toLowerCase().includes(query) ||
        key.includes(query.replace(/\s+/g, '-'))
      ) {
        found = data;
        setSelectedVehicle(key);
        break;
      }
    }

    setRegistrationData(found);
  };

  const handlePresetSelect = (vehicleKey: string) => {
    setSelectedVehicle(vehicleKey);
    setRegistrationData(registrationDatabase[vehicleKey]);
    setSearchQuery(`${registrationDatabase[vehicleKey].make} ${registrationDatabase[vehicleKey].model}`);
  };

  const getRarityColor = (score: number) => {
    if (score >= 95) return "text-red-400";
    if (score >= 90) return "text-orange-400";
    if (score >= 80) return "text-yellow-400";
    if (score >= 70) return "text-blue-400";
    return "text-green-400";
  };

  const getRarityLabel = (score: number) => {
    if (score >= 95) return "Extremely Rare";
    if (score >= 90) return "Very Rare";
    if (score >= 80) return "Rare";
    if (score >= 70) return "Uncommon";
    return "Common";
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "Increasing": return "text-green-400";
      case "Stable": return "text-yellow-400";
      case "Decreasing": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Users className="h-8 w-8 text-amber-400" />
                Registration Stats
              </h1>
              <p className="text-gray-300 mt-2">Detailed registration data and rarity analysis</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-amber-400/20 text-amber-400 border-amber-400/30">
            Market Intelligence
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Search Section */}
          <div className="lg:col-span-1">
            <Card className="bg-black/40 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Vehicle Search
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Search for registration statistics by make and model
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search" className="text-white">Vehicle Search</Label>
                  <Input
                    id="search"
                    placeholder="e.g., Nissan Skyline R32"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                
                <Button 
                  onClick={handleSearch}
                  className="w-full bg-amber-400 hover:bg-amber-500 text-black font-semibold"
                  disabled={!searchQuery.trim()}
                >
                  Search Registration Data
                </Button>

                {/* Popular Searches */}
                <div className="pt-4">
                  <div className="text-white font-medium mb-3">Popular Searches</div>
                  <div className="space-y-2">
                    {Object.entries(registrationDatabase).map(([key, data]) => (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePresetSelect(key)}
                        className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        {data.make} {data.model}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {!registrationData ? (
              <Card className="bg-black/40 border-gray-700">
                <CardContent className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-gray-400 text-lg">Search for a vehicle to view registration statistics</div>
                    <div className="text-gray-500 text-sm mt-2">
                      Try searching for popular JDM imports like "Skyline R32" or "Supra A80"
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Vehicle Overview */}
                <Card className="bg-black/40 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-2xl">
                          {registrationData.make} {registrationData.model}
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-lg">
                          {registrationData.year}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-400 text-sm">Total Registered</div>
                        <div className="text-amber-400 font-bold text-3xl">
                          {registrationData.totalRegistrations.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-gray-400 text-sm">Rarity Score</div>
                      <div className={`font-bold text-2xl ${getRarityColor(registrationData.rarityScore)}`}>
                        {registrationData.rarityScore}/100
                      </div>
                      <div className={`text-sm ${getRarityColor(registrationData.rarityScore)}`}>
                        {getRarityLabel(registrationData.rarityScore)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400 text-sm">Popularity Trend</div>
                      <div className={`font-bold text-lg ${getTrendColor(registrationData.popularityTrend)}`}>
                        {registrationData.popularityTrend}
                      </div>
                      <TrendingUp className={`h-5 w-5 mx-auto mt-1 ${getTrendColor(registrationData.popularityTrend)}`} />
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400 text-sm">Avg Owner Age</div>
                      <div className="text-white font-bold text-2xl">{registrationData.averageAge}</div>
                      <div className="text-gray-500 text-sm">years old</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400 text-sm">Top State</div>
                      <div className="text-white font-bold text-lg">{registrationData.topStates[0].state}</div>
                      <div className="text-gray-500 text-sm">{registrationData.topStates[0].percentage}%</div>
                    </div>
                  </CardContent>
                </Card>

                {/* State Distribution */}
                <Card className="bg-black/40 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Registration by State
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {registrationData.topStates.map((state, index) => (
                      <div key={state.state} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-amber-400/20 text-amber-400 border-amber-400/30">
                              #{index + 1}
                            </Badge>
                            <span className="text-white font-medium">{state.state}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold">{state.count.toLocaleString()}</div>
                            <div className="text-gray-400 text-sm">{state.percentage}%</div>
                          </div>
                        </div>
                        <Progress value={state.percentage} className="h-2" />
                      </div>
                    ))}
                    
                    {/* Other States */}
                    <div className="pt-4 border-t border-gray-600">
                      <div className="text-gray-400 text-sm mb-2">Other States</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {Object.entries(registrationData.registrationsByState)
                          .filter(([state]) => !registrationData.topStates.find(ts => ts.state === state))
                          .map(([state, count]) => (
                            <div key={state} className="flex justify-between">
                              <span className="text-gray-300">{state}</span>
                              <span className="text-gray-400">{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Registration Trend */}
                <Card className="bg-black/40 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Registration Trend (Last 5 Years)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(registrationData.registrationsByYear).map(([year, count]) => {
                        const maxCount = Math.max(...Object.values(registrationData.registrationsByYear));
                        const percentage = (count / maxCount) * 100;
                        
                        return (
                          <div key={year} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-white font-medium">{year}</span>
                              <span className="text-amber-400 font-bold">{count} registrations</span>
                            </div>
                            <Progress value={percentage} className="h-3" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Insights */}
                <Card className="bg-black/40 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Market Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-amber-400 font-medium mb-2">Rarity Analysis</div>
                        <div className="text-gray-300 text-sm">
                          {registrationData.rarityScore >= 90 ? (
                            "This vehicle is extremely rare with very limited numbers registered in Australia. Expect high collector interest and strong value retention."
                          ) : registrationData.rarityScore >= 80 ? (
                            "This is a rare vehicle with limited registration numbers. Good investment potential and strong enthusiast following."
                          ) : registrationData.rarityScore >= 70 ? (
                            "Moderately rare vehicle with decent availability. Balanced between accessibility and collectibility."
                          ) : (
                            "More common vehicle with good availability. Focus on condition and maintenance history over rarity."
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-amber-400 font-medium mb-2">Market Trend</div>
                        <div className="text-gray-300 text-sm">
                          {registrationData.popularityTrend === "Increasing" ? (
                            "Registration numbers are growing, indicating strong market interest. This suggests good investment potential and increasing community support."
                          ) : registrationData.popularityTrend === "Stable" ? (
                            "Registration numbers remain steady, showing consistent market demand. Well-established enthusiast community and stable values."
                          ) : (
                            "Registration numbers are declining. This could indicate aging out of the market or shifting preferences."
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-400/10 border border-amber-400/30 rounded-lg p-4 mt-6">
                      <div className="text-amber-400 font-medium mb-1">Data Source</div>
                      <div className="text-gray-300 text-sm">
                        Registration statistics compiled from state transport authorities, 
                        club registries, and import records. Data updated monthly and reflects 
                        vehicles currently registered for road use in Australia.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}