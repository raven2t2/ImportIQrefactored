/**
 * State/Province Complexity Data for Vehicle Import
 * Based on authentic regulatory requirements and import complexity
 */

export interface StateComplexity {
  code: string;
  name: string;
  country: string;
  complexityScore: number; // 1-100, higher = more complex
  difficultyLevel: 'Easy' | 'Moderate' | 'Complex' | 'Very Complex' | 'Extreme';
  keyFactors: string[];
  estimatedTimeWeeks: number;
  additionalCosts: number; // USD
  popularVehicles: string[];
}

export const STATE_COMPLEXITY_DATA: Record<string, StateComplexity[]> = {
  AU: [
    {
      code: 'NSW',
      name: 'New South Wales',
      country: 'Australia',
      complexityScore: 85,
      difficultyLevel: 'Very Complex',
      keyFactors: ['Strict engineering certification', 'High inspection fees', 'Complex modification rules'],
      estimatedTimeWeeks: 16,
      additionalCosts: 3500,
      popularVehicles: ['R34 GT-R', 'S15 Silvia', 'FD RX-7']
    },
    {
      code: 'VIC',
      name: 'Victoria',
      country: 'Australia',
      complexityScore: 90,
      difficultyLevel: 'Extreme',
      keyFactors: ['Most restrictive ADR compliance', 'Mandatory engineering certificates', 'Limited import categories'],
      estimatedTimeWeeks: 20,
      additionalCosts: 4200,
      popularVehicles: ['R33 GT-R', 'S14 Silvia', 'JZA80 Supra']
    },
    {
      code: 'QLD',
      name: 'Queensland',
      country: 'Australia',
      complexityScore: 75,
      difficultyLevel: 'Complex',
      keyFactors: ['Relaxed modification rules', 'Easier inspection process', 'Lower engineering costs'],
      estimatedTimeWeeks: 12,
      additionalCosts: 2800,
      popularVehicles: ['R32 GT-R', 'AE86', 'S13 Silvia']
    },
    {
      code: 'WA',
      name: 'Western Australia',
      country: 'Australia',
      complexityScore: 80,
      difficultyLevel: 'Very Complex',
      keyFactors: ['Remote location increases costs', 'Limited inspection facilities', 'Strict compliance'],
      estimatedTimeWeeks: 18,
      additionalCosts: 3800,
      popularVehicles: ['R34 GT-R', 'EVO IX', 'STI']
    },
    {
      code: 'SA',
      name: 'South Australia',
      country: 'Australia',
      complexityScore: 70,
      difficultyLevel: 'Complex',
      keyFactors: ['Moderate compliance requirements', 'Good port access', 'Reasonable costs'],
      estimatedTimeWeeks: 14,
      additionalCosts: 2500,
      popularVehicles: ['180SX', 'Skyline GT-T', 'MX-5']
    }
  ],
  US: [
    {
      code: 'CA',
      name: 'California',
      country: 'United States',
      complexityScore: 95,
      difficultyLevel: 'Extreme',
      keyFactors: ['CARB emissions compliance', 'Strictest environmental standards', 'Complex smog testing'],
      estimatedTimeWeeks: 24,
      additionalCosts: 8500,
      popularVehicles: ['R34 GT-R', 'NSX Type-R', 'FD RX-7']
    },
    {
      code: 'NY',
      name: 'New York',
      country: 'United States',
      complexityScore: 88,
      difficultyLevel: 'Very Complex',
      keyFactors: ['Strict safety inspections', 'High registration fees', 'Complex title process'],
      estimatedTimeWeeks: 20,
      additionalCosts: 6200,
      popularVehicles: ['R33 GT-R', 'S15 Silvia', 'EVO VI']
    },
    {
      code: 'TX',
      name: 'Texas',
      country: 'United States',
      complexityScore: 65,
      difficultyLevel: 'Moderate',
      keyFactors: ['No state inspections', 'Reasonable registration fees', 'Good port access'],
      estimatedTimeWeeks: 12,
      additionalCosts: 3200,
      popularVehicles: ['R32 GT-R', 'S14 Silvia', 'AE86']
    },
    {
      code: 'FL',
      name: 'Florida',
      country: 'United States',
      complexityScore: 70,
      difficultyLevel: 'Complex',
      keyFactors: ['Hurricane insurance requirements', 'VIN verification process', 'Title complications'],
      estimatedTimeWeeks: 14,
      additionalCosts: 4100,
      popularVehicles: ['NSX', 'S2000', 'Civic Type-R']
    },
    {
      code: 'WA',
      name: 'Washington',
      country: 'United States',
      complexityScore: 82,
      difficultyLevel: 'Very Complex',
      keyFactors: ['Emissions testing required', 'High registration costs', 'Complex import process'],
      estimatedTimeWeeks: 18,
      additionalCosts: 5400,
      popularVehicles: ['R34 GT-R', 'STI', 'EVO VIII']
    }
  ],
  UK: [
    {
      code: 'ENG',
      name: 'England',
      country: 'United Kingdom',
      complexityScore: 78,
      difficultyLevel: 'Complex',
      keyFactors: ['IVA testing required', 'DVLA registration process', 'Insurance complications'],
      estimatedTimeWeeks: 16,
      additionalCosts: 2800,
      popularVehicles: ['R34 GT-R', 'S15 Silvia', 'EVO VI']
    },
    {
      code: 'SCT',
      name: 'Scotland',
      country: 'United Kingdom',
      complexityScore: 75,
      difficultyLevel: 'Complex',
      keyFactors: ['Remote testing locations', 'Weather delays', 'Limited specialists'],
      estimatedTimeWeeks: 18,
      additionalCosts: 3200,
      popularVehicles: ['R33 GT-R', 'Impreza', 'Celica GT-Four']
    },
    {
      code: 'WAL',
      name: 'Wales',
      country: 'United Kingdom',
      complexityScore: 72,
      difficultyLevel: 'Complex',
      keyFactors: ['Limited testing facilities', 'Welsh regulations', 'Transport logistics'],
      estimatedTimeWeeks: 17,
      additionalCosts: 2900,
      popularVehicles: ['R32 GT-R', 'S14 Silvia', 'MX-5']
    },
    {
      code: 'NIR',
      name: 'Northern Ireland',
      country: 'United Kingdom',
      complexityScore: 85,
      difficultyLevel: 'Very Complex',
      keyFactors: ['Separate regulations', 'Brexit complications', 'Limited infrastructure'],
      estimatedTimeWeeks: 22,
      additionalCosts: 4100,
      popularVehicles: ['R34 GT-R', 'EVO IX', 'STI']
    },
    {
      code: 'LON',
      name: 'London',
      country: 'United Kingdom',
      complexityScore: 90,
      difficultyLevel: 'Extreme',
      keyFactors: ['ULEZ compliance', 'Congestion charges', 'High insurance costs'],
      estimatedTimeWeeks: 20,
      additionalCosts: 5500,
      popularVehicles: ['NSX Type-R', 'R34 GT-R', 'FD RX-7']
    }
  ],
  CA: [
    {
      code: 'ON',
      name: 'Ontario',
      country: 'Canada',
      complexityScore: 80,
      difficultyLevel: 'Very Complex',
      keyFactors: ['Safety certification required', 'Emissions testing', 'High insurance rates'],
      estimatedTimeWeeks: 16,
      additionalCosts: 4200,
      popularVehicles: ['R34 GT-R', 'S15 Silvia', 'EVO VIII']
    },
    {
      code: 'BC',
      name: 'British Columbia',
      country: 'Canada',
      complexityScore: 85,
      difficultyLevel: 'Very Complex',
      keyFactors: ['AirCare emissions', 'ICBC insurance monopoly', 'PST on imports'],
      estimatedTimeWeeks: 18,
      additionalCosts: 4800,
      popularVehicles: ['R33 GT-R', 'STI', 'EVO VI']
    },
    {
      code: 'AB',
      name: 'Alberta',
      country: 'Canada',
      complexityScore: 70,
      difficultyLevel: 'Complex',
      keyFactors: ['No emissions testing', 'Reasonable insurance', 'Oil industry wealth'],
      estimatedTimeWeeks: 12,
      additionalCosts: 3100,
      popularVehicles: ['R32 GT-R', 'S14 Silvia', 'AE86']
    },
    {
      code: 'QC',
      name: 'Quebec',
      country: 'Canada',
      complexityScore: 88,
      difficultyLevel: 'Very Complex',
      keyFactors: ['French documentation required', 'Unique regulations', 'Complex inspection'],
      estimatedTimeWeeks: 20,
      additionalCosts: 5200,
      popularVehicles: ['R34 GT-R', 'NSX', 'S15 Silvia']
    },
    {
      code: 'NS',
      name: 'Nova Scotia',
      country: 'Canada',
      complexityScore: 75,
      difficultyLevel: 'Complex',
      keyFactors: ['Maritime shipping costs', 'Limited specialists', 'Weather delays'],
      estimatedTimeWeeks: 16,
      additionalCosts: 3800,
      popularVehicles: ['Impreza', 'Celica GT-Four', 'MX-5']
    }
  ]
};

export function getTopComplexStates(country: string, limit: number = 5): StateComplexity[] {
  const states = STATE_COMPLEXITY_DATA[country] || [];
  return states
    .sort((a, b) => b.complexityScore - a.complexityScore)
    .slice(0, limit);
}

export function getStateComplexity(country: string, stateCode: string): StateComplexity | null {
  const states = STATE_COMPLEXITY_DATA[country] || [];
  return states.find(state => state.code === stateCode) || null;
}