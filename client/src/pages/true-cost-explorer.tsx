import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calculator, DollarSign, TrendingDown, Car, Fuel, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const trueCostSchema = z.object({
  vehiclePrice: z.number().min(1000),
  importCosts: z.number().min(500),
  state: z.string(),
  insuranceTier: z.string(),
  fuelType: z.string(),
  yearlyDriving: z.number().min(5000).max(50000),
  ownershipYears: z.number().min(1).max(10),
});

type FormData = z.infer<typeof trueCostSchema>;

const stateData = {
  NSW: { rego: 395, ctp: 550 },
  VIC: { rego: 372, ctp: 580 },
  QLD: { rego: 297, ctp: 350 },
  SA: { rego: 494, ctp: 480 },
  WA: { rego: 318, ctp: 400 },
  TAS: { rego: 445, ctp: 380 },
  NT: { rego: 590, ctp: 420 },
  ACT: { rego: 478, ctp: 465 }
};

const insuranceTiers = {
  basic: { multiplier: 0.015, name: "Basic Coverage" },
  standard: { multiplier: 0.025, name: "Standard Coverage" },
  premium: { multiplier: 0.04, name: "Premium Coverage" }
};

const fuelCosts = {
  petrol: { costPerKm: 0.12, name: "Petrol" },
  diesel: { costPerKm: 0.10, name: "Diesel" },
  premium: { costPerKm: 0.15, name: "Premium Unleaded" },
  e85: { costPerKm: 0.18, name: "E85 Ethanol" }
};

export default function TrueCostExplorer() {
  const [results, setResults] = useState<any>(null);
  const [ownershipYears, setOwnershipYears] = useState([3]);

  const form = useForm<FormData>({
    resolver: zodResolver(trueCostSchema),
    defaultValues: {
      vehiclePrice: 35000,
      importCosts: 8000,
      state: "NSW",
      insuranceTier: "standard",
      fuelType: "petrol",
      yearlyDriving: 15000,
      ownershipYears: 3,
    },
  });

  const onSubmit = (data: FormData) => {
    const state = stateData[data.state as keyof typeof stateData];
    const insurance = insuranceTiers[data.insuranceTier as keyof typeof insuranceTiers];
    const fuel = fuelCosts[data.fuelType as keyof typeof fuelCosts];

    // Calculate yearly costs
    const yearlyRego = state.rego;
    const yearlyCTP = state.ctp;
    const yearlyInsurance = data.vehiclePrice * insurance.multiplier;
    const yearlyFuel = data.yearlyDriving * fuel.costPerKm;
    const yearlyMaintenance = data.vehiclePrice * 0.02; // 2% of vehicle value

    // Calculate depreciation
    const depreciationRate = 0.15; // 15% per year average
    const finalValue = data.vehiclePrice * Math.pow(1 - depreciationRate, data.ownershipYears);
    const totalDepreciation = data.vehiclePrice - finalValue;

    // Total costs
    const totalYearlyCosts = yearlyRego + yearlyCTP + yearlyInsurance + yearlyFuel + yearlyMaintenance;
    const totalOwnershipCosts = data.importCosts + (totalYearlyCosts * data.ownershipYears) + totalDepreciation;

    const breakdown = {
      acquisition: data.vehiclePrice + data.importCosts,
      yearly: {
        rego: yearlyRego,
        ctp: yearlyCTP,
        insurance: yearlyInsurance,
        fuel: yearlyFuel,
        maintenance: yearlyMaintenance,
        total: totalYearlyCosts
      },
      depreciation: totalDepreciation,
      finalValue,
      totalCost: totalOwnershipCosts,
      costPerYear: totalOwnershipCosts / data.ownershipYears,
      costPerKm: totalOwnershipCosts / (data.yearlyDriving * data.ownershipYears)
    };

    setResults(breakdown);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <Calculator className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">True Cost Explorer</h1>
              <p className="text-gray-600">Calculate real ownership costs beyond the purchase price</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Ownership Cost Calculator</CardTitle>
              <CardDescription>
                Enter your vehicle details to see the complete picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vehiclePrice">Vehicle Price</Label>
                    <Input
                      id="vehiclePrice"
                      type="number"
                      {...form.register("vehiclePrice", { valueAsNumber: true })}
                      placeholder="35000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="importCosts">Import Costs</Label>
                    <Input
                      id="importCosts"
                      type="number"
                      {...form.register("importCosts", { valueAsNumber: true })}
                      placeholder="8000"
                    />
                  </div>
                </div>

                <div>
                  <Label>State/Territory</Label>
                  <Select onValueChange={(value) => form.setValue("state", value)} defaultValue="NSW">
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(stateData).map(([state, data]) => (
                        <SelectItem key={state} value={state}>
                          {state} - Rego: ${data.rego}/year
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Insurance Coverage</Label>
                  <Select onValueChange={(value) => form.setValue("insuranceTier", value)} defaultValue="standard">
                    <SelectTrigger>
                      <SelectValue placeholder="Select coverage" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(insuranceTiers).map(([key, tier]) => (
                        <SelectItem key={key} value={key}>
                          {tier.name} - {(tier.multiplier * 100).toFixed(1)}% of vehicle value
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Fuel Type</Label>
                  <Select onValueChange={(value) => form.setValue("fuelType", value)} defaultValue="petrol">
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(fuelCosts).map(([key, fuel]) => (
                        <SelectItem key={key} value={key}>
                          {fuel.name} - ${fuel.costPerKm.toFixed(2)}/km
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="yearlyDriving">Yearly Driving (km)</Label>
                  <Input
                    id="yearlyDriving"
                    type="number"
                    {...form.register("yearlyDriving", { valueAsNumber: true })}
                    placeholder="15000"
                  />
                </div>

                <div>
                  <Label>Ownership Period: {ownershipYears[0]} years</Label>
                  <div className="mt-2">
                    <Slider
                      value={ownershipYears}
                      onValueChange={(value) => {
                        setOwnershipYears(value);
                        form.setValue("ownershipYears", value[0]);
                      }}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 year</span>
                    <span>10 years</span>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Calculate True Cost
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Ownership Cost Breakdown</span>
                </CardTitle>
                <CardDescription>
                  Complete cost analysis for {form.getValues("ownershipYears")} years
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      ${results.totalCost.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-700">Total Cost</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${results.costPerYear.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-700">Per Year</div>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Car className="h-4 w-4 text-gray-500" />
                      <span>Acquisition Cost</span>
                    </div>
                    <span className="font-medium">${results.acquisition.toLocaleString()}</span>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Annual Running Costs</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Registration</span>
                        <span>${results.yearly.rego}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CTP Insurance</span>
                        <span>${results.yearly.ctp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vehicle Insurance</span>
                        <span>${Math.round(results.yearly.insurance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fuel Costs</span>
                        <span>${Math.round(results.yearly.fuel)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maintenance</span>
                        <span>${Math.round(results.yearly.maintenance)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-2">
                        <span>Total per Year</span>
                        <span>${Math.round(results.yearly.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span>Depreciation Loss</span>
                      </div>
                      <span className="font-medium text-red-600">
                        ${results.depreciation.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Estimated value: ${results.finalValue.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        ${results.costPerKm.toFixed(2)} per km
                      </div>
                      <div className="text-sm text-gray-600">
                        Based on {form.getValues("yearlyDriving").toLocaleString()} km/year
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}