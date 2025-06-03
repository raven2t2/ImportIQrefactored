import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Ship, FileCheck, Truck, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const timelineSchema = z.object({
  origin: z.string(),
  method: z.string(),
  port: z.string(),
  season: z.string(),
});

type FormData = z.infer<typeof timelineSchema>;

const shippingData = {
  japan: {
    name: "Japan",
    ports: ["Tokyo", "Yokohama", "Osaka", "Nagoya"],
    methods: {
      roro: { name: "RoRo (Roll-on/Roll-off)", baseTime: 21, cost: "Lower" },
      container: { name: "Container Shipping", baseTime: 28, cost: "Higher" }
    }
  },
  usa: {
    name: "United States",
    ports: ["Los Angeles", "Long Beach", "San Francisco", "Seattle"],
    methods: {
      roro: { name: "RoRo (Roll-on/Roll-off)", baseTime: 35, cost: "Lower" },
      container: { name: "Container Shipping", baseTime: 42, cost: "Higher" }
    }
  }
};

const australianPorts = {
  sydney: { name: "Sydney (Port Botany)", processing: 7, backlog: "Medium" },
  melbourne: { name: "Melbourne", processing: 5, backlog: "Low" },
  brisbane: { name: "Brisbane", processing: 6, backlog: "Medium" },
  adelaide: { name: "Adelaide", processing: 4, backlog: "Low" },
  fremantle: { name: "Fremantle (Perth)", processing: 8, backlog: "High" },
  darwin: { name: "Darwin", processing: 3, backlog: "Low" }
};

const seasonalFactors = {
  summer: { name: "Summer (Dec-Feb)", delay: 0, description: "Optimal shipping season" },
  autumn: { name: "Autumn (Mar-May)", delay: 3, description: "Good shipping conditions" },
  winter: { name: "Winter (Jun-Aug)", delay: 7, description: "Peak shipping season - delays expected" },
  spring: { name: "Spring (Sep-Nov)", delay: 2, description: "Favorable conditions returning" }
};

