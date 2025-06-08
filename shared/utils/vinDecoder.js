/**
 * Universal VIN decoder with region-specific adaptations
 */

export class VINDecoder {
  constructor(regionCode = 'AU') {
    this.regionCode = regionCode;
    this.vinPattern = this.getVINPattern(regionCode);
  }

  getVINPattern(regionCode) {
    const patterns = {
      AU: /^[A-HJ-NPR-Z0-9]{17}$/, // Standard 17-char VIN
      US: /^[A-HJ-NPR-Z0-9]{17}$/, // NHTSA format
      UK: /^[A-HJ-NPR-Z0-9]{17}$/, // EU standard
      CA: /^[A-HJ-NPR-Z0-9]{17}$/, // Transport Canada
    };
    return patterns[regionCode] || patterns.AU;
  }

  validate(vin) {
    if (!vin || typeof vin !== 'string') {
      return { valid: false, error: 'VIN is required' };
    }

    const cleanVIN = vin.toUpperCase().trim();
    
    if (!this.vinPattern.test(cleanVIN)) {
      return { valid: false, error: 'Invalid VIN format' };
    }

    if (!this.validateCheckDigit(cleanVIN)) {
      return { valid: false, error: 'Invalid VIN check digit' };
    }

    return { valid: true, vin: cleanVIN };
  }

  validateCheckDigit(vin) {
    const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
    const transliteration = {
      A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
      J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
      S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9
    };

    let sum = 0;
    for (let i = 0; i < 17; i++) {
      let value;
      if (i === 8) continue; // Skip check digit position
      
      const char = vin[i];
      if (char >= '0' && char <= '9') {
        value = parseInt(char);
      } else {
        value = transliteration[char];
      }
      
      sum += value * weights[i];
    }

    const checkDigit = sum % 11;
    const expectedCheckDigit = checkDigit === 10 ? 'X' : checkDigit.toString();
    
    return vin[8] === expectedCheckDigit;
  }

  decode(vin) {
    const validation = this.validate(vin);
    if (!validation.valid) {
      return validation;
    }

    const cleanVIN = validation.vin;
    
    return {
      valid: true,
      vin: cleanVIN,
      wmi: this.decodeWMI(cleanVIN.substring(0, 3)),
      vds: this.decodeVDS(cleanVIN.substring(3, 9)),
      vis: this.decodeVIS(cleanVIN.substring(9)),
      year: this.decodeYear(cleanVIN[9]),
      plant: this.decodePlant(cleanVIN[10]),
      sequential: cleanVIN.substring(11)
    };
  }

  decodeWMI(wmi) {
    // World Manufacturer Identifier
    const manufacturers = {
      'JF1': { make: 'Subaru', country: 'Japan' },
      'JF2': { make: 'Subaru', country: 'Japan' },
      'JH4': { make: 'Honda', country: 'Japan' },
      'JHM': { make: 'Honda', country: 'Japan' },
      'JM1': { make: 'Mazda', country: 'Japan' },
      'JN1': { make: 'Nissan', country: 'Japan' },
      'JN6': { make: 'Nissan', country: 'Japan' },
      'JT2': { make: 'Toyota', country: 'Japan' },
      'JT3': { make: 'Toyota', country: 'Japan' },
      'JT4': { make: 'Toyota', country: 'Japan' },
      'JT6': { make: 'Toyota', country: 'Japan' },
      'JT7': { make: 'Toyota', country: 'Japan' },
      'JT8': { make: 'Toyota', country: 'Japan' },
      'JTA': { make: 'Mitsubishi', country: 'Japan' },
      'JTB': { make: 'Mitsubishi', country: 'Japan' },
      'JTC': { make: 'Mitsubishi', country: 'Japan' },
      '1G1': { make: 'Chevrolet', country: 'United States' },
      '1G4': { make: 'Buick', country: 'United States' },
      '1G6': { make: 'Cadillac', country: 'United States' },
      '1GC': { make: 'Chevrolet', country: 'United States' },
      '1GT': { make: 'GMC', country: 'United States' },
      '1FA': { make: 'Ford', country: 'United States' },
      '1FB': { make: 'Ford', country: 'United States' },
      '1FC': { make: 'Ford', country: 'United States' },
      '1FD': { make: 'Ford', country: 'United States' },
      '1FM': { make: 'Ford', country: 'United States' },
      '1FT': { make: 'Ford', country: 'United States' },
      '1FU': { make: 'Freightliner', country: 'United States' },
      '1FV': { make: 'Freightliner', country: 'United States' },
      '1C3': { make: 'Chrysler', country: 'United States' },
      '1C4': { make: 'Chrysler', country: 'United States' },
      '1C6': { make: 'Chrysler', country: 'United States' },
      '2C3': { make: 'Chrysler', country: 'Canada' },
      '2C4': { make: 'Chrysler', country: 'Canada' },
      '2G1': { make: 'Chevrolet', country: 'Canada' },
      '2G4': { make: 'Pontiac', country: 'Canada' },
      '2T1': { make: 'Toyota', country: 'Canada' },
      '2T2': { make: 'Toyota', country: 'Canada' },
      'WBA': { make: 'BMW', country: 'Germany' },
      'WBS': { make: 'BMW', country: 'Germany' },
      'WDD': { make: 'Mercedes-Benz', country: 'Germany' },
      'WDB': { make: 'Mercedes-Benz', country: 'Germany' },
      'WDC': { make: 'Mercedes-Benz', country: 'Germany' },
      'WVW': { make: 'Volkswagen', country: 'Germany' },
      'WV1': { make: 'Volkswagen', country: 'Germany' },
      'WV2': { make: 'Volkswagen', country: 'Germany' },
      'WAU': { make: 'Audi', country: 'Germany' },
      'WA1': { make: 'Audi', country: 'Germany' },
      'SAJ': { make: 'Jaguar', country: 'United Kingdom' },
      'SAL': { make: 'Land Rover', country: 'United Kingdom' },
      'SAR': { make: 'Rover', country: 'United Kingdom' },
      'SCC': { make: 'Lotus', country: 'United Kingdom' }
    };

    return manufacturers[wmi] || { make: 'Unknown', country: 'Unknown' };
  }

