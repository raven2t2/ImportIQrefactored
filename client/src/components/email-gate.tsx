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
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-8">
            <img 
              src="/attached_assets/circular imi logo (1).png" 
              alt="Immaculate Imports" 
              className="w-20 h-20 mr-6"
            />
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-[#1E1E1E] mb-3">
                <span className="text-[#D4AF37]">ImportIQ™</span>
              </h1>
              <p className="text-base text-gray-600 font-medium">
                Brought to you by <a href="https://immaculateimports.com.au" target="_blank" className="text-[#D4AF37] hover:underline font-semibold">Immaculate Imports</a>
              </p>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1E1E1E] mb-6 leading-tight">
            Professional Import Intelligence Platform
          </h2>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto mb-12 leading-relaxed">
            Stop guessing and start planning with professional-grade tools that save you 
            <span className="text-[#D4AF37] font-semibold"> thousands on every import</span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Side - Value Props */}
          <div className="flex-1 space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-2xl font-bold text-[#1E1E1E] mb-6">
                Stop Making Expensive Import Mistakes
              </h3>
              
              <div className="space-y-6">
                <div className="bg-[#FEF3C7] border border-[#D9822B]/20 rounded-xl p-6">
                  <div className="font-semibold text-[#D9822B] mb-3">⚠️ Common Costly Mistakes:</div>
                  <ul className="space-y-2 text-[#92400e] text-sm leading-relaxed">
                    <li>• Unexpected compliance costs and delays</li>
                    <li>• Hidden ownership expenses over time</li>
                    <li>• Poor vehicle selection decisions</li>
                    <li>• Missing optimal shipping windows</li>
                  </ul>
                </div>
                
                <div className="bg-[#ECFDF5] border border-[#10B981]/20 rounded-xl p-6">
                  <div className="font-semibold text-[#10B981] mb-3">✅ With ImportIQ Professional Tools:</div>
                  <ul className="space-y-2 text-[#065F46] text-sm leading-relaxed">
                    <li>• Calculate exact costs before you buy</li>
                    <li>• Plan compliance requirements in advance</li>
                    <li>• Understand true ownership costs</li>
                    <li>• Get professional guidance when needed</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-[#1E1E1E] mb-6">
                🚀 Professional Import Tools Inside:
              </h3>
              
              <div className="space-y-4">
                {[
                  { name: "Import Cost Calculator", desc: "Accurate landed costs with duties, GST, LCT and freight" },
                  { name: "AI Vehicle Recommendations", desc: "Smart suggestions based on your budget and preferences" },
                  { name: "Import Timeline Planner", desc: "Visual timeline with realistic delivery estimates" },
                  { name: "Compliance Guide", desc: "State-specific requirements and modification planning" },
                  { name: "AI Import Assistant", desc: "Get expert answers to your import questions" },
                  { name: "Expert Scenarios", desc: "Pre-configured import strategies that work" }
                ].map((tool, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-[#1E1E1E]">{tool.name}</div>
                      <div className="text-gray-600 text-sm">{tool.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex-1 lg:max-w-md">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-[#1E1E1E] mb-3">
                  Start Your Free Trial
                </h3>
                <p className="text-gray-600 text-base">
                  No credit card required • Full access for 14 days • Cancel anytime
                </p>
              </div>

              {/* Urgency Alert */}
              <div className="mb-8 p-4 bg-[#FEF3C7] border border-[#D9822B]/20 rounded-xl">
                <div className="text-[#D9822B] font-semibold mb-2 text-center">⚠️ Import Costs Rising</div>
                <div className="text-[#92400e] text-sm text-center">
                  Shipping rates increasing. Smart importers are securing their advantage now.
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-[#1E1E1E]">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10 h-14 rounded-xl border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                      {...form.register("name")}
                    />
                  </div>
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-[#1E1E1E]">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="pl-10 h-14 rounded-xl border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                      {...form.register("email")}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0A84FF] hover:bg-[#007AEB] text-white font-bold py-4 text-lg rounded-xl transition-colors duration-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "ACTIVATING YOUR ACCOUNT..." : "START FREE TRIAL NOW"}
                </Button>
              </form>

              {/* Trust Signals */}
              <div className="mt-8 space-y-6">
                <div className="bg-[#ECFDF5] border border-[#10B981]/20 rounded-xl p-4">
                  <div className="text-center">
                    <div className="font-semibold text-[#10B981] mb-3">✅ What Happens Next:</div>
                    <div className="text-[#065F46] text-sm space-y-1">
                      <div>• Instant access to all 6 professional tools</div>
                      <div>• Your personalized import intelligence dashboard</div>
                      <div>• Start calculating and saving money immediately</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center text-sm text-gray-500 space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Bank-level security • Your data is never shared</span>
                  </div>
                  <div className="text-gray-600">
                    Used by professional importers • Cancel anytime in 30 seconds
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}