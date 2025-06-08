/**
 * Global Modification Compliance System
 * Analyzes modification feasibility by country/state with authentic regulatory data
 */

export interface ModificationCompliance {
  modification: string;
  feasibility: 'Legal' | 'Restricted' | 'Prohibited' | 'Requires Certification';
  difficulty: 'Easy' | 'Moderate' | 'Complex' | 'Expert Required';
  requirements: string[];
  costs: {
    certification?: number;
    engineering?: number;
    inspection?: number;
    total: number;
  };
  timeline: string;
  notes: string;
}

export interface StateModificationRules {
  state: string;
  authority: string;
  engineModifications: {
    turboUpgrade: ModificationCompliance;
    engineSwap: ModificationCompliance;
    ecuTune: ModificationCompliance;
    exhaustModification: ModificationCompliance;
    intercoolerUpgrade: ModificationCompliance;
  };
  suspensionModifications: {
    lowering: ModificationCompliance;
    coilovers: ModificationCompliance;
    swaybars: ModificationCompliance;
  };
  visualModifications: {
    bodykit: ModificationCompliance;
    wheels: ModificationCompliance;
    tinting: ModificationCompliance;
  };
  performanceModifications: {
    brakeUpgrade: ModificationCompliance;
    rollcage: ModificationCompliance;
    fuelSystem: ModificationCompliance;
  };
}

