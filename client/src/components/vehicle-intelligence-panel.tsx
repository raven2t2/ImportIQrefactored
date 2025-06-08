import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Brain, 
  TrendingUp, 
  MapPin, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface VehicleIntelligencePanelProps {
  vehicleData: {
    make: string;
    model: string;
    year: number;
    price?: number;
  };
  targetCountry: string;
  targetRegion: string;
  onDataLoaded?: (data: any) => void;
}

export function VehicleIntelligencePanel({ 
  vehicleData, 
  targetCountry, 
  targetRegion, 
  onDataLoaded 
}: VehicleIntelligencePanelProps) {
  const [loading, setLoading] = useState(false);
  const [intelligence, setIntelligence] = useState<any>(null);
  const [marketInsights, setMarketInsights] = useState<any>(null);
  const [complianceRoadmap, setComplianceRoadmap] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const fetchVehicleIntelligence = async () => {
    if (!vehicleData.make || !vehicleData.model) return;
    
    setLoading(true);
    try {
      // Get vehicle intelligence
      const intelligenceResponse = await fetch('/api/vehicle-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: `${vehicleData.make} ${vehicleData.model} ${vehicleData.year}`,
          targetCountry,
          targetRegion
        })
      });

      if (intelligenceResponse.ok) {
        const intelligenceData = await intelligenceResponse.json();
        setIntelligence(intelligenceData);
      }

      // Get market insights
      const marketResponse = await fetch('/api/market-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: vehicleData.make,
          model: vehicleData.model,
          year: vehicleData.year,
          targetCountry,
          targetRegion
        })
      });

      if (marketResponse.ok) {
        const marketData = await marketResponse.json();
        setMarketInsights(marketData);
      }

      // Get compliance roadmap
      const roadmapResponse = await fetch('/api/compliance-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleData: {
            ...vehicleData,
            estimatedValue: vehicleData.price || 50000
          },
          targetCountry,
          targetRegion,
          timeframe: "3-6 months"
        })
      });

      if (roadmapResponse.ok) {
        const roadmapData = await roadmapResponse.json();
        setComplianceRoadmap(roadmapData);
      }

      onDataLoaded?.({ intelligence, marketInsights, complianceRoadmap });
    } catch (error) {
      console.error('Error fetching vehicle intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasData = intelligence || marketInsights || complianceRoadmap;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Vehicle Intelligence
          </CardTitle>
          <Button 
            onClick={fetchVehicleIntelligence}
            disabled={loading || !vehicleData.make || !vehicleData.model}
            size="sm"
          >
            {loading ? "Analyzing..." : "Get Intelligence"}
          </Button>
        </div>
      </CardHeader>

      {hasData && (
        <CardContent className="space-y-4">
          {/* Market Insights */}
          {marketInsights?.success && (
            <Collapsible>
              <CollapsibleTrigger
                onClick={() => toggleSection('market')}
                className="flex w-full items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Market Intelligence</span>
                  {marketInsights.insights?.marketStats && (
                    <Badge variant="secondary">
                      {marketInsights.insights.marketStats.listingCount} listings
                    </Badge>
                  )}
                </div>
                {expandedSections.market ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              
              <CollapsibleContent className="px-3 pb-3">
                {marketInsights.insights?.marketStats && (
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Average Price:</span>
                      <div className="font-semibold text-green-600">
                        ${Math.round(marketInsights.insights.marketStats.averagePrice).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Price Range:</span>
                      <div className="font-semibold">
                        ${Math.round(marketInsights.insights.marketStats.priceRange.min).toLocaleString()} - 
                        ${Math.round(marketInsights.insights.marketStats.priceRange.max).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm col-span-2">
                      <span className="text-muted-foreground">Market Demand:</span>
                      <Badge 
                        variant={marketInsights.insights.trends.demandLevel === 'High' ? 'destructive' : 
                               marketInsights.insights.trends.demandLevel === 'Medium' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {marketInsights.insights.trends.demandLevel}
                      </Badge>
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Regional Compliance */}
          {complianceRoadmap?.success && (
            <Collapsible>
              <CollapsibleTrigger
                onClick={() => toggleSection('compliance')}
                className="flex w-full items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Regional Compliance</span>
                  <Badge variant="outline">
                    {complianceRoadmap.roadmap?.difficultyLevel}
                  </Badge>
                </div>
                {expandedSections.compliance ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              
              <CollapsibleContent className="px-3 pb-3">
                <div className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Est. Timeline:</span>
                      <div className="font-semibold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {complianceRoadmap.roadmap?.totalTimeframe}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Est. Total Cost:</span>
                      <div className="font-semibold flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${Math.round(complianceRoadmap.roadmap?.totalEstimatedCost || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {complianceRoadmap.roadmap?.regionalAdvantages?.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Regional Advantages:</span>
                      <ul className="text-sm mt-1 space-y-1">
                        {complianceRoadmap.roadmap.regionalAdvantages.slice(0, 2).map((advantage: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            {advantage}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {complianceRoadmap.roadmap?.potentialChallenges?.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Key Considerations:</span>
                      <ul className="text-sm mt-1 space-y-1">
                        {complianceRoadmap.roadmap.potentialChallenges.slice(0, 2).map((challenge: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
                            {challenge}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Recommendations */}
          {intelligence?.recommendations && (
            <Collapsible>
              <CollapsibleTrigger
                onClick={() => toggleSection('recommendations')}
                className="flex w-full items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">AI Recommendations</span>
                </div>
                {expandedSections.recommendations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              
              <CollapsibleContent className="px-3 pb-3">
                <div className="text-sm mt-3 space-y-2">
                  {intelligence.recommendations.keyRecommendations?.slice(0, 3).map((rec: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />
                      {rec}
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      )}
    </Card>
  );
}