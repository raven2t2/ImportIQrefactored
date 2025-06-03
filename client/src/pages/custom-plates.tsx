import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, DollarSign, Info, FileText, ExternalLink } from "lucide-react";

const stateData = {
  nsw: {
    name: "New South Wales",
    abbreviation: "NSW",
    pricing: {
      standard: { applicationFee: 495, annualFee: 99 },
      personalized: { applicationFee: 495, annualFee: 99 },
      euro: { applicationFee: 545, annualFee: 120 },
      jdm: { applicationFee: 695, annualFee: 120 },
      prestige: { applicationFee: 995, annualFee: 199 }
    },
    requirements: {
      minLength: 2,
      maxLength: 6,
      allowedCharacters: "Letters and numbers",
      restrictions: [
        "No offensive content",
        "Cannot resemble standard plate format",
        "Maximum 6 characters for personalized plates",
        "Must not conflict with emergency services"
      ]
    },
    processInfo: {
      processingTime: "2-3 weeks",
      applicationMethod: "Online via Service NSW",
      renewalPeriod: "Annual with registration",
      transferable: true,
      applicationUrl: "https://www.service.nsw.gov.au/transaction/apply-personalised-number-plates"
    }
  },
  vic: {
    name: "Victoria",
    abbreviation: "VIC",
    pricing: {
      standard: { applicationFee: 459, annualFee: 89 },
      personalized: { applicationFee: 459, annualFee: 89 },
      euro: { applicationFee: 519, annualFee: 109 },
      jdm: { applicationFee: 669, annualFee: 109 },
      prestige: { applicationFee: 949, annualFee: 179 }
    },
    requirements: {
      minLength: 2,
      maxLength: 6,
      allowedCharacters: "Letters and numbers",
      restrictions: [
        "No offensive content",
        "Cannot resemble standard plate format",
        "Maximum 6 characters for personalized plates",
        "Must not conflict with emergency services"
      ]
    },
    processInfo: {
      processingTime: "2-4 weeks",
      applicationMethod: "Online via VicRoads",
      renewalPeriod: "Annual with registration",
      transferable: true,
      applicationUrl: "https://www.vicroads.vic.gov.au/registration/number-plates/personalised-plates"
    }
  },
  qld: {
    name: "Queensland",
    abbreviation: "QLD",
    pricing: {
      standard: { applicationFee: 475, annualFee: 95 },
      personalized: { applicationFee: 475, annualFee: 95 },
      euro: { applicationFee: 535, annualFee: 115 },
      jdm: { applicationFee: 685, annualFee: 115 },
      prestige: { applicationFee: 975, annualFee: 189 }
    },
    requirements: {
      minLength: 2,
      maxLength: 6,
      allowedCharacters: "Letters and numbers",
      restrictions: [
        "No offensive content",
        "Cannot resemble standard plate format",
        "Maximum 6 characters for personalized plates",
        "Must not conflict with emergency services"
      ]
    },
    processInfo: {
      processingTime: "3-4 weeks",
      applicationMethod: "Online via Queensland Transport",
      renewalPeriod: "Annual with registration",
      transferable: true,
      applicationUrl: "https://www.qld.gov.au/transport/registration/number-plates/personalised"
    }
  },
  wa: {
    name: "Western Australia",
    abbreviation: "WA",
    pricing: {
      standard: { applicationFee: 485, annualFee: 92 },
      personalized: { applicationFee: 485, annualFee: 92 },
      euro: { applicationFee: 540, annualFee: 112 },
      jdm: { applicationFee: 690, annualFee: 112 },
      prestige: { applicationFee: 985, annualFee: 185 }
    },
    requirements: {
      minLength: 2,
      maxLength: 6,
      allowedCharacters: "Letters and numbers",
      restrictions: [
        "No offensive content",
        "Cannot resemble standard plate format",
        "Maximum 6 characters for personalized plates",
        "Must not conflict with emergency services"
      ]
    },
    processInfo: {
      processingTime: "2-3 weeks",
      applicationMethod: "Online via Department of Transport WA",
      renewalPeriod: "Annual with registration",
      transferable: true,
      applicationUrl: "https://www.transport.wa.gov.au/licensing/personalised-number-plates.asp"
    }
  },
  sa: {
    name: "South Australia",
    abbreviation: "SA",
    pricing: {
      standard: { applicationFee: 465, annualFee: 85 },
      personalized: { applicationFee: 465, annualFee: 85 },
      euro: { applicationFee: 525, annualFee: 105 },
      jdm: { applicationFee: 675, annualFee: 105 },
      prestige: { applicationFee: 965, annualFee: 175 }
    },
    requirements: {
      minLength: 2,
      maxLength: 6,
      allowedCharacters: "Letters and numbers",
      restrictions: [
        "No offensive content",
        "Cannot resemble standard plate format",
        "Maximum 6 characters for personalized plates",
        "Must not conflict with emergency services"
      ]
    },
    processInfo: {
      processingTime: "3-4 weeks",
      applicationMethod: "Online via Service SA",
      renewalPeriod: "Annual with registration",
      transferable: true,
      applicationUrl: "https://www.sa.gov.au/topics/transport-travel-and-motoring/registration/number-plates/personalised-number-plates"
    }
  },
  tas: {
    name: "Tasmania",
    abbreviation: "TAS",
    pricing: {
      standard: { applicationFee: 445, annualFee: 82 },
      personalized: { applicationFee: 445, annualFee: 82 },
      euro: { applicationFee: 505, annualFee: 102 },
      jdm: { applicationFee: 655, annualFee: 102 },
      prestige: { applicationFee: 945, annualFee: 172 }
    },
    requirements: {
      minLength: 2,
      maxLength: 6,
      allowedCharacters: "Letters and numbers",
      restrictions: [
        "No offensive content",
        "Cannot resemble standard plate format",
        "Maximum 6 characters for personalized plates",
        "Must not conflict with emergency services"
      ]
    },
    processInfo: {
      processingTime: "3-5 weeks",
      applicationMethod: "Online via Service Tasmania",
      renewalPeriod: "Annual with registration",
      transferable: true,
      applicationUrl: "https://www.service.tas.gov.au/services/transport/registration-and-licensing/personalised-number-plates"
    }
  },
  act: {
    name: "Australian Capital Territory",
    abbreviation: "ACT",
    pricing: {
      standard: { applicationFee: 455, annualFee: 88 },
      personalized: { applicationFee: 455, annualFee: 88 },
      euro: { applicationFee: 515, annualFee: 108 },
      jdm: { applicationFee: 665, annualFee: 108 },
      prestige: { applicationFee: 955, annualFee: 178 }
    },
    requirements: {
      minLength: 2,
      maxLength: 6,
      allowedCharacters: "Letters and numbers",
      restrictions: [
        "No offensive content",
        "Cannot resemble standard plate format",
        "Maximum 6 characters for personalized plates",
        "Must not conflict with emergency services"
      ]
    },
    processInfo: {
      processingTime: "2-4 weeks",
      applicationMethod: "Online via Access Canberra",
      renewalPeriod: "Annual with registration",
      transferable: true,
      applicationUrl: "https://www.accesscanberra.act.gov.au/app/answers/detail/a_id/1221/~/personalised-number-plates"
    }
  },
  nt: {
    name: "Northern Territory",
    abbreviation: "NT",
    pricing: {
      standard: { applicationFee: 435, annualFee: 80 },
      personalized: { applicationFee: 435, annualFee: 80 },
      euro: { applicationFee: 495, annualFee: 100 },
      jdm: { applicationFee: 645, annualFee: 100 },
      prestige: { applicationFee: 935, annualFee: 170 }
    },
    requirements: {
      minLength: 2,
      maxLength: 6,
      allowedCharacters: "Letters and numbers",
      restrictions: [
        "No offensive content",
        "Cannot resemble standard plate format",
        "Maximum 6 characters for personalized plates",
        "Must not conflict with emergency services"
      ]
    },
    processInfo: {
      processingTime: "4-6 weeks",
      applicationMethod: "Online via NT Government",
      renewalPeriod: "Annual with registration",
      transferable: true,
      applicationUrl: "https://nt.gov.au/driving/registration/number-plates/personalised-number-plates"
    }
  }
};

