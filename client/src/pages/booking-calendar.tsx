import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, Phone, Mail, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const bookingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone number required"),
  service: z.enum(["consultation", "build-planning", "compliance-review", "full-service"], {
    required_error: "Please select a service",
  }),
  preferredDate: z.string().min(1, "Preferred date required"),
  preferredTime: z.enum(["9am", "10am", "11am", "1pm", "2pm", "3pm", "4pm"], {
    required_error: "Please select a time",
  }),
  vehicleDetails: z.string().optional(),
  message: z.string().optional(),
});

type FormData = z.infer<typeof bookingSchema>;

interface BookingResponse {
  success: boolean;
  bookingId: string;
  confirmationEmail: boolean;
}

export default function BookingCalendar() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      vehicleDetails: "",
      message: "",
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: FormData): Promise<BookingResponse> => {
      const response = await apiRequest("POST", "/api/bookings", data);
      return response.json();
    },
    onSuccess: (data) => {
      setIsSubmitted(true);
      toast({
        title: "Booking Confirmed!",
        description: "We'll send you a confirmation email shortly.",
      });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    bookingMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardContent className="py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
              <p className="text-gray-600 mb-8">
                Thank you for booking with Immaculate Imports. We'll contact you within 24 hours to confirm your appointment details.
              </p>
              <div className="space-y-4">
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  View Your Dashboard
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="w-full"
                >
                  Back to Tools
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const serviceOptions = [
    { value: "consultation", label: "Free Consultation (30 min)" },
    { value: "build-planning", label: "Build Planning Session (60 min)" },
    { value: "compliance-review", label: "Compliance Review (45 min)" },
    { value: "full-service", label: "Full Service Discussion (90 min)" },
  ];

  const timeSlots = [
    { value: "9am", label: "9:00 AM" },
    { value: "10am", label: "10:00 AM" },
    { value: "11am", label: "11:00 AM" },
    { value: "1pm", label: "1:00 PM" },
    { value: "2pm", label: "2:00 PM" },
    { value: "3pm", label: "3:00 PM" },
    { value: "4pm", label: "4:00 PM" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Book Your Consultation</h1>
          <p className="text-gray-600">
            Schedule a personalized session with our import specialists
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Schedule Your Appointment</span>
            </CardTitle>
            <CardDescription>
              Choose your preferred time and tell us about your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Your full name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      {...form.register("phone")}
                      placeholder="(04) 1234 5678"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder="your.email@example.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Service & Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Service & Schedule
                </h3>

                <div>
                  <Label>Service Type</Label>
                  <Select onValueChange={(value) => form.setValue("service", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.service && (
                    <p className="text-sm text-red-600">{form.formState.errors.service.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredDate">Preferred Date</Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      {...form.register("preferredDate")}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {form.formState.errors.preferredDate && (
                      <p className="text-sm text-red-600">{form.formState.errors.preferredDate.message}</p>
                    )}
                  </div>

                  <div>
                    <Label>Preferred Time</Label>
                    <Select onValueChange={(value) => form.setValue("preferredTime", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.preferredTime && (
                      <p className="text-sm text-red-600">{form.formState.errors.preferredTime.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Project Details
                </h3>

                <div>
                  <Label htmlFor="vehicleDetails">Vehicle Details (Optional)</Label>
                  <Input
                    id="vehicleDetails"
                    {...form.register("vehicleDetails")}
                    placeholder="e.g., 2023 Toyota Supra, R34 GTR, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="message">Additional Information (Optional)</Label>
                  <Textarea
                    id="message"
                    {...form.register("message")}
                    placeholder="Tell us about your import goals, timeline, budget range, or any specific questions..."
                    rows={4}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={bookingMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-3"
              >
                {bookingMutation.isPending ? "Booking..." : "Confirm Booking"}
              </Button>

              <p className="text-sm text-gray-600 text-center">
                By booking, you agree to our terms of service. We'll contact you within 24 hours to confirm your appointment.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}