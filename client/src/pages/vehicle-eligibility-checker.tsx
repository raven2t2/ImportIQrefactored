import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Clock, DollarSign, FileText, Globe, Link, Car, ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";

interface CountryEligibilityResult {
  targetCountry: 'AU' | 'US' | 'UK' | 'CA';
  eligible: boolean;
  eligibilityType: string;
  ageRequirement: {
    minimumAge: number;
    currentAge: number;
    meetsRequirement: boolean;
    ruleDescription: string;
  };
  complianceRequirements: {
    standardsCompliance: boolean;
    safetyModifications: string[];
    emissionsModifications: string[];
    inspectionRequired: boolean;
    testingRequired: boolean;
  };
  estimatedCosts: {
    complianceCost: number;
    modificationCost: number;
    inspectionFees: number;
    dutyAndTaxes: number;
  };
  restrictions: string[];
  nextSteps: string[];
  warnings: string[];
  timeline: {
    totalWeeks: number;
    phases: { phase: string; weeks: number; description: string }[];
  };
}

interface EligibilityResults {
  vehicle: {
    make: string;
    model: string;
    year: number;
    origin: string;
    estimatedValue: number;
  };
  results: CountryEligibilityResult[];
  overallSummary: {
    eligibleCountries: number;
    easiestCountry: string;
    cheapestCountry: string;
    fastestCountry: string;
  };
}

type ConversationStep = 
  | 'welcome'
  | 'input-method'
  | 'url-input'
  | 'vin-input'
  | 'make-selection'
  | 'model-input'
  | 'year-input'
  | 'value-input'
  | 'loading'
  | 'results';

interface ConversationState {
  step: ConversationStep;
  data: {
    inputMethod?: 'url' | 'vin' | 'manual';
    auctionUrl?: string;
    vin?: string;
    make?: string;
    model?: string;
    year?: number;
    estimatedValue?: number;
  };
  suggestions: string[];
}

const popularMakes = [
  'Toyota', 'Nissan', 'Honda', 'Mazda', 'Subaru', 'Mitsubishi', 
  'BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Ferrari', 'Lamborghini'
];

const countryFlags = {
  AU: '🇦🇺',
  US: '🇺🇸', 
  UK: '🇬🇧',
  CA: '🇨🇦'
};

const countryNames = {
  AU: 'Australia',
  US: 'United States',
  UK: 'United Kingdom', 
  CA: 'Canada'
};

