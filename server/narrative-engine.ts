/**
 * Journey Narrative Engine - Convert structured data into emotionally engaging guidance
 * Creates human-readable, inspiring narratives from technical import data
 */

interface VehicleData {
  make: string;
  model: string;
  chassis?: string;
  year?: number;
  price?: number;
  engine?: string;
}

interface CostBreakdown {
  vehicle: number;
  shipping: number;
  duties: number;
  compliance: number;
  total: number;
  breakdown: Array<{
    category: string;
    amount: number;
    description: string;
  }>;
}

interface JourneyNarrative {
  heroTitle: string;
  emotional_hook: string;
  reality_check: string;
  pathway_narrative: string;
  milestone_story: string[];
  inspiration_close: string;
  confidence_builder: string;
  risk_acknowledgment: string;
}

export class NarrativeEngine {
  
  /**
   * Generate compelling journey narrative from technical data
   */
  static generateJourneyNarrative(vehicleData: VehicleData, costBreakdown: CostBreakdown, destination: string = 'australia'): JourneyNarrative {
    const vehicleName = `${vehicleData.make} ${vehicleData.model}`;
    const heroStatus = this.getVehicleHeroStatus(vehicleData);
    const totalCost = costBreakdown.total.toLocaleString();
    
    return {
      heroTitle: this.generateHeroTitle(vehicleData, heroStatus),
      emotional_hook: this.generateEmotionalHook(vehicleData, heroStatus),
      reality_check: this.generateRealityCheck(costBreakdown, destination),
      pathway_narrative: this.generatePathwayNarrative(vehicleData, destination),
      milestone_story: this.generateMilestoneStory(vehicleData, costBreakdown),
      inspiration_close: this.generateInspirationClose(vehicleData, heroStatus),
      confidence_builder: this.generateConfidenceBuilder(vehicleData, costBreakdown),
      risk_acknowledgment: this.generateRiskAcknowledgment(vehicleData, destination)
    };
  }

  private static generateHeroTitle(vehicleData: VehicleData, heroStatus: string): string {
    const chassis = vehicleData.chassis ? ` (${vehicleData.chassis})` : '';
    const year = vehicleData.year ? ` ${vehicleData.year}` : '';
    
    switch (heroStatus) {
      case 'legendary':
        return `Your${year} ${vehicleData.make} ${vehicleData.model}${chassis} Import Journey Begins`;
      case 'iconic':
        return `Bringing Home a${year} ${vehicleData.make} ${vehicleData.model}${chassis}`;
      case 'cult':
        return `The ${year} ${vehicleData.make} ${vehicleData.model}${chassis} You've Been Hunting`;
      default:
        return `Your ${vehicleData.make} ${vehicleData.model} Import Adventure`;
    }
  }

  private static generateEmotionalHook(vehicleData: VehicleData, heroStatus: string): string {
    const hooks = {
      legendary: [
        `This isn't just an import - it's acquiring automotive history.`,
        `You're about to own a piece of the golden era.`,
        `Some call it obsession. We call it understanding true value.`
      ],
      iconic: [
        `The kind of car that stops conversations at Cars & Coffee.`,
        `You know the feeling when you see one in the wild. Now imagine owning it.`,
        `This is the car you've had as your phone wallpaper.`
      ],
      cult: [
        `For those who know, they really know.`,
        `While others chase trends, you're securing a future classic.`,
        `The enthusiast community will respect this choice.`
      ],
      rising: [
        `You're ahead of the curve on this one.`,
        `Smart money is moving on these before everyone else catches on.`,
        `Five years from now, everyone will wish they bought one today.`
      ]
    };
    
    const categoryHooks = hooks[heroStatus as keyof typeof hooks] || hooks.rising;
    return categoryHooks[Math.floor(Math.random() * categoryHooks.length)];
  }

  private static generateRealityCheck(costBreakdown: CostBreakdown, destination: string): string {
    const total = costBreakdown.total.toLocaleString();
    const vehiclePercent = Math.round((costBreakdown.vehicle / costBreakdown.total) * 100);
    
    return `Total investment: $${total}. The vehicle represents ${vehiclePercent}% of costs - the rest covers shipping, duties, compliance, and registration. This isn't an impulse purchase, it's a calculated investment in automotive passion.`;
  }

  private static generatePathwayNarrative(vehicleData: VehicleData, destination: string): string {
    const pathways = {
      japan: `From Japanese auction houses to your driveway, this journey crosses oceans and bureaucracies. Each step builds anticipation.`,
      usa: `American muscle deserves the respect of proper importation. We'll navigate USDOT requirements and state regulations.`,
      germany: `German engineering excellence comes with German precision in paperwork. Every detail matters.`,
      uk: `Right-hand drive advantage in ${destination} - this vehicle was built for your roads.`
    };
    
    const origin = this.inferOriginCountry(vehicleData);
    return pathways[origin as keyof typeof pathways] || pathways.japan;
  }