  decodeVDS(vds) {
    // Vehicle Descriptor Section - basic info
    return {
      section: vds,
      description: 'Vehicle specifications encoded'
    };
  }

  decodeVIS(vis) {
    // Vehicle Identifier Section
    return {
      year: this.decodeYear(vis[0]),
      plant: vis[1],
      sequential: vis.substring(2)
    };
  }

  decodeYear(yearCode) {
    const yearCodes = {
      'A': 1980, 'B': 1981, 'C': 1982, 'D': 1983, 'E': 1984, 'F': 1985,
      'G': 1986, 'H': 1987, 'J': 1988, 'K': 1989, 'L': 1990, 'M': 1991,
      'N': 1992, 'P': 1993, 'R': 1994, 'S': 1995, 'T': 1996, 'V': 1997,
      'W': 1998, 'X': 1999, 'Y': 2000, '1': 2001, '2': 2002, '3': 2003,
      '4': 2004, '5': 2005, '6': 2006, '7': 2007, '8': 2008, '9': 2009,
      'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014, 'F': 2015,
      'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019, 'L': 2020, 'M': 2021,
      'N': 2022, 'P': 2023, 'R': 2024, 'S': 2025
    };

    return yearCodes[yearCode] || null;
  }

  decodePlant(plantCode) {
    // Manufacturing plant - region specific
    const plantCodes = {
      // Japanese plants
      '1': 'Tahara Plant (Toyota)',
      '2': 'Tsutsumi Plant (Toyota)',
      '3': 'Motomachi Plant (Toyota)',
      '4': 'Kamigo Plant (Toyota)',
      '5': 'Yoshiwara Plant (Toyota)',
      '6': 'Kyushu Plant (Toyota)',
      'A': 'Hiroshima Plant (Mazda)',
      'B': 'Hofu Plant (Mazda)',
      'C': 'Ujina Plant (Mazda)',
      'H': 'Suzuka Plant (Honda)',
      'M': 'Marysville Plant (Honda)',
      'S': 'Saitama Plant (Honda)',
      'T': 'Tochigi Plant (Honda)',
      'Y': 'Yokohama Plant (Nissan)',
      'Z': 'Zama Plant (Nissan)'
    };

    return plantCodes[plantCode] || `Plant Code: ${plantCode}`;
  }

  getRegionSpecificInfo(decodedVIN) {
    const info = { ...decodedVIN };
    
    switch (this.regionCode) {
      case 'AU':
        info.compliance = this.getAustralianCompliance(decodedVIN);
        break;
      case 'US':
        info.compliance = this.getUSCompliance(decodedVIN);
        break;
      case 'UK':
        info.compliance = this.getUKCompliance(decodedVIN);
        break;
      case 'CA':
        info.compliance = this.getCanadianCompliance(decodedVIN);
        break;
    }

    return info;
  }

  getAustralianCompliance(decodedVIN) {
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - decodedVIN.year;
    
    return {
      eligible: vehicleAge >= 15,
      ageRequirement: '15+ years',
      compliancePlateRequired: true,
      estimatedCost: vehicleAge >= 15 ? 3500 : null
    };
  }

  getUSCompliance(decodedVIN) {
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - decodedVIN.year;
    
    return {
      eligible: vehicleAge >= 25,
      ageRequirement: '25+ years (or Show & Display)',
      epaRequired: vehicleAge < 25,
      dotRequired: vehicleAge < 25,
      estimatedCost: vehicleAge >= 25 ? 1000 : 8000
    };
  }

  getUKCompliance(decodedVIN) {
    return {
      eligible: true,
      ageRequirement: 'No age restrictions',
      typeApprovalRequired: true,
      motRequired: true,
      estimatedCost: 2500
    };
  }

  getCanadianCompliance(decodedVIN) {
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - decodedVIN.year;
    
    return {
      eligible: vehicleAge >= 15,
      ageRequirement: '15+ years',
      rivRequired: true,
      transportCanadaRequired: vehicleAge < 15,
      estimatedCost: vehicleAge >= 15 ? 1500 : 3500
    };
  }
}