import { Router } from 'express';
import { auRegionConfig, calculateAuImportCosts, validateAuCompliance } from '../regionLogic/au.js';
import { usRegionConfig, calculateUsImportCosts, validateUsCompliance } from '../regionLogic/us.js';
import { ukRegionConfig, calculateUkImportCosts, validateUkCompliance } from '../regionLogic/uk.js';
import { caRegionConfig, calculateCaImportCosts, validateCaCompliance } from '../regionLogic/ca.js';

const router = Router();

const regionHandlers = {
  AU: {
    config: auRegionConfig,
    calculateCosts: calculateAuImportCosts,
    validateCompliance: validateAuCompliance
  },
  US: {
    config: usRegionConfig,
    calculateCosts: calculateUsImportCosts,
    validateCompliance: validateUsCompliance
  },
  UK: {
    config: ukRegionConfig,
    calculateCosts: calculateUkImportCosts,
    validateCompliance: validateUkCompliance
  },
  CA: {
    config: caRegionConfig,
    calculateCosts: calculateCaImportCosts,
    validateCompliance: validateCaCompliance
  }
};

// Get region configuration
router.get('/config/:regionCode', (req, res) => {
  const { regionCode } = req.params;
  const handler = regionHandlers[regionCode];
  
  if (!handler) {
    return res.status(404).json({ error: 'Region not supported' });
  }
  
  res.json({
    region: regionCode,
    config: handler.config
  });
});

// Calculate import costs for a region
router.post('/calculate-costs/:regionCode', (req, res) => {
  const { regionCode } = req.params;
  const { vehicleValue, subdivision } = req.body;
  
  const handler = regionHandlers[regionCode];
  
  if (!handler) {
    return res.status(404).json({ error: 'Region not supported' });
  }
  
  if (!vehicleValue || vehicleValue <= 0) {
    return res.status(400).json({ error: 'Valid vehicle value required' });
  }
  
  try {
    const costs = handler.calculateCosts(vehicleValue, subdivision);
    res.json({
      region: regionCode,
      vehicleValue,
      subdivision,
      costs
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate costs' });
  }
});

// Validate compliance for a region
router.post('/validate-compliance/:regionCode', (req, res) => {
  const { regionCode } = req.params;
  const { vehicle } = req.body;
  
  const handler = regionHandlers[regionCode];
  
  if (!handler) {
    return res.status(404).json({ error: 'Region not supported' });
  }
  
  if (!vehicle || !vehicle.year) {
    return res.status(400).json({ error: 'Vehicle data with year required' });
  }
  
  try {
    const compliance = handler.validateCompliance(vehicle);
    res.json({
      region: regionCode,
      vehicle,
      compliance
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate compliance' });
  }
});

// Get all supported regions
router.get('/supported', (req, res) => {
  const regions = Object.keys(regionHandlers).map(code => ({
    code,
    config: regionHandlers[code].config
  }));
  
  res.json({ regions });
});

export default router;