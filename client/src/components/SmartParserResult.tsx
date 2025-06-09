import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertTriangle, Info, Clock, ArrowRight, Shield, TrendingUp, Target, MapPin, Wrench } from "lucide-react";
import { SmartParserResponse } from "@shared/types";
import { useLocation } from "wouter";
import { ModShopIntelligence } from "./ModShopIntelligence";

interface SmartParserResultProps {
  result: SmartParserResponse;
  onAddToWatchlist?: (vehicleData: any) => void;
  onSuggestPattern?: (pattern: string, make: string, model: string) => void;
}

export function SmartParserResult({ result, onAddToWatchlist, onSuggestPattern }: SmartParserResultProps) {
  const [, setLocation] = useLocation();
  
  const getConfidenceColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 75) return "text-blue-600 bg-blue-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return "text-green-600 bg-green-50";
      case 'medium': return "text-yellow-600 bg-yellow-50";
      case 'high': return "text-orange-600 bg-orange-50";
      case 'critical': return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Info className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!result.data && result.confidenceScore === 0) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">No Match Found</span>
          </div>
          <p className="text-yellow-700 mb-4">{result.whyThisResult}</p>
          
          {result.nextSteps && result.nextSteps.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-800">Suggested Next Steps:</h4>
              {result.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg border border-yellow-200">
                  {getPriorityIcon(step.priority)}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{step.title}</div>
                    <div className="text-sm text-gray-600">{step.description}</div>
                    {step.estimatedTime && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {step.estimatedTime}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {result.fallbackSuggestions && result.fallbackSuggestions.length > 0 && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2">Alternative Searches:</h4>
              <div className="flex flex-wrap gap-2">
                {result.fallbackSuggestions.map((suggestion, index) => (
                  <Badge key={index} variant="outline" className="text-yellow-700 border-yellow-300">
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Vehicle Information */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-green-800">
              {result.data.make} {result.data.model}
            </CardTitle>
            <Badge className={`${getConfidenceColor(result.confidenceScore)} border-0`}>
              {result.confidenceScore}% Confidence
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {result.data.chassisCode && (
              <div>
                <div className="text-sm font-medium text-gray-600">Chassis Code</div>
                <div className="text-lg font-semibold text-gray-900">{result.data.chassisCode}</div>
              </div>
            )}
            {result.data.yearRange && (
              <div>
                <div className="text-sm font-medium text-gray-600">Production Years</div>
                <div className="text-lg font-semibold text-gray-900">{result.data.yearRange}</div>
              </div>
            )}
            {result.data.engine && (
              <div>
                <div className="text-sm font-medium text-gray-600">Engine</div>
                <div className="text-lg font-semibold text-gray-900">{result.data.engine}</div>
              </div>
            )}
            {result.data.bodyType && (
              <div>
                <div className="text-sm font-medium text-gray-600">Body Type</div>
                <div className="text-lg font-semibold text-gray-900">{result.data.bodyType}</div>
              </div>
            )}
            {result.data.country && (
              <div>
                <div className="text-sm font-medium text-gray-600">Origin Country</div>
                <div className="text-lg font-semibold text-gray-900">{result.data.country}</div>
              </div>
            )}
          </div>

          {result.data.specialNotes && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-800">Special Notes</div>
                  <div className="text-blue-700">{result.data.specialNotes}</div>
                </div>
              </div>
            </div>
          )}

          {/* Confidence Explanation */}
          <div className="p-4 bg-white border border-green-200 rounded-lg">
            <div className="flex items-start gap-2 mb-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-green-800">Analysis Confidence</div>
                <div className="text-green-700">{result.whyThisResult}</div>
              </div>
            </div>
            <Progress value={result.confidenceScore} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Import Risk Assessment */}
      {result.importRiskIndex && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Import Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Risk Level</span>
              <Badge className={`${getRiskLevelColor(result.importRiskIndex.riskLevel)} border-0 text-sm`}>
                {result.importRiskIndex.riskLevel.toUpperCase()} ({result.importRiskIndex.score}/100)
              </Badge>
            </div>
            
            <Progress value={result.importRiskIndex.score} className="h-3 mb-4" />
            
            <p className="text-gray-700 mb-4">{result.importRiskIndex.explanation}</p>
            
            {result.importRiskIndex.factors && result.importRiskIndex.factors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Risk Factors:</h4>
                {result.importRiskIndex.factors.map((factor, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{factor.name}</div>
                      <div className="text-sm text-gray-600">{factor.description}</div>
                      <div className="text-xs text-gray-500 mt-1">Impact: {factor.impact}/10</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Strategic Recommendations */}
      {result.strategicRecommendations && result.strategicRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Strategic Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.strategicRecommendations.map((rec, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-gray-900">{rec.title}</div>
                    <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-3">{rec.description}</p>
                  
                  {rec.timing && (
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Timing:</strong> {rec.timing}
                    </div>
                  )}
                  
                  {rec.alternatives && rec.alternatives.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <strong>Alternatives:</strong> {rec.alternatives.join(', ')}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">Confidence: {rec.confidence}%</span>
                    <span className="text-xs text-gray-500">{rec.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Intent Classification */}
      {result.userIntent && (
        <Card>
          <CardHeader>
            <CardTitle>Detected Intent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-600">Category</div>
                <div className="text-lg font-semibold text-gray-900">{result.userIntent.category}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Subcategory</div>
                <div className="text-lg font-semibold text-gray-900">{result.userIntent.subcategory}</div>
              </div>
            </div>
            
            {result.userIntent.detectedKeywords && result.userIntent.detectedKeywords.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-600 mb-2">Detected Keywords</div>
                <div className="flex flex-wrap gap-2">
                  {result.userIntent.detectedKeywords.map((keyword, index) => (
                    <Badge key={index} variant="outline">{keyword}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {result.userIntent.riskFactors && result.userIntent.riskFactors.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-600 mb-2">Intent Risk Factors</div>
                <div className="flex flex-wrap gap-2">
                  {result.userIntent.riskFactors.map((factor, index) => (
                    <Badge key={index} variant="destructive" className="text-xs">{factor}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Source Attribution */}
      <Card>
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-600">Primary Source</div>
            <div className="text-lg font-semibold text-gray-900">{result.sourceAttribution}</div>
          </div>
          
          {result.sourceBreakdown && result.sourceBreakdown.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-600">Detailed Source Breakdown</div>
              {result.sourceBreakdown.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{source.dataPoint}</div>
                    <div className="text-sm text-gray-600">{source.source}</div>
                    <div className="text-xs text-gray-500">Last verified: {source.lastVerified}</div>
                  </div>
                  <Badge className={`${getConfidenceColor(source.confidence)} border-0 text-xs`}>
                    {source.confidence}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
          
          {result.lastUpdated && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Last updated: {new Date(result.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      {result.nextSteps && result.nextSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  {getPriorityIcon(step.priority)}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{step.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{step.description}</div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Category: {step.category}</span>
                      {step.estimatedTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {step.estimatedTime}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mod Shop Integration - Seamless Customer Journey */}
      {result.data && result.data.make && result.data.model && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-600" />
              Find Local Import Specialists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-blue-800 text-sm">
                Connect with verified mod shops and import specialists near you who can handle {result.data.make} {result.data.model} modifications and compliance requirements.
              </p>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => setLocation(`/shop-locator?vehicle=${encodeURIComponent(result.data.make + ' ' + result.data.model)}`)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <MapPin className="w-4 h-4" />
                  Find Nearby Shops
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setLocation(`/shop-locator?services=import-compliance&vehicle=${encodeURIComponent(result.data.make + ' ' + result.data.model)}`)}
                  className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Shield className="w-4 h-4" />
                  Import Compliance
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Local Service Providers Intelligence */}
      {result.data && (
        <ModShopIntelligence 
          vehicleMake={result.data.make}
          vehicleModel={result.data.model}
          destination={result.data.destination || 'UK'}
        />
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onAddToWatchlist && result.data && (
          <Button onClick={() => onAddToWatchlist(result.data)} className="flex-1">
            Add to Watchlist
          </Button>
        )}
        {onSuggestPattern && result.data && result.confidenceScore < 90 && (
          <Button 
            variant="outline" 
            onClick={() => onSuggestPattern('', result.data.make, result.data.model)}
            className="flex-1"
          >
            Suggest Pattern Improvement
          </Button>
        )}
      </div>

      {/* Disclaimer */}
      {result.disclaimer && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-gray-500 mt-0.5" />
              <div className="text-sm text-gray-600">{result.disclaimer}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}