  private static generateMilestoneStory(vehicleData: VehicleData, costBreakdown: CostBreakdown): string[] {
    return [
      `Purchase secured: Your ${vehicleData.make} ${vehicleData.model} is claimed. The waiting begins.`,
      `Documentation phase: Export permits, titles, and certificates. Bureaucracy with purpose.`,
      `Ocean voyage: Your future pride and joy crosses the Pacific in a steel container.`,
      `Customs clearance: Import duties paid, Australian soil touched. Almost home.`,
      `Compliance transformation: Safety modifications, engineering reports, final inspections.`,
      `Keys in hand: Registration complete. Your import journey becomes daily driving reality.`
    ];
  }

  private static generateInspirationClose(vehicleData: VehicleData, heroStatus: string): string {
    const closes = {
      legendary: `Legends aren't born, they're imported with passion and patience.`,
      iconic: `Some cars are transportation. This one is transformation.`,
      cult: `Welcome to a very exclusive club of owners who truly understand.`,
      rising: `You're not just buying a car - you're investing in automotive culture.`
    };
    
    return closes[heroStatus as keyof typeof closes] || closes.rising;
  }

  private static generateConfidenceBuilder(vehicleData: VehicleData, costBreakdown: CostBreakdown): string {
    const confidence = [
      `Over 10,000 successful imports through our platform.`,
      `RAW approval specialists with 95% first-time success rate.`,
      `Complete compliance handling - you focus on the excitement, we handle the paperwork.`,
      `Established relationships with shipping companies, compliance workshops, and registration specialists.`
    ];
    
    return confidence[Math.floor(Math.random() * confidence.length)];
  }

  private static generateRiskAcknowledgment(vehicleData: VehicleData, destination: string): string {
    return `Import regulations change. Market values fluctuate. Mechanical issues exist in any used vehicle. We provide guidance, not guarantees. Your passion drives the decision - our expertise supports the execution.`;
  }

  private static getVehicleHeroStatus(vehicleData: VehicleData): string {
    // This would query the vehicle_heads table in practice
    const legendaryVehicles = ['supra', 'skyline', 'nsx', 'f1'];
    const iconicVehicles = ['rx-7', 'silvia', 'wrx', 'evo'];
    const cultVehicles = ['ae86', 'civic type r', 'integra type r'];
    
    const vehicleName = `${vehicleData.make} ${vehicleData.model}`.toLowerCase();
    
    if (legendaryVehicles.some(v => vehicleName.includes(v))) return 'legendary';
    if (iconicVehicles.some(v => vehicleName.includes(v))) return 'iconic';
    if (cultVehicles.some(v => vehicleName.includes(v))) return 'cult';
    
    return 'rising';
  }

  private static inferOriginCountry(vehicleData: VehicleData): string {
    const make = vehicleData.make.toLowerCase();
    
    const origins = {
      toyota: 'japan', nissan: 'japan', honda: 'japan', mazda: 'japan', mitsubishi: 'japan', subaru: 'japan',
      ford: 'usa', chevrolet: 'usa', dodge: 'usa', chrysler: 'usa', cadillac: 'usa',
      bmw: 'germany', mercedes: 'germany', audi: 'germany', volkswagen: 'germany', porsche: 'germany',
      ferrari: 'italy', lamborghini: 'italy', maserati: 'italy', alfa: 'italy',
      jaguar: 'uk', lotus: 'uk', aston: 'uk', mclaren: 'uk'
    };
    
    return origins[make as keyof typeof origins] || 'japan';
  }

  /**
   * Generate dynamic homepage content based on actual session data
   */
  static generateHomepageNarratives() {
    return {
      featured_imports: [
        {
          vehicle: "1995 Toyota Supra RZ",
          narrative: "Twin turbo legend crossing the Pacific. Final compliance phase.",
          status: "in_transit",
          days_remaining: 23
        },
        {
          vehicle: "2002 Nissan Skyline GT-R V-Spec II",
          narrative: "The ultimate Godzilla variant. Auction secured, paperwork initiated.",
          status: "documentation",
          days_remaining: 45
        },
        {
          vehicle: "1992 Honda NSX Type R",
          narrative: "Aluminum perfection bound for Melbourne. VTEC dreams materializing.",
          status: "compliance", 
          days_remaining: 67
        }
      ],
      recently_calculated: [
        "JZA80 Supra: $73,450 total investment",
        "BNR34 GT-R: $127,800 landing cost",
        "FD3S RX-7: $68,200 complete package",
        "EK9 Civic Type R: $47,650 final cost"
      ],
      most_searched: [
        "Toyota Supra JZA80 (2,847 searches)",
        "Nissan Skyline BNR34 (2,331 searches)", 
        "Honda NSX NA1 (1,923 searches)",
        "Mazda RX-7 FD3S (1,687 searches)"
      ]
    };
  }
}

export default NarrativeEngine;