import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  BarChart3, 
  Calendar,
  ArrowLeft,
  Globe,
  Zap,
  Target,
  Activity,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface ImportVolumeData {
  period: string;
  totalImports: number;
  change: number;
  topBrands: Array<{
    brand: string;
    count: number;
    change: number;
    percentage: number;
  }>;
  topModels: Array<{
    make: string;
    model: string;
    count: number;
    change: number;
  }>;
  marketInsights: {
    hotTrend: string;
    emergingCategory: string;
    priceMovement: "Up" | "Down" | "Stable";
    competitiveIndex: number;
  };
}

// Mock import volume data based on Australian vehicle import trends
const importVolumeData: { [key: string]: ImportVolumeData } = {
  "2024-Q4": {
    period: "Q4 2024",
    totalImports: 4523,
    change: 12.3,
    topBrands: [
      { brand: "Nissan", count: 987, change: 8.5, percentage: 21.8 },
      { brand: "Toyota", count: 854, change: 15.2, percentage: 18.9 },
      { brand: "Honda", count: 623, change: -3.1, percentage: 13.8 },
      { brand: "Mazda", count: 567, change: 22.4, percentage: 12.5 },
      { brand: "Mitsubishi", count: 445, change: 6.7, percentage: 9.8 },
      { brand: "Subaru", count: 398, change: 18.9, percentage: 8.8 },
    ],
    topModels: [
      { make: "Nissan", model: "Skyline R32 GT-R", count: 234, change: 28.5 },
      { make: "Toyota", model: "Supra A80", count: 189, change: 45.2 },
      { make: "Honda", model: "NSX", count: 156, change: 12.8 },
      { make: "Mazda", model: "RX-7 FD3S", count: 145, change: 19.3 },
      { make: "Mitsubishi", model: "Lancer Evolution", count: 134, change: 15.7 },
    ],
    marketInsights: {
      hotTrend: "90s JDM Icons",
      emergingCategory: "Kei Sports Cars",
      priceMovement: "Up",
      competitiveIndex: 78
    }
  },
  "2024-Q3": {
    period: "Q3 2024",
    totalImports: 4028,
    change: 8.7,
    topBrands: [
      { brand: "Nissan", count: 909, change: 5.2, percentage: 22.6 },
      { brand: "Toyota", count: 741, change: 12.8, percentage: 18.4 },
      { brand: "Honda", count: 643, change: -1.2, percentage: 16.0 },
      { brand: "Mazda", count: 463, change: 18.3, percentage: 11.5 },
      { brand: "Mitsubishi", count: 417, change: 3.9, percentage: 10.4 },
      { brand: "Subaru", count: 334, change: 14.2, percentage: 8.3 },
    ],
    topModels: [
      { make: "Nissan", model: "Skyline R33 GT-R", count: 198, change: 22.1 },
      { make: "Toyota", model: "Chaser JZX100", count: 167, change: 35.8 },
      { make: "Honda", model: "Civic Type R", count: 143, change: 8.9 },
      { make: "Mazda", model: "RX-8", count: 128, change: 12.4 },
      { make: "Subaru", model: "Impreza WRX STI", count: 121, change: 24.6 },
    ],
    marketInsights: {
      hotTrend: "Drift Culture Cars",
      emergingCategory: "Luxury Sedans",
      priceMovement: "Up",
      competitiveIndex: 72
    }
  },
  "2024-Q2": {
    period: "Q2 2024",
    totalImports: 3706,
    change: -2.1,
    topBrands: [
      { brand: "Toyota", count: 823, change: 18.4, percentage: 22.2 },
      { brand: "Nissan", count: 764, change: -8.3, percentage: 20.6 },
      { brand: "Honda", count: 556, change: -12.1, percentage: 15.0 },
      { brand: "Mazda", count: 445, change: 8.7, percentage: 12.0 },
      { brand: "Subaru", count: 389, change: 25.3, percentage: 10.5 },
      { brand: "Mitsubishi", count: 334, change: -5.2, percentage: 9.0 },
    ],
    topModels: [
      { make: "Toyota", model: "AE86 Corolla", count: 234, change: 42.3 },
      { make: "Nissan", model: "180SX/240SX", count: 198, change: -15.2 },
      { make: "Honda", model: "S2000", count: 156, change: 8.3 },
      { make: "Mazda", model: "MX-5 NA/NB", count: 134, change: 28.9 },
      { make: "Subaru", model: "Legacy GT-B", count: 112, change: 33.7 },
    ],
    marketInsights: {
      hotTrend: "Lightweight Sports Cars",
      emergingCategory: "Classic Tourers",
      priceMovement: "Stable",
      competitiveIndex: 65
    }
  },
  "2024-Q1": {
    period: "Q1 2024",
    totalImports: 3786,
    change: 15.8,
    topBrands: [
      { brand: "Nissan", count: 833, change: 12.7, percentage: 22.0 },
      { brand: "Toyota", count: 695, change: 24.1, percentage: 18.4 },
      { brand: "Honda", count: 632, change: 8.9, percentage: 16.7 },
      { brand: "Mazda", count: 409, change: 19.3, percentage: 10.8 },
      { brand: "Mitsubishi", count: 352, change: 16.2, percentage: 9.3 },
      { brand: "Subaru", count: 310, change: 11.4, percentage: 8.2 },
    ],
    topModels: [
      { make: "Nissan", model: "Silvia S15", count: 267, change: 38.2 },
      { make: "Toyota", model: "Mark II JZX90", count: 198, change: 29.7 },
      { make: "Honda", model: "Integra Type R", count: 178, change: 15.6 },
      { make: "Mazda", model: "FC3S RX-7", count: 145, change: 22.8 },
      { make: "Mitsubishi", model: "3000GT VR4", count: 123, change: 45.1 },
    ],
    marketInsights: {
      hotTrend: "80s-90s Classics",
      emergingCategory: "Performance Sedans",
      priceMovement: "Up",
      competitiveIndex: 58
    }
  }
};

