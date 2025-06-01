import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Globe, 
  Users, 
  Truck, 
  Target, 
  Clock,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="py-20 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-amber-400/10 text-amber-400 border-amber-400/30 px-4 py-2">
              Founded by Industry Professionals
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight">
              Built by Experts Who
              <span className="text-amber-400"> Understand Import</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
              ImportIQ was born from real-world experience navigating complex international supply chains, 
              military logistics operations, and the frustrations of traditional import brokers.
            </p>
          </div>
        </div>
      </div>

      {/* Founder Story */}
      <div className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
                Why We Built ImportIQ
              </h2>
              <div className="space-y-6 text-gray-300 leading-relaxed">
                <p>
                  ImportIQ was founded by professionals with deep expertise in military logistics 
                  and global sourcing operations. As dual citizens with extensive experience across 
                  Australia, the U.S., and Japan, we've seen firsthand the complexity of international 
                  vehicle imports.
                </p>
                <p>
                  After years of managing complex supply chains and navigating regulatory frameworks 
                  in defense operations, we recognized that the vehicle import industry was stuck 
                  in the past - relying on outdated processes, hidden fees, and guesswork.
                </p>
                <p>
                  ImportIQ brings military-grade precision to vehicle imports. We believe every 
                  importer deserves complete transparency, accurate cost calculations, and access 
                  to the same professional-grade tools used by industry experts.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              {[
                {
                  icon: Shield,
                  title: "Military Logistics Background",
                  description: "Proven experience managing complex, multi-national supply chain operations with zero tolerance for errors."
                },
                {
                  icon: Globe,
                  title: "Global Sourcing Network", 
                  description: "Established relationships with trusted suppliers and auction platforms across automotive capitals worldwide."
                },
                {
                  icon: Target,
                  title: "Precision-Focused Approach",
                  description: "Every calculation backed by real government data. No estimates, no surprises, no hidden costs."
                }
              ].map((item, index) => (
                <Card key={index} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-6 w-6 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Values */}
      <div className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Transform vehicle imports from a complex, uncertain process into a transparent, 
              predictable experience backed by professional-grade intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle,
                title: "Complete Transparency",
                description: "Every cost, every step, every requirement clearly defined upfront. No hidden fees, no surprise charges."
              },
              {
                icon: Clock,
                title: "Military Precision",
                description: "Processes refined through logistics operations where accuracy and timing are mission-critical."
              },
              {
                icon: Users,
                title: "Professional Support",
                description: "Guidance from experts who understand complex supply chains and regulatory requirements."
              }
            ].map((value, index) => (
              <Card key={index} className="bg-gray-900 border-gray-800 text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-amber-400/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <value.icon className="h-8 w-8 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Why Different */}
      <div className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Why ImportIQ is Different
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're not another broker or middleman. We're professionals who've built the tools 
              we wish existed when we started importing vehicles.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Traditional Way */}
            <div className="space-y-8">
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-red-400 mb-6">Traditional Import Brokers</h3>
                <div className="space-y-4">
                  {[
                    "Hidden markup on every transaction",
                    "Vague estimates that become expensive surprises", 
                    "Limited visibility into actual processes",
                    "One-size-fits-all approach",
                    "Reactive problem-solving when issues arise"
                  ].map((problem, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">✗</span>
                      </div>
                      <p className="text-gray-300">{problem}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ImportIQ Way */}
            <div className="space-y-8">
              <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-amber-400 mb-6">The ImportIQ Approach</h3>
                <div className="space-y-4">
                  {[
                    "Transparent pricing with no hidden fees",
                    "Precise calculations using real government data",
                    "Complete visibility into every step",
                    "AI-powered recommendations tailored to you",
                    "Proactive planning prevents costly mistakes"
                  ].map((solution, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-black text-xs font-bold">✓</span>
                      </div>
                      <p className="text-gray-300">{solution}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-amber-400/5 via-black to-amber-400/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Import with Confidence?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join professionals who demand transparency, accuracy, and results from their import process.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/features">
              <Button 
                size="lg" 
                className="bg-amber-400 hover:bg-amber-500 text-black px-12 py-4 text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 font-medium"
              >
                Explore All 14 Tools
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/import-calculator">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-gray-600 text-white hover:bg-gray-800 hover:border-gray-500 px-12 py-4 text-lg rounded-full transition-all duration-300 font-medium"
              >
                Try Cost Calculator
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}