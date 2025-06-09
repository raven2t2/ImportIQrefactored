import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Send, User, Mail, Phone, MessageSquare } from 'lucide-react';

const inquiryFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']),
  serviceType: z.enum(['quote', 'consultation', 'full-service', 'compliance-only']),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  message: z.string().min(10, 'Please provide at least 10 characters describing your project'),
  preferredContact: z.enum(['email', 'phone', 'either'])
});

type InquiryFormData = z.infer<typeof inquiryFormSchema>;

interface ProjectInquiryFormProps {
  vehicleData: {
    make?: string;
    model?: string;
    chassis?: string;
    year?: string;
  };
  destination: string;
}

export function ProjectInquiryForm({ vehicleData, destination }: ProjectInquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      urgency: 'medium',
      serviceType: 'quote',
      budget: '',
      timeline: '',
      message: `I'm interested in importing a ${vehicleData.make || ''} ${vehicleData.model || ''} ${vehicleData.chassis ? `(${vehicleData.chassis})` : ''} to ${destination}. Please provide me with more information about the import process.`.trim(),
      preferredContact: 'email'
    }
  });

  const onSubmit = async (data: InquiryFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/project-inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          vehicleInfo: {
            make: vehicleData.make,
            model: vehicleData.model,
            chassis: vehicleData.chassis,
            year: vehicleData.year
          },
          destination,
          submittedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit inquiry');
      }

      toast({
        title: "Inquiry Submitted Successfully",
        description: "We'll get back to you within 24 hours with personalized import guidance.",
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly at experts@driveimmaculate.com",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Full Name *
          </Label>
          <Input
            id="name"
            {...form.register('name')}
            placeholder="Your full name"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            {...form.register('email')}
            placeholder="your.email@example.com"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Number
          </Label>
          <Input
            id="phone"
            {...form.register('phone')}
            placeholder="+61 2 8123 4567"
          />
        </div>

        <div>
          <Label htmlFor="urgency">Project Urgency</Label>
          <Select onValueChange={(value: any) => form.setValue('urgency', value)} defaultValue="medium">
            <SelectTrigger>
              <SelectValue placeholder="Select urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low - Planning ahead</SelectItem>
              <SelectItem value="medium">Medium - Next few months</SelectItem>
              <SelectItem value="high">High - Within 6 weeks</SelectItem>
              <SelectItem value="urgent">Urgent - ASAP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="serviceType">Service Needed</Label>
          <Select onValueChange={(value: any) => form.setValue('serviceType', value)} defaultValue="quote">
            <SelectTrigger>
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quote">Free Quote</SelectItem>
              <SelectItem value="consultation">Expert Consultation</SelectItem>
              <SelectItem value="full-service">Full Import Service</SelectItem>
              <SelectItem value="compliance-only">Compliance Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="preferredContact">Preferred Contact</Label>
          <Select onValueChange={(value: any) => form.setValue('preferredContact', value)} defaultValue="email">
            <SelectTrigger>
              <SelectValue placeholder="How should we contact you?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone Call</SelectItem>
              <SelectItem value="either">Either Method</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="budget">Budget Range (Optional)</Label>
          <Input
            id="budget"
            {...form.register('budget')}
            placeholder="e.g., $50,000 - $80,000"
          />
        </div>

        <div>
          <Label htmlFor="timeline">Desired Timeline (Optional)</Label>
          <Input
            id="timeline"
            {...form.register('timeline')}
            placeholder="e.g., 3-6 months"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="message" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Tell Us About Your Project *
        </Label>
        <Textarea
          id="message"
          {...form.register('message')}
          placeholder="Please describe your import project, any specific requirements, concerns, or questions you have..."
          rows={4}
        />
        {form.formState.errors.message && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.message.message}</p>
        )}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Our Response Commitment</h4>
              <p className="text-sm text-blue-700 mt-1">
                We'll review your project and respond within 24 hours with personalized guidance. All inquiries are handled by licensed import specialists.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
      >
        <Send className="h-4 w-4" />
        {isSubmitting ? 'Submitting...' : 'Submit Project Inquiry'}
      </Button>
    </form>
  );
}