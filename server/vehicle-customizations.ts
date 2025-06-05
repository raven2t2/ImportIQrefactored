/**
 * Vehicle Customizations Storage
 * Preserves admin panel changes while maintaining authentic vehicle data
 */

interface VehicleCustomization {
  vehicleId: string;
  customImages?: string[];
  deletedImages?: string[];
  customTitle?: string;
  customDescription?: string;
  isHidden?: boolean;
  customPrice?: number;
  adminNotes?: string;
  lastModified: Date;
}

// In-memory storage for vehicle customizations
const vehicleCustomizations = new Map<string, VehicleCustomization>();

/**
 * Save vehicle customization
 */
export function saveVehicleCustomization(vehicleId: string, customization: Partial<VehicleCustomization>): void {
  const existing = vehicleCustomizations.get(vehicleId) || { vehicleId, lastModified: new Date() };
  
  const updated = {
    ...existing,
    ...customization,
    vehicleId,
    lastModified: new Date()
  };
  
  vehicleCustomizations.set(vehicleId, updated);
  console.log(`Vehicle customization saved for ${vehicleId}`);
}

/**
 * Get vehicle customization
 */
export function getVehicleCustomization(vehicleId: string): VehicleCustomization | null {
  return vehicleCustomizations.get(vehicleId) || null;
}

/**
 * Apply customizations to a vehicle object
 */
export function applyCustomizations(vehicle: any): any {
  const customization = getVehicleCustomization(vehicle.id);
  
  if (!customization) {
    return vehicle;
  }
  
  // Apply image customizations
  let customizedVehicle = { ...vehicle };
  
  if (customization.customImages && customization.customImages.length > 0) {
    customizedVehicle.images = customization.customImages;
  }
  
  if (customization.customTitle) {
    customizedVehicle.title = customization.customTitle;
  }
  
  if (customization.customDescription) {
    customizedVehicle.description = customization.customDescription;
  }
  
  if (customization.customPrice) {
    customizedVehicle.price = customization.customPrice;
    customizedVehicle.priceAUD = customization.customPrice;
  }
  
  return customizedVehicle;
}

/**
 * Get all customizations for debugging
 */
export function getAllCustomizations(): Record<string, VehicleCustomization> {
  return Object.fromEntries(vehicleCustomizations.entries());
}

/**
 * Clear all customizations (for testing)
 */
export function clearAllCustomizations(): void {
  vehicleCustomizations.clear();
  console.log('All vehicle customizations cleared');
}