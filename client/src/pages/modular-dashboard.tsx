import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { RegionSelector } from "@/components/region-selector";
import { Search, Calculator, Clipboard, Globe, ArrowRight, Info } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  path: string;
  description: string;
  regions: string[];
}

interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: 'Search' | 'Calculator' | 'Clipboard';
  tools: Tool[];
}

const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: 'lookup',
    name: 'Vehicle Lookup',
    description: 'Search, decode, and verify vehicle information',
    icon: 'Search',
    tools: [
      { id: 'vin-decoder', name: 'VIN Decoder', path: '/vehicle-lookup', description: 'Decode VIN and get vehicle specifications', regions: ['AU', 'US', 'UK', 'CA'] },
      { id: 'auction-explorer', name: 'Auction Explorer', path: '/auction-sample-explorer', description: 'Browse current auction listings', regions: ['AU', 'US', 'UK', 'CA'] },
      { id: 'market-scanner', name: 'Live Market Scanner', path: '/live-market-scanner', description: 'Real-time market data and pricing', regions: ['AU', 'US', 'UK', 'CA'] },
      { id: 'vehicle-history', name: 'Vehicle History', path: '/japan-value', description: 'Japanese auction history and grades', regions: ['AU', 'US', 'UK', 'CA'] }
    ]
  },
  {
    id: 'estimate',
    name: 'Cost Estimation',
    description: 'Calculate import costs, taxes, and compliance fees',
    icon: 'Calculator',
    tools: [
      { id: 'import-calculator', name: 'Import Calculator', path: '/import-calculator', description: 'Complete import cost breakdown', regions: ['AU', 'US', 'UK', 'CA'] },
      { id: 'compliance-checker', name: 'Compliance Checker', path: '/compliance-checker', description: 'Check eligibility and requirements', regions: ['AU', 'US', 'UK', 'CA'] },
      { id: 'shipping-calculator', name: 'Shipping Calculator', path: '/shipping-calculator', description: 'Calculate shipping costs by route', regions: ['AU', 'US', 'UK', 'CA'] },
      { id: 'roi-calculator', name: 'ROI Calculator', path: '/roi-calculator', description: 'Investment return analysis', regions: ['AU', 'US', 'UK', 'CA'] },
      { id: 'insurance-estimator', name: 'Insurance Estimator', path: '/insurance-estimator', description: 'Estimate insurance costs', regions: ['AU', 'US', 'UK', 'CA'] }
    ]
  },
  {
    id: 'manage',
    name: 'Import Management',
    description: 'Track imports, documentation, and compliance progress',
    icon: 'Clipboard',
    tools: [
      { id: 'dashboard', name: 'Import Dashboard', path: '/enhanced-dashboard', description: 'Track your import progress', regions: ['AU', 'US', 'UK', 'CA'] },
      { id: 'documentation', name: 'Documentation Assistant', path: '/documentation-assistant', description: 'Manage required paperwork', regions: ['AU', 'US', 'UK', 'CA'] },
      { id: 'timeline', name: 'Import Timeline', path: '/import-timeline', description: 'Track milestones and deadlines', regions: ['AU', 'US', 'UK', 'CA'] },
      { id: 'port-intelligence', name: 'Port Intelligence', path: '/port-intelligence', description: 'Port selection and logistics', regions: ['AU', 'US', 'UK', 'CA'] }
    ]
  }
];

export default function ModularDashboard() {
  const [, setLocation] = useLocation();
  const [selectedRegion, setSelectedRegion] = useState<string>(() => {
    return localStorage.getItem('importiq_region') || 'AU';
  });
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('importiq_region');
  });

  useEffect(() => {
    localStorage.setItem('importiq_region', selectedRegion);
  }, [selectedRegion]);

  const handleRegionSelect = (regionCode: string) => {
    setSelectedRegion(regionCode);
    setShowOnboarding(false);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Search': return Search;
      case 'Calculator': return Calculator;
      case 'Clipboard': return Clipboard;
      default: return Search;
    }
  };

  const getAvailableTools = (category: ToolCategory) => {
    return category.tools.filter(tool => tool.regions.includes(selectedRegion));
  };

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <Globe className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to ImportIQ
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              Your global vehicle import intelligence platform
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Select your region to get started with region-specific tools and compliance information
            </p>
          </div>

          <RegionSelector 
            onRegionSelect={handleRegionSelect}
            selectedRegion={selectedRegion}
          />

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                What you'll get access to
              </CardTitle>
              <CardDescription>
                Region-specific tools and compliance information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Search className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Vehicle Lookup</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    VIN decoding, auction search, market scanning, and vehicle history
                  </p>
                </div>
                <div className="text-center">
                  <Calculator className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Cost Estimation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Import costs, compliance fees, shipping, and ROI calculations
                  </p>
                </div>
                <div className="text-center">
                  <Clipboard className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Import Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Dashboard tracking, documentation, timelines, and port intelligence
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const regionNames = {
    AU: 'Australia',
    US: 'United States', 
    UK: 'United Kingdom',
    CA: 'Canada'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                ImportIQ Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Import intelligence for {regionNames[selectedRegion as keyof typeof regionNames]}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowOnboarding(true)}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              Change Region
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              Region: {regionNames[selectedRegion as keyof typeof regionNames]}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {TOOL_CATEGORIES.reduce((acc, cat) => acc + getAvailableTools(cat).length, 0)} tools available
            </Badge>
          </div>
        </div>

        {/* Tool Categories */}
        <div className="grid lg:grid-cols-3 gap-6">
          {TOOL_CATEGORIES.map((category) => {
            const IconComponent = getIcon(category.icon);
            const availableTools = getAvailableTools(category);

            return (
              <Card key={category.id} className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {availableTools.length} tools
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableTools.map((tool) => (
                      <div
                        key={tool.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1">{tool.name}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {tool.description}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setLocation(tool.path)}
                          className="ml-2 shrink-0"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}