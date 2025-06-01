import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Mail, User } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const emailGateSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
});

type EmailGateData = z.infer<typeof emailGateSchema>;

interface EmailGateProps {
  onSuccess: (userData: { name: string; email: string; isReturning: boolean }) => void;
  title: string;
  description: string;
  buttonText: string;
}

export default function EmailGate({ onSuccess, title, description, buttonText }: EmailGateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EmailGateData>({
    resolver: zodResolver(emailGateSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const emailCheckMutation = useMutation({
    mutationFn: async (data: EmailGateData) => {
      return await apiRequest("POST", "/api/check-email", data);
    },
    onSuccess: (response: any) => {
      setIsSubmitting(false);
      onSuccess({
        name: form.getValues("name"),
        email: form.getValues("email"),
        isReturning: response.exists
      });
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: EmailGateData) => {
    setIsSubmitting(true);
    emailCheckMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-brand-gold to-amber-500 rounded-full shadow-2xl">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-brand-gold to-amber-400 bg-clip-text text-transparent">
              Your Import Intelligence
            </span>
            <br />
            <span className="text-white">Starts Right Here</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Join 847+ smart importers who stopped gambling with expensive "educated guesses" 
            and started making data-driven decisions that <span className="text-brand-gold font-semibold">save thousands per import</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Side - Value Props */}
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-2xl text-white mb-4">
                  The $50,000+ Problem You're About to Solve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                    <div className="font-semibold text-red-300 mb-2">⚠️ Without Complete Intelligence:</div>
                    <ul className="space-y-2 text-red-200 text-sm">
                      <li>• Miss compliance deadlines ($8,000+ in delays)</li>
                      <li>• Unexpected ownership costs ($15,000+ over 5 years)</li>
                      <li>• Wrong vehicle selection (depreciation nightmares)</li>
                      <li>• Port congestion surprises (months of waiting)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
                    <div className="font-semibold text-green-300 mb-2">✅ With ImportIQ Intelligence:</div>
                    <ul className="space-y-2 text-green-200 text-sm">
                      <li>• Know exact costs before you bid</li>
                      <li>• Avoid compliance traps that destroy budgets</li>
                      <li>• Time imports perfectly for maximum savings</li>
                      <li>• Select vehicles with investment potential</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-brand-gold/10 backdrop-blur-sm border border-brand-gold/30 text-white">
              <CardHeader>
                <CardTitle className="text-xl text-brand-gold">
                  🚀 What You Get Instant Access To:
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-white">True Cost Explorer</div>
                      <div className="text-gray-300 text-sm">5-year ownership cost analysis (insurance, rego, maintenance, depreciation)</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-white">AI Market Intelligence</div>
                      <div className="text-gray-300 text-sm">Real auction data analysis with investment potential scoring</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-white">Import Timeline Simulator</div>
                      <div className="text-gray-300 text-sm">Visual Gantt charts with port congestion modeling</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-white">Build & Comply</div>
                      <div className="text-gray-300 text-sm">State-specific compliance mapping and engineering requirements</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-white">AI Import Assistant</div>
                      <div className="text-gray-300 text-sm">24/7 compliance expert that answers complex questions instantly</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-white">Expert Picks</div>
                      <div className="text-gray-300 text-sm">Battle-tested scenarios from professionals who've imported 500+ vehicles</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Form */}
          <Card className="bg-white shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                Start Your Free Trial
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                No credit card required • Full access for 14 days • Cancel anytime
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Urgency Alert */}
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-800 font-semibold mb-2 text-center">⚠️ Import Costs Rising</div>
                <div className="text-red-700 text-sm text-center">
                  Shipping rates up 40% this quarter. Smart importers are locking in their intelligence advantage now.
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10 h-12"
                      {...form.register("name")}
                    />
                  </div>
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="pl-10 h-12"
                      {...form.register("email")}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-brand-gold to-amber-500 hover:from-amber-500 hover:to-brand-gold text-white font-bold py-4 text-lg shadow-xl transform hover:scale-105 transition-all duration-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "ACTIVATING YOUR ACCOUNT..." : "START FREE TRIAL NOW"}
                </Button>
              </form>

              {/* Trust Signals */}
              <div className="mt-6 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-center">
                    <div className="font-semibold text-green-800 mb-2">✅ What Happens Next:</div>
                    <div className="text-green-700 text-sm space-y-1">
                      <div>• Instant access to all 6 professional tools</div>
                      <div>• Your personalized import intelligence dashboard</div>
                      <div>• Start calculating and saving money immediately</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center text-xs text-gray-500 space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="h-3 w-3" />
                    <span>Bank-level security • Your data is never shared</span>
                  </div>
                  <div className="text-gray-600">
                    Used by 847+ professional importers • Cancel anytime in 30 seconds
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}