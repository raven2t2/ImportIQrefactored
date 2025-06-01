import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Car, 
  Plus, 
  Calendar, 
  Eye, 
  Package, 
  Star, 
  MapPin, 
  Clock,
  Wrench,
  TrendingUp,
  Gift,
  Users,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Camera,
  Settings,
  ChevronRight,
  Home
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface VehicleBuild {
  id: number;
  nickname: string;
  chassisCode?: string;
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  photos: string[];
  modList: string[];
  plannedUpgrades: string[];
  upgradeEta: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ModShopPartner {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  discountCode?: string;
  discountPercent?: number;
  location?: string;
  specialty?: string;
}

interface PartsWatchlistItem {
  id: number;
  partName: string;
  targetPrice?: number;
  currentPrice?: number;
  source?: string;
  sourceUrl?: string;
  isFound: boolean;
  notes?: string;
  createdAt: string;
}

interface CarEvent {
  id: number;
  name: string;
  description?: string;
  location: string;
  state: string;
  eventDate: string;
  carTypeFocus?: string;
  externalLink?: string;
}

function EnhancedDashboard() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("garage");
  const [showNewBuildForm, setShowNewBuildForm] = useState(false);
  const [showWatchlistForm, setShowWatchlistForm] = useState(false);
  const [selectedState, setSelectedState] = useState("SA");

  // Vehicle Builds queries
  const { data: vehicleBuilds = [], isLoading: buildsLoading } = useQuery({
    queryKey: ["/api/vehicle-builds"],
    enabled: isAuthenticated,
  });

  // Mod Shop Partners query
  const { data: modShops = [], isLoading: shopsLoading } = useQuery({
    queryKey: ["/api/mod-shop-partners"],
    enabled: isAuthenticated,
  });

  // Parts Watchlist query
  const { data: watchlist = [], isLoading: watchlistLoading } = useQuery({
    queryKey: ["/api/parts-watchlist"],
    enabled: isAuthenticated,
  });

  // Car Events query
  const { data: carEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/car-events", selectedState],
    enabled: isAuthenticated,
  });

  // Mutations
  const createBuildMutation = useMutation({
    mutationFn: async (buildData: any) => {
      return await apiRequest("POST", "/api/vehicle-builds", buildData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-builds"] });
      setShowNewBuildForm(false);
    },
  });

  const createWatchlistMutation = useMutation({
    mutationFn: async (itemData: any) => {
      return await apiRequest("POST", "/api/parts-watchlist", itemData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parts-watchlist"] });
      setShowWatchlistForm(false);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800 p-8 text-center">
          <CardContent>
            <h2 className="text-2xl font-bold text-white mb-4">Access Required</h2>
            <p className="text-gray-400 mb-6">Please log in to access your dashboard.</p>
            <Button 
              className="bg-amber-400 hover:bg-amber-500 text-black"
              onClick={() => window.location.href = '/api/login'}
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
              <p className="text-gray-400 mt-2">Manage your builds, track parts, and discover events</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-amber-400/10 text-amber-400 border-amber-400/20">
                Premium Member
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-gray-900 border border-gray-800">
            <TabsTrigger value="garage" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">
              <Home className="h-4 w-4 mr-2" />
              My Garage
            </TabsTrigger>
            <TabsTrigger value="perks" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">
              <Gift className="h-4 w-4 mr-2" />
              Mod Shop Perks
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">
              <Eye className="h-4 w-4 mr-2" />
              Parts Watchlist
            </TabsTrigger>
            <TabsTrigger value="planner" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">
              <TrendingUp className="h-4 w-4 mr-2" />
              Next Import
            </TabsTrigger>
          </TabsList>

          {/* My Build Garage */}
          <TabsContent value="garage" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">My Build Garage</h2>
                <p className="text-gray-400">Track and showcase your vehicle builds</p>
              </div>
              <Button 
                onClick={() => setShowNewBuildForm(true)}
                className="bg-amber-400 hover:bg-amber-500 text-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Build
              </Button>
            </div>

            {showNewBuildForm && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Add New Build</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    createBuildMutation.mutate({
                      nickname: formData.get('nickname'),
                      make: formData.get('make'),
                      model: formData.get('model'),
                      year: parseInt(formData.get('year') as string) || undefined,
                      chassisCode: formData.get('chassisCode'),
                      modList: [],
                      plannedUpgrades: [],
                      upgradeEta: [],
                      photos: [],
                      isPublic: false,
                    });
                  }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input name="nickname" placeholder="Build Nickname" className="bg-gray-800 border-gray-700 text-white" required />
                      <Input name="make" placeholder="Make" className="bg-gray-800 border-gray-700 text-white" />
                      <Input name="model" placeholder="Model" className="bg-gray-800 border-gray-700 text-white" />
                      <Input name="year" type="number" placeholder="Year" className="bg-gray-800 border-gray-700 text-white" />
                      <Input name="chassisCode" placeholder="Chassis Code" className="bg-gray-800 border-gray-700 text-white" />
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" className="bg-amber-400 hover:bg-amber-500 text-black">
                        Save Build
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowNewBuildForm(false)}
                        className="border-gray-600 text-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buildsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="bg-gray-900 border-gray-800 animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-32 bg-gray-800 rounded mb-4"></div>
                      <div className="h-4 bg-gray-800 rounded mb-2"></div>
                      <div className="h-3 bg-gray-800 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))
              ) : vehicleBuilds.length === 0 ? (
                <Card className="bg-gray-900 border-gray-800 col-span-full">
                  <CardContent className="p-12 text-center">
                    <Car className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No builds yet</h3>
                    <p className="text-gray-400 mb-6">Start by adding your first vehicle build</p>
                    <Button 
                      onClick={() => setShowNewBuildForm(true)}
                      className="bg-amber-400 hover:bg-amber-500 text-black"
                    >
                      Add Your First Build
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                vehicleBuilds.map((build: VehicleBuild) => (
                  <Card key={build.id} className="bg-gray-900 border-gray-800 hover:border-amber-400/50 transition-colors group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
                            {build.nickname}
                          </h3>
                          {build.make && build.model && (
                            <p className="text-gray-400 text-sm">
                              {build.year} {build.make} {build.model}
                            </p>
                          )}
                        </div>
                        <Badge variant={build.isPublic ? "secondary" : "outline"} className="text-xs">
                          {build.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {build.modList.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Current Mods:</p>
                            <div className="flex flex-wrap gap-1">
                              {build.modList.slice(0, 3).map((mod, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {mod}
                                </Badge>
                              ))}
                              {build.modList.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{build.modList.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Updated {new Date(build.updatedAt).toLocaleDateString()}</span>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" className="h-6 px-2 border-gray-600">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-6 px-2 border-gray-600">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Mod Shop Perks */}
          <TabsContent value="perks" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Mod Shop Perks</h2>
              <p className="text-gray-400">Exclusive discounts and partnerships for ImportIQ members</p>
            </div>

            {modShops.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-12 text-center">
                  <Gift className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Perks Program Launching Soon</h3>
                  <p className="text-gray-400 mb-6">Get early access to exclusive discounts from top mod shops</p>
                  <Button className="bg-amber-400 hover:bg-amber-500 text-black">
                    Join Waitlist
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modShops.map((shop: ModShopPartner) => (
                  <Card key={shop.id} className="bg-gray-900 border-gray-800 hover:border-amber-400/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        {shop.logoUrl && (
                          <img src={shop.logoUrl} alt={shop.name} className="h-10 w-10 rounded" />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-white">{shop.name}</h3>
                          {shop.location && (
                            <p className="text-gray-400 text-sm flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {shop.location}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {shop.description && (
                        <p className="text-gray-400 text-sm mb-4">{shop.description}</p>
                      )}
                      
                      {shop.discountPercent && (
                        <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-3 mb-4">
                          <p className="text-amber-400 font-semibold">
                            {shop.discountPercent}% OFF
                          </p>
                          {shop.discountCode && (
                            <p className="text-white text-sm">Code: {shop.discountCode}</p>
                          )}
                        </div>
                      )}
                      
                      {shop.website && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                          onClick={() => window.open(shop.website, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit Shop
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Parts Watchlist */}
          <TabsContent value="watchlist" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Parts Watchlist</h2>
                <p className="text-gray-400">Track parts and get notified when prices drop</p>
              </div>
              <Button 
                onClick={() => setShowWatchlistForm(true)}
                className="bg-amber-400 hover:bg-amber-500 text-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Part
              </Button>
            </div>

            {showWatchlistForm && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Add to Watchlist</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    createWatchlistMutation.mutate({
                      partName: formData.get('partName'),
                      targetPrice: parseInt(formData.get('targetPrice') as string) * 100 || undefined,
                      source: formData.get('source'),
                      sourceUrl: formData.get('sourceUrl'),
                      notes: formData.get('notes'),
                    });
                  }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Input name="partName" placeholder="Part Name" className="bg-gray-800 border-gray-700 text-white" required />
                      <Input name="targetPrice" type="number" placeholder="Target Price ($)" className="bg-gray-800 border-gray-700 text-white" />
                      <Input name="source" placeholder="Source (eBay, Yahoo JP, etc.)" className="bg-gray-800 border-gray-700 text-white" />
                      <Input name="sourceUrl" placeholder="URL (optional)" className="bg-gray-800 border-gray-700 text-white" />
                    </div>
                    <Textarea name="notes" placeholder="Notes" className="bg-gray-800 border-gray-700 text-white mb-4" />
                    <div className="flex space-x-2">
                      <Button type="submit" className="bg-amber-400 hover:bg-amber-500 text-black">
                        Add to Watchlist
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowWatchlistForm(false)}
                        className="border-gray-600 text-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {watchlistLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="bg-gray-900 border-gray-800 animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-800 rounded mb-2"></div>
                      <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))
              ) : watchlist.length === 0 ? (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-12 text-center">
                    <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No parts tracked</h3>
                    <p className="text-gray-400 mb-6">Start tracking parts to get price alerts</p>
                    <Button 
                      onClick={() => setShowWatchlistForm(true)}
                      className="bg-amber-400 hover:bg-amber-500 text-black"
                    >
                      Add First Part
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                watchlist.map((item: PartsWatchlistItem) => (
                  <Card key={item.id} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{item.partName}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                            {item.targetPrice && (
                              <span>Target: ${(item.targetPrice / 100).toFixed(2)}</span>
                            )}
                            {item.source && <span>Source: {item.source}</span>}
                            <span>Added {new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={item.isFound ? "secondary" : "outline"}>
                            {item.isFound ? "Found" : "Watching"}
                          </Badge>
                          <Button size="sm" variant="outline" className="h-8 px-2 border-gray-600">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Events Calendar */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Car Events</h2>
                <p className="text-gray-400">Discover upcoming automotive events in your area</p>
              </div>
              <div className="flex items-center space-x-2">
                <select 
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-2"
                >
                  <option value="SA">South Australia</option>
                  <option value="NSW">New South Wales</option>
                  <option value="VIC">Victoria</option>
                  <option value="QLD">Queensland</option>
                  <option value="WA">Western Australia</option>
                  <option value="TAS">Tasmania</option>
                  <option value="NT">Northern Territory</option>
                  <option value="ACT">Australian Capital Territory</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {eventsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="bg-gray-900 border-gray-800 animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-800 rounded mb-2"></div>
                      <div className="h-3 bg-gray-800 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))
              ) : carEvents.length === 0 ? (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
                    <p className="text-gray-400">Check back soon for upcoming events in {selectedState}</p>
                  </CardContent>
                </Card>
              ) : (
                carEvents.map((event: CarEvent) => (
                  <Card key={event.id} className="bg-gray-900 border-gray-800 hover:border-amber-400/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">{event.name}</h3>
                          <div className="space-y-1 text-sm text-gray-400">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              {event.location}, {event.state}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              {new Date(event.eventDate).toLocaleDateString()}
                            </div>
                            {event.carTypeFocus && (
                              <Badge variant="outline" className="mt-2">
                                {event.carTypeFocus}
                              </Badge>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-gray-300 mt-3">{event.description}</p>
                          )}
                        </div>
                        {event.externalLink && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(event.externalLink, '_blank')}
                            className="border-gray-600 text-gray-300"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Next Import Planner */}
          <TabsContent value="planner" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Next Import Planner</h2>
              <p className="text-gray-400">Plan your next vehicle import with AI assistance</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-amber-400" />
                    Quick Start Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start bg-gray-800 hover:bg-gray-700 text-white border border-gray-700">
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Use Previous Import Settings
                  </Button>
                  <Button className="w-full justify-start bg-gray-800 hover:bg-gray-700 text-white border border-gray-700">
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Import for a Friend (Earn Referral)
                  </Button>
                  <Button className="w-full justify-start bg-amber-400 hover:bg-amber-500 text-black">
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Start Fresh Import Calculation
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="h-5 w-5 mr-2 text-amber-400" />
                    Become an Affiliate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">
                    Share ImportIQ with others and earn 20% commission on all referrals.
                  </p>
                  <Button className="w-full bg-amber-400 hover:bg-amber-500 text-black">
                    Join Affiliate Program
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">AI Import Recommendation</CardTitle>
                <CardDescription className="text-gray-400">
                  Based on your previous imports and current market trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-4">
                  <p className="text-amber-400 font-medium mb-2">Recommended for you:</p>
                  <p className="text-white">
                    Consider a 2019-2021 Toyota Supra from Japan. Current market conditions show:
                  </p>
                  <ul className="text-gray-300 mt-2 space-y-1 text-sm">
                    <li>• Auction prices trending 8% lower than last quarter</li>
                    <li>• Optimal shipping rates to Australia currently available</li>
                    <li>• High resale value projection based on your location</li>
                  </ul>
                  <Button className="mt-4 bg-amber-400 hover:bg-amber-500 text-black">
                    Get Detailed Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default EnhancedDashboard;