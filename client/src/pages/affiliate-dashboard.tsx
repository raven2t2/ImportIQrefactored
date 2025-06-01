import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DollarSign, Users, MousePointer, TrendingUp, Copy, Download, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AffiliateData {
  affiliate: {
    id: number;
    name: string;
    email: string;
    referralCode: string;
    tier: string;
    commissionRate: number;
    totalClicks: number;
    totalSignups: number;
    totalEarnings: number;
    currentBalance: number;
    isInfluencer: boolean;
  };
  stats: {
    clicks: number;
    signups: number;
    earnings: number;
  };
  payoutRequests: Array<{
    id: number;
    amount: number;
    paymentMethod: string;
    status: string;
    requestedAt: string;
  }>;
  influencerProfile?: any;
}

export default function AffiliateDashboard() {
  const [email, setEmail] = useState<string>("");
  const [payoutAmount, setPayoutAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("paypal");
  const [paymentEmail, setPaymentEmail] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get email from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  // Fetch affiliate data
  const { data: affiliateData, isLoading } = useQuery({
    queryKey: [`/api/affiliate/${email}`],
    enabled: !!email,
  });

  // Payout request mutation
  const payoutMutation = useMutation({
    mutationFn: async (data: { affiliateEmail: string; amount: number; paymentMethod: string; paymentDetails: any }) => {
      return await apiRequest("POST", "/api/affiliate/payout-request", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/affiliate/${email}`] });
      setPayoutAmount("");
      setPaymentEmail("");
      toast({
        title: "Payout Request Submitted",
        description: "Your payout request has been submitted for review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payout Request Failed",
        description: error.message || "Failed to submit payout request.",
        variant: "destructive",
      });
    },
  });

  const handlePayoutRequest = () => {
    if (!email || !payoutAmount || !paymentEmail) return;
    
    const amount = parseFloat(payoutAmount);
    if (amount < 50) {
      toast({
        title: "Minimum Payout",
        description: "Minimum payout amount is $50.",
        variant: "destructive",
      });
      return;
    }

    payoutMutation.mutate({
      affiliateEmail: email,
      amount,
      paymentMethod,
      paymentDetails: { email: paymentEmail }
    });
  };

  const copyReferralLink = () => {
    if (affiliateData?.affiliate?.referralCode) {
      const link = `https://importiq.com?ref=${affiliateData.affiliate.referralCode}`;
      navigator.clipboard.writeText(link);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-black text-brand-white flex items-center justify-center mobile-padding">
        <Card className="bg-card border-brand-gray max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-brand-white">Access Dashboard</CardTitle>
            <CardDescription className="text-brand-gray">
              Enter your affiliate email to view your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-brand-white">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your affiliate email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mobile-touch border-brand-gray bg-brand-black text-brand-white"
                />
              </div>
              <Button
                onClick={() => window.location.search = `?email=${email}`}
                className="w-full bg-brand-gold hover:bg-brand-gold-dark text-black mobile-touch"
                disabled={!email}
              >
                Access Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-brand-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!affiliateData) {
    return (
      <div className="min-h-screen bg-black text-brand-white flex items-center justify-center mobile-padding">
        <Card className="bg-card border-brand-gray max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-brand-white">Affiliate Not Found</CardTitle>
            <CardDescription className="text-brand-gray">
              No affiliate account found with this email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => window.location.href = '/affiliate-signup'}
              className="w-full bg-brand-gold hover:bg-brand-gold-dark text-black mobile-touch"
            >
              Join Affiliate Program
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { affiliate, stats } = affiliateData;

  return (
    <div className="min-h-screen bg-black text-brand-white">
      <div className="mobile-padding py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mobile-heading font-bold text-brand-gold mb-2">
              Affiliate Dashboard
            </h1>
            <p className="mobile-text text-brand-gray">
              Welcome back, {affiliate.name}! Track your performance and manage payouts.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card className="bg-card border-brand-gray">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mobile-text text-brand-gray">Total Clicks</p>
                    <p className="text-2xl sm:text-3xl font-bold text-brand-white">{stats.clicks}</p>
                  </div>
                  <MousePointer className="h-8 w-8 text-brand-gold" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-brand-gray">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mobile-text text-brand-gray">Signups</p>
                    <p className="text-2xl sm:text-3xl font-bold text-brand-white">{stats.signups}</p>
                  </div>
                  <Users className="h-8 w-8 text-brand-gold" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-brand-gray">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mobile-text text-brand-gray">Total Earnings</p>
                    <p className="text-2xl sm:text-3xl font-bold text-brand-white">${affiliate.totalEarnings.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-brand-gold" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-brand-gray">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mobile-text text-brand-gray">Available Balance</p>
                    <p className="text-2xl sm:text-3xl font-bold text-brand-gold">${affiliate.currentBalance.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-brand-gold" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Referral Tools */}
            <Card className="bg-card border-brand-gray">
              <CardHeader>
                <CardTitle className="text-brand-white">Referral Tools</CardTitle>
                <CardDescription className="text-brand-gray">
                  Share your link and start earning commissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-brand-white mb-2 block">Your Referral Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={`https://importiq.com?ref=${affiliate.referralCode}`}
                      readOnly
                      className="mobile-touch border-brand-gray bg-brand-black text-brand-white"
                    />
                    <Button
                      onClick={copyReferralLink}
                      className="bg-brand-gold hover:bg-brand-gold-dark text-black mobile-touch"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-brand-black rounded-lg border border-brand-gray">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-gray">Commission Tier:</span>
                      <span className="text-brand-white capitalize">{affiliate.tier}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-gray">Commission Rate:</span>
                      <span className="text-brand-gold font-bold">{affiliate.commissionRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-gray">Attribution:</span>
                      <span className="text-brand-white">30 days</span>
                    </div>
                  </div>
                  
                  {affiliate.isInfluencer && (
                    <div className="pt-4 border-t border-brand-gray">
                      <div className="flex items-center justify-between">
                        <span className="text-brand-gold font-semibold">Influencer Status</span>
                        <Button
                          size="sm"
                          className="bg-brand-gold hover:bg-brand-gold-dark text-black"
                          onClick={() => window.open(`/partner/${affiliate.referralCode}`, '_blank')}
                        >
                          View Landing Page
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payout Request */}
            <Card className="bg-card border-brand-gray">
              <CardHeader>
                <CardTitle className="text-brand-white">Request Payout</CardTitle>
                <CardDescription className="text-brand-gray">
                  Minimum payout amount is $50
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-brand-white">Amount ($)</Label>
                  <Input
                    type="number"
                    placeholder="50.00"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="mobile-touch border-brand-gray bg-brand-black text-brand-white"
                    disabled={payoutMutation.isPending}
                  />
                </div>

                <div>
                  <Label className="text-brand-white">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="mobile-touch border-brand-gray bg-brand-black text-brand-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-brand-white">
                    {paymentMethod === 'paypal' ? 'PayPal Email' : 'Email Address'}
                  </Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={paymentEmail}
                    onChange={(e) => setPaymentEmail(e.target.value)}
                    className="mobile-touch border-brand-gray bg-brand-black text-brand-white"
                    disabled={payoutMutation.isPending}
                  />
                </div>

                <Button
                  onClick={handlePayoutRequest}
                  className="w-full bg-brand-gold hover:bg-brand-gold-dark text-black mobile-touch"
                  disabled={payoutMutation.isPending || !payoutAmount || !paymentEmail}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {payoutMutation.isPending ? "Submitting..." : "Request Payout"}
                </Button>

                <p className="mobile-text text-brand-gray text-center">
                  Available Balance: ${affiliate.currentBalance.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Payout Requests */}
          {affiliateData.payoutRequests.length > 0 && (
            <Card className="bg-card border-brand-gray mt-8">
              <CardHeader>
                <CardTitle className="text-brand-white">Recent Payout Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {affiliateData.payoutRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-brand-black rounded-lg border border-brand-gray"
                    >
                      <div className="space-y-1 sm:space-y-0">
                        <div className="font-semibold text-brand-white">${request.amount.toFixed(2)}</div>
                        <div className="mobile-text text-brand-gray">
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 sm:mt-0">
                        <div className="mobile-text text-brand-gray capitalize">
                          {request.paymentMethod}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          request.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                          request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {request.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}