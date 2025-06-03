import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Phone, Globe } from "lucide-react";

interface CTASectionProps {
  title?: string;
  description?: string;
  primaryAction?: string;
  secondaryAction?: string;
}

export default function CTASection({ 
  title = "Ready to Import Your Dream Vehicle?",
  description = "Use this data to make informed decisions. Get professional import assistance with a $500 deposit.",
  primaryAction = "Get Started - $500 Deposit",
  secondaryAction = "Learn How It Works"
}: CTASectionProps) {
  return (
    <Card className="bg-gradient-to-r from-[#D4AF37] to-amber-500 text-white border-0 shadow-lg">
      <CardContent className="p-8 text-center">
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-amber-100 mb-6 max-w-2xl mx-auto">
          {description}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg"
            className="bg-white text-[#D4AF37] hover:bg-gray-100 font-semibold px-8 py-3"
            onClick={() => window.location.href = '/checkout'}
          >
            {primaryAction}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button 
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-[#D4AF37] px-8 py-3"
            onClick={() => window.open('https://driveimmaculate.com/howitworks/', '_blank')}
          >
            <Globe className="mr-2 h-4 w-4" />
            {secondaryAction}
          </Button>
        </div>
        
        <div className="mt-6 text-amber-100 text-sm">
          <div className="flex items-center justify-center space-x-6">
            <span>✓ Professional Import Service</span>
            <span>✓ Full Compliance Support</span>
            <span>✓ $500 Secures Your Spot</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}