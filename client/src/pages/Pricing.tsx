import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Users } from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      icon: Users,
      description: "Perfect for exploring ImportIQ",
      features: [
        "1 free vehicle lookup",
        "Basic import cost estimates",
        "AU/US/UK/CA destinations",
        "Community support"
      ],
      limitations: [
        "No saved reports",
        "No bulk processing",
        "No API access"
      ],
      cta: "Get Started",
      href: "/register",
      popular: false
    },
    {
      name: "Starter",
      price: "$29",
      period: "per month",
      icon: Zap,
      description: "For serious importers and dealers",
      features: [
        "Unlimited vehicle lookups",
        "All global destinations",
        "Save unlimited reports",
        "Re-run previous searches", 
        "Priority email support",
        "Advanced compliance data"
      ],
      limitations: [
        "No CSV imports",
        "No bulk VIN processing"
      ],
      cta: "Start Free Trial",
      href: "/checkout?plan=starter",
      popular: true
    },
    {
      name: "Pro", 
      price: "$99",
      period: "per month",
      icon: Crown,
      description: "For importers scaling their business",
      features: [
        "Everything in Starter",
        "CSV import (up to 1000 vehicles)",
        "Bulk VIN processing",
        "Full API access",
        "Custom compliance reports",
        "Priority phone support",
        "Dedicated account manager"
      ],
      limitations: [],
      cta: "Start Free Trial",
      href: "/checkout?plan=pro",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your ImportIQ Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            From free exploration to enterprise scaling - find the perfect plan for your vehicle import business
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 hover:bg-blue-700">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${
                      plan.name === 'Free' ? 'bg-gray-100 dark:bg-gray-800' :
                      plan.name === 'Starter' ? 'bg-blue-100 dark:bg-blue-900' :
                      'bg-yellow-100 dark:bg-yellow-900'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        plan.name === 'Free' ? 'text-gray-600 dark:text-gray-400' :
                        plan.name === 'Starter' ? 'text-blue-600 dark:text-blue-400' :
                        'text-yellow-600 dark:text-yellow-400'
                      }`} />
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      {plan.period}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      What's included:
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Limitations:
                      </h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation) => (
                          <li key={limitation} className="flex items-center gap-3">
                            <div className="h-4 w-4 border border-gray-300 rounded flex-shrink-0" />
                            <span className="text-sm text-gray-500 dark:text-gray-500">
                              {limitation}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="pt-4">
                    <Link href={plan.href}>
                      <Button 
                        className={`w-full ${
                          plan.popular 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : plan.name === 'Pro'
                            ? 'bg-yellow-600 hover:bg-yellow-700'
                            : ''
                        }`}
                        variant={plan.name === 'Free' ? 'outline' : 'default'}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Compare Features
          </h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-white">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white">
                      Free
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white">
                      Starter
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white">
                      Pro
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {[
                    { feature: "Vehicle Lookups", free: "1 lookup", starter: "Unlimited", pro: "Unlimited" },
                    { feature: "Global Destinations", free: "4 countries", starter: "All countries", pro: "All countries" },
                    { feature: "Save Reports", free: "✗", starter: "✓", pro: "✓" },
                    { feature: "CSV Import", free: "✗", starter: "✗", pro: "Up to 1000" },
                    { feature: "Bulk VIN Processing", free: "✗", starter: "✗", pro: "✓" },
                    { feature: "API Access", free: "✗", starter: "✗", pro: "✓" },
                    { feature: "Support", free: "Community", starter: "Email", pro: "Phone + Email" },
                  ].map((row) => (
                    <tr key={row.feature}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {row.feature}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-400">
                        {row.free}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-400">
                        {row.starter}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-400">
                        {row.pro}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We offer a 30-day money-back guarantee for all paid plans. No questions asked.
              </p>
            </div>
            
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                All data is encrypted and stored securely. We never share your information with third parties.
              </p>
            </div>
            
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Do you offer enterprise plans?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes, we offer custom enterprise solutions. Contact us for a personalized quote.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}