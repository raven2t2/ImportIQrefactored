import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, DollarSign, Calendar, Phone, Mail, ArrowRight } from "lucide-react";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  vehicleDetails: z.string().min(10, "Please describe your vehicle or requirements"),
  serviceType: z.string(),
  timeline: z.string(),
  budget: z.string(),
});

type FormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      vehicleDetails: "",
      serviceType: "",
      timeline: "",
      budget: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    // Here you would integrate with your payment processor for the $500 deposit
    console.log("Checkout submission:", data);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
            <p className="text-lg text-gray-600 mb-6">
              We've received your request and will contact you within 24 hours to discuss your import project and arrange your $500 deposit.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-medium">Next Steps:</p>
              <div className="text-blue-700 text-sm mt-2 space-y-1">
                <div>• Our import specialist will call you to discuss your project</div>
                <div>• We'll provide a detailed import plan and timeline</div>
                <div>• Secure your $500 deposit to begin the process</div>
              </div>
            </div>
            <Button 
              onClick={() => window.open('https://driveimmaculate.com', '_blank')}
              className="bg-[#D4AF37] hover:bg-amber-500"
            >
              Visit Our Main Website
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your First Step Toward Something Immaculate</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            You wouldn't be here if you weren't serious — and that's exactly who we work with.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Benefits */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span>This $500 deposit:</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                  <div className="text-sm">
                    Reserves your place in our active sourcing queue
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                  <div className="text-sm">
                    Signals you're ready to stop browsing and start building
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                  <div className="text-sm">
                    Is fully credited toward your chosen service tier — nothing extra, no hidden upsells
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium mb-1">🔐 Secure checkout powered by Stripe</p>
                  <p className="text-sm text-blue-700">⚖️ Risk-free — refundable until we source your vehicle</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What Happens Next</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">1</div>
                  <span>We call you within 24 hours</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">2</div>
                  <span>Discuss your requirements and budget</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">3</div>
                  <span>Provide detailed import plan</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">4</div>
                  <span>Begin vehicle sourcing process</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Start Your Import Project</CardTitle>
                <CardDescription>
                  Tell us about your dream vehicle and we'll make it happen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="Your full name"
                        {...form.register("fullName")}
                      />
                      {form.formState.errors.fullName && (
                        <p className="text-sm text-red-600">{form.formState.errors.fullName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        {...form.register("email")}
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="Your phone number"
                      {...form.register("phone")}
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleDetails">Vehicle Requirements *</Label>
                    <Textarea
                      id="vehicleDetails"
                      placeholder="Describe your ideal vehicle (make, model, year, modifications, etc.)"
                      rows={4}
                      {...form.register("vehicleDetails")}
                    />
                    {form.formState.errors.vehicleDetails && (
                      <p className="text-sm text-red-600">{form.formState.errors.vehicleDetails.message}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="serviceType">Service Type</Label>
                      <Select onValueChange={(value) => form.setValue("serviceType", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-import">Complete Import Service</SelectItem>
                          <SelectItem value="sourcing">Vehicle Sourcing Only</SelectItem>
                          <SelectItem value="compliance">Compliance & Registration</SelectItem>
                          <SelectItem value="consultation">Import Consultation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timeline">Timeline</Label>
                      <Select onValueChange={(value) => form.setValue("timeline", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="When do you need it?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asap">As soon as possible</SelectItem>
                          <SelectItem value="1-3months">1-3 months</SelectItem>
                          <SelectItem value="3-6months">3-6 months</SelectItem>
                          <SelectItem value="6months+">6+ months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget Range</Label>
                    <Select onValueChange={(value) => form.setValue("budget", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under50k">Under $50,000</SelectItem>
                        <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                        <SelectItem value="100k-200k">$100,000 - $200,000</SelectItem>
                        <SelectItem value="200k+">$200,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center italic">
                    <p className="text-gray-700 text-sm mb-2">
                      "People don't buy because they understand. They buy because they feel understood."
                    </p>
                    <p className="text-gray-600 text-xs">— Zig Ziglar</p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="text-amber-800 font-medium mb-2">This is your move. We'll take it from here.</div>
                    <div className="text-amber-700 text-sm">
                      Submit this form and we'll contact you within 24 hours to discuss your project and arrange the $500 deposit to get started.
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#D4AF37] hover:bg-amber-500 text-white py-3 text-lg"
                  >
                    Get Started - Submit Request
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <div className="text-center">
                    <a 
                      href="https://driveimmaculate.com/howitworks/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Learn more about how our import process works →
                    </a>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}