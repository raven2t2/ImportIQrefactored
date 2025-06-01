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
      return await apiRequest("/api/check-email", "POST", data);
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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-brand-gold rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">{title}</CardTitle>
          <CardDescription className="text-gray-600 text-base leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Value Proposition */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-sm text-gray-900 mb-3">You'll get instant access to:</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                <span>Accurate landed cost calculator with real freight rates</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                <span>Regional shipping adjustments for your location</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                <span>Breakdown of duties, GST, LCT, and compliance costs</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-brand-gold rounded-full mr-3"></div>
                <span>Service tier recommendations based on vehicle value</span>
              </div>
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
              className="w-full bg-brand-gold hover:bg-brand-gold-dark text-white font-semibold py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : buttonText}
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
              <p className="mt-1">To provide accurate regional freight costs and save your calculations for future reference. No spam, just helpful import insights.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}