import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calculator, 
  Wrench, 
  DollarSign,
  ArrowLeft,
  Info,
  Plus,
  Minus,
  AlertTriangle
} from "lucide-react";
import { Link } from "wouter";

interface ModificationItem {
  id: string;
  category: string;
  name: string;
  partsCost: number;
  laborHours: number;
  laborRate: number;
  complexity: "Basic" | "Intermediate" | "Advanced" | "Expert";
  complianceRequired: boolean;
  description: string;
}

interface SelectedMod extends ModificationItem {
  quantity: number;
}

const modificationCatalog: ModificationItem[] = [
  // Engine Modifications
  {
    id: "turbo-upgrade",
    category: "Engine",
    name: "Turbo Upgrade Kit",
    partsCost: 4500,
    laborHours: 12,
    laborRate: 120,
    complexity: "Advanced",
    complianceRequired: true,
    description: "High-performance turbo kit with supporting modifications"
  },
  {
    id: "cold-air-intake",
    category: "Engine",
    name: "Cold Air Intake System",
    partsCost: 650,
    laborHours: 2,
    laborRate: 120,
    complexity: "Basic",
    complianceRequired: false,
    description: "Performance air intake system for improved airflow"
  },
  {
    id: "exhaust-system",
    category: "Engine",
    name: "Full Exhaust System",
    partsCost: 2200,
    laborHours: 6,
    laborRate: 120,
    complexity: "Intermediate",
    complianceRequired: true,
    description: "Cat-back exhaust system with high-flow catalytic converter"
  },
  {
    id: "ecu-tune",
    category: "Engine",
    name: "ECU Tune & Remap",
    partsCost: 800,
    laborHours: 4,
    laborRate: 150,
    complexity: "Advanced",
    complianceRequired: false,
    description: "Professional engine tune for optimized performance"
  },
  
  // Suspension
  {
    id: "coilovers",
    category: "Suspension",
    name: "Adjustable Coilovers",
    partsCost: 2800,
    laborHours: 8,
    laborRate: 120,
    complexity: "Intermediate",
    complianceRequired: false,
    description: "Height and damping adjustable coilover suspension"
  },
  {
    id: "sway-bars",
    category: "Suspension",
    name: "Performance Sway Bars",
    partsCost: 450,
    laborHours: 3,
    laborRate: 120,
    complexity: "Intermediate",
    complianceRequired: false,
    description: "Front and rear adjustable sway bars"
  },
  
  // Wheels & Tires
  {
    id: "wheels-tires",
    category: "Wheels",
    name: "Performance Wheel Set",
    partsCost: 3200,
    laborHours: 2,
    laborRate: 80,
    complexity: "Basic",
    complianceRequired: false,
    description: "18\" forged wheels with performance tires"
  },
  {
    id: "big-brake-kit",
    category: "Brakes",
    name: "Big Brake Kit",
    partsCost: 3800,
    laborHours: 10,
    laborRate: 120,
    complexity: "Advanced",
    complianceRequired: false,
    description: "6-piston front brake kit with larger rotors"
  },
  
  // Exterior
  {
    id: "body-kit",
    category: "Exterior",
    name: "Aero Body Kit",
    partsCost: 2500,
    laborHours: 16,
    laborRate: 100,
    complexity: "Intermediate",
    complianceRequired: false,
    description: "Front lip, side skirts, and rear diffuser"
  },
  {
    id: "wing-spoiler",
    category: "Exterior",
    name: "Racing Wing",
    partsCost: 800,
    laborHours: 4,
    laborRate: 100,
    complexity: "Basic",
    complianceRequired: false,
    description: "Adjustable carbon fiber rear wing"
  },
  
  // Interior
  {
    id: "racing-seats",
    category: "Interior",
    name: "Racing Seats (Pair)",
    partsCost: 2400,
    laborHours: 6,
    laborRate: 100,
    complexity: "Intermediate",
    complianceRequired: false,
    description: "FIA-approved bucket racing seats with harnesses"
  },
  {
    id: "roll-cage",
    category: "Safety",
    name: "Roll Cage",
    partsCost: 1800,
    laborHours: 20,
    laborRate: 120,
    complexity: "Expert",
    complianceRequired: true,
    description: "CAMS-approved 6-point roll cage"
  }
];