export default function ImportTimeline() {
  const [results, setResults] = useState<any>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(timelineSchema),
    defaultValues: {
      origin: "",
      method: "",
      port: "",
      season: "",
    },
  });

  const onSubmit = (data: FormData) => {
    const origin = shippingData[data.origin as keyof typeof shippingData];
    const method = origin.methods[data.method as keyof typeof origin.methods];
    const port = australianPorts[data.port as keyof typeof australianPorts];
    const season = seasonalFactors[data.season as keyof typeof seasonalFactors];

    // Calculate timeline
    const baseShipping = method.baseTime;
    const seasonalDelay = season.delay;
    const portProcessing = port.processing;
    const compliance = 14; // Average compliance time
    const registration = 7; // Registration process

    const totalDays = baseShipping + seasonalDelay + portProcessing + compliance + registration;

    // Generate timeline phases
    const phases = [
      {
        name: "Purchase & Export Preparation",
        duration: 7,
        description: "Vehicle purchase, export documentation, and shipping arrangement",
        status: "pending"
      },
      {
        name: "Ocean Transit",
        duration: baseShipping + seasonalDelay,
        description: `${method.name} from ${origin.name} to ${port.name}`,
        status: "pending"
      },
      {
        name: "Port Processing & Quarantine",
        duration: portProcessing,
        description: "Customs clearance, quarantine inspection, and port handling",
        status: "pending"
      },
      {
        name: "Compliance & Modification",
        duration: compliance,
        description: "ADR compliance, roadworthy certificate, and any required modifications",
        status: "pending"
      },
      {
        name: "Registration Process",
        duration: registration,
        description: "State registration, insurance, and final documentation",
        status: "pending"
      }
    ];

    // Calculate cumulative dates
    let cumulativeDays = 0;
    const timelineWithDates = phases.map(phase => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + cumulativeDays);
      
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + cumulativeDays + phase.duration);
      
      cumulativeDays += phase.duration;
      
      return {
        ...phase,
        startDate,
        endDate,
        weekNumber: Math.ceil(cumulativeDays / 7)
      };
    });

    setResults({
      origin,
      method,
      port,
      season,
      totalDays,
      totalWeeks: Math.ceil(totalDays / 7),
      timeline: timelineWithDates,
      estimatedCompletion: new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000)
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-AU', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Import Timeline Simulator</h1>
              <p className="text-gray-600">Visualize your complete import journey from purchase to road-ready</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Import Parameters</CardTitle>
                <CardDescription>
                  Configure your shipping and timing details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label>Shipping Origin</Label>
                    <Select onValueChange={(value) => form.setValue("origin", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select origin country" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(shippingData).map(([key, origin]) => (
                          <SelectItem key={key} value={key}>
                            {origin.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {form.watch("origin") && (
                    <div>
                      <Label>Shipping Method</Label>
                      <Select onValueChange={(value) => form.setValue("method", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shipping method" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(shippingData[form.watch("origin") as keyof typeof shippingData]?.methods || {}).map(([key, method]) => (
                            <SelectItem key={key} value={key}>
                              {method.name} - {method.baseTime} days ({method.cost} cost)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>Australian Port of Entry</Label>
                    <Select onValueChange={(value) => form.setValue("port", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select arrival port" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(australianPorts).map(([key, port]) => (
                          <SelectItem key={key} value={key}>
                            {port.name} - {port.backlog} backlog
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Time of Year</Label>
                    <Select onValueChange={(value) => form.setValue("season", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(seasonalFactors).map(([key, season]) => (
                          <SelectItem key={key} value={key}>
                            {season.name} - {season.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!form.watch("origin") || !form.watch("method") || !form.watch("port") || !form.watch("season")}
                  >
                    Generate Timeline
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          {results && (
            <div className="lg:col-span-2 space-y-6">
              {/* Timeline Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Import Timeline Overview</span>
                  </CardTitle>
                  <CardDescription>
                    Complete journey from {results.origin.name} to road-ready in Australia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">
                        {results.totalWeeks} weeks
                      </div>
                      <div className="text-sm text-blue-700">Total timeline</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="text-lg font-bold text-green-600">
                        {formatDate(results.estimatedCompletion)}
                      </div>
                      <div className="text-sm text-green-700">Estimated completion</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="text-lg font-bold text-purple-600">
                        {results.method.name}
                      </div>
                      <div className="text-sm text-purple-700">Shipping method</div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <div className="grid grid-cols-2 gap-4">
                      <div><strong>Origin:</strong> {results.origin.name}</div>
                      <div><strong>Destination:</strong> {results.port.name}</div>
                      <div><strong>Season:</strong> {results.season.name}</div>
                      <div><strong>Port Backlog:</strong> {results.port.backlog}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Visual Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Timeline</CardTitle>
                  <CardDescription>
                    Week-by-week breakdown of your import process
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.timeline.map((phase: any, index: number) => (
                      <div key={index} className="relative">
                        {/* Timeline line */}
                        {index < results.timeline.length - 1 && (
                          <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                        )}
                        
                        <div className="flex items-start space-x-4">
                          {/* Timeline dot */}
                          <div className="flex items-center justify-center w-12 h-12 bg-white border-4 border-green-200 rounded-full flex-shrink-0">
                            {index === 0 && <Ship className="h-5 w-5 text-green-600" />}
                            {index === 1 && <Calendar className="h-5 w-5 text-blue-600" />}
                            {index === 2 && <Truck className="h-5 w-5 text-purple-600" />}
                            {index === 3 && <FileCheck className="h-5 w-5 text-orange-600" />}
                            {index === 4 && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                          </div>
                          
                          {/* Phase content */}
                          <div className="flex-1 min-w-0">
                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900">{phase.name}</h4>
                                <Badge className="bg-gray-100 text-gray-800">
                                  Week {phase.weekNumber}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{phase.description}</p>
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-4">
                                  <span className="text-gray-500">
                                    <strong>Start:</strong> {formatDate(phase.startDate)}
                                  </span>
                                  <span className="text-gray-500">
                                    <strong>End:</strong> {formatDate(phase.endDate)}
                                  </span>
                                </div>
                                <span className="font-medium text-gray-700">
                                  {phase.duration} days
                                </span>
                              </div>
                              
                              {/* Progress bar */}
                              <div className="mt-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{ width: "0%" }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Important Notes */}
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">Important Timeline Notes</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Timelines are estimates and may vary based on documentation completeness</li>
                      <li>• Seasonal delays account for increased shipping volume during peak periods</li>
                      <li>• Compliance time depends on vehicle type and modification requirements</li>
                      <li>• Port processing can extend during peak periods or customs inspections</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}