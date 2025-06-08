import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  Ship, 
  FileText,
  Phone,
  Download,
  ArrowRight,
  Star,
  AlertTriangle,
  TrendingUp,
  Globe,
  Zap
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface VehicleData {
  make: string;
  model: string;
  year: number;
  origin: string;
  estimatedValue: number;
}

interface EligibilityResult {
  targetCountry: string;
  eligible: boolean;
  eligibilityType: string;
  estimatedCosts: {
    complianceCost: number;
    modificationCost: number;
    inspectionFees: number;
    dutyAndTaxes: number;
  };
  timeline: {
    totalWeeks: number;
  };
  restrictions: string[];
  warnings: string[];
}

interface AuctionListing {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  location: string;
  source: string;
  images: string[];
  condition: string;
}

type FlowStep = 'entry' | 'processing' | 'summary' | 'costs' | 'auctions' | 'services' | 'action';

export default function ImportFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('entry');
  const [vehicleInput, setVehicleInput] = useState('');
  const [targetCountry, setTargetCountry] = useState('AU');
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [eligibilityResults, setEligibilityResults] = useState<EligibilityResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<EligibilityResult | null>(null);

  // Auto-detect and process URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inputParam = urlParams.get('input');
    
    if (inputParam) {
      setVehicleInput(inputParam);
      setCurrentStep('processing');
      extractMutation.mutate(inputParam);
    }
  }, []);

  // Vehicle extraction mutation
  const extractMutation = useMutation({
    mutationFn: async (input: string) => {
      const response = await apiRequest('POST', '/api/extract-vehicle-data', { input });
      return response.json();
    },
    onSuccess: (data: any) => {
      setVehicleData(data.vehicle);
      // Automatically check eligibility
      checkEligibilityMutation.mutate({
        ...data.vehicle,
        targetCountries: [targetCountry]
      });
    }
  });

  // Eligibility check mutation
  const checkEligibilityMutation = useMutation({
    mutationFn: async (vehicle: any) => {
      const response = await apiRequest('POST', '/api/check-vehicle-eligibility', vehicle);
      return response.json();
    },
    onSuccess: (data: any) => {
      setEligibilityResults(data.results);
      setSelectedResult(data.results[0]);
      setCurrentStep('summary');
    }
  });

  // Auction listings query (triggered when needed)
  const { data: auctionListings = [] } = useQuery({
    queryKey: ['/api/market-data', vehicleData?.make, vehicleData?.model],
    enabled: currentStep === 'auctions' && vehicleData !== null,
  });

  const handleVehicleSubmit = () => {
    if (vehicleInput.trim()) {
      extractMutation.mutate(vehicleInput);
    }
  };

  const calculateImportScore = (result: EligibilityResult) => {
    if (!result.eligible) return 0;
    
    const totalCost = Object.values(result.estimatedCosts).reduce((a, b) => a + b, 0);
    const timeScore = Math.max(0, 100 - (result.timeline.totalWeeks * 5));
    const costScore = Math.max(0, 100 - (totalCost / 1000));
    const restrictionScore = Math.max(0, 100 - (result.restrictions.length * 20));
    
    return Math.round((timeScore + costScore + restrictionScore) / 3);
  };

  const formatCurrency = (amount: number, currency = 'AUD') => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  // Progressive feedback hooks (must be called unconditionally)
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('Extracting vehicle data...');

  useEffect(() => {
    if (currentStep === 'processing' || extractMutation.isPending || checkEligibilityMutation.isPending) {
      const tasks = [
        'Extracting vehicle data...',
        'Analyzing auction history...',
        'Calculating import costs...',
        'Checking global eligibility...',
        'Finding similar vehicles...',
        'Preparing your report...'
      ];

      let taskIndex = 0;
      let progressValue = 0;

      const interval = setInterval(() => {
        progressValue += Math.random() * 15 + 5;
        if (progressValue > 95) progressValue = 95;
        
        setProgress(progressValue);
        
        if (progressValue > 20 * (taskIndex + 1) && taskIndex < tasks.length - 1) {
          taskIndex++;
          setCurrentTask(tasks[taskIndex]);
        }
      }, 800);

      return () => clearInterval(interval);
    }
  }, [currentStep, extractMutation.isPending, checkEligibilityMutation.isPending]);

  // Show processing screen with progressive feedback
  if (currentStep === 'processing' || extractMutation.isPending || checkEligibilityMutation.isPending) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-8 max-w-md">
          <div className="w-20 h-20 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-amber-500">Analyzing Your Vehicle</h2>
            <p className="text-xl text-gray-300">{currentTask}</p>
            
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400">{Math.round(progress)}% complete</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Market data updated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Global compliance check</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Cost calculation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Auction matching</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">

        {/* Step 1: Vehicle Entry */}
        {currentStep === 'entry' && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Search className="w-6 h-6" />
                Enter Your Vehicle
              </CardTitle>
              <p className="text-gray-600">
                VIN, URL, or vehicle description - we'll extract the details
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Input
                  placeholder="VIN: JH4NA1157MT001234 or URL: https://carsales.com.au/..."
                  value={vehicleInput}
                  onChange={(e) => setVehicleInput(e.target.value)}
                  className="text-lg p-4"
                />
                <div className="flex gap-4">
                  <select 
                    value={targetCountry}
                    onChange={(e) => setTargetCountry(e.target.value)}
                    className="flex-1 p-3 border rounded-lg"
                  >
                    <option value="AU">Australia</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                  </select>
                  <Button 
                    onClick={handleVehicleSubmit}
                    disabled={!vehicleInput.trim() || extractMutation.isPending}
                    className="px-8"
                  >
                    {extractMutation.isPending ? 'Analyzing...' : 'Start Import Analysis'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>

              {extractMutation.error && (
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    Unable to extract vehicle data. Please check your input and try again.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Smart Summary Card */}
        {currentStep === 'summary' && vehicleData && selectedResult && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {vehicleData.year} {vehicleData.make} {vehicleData.model}
                    </CardTitle>
                    <p className="opacity-90">Import Analysis Complete</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(calculateImportScore(selectedResult))}`}>
                      {calculateImportScore(selectedResult)}
                    </div>
                    <Badge variant="secondary" className="bg-white/20">
                      {getScoreBadge(calculateImportScore(selectedResult))}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  
                  {/* Eligibility Status */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {selectedResult.eligible ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <h3 className="font-semibold">Eligibility</h3>
                    </div>
                    <div>
                      <Badge variant={selectedResult.eligible ? "default" : "destructive"}>
                        {selectedResult.eligibilityType}
                      </Badge>
                      {selectedResult.restrictions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {selectedResult.restrictions.slice(0, 2).map((restriction, idx) => (
                            <p key={idx} className="text-sm text-red-600">{restriction}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Total Cost */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold">Total Import Cost</h3>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(
                          Object.values(selectedResult.estimatedCosts).reduce((a, b) => a + b, 0)
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Including duties, compliance, and fees
                      </p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold">Timeline</h3>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedResult.timeline.totalWeeks} weeks
                      </div>
                      <p className="text-sm text-gray-600">
                        From purchase to registration
                      </p>
                    </div>
                  </div>
                </div>

                {selectedResult.warnings.length > 0 && (
                  <Alert className="mt-6">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Important:</strong> {selectedResult.warnings[0]}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4 mt-6">
                  <Button 
                    onClick={() => setCurrentStep('costs')}
                    className="flex-1"
                  >
                    View Cost Breakdown
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentStep('auctions')}
                  >
                    Find Similar Vehicles
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Cost Breakdown */}
        {currentStep === 'costs' && selectedResult && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6" />
                  Detailed Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(selectedResult.estimatedCosts).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-3 border-b">
                      <div>
                        <h4 className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {key === 'dutyAndTaxes' ? 'Import duty + GST + luxury car tax' :
                           key === 'complianceCost' ? 'Safety and emissions compliance' :
                           key === 'modificationCost' ? 'Required vehicle modifications' :
                           'Official inspection and processing fees'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(value)}</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-4 text-xl font-bold border-t-2">
                    <span>Total Import Cost</span>
                    <span className="text-green-600">
                      {formatCurrency(Object.values(selectedResult.estimatedCosts).reduce((a, b) => a + b, 0))}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button onClick={() => setCurrentStep('auctions')} className="flex-1">
                    Find Vehicles in This Range
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentStep('summary')}>
                    Back to Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Auction Suggestions */}
        {currentStep === 'auctions' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  Available Vehicles
                </CardTitle>
                <p className="text-gray-600">
                  Live auction listings matching your criteria
                </p>
              </CardHeader>
              <CardContent>
                {Array.isArray(auctionListings) && auctionListings.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {auctionListings.slice(0, 6).map((listing: AuctionListing) => (
                      <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-video bg-gray-200 relative">
                          {listing.images?.[0] && (
                            <img 
                              src={listing.images[0]} 
                              alt={`${listing.year} ${listing.make} ${listing.model}`}
                              className="w-full h-full object-cover"
                            />
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
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Loading available vehicles...</p>
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <Button onClick={() => setCurrentStep('services')} className="flex-1">
                    Compare Services
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentStep('costs')}>
                    Back to Costs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5: Service Comparison */}
        {currentStep === 'services' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6" />
                  Import Services
                </CardTitle>
                <p className="text-gray-600">
                  Professional services to handle your import
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  
                  {/* Shipping Services */}
                  <Card className="border-2">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <Ship className="w-5 h-5" />
                        <h3 className="font-semibold">Shipping & Logistics</h3>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Ocean freight</span>
                          <span className="font-medium">$2,500</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Port handling</span>
                          <span className="font-medium">$450</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Documentation</span>
                          <span className="font-medium">$200</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>$3,150</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        Get Quote
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Compliance Services */}
                  <Card className="border-2 border-blue-200 bg-blue-50/50">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        <h3 className="font-semibold">Full Service Import</h3>
                      </div>
                      <Badge className="w-fit">Recommended</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Complete import handling</span>
                          <span className="font-medium">$4,200</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Compliance work</span>
                          <span className="font-medium">$1,500</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Registration assistance</span>
                          <span className="font-medium">$350</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>$6,050</span>
                        </div>
                      </div>
                      <Button className="w-full">
                        Choose Full Service
                      </Button>
                    </CardContent>
                  </Card>

                  {/* DIY Support */}
                  <Card className="border-2">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        <h3 className="font-semibold">DIY Support</h3>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Import guide & templates</span>
                          <span className="font-medium">$299</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expert consultation</span>
                          <span className="font-medium">$150/hr</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Document review</span>
                          <span className="font-medium">$200</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between font-semibold">
                          <span>Starting from</span>
                          <span>$299</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button onClick={() => setCurrentStep('action')} className="flex-1">
                    Complete Import Plan
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentStep('auctions')}>
                    Back to Vehicles
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 6: Action & CTA */}
        {currentStep === 'action' && vehicleData && selectedResult && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-2xl">Your Import Plan is Ready</CardTitle>
                <p className="text-gray-600">
                  {vehicleData.year} {vehicleData.make} {vehicleData.model} → {targetCountry}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(Object.values(selectedResult.estimatedCosts).reduce((a, b) => a + b, 0))}
                    </div>
                    <p className="text-sm text-gray-600">Total Cost</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedResult.timeline.totalWeeks} weeks
                    </div>
                    <p className="text-sm text-gray-600">Timeline</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className={`text-2xl font-bold ${getScoreColor(calculateImportScore(selectedResult))}`}>
                      {calculateImportScore(selectedResult)}/100
                    </div>
                    <p className="text-sm text-gray-600">Import Score</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <Button size="lg" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Book Consultation
                  </Button>
                  <Button size="lg" variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download Report
                  </Button>
                  <Button size="lg" variant="outline" className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Save to Favorites
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-4">
                    Ready to start a new import analysis?
                  </p>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setCurrentStep('entry');
                      setVehicleInput('');
                      setVehicleData(null);
                      setEligibilityResults([]);
                      setSelectedResult(null);
                    }}
                  >
                    Start New Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}