const categories = ["All", "Engine", "Suspension", "Wheels", "Brakes", "Exterior", "Interior", "Safety"];

export default function ModCostEstimator() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMods, setSelectedMods] = useState<SelectedMod[]>([]);
  const [laborRate, setLaborRate] = useState("120");

  const filteredMods = modificationCatalog.filter(mod => 
    selectedCategory === "All" || mod.category === selectedCategory
  );

  const addModification = (mod: ModificationItem) => {
    const existing = selectedMods.find(m => m.id === mod.id);
    if (existing) {
      setSelectedMods(selectedMods.map(m => 
        m.id === mod.id ? { ...m, quantity: m.quantity + 1 } : m
      ));
    } else {
      setSelectedMods([...selectedMods, { ...mod, quantity: 1 }]);
    }
  };

  const removeModification = (modId: string) => {
    setSelectedMods(selectedMods.filter(m => m.id !== modId));
  };

  const updateQuantity = (modId: string, quantity: number) => {
    if (quantity <= 0) {
      removeModification(modId);
    } else {
      setSelectedMods(selectedMods.map(m => 
        m.id === modId ? { ...m, quantity } : m
      ));
    }
  };

  const calculateTotals = () => {
    const customLaborRate = parseFloat(laborRate) || 120;
    
    let totalParts = 0;
    let totalLabor = 0;
    let totalHours = 0;
    let complianceMods = 0;

    selectedMods.forEach(mod => {
      const partsCost = mod.partsCost * mod.quantity;
      const laborCost = (mod.laborHours * customLaborRate) * mod.quantity;
      
      totalParts += partsCost;
      totalLabor += laborCost;
      totalHours += mod.laborHours * mod.quantity;
      
      if (mod.complianceRequired) {
        complianceMods += mod.quantity;
      }
    });

    const complianceCost = complianceMods > 0 ? 1500 : 0; // Base compliance cost
    const contingency = (totalParts + totalLabor) * 0.15; // 15% contingency
    const total = totalParts + totalLabor + complianceCost + contingency;

    return {
      totalParts,
      totalLabor,
      totalHours,
      complianceCost,
      contingency,
      total,
      complianceMods
    };
  };

  const totals = calculateTotals();

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Basic": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Intermediate": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Advanced": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "Expert": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Wrench className="h-8 w-8 text-amber-400" />
                Mod Cost Estimator
              </h1>
              <p className="text-gray-300 mt-2">Complete modification cost calculator with real pricing data</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-amber-400/20 text-amber-400 border-amber-400/30">
            Modification Planning
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Modification Catalog */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Modification Catalog
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Select modifications to build your cost estimate
                </CardDescription>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-full ${
                        selectedCategory === category 
                          ? "bg-amber-400 text-black hover:bg-amber-500" 
                          : "border-gray-600 text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredMods.map((mod) => (
                  <div key={mod.id} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-white font-medium">{mod.name}</div>
                        <div className="text-gray-400 text-sm">{mod.description}</div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addModification(mod)}
                        className="bg-amber-400 hover:bg-amber-500 text-black"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-gray-400">Parts Cost</div>
                        <div className="text-white font-medium">{formatCurrency(mod.partsCost)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Labor</div>
                        <div className="text-white font-medium">{mod.laborHours}h @ ${mod.laborRate}/h</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Complexity</div>
                        <Badge variant="outline" className={getComplexityColor(mod.complexity)}>
                          {mod.complexity}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-gray-400">Compliance</div>
                        <div className={`font-medium ${mod.complianceRequired ? 'text-yellow-400' : 'text-green-400'}`}>
                          {mod.complianceRequired ? 'Required' : 'Not Required'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Cost Summary */}
          <div className="space-y-6">
            {/* Labor Rate Setting */}
            <Card className="bg-black/40 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Labor Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="labor-rate" className="text-white">Hourly Rate (AUD)</Label>
                  <Input
                    id="labor-rate"
                    type="number"
                    value={laborRate}
                    onChange={(e) => setLaborRate(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                  <div className="text-gray-400 text-xs">
                    Typical range: $80-150/hour depending on workshop
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Modifications */}
            <Card className="bg-black/40 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Selected Modifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedMods.length === 0 ? (
                  <div className="text-gray-400 text-center py-4">
                    No modifications selected yet
                  </div>
                ) : (
                  <>
                    {selectedMods.map((mod) => (
                      <div key={mod.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">{mod.name}</div>
                          <div className="text-gray-400 text-xs">
                            {formatCurrency(mod.partsCost)} + {mod.laborHours}h labor
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(mod.id, mod.quantity - 1)}
                            className="h-8 w-8 p-0 border-gray-600"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-white w-6 text-center">{mod.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(mod.id, mod.quantity + 1)}
                            className="h-8 w-8 p-0 border-gray-600"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeModification(mod.id)}
                            className="h-8 w-8 p-0 border-red-600 text-red-400"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            {selectedMods.length > 0 && (
              <Card className="bg-black/40 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Parts Total</span>
                    <span className="text-white font-medium">{formatCurrency(totals.totalParts)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Labor Total ({totals.totalHours}h)</span>
                    <span className="text-white font-medium">{formatCurrency(totals.totalLabor)}</span>
                  </div>
                  {totals.complianceCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Compliance Engineering</span>
                      <span className="text-white font-medium">{formatCurrency(totals.complianceCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-300">Contingency (15%)</span>
                    <span className="text-white font-medium">{formatCurrency(totals.contingency)}</span>
                  </div>
                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between">
                      <span className="text-white font-bold text-lg">Total Estimate</span>
                      <span className="text-amber-400 font-bold text-lg">{formatCurrency(totals.total)}</span>
                    </div>
                  </div>

                  {/* Warning if compliance required */}
                  {totals.complianceMods > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                        <div className="text-yellow-400 text-sm">
                          <div className="font-medium">Compliance Required</div>
                          <div className="text-xs mt-1">
                            {totals.complianceMods} modification{totals.complianceMods > 1 ? 's' : ''} require engineering certification
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-4">
                    <Link to="/buildready" className="block">
                      <Button className="w-full bg-amber-400 hover:bg-amber-500 text-black">
                        Check Compliance Requirements
                      </Button>
                    </Link>
                    <Link to="/calculator" className="block">
                      <Button variant="outline" className="w-full border-gray-600 text-gray-300">
                        Add to Import Calculator
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-12 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Info className="h-6 w-6 text-amber-400 mt-1" />
            <div>
              <h3 className="text-white font-bold text-lg mb-2">Important Notes</h3>
              <div className="grid md:grid-cols-2 gap-4 text-gray-300 text-sm">
                <div>
                  <div className="font-medium text-amber-400 mb-1">Pricing Accuracy</div>
                  <p>Prices are based on quality aftermarket parts and professional installation. Actual costs may vary based on brand selection and workshop rates.</p>
                </div>
                <div>
                  <div className="font-medium text-amber-400 mb-1">Compliance</div>
                  <p>Modifications marked as requiring compliance need engineering certification. Budget additional time and cost for ADR compliance.</p>
                </div>
                <div>
                  <div className="font-medium text-amber-400 mb-1">Labor Rates</div>
                  <p>Workshop rates vary significantly. Performance specialists typically charge $120-150/hour, general mechanics $80-120/hour.</p>
                </div>
                <div>
                  <div className="font-medium text-amber-400 mb-1">Contingency</div>
                  <p>15% contingency is recommended for unexpected issues, additional parts, or extended labor during installation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}