import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Database, TrendingUp, Shield, BookOpen, Calculator } from "lucide-react";

export default function DataMethodology() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Data Methodology & Integrity
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            Our pricing estimates are derived from established automotive valuation methodologies 
            and publicly available market research to provide reliable import planning guidance.
          </p>
        </div>

        {/* Methodology Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Data Integrity Standards
            </CardTitle>
            <CardDescription>
              How we ensure accurate and reliable pricing estimates for vehicle imports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Database className="h-4 w-4 text-green-600" />
                  Data Sources
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Automotive industry market research reports
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Published automotive valuation standards
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Historical market trend analysis
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Publicly available automotive statistics
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-blue-600" />
                  Valuation Methodology
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Market value assessment based on vehicle age and condition
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Regional market factor adjustments
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Currency and economic condition considerations
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Statistical modeling for price range estimation
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Valuation Approach */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-orange-600" />
                Japanese Vehicle Valuation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="mb-2">Market Research Based</Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Japanese vehicle pricing is derived from established automotive market research 
                    that analyzes historical pricing patterns, model popularity, and import demand trends.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Key Factors Considered:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Model year and production numbers</li>
                    <li>• Historical export pricing patterns</li>
                    <li>• Australian market demand indicators</li>
                    <li>• Condition and mileage adjustments</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                US Muscle Car Valuation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="mb-2">Industry Standards Based</Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Classic muscle car pricing follows established collector vehicle valuation 
                    methodologies used by automotive professionals and insurance companies.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Valuation Criteria:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Rarity and production numbers</li>
                    <li>• Historical significance and desirability</li>
                    <li>• Restoration costs and originality</li>
                    <li>• Market appreciation trends</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-orange-800 dark:text-orange-200">
              Important Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-orange-700 dark:text-orange-300">
              <p>
                <strong>For Planning Purposes Only:</strong> All pricing estimates provided are for 
                import planning and budgeting purposes only. These are not appraisals or guarantees 
                of actual market values.
              </p>
              
              <p>
                <strong>Market Variability:</strong> Actual vehicle prices vary significantly based 
                on condition, documentation, location, timing, and individual vehicle history. 
                Always conduct independent research and inspections.
              </p>
              
              <p>
                <strong>Professional Consultation:</strong> For actual purchases, consult with 
                qualified automotive appraisers, import specialists, and financial advisors who 
                can assess specific vehicles and current market conditions.
              </p>
              
              <p>
                <strong>Data Updates:</strong> Market conditions change regularly. These estimates 
                are based on available research and should be supplemented with current market analysis.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quality Assurance */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quality Assurance Process</CardTitle>
            <CardDescription>
              How we maintain data accuracy and reliability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium mb-2">Research Validation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  All pricing data is cross-referenced with multiple automotive industry sources
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium mb-2">Market Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Regular review of market trends and pricing pattern adjustments
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium mb-2">Transparency</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Clear documentation of methodology and data source attribution
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}