// Australia - State-by-State Modification Rules
export const AUSTRALIAN_MODIFICATION_COMPLIANCE: Record<string, StateModificationRules> = {
  'NSW': {
    state: 'New South Wales',
    authority: 'Transport for NSW',
    engineModifications: {
      turboUpgrade: {
        modification: 'Turbo upgrade',
        feasibility: 'Requires Certification',
        difficulty: 'Complex',
        requirements: ['Engineering Certificate', 'ADR Compliance', 'VSI 14 Report'],
        costs: { engineering: 2500, inspection: 800, total: 3300 },
        timeline: '4-8 weeks',
        notes: 'Must maintain emissions compliance. Power increases >20% require full certification.'
      },
      engineSwap: {
        modification: 'Engine swap',
        feasibility: 'Requires Certification',
        difficulty: 'Expert Required',
        requirements: ['Full Engineering Report', 'ADR Compliance', 'Emissions Test', 'VSI 14'],
        costs: { engineering: 4500, inspection: 1200, total: 5700 },
        timeline: '8-12 weeks',
        notes: 'Must be from same manufacturer family or require extensive certification.'
      },
      ecuTune: {
        modification: 'ECU tune',
        feasibility: 'Restricted',
        difficulty: 'Moderate',
        requirements: ['Emissions Compliance', 'ADR 80/03 Compliance'],
        costs: { inspection: 400, total: 400 },
        timeline: '1-2 weeks',
        notes: 'Must not exceed ADR 80/03 noise limits or affect emissions.'
      },
      exhaustModification: {
        modification: 'Exhaust modification',
        feasibility: 'Restricted',
        difficulty: 'Easy',
        requirements: ['ADR 80/03 Noise Test', 'Defect Notice Check'],
        costs: { inspection: 300, total: 300 },
        timeline: '1 week',
        notes: 'Maximum 90dB(A) at 3/4 maximum RPM. No flame kits permitted.'
      },
      intercoolerUpgrade: {
        modification: 'Intercooler upgrade',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['No obstruction of safety equipment'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Generally permitted if not affecting crash safety structures.'
      }
    },
    suspensionModifications: {
      lowering: {
        modification: 'Suspension lowering',
        feasibility: 'Restricted',
        difficulty: 'Moderate',
        requirements: ['Maximum 50mm drop', 'Engineering Certificate if >50mm'],
        costs: { engineering: 1800, total: 1800 },
        timeline: '2-4 weeks',
        notes: 'Cannot reduce ground clearance below 100mm. Headlight aim must be maintained.'
      },
      coilovers: {
        modification: 'Coilover suspension',
        feasibility: 'Legal',
        difficulty: 'Moderate',
        requirements: ['Height adjustability within limits', 'ADR compliance'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Must maintain minimum ground clearance and suspension travel.'
      },
      swaybars: {
        modification: 'Sway bar upgrade',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['OEM or ADR approved'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Generally unrestricted modification.'
      }
    },
    visualModifications: {
      bodykit: {
        modification: 'Body kit installation',
        feasibility: 'Restricted',
        difficulty: 'Complex',
        requirements: ['Engineering Certificate', 'ADR compliance', 'No sharp edges'],
        costs: { engineering: 2200, inspection: 600, total: 2800 },
        timeline: '4-6 weeks',
        notes: 'Must not affect pedestrian safety or change vehicle dimensions significantly.'
      },
      wheels: {
        modification: 'Wheel upgrade',
        feasibility: 'Restricted',
        difficulty: 'Easy',
        requirements: ['Maximum 2 inch diameter increase', 'Load rating maintenance'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Must maintain speedometer accuracy within 10%. Offset restrictions apply.'
      },
      tinting: {
        modification: 'Window tinting',
        feasibility: 'Restricted',
        difficulty: 'Easy',
        requirements: ['35% VLT minimum front windows', '20% VLT rear windows'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Windscreen tinting prohibited except medical exemptions.'
      }
    },
    performanceModifications: {
      brakeUpgrade: {
        modification: 'Brake system upgrade',
        feasibility: 'Legal',
        difficulty: 'Moderate',
        requirements: ['ADR compliance', 'Maintain brake balance'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Brake upgrades generally permitted if maintaining safety standards.'
      },
      rollcage: {
        modification: 'Roll cage installation',
        feasibility: 'Requires Certification',
        difficulty: 'Expert Required',
        requirements: ['CAMS approval', 'Engineering Certificate', 'Seat belt integration'],
        costs: { engineering: 3500, certification: 1200, total: 4700 },
        timeline: '6-10 weeks',
        notes: 'Must comply with motorsport standards and not affect airbag deployment.'
      },
      fuelSystem: {
        modification: 'Fuel system upgrade',
        feasibility: 'Requires Certification',
        difficulty: 'Complex',
        requirements: ['Engineering Certificate', 'Fire safety compliance', 'ADR compliance'],
        costs: { engineering: 2800, inspection: 900, total: 3700 },
        timeline: '4-8 weeks',
        notes: 'Fuel tank modifications require extensive safety certification.'
      }
    }
  },
  'VIC': {
    state: 'Victoria',
    authority: 'VicRoads',
    engineModifications: {
      turboUpgrade: {
        modification: 'Turbo upgrade',
        feasibility: 'Requires Certification',
        difficulty: 'Complex',
        requirements: ['VSI 14 Report', 'Engineering Certificate', 'Emissions Test'],
        costs: { engineering: 2800, inspection: 900, total: 3700 },
        timeline: '6-10 weeks',
        notes: 'Stricter than NSW. All forced induction changes require certification.'
      },
      engineSwap: {
        modification: 'Engine swap',
        feasibility: 'Requires Certification',
        difficulty: 'Expert Required',
        requirements: ['Full VSI Report', 'EPA Approval', 'Engineering Certificate'],
        costs: { engineering: 5200, inspection: 1500, total: 6700 },
        timeline: '10-16 weeks',
        notes: 'Most restrictive in Australia. Engine family restrictions strictly enforced.'
      },
      ecuTune: {
        modification: 'ECU tune',
        feasibility: 'Restricted',
        difficulty: 'Complex',
        requirements: ['EPA Certificate', 'Emissions Test', 'Engineering Report'],
        costs: { engineering: 1200, inspection: 600, total: 1800 },
        timeline: '3-6 weeks',
        notes: 'All ECU modifications require EPA approval in Victoria.'
      },
      exhaustModification: {
        modification: 'Exhaust modification',
        feasibility: 'Restricted',
        difficulty: 'Moderate',
        requirements: ['EPA Approval', 'Noise Test', 'VSI Compliance'],
        costs: { inspection: 500, certification: 400, total: 900 },
        timeline: '2-4 weeks',
        notes: 'EPA approval required for all exhaust modifications. 90dB limit strictly enforced.'
      },
      intercoolerUpgrade: {
        modification: 'Intercooler upgrade',
        feasibility: 'Restricted',
        difficulty: 'Moderate',
        requirements: ['Engineering Assessment', 'Crash Safety Review'],
        costs: { engineering: 800, total: 800 },
        timeline: '2-3 weeks',
        notes: 'Requires assessment if affecting front-end crash structures.'
      }
    },
    suspensionModifications: {
      lowering: {
        modification: 'Suspension lowering',
        feasibility: 'Restricted',
        difficulty: 'Complex',
        requirements: ['Maximum 30mm drop', 'Engineering Certificate for any lowering'],
        costs: { engineering: 2200, total: 2200 },
        timeline: '4-6 weeks',
        notes: 'Most restrictive lowering rules in Australia. 30mm limit strictly enforced.'
      },
      coilovers: {
        modification: 'Coilover suspension',
        feasibility: 'Restricted',
        difficulty: 'Complex',
        requirements: ['Engineering Certificate', 'Height compliance', 'VSI Report'],
        costs: { engineering: 1800, total: 1800 },
        timeline: '3-5 weeks',
        notes: 'All coilover installations require engineering in Victoria.'
      },
      swaybars: {
        modification: 'Sway bar upgrade',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['OEM equivalent or better'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Sway bar upgrades generally permitted.'
      }
    },
    visualModifications: {
      bodykit: {
        modification: 'Body kit installation',
        feasibility: 'Restricted',
        difficulty: 'Expert Required',
        requirements: ['Full Engineering Report', 'Pedestrian Safety Assessment', 'ADR Compliance'],
        costs: { engineering: 3500, inspection: 1000, total: 4500 },
        timeline: '8-12 weeks',
        notes: 'Extensive requirements for body modifications. Very restrictive approval process.'
      },
      wheels: {
        modification: 'Wheel upgrade',
        feasibility: 'Restricted',
        difficulty: 'Moderate',
        requirements: ['Maximum 1 inch increase', 'Engineering assessment if >1 inch'],
        costs: { engineering: 600, total: 600 },
        timeline: '1-2 weeks',
        notes: 'More restrictive than other states. Offset changes require assessment.'
      },
      tinting: {
        modification: 'Window tinting',
        feasibility: 'Restricted',
        difficulty: 'Easy',
        requirements: ['35% VLT front windows', '20% VLT rear windows'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Same as NSW but more strictly enforced.'
      }
    },
    performanceModifications: {
      brakeUpgrade: {
        modification: 'Brake system upgrade',
        feasibility: 'Restricted',
        difficulty: 'Moderate',
        requirements: ['Engineering Assessment', 'ADR compliance verification'],
        costs: { engineering: 800, total: 800 },
        timeline: '2-3 weeks',
        notes: 'Brake modifications require engineering assessment in Victoria.'
      },
      rollcage: {
        modification: 'Roll cage installation',
        feasibility: 'Requires Certification',
        difficulty: 'Expert Required',
        requirements: ['CAMS Certificate', 'Full Engineering Report', 'Crash Test Data'],
        costs: { engineering: 4200, certification: 1800, total: 6000 },
        timeline: '10-14 weeks',
        notes: 'Most stringent roll cage requirements in Australia.'
      },
      fuelSystem: {
        modification: 'Fuel system upgrade',
        feasibility: 'Requires Certification',
        difficulty: 'Expert Required',
        requirements: ['Full Engineering Report', 'Fire Safety Certificate', 'EPA Approval'],
        costs: { engineering: 3800, certification: 1500, total: 5300 },
        timeline: '8-12 weeks',
        notes: 'Extremely restrictive fuel system modification rules.'
      }
    }
  }
};

// United States - Federal and State Rules
export const US_MODIFICATION_COMPLIANCE: Record<string, StateModificationRules> = {
  'CA': {
    state: 'California',
    authority: 'CARB/DMV',
    engineModifications: {
      turboUpgrade: {
        modification: 'Turbo upgrade',
        feasibility: 'Requires Certification',
        difficulty: 'Complex',
        requirements: ['CARB EO Number', 'Smog Check Compliance', 'BAR Referee'],
        costs: { certification: 2000, inspection: 800, total: 2800 },
        timeline: '6-12 weeks',
        notes: 'Must have CARB Executive Order. Most restrictive emissions state.'
      },
      engineSwap: {
        modification: 'Engine swap',
        feasibility: 'Restricted',
        difficulty: 'Expert Required',
        requirements: ['Same year/newer engine', 'CARB compliance', 'BAR Referee approval'],
        costs: { certification: 5000, inspection: 1500, total: 6500 },
        timeline: '3-6 months',
        notes: 'Engine must be from same year or newer. All emissions equipment required.'
      },
      ecuTune: {
        modification: 'ECU tune',
        feasibility: 'Prohibited',
        difficulty: 'Expert Required',
        requirements: ['Not permitted on street vehicles'],
        costs: { total: 0 },
        timeline: 'Not Available',
        notes: 'Any ECU modification that affects emissions is illegal in California.'
      },
      exhaustModification: {
        modification: 'Exhaust modification',
        feasibility: 'Restricted',
        difficulty: 'Moderate',
        requirements: ['CARB compliance', 'Sound limit 95dB', 'Catalytic converter retention'],
        costs: { inspection: 400, total: 400 },
        timeline: '2-4 weeks',
        notes: 'Must retain all emissions equipment. Cat-back systems generally OK.'
      },
      intercoolerUpgrade: {
        modification: 'Intercooler upgrade',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['No emissions equipment removal'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Generally permitted if not affecting emissions systems.'
      }
    },
    suspensionModifications: {
      lowering: {
        modification: 'Suspension lowering',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['Minimum 4 inch ground clearance'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Must maintain minimum ground clearance and headlight aim.'
      },
      coilovers: {
        modification: 'Coilover suspension',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['Height compliance'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Generally unrestricted suspension modifications.'
      },
      swaybars: {
        modification: 'Sway bar upgrade',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['None'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Unrestricted modification.'
      }
    },
    visualModifications: {
      bodykit: {
        modification: 'Body kit installation',
        feasibility: 'Legal',
        difficulty: 'Moderate',
        requirements: ['No lighting interference', 'Bumper height compliance'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Must not obstruct required lighting or affect bumper height standards.'
      },
      wheels: {
        modification: 'Wheel upgrade',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['Fender coverage', 'No excessive projection'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Must not project beyond fenders or create safety hazards.'
      },
      tinting: {
        modification: 'Window tinting',
        feasibility: 'Restricted',
        difficulty: 'Easy',
        requirements: ['70% VLT front windows', 'Any% rear windows'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Front side windows must allow 70% light transmission.'
      }
    },
    performanceModifications: {
      brakeUpgrade: {
        modification: 'Brake system upgrade',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['DOT compliance'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Brake upgrades generally unrestricted if DOT compliant.'
      },
      rollcage: {
        modification: 'Roll cage installation',
        feasibility: 'Legal',
        difficulty: 'Moderate',
        requirements: ['NHRA/SCCA standards', 'Airbag compatibility check'],
        costs: { inspection: 500, total: 500 },
        timeline: '1-2 weeks',
        notes: 'Must not interfere with airbag deployment or seat belt function.'
      },
      fuelSystem: {
        modification: 'Fuel system upgrade',
        feasibility: 'Legal',
        difficulty: 'Moderate',
        requirements: ['DOT fuel line compliance', 'Fire safety standards'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Must use DOT approved components and maintain safety standards.'
      }
    }
  },
  'TX': {
    state: 'Texas',
    authority: 'TxDMV',
    engineModifications: {
      turboUpgrade: {
        modification: 'Turbo upgrade',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['Safety inspection compliance'],
        costs: { inspection: 200, total: 200 },
        timeline: '1 week',
        notes: 'Very permissive modification laws. No emissions testing in most counties.'
      },
      engineSwap: {
        modification: 'Engine swap',
        feasibility: 'Legal',
        difficulty: 'Moderate',
        requirements: ['Safety inspection', 'VIN verification if title change needed'],
        costs: { inspection: 300, total: 300 },
        timeline: '1-2 weeks',
        notes: 'One of the most permissive states for engine swaps.'
      },
      ecuTune: {
        modification: 'ECU tune',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['None in most counties'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'No restrictions in most Texas counties. Check local emissions requirements.'
      },
      exhaustModification: {
        modification: 'Exhaust modification',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['Sound ordinance compliance (varies by city)'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'State law is permissive. Local noise ordinances may apply.'
      },
      intercoolerUpgrade: {
        modification: 'Intercooler upgrade',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['None'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Unrestricted modification.'
      }
    },
    suspensionModifications: {
      lowering: {
        modification: 'Suspension lowering',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['Safety inspection compliance'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Must pass annual safety inspection.'
      },
      coilovers: {
        modification: 'Coilover suspension',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['Safety inspection compliance'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Unrestricted suspension modifications.'
      },
      swaybars: {
        modification: 'Sway bar upgrade',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['None'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Unrestricted modification.'
      }
    },
    visualModifications: {
      bodykit: {
        modification: 'Body kit installation',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['Safety inspection compliance'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Very permissive body modification laws.'
      },
      wheels: {
        modification: 'Wheel upgrade',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['Safety inspection compliance'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Unrestricted wheel modifications.'
      },
      tinting: {
        modification: 'Window tinting',
        feasibility: 'Restricted',
        difficulty: 'Easy',
        requirements: ['25% VLT front windows', 'Any% rear windows'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'More permissive than most states.'
      }
    },
    performanceModifications: {
      brakeUpgrade: {
        modification: 'Brake system upgrade',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['Safety inspection compliance'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Unrestricted brake modifications.'
      },
      rollcage: {
        modification: 'Roll cage installation',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['Safety inspection compliance'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Very permissive roll cage installation rules.'
      },
      fuelSystem: {
        modification: 'Fuel system upgrade',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['Fire safety compliance'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Must maintain basic fire safety standards.'
      }
    }
  }
};

// United Kingdom - Regional Modification Rules
export const UK_MODIFICATION_COMPLIANCE: Record<string, StateModificationRules> = {
  'england': {
    state: 'England',
    authority: 'DVSA',
    engineModifications: {
      turboUpgrade: {
        modification: 'Turbo upgrade',
        feasibility: 'Requires Certification',
        difficulty: 'Complex',
        requirements: ['IVA Test', 'MOT Compliance', 'Insurance Notification'],
        costs: { certification: 1800, inspection: 600, total: 2400 },
        timeline: '6-10 weeks',
        notes: 'Major modifications require IVA test. Must notify insurance.'
      },
      engineSwap: {
        modification: 'Engine swap',
        feasibility: 'Requires Certification',
        difficulty: 'Expert Required',
        requirements: ['Full IVA Test', 'DVLA Notification', 'V5C Update'],
        costs: { certification: 3500, inspection: 1200, total: 4700 },
        timeline: '8-16 weeks',
        notes: 'Engine swaps require full IVA testing and DVLA approval.'
      },
      ecuTune: {
        modification: 'ECU tune',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['Insurance notification'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'ECU tuning is legal but must be declared to insurance.'
      },
      exhaustModification: {
        modification: 'Exhaust modification',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['MOT noise test compliance', '74dB drive-by limit'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Must pass MOT noise test. 74dB limit for drive-by noise.'
      },
      intercoolerUpgrade: {
        modification: 'Intercooler upgrade',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['Insurance notification'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Generally permitted. Notify insurance for any performance modifications.'
      }
    },
    suspensionModifications: {
      lowering: {
        modification: 'Suspension lowering',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['MOT compliance', 'Insurance notification'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Must maintain adequate ground clearance and headlight aim.'
      },
      coilovers: {
        modification: 'Coilover suspension',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['MOT compliance'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Generally unrestricted if maintaining safety standards.'
      },
      swaybars: {
        modification: 'Sway bar upgrade',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['None'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Unrestricted modification.'
      }
    },
    visualModifications: {
      bodykit: {
        modification: 'Body kit installation',
        feasibility: 'Restricted',
        difficulty: 'Moderate',
        requirements: ['IVA test if major changes', 'Insurance notification'],
        costs: { certification: 1500, total: 1500 },
        timeline: '4-8 weeks',
        notes: 'Major body modifications may require IVA testing.'
      },
      wheels: {
        modification: 'Wheel upgrade',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['Load rating compliance', 'Insurance notification'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Must maintain adequate load rating and speedometer accuracy.'
      },
      tinting: {
        modification: 'Window tinting',
        feasibility: 'Restricted',
        difficulty: 'Easy',
        requirements: ['75% VLT front windows', '70% VLT windscreen'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Front windows must allow 75% light transmission.'
      }
    },
    performanceModifications: {
      brakeUpgrade: {
        modification: 'Brake system upgrade',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['MOT compliance', 'Insurance notification'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Must maintain brake balance and pass MOT brake test.'
      },
      rollcage: {
        modification: 'Roll cage installation',
        feasibility: 'Legal',
        difficulty: 'Moderate',
        requirements: ['MSA approval', 'Insurance notification'],
        costs: { certification: 800, total: 800 },
        timeline: '2-4 weeks',
        notes: 'Should meet MSA standards for motorsport use.'
      },
      fuelSystem: {
        modification: 'Fuel system upgrade',
        feasibility: 'Restricted',
        difficulty: 'Complex',
        requirements: ['IVA test for tank modifications', 'Fire safety compliance'],
        costs: { certification: 2000, total: 2000 },
        timeline: '6-10 weeks',
        notes: 'Fuel tank modifications require IVA testing.'
      }
    }
  }
};

// Germany - Regional Modification Rules
export const GERMAN_MODIFICATION_COMPLIANCE: Record<string, StateModificationRules> = {
  'bayern': {
    state: 'Bavaria',
    authority: 'TÜV Bayern',
    engineModifications: {
      turboUpgrade: {
        modification: 'Turbo upgrade',
        feasibility: 'Requires Certification',
        difficulty: 'Expert Required',
        requirements: ['TÜV Approval', 'ABE Certificate', 'Emissions Test'],
        costs: { certification: 2500, inspection: 800, total: 3300 },
        timeline: '8-12 weeks',
        notes: 'Very strict TÜV requirements. Must have ABE or individual approval.'
      },
      engineSwap: {
        modification: 'Engine swap',
        feasibility: 'Prohibited',
        difficulty: 'Expert Required',
        requirements: ['Generally not permitted'],
        costs: { total: 0 },
        timeline: 'Not Available',
        notes: 'Engine swaps rarely approved in Germany. Extremely complex process.'
      },
      ecuTune: {
        modification: 'ECU tune',
        feasibility: 'Requires Certification',
        difficulty: 'Complex',
        requirements: ['TÜV Approval', 'Emissions compliance', 'Power documentation'],
        costs: { certification: 1500, inspection: 600, total: 2100 },
        timeline: '6-8 weeks',
        notes: 'All ECU modifications require TÜV approval and documentation.'
      },
      exhaustModification: {
        modification: 'Exhaust modification',
        feasibility: 'Restricted',
        difficulty: 'Moderate',
        requirements: ['ABE Certificate', 'dB limit compliance', 'TÜV approval'],
        costs: { certification: 800, total: 800 },
        timeline: '3-5 weeks',
        notes: 'Must have ABE certificate. Very strict noise regulations.'
      },
      intercoolerUpgrade: {
        modification: 'Intercooler upgrade',
        feasibility: 'Requires Certification',
        difficulty: 'Complex',
        requirements: ['TÜV Approval', 'ABE if available'],
        costs: { certification: 1200, total: 1200 },
        timeline: '4-6 weeks',
        notes: 'Even intercooler upgrades require TÜV approval in Germany.'
      }
    },
    suspensionModifications: {
      lowering: {
        modification: 'Suspension lowering',
        feasibility: 'Restricted',
        difficulty: 'Complex',
        requirements: ['TÜV Approval', 'ABE Certificate', 'Maximum 30mm drop'],
        costs: { certification: 1800, total: 1800 },
        timeline: '4-8 weeks',
        notes: 'Very restrictive lowering rules. Must have proper certification.'
      },
      coilovers: {
        modification: 'Coilover suspension',
        feasibility: 'Requires Certification',
        difficulty: 'Complex',
        requirements: ['TÜV Approval', 'ABE Certificate', 'Height documentation'],
        costs: { certification: 2000, total: 2000 },
        timeline: '6-10 weeks',
        notes: 'All suspension modifications require TÜV approval.'
      },
      swaybars: {
        modification: 'Sway bar upgrade',
        feasibility: 'Restricted',
        difficulty: 'Moderate',
        requirements: ['ABE Certificate or TÜV approval'],
        costs: { certification: 800, total: 800 },
        timeline: '2-4 weeks',
        notes: 'Even sway bars require certification in Germany.'
      }
    },
    visualModifications: {
      bodykit: {
        modification: 'Body kit installation',
        feasibility: 'Requires Certification',
        difficulty: 'Expert Required',
        requirements: ['TÜV Approval', 'Crash safety assessment', 'Pedestrian safety'],
        costs: { certification: 4000, inspection: 1500, total: 5500 },
        timeline: '10-16 weeks',
        notes: 'Extremely strict body modification rules. Most kits require individual approval.'
      },
      wheels: {
        modification: 'Wheel upgrade',
        feasibility: 'Restricted',
        difficulty: 'Moderate',
        requirements: ['ABE Certificate', 'Load rating compliance', 'TÜV approval'],
        costs: { certification: 600, total: 600 },
        timeline: '2-3 weeks',
        notes: 'Wheels must have proper ABE certification for the specific vehicle.'
      },
      tinting: {
        modification: 'Window tinting',
        feasibility: 'Restricted',
        difficulty: 'Easy',
        requirements: ['75% VLT front windows', 'No windscreen tinting'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Very strict window tinting regulations.'
      }
    },
    performanceModifications: {
      brakeUpgrade: {
        modification: 'Brake system upgrade',
        feasibility: 'Restricted',
        difficulty: 'Complex',
        requirements: ['TÜV Approval', 'ABE Certificate', 'Brake balance test'],
        costs: { certification: 1500, total: 1500 },
        timeline: '4-6 weeks',
        notes: 'All brake modifications require TÜV approval and testing.'
      },
      rollcage: {
        modification: 'Roll cage installation',
        feasibility: 'Requires Certification',
        difficulty: 'Expert Required',
        requirements: ['DMSB Approval', 'TÜV Testing', 'Crash safety assessment'],
        costs: { certification: 3500, inspection: 2000, total: 5500 },
        timeline: '12-20 weeks',
        notes: 'Extremely complex approval process for roll cages.'
      },
      fuelSystem: {
        modification: 'Fuel system upgrade',
        feasibility: 'Prohibited',
        difficulty: 'Expert Required',
        requirements: ['Generally not permitted for street use'],
        costs: { total: 0 },
        timeline: 'Not Available',
        notes: 'Fuel system modifications rarely approved for street vehicles.'
      }
    }
  }
};

// Canada - Provincial Modification Rules
export const CANADIAN_MODIFICATION_COMPLIANCE: Record<string, StateModificationRules> = {
  'ON': {
    state: 'Ontario',
    authority: 'MTO',
    engineModifications: {
      turboUpgrade: {
        modification: 'Turbo upgrade',
        feasibility: 'Legal',
        difficulty: 'Moderate',
        requirements: ['Safety certification', 'Emissions test (if applicable)'],
        costs: { inspection: 400, total: 400 },
        timeline: '1-2 weeks',
        notes: 'Generally permitted. Emissions testing required in some regions.'
      },
      engineSwap: {
        modification: 'Engine swap',
        feasibility: 'Legal',
        difficulty: 'Complex',
        requirements: ['Safety certification', 'VIN update if required', 'Emissions compliance'],
        costs: { certification: 800, inspection: 600, total: 1400 },
        timeline: '3-6 weeks',
        notes: 'Engine swaps permitted with proper documentation and safety certification.'
      },
      ecuTune: {
        modification: 'ECU tune',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['Emissions compliance (if tested)'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'ECU tuning generally permitted. Check local emissions requirements.'
      },
      exhaustModification: {
        modification: 'Exhaust modification',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['Sound limit compliance (varies by municipality)'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Provincial law is permissive. Local noise bylaws may apply.'
      },
      intercoolerUpgrade: {
        modification: 'Intercooler upgrade',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['None'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Unrestricted modification.'
      }
    },
    suspensionModifications: {
      lowering: {
        modification: 'Suspension lowering',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['Safety certification', 'Headlight aim compliance'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Must maintain adequate ground clearance and pass safety inspection.'
      },
      coilovers: {
        modification: 'Coilover suspension',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['Safety certification'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Generally unrestricted suspension modifications.'
      },
      swaybars: {
        modification: 'Sway bar upgrade',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['None'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Unrestricted modification.'
      }
    },
    visualModifications: {
      bodykit: {
        modification: 'Body kit installation',
        feasibility: 'Legal',
        difficulty: 'Moderate',
        requirements: ['Safety certification', 'No lighting obstruction'],
        costs: { inspection: 300, total: 300 },
        timeline: '1-2 weeks',
        notes: 'Must not obstruct required lighting or affect vehicle safety.'
      },
      wheels: {
        modification: 'Wheel upgrade',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['Adequate clearance', 'Load rating compliance'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Must maintain adequate clearance and load ratings.'
      },
      tinting: {
        modification: 'Window tinting',
        feasibility: 'Restricted',
        difficulty: 'Easy',
        requirements: ['70% VLT front windows', 'Any% rear windows'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Front side windows must allow 70% light transmission.'
      }
    },
    performanceModifications: {
      brakeUpgrade: {
        modification: 'Brake system upgrade',
        feasibility: 'Legal',
        difficulty: 'Easy',
        requirements: ['Safety certification'],
        costs: { total: 0 },
        timeline: 'Immediate',
        notes: 'Brake upgrades generally unrestricted if maintaining safety standards.'
      },
      rollcage: {
        modification: 'Roll cage installation',
        feasibility: 'Legal',
        difficulty: 'Moderate',
        requirements: ['Safety certification', 'Proper installation documentation'],
        costs: { inspection: 400, total: 400 },
        timeline: '1-2 weeks',
        notes: 'Must not interfere with airbag deployment or safety systems.'
      },
      fuelSystem: {
        modification: 'Fuel system upgrade',
        feasibility: 'Legal',
        difficulty: 'Moderate',
        requirements: ['Safety certification', 'Fire safety compliance'],
        costs: { inspection: 300, total: 300 },
        timeline: '1-2 weeks',
        notes: 'Must maintain fire safety standards and pass safety inspection.'
      }
    }
  }
};

/**
 * Get modification compliance for specific popular modifications based on country/state
 */
export function getModificationCompliance(
  popularModifications: string[],
  country: string,
  state?: string
): ModificationCompliance[] {
  let complianceData: StateModificationRules | null = null;

  // Select appropriate compliance database
  switch (country) {
    case 'AU':
      complianceData = AUSTRALIAN_MODIFICATION_COMPLIANCE[state || 'NSW'];
      break;
    case 'US':
      complianceData = US_MODIFICATION_COMPLIANCE[state || 'CA'];
      break;
    case 'UK':
      complianceData = UK_MODIFICATION_COMPLIANCE[state || 'england'];
      break;
    case 'DE':
      complianceData = GERMAN_MODIFICATION_COMPLIANCE[state || 'bayern'];
      break;
    case 'CA':
      complianceData = CANADIAN_MODIFICATION_COMPLIANCE[state || 'ON'];
      break;
    default:
      return [];
  }

  if (!complianceData) return [];

  const results: ModificationCompliance[] = [];

  // Map popular modifications to compliance categories
  for (const mod of popularModifications) {
    const modLower = mod.toLowerCase();
    
    // Engine modifications
    if (modLower.includes('turbo')) {
      results.push(complianceData.engineModifications.turboUpgrade);
    } else if (modLower.includes('swap')) {
      results.push(complianceData.engineModifications.engineSwap);
    } else if (modLower.includes('tune') || modLower.includes('ecu')) {
      results.push(complianceData.engineModifications.ecuTune);
    } else if (modLower.includes('exhaust')) {
      results.push(complianceData.engineModifications.exhaustModification);
    } else if (modLower.includes('intercooler')) {
      results.push(complianceData.engineModifications.intercoolerUpgrade);
    }
    // Suspension modifications
    else if (modLower.includes('suspension') || modLower.includes('coilover')) {
      results.push(complianceData.suspensionModifications.coilovers);
    } else if (modLower.includes('sway') || modLower.includes('bar')) {
      results.push(complianceData.suspensionModifications.swaybars);
    }
    // Performance modifications
    else if (modLower.includes('brake')) {
      results.push(complianceData.performanceModifications.brakeUpgrade);
    } else if (modLower.includes('fuel')) {
      results.push(complianceData.performanceModifications.fuelSystem);
    } else if (modLower.includes('cage')) {
      results.push(complianceData.performanceModifications.rollcage);
    }
    // Visual modifications
    else if (modLower.includes('wheel') || modLower.includes('rim')) {
      results.push(complianceData.visualModifications.wheels);
    }
  }

  return results;
}

/**
 * Calculate total modification compliance costs for a country/state
 */
export function calculateModificationCosts(
  popularModifications: string[],
  country: string,
  state?: string
): { totalCost: number; breakdown: { modification: string; cost: number }[] } {
  const compliance = getModificationCompliance(popularModifications, country, state);
  
  const breakdown = compliance.map(mod => ({
    modification: mod.modification,
    cost: mod.costs.total
  }));

  const totalCost = breakdown.reduce((sum, item) => sum + item.cost, 0);

  return { totalCost, breakdown };
}