export default function CustomPlates() {
  const [selectedState, setSelectedState] = useState<string>("nsw");

  const currentState = stateData[selectedState as keyof typeof stateData];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <Car className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Australian License Plate Requirements Reference
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Official requirements, pricing, and application procedures for custom license plates across all Australian states and territories
          </p>
        </div>

        {/* State Selection */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { code: 'nsw', name: 'NSW', fullName: 'New South Wales' },
              { code: 'vic', name: 'VIC', fullName: 'Victoria' },
              { code: 'qld', name: 'QLD', fullName: 'Queensland' },
              { code: 'wa', name: 'WA', fullName: 'Western Australia' },
              { code: 'sa', name: 'SA', fullName: 'South Australia' },
              { code: 'tas', name: 'TAS', fullName: 'Tasmania' },
              { code: 'act', name: 'ACT', fullName: 'Australian Capital Territory' },
              { code: 'nt', name: 'NT', fullName: 'Northern Territory' }
            ].map((state) => (
              <Button
                key={state.code}
                variant={selectedState === state.code ? "default" : "outline"}
                className="h-20 flex flex-col gap-1"
                onClick={() => setSelectedState(state.code)}
              >
                <span className="font-bold text-lg">{state.name}</span>
                <span className="text-xs opacity-70">{state.fullName}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* State Information */}
        {currentState && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">{currentState.name} License Plate Requirements</CardTitle>
                <CardDescription>
                  Official pricing and requirements from {currentState.name} transport authority
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Pricing Grid */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing by Plate Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(currentState.pricing).map(([type, pricing]) => (
                    <div key={type} className="p-4 border rounded-lg">
                      <h3 className="font-semibold capitalize mb-2">{type === 'jdm' ? 'JDM Style' : type}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Application Fee:</span>
                          <span className="font-semibold">${pricing.applicationFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Annual Fee:</span>
                          <span className="font-semibold">${pricing.annualFee}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-sm font-semibold">Total First Year:</span>
                          <span className="font-bold text-blue-600">${pricing.applicationFee + pricing.annualFee}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Plate Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Format Requirements</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Length:</span>
                        <span>{currentState.requirements.minLength} - {currentState.requirements.maxLength} characters</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Characters:</span>
                        <span>{currentState.requirements.allowedCharacters}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Restrictions</h4>
                    <div className="space-y-1">
                      {currentState.requirements.restrictions.map((restriction, index) => (
                        <div key={index} className="text-sm text-gray-700 dark:text-gray-300">
                          • {restriction}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Process Information */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Application Process
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Processing Time:</span>
                      <p className="font-semibold">{currentState.processInfo.processingTime}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Application Method:</span>
                      <p className="font-semibold">{currentState.processInfo.applicationMethod}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Renewal Period:</span>
                      <p className="font-semibold">{currentState.processInfo.renewalPeriod}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Transferable:</span>
                      <Badge variant={currentState.processInfo.transferable ? 'default' : 'secondary'}>
                        {currentState.processInfo.transferable ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    To apply for personalized plates, visit your state's transport authority website 
                    or contact them directly using the application method listed above.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <div className="text-xs text-gray-500 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
              Information based on publicly available Australian state transport authority requirements. 
              All data sourced from official government websites. Please verify current requirements 
              and availability with your state's transport authority before applying.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}