export interface RegionConfig {
  currency: string;
  measurementUnit: 'metric' | 'imperial' | 'mixed';
  drivingSide: 'left' | 'right';
  vinFormat: string;
  compliance: {
    minimumAge: number;
    maximumAge: number | null;
    requiresCompliance: boolean;
    [key: string]: any;
  };
}

export interface SupportedRegion {
  code: string;
  name: string;
  flag: string;
  locale: string;
  config: RegionConfig;
  calculateCosts: (vehicleValue: number, subdivision?: string) => any;
  validateCompliance: (vehicle: any) => any;
  subdivisions: string[];
}

export interface Tool {
  id: string;
  name: string;
  path: string;
  description: string;
  regions: string[];
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  tools: Tool[];
}

export interface VINDecodeResult {
  valid: boolean;
  vin?: string;
  error?: string;
  wmi?: any;
  vds?: any;
  vis?: any;
  year?: number;
  plant?: string;
  sequential?: string;
  compliance?: any;
}

export interface ImportCostCalculation {
  duty: number;
  total: number;
  [key: string]: number | any;
}

export interface ComplianceResult {
  eligible: boolean;
  estimatedComplianceCost: number | null;
  [key: string]: any;
}