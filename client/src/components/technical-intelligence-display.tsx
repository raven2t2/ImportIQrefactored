import { useQuery } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";

interface TechnicalIntelligenceProps {
  make: string;
  model: string;
}

interface TechnicalData {
  engine: {
    code: string;
    type: string;
    displacement: string;
    power: string;
    torque: string;
    compression: string;
    configuration: string;
  };
  drivetrain: {
    type: string;
    transmission: string;
    differential: string;
  };
  modifications: {
    popular: string[];
    costs: Array<{
      mod: string;
      cost: string;
      power: string;
    }>;
  };
  rarityFactor: string;
  collectibility: string;
}

export function TechnicalIntelligenceDisplay({ make, model }: TechnicalIntelligenceProps) {
  const { data: technicalData, isLoading, error } = useQuery({
    queryKey: ['/api/vehicle-technical-intelligence', make, model],
    queryFn: async () => {
      const response = await fetch(`/api/vehicle-technical-intelligence?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        console.error('Technical intelligence API error:', response.status, response.statusText);
        throw new Error(`Failed to fetch technical intelligence: ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Expected JSON response but got:', contentType);
        const text = await response.text();
        console.error('Response body:', text.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON');
      }
      const data = await response.json();
      console.log('Technical intelligence data received:', data);
      return data;
    },
    enabled: Boolean(make && model)
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-100 h-32 rounded-lg"></div>
            <div className="bg-gray-100 h-32 rounded-lg"></div>
          </div>
          <div className="bg-gray-100 h-48 rounded-lg mt-4"></div>
          <div className="bg-gray-100 h-24 rounded-lg mt-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Technical intelligence error:', error);
    return (
      <div className="space-y-4 text-center py-8">
        <p className="text-red-600">Error loading technical intelligence</p>
        <p className="text-sm text-red-500">{error.message}</p>
      </div>
    );
  }

  if (!technicalData?.technicalIntelligence) {
    return (
      <div className="space-y-4 text-center py-8">
        <p className="text-gray-600">Technical intelligence loading...</p>
        <p className="text-sm text-gray-500">Fetching comprehensive engine and modification data</p>
      </div>
    );
  }

  const engineData: TechnicalData = technicalData.technicalIntelligence;

  return (
    <div className="space-y-6">
      {/* Engine Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-900 mb-3">Engine Specifications</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-red-700">Engine Code:</span>
              <span className="font-medium text-red-900">{engineData.engine.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700">Type:</span>
              <span className="font-medium text-red-900">{engineData.engine.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700">Displacement:</span>
              <span className="font-medium text-red-900">{engineData.engine.displacement}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700">Power:</span>
              <span className="font-medium text-red-900">{engineData.engine.power}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700">Torque:</span>
              <span className="font-medium text-red-900">{engineData.engine.torque}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3">Drivetrain & Transmission</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Drive Type:</span>
              <span className="font-medium text-blue-900">{engineData.drivetrain.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Transmission:</span>
              <span className="font-medium text-blue-900">{engineData.drivetrain.transmission}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Differential:</span>
              <span className="font-medium text-blue-900">{engineData.drivetrain.differential}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Popular Modifications */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 mb-3">Popular Modifications & Upgrades</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-purple-800 mb-2">Community Favorites</h5>
            <ul className="space-y-1 text-sm text-purple-700">
              {engineData.modifications.popular.map((mod, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-purple-500" />
                  {mod}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-purple-800 mb-2">Modification Costs & Gains</h5>
            <div className="space-y-2">
              {engineData.modifications.costs.map((cost, i) => (
                <div key={i} className="bg-white/60 rounded p-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-purple-900">{cost.mod}</span>
                    <span className="text-sm font-bold text-purple-700">{cost.cost}</span>
                  </div>
                  <div className="text-xs text-purple-600">{cost.power} gain potential</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Rarity & Investment Potential */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-3">Rarity & Investment Intelligence</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-yellow-800 mb-1">Production Rarity</h5>
            <p className="text-sm text-yellow-700">{engineData.rarityFactor}</p>
          </div>
          <div>
            <h5 className="font-medium text-yellow-800 mb-1">Collectibility Status</h5>
            <p className="text-sm text-yellow-700">{engineData.collectibility}</p>
          </div>
        </div>
      </div>
      
      {/* Data Source Indicator */}
      <div className="text-xs text-gray-500 text-center">
        {technicalData.source === 'database_with_fallback' ? 
          'Technical data sourced from PostgreSQL database with comprehensive fallback intelligence' :
          'Comprehensive technical intelligence from authenticated sources'
        }
      </div>
    </div>
  );
}