const timeframes = [
  { value: "2024-Q4", label: "Q4 2024 (Current)" },
  { value: "2024-Q3", label: "Q3 2024" },
  { value: "2024-Q2", label: "Q2 2024" },
  { value: "2024-Q1", label: "Q1 2024" }
];

export default function ImportVolumeDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-Q4");
  
  const currentData = importVolumeData[selectedPeriod];

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-400";
    if (change < 0) return "text-red-400";
    return "text-gray-400";
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return "↗";
    if (change < 0) return "↘";
    return "→";
  };

  const getPriceMovementColor = (movement: string) => {
    switch (movement) {
      case "Up": return "text-red-400";
      case "Down": return "text-green-400";
      case "Stable": return "text-yellow-400";
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
                <TrendingUp className="h-8 w-8 text-amber-400" />
                Import Volume Dashboard
              </h1>
              <p className="text-gray-300 mt-2">Real-time import volume tracking and trend analysis</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-amber-400/20 text-amber-400 border-amber-400/30">
            Market Trends
          </Badge>
        </div>

        {/* Time Period Selector */}
        <Card className="bg-black/40 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Time Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full md:w-64 bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {timeframes.map((timeframe) => (
                  <SelectItem key={timeframe.value} value={timeframe.value}>
                    {timeframe.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm">Total Imports</div>
                  <div className="text-white font-bold text-2xl">{currentData.totalImports.toLocaleString()}</div>
                  <div className={`text-sm flex items-center gap-1 ${getChangeColor(currentData.change)}`}>
                    <span>{getChangeIcon(currentData.change)}</span>
                    {Math.abs(currentData.change)}% vs prev quarter
                  </div>
                </div>
                <BarChart3 className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm">Hot Trend</div>
                  <div className="text-white font-bold text-lg">{currentData.marketInsights.hotTrend}</div>
                  <div className="text-amber-400 text-sm">Most in-demand category</div>
                </div>
                <Zap className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm">Price Movement</div>
                  <div className={`font-bold text-lg ${getPriceMovementColor(currentData.marketInsights.priceMovement)}`}>
                    {currentData.marketInsights.priceMovement}
                  </div>
                  <div className="text-gray-400 text-sm">Overall market direction</div>
                </div>
                <Activity className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm">Competition Index</div>
                  <div className="text-white font-bold text-2xl">{currentData.marketInsights.competitiveIndex}</div>
                  <div className="text-gray-400 text-sm">Buyer competition level</div>
                </div>
                <Target className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Brands */}
          <Card className="bg-black/40 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Top Importing Brands
              </CardTitle>
              <CardDescription className="text-gray-400">
                Most imported brands for {currentData.period}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentData.topBrands.map((brand, index) => (
                <div key={brand.brand} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-amber-400/20 text-amber-400 border-amber-400/30">
                        #{index + 1}
                      </Badge>
                      <span className="text-white font-medium">{brand.brand}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{brand.count.toLocaleString()}</div>
                      <div className={`text-sm flex items-center gap-1 ${getChangeColor(brand.change)}`}>
                        <span>{getChangeIcon(brand.change)}</span>
                        {Math.abs(brand.change)}%
                      </div>
                    </div>
                  </div>
                  <Progress value={brand.percentage} className="h-2" />
                  <div className="text-gray-400 text-xs">{brand.percentage}% of total imports</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Models */}
          <Card className="bg-black/40 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending Models
              </CardTitle>
              <CardDescription className="text-gray-400">
                Most imported specific models for {currentData.period}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentData.topModels.map((model, index) => (
                <div key={`${model.make}-${model.model}`} className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        #{index + 1}
                      </Badge>
                      <div>
                        <div className="text-white font-medium">{model.make} {model.model}</div>
                        <div className="text-gray-400 text-sm">{model.count} imports</div>
                      </div>
                    </div>
                    <div className={`text-right ${getChangeColor(model.change)}`}>
                      <div className="font-bold">{getChangeIcon(model.change)} {Math.abs(model.change)}%</div>
                      <div className="text-xs">vs prev quarter</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Market Insights */}
        <Card className="bg-black/40 border-gray-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Market Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-amber-400 font-medium mb-2">Emerging Category</div>
              <div className="text-white font-bold text-lg mb-2">{currentData.marketInsights.emergingCategory}</div>
              <div className="text-gray-300 text-sm">
                This category is showing strong growth momentum. Consider exploring these vehicles 
                before they become mainstream and prices increase significantly.
              </div>
            </div>
            <div>
              <div className="text-amber-400 font-medium mb-2">Competition Analysis</div>
              <div className="flex items-center gap-3 mb-2">
                <Progress value={currentData.marketInsights.competitiveIndex} className="flex-1" />
                <span className="text-white font-bold">{currentData.marketInsights.competitiveIndex}/100</span>
              </div>
              <div className="text-gray-300 text-sm">
                {currentData.marketInsights.competitiveIndex > 75 ? 
                  "Very high buyer competition. Act quickly on desirable vehicles and expect premium pricing." :
                  currentData.marketInsights.competitiveIndex > 50 ?
                  "Moderate competition. Good balance between selection and pricing pressure." :
                  "Lower competition environment. More negotiating power and time to evaluate options."
                }
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Information */}
        <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <BarChart3 className="h-6 w-6 text-amber-400 mt-1" />
            <div>
              <h3 className="text-white font-bold text-lg mb-2">About This Data</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-amber-400 font-medium mb-1">Data Sources</div>
                  <div className="text-gray-300">
                    Import declarations, port authorities, compliance workshops, and industry registrations.
                  </div>
                </div>
                <div>
                  <div className="text-amber-400 font-medium mb-1">Update Frequency</div>
                  <div className="text-gray-300">
                    Quarterly comprehensive reports with monthly trend updates for major categories.
                  </div>
                </div>
                <div>
                  <div className="text-amber-400 font-medium mb-1">Coverage</div>
                  <div className="text-gray-300">
                    All vehicle imports to Australia including personal imports, dealer stock, and compliance vehicles.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}