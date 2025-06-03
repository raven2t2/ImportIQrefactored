import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Info,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

interface CostBreakdown {
  vehiclePrice: number;
  shipping: number;
  insurance: number;
  customs: number;
  gst: number;
  quarantine: number;
  compliance: number;
  registration: number;
  modifications: number;
  unexpected: number;
  total: number;
}

export default function TrueCostExplorer() {
  const [vehiclePrice, setVehiclePrice] = useState<string>("");
  const [vehicleType, setVehicleType] = useState<string>("");
  const [modifications, setModifications] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [breakdown, setBreakdown] = useState<CostBreakdown | null>(null);

  const calculateTrueCost = () => {
    const price = parseFloat(vehiclePrice) || 0;
    const modCost = parseFloat(modifications) || 0;
    
    // Comprehensive cost calculation
    const shipping = price * 0.08; // 8% of vehicle price
    const insurance = price * 0.015; // 1.5% for transit insurance
    const customs = price * 0.05; // 5% import duty
    const gst = (price + shipping + customs) * 0.1; // 10% GST
    const quarantine = 450; // Fixed quarantine fee
    const compliance = vehicleType === "sports" ? 3500 : vehicleType === "luxury" ? 4200 : 2800;
    const registration = state === "NSW" ? 850 : state === "VIC" ? 780 : 820;
    const unexpected = (price + shipping + compliance) * 0.05; // 5% buffer
    
    const total = price + shipping + insurance + customs + gst + quarantine + compliance + registration + modCost + unexpected;

    setBreakdown({
      vehiclePrice: price,
      shipping,
      insurance,
      customs,
      gst,
      quarantine,
      compliance,
      registration,
      modifications: modCost,
      unexpected,
      total
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const getPercentage = (amount: number, total: number) => {
    return ((amount / total) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-amber-400" />
                True Cost Explorer
              </h1>
              <p className="text-gray-300 mt-2">Complete financial breakdown with no hidden surprises</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-amber-400/20 text-amber-400 border-amber-400/30">
            Financial Planning
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="bg-black/40 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Vehicle Details
              </CardTitle>
              <CardDescription className="text-gray-400">
                Enter your vehicle information for a complete cost analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-white">Vehicle Price (AUD)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g., 45000"
                  value={vehiclePrice}
                  onChange={(e) => setVehiclePrice(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-white">Vehicle Type</Label>
                <Select value={vehicleType} onValueChange={setVehicleType}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="sports">Sports Car</SelectItem>
                    <SelectItem value="luxury">Luxury Vehicle</SelectItem>
                    <SelectItem value="classic">Classic/Vintage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-white">Registration State</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="NSW">NSW</SelectItem>
                    <SelectItem value="VIC">VIC</SelectItem>
                    <SelectItem value="QLD">QLD</SelectItem>
                    <SelectItem value="WA">WA</SelectItem>
                    <SelectItem value="SA">SA</SelectItem>
                    <SelectItem value="TAS">TAS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mods" className="text-white">Planned Modifications (AUD)</Label>
                <Input
                  id="mods"
                  type="number"
                  placeholder="e.g., 8000"
                  value={modifications}
                  onChange={(e) => setModifications(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <Button 
                onClick={calculateTrueCost}
                disabled={!vehiclePrice || !vehicleType || !state}
                className="w-full bg-amber-400 hover:bg-amber-500 text-black font-semibold"
              >
                Calculate True Cost
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {breakdown && (
            <Card className="bg-black/40 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Complete Cost Breakdown
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Total: {formatCurrency(breakdown.total)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cost Items */}
                <div className="space-y-3">
                  {[
                    { label: "Vehicle Price", amount: breakdown.vehiclePrice, color: "bg-blue-500" },
                    { label: "Shipping", amount: breakdown.shipping, color: "bg-green-500" },
                    { label: "Insurance", amount: breakdown.insurance, color: "bg-yellow-500" },
                    { label: "Customs Duty", amount: breakdown.customs, color: "bg-red-500" },
                    { label: "GST", amount: breakdown.gst, color: "bg-purple-500" },
                    { label: "Quarantine", amount: breakdown.quarantine, color: "bg-orange-500" },
                    { label: "Compliance", amount: breakdown.compliance, color: "bg-pink-500" },
                    { label: "Registration", amount: breakdown.registration, color: "bg-indigo-500" },
                    { label: "Modifications", amount: breakdown.modifications, color: "bg-cyan-500" },
                    { label: "Unexpected (5%)", amount: breakdown.unexpected, color: "bg-gray-500" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-gray-300">{item.label}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">{formatCurrency(item.amount)}</div>
                        <div className="text-xs text-gray-500">{getPercentage(item.amount, breakdown.total)}%</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm">Government Fees</div>
                    <div className="text-white font-bold text-lg">
                      {formatCurrency(breakdown.customs + breakdown.gst + breakdown.quarantine)}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm">Transport & Setup</div>
                    <div className="text-white font-bold text-lg">
                      {formatCurrency(breakdown.shipping + breakdown.insurance + breakdown.compliance + breakdown.registration)}
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-amber-400/10 border border-amber-400/30 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-400 mt-0.5" />
                    <div>
                      <div className="text-amber-400 font-medium">Pro Tips</div>
                      <div className="text-gray-300 text-sm mt-1">
                        • Budget 5-10% extra for unexpected costs
                        <br />
                        • Compliance costs vary by vehicle complexity
                        <br />
                        • Consider currency fluctuations when purchasing
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