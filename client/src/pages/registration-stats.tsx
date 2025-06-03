import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BarChart3, 
  TrendingUp,
  ArrowLeft,
  Search,
  Calendar,
  MapPin,
  Award,
  AlertTriangle
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

// Data integrity notice: This tool no longer displays mock registration data
// Official vehicle registration statistics require Australian Bureau of Statistics access
const registrationDatabase: { [key: string]: RegistrationData } = {};

export default function RegistrationStats() {
  const [searchMake, setSearchMake] = useState("");
  const [searchModel, setSearchModel] = useState("");
  const [searchYear, setSearchYear] = useState("");
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchMake || !searchModel) return;
    
    setLoading(true);
    
    // Show data integrity notice instead of fake data
    setTimeout(() => {
      setLoading(false);
      setRegistrationData(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-gray-400 hover:text-white mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Registration Statistics
            </h1>
            <p className="text-gray-400 mt-2">
              Vehicle registration data analysis tool
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-black/40 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Vehicle Search
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Search for vehicle registration statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="make" className="text-white">Make</Label>
                  <Input
                    id="make"
                    value={searchMake}
                    onChange={(e) => setSearchMake(e.target.value)}
                    placeholder="e.g., Nissan"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-white">Model</Label>
                  <Input
                    id="model"
                    value={searchModel}
                    onChange={(e) => setSearchModel(e.target.value)}
                    placeholder="e.g., Skyline R32"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-white">Year (Optional)</Label>
                  <Select onValueChange={setSearchYear}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select year range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      <SelectItem value="2020-2024">2020-2024</SelectItem>
                      <SelectItem value="2015-2019">2015-2019</SelectItem>
                      <SelectItem value="2010-2014">2010-2014</SelectItem>
                      <SelectItem value="2000-2009">2000-2009</SelectItem>
                      <SelectItem value="1990-1999">1990-1999</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleSearch}
                  disabled={!searchMake || !searchModel || loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium"
                >
                  {loading ? "Searching..." : "Search Statistics"}
                </Button>
              </CardContent>
            </Card>

            {/* Data Source Notice */}
            <Card className="bg-red-950/30 border-red-800/50 mt-6">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Data Source Notice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-red-300 text-sm">
                  Official vehicle registration statistics require Australian Bureau of Statistics data access.
                </p>
                <p className="text-gray-400 text-sm">
                  Registration data must be manually extracted from ABS published tables - no API available.
                </p>
                <a 
                  href="https://www.abs.gov.au/statistics/industry/tourism-and-transport/motor-vehicle-census-australia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  View Official ABS Motor Vehicle Census →
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 border-gray-700">
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <div className="text-red-400 text-lg font-medium mb-2">
                    Registration Data Unavailable
                  </div>
                  <div className="text-gray-400 text-sm max-w-md">
                    Official vehicle registration statistics require direct access to Australian Bureau of Statistics data sources. 
                    This tool maintains data integrity by not displaying simulated registration numbers.
                  </div>
                  <div className="mt-6 p-4 bg-blue-950/30 border border-blue-800/50 rounded-lg">
                    <div className="text-blue-400 text-sm font-medium mb-2">Available Alternative:</div>
                    <div className="text-gray-300 text-sm">
                      Use our Import Cost Calculator to estimate total costs for your specific vehicle import.
                    </div>
                    <Link href="/calculator">
                      <Button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm">
                        Calculate Import Costs →
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}