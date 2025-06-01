import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Mail, User, Brain, Target, TrendingUp, Star } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const emailGateSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
});

type EmailGateData = z.infer<typeof emailGateSchema>;

interface AIEmailGateProps {
  onSuccess: (userData: { name: string; email: string; isReturning: boolean }) => void;
}

export default function AIEmailGate({ onSuccess }: AIEmailGateProps) {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-brand-gold to-amber-500 rounded-full">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Get AI-Powered Vehicle Recommendations</CardTitle>
          <CardDescription className="text-gray-600 text-base leading-relaxed">
            Our AI analyzes real auction data and market trends to recommend the perfect vehicles for your budget and goals. Get personalized suggestions in under 3 minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* AI-Specific Value Proposition */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center">
              <Star className="h-4 w-4 text-brand-gold mr-2" />
              You'll get personalized recommendations including:
            </h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                <span>AI-curated vehicle matches based on your exact preferences</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                <span>Real-time market insights and pricing analysis</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                <span>Investment potential and appreciation forecasts</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                <span>Detailed pros/cons analysis for each recommendation</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                <span>Service tier recommendations for your import project</span>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-sm text-green-800">
              <Target className="h-4 w-4 mr-2" />
              <span className="font-medium">Used by 500+ successful importers</span>
              <span className="ml-2 text-green-600">• Average savings: $8,500</span>
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
                  className="pl-10"
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
                  className="pl-10"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-brand-gold to-amber-500 hover:from-brand-gold-dark hover:to-amber-600 text-white font-semibold py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Analyzing..." : "Get My AI Vehicle Recommendations"}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="text-center text-xs text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-3 w-3" />
                <span>Your information is secure and will not be shared</span>
              </div>
            </div>
            <div className="text-center text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium">Why we need your details:</p>
              <p className="mt-1">To provide personalized vehicle recommendations and market insights tailored to your preferences. No spam, just valuable import intelligence.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}