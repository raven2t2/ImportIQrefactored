import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Shield, LogIn } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import logoPath from "@assets/circular imi logo (3).png";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      return await apiRequest("POST", "/api/login", data);
    },
    onSuccess: (response: any) => {
      setIsSubmitting(false);
      
      if (response.hasActiveTrial) {
        toast({
          title: "Welcome back!",
          description: `You have ${response.trialDaysRemaining} days left in your trial.`,
          duration: 3000,
        });
        localStorage.setItem('trial_user_name', response.name);
        localStorage.setItem('trial_user_email', response.email);
        setTimeout(() => {
          window.location.href = `/trial-dashboard?name=${encodeURIComponent(response.name)}&email=${encodeURIComponent(response.email)}`;
        }, 1000);
      } else if (response.exists) {
        toast({
          title: "Trial Expired",
          description: "Your trial has ended. Let's get you set up with a subscription!",
          duration: 3000,
        });
        setTimeout(() => {
          window.location.href = '/pricing';
        }, 1000);
      } else {
        toast({
          title: "Account Not Found",
          description: "No account found with that email. Would you like to start a free trial?",
          duration: 3000,
        });
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    },
    onError: () => {
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginData) => {
    setIsSubmitting(true);
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src={logoPath} 
              alt="ImportIQ" 
              className="w-16 h-16"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Access your ImportIQ trial or subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
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

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  {...form.register("password")}
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Checking..."
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Access Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="/" className="text-amber-600 hover:underline font-medium">
                Start Free Trial
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}