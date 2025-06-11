import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from 'wouter';
import { ArrowLeft, Loader2 } from 'lucide-react';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ plan }: { plan: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard?success=true`,
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
        title: "Payment Successful",
        description: "Welcome to ImportIQ! Redirecting to your dashboard...",
      });
      
      setTimeout(() => {
        setLocation('/dashboard');
      }, 2000);
    }

    setIsLoading(false);
  };

  const planDetails = {
    starter: {
      name: "Starter",
      price: "$29",
      period: "per month",
      features: [
        "Unlimited vehicle lookups",
        "All global destinations", 
        "Save unlimited reports",
        "Priority email support"
      ]
    },
    pro: {
      name: "Pro",
      price: "$99", 
      period: "per month",
      features: [
        "Everything in Starter",
        "CSV import (up to 1000 vehicles)",
        "Bulk VIN processing",
        "Full API access",
        "Priority phone support"
      ]
    }
  };

  const currentPlan = planDetails[plan as keyof typeof planDetails];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Plan Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
          <CardDescription>You're subscribing to ImportIQ {currentPlan?.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">ImportIQ {currentPlan?.name}</span>
            <span className="font-bold">{currentPlan?.price}{currentPlan?.period && `/${currentPlan.period.split(' ')[1]}`}</span>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-900 dark:text-white">
              What's included:
            </h4>
            <ul className="space-y-1">
              {currentPlan?.features.map((feature) => (
                <li key={feature} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              🎉 <strong>7-day free trial</strong> - Cancel anytime before your trial ends and you won't be charged.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>Secure payment powered by Stripe</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!stripe || !elements || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Start 7-Day Free Trial`
              )}
            </Button>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              By subscribing, you agree to our Terms of Service and Privacy Policy. 
              Your trial starts today and you can cancel anytime.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [location] = useLocation();
  const [, setLocationState] = useLocation();
  
  // Extract plan from URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const plan = urlParams.get('plan') || 'starter';

  useEffect(() => {
    // Create subscription intent
    apiRequest("POST", "/api/subscription/create-subscription", { plan })
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error('No client secret received');
        }
      })
      .catch((error) => {
        console.error('Subscription creation error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [plan]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Setting up your subscription...</p>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Setup Error</CardTitle>
            <CardDescription>Unable to initialize payment setup</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setLocationState('/pricing')} 
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocationState('/pricing')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pricing
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Complete Your Subscription
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Join thousands of importers who trust ImportIQ for authentic vehicle data
          </p>
        </div>

        {/* Checkout Form */}
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm plan={plan} />
        </Elements>
      </div>
    </div>
  );
}