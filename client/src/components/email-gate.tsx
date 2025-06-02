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
import logoPath from "@assets/circular imi logo (1).png";

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
      
      // If user has an existing trial, redirect them to trial dashboard
      if (response.hasActiveTrial) {
        localStorage.setItem('trial_user_name', form.getValues("name"));
        localStorage.setItem('trial_user_email', form.getValues("email"));
        window.location.href = `/trial-dashboard?name=${encodeURIComponent(form.getValues("name"))}&email=${encodeURIComponent(form.getValues("email"))}`;
        return;
      }
      
      // If trial expired, redirect to pricing
      if (response.exists && !response.hasActiveTrial) {
        window.location.href = '/pricing';
        return;
      }
      
      // New trial - continue with normal flow
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
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-6 font-sans">
      <div className="w-full max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row justify-center items-center mb-6 sm:mb-8">
            <img 
              src={logoPath} 
              alt="Immaculate Imports" 
              className="w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-0 sm:mr-6"
            />
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1E1E1E] mb-2 sm:mb-3">
                <span className="text-[#D4AF37]">ImportIQ™</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                Brought to you by <a href="https://driveimmaculate.com" target="_blank" className="text-[#D4AF37] hover:underline font-semibold">Immaculate Imports</a>
              </p>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#1E1E1E] mb-4 sm:mb-6 leading-tight px-2">
            Professional Import Intelligence Platform
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2">
            Stop guessing and start planning with professional-grade tools that save you 
            <span className="text-[#D4AF37] font-semibold"> thousands on every import</span>
          </p>
        </div>

        {/* Value-First Layout - Tools Grid Above the Fold */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-[#D4AF37]/10 to-amber-50 border-2 border-[#D4AF37]/30 rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="text-center mb-4 sm:mb-6">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E1E1E] mb-2">Total Value: $15,000+</div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1E1E1E]">
                ✅ All 14 Professional Tools Included
              </h3>
              <p className="text-base sm:text-lg font-semibold text-[#D4AF37] mt-2 sm:mt-3 px-2">
                Instant access to 14 professional tools that have saved importers thousands.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {[
                { name: "Import Cost Calculator", tagline: "Know your landed cost before you commit." },
                { name: "True Cost Explorer", tagline: "The total cost of ownership, uncovered." },
                { name: "BuildReady™", tagline: "Make your dream build road-legal." },
                { name: "Import Timeline", tagline: "Realistic delivery expectations from port to plate." },
                { name: "AI Vehicle Recommendations", tagline: "Smarter suggestions based on your goals." },
                { name: "Expert Picks", tagline: "Pre-screened imports worth a closer look." },
                { name: "Compliance Estimate", tagline: "Know if your build will pass — and how much it'll cost." },
                { name: "Mod Estimator", tagline: "Estimate costs for tuning, mods, and compliance." },
                { name: "Vehicle Lookup", tagline: "VIN or chassis code? We'll break it down." },
                { name: "Registration Stats", tagline: "See what's already on Aussie roads." },
                { name: "Import Volume Dashboard", tagline: "What's entering the country — and from where." },
                { name: "Auction Sample Explorer", tagline: "Recent comps from Japanese auctions." },
                { name: "AI Import Assistant", tagline: "Ask anything about your import journey." },
                { name: "Value Estimator", tagline: "Know what your car's worth — now and later." }
              ].map((tool, index) => (
                <div key={index} className="flex items-start p-3 sm:p-4 bg-white/60 rounded-lg min-h-[60px] touch-manipulation">
                  <div className="flex items-center justify-center w-6 h-6 bg-[#10B981] rounded-full mr-3 flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#1E1E1E] text-sm sm:text-base leading-tight">{tool.name}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-0.5 leading-relaxed">{tool.tagline}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-start">
          {/* Left Side - Social Proof */}
          <div className="flex-1 space-y-6 lg:space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-[#1E1E1E] mb-4 sm:mb-6">
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
              
            <div className="mt-6 pt-4 border-t border-[#D4AF37]/20">
              <div className="text-center">
                <div className="text-lg text-gray-600 mb-1">Professional Value: $15,000+</div>
                <div className="text-3xl font-bold text-[#D4AF37] mb-2">Your Price: $97/mo</div>
                <div className="text-sm font-semibold text-red-600 bg-red-50 p-2 rounded-lg">
                  🔒 Lock in $97/month for life — offer expires at end of trial
                </div>
              </div>
            </div>
              
            <div className="mt-4 text-center text-gray-600 text-sm italic">
              Built for importers, dealers, and first-timers who don't want to guess.
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex-1 lg:max-w-md w-full">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-[#1E1E1E] mb-2 sm:mb-3">
                  Start Your Free Trial
                </h3>
                <p className="text-base sm:text-lg font-semibold text-[#D4AF37] mb-2 px-2">
                  Instant access to 14 professional tools that have saved importers thousands.
                </p>
                <p className="text-gray-600 text-sm sm:text-base px-2">
                  No credit card required. Full access for 7 days.
                </p>
              </div>

              {/* Urgency Alert */}
              <div className="mb-8 p-4 bg-[#FEF3C7] border border-[#D9822B]/20 rounded-xl">
                <div className="text-[#D9822B] font-semibold mb-2 text-center">⚠️ Import Costs Rising</div>
                <div className="text-[#92400e] text-sm text-center">
                  Shipping rates increasing. Smart importers are securing their advantage now.
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm sm:text-base font-medium text-[#1E1E1E]">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10 h-12 sm:h-14 text-base rounded-xl border-2 border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37] touch-manipulation"
                      {...form.register("name")}
                    />
                  </div>
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm sm:text-base font-medium text-[#1E1E1E]">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="pl-10 h-12 sm:h-14 text-base rounded-xl border-2 border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37] touch-manipulation"
                      {...form.register("email")}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0A84FF] hover:bg-[#007AEB] text-white font-bold py-3 sm:py-4 text-base sm:text-lg rounded-xl transition-colors duration-200 touch-manipulation min-h-[48px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "ACTIVATING YOUR ACCOUNT..." : "START FREE TRIAL NOW"}
                </Button>
                
                {/* Trust Line */}
                <div className="text-center text-gray-600 text-sm mt-4">
                  Built by importers, trusted by enthusiasts, used by pros.
                </div>
                
                {/* Urgency Bar */}
                <div className="mt-4 p-3 bg-[#FEF3C7] border border-[#D9822B]/30 rounded-lg">
                  <div className="text-center text-[#D9822B] text-sm font-medium">
                    ⚠️ Import costs are up 40% this quarter. Avoid delays. Lock in your $97/month before we raise prices.
                  </div>
                </div>
              </form>

              {/* Confidence Building Copy */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 text-center leading-relaxed">
                  If ImportIQ doesn't save you money, time, or stress on your next import — you shouldn't pay for it. 
                  That's why we offer full access for 7 days, no credit card required. You decide if it's worth it.
                </p>
              </div>

              {/* Trust Signals */}
              <div className="mt-8 space-y-6">
                <div className="bg-[#ECFDF5] border border-[#10B981]/20 rounded-xl p-4">
                  <div className="text-center">
                    <div className="font-semibold text-[#10B981] mb-3">✅ What Happens Next:</div>
                    <div className="text-[#065F46] text-sm space-y-1">
                      <div>• Instant access to all 14 professional tools</div>
                      <div>• Your personalized import intelligence dashboard</div>
                      <div>• Start calculating and saving money immediately</div>
                    </div>
                  </div>
                </div>
                
                {/* Testimonials */}
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-blue-800 text-sm italic mb-2">
                      "I saved $4,000 avoiding a compliance trap thanks to ImportIQ."
                    </div>
                    <div className="text-blue-600 text-xs">— Melbourne Importer</div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-purple-800 text-sm italic mb-2">
                      "I used to dread importing. Now I know exactly what to expect."
                    </div>
                    <div className="text-purple-600 text-xs">— Sydney Business Owner</div>
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