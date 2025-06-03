import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  Download,
  ExternalLink,
  Building,
  Shield
} from "lucide-react";

const documentationSteps = [
  {
    step: 1,
    title: "SEVS Application",
    authority: "Department of Infrastructure, Transport, Regional Development, Communications and the Arts",
    timeframe: "10-15 business days",
    cost: 358.70,
    description: "Specialist and Enthusiast Vehicle Scheme application for vehicles over 25 years old",
    documents: [
      "VIN verification certificate",
      "Model eligibility proof from manufacturer",
      "Vehicle identification photos",
      "Proof of ownership"
    ],
    officialLink: "https://www.infrastructure.gov.au/vehicles/imports/sevs"
  },
  {
    step: 2,
    title: "Import Declaration",
    authority: "Australian Border Force",
    timeframe: "1-3 business days",
    cost: 0,
    description: "Customs declaration and clearance through Australian Border Force",
    documents: [
      "Commercial invoice",
      "Bill of lading or airway bill",
      "SEVS approval certificate",
      "Import permit"
    ],
    officialLink: "https://www.abf.gov.au/importing-exporting-and-manufacturing/importing/how-to-import/make-import-declaration"
  },
  {
    step: 3,
    title: "Quarantine Inspection",
    authority: "Department of Agriculture, Fisheries and Forestry",
    timeframe: "2-5 business days",
    cost: 185.00,
    description: "Biosecurity inspection and steam cleaning requirements",
    documents: [
      "Steam cleaning certificate",
      "Quarantine inspection form",
      "Biosecurity clearance"
    ],
    officialLink: "https://www.agriculture.gov.au/biosecurity-trade/import/goods/vehicles"
  },
  {
    step: 4,
    title: "State Registration",
    authority: "State Transport Authority",
    timeframe: "1-2 business days",
    cost: "Varies by state",
    description: "Vehicle registration and roadworthy inspection in your state",
    documents: [
      "Roadworthy certificate",
      "Proof of identity",
      "Import approval documentation",
      "Insurance certificate"
    ],
    officialLink: "Varies by state"
  }
];

const stateRegistrationData = {
  nsw: {
    authority: "Service NSW",
    cost: "From $349",
    inspectionRequired: true
  },
  vic: {
    authority: "VicRoads",
    cost: "From $318",
    inspectionRequired: true
  },
  qld: {
    authority: "Queensland Transport",
    cost: "From $295",
    inspectionRequired: true
  },
  wa: {
    authority: "Department of Transport WA",
    cost: "From $387",
    inspectionRequired: true
  },
  sa: {
    authority: "Service SA",
    cost: "From $445",
    inspectionRequired: true
  },
  tas: {
    authority: "Service Tasmania",
    cost: "From $329",
    inspectionRequired: true
  },
  act: {
    authority: "Access Canberra",
    cost: "From $478",
    inspectionRequired: true
  },
  nt: {
    authority: "NT Government",
    cost: "From $289",
    inspectionRequired: true
  }
};

const complianceRequirements = [
  {
    category: "ADR Compliance",
    description: "Australian Design Rules compliance for safety and emissions",
    requirements: [
      "ADR compliance plate installation",
      "Emissions testing if required",
      "Safety modifications if needed",
      "Engineering certificate for modifications"
    ]
  },
  {
    category: "Right Hand Drive",
    description: "Conversion requirements for left-hand drive vehicles",
    requirements: [
      "Professional RHD conversion",
      "Engineering certification",
      "Headlight alignment",
      "Speedometer conversion to km/h"
    ]
  },
  {
    category: "Safety Standards",
    description: "Australian safety standard compliance",
    requirements: [
      "Seatbelt compliance",
      "Child restraint anchor points",
      "Side impact protection",
      "Daytime running lights"
    ]
  }
];

export default function DocumentationAssistant() {
  const [selectedState, setSelectedState] = useState<string>("nsw");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Australian Import Documentation Assistant
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Official step-by-step documentation requirements for importing vehicles to Australia
          </p>
        </div>

        <Tabs defaultValue="process" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="process">Import Process</TabsTrigger>
            <TabsTrigger value="compliance">Compliance Requirements</TabsTrigger>
            <TabsTrigger value="registration">State Registration</TabsTrigger>
          </TabsList>

          {/* Import Process Tab */}
          <TabsContent value="process" className="space-y-6">
            <div className="grid gap-6">
              {documentationSteps.map((step, index) => (
                <Card key={step.step} className="shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold">
                          {step.step}
                        </div>
                        <div>
                          <CardTitle className="text-xl">{step.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {step.authority}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          {step.timeframe}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                          <DollarSign className="h-4 w-4" />
                          {typeof step.cost === 'number' ? `$${step.cost}` : step.cost}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {step.description}
                    </p>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Required Documents:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {step.documents.map((doc, docIndex) => (
                          <div key={docIndex} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        <strong>Official Authority:</strong> {step.authority}
                        <br />
                        Contact directly for current requirements and processing times.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Processing times and costs are estimates based on official government sources. 
                Always verify current requirements with the relevant authorities before proceeding.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Compliance Requirements Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid gap-6">
              {complianceRequirements.map((category, index) => (
                <Card key={index} className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {category.category}
                    </CardTitle>
                    <CardDescription>
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.requirements.map((requirement, reqIndex) => (
                        <div key={reqIndex} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300">{requirement}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="shadow-lg bg-amber-50 dark:bg-amber-900/20 border-amber-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                      Professional Engineering Required
                    </h4>
                    <p className="text-amber-700 dark:text-amber-400 text-sm">
                      Many compliance modifications require certification from a qualified automotive engineer. 
                      Budget additional time and costs for professional engineering assessments and certifications.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* State Registration Tab */}
          <TabsContent value="registration" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Select Your State/Territory:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(stateRegistrationData).map(([code, data]) => (
                  <Button
                    key={code}
                    variant={selectedState === code ? "default" : "outline"}
                    onClick={() => setSelectedState(code)}
                    className="h-12"
                  >
                    {code.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {selectedState && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {selectedState.toUpperCase()} Registration Requirements
                  </CardTitle>
                  <CardDescription>
                    Official registration process for {stateRegistrationData[selectedState as keyof typeof stateRegistrationData].authority}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Authority:</span>
                        <p className="font-semibold">{stateRegistrationData[selectedState as keyof typeof stateRegistrationData].authority}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Registration Cost:</span>
                        <p className="font-semibold text-green-600">{stateRegistrationData[selectedState as keyof typeof stateRegistrationData].cost}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Inspection Required:</span>
                        <Badge variant={stateRegistrationData[selectedState as keyof typeof stateRegistrationData].inspectionRequired ? "default" : "secondary"}>
                          {stateRegistrationData[selectedState as keyof typeof stateRegistrationData].inspectionRequired ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold">General Requirements:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Roadworthy inspection certificate</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Proof of identity</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Import approval documentation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Compulsory third party insurance</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>Note:</strong> Visit your state's transport authority website or local office to complete the registration process. 
                      Requirements and processing times may vary by location and individual circumstances.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <div className="mt-8 text-xs text-gray-500 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center max-w-4xl mx-auto">
          Information sourced from official Australian government departments and transport authorities. 
          Requirements and costs may change - always verify current information with the relevant authorities before proceeding with your import.
        </div>
      </div>
    </div>
  );
}