import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, FileText, Clock, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ComplianceForm {
  id: number;
  formCode: string;
  formName: string;
  formDescription: string;
  formUrl: string;
  pdfUrl: string;
  requiredFor: string[];
  mandatory: boolean;
  processingTimeDays: number;
  fees: {
    amount: number;
    currency: string;
    description: string;
  };
  lastVerified: string;
}

interface Country {
  id: number;
  countryCode: string;
  countryName: string;
  currency: string;
  importAgencyName: string;
  agencyWebsite: string;
}

interface ComplianceData {
  country: Country;
  forms: ComplianceForm[];
  total: number;
  mandatory: number;
  optional: number;
}

interface ComplianceFormsDisplayProps {
  countryCode: string;
  vehicleType?: string;
}

export function ComplianceFormsDisplay({ countryCode, vehicleType = 'passenger_cars' }: ComplianceFormsDisplayProps) {
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComplianceForms();
  }, [countryCode, vehicleType]);

  const fetchComplianceForms = async () => {
    try {
      setLoading(true);
      const url = vehicleType 
        ? `/api/compliance-forms/${countryCode}/${vehicleType}`
        : `/api/compliance-forms/${countryCode}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch compliance forms');
      }
      
      const data = await response.json();
      setComplianceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !complianceData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load compliance forms</p>
            <Button 
              variant="outline" 
              onClick={fetchComplianceForms}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { country, forms } = complianceData;
  const mandatoryForms = forms.filter(form => form.mandatory);
  const optionalForms = forms.filter(form => !form.mandatory);

  return (
    <div className="space-y-6">
      {/* Country Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">
              {getCountryFlag(country.countryCode)}
            </span>
            <div>
              <h2 className="text-xl font-bold">{country.countryName} Import Requirements</h2>
              <p className="text-sm text-gray-600 font-normal">
                {country.importAgencyName}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{forms.length}</div>
              <div className="text-sm text-gray-600">Total Forms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{mandatoryForms.length}</div>
              <div className="text-sm text-gray-600">Mandatory</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{optionalForms.length}</div>
              <div className="text-sm text-gray-600">Optional</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.max(...forms.map(f => f.processingTimeDays || 0))}
              </div>
              <div className="text-sm text-gray-600">Max Days</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forms Tabs */}
      <Tabs defaultValue="mandatory" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mandatory" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Mandatory ({mandatoryForms.length})
          </TabsTrigger>
          <TabsTrigger value="optional" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Optional ({optionalForms.length})
          </TabsTrigger>
          <TabsTrigger value="all">All Forms</TabsTrigger>
        </TabsList>

        <TabsContent value="mandatory" className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-red-800 mb-2">Mandatory Forms Required</h3>
            <p className="text-sm text-red-700">
              These forms must be completed for vehicle import approval. Failure to submit any mandatory form will result in import rejection.
            </p>
          </div>
          {mandatoryForms.map(form => (
            <FormCard key={form.id} form={form} />
          ))}
        </TabsContent>

        <TabsContent value="optional" className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-green-800 mb-2">Optional Forms Available</h3>
            <p className="text-sm text-green-700">
              These forms may provide benefits like reduced fees, faster processing, or special exemptions.
            </p>
          </div>
          {optionalForms.map(form => (
            <FormCard key={form.id} form={form} />
          ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {forms.map(form => (
            <FormCard key={form.id} form={form} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FormCard({ form }: { form: ComplianceForm }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <span className="text-lg">{form.formName}</span>
                {form.formCode && (
                  <Badge variant="secondary" className="ml-2">
                    {form.formCode}
                  </Badge>
                )}
              </div>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              {form.formDescription}
            </p>
          </div>
          <Badge variant={form.mandatory ? 'destructive' : 'secondary'}>
            {form.mandatory ? 'Mandatory' : 'Optional'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Vehicle Types */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Applies to:</span>
            {form.requiredFor?.map(type => (
              <Badge key={type} variant="outline" className="text-xs">
                {formatVehicleType(type)}
              </Badge>
            ))}
          </div>

          {/* Processing Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">Processing Time</div>
                <div className="text-xs text-gray-600">
                  {form.processingTimeDays ? `${form.processingTimeDays} days` : 'Not specified'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">Fee</div>
                <div className="text-xs text-gray-600">
                  {form.fees?.amount > 0 
                    ? `${form.fees.currency} ${form.fees.amount.toLocaleString()}`
                    : 'No fee'
                  }
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">Last Verified</div>
                <div className="text-xs text-gray-600">
                  {form.lastVerified 
                    ? new Date(form.lastVerified).toLocaleDateString()
                    : 'Unknown'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t">
            {form.formUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => window.open(form.formUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                View Form
              </Button>
            )}
            {form.pdfUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => window.open(form.pdfUrl, '_blank')}
              >
                <FileText className="h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getCountryFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    'USA': '🇺🇸',
    'CAN': '🇨🇦',
    'GBR': '🇬🇧',
    'AUS': '🇦🇺',
    'DEU': '🇩🇪',
    'JPN': '🇯🇵'
  };
  return flags[countryCode] || '🌍';
}

function formatVehicleType(type: string): string {
  const typeNames: Record<string, string> = {
    'passenger_cars': 'Passenger Cars',
    'commercial': 'Commercial Vehicles',
    'classic': 'Classic/Vintage',
    'motorcycle': 'Motorcycles'
  };
  return typeNames[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default ComplianceFormsDisplay;