export default function VehicleEligibilityChecker() {
  const [conversation, setConversation] = useState<ConversationState>({
    step: 'welcome',
    data: {},
    suggestions: []
  });
  
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState<EligibilityResults | null>(null);

  // Handle URL parameters from landing page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inputParam = urlParams.get('input');
    
    if (inputParam) {
      setInputValue(inputParam);
      // Auto-trigger the smart detection
      setTimeout(() => handleNext(inputParam), 100);
    }
  }, []);

  const eligibilityMutation = useMutation({
    mutationFn: async (data: any): Promise<EligibilityResults> => {
      const response = await apiRequest('POST', '/api/check-vehicle-eligibility', {
        ...data,
        targetCountries: ['AU', 'US', 'UK', 'CA']
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setResults(data);
      setConversation(prev => ({ ...prev, step: 'results' }));
    }
  });

  const handleNext = (value?: string) => {
    const currentValue = value || inputValue;
    
    switch (conversation.step) {
      case 'welcome':
        // Enhanced smart detection of input type
        if (currentValue.includes('http') || currentValue.includes('www.') || currentValue.includes('.com')) {
          // URL input (handles partial URLs and various formats)
          const fullUrl = currentValue.startsWith('http') ? currentValue : `https://${currentValue}`;
          setConversation(prev => ({ 
            ...prev, 
            step: 'loading',
            data: { ...prev.data, auctionUrl: fullUrl }
          }));
          eligibilityMutation.mutate({
            inputMethod: 'url',
            url: fullUrl
          });
        } else if (/^[A-HJ-NPR-Z0-9]{17}$/i.test(currentValue.replace(/[\s\-]/g, ''))) {
          // VIN input (17 characters, excluding I, O, Q, allows spaces and dashes)
          const cleanVin = currentValue.replace(/[\s\-]/g, '').toUpperCase();
          setConversation(prev => ({ 
            ...prev, 
            step: 'loading',
            data: { ...prev.data, vin: cleanVin }
          }));
          eligibilityMutation.mutate({
            inputMethod: 'vin',
            vin: cleanVin
          });
        } else if (/\d{4}.*[a-zA-Z]{2,}.*[a-zA-Z]{2,}/.test(currentValue)) {
          // Pattern matches year + make + model (e.g., "1992 Nissan Skyline")
          const parts = currentValue.trim().split(/\s+/);
          const year = parseInt(parts[0]);
          if (year >= 1980 && year <= new Date().getFullYear() + 1) {
            setConversation(prev => ({ 
              ...prev, 
              step: 'loading',
              data: { ...prev.data, year, make: parts[1], model: parts.slice(2).join(' ') }
            }));
            eligibilityMutation.mutate({
              inputMethod: 'manual',
              year,
              make: parts[1],
              model: parts.slice(2).join(' '),
              origin: 'japan',
              estimatedValue: 25000
            });
          } else {
            // Treat as make input
            const suggestedModels = getMakeModels(currentValue);
            setConversation(prev => ({ 
              ...prev, 
              step: 'model-input',
              data: { ...prev.data, make: currentValue },
              suggestions: suggestedModels
            }));
          }
        } else if (currentValue.trim()) {
          // Some other input - treat as make
          const suggestedModels = getMakeModels(currentValue);
          setConversation(prev => ({ 
            ...prev, 
            step: 'model-input',
            data: { ...prev.data, make: currentValue },
            suggestions: suggestedModels
          }));
        } else {
          // No input - show input method selection (fallback)
          setConversation({
            step: 'input-method',
            data: {},
            suggestions: ['Paste auction URL', 'Enter vehicle details']
          });
        }
        setInputValue('');
        break;
        

        
      case 'make-selection':
        const suggestedModels = getMakeModels(currentValue);
        setConversation(prev => ({ 
          ...prev, 
          step: 'model-input',
          data: { ...prev.data, make: currentValue },
          suggestions: suggestedModels
        }));
        setInputValue('');
        break;
        
      case 'model-input':
        setConversation(prev => ({ 
          ...prev, 
          step: 'year-input',
          data: { ...prev.data, model: currentValue },
          suggestions: getYearSuggestions()
        }));
        setInputValue('');
        break;
        
      case 'year-input':
        const year = parseInt(currentValue);
        setConversation(prev => ({ 
          ...prev, 
          step: 'value-input',
          data: { ...prev.data, year },
          suggestions: getValueSuggestions(year)
        }));
        setInputValue('');
        break;
        
      case 'value-input':
        const value = parseInt(currentValue.replace(/[^0-9]/g, ''));
        setConversation(prev => ({ 
          ...prev, 
          step: 'loading',
          data: { ...prev.data, estimatedValue: value }
        }));
        
        eligibilityMutation.mutate({
          inputMethod: 'manual',
          make: conversation.data.make,
          model: conversation.data.model,
          year: conversation.data.year,
          origin: 'japan',
          estimatedValue: value
        });
        setInputValue('');
        break;
    }
  };

  const getMakeModels = (make: string): string[] => {
    const models: Record<string, string[]> = {
      'Toyota': ['Supra', 'GT86', 'Celica', 'MR2', 'AE86', 'Chaser'],
      'Nissan': ['Skyline GT-R', '240SX', 'Silvia', 'GT-R', 'Z32', 'R34'],
      'Honda': ['NSX', 'Civic Type R', 'S2000', 'Integra', 'CRX', 'Prelude'],
      'Mazda': ['RX-7', 'RX-8', 'Miata', 'MX-5', 'Cosmo', 'Savanna'],
      'Subaru': ['WRX STI', 'Impreza', 'Legacy', 'Forester', 'BRZ', 'SVX']
    };
    return models[make] || ['Custom Model'];
  };

  const getYearSuggestions = (): string[] => {
    const currentYear = new Date().getFullYear();
    return [
      `${currentYear - 5}`,
      `${currentYear - 10}`, 
      `${currentYear - 15}`,
      `${currentYear - 25}`,
      `${currentYear - 30}`
    ];
  };

  const getValueSuggestions = (year: number): string[] => {
    const baseValue = year > 2010 ? 35000 : year > 2000 ? 25000 : 15000;
    return [
      `$${baseValue.toLocaleString()}`,
      `$${(baseValue * 1.5).toLocaleString()}`,
      `$${(baseValue * 2).toLocaleString()}`,
      `$${(baseValue * 0.7).toLocaleString()}`
    ];
  };

  const restart = () => {
    setConversation({
      step: 'welcome',
      data: {},
      suggestions: []
    });
    setInputValue('');
    setResults(null);
  };

  const renderConversationStep = () => {
    switch (conversation.step) {
      case 'welcome':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Sparkles className="h-12 w-12 text-yellow-500 mx-auto" />
              <h2 className="text-2xl font-bold">Vehicle Import Eligibility</h2>
              <p className="text-muted-foreground">
                Check import eligibility for Australia, US, UK, and Canada
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <Input
                  placeholder="Paste auction URL or enter VIN number..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && inputValue && handleNext()}
                  className="text-lg text-white bg-gray-800 border-gray-600 placeholder-gray-400"
                />
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInputValue('https://page.auctions.yahoo.co.jp/jp/auction/')}
                    className="text-xs"
                  >
                    Yahoo Japan URL
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInputValue('https://copart.com/lot/')}
                    className="text-xs"
                  >
                    Copart URL
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInputValue('JH4DC53849S123456')}
                    className="text-xs"
                  >
                    Sample VIN
                  </Button>
                </div>
              </div>
              
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setConversation(prev => ({
                      ...prev,
                      step: 'make-selection',
                      data: { ...prev.data, inputMethod: 'manual' },
                      suggestions: popularMakes.slice(0, 6)
                    }));
                  }}
                  className="text-sm text-muted-foreground"
                >
                  Or enter details manually <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        );



      case 'url-input':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Paste your auction or listing URL</span>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="https://page.auctions.yahoo.co.jp/..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && inputValue && handleNext()}
                className="text-lg text-white bg-gray-800 border-gray-600 placeholder-gray-400"
              />
              <div className="flex flex-wrap gap-2">
                {conversation.suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => setInputValue(`https://${suggestion}/example-listing`)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
              {inputValue && (
                <Button 
                  onClick={() => handleNext()}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Analyze URL <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        );

      case 'vin-input':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Enter your vehicle's VIN number</span>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="JH4DC53849S123456 (17 characters)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && inputValue.length === 17 && handleNext()}
                className="text-lg text-white bg-gray-800 border-gray-600 placeholder-gray-400 font-mono"
                maxLength={17}
              />
              <div className="flex flex-wrap gap-2">
                {conversation.suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => setInputValue(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Enter the 17-character Vehicle Identification Number to automatically extract complete vehicle details
              </p>
            </div>
          </div>
        );

      case 'make-selection':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">What make is your vehicle?</span>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="Type make name..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && inputValue && handleNext()}
                className="text-lg text-white bg-gray-800 border-gray-600 placeholder-gray-400"
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {conversation.suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleNext(suggestion)}
                    className="justify-start"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'model-input':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">What model {conversation.data.make}?</span>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="Model name..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && inputValue && handleNext()}
                className="text-lg text-white bg-gray-800 border-gray-600 placeholder-gray-400"
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {conversation.suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleNext(suggestion)}
                    className="justify-start text-sm"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'year-input':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">What year {conversation.data.make} {conversation.data.model}?</span>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="Year..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && inputValue && handleNext()}
                className="text-lg text-white bg-gray-800 border-gray-600 placeholder-gray-400"
                type="number"
              />
              <div className="flex flex-wrap gap-2">
                {conversation.suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleNext(suggestion)}
                    className="text-sm"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'value-input':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Estimated purchase price?</span>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="$25,000"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && inputValue && handleNext()}
                className="text-lg text-white bg-gray-800 border-gray-600 placeholder-gray-400"
              />
              <div className="grid grid-cols-2 gap-2">
                {conversation.suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleNext(suggestion)}
                    className="text-sm"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
              {inputValue && (
                <Button 
                  onClick={() => handleNext()}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Check Eligibility <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        );

      case 'loading':
        return (
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Analyzing eligibility across 4 countries...</p>
          </div>
        );

      case 'results':
        return null; // Results rendered separately
    }
  };

  if (conversation.step === 'results' && results) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">
              {results.vehicle.year} {results.vehicle.make} {results.vehicle.model}
            </h1>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <span>Origin: {results.vehicle.origin}</span>
              <span>Value: ${results.vehicle.estimatedValue.toLocaleString()}</span>
              <span>Eligible Countries: {results.overallSummary.eligibleCountries}/4</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.results.map((result) => (
              <Card key={result.targetCountry} className="bg-gray-900 border-gray-800 text-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {countryFlags[result.targetCountry]} {countryNames[result.targetCountry]}
                    </CardTitle>
                    {result.eligible ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <Badge 
                    variant={result.eligible ? "default" : "destructive"}
                    className={result.eligible ? "bg-green-600" : ""}
                  >
                    {result.eligibilityType}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total Cost</span>
                    <span className="font-semibold">
                      ${Object.values(result.estimatedCosts).reduce((a, b) => a + b, 0).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Timeline</span>
                    <span>{result.timeline.totalWeeks} weeks</span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-300">Next Steps</h4>
                    <ul className="text-xs space-y-1 text-gray-400">
                      {result.nextSteps.slice(0, 2).map((step, index) => (
                        <li key={index}>• {step}</li>
                      ))}
                    </ul>
                  </div>

                  <Separator className="bg-gray-700" />
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Compliance</span>
                      <div className="font-medium">${result.estimatedCosts.complianceCost.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Duties & Taxes</span>
                      <div className="font-medium">${result.estimatedCosts.dutyAndTaxes.toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <DollarSign className="h-6 w-6 text-green-400 mx-auto mb-2" />
                <div className="font-medium">Cheapest Option</div>
                <div className="text-sm text-gray-400">{results.overallSummary.cheapestCountry}</div>
              </div>
              <div className="text-center">
                <Clock className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                <div className="font-medium">Fastest Import</div>
                <div className="text-sm text-gray-400">{results.overallSummary.fastestCountry}</div>
              </div>
              <div className="text-center">
                <CheckCircle className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                <div className="font-medium">Easiest Process</div>
                <div className="text-sm text-gray-400">{results.overallSummary.easiestCountry}</div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button 
              onClick={restart}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Check Another Vehicle
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mt-20">
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardContent className="p-8">
              {renderConversationStep()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}