import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, Clock, DollarSign, FileText, Globe, Search, Truck, Calculator } from 'lucide-react';

interface VehicleData {
  make: string;
  model: string;
  year: number;
  origin: string;
  estimatedValue: number;
  vin?: string;
  engine?: string;
}

interface ComplianceResult {
  targetCountry: string;
  targetState: string;
  eligible: boolean;
  complianceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  estimatedCosts: {
    shipping: number;
    duties: number;
    compliance: number;
    registration: number;
    total: number;
  };
  timeline: {
    totalWeeks: number;
    breakdown: {
      shipping: number;
      clearance: number;
      compliance: number;
      registration: number;
    };
  };
  requirements: string[];
  risks: string[];
  documentation: string[];
  nextSteps: string[];
}

interface MarketListing {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  location: string;
  source: string;
  condition: string;
  mileage: string;
  images: string[];
}

type FlowStep = 'entry' | 'extraction' | 'country-selection' | 'state-selection' | 'analysis' | 'results' | 'market-data';

const COUNTRIES = [
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
];

const STATES = {
  AU: ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'],
  US: ['CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI'],
  UK: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  CA: ['ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'YT', 'NU'],
};

export default function ProfessionalImportFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('entry');
  const [vehicleInput, setVehicleInput] = useState('');
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');

  // Vehicle extraction mutation
  const extractVehicleMutation = useMutation({
    mutationFn: async (input: string) => {
      setCurrentStep('extraction');
      setProgress(25);
      setCurrentTask('Analyzing vehicle information...');
      
      const response = await fetch('/api/extract-vehicle-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });
      
      if (!response.ok) throw new Error('Failed to extract vehicle data');
      return response.json();
    },
    onSuccess: (data) => {
      if (!data.success || !data.data) {
        throw new Error('Invalid vehicle data received');
      }
      
      setVehicleData({
        make: data.data.make,
        model: data.data.model,
        year: data.data.year,
        origin: data.data.origin,
        estimatedValue: data.data.estimatedValue,
        vin: data.data.vin,
        engine: data.data.engine
      });
      
      setProgress(50);
      setCurrentTask('Vehicle data extracted successfully');
      
      setTimeout(() => {
        setCurrentStep('country-selection');
        setProgress(0);
        setCurrentTask('');
      }, 1500);
    },
    onError: (error) => {
      console.error('Vehicle extraction failed:', error);
      setCurrentStep('entry');
      setProgress(0);
      setCurrentTask('Please check your vehicle information and try again');
    }
  });

  // Compliance analysis mutation
  const analyzeComplianceMutation = useMutation({
    mutationFn: async () => {
      setCurrentStep('analysis');
      setProgress(25);
      setCurrentTask('Analyzing import regulations...');
      
      const response = await fetch('/api/professional-compliance-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle: vehicleData,
          targetCountry: selectedCountry,
          targetState: selectedState
        })
      });
      
      if (!response.ok) throw new Error('Failed to analyze compliance');
      return response.json();
    },
    onSuccess: (data) => {
      setComplianceResult(data);
      setProgress(100);
      setCurrentTask('Analysis complete');
      
      setTimeout(() => {
        setCurrentStep('results');
        setProgress(0);
        setCurrentTask('');
      }, 1000);
    },
    onError: (error) => {
      console.error('Compliance analysis failed:', error);
      setCurrentStep('country-selection');
      setCurrentTask('Analysis failed. Please try again.');
    }
  });

  // Market data query using existing live market data system
  const { data: marketData } = useQuery({
    queryKey: ['/api/live-market-data', vehicleData?.make, vehicleData?.model],
    enabled: currentStep === 'market-data' && vehicleData !== null,
  });

  const listings = marketData?.vehicles || [];

  const handleVehicleSubmit = () => {
    if (vehicleInput.trim()) {
      extractVehicleMutation.mutate(vehicleInput);
    }
  };

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setSelectedState('');
    setCurrentStep('state-selection');
  };

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    if (vehicleData) {
      analyzeComplianceMutation.mutate();
    }
  };

  const formatCurrency = (amount: number, currency = 'AUD') => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-50 border-green-200';
      case 'B': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'C': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'D': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'F': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Entry Step
  if (currentStep === 'entry') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Professional Import Analysis</CardTitle>
            <p className="text-gray-600">
              Enter vehicle details for comprehensive compliance and cost analysis
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Vehicle Information
              </label>
              <Input
                value={vehicleInput}
                onChange={(e) => setVehicleInput(e.target.value)}
                placeholder="Enter VIN, auction URL, or vehicle details (e.g., 2015 Nissan Skyline GT-R)"
                className="w-full"
                onKeyPress={(e) => e.key === 'Enter' && handleVehicleSubmit()}
              />
            </div>
            <Button 
              onClick={handleVehicleSubmit}
              className="w-full"
              size="lg"
              disabled={!vehicleInput.trim() || extractVehicleMutation.isPending}
            >
              {extractVehicleMutation.isPending ? 'Analyzing...' : 'Start Analysis'}
            </Button>
            
            <div className="grid grid-cols-2 gap-4 pt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Real-time compliance checking
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Accurate cost calculations
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                Timeline projections
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-600" />
                Documentation requirements
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extraction Step
  if (currentStep === 'extraction') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <h3 className="text-lg font-semibold">Extracting Vehicle Data</h3>
              <p className="text-gray-600">{currentTask}</p>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Country Selection Step
  if (currentStep === 'country-selection') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Select Target Country</CardTitle>
            <p className="text-gray-600">
              Choose your import destination for {vehicleData?.year} {vehicleData?.make} {vehicleData?.model}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {COUNTRIES.map((country) => (
                <Card 
                  key={country.code}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
                  onClick={() => handleCountrySelect(country.code)}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl mb-2">{country.flag}</div>
                    <h3 className="font-semibold">{country.name}</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Click to analyze import requirements
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // State Selection Step
  if (currentStep === 'state-selection') {
    const selectedCountryData = COUNTRIES.find(c => c.code === selectedCountry);
    const availableStates = STATES[selectedCountry as keyof typeof STATES] || [];

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Select State/Province in {selectedCountryData?.name}
            </CardTitle>
            <p className="text-gray-600">
              State-specific regulations apply for importing your {vehicleData?.make} {vehicleData?.model}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableStates.map((state) => (
                <Button
                  key={state}
                  variant="outline"
                  className="h-12"
                  onClick={() => handleStateSelect(state)}
                >
                  {state}
                </Button>
              ))}
            </div>
            
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => setCurrentStep('country-selection')}
            >
              ← Back to Country Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Analysis Step
  if (currentStep === 'analysis') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <h3 className="text-lg font-semibold">Analyzing Import Requirements</h3>
              <p className="text-gray-600">{currentTask}</p>
              <Progress value={progress} className="w-full" />
              
              <div className="text-sm text-gray-500 space-y-1">
                <div>✓ Checking vehicle eligibility</div>
                <div>✓ Calculating duties and taxes</div>
                <div>✓ Analyzing compliance requirements</div>
                <div>✓ Estimating timelines</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results Step
  if (currentStep === 'results' && complianceResult) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Import Analysis Results</span>
              <Badge className={`text-lg px-3 py-1 ${getGradeColor(complianceResult.complianceGrade)}`}>
                Grade {complianceResult.complianceGrade}
              </Badge>
            </CardTitle>
            <p className="text-gray-600">
              {vehicleData?.year} {vehicleData?.make} {vehicleData?.model} → {selectedCountry} ({selectedState})
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Cost
                </h4>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(complianceResult.estimatedCosts.total)}
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Shipping: {formatCurrency(complianceResult.estimatedCosts.shipping)}</div>
                  <div>Duties: {formatCurrency(complianceResult.estimatedCosts.duties)}</div>
                  <div>Compliance: {formatCurrency(complianceResult.estimatedCosts.compliance)}</div>
                  <div>Registration: {formatCurrency(complianceResult.estimatedCosts.registration)}</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 w-full"
                  onClick={() => {
                    const params = new URLSearchParams();
                    params.set("make", vehicleData?.make || "");
                    params.set("model", vehicleData?.model || "");
                    params.set("year", vehicleData?.year?.toString() || "");
                    params.set("vehiclePrice", vehicleData?.estimatedValue?.toString() || "");
                    params.set("origin", vehicleData?.origin || "japan");
                    window.location.href = `/import-calculator?${params.toString()}`;
                  }}
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Detailed Cost Calculator
                </Button>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timeline
                </h4>
                <p className="text-2xl font-bold text-blue-600">
                  {complianceResult.timeline.totalWeeks} weeks
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Shipping: {complianceResult.timeline.breakdown.shipping} weeks</div>
                  <div>Clearance: {complianceResult.timeline.breakdown.clearance} weeks</div>
                  <div>Compliance: {complianceResult.timeline.breakdown.compliance} weeks</div>
                  <div>Registration: {complianceResult.timeline.breakdown.registration} weeks</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Status
                </h4>
                <p className={`text-lg font-semibold ${complianceResult.eligible ? 'text-green-600' : 'text-red-600'}`}>
                  {complianceResult.eligible ? 'Import Eligible' : 'Import Restricted'}
                </p>
                <div className="text-sm text-gray-600">
                  {complianceResult.requirements.length} requirements
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements and Documentation */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Required Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {complianceResult.documentation.map((doc, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{doc}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Compliance Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {complianceResult.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {complianceResult.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-sm">{step}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                <Button 
                  className="w-full"
                  onClick={() => setCurrentStep('market-data')}
                >
                  <Search className="w-4 h-4 mr-2" />
                  View Available Vehicles
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const params = new URLSearchParams();
                    params.set("make", vehicleData?.make || "");
                    params.set("model", vehicleData?.model || "");
                    params.set("year", vehicleData?.year?.toString() || "");
                    window.location.href = `/value-estimator?${params.toString()}`;
                  }}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Market Value Analysis
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/shipping-calculator'}
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Get Shipping Quotes
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/compliance-checker'}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Advanced Compliance Check
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/port-intelligence'}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Port Intelligence
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Market Data Step
  if (currentStep === 'market-data') {
    const listings = marketData?.vehicles || [];
    
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Available Vehicles</span>
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep('results')}
              >
                ← Back to Results
              </Button>
            </CardTitle>
            <p className="text-gray-600">
              Current market listings for {vehicleData?.make} {vehicleData?.model}
            </p>
          </CardHeader>
          <CardContent>
            {listings.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.slice(0, 6).map((listing: MarketListing) => (
                  <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gray-200 relative flex items-center justify-center">
                      {listing.images?.[0] ? (
                        <img 
                          src={listing.images[0]} 
                          alt={`${listing.year} ${listing.make} ${listing.model}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent && !parent.querySelector('.no-image-placeholder')) {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'no-image-placeholder text-gray-500 text-center px-4';
                              placeholder.innerHTML = '<div class="text-sm">No Image Available</div>';
                              parent.appendChild(placeholder);
                            }
                          }}
                        />
                      ) : (
                        <div className="text-gray-500 text-center px-4">
                          <div className="text-sm">No Image Available</div>
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2">
                        {listing.source}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold">
                        {listing.year} {listing.make} {listing.model}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{listing.location}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(listing.price, listing.currency)}
                        </span>
                        <Badge variant="outline">{listing.condition}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No vehicles currently available in this category</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }



  return null;
}