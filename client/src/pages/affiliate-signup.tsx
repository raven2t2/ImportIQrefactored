import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Users, DollarSign, TrendingUp, Share2, CheckCircle, ArrowRight, Menu, X } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertAffiliateSchema } from "@shared/schema";
import logoPath from "@assets/circular imi logo (3).png";
import type { z } from "zod";

type FormData = z.infer<typeof insertAffiliateSchema>;

interface AffiliateSignupResponse {
  success: boolean;
  affiliate: {
    id: number;
    name: string;
    email: string;
    referralCode: string;
    tier: string;
    commissionRate: number;
  };
}

export default function AffiliateSignup() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [affiliateData, setAffiliateData] = useState<AffiliateSignupResponse['affiliate'] | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(insertAffiliateSchema),
    defaultValues: {
      name: "",
      email: "",
      socialLink: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: FormData): Promise<AffiliateSignupResponse> => {
      return await apiRequest("POST", "/api/affiliate/signup", data);
    },
    onSuccess: (response) => {
      setIsSuccess(true);
      setAffiliateData(response.affiliate);
      toast({
        title: "Welcome to the ImportIQ Affiliate Program!",
        description: "Your affiliate account has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Signup Failed",
        description: error.message || "An error occurred during signup.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    signupMutation.mutate(data);
  };

  if (isSuccess && affiliateData) {
    return (
      <div className="min-h-screen bg-black text-brand-white mobile-padding py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-brand-gold rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-black" />
              </div>
            </div>
            <h1 className="mobile-heading font-bold text-brand-gold mb-4">
              Welcome to ImportIQ Affiliates!
            </h1>
            <p className="mobile-text text-brand-gray max-w-2xl mx-auto">
              Your affiliate account is now active. Start sharing your referral link and earn {affiliateData.commissionRate}% commission on every signup.
            </p>
          </div>

          {/* Affiliate Dashboard Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-card border-brand-gray">
              <CardHeader>
                <CardTitle className="text-brand-white flex items-center">
                  <Share2 className="h-5 w-5 mr-2 text-brand-gold" />
                  Your Referral Link
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-brand-black p-3 rounded-lg border border-brand-gray">
                  <code className="text-brand-gold mobile-text break-all">
                    https://importiq.com?ref={affiliateData.referralCode}
                  </code>
                </div>
                <Button
                  className="w-full mt-3 bg-brand-gold hover:bg-brand-gold-dark text-black mobile-touch"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://importiq.com?ref=${affiliateData.referralCode}`);
                    toast({ title: "Link copied to clipboard!" });
                  }}
                >
                  Copy Link
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-brand-gray">
              <CardHeader>
                <CardTitle className="text-brand-white flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-brand-gold" />
                  Commission Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-brand-gray">Tier:</span>
                    <span className="text-brand-white capitalize">{affiliateData.tier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray">Commission Rate:</span>
                    <span className="text-brand-gold font-bold">{affiliateData.commissionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray">Recurring:</span>
                    <span className="text-brand-white">Monthly</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray">Cookie Duration:</span>
                    <span className="text-brand-white">30 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          <Card className="bg-card border-brand-gray mb-8">
            <CardHeader>
              <CardTitle className="text-brand-white">Get Started</CardTitle>
              <CardDescription className="text-brand-gray">
                Follow these steps to start earning commissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-brand-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-black text-xs font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-white">Share Your Link</h4>
                    <p className="text-brand-gray mobile-text">
                      Copy your referral link and share it on social media, blogs, or with friends interested in importing vehicles.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-brand-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-black text-xs font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-white">Track Performance</h4>
                    <p className="text-brand-gray mobile-text">
                      Access your affiliate dashboard anytime to monitor clicks, signups, and earnings.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-brand-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-black text-xs font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-white">Get Paid</h4>
                    <p className="text-brand-gray mobile-text">
                      Request payouts directly from your dashboard. Minimum payout is $50 via PayPal or bank transfer.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-brand-gold hover:bg-brand-gold-dark text-black mobile-touch"
              onClick={() => window.open(`/affiliate-dashboard?email=${affiliateData.email}`, '_blank')}
            >
              View Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="border-brand-gray text-brand-white hover:bg-brand-gray mobile-touch"
              onClick={() => window.location.href = '/'}
            >
              Back to ImportIQ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-brand-white">
      <div className="mobile-padding py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-gold mb-4">
              Join ImportIQ Affiliates
            </h1>
            <p className="text-lg sm:text-xl text-brand-gray max-w-3xl mx-auto mb-8">
              Earn recurring commissions by referring people to Australia's most comprehensive vehicle import platform.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Benefits Section */}
            <div className="space-y-8">
              <div>
                <h2 className="mobile-heading font-bold text-brand-white mb-6">
                  Why Join Our Affiliate Program?
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-brand-gold rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-white mb-2">20% Recurring Commission</h3>
                      <p className="text-brand-gray mobile-text">
                        Earn 20% on every monthly subscription from your referrals. Influencers can earn up to 40%.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-brand-gold rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-white mb-2">High-Converting Product</h3>
                      <p className="text-brand-gray mobile-text">
                        ImportIQ saves users thousands on vehicle imports. Easy sell with proven ROI.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-brand-gold rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-white mb-2">Growing Market</h3>
                      <p className="text-brand-gray mobile-text">
                        Vehicle importing is booming in Australia. Tap into this expanding market.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Commission Tiers */}
              <Card className="bg-card border-brand-gray">
                <CardHeader>
                  <CardTitle className="text-brand-white">Commission Tiers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-brand-black rounded-lg border border-brand-gray">
                      <div>
                        <div className="font-semibold text-brand-white">Starter</div>
                        <div className="mobile-text text-brand-gray">Standard affiliate</div>
                      </div>
                      <div className="text-brand-gold font-bold">20%</div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-brand-gold/10 to-transparent rounded-lg border border-brand-gold/20">
                      <div>
                        <div className="font-semibold text-brand-white">Influencer</div>
                        <div className="mobile-text text-brand-gray">By invitation</div>
                      </div>
                      <div className="text-brand-gold font-bold">40%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Signup Form */}
            <Card className="bg-card border-brand-gray">
              <CardHeader>
                <CardTitle className="text-brand-white">Start Earning Today</CardTitle>
                <CardDescription className="text-brand-gray">
                  Create your affiliate account in under 60 seconds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-brand-white">Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              {...field}
                              className="mobile-touch border-brand-gray bg-brand-black text-brand-white"
                              disabled={signupMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-brand-white">Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email address"
                              {...field}
                              className="mobile-touch border-brand-gray bg-brand-black text-brand-white"
                              disabled={signupMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="socialLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-brand-white">Social Media (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your website, YouTube, Instagram, etc."
                              {...field}
                              className="mobile-touch border-brand-gray bg-brand-black text-brand-white"
                              disabled={signupMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-brand-gold hover:bg-brand-gold-dark text-black mobile-touch"
                      disabled={signupMutation.isPending}
                    >
                      {signupMutation.isPending ? "Creating Account..." : "Join Affiliate Program"}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 p-4 bg-brand-black rounded-lg border border-brand-gray">
                  <p className="mobile-text text-brand-gray text-center">
                    By joining, you agree to our affiliate terms. No spam, quality referrals only.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}