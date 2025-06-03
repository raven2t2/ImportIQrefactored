import { useState, useEffect } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Check, Crown, Zap } from "lucide-react";
import { Link } from "wouter";
import logoPath from "@assets/circular imi logo (1).png";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = ({ plan }: { plan: 'monthly' | 'yearly' }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome to ImportIQ Pro!",
        description: "Your subscription is now active. Welcome to the professional tier!",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        className="w-full bg-[#0A84FF] hover:bg-[#007AEB] text-white font-bold py-4 text-lg rounded-xl"
        disabled={!stripe}
      >
        {plan === 'yearly' ? 'Subscribe Yearly - Save 25%' : 'Subscribe Monthly'}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [pricingData, setPricingData] = useState<any>(null);

  const createSubscription = async (plan: 'monthly' | 'yearly') => {
    setLoading(true);
    try {
      // Get trial user email from multiple sources
      const email = localStorage.getItem('userEmail') || '';
      const trialUserEmail = localStorage.getItem('trial_user_email') || '';
      
      const response = await apiRequest("POST", "/api/create-subscription", { 
        plan, 
        email: email || trialUserEmail,
        trialUserEmail 
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
      setPricingData(data);
    } catch (error) {
      console.error('Subscription creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    createSubscription(selectedPlan);
  }, [selectedPlan]);

  // Get pricing from backend response or use defaults
  const isTrialUser = pricingData?.isTrialUser || false;
  const discountInfo = pricingData?.discountInfo;
  const trialInfo = pricingData?.trialInfo;
  
  // Standard pricing is $97/month - $77 only available during trial upgrade
  const monthlyPrice = 97; // Standard monthly price
  const trialUpgradePrice = 77; // Special upgrade price only during trial
  const yearlyPrice = Math.round(97 * 12 * 0.75); // 25% discount for yearly
  const yearlyMonthlyEquivalent = Math.round(yearlyPrice / 12);
  
  // Show trial upgrade pricing only if user is actively in trial
  const displayPrice = (isTrialUser && trialInfo?.daysRemaining > 0) ? trialUpgradePrice : monthlyPrice;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={logoPath} 
                alt="Immaculate Imports" 
                className="w-12 h-12"
              />
              <div>
                <h1 className="text-2xl font-bold text-[#1E1E1E]">
                  <span className="text-[#D4AF37]">ImportIQ™</span> Professional
                </h1>
                <p className="text-sm text-gray-600">Upgrade your import intelligence</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Trial User Special Banner */}
        {isTrialUser && trialInfo && (
          <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Crown className="h-6 w-6 text-amber-600 mr-2" />
                <span className="text-lg font-semibold text-amber-800">Trial Member Exclusive Offer</span>
              </div>
              <p className="text-amber-700 mb-2">
                You have {trialInfo.daysRemaining} days remaining in your trial
              </p>
              <p className="text-sm text-amber-600">
                Upgrade now and get your first month for just <span className="font-bold">$77</span> (save $20)
              </p>
            </div>
          </div>
        )}

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1E1E1E] mb-4">
            {isTrialUser ? 'Upgrade Your Trial' : 'Upgrade to ImportIQ Professional'}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {isTrialUser 
              ? 'Continue your import journey with full access and special trial pricing'
              : 'Continue saving thousands on every import with unlimited access to all professional tools'
            }
          </p>
        </div>

        {/* Plan Selection */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Monthly Plan */}
          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              selectedPlan === 'monthly' 
                ? 'ring-2 ring-[#D4AF37] shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedPlan('monthly')}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Zap className="h-8 w-8 text-[#0A84FF]" />
              </div>
              <CardTitle className="text-2xl">Monthly Plan</CardTitle>
              <CardDescription>Perfect for active importers</CardDescription>
              <div className="mt-4">
                <div className="text-4xl font-bold text-gray-900">${displayPrice}</div>
                <div className="text-gray-600 font-medium">per month</div>
                {(isTrialUser && trialInfo?.daysRemaining > 0) && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                    <p className="text-sm text-amber-800 font-medium">
                      🎯 Trial Upgrade Special: First month only $77
                    </p>
                    <p className="text-xs text-amber-700">
                      Save $20 on your first month (regular price $97)
                    </p>
                  </div>
                )}
                {(!isTrialUser || !trialInfo?.daysRemaining) && (
                  <div className="text-sm text-gray-600 mt-1">
                    Standard monthly subscription
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>All 16 ImportIQ Tools</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Vehicle Lookup & Search</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Cost Calculators</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Compliance Guidance</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Import Timeline Planning</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Yearly Plan */}
          <Card 
            className={`cursor-pointer transition-all duration-200 relative ${
              selectedPlan === 'yearly' 
                ? 'ring-2 ring-[#D4AF37] shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedPlan('yearly')}
          >
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#D4AF37] text-white">
              Save 20%
            </Badge>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Crown className="h-8 w-8 text-[#D4AF37]" />
              </div>
              <CardTitle className="text-2xl">Yearly Plan</CardTitle>
              <CardDescription>Best value for serious importers</CardDescription>
              <div className="mt-4">
                <div className="text-4xl font-bold text-gray-900">${yearlyMonthlyEquivalent}</div>
                <div className="text-gray-600 font-medium">per month</div>
                <div className="text-sm text-gray-700 font-bold mt-1">
                  ${yearlyPrice} billed annually
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>All 16 ImportIQ Tools</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>25% yearly savings (${monthlyPrice * 12 - yearlyPrice} saved)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Expert Vehicle Picks</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Market Intelligence Dashboard</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Priority Email Support</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        {!loading && clientSecret ? (
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-center">
                Complete Your {selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'} Subscription
              </CardTitle>
              <CardDescription className="text-center">
                Secure payment powered by Stripe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscribeForm plan={selectedPlan} />
              </Elements>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-lg mx-auto">
            <Card>
              <CardContent className="p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600">Setting up your subscription...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Platform Benefits */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4">
              Why ImportIQ Professional?
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-700">
              <div>
                <div className="font-semibold text-[#1E1E1E] mb-2">14 AI-Powered Tools</div>
                <div>Complete import intelligence platform with cost calculators and compliance guidance</div>
              </div>
              <div>
                <div className="font-semibold text-[#1E1E1E] mb-2">Official Data Sources</div>
                <div>Import cost calculations using current rates from Australian government sources</div>
              </div>
              <div>
                <div className="font-semibold text-[#1E1E1E] mb-2">Cancel Anytime</div>
                <div>No contracts, full refund within first 30 days</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}