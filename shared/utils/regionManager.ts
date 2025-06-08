/**
 * Global region management utility
 * Handles region detection, configuration, and tool filtering
 */

// Region configurations embedded directly to avoid complex imports
const auRegionConfig = {
  currency: 'AUD',
  measurementUnit: 'metric',
  drivingSide: 'left',
  vinFormat: 'ADR',
  compliance: { minimumAge: 15, maximumAge: null, requiresCompliance: true }
};

const usRegionConfig = {
  currency: 'USD',
  measurementUnit: 'imperial',
  drivingSide: 'right',
  vinFormat: 'NHTSA',
  compliance: { minimumAge: 25, maximumAge: null, requiresCompliance: true }
};

const ukRegionConfig = {
  currency: 'GBP',
  measurementUnit: 'mixed',
  drivingSide: 'left',
  vinFormat: 'EU',
  compliance: { minimumAge: 0, maximumAge: null, requiresCompliance: true }
};

const caRegionConfig = {
  currency: 'CAD',
  measurementUnit: 'metric',
  drivingSide: 'right',
  vinFormat: 'Transport Canada',
  compliance: { minimumAge: 15, maximumAge: null, requiresCompliance: true }
};

// Simplified calculation functions
function calculateAuImportCosts(vehicleValue, state = 'NSW') {
  const duty = vehicleValue * 0.05;
  const gst = (vehicleValue + duty) * 0.10;
  return { duty, gst, total: duty + gst + 500 };
}

function calculateUsImportCosts(vehicleValue, state = 'CA') {
  const duty = vehicleValue * 0.025;
  return { duty, total: duty + 4000 };
}

function calculateUkImportCosts(vehicleValue, region = 'England') {
  const duty = vehicleValue * 0.10;
  const vat = (vehicleValue + duty) * 0.20;
  return { duty, vat, total: duty + vat + 1200 };
}

function calculateCaImportCosts(vehicleValue, province = 'ON') {
  const duty = vehicleValue * 0.061;
  const gst = (vehicleValue + duty) * 0.05;
  return { duty, gst, total: duty + gst + 1200 };
}

function validateAuCompliance(vehicle) {
  const age = new Date().getFullYear() - vehicle.year;
  return { eligible: age >= 15, estimatedComplianceCost: age >= 15 ? 3500 : null };
}

function validateUsCompliance(vehicle) {
  const age = new Date().getFullYear() - vehicle.year;
  return { eligible: age >= 25, estimatedComplianceCost: age >= 25 ? 1000 : 8000 };
}

function validateUkCompliance(vehicle) {
  return { eligible: true, estimatedComplianceCost: 2500 };
}

function validateCaCompliance(vehicle) {
  const age = new Date().getFullYear() - vehicle.year;
  return { eligible: age >= 15, estimatedComplianceCost: age >= 15 ? 1500 : 3500 };
}

export const SUPPORTED_REGIONS = {
  AU: {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    locale: 'en-AU',
    config: auRegionConfig,
    calculateCosts: calculateAuImportCosts,
    validateCompliance: validateAuCompliance,
    subdivisions: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    locale: 'en-US',
    config: usRegionConfig,
    calculateCosts: calculateUsImportCosts,
    validateCompliance: validateUsCompliance,
    subdivisions: ['CA', 'NY', 'TX', 'FL', 'WA', 'OR', 'MT', 'NH']
  },
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    flag: '🇬🇧',
    locale: 'en-GB',
    config: ukRegionConfig,
    calculateCosts: calculateUkImportCosts,
    validateCompliance: validateUkCompliance,
    subdivisions: ['England', 'Scotland', 'Wales', 'NorthernIreland']
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    locale: 'en-CA',
    config: caRegionConfig,
    calculateCosts: calculateCaImportCosts,
    validateCompliance: validateCaCompliance,
    subdivisions: ['ON', 'QC', 'BC', 'AB', 'SK', 'MB', 'NS', 'NB', 'PE', 'NL']
  }
};

export const TOOL_CATEGORIES = {
  LOOKUP: {
    id: 'lookup',
    name: 'Vehicle Lookup',
    description: 'Search, decode, and verify vehicle information',
    icon: 'Search',
    tools: [
      {
        id: 'vin-decoder',
        name: 'VIN Decoder',
        path: '/vehicle-lookup',
        description: 'Decode VIN and get vehicle specifications',
        regions: ['AU', 'US', 'UK', 'CA']
      },
      {
        id: 'auction-explorer',
        name: 'Auction Explorer',
        path: '/auction-sample-explorer',
        description: 'Browse current auction listings',
        regions: ['AU', 'US', 'UK', 'CA']
      },
      {
        id: 'market-scanner',
        name: 'Live Market Scanner',
        path: '/live-market-scanner',
        description: 'Real-time market data and pricing',
        regions: ['AU', 'US', 'UK', 'CA']
      },
      {
        id: 'vehicle-history',
        name: 'Vehicle History',
        path: '/japan-value',
        description: 'Japanese auction history and grades',
        regions: ['AU', 'US', 'UK', 'CA']
      }
    ]
  },
  ESTIMATE: {
    id: 'estimate',
    name: 'Cost Estimation',
    description: 'Calculate import costs, taxes, and compliance fees',
    icon: 'Calculator',
    tools: [
      {
        id: 'import-calculator',
        name: 'Import Calculator',
        path: '/import-calculator',
        description: 'Complete import cost breakdown',
        regions: ['AU', 'US', 'UK', 'CA']
      },
      {
        id: 'compliance-checker',
        name: 'Compliance Checker',
        path: '/compliance-checker',
        description: 'Check eligibility and requirements',
        regions: ['AU', 'US', 'UK', 'CA']
      },
      {
        id: 'shipping-calculator',
        name: 'Shipping Calculator',
        path: '/shipping-calculator',
        description: 'Calculate shipping costs by route',
        regions: ['AU', 'US', 'UK', 'CA']
      },
      {
        id: 'roi-calculator',
        name: 'ROI Calculator',
        path: '/roi-calculator',
        description: 'Investment return analysis',
        regions: ['AU', 'US', 'UK', 'CA']
      },
      {
        id: 'insurance-estimator',
        name: 'Insurance Estimator',
        path: '/insurance-estimator',
        description: 'Estimate insurance costs',
        regions: ['AU', 'US', 'UK', 'CA']
      }
    ]
  },
  MANAGE: {
    id: 'manage',
    name: 'Import Management',
    description: 'Track imports, documentation, and compliance progress',
    icon: 'Clipboard',
    tools: [
      {
        id: 'dashboard',
        name: 'Import Dashboard',
        path: '/enhanced-dashboard',
        description: 'Track your import progress',
        regions: ['AU', 'US', 'UK', 'CA']
      },
      {
        id: 'documentation',
        name: 'Documentation Assistant',
        path: '/documentation-assistant',
        description: 'Manage required paperwork',
        regions: ['AU', 'US', 'UK', 'CA']
      },
      {
        id: 'timeline',
        name: 'Import Timeline',
        path: '/import-timeline',
        description: 'Track milestones and deadlines',
        regions: ['AU', 'US', 'UK', 'CA']
      },
      {
        id: 'port-intelligence',
        name: 'Port Intelligence',
        path: '/port-intelligence',
        description: 'Port selection and logistics',
        regions: ['AU', 'US', 'UK', 'CA']
      }
    ]
  }
};

export class RegionManager {
  constructor() {
    this.currentRegion = this.detectUserRegion();
    this.userPreferences = this.loadUserPreferences();
  }

  detectUserRegion() {
    // Try to detect from various sources
    const stored = localStorage.getItem('importiq_region');
    if (stored && SUPPORTED_REGIONS[stored]) {
      return stored;
    }

    // Fallback to timezone detection
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes('Australia')) return 'AU';
    if (timezone.includes('America')) return 'US';
    if (timezone.includes('Europe/London')) return 'UK';
    if (timezone.includes('America') && timezone.includes('Toronto')) return 'CA';

    return 'AU'; // Default fallback
  }

  setRegion(regionCode) {
    if (!SUPPORTED_REGIONS[regionCode]) {
      throw new Error(`Unsupported region: ${regionCode}`);
    }
    
    this.currentRegion = regionCode;
    localStorage.setItem('importiq_region', regionCode);
    
    // Trigger region change event
    window.dispatchEvent(new CustomEvent('regionChanged', { 
      detail: { region: regionCode } 
    }));
  }

  getCurrentRegion() {
    return SUPPORTED_REGIONS[this.currentRegion];
  }

  getAvailableTools() {
    const region = this.getCurrentRegion();
    const availableTools = {};

    Object.entries(TOOL_CATEGORIES).forEach(([categoryKey, category]) => {
      availableTools[categoryKey] = {
        ...category,
        tools: category.tools.filter(tool => tool.regions.includes(region.code))
      };
    });

    return availableTools;
  }

  calculateImportCosts(vehicleValue, subdivision) {
    const region = this.getCurrentRegion();
    return region.calculateCosts(vehicleValue, subdivision);
  }

  validateCompliance(vehicle) {
    const region = this.getCurrentRegion();
    return region.validateCompliance(vehicle);
  }

  formatCurrency(amount) {
    const region = this.getCurrentRegion();
    return new Intl.NumberFormat(region.locale, {
      style: 'currency',
      currency: region.config.currency
    }).format(amount);
  }

  loadUserPreferences() {
    const stored = localStorage.getItem('importiq_preferences');
    return stored ? JSON.parse(stored) : {};
  }

  saveUserPreferences(preferences) {
    this.userPreferences = { ...this.userPreferences, ...preferences };
    localStorage.setItem('importiq_preferences', JSON.stringify(this.userPreferences));
  }
}

export const regionManager = new RegionManager();