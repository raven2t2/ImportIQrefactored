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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-6">
            <img 
              src="/attached_assets/circular imi logo (1).png" 
              alt="Immaculate Imports" 
              className="w-16 h-16 mr-4"
            />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                <span className="bg-gradient-to-r from-brand-gold to-amber-600 bg-clip-text text-transparent">
                  ImportIQ™
                </span>
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                Brought to you by <a href="https://immaculateimports.com.au" target="_blank" className="text-brand-gold hover:underline">Immaculate Imports</a>
              </p>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your Import Intelligence Starts Right Here
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            Professional import tools used by smart importers to make data-driven decisions and 
            <span className="text-brand-gold font-semibold"> avoid costly mistakes</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Side - Value Props */}
          <div className="space-y-6">
            <Card className="bg-white border border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 mb-4">
                  Stop Making Expensive Import Mistakes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="font-semibold text-red-800 mb-2">⚠️ Common Costly Mistakes:</div>
                    <ul className="space-y-2 text-red-700 text-sm">
                      <li>• Unexpected compliance costs and delays</li>
                      <li>• Hidden ownership expenses over time</li>
                      <li>• Poor vehicle selection decisions</li>
                      <li>• Missing optimal shipping windows</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="font-semibold text-green-800 mb-2">✅ With ImportIQ Professional Tools:</div>
                    <ul className="space-y-2 text-green-700 text-sm">
                      <li>• Calculate exact costs before you buy</li>
                      <li>• Plan compliance requirements in advance</li>
                      <li>• Understand true ownership costs</li>
                      <li>• Get professional guidance when needed</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-brand-gold/10 to-amber-100 border border-brand-gold/30">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">
                  🚀 Professional Import Tools Inside:
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-gray-900">Import Cost Calculator</div>
                      <div className="text-gray-700 text-sm">Accurate landed costs with duties, GST, LCT and freight</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-gray-900">AI Vehicle Recommendations</div>
                      <div className="text-gray-700 text-sm">Smart suggestions based on your budget and preferences</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-gray-900">Import Timeline Planner</div>
                      <div className="text-gray-700 text-sm">Visual timeline with realistic delivery estimates</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-gray-900">Compliance Guide</div>
                      <div className="text-gray-700 text-sm">State-specific requirements and modification planning</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-gray-900">AI Import Assistant</div>
                      <div className="text-gray-700 text-sm">Get expert answers to your import questions</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-gray-900">Expert Scenarios</div>
                      <div className="text-gray-700 text-sm">Pre-configured import strategies that work</div>
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