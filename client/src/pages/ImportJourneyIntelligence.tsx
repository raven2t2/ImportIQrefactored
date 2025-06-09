import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ImportJourneyIntelligence from '@/components/ImportJourneyIntelligence';

export default function ImportJourneyIntelligencePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <Link href="/">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Smart Import Journey Intelligence
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get personalized port recommendations, shipping routes, and compliance requirements 
                based on your exact location with Google Maps precision.
              </p>
            </div>
          </div>

          {/* Main Component */}
          <ImportJourneyIntelligence />
        </div>
      </div>
    </div>
  );
}