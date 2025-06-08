import { useState, useEffect } from "react";
import { Search, Car, Globe, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ParsedInput {
  type: 'vin' | 'url' | 'model' | 'chassis';
  value: string;
  confidence: number;
  detectedInfo?: {
    make?: string;
    model?: string;
    year?: number;
    origin?: string;
    platform?: string;
  };
  intent: 'eligibility' | 'cost' | 'compliance' | 'general';
  technicalSpecs?: {
    name?: string;
    years?: string;
    engine?: {
      code?: string;
      type?: string;
      displacement?: string;
      power?: string;
      torque?: string;
      compression?: string;
    };
    drivetrain?: string;
    transmission?: string;
    modifications?: {
      potential?: string;
      popular?: string[];
      powerPotential?: string;
      difficulty?: string;
      notes?: string;
    };
    analysisType?: string;
  };
}

interface SmartInputParserProps {
  onInputParsed: (parsed: ParsedInput) => void;
  placeholder?: string;
  initialValue?: string;
}

export function SmartInputParser({ onInputParsed, placeholder = "Paste VIN, auction link, or car model...", initialValue = "" }: SmartInputParserProps) {
  const [input, setInput] = useState(initialValue);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedInput | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Process initial value if provided
  useEffect(() => {
    if (initialValue && initialValue !== input) {
      setInput(initialValue);
    }
  }, [initialValue]);

  const handleAutoSubmit = async (result: ParsedInput) => {
    setParsing(true);
    
    // Enhanced parsing with server validation
    try {
      const response = await fetch('/api/smart-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: result.value, type: result.type })
      });
      
      if (response.ok) {
        const enhanced = await response.json();
        // Prioritize server-enhanced data over client-side detection
        const finalParsed = { 
          ...result, 
          ...enhanced.data,
          detectedInfo: {
            make: enhanced.data.make || result.detectedInfo?.make || 'Unknown',
            model: enhanced.data.model || result.detectedInfo?.model || 'Unknown',
            year: enhanced.data.year || result.detectedInfo?.year,
            origin: enhanced.data.origin || result.detectedInfo?.origin,
            platform: result.detectedInfo?.platform
          },
          technicalSpecs: enhanced.data.technicalSpecs
        };
        onInputParsed(finalParsed);
      } else {
        onInputParsed(result);
      }
    } catch (error) {
      onInputParsed(result);
    } finally {
      setParsing(false);
    }
  };

  // Real-time input analysis with auto-submission
  useEffect(() => {
    if (input.length < 3) {
      setParsed(null);
      setSuggestions([]);
      return;
    }

    const analyzeAndSubmit = async () => {
      const trimmed = input.trim();
      let result: ParsedInput;

      // VIN Detection (17 characters, alphanumeric)
      if (/^[A-HJ-NPR-Z0-9]{17}$/i.test(trimmed)) {
        result = {
          type: 'vin',
          value: trimmed.toUpperCase(),
          confidence: 95,
          detectedInfo: extractVinInfo(trimmed),
          intent: detectIntent(input, 'vin')
        };
      }
      // URL Detection
      else if (trimmed.includes('http') || trimmed.includes('auction') || trimmed.includes('.com') || trimmed.includes('.jp')) {
        result = {
          type: 'url',
          value: trimmed,
          confidence: 90,
          detectedInfo: extractUrlInfo(trimmed),
          intent: detectIntent(input, 'url')
        };
      }
      // Chassis Code Detection (3-8 characters, specific patterns)
      else if (/^[A-Z0-9]{3,8}$/i.test(trimmed) && isKnownChassisPattern(trimmed)) {
        result = {
          type: 'chassis',
          value: trimmed.toUpperCase(),
          confidence: 85,
          detectedInfo: extractChassisInfo(trimmed),
          intent: detectIntent(input, 'chassis')
        };
      }
      // Model/Make Detection
      else {
        result = {
          type: 'model',
          value: trimmed,
          confidence: 70,
          detectedInfo: extractModelInfo(trimmed),
          intent: detectIntent(input, 'model')
        };
      }

      setParsed(result);
      generateSuggestions(result);

      // Auto-submit if confidence is high enough
      if (result.confidence >= 85 || result.type === 'vin' || result.type === 'url') {
        await handleAutoSubmit(result);
      }
    };

    const debounce = setTimeout(analyzeAndSubmit, 800);
    return () => clearTimeout(debounce);
  }, [input]);

  const extractVinInfo = (vin: string) => {
    // Basic VIN decoding
    const wmi = vin.substring(0, 3);
    const year = getVinYear(vin.charAt(9));
    
    const makeMap: Record<string, string> = {
      'JTD': 'Toyota', 'JF1': 'Subaru', 'JN1': 'Nissan', 'JM1': 'Mazda',
      '1FT': 'Ford', '1G1': 'Chevrolet', '2T1': 'Toyota', 'WBA': 'BMW',
      'WVW': 'Volkswagen', 'SAL': 'Land Rover'
    };

    const make = makeMap[wmi] || 'Unknown';
    const origin = wmi.startsWith('J') ? 'Japan' : 
                  wmi.startsWith('1') || wmi.startsWith('2') ? 'USA' :
                  wmi.startsWith('W') ? 'Germany' : 'Unknown';

    return { make, year, origin };
  };

  const extractUrlInfo = (url: string) => {
    const detectedInfo: any = {};
    
    if (url.includes('yahoo') && url.includes('auctions')) {
      detectedInfo.platform = 'Yahoo Auctions Japan';
      detectedInfo.origin = 'Japan';
    } else if (url.includes('copart')) {
      detectedInfo.platform = 'Copart USA';
      detectedInfo.origin = 'USA';
    } else if (url.includes('carsensor')) {
      detectedInfo.platform = 'CarSensor Japan';
      detectedInfo.origin = 'Japan';
    } else if (url.includes('autotrader')) {
      detectedInfo.platform = 'AutoTrader';
      detectedInfo.origin = 'Various';
    }

    return detectedInfo;
  };

  const extractChassisInfo = (chassis: string) => {
    const chassisMap: Record<string, any> = {
      'JZX100': { make: 'Toyota', model: 'Chaser', origin: 'Japan' },
      'BNR32': { make: 'Nissan', model: 'Skyline GT-R', origin: 'Japan' },
      'FD3S': { make: 'Mazda', model: 'RX-7', origin: 'Japan' },
      'EK9': { make: 'Honda', model: 'Civic Type R', origin: 'Japan' },
      'GC8': { make: 'Subaru', model: 'Impreza WRX', origin: 'Japan' },
      'AE86': { make: 'Toyota', model: 'Corolla', origin: 'Japan' }
    };

    return chassisMap[chassis] || { origin: 'Japan' };
  };

  const extractModelInfo = (text: string) => {
    const words = text.toLowerCase().split(/\s+/);
    const makes = ['toyota', 'nissan', 'honda', 'mazda', 'subaru', 'mitsubishi', 'bmw', 'mercedes', 'audi', 'volkswagen'];
    const make = words.find(word => makes.includes(word));
    
    return { 
      make: make ? make.charAt(0).toUpperCase() + make.slice(1) : undefined,
      origin: make && ['toyota', 'nissan', 'honda', 'mazda', 'subaru', 'mitsubishi'].includes(make) ? 'Japan' : 'Various'
    };
  };

  const detectIntent = (input: string, type: string): ParsedInput['intent'] => {
    const lower = input.toLowerCase();
    if (lower.includes('cost') || lower.includes('price') || lower.includes('$') || lower.includes('expensive')) {
      return 'cost';
    }
    if (lower.includes('legal') || lower.includes('complian') || lower.includes('document') || lower.includes('require')) {
      return 'compliance';
    }
    if (lower.includes('can i') || lower.includes('eligible') || lower.includes('import') || lower.includes('allow')) {
      return 'eligibility';
    }
    return 'general';
  };

  const isKnownChassisPattern = (code: string): boolean => {
    const patterns = ['JZX', 'BNR', 'FD3', 'EK9', 'GC8', 'AE8', 'DC2', 'EG6', 'SW20', 'ZN6'];
    return patterns.some(pattern => code.startsWith(pattern));
  };

  const getVinYear = (char: string): number => {
    const yearMap: Record<string, number> = {
      'Y': 2000, '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005,
      '6': 2006, '7': 2007, '8': 2008, '9': 2009, 'A': 2010, 'B': 2011,
      'C': 2012, 'D': 2013, 'E': 2014, 'F': 2015, 'G': 2016, 'H': 2017,
      'J': 2018, 'K': 2019, 'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023
    };
    return yearMap[char] || 2020;
  };

  const generateSuggestions = (parsed: ParsedInput) => {
    const suggestions: string[] = [];
    
    if (parsed.type === 'vin') {
      suggestions.push("Check import eligibility");
      suggestions.push("Calculate total costs");
      suggestions.push("View compliance requirements");
    } else if (parsed.type === 'url') {
      suggestions.push("Extract vehicle details");
      suggestions.push("Analyze market value");
      suggestions.push("Compare import options");
    } else if (parsed.type === 'chassis') {
      suggestions.push("Find available examples");
      suggestions.push("Check age requirements");
      suggestions.push("Compare market prices");
    } else {
      suggestions.push("Search available vehicles");
      suggestions.push("Check import eligibility");
      suggestions.push("View popular options");
    }

    setSuggestions(suggestions);
  };

  const handleManualSubmit = async () => {
    if (!parsed) return;
    await handleAutoSubmit(parsed);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vin': return <Car className="h-4 w-4" />;
      case 'url': return <Globe className="h-4 w-4" />;
      case 'chassis': return <Zap className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-100 text-green-800";
    if (confidence >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="relative">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="text-lg py-6 pr-20 border-2 border-gray-200 focus:border-blue-500 transition-colors"
          onKeyPress={(e) => e.key === 'Enter' && parsed && handleManualSubmit()}
        />
        
        {parsed && (
          <Button
            onClick={handleManualSubmit}
            disabled={parsing || !parsed}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            size="sm"
          >
            {parsing ? "..." : <ArrowRight className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {parsed && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getTypeIcon(parsed.type)}
                <span className="font-medium capitalize">{parsed.type} Detected</span>
                <Badge className={getConfidenceColor(parsed.confidence)}>
                  {parsed.confidence}% confidence
                </Badge>
              </div>
              <Badge variant="outline">
                Intent: {parsed.intent}
              </Badge>
            </div>

            {parsed.detectedInfo && Object.keys(parsed.detectedInfo).length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                {parsed.detectedInfo.make && (
                  <div className="text-sm">
                    <span className="text-gray-600">Make:</span>
                    <span className="ml-1 font-medium">{parsed.detectedInfo.make}</span>
                  </div>
                )}
                {parsed.detectedInfo.model && (
                  <div className="text-sm">
                    <span className="text-gray-600">Model:</span>
                    <span className="ml-1 font-medium">{parsed.detectedInfo.model}</span>
                  </div>
                )}
                {parsed.detectedInfo.year && (
                  <div className="text-sm">
                    <span className="text-gray-600">Year:</span>
                    <span className="ml-1 font-medium">{parsed.detectedInfo.year}</span>
                  </div>
                )}
                {parsed.detectedInfo.origin && (
                  <div className="text-sm">
                    <span className="text-gray-600">Origin:</span>
                    <span className="ml-1 font-medium">{parsed.detectedInfo.origin}</span>
                  </div>
                )}
                {parsed.detectedInfo.platform && (
                  <div className="text-sm col-span-2">
                    <span className="text-gray-600">Platform:</span>
                    <span className="ml-1 font-medium">{parsed.detectedInfo.platform}</span>
                  </div>
                )}
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, idx) => (
                  <Badge key={idx} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    {suggestion}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {input.length > 0 && !parsed && (
        <div className="text-center text-gray-500 text-sm py-4">
          Keep typing... I'll detect VINs, auction URLs, chassis codes, or vehicle models
        </div>
      )}
    </div>
  );
}