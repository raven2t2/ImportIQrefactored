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

  const createSubscription = async (plan: 'monthly' | 'yearly') => {
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/create-subscription", { plan });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Subscription creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    createSubscription(selectedPlan);
  }, [selectedPlan]);

  const monthlyPrice = 97;
  const yearlyPrice = Math.round(monthlyPrice * 12 * 0.8); // 20% discount
  const yearlyMonthlyEquivalent = Math.round(yearlyPrice / 12);

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
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1E1E1E] mb-4">
            Upgrade to ImportIQ Professional
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Continue saving thousands on every import with unlimited access to all professional tools
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
                <div className="text-4xl font-bold text-[#1E1E1E]">${monthlyPrice}</div>
                <div className="text-gray-600">per month</div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Unlimited cost calculations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>AI vehicle recommendations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Compliance guidance</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Timeline planning</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Premium support</span>
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
                <div className="text-4xl font-bold text-[#1E1E1E]">${yearlyMonthlyEquivalent}</div>
                <div className="text-gray-600">per month</div>
                <div className="text-sm text-[#D4AF37] font-semibold mt-1">
                  ${yearlyPrice} billed annually
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Everything in Monthly</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>20% discount (save ${monthlyPrice * 12 - yearlyPrice}/year)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Early access to new features</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Annual strategy review</span>
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

        {/* Trust Signals */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4">
              Why ImportIQ Professional?
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
              <div>
                <div className="font-semibold text-[#1E1E1E] mb-2">Proven Results</div>
                <div>Members save an average of $4,200 per import</div>
              </div>
              <div>
                <div className="font-semibold text-[#1E1E1E] mb-2">Secure & Reliable</div>
                <div>Bank-level security with 99.9% uptime</div>
              </div>
              <div>
                <div className="font-semibold text-[#1E1E1E] mb-2">Cancel Anytime</div>
                <div>No contracts, cancel in 30 seconds</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}