import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Car, Search, TrendingUp, Calendar, MapPin, Gauge, Fuel, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const searchSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().optional(),
  year: z.coerce.number().min(1980).max(2025).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface AuctionSample {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: string;
  auctionHouse: string;
  auctionDate: string;
  grade: string;
  priceJpy: number;
  priceAud: number;
  location: string;
  transmission: string;
  fuelType: string;
  engineSize: string;
  color: string;
  condition: string;
  images?: string[];
}

interface AuctionExplorerResponse {
  success: boolean;
  samples: AuctionSample[];
  totalResults: number;
  averagePrice: {
    jpy: number;
    aud: number;
  };
  priceRange: {
    min: { jpy: number; aud: number };
    max: { jpy: number; aud: number };
  };
  marketInsights: string[];
  popularAuctionHouses: Array<{
    name: string;
    count: number;
    averagePrice: number;
  }>;
}

export default function AuctionSampleExplorer() {
  const [searchResults, setSearchResults] = useState<AuctionExplorerResponse | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      make: "",
      model: "",
      year: undefined,
      maxPrice: undefined,
    },
  });

  const searchMutation = useMutation({
    mutationFn: async (data: SearchFormData) => {
      // Transform data to match backend expectations
      const requestData = {
        make: data.make,
        model: data.model || '',
        yearFrom: data.year || 1980,
        yearTo: data.year || 2025,
        maxPrice: data.maxPrice,
        auctionHouse: 'all'
      };
      const response = await apiRequest("POST", "/api/auction-explorer", requestData);
      return await response.json();
    },
    onSuccess: (data: AuctionExplorerResponse) => {
      setSearchResults(data);
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    },
  });

  const onSubmit = async (data: SearchFormData) => {
    searchMutation.mutate(data);
  };

  const formatPrice = (jpy: number, aud: number) => {
    return `¥${jpy.toLocaleString()} (A$${aud.toLocaleString()})`;
  };

  const formatMileage = (mileage: string) => {
    const num = parseInt(mileage.replace(/[^\d]/g, ''));
    return isNaN(num) ? mileage : `${num.toLocaleString()} km`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Auction Sample Explorer
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore real auction data from Japanese vehicle auctions. Search by make, model, year, and price to discover market trends and pricing insights for your next import.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Auction Records
            </CardTitle>
            <CardDescription>
              Find auction samples matching your criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select make" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Toyota">Toyota</SelectItem>
                              <SelectItem value="Honda">Honda</SelectItem>
                              <SelectItem value="Nissan">Nissan</SelectItem>
                              <SelectItem value="Mazda">Mazda</SelectItem>
                              <SelectItem value="Subaru">Subaru</SelectItem>
                              <SelectItem value="Mitsubishi">Mitsubishi</SelectItem>
                              <SelectItem value="Suzuki">Suzuki</SelectItem>
                              <SelectItem value="Daihatsu">Daihatsu</SelectItem>
                              <SelectItem value="Lexus">Lexus</SelectItem>
                              <SelectItem value="Infiniti">Infiniti</SelectItem>
                              <SelectItem value="Acura">Acura</SelectItem>
                              <SelectItem value="BMW">BMW</SelectItem>
                              <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                              <SelectItem value="Audi">Audi</SelectItem>
                              <SelectItem value="Volkswagen">Volkswagen</SelectItem>
                              <SelectItem value="Ford">Ford</SelectItem>
                              <SelectItem value="Chevrolet">Chevrolet</SelectItem>
                              <SelectItem value="Dodge">Dodge</SelectItem>
                              <SelectItem value="Porsche">Porsche</SelectItem>
                              <SelectItem value="Ferrari">Ferrari</SelectItem>
                              <SelectItem value="Lamborghini">Lamborghini</SelectItem>
                              <SelectItem value="McLaren">McLaren</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Supra, Skyline" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 2020" 
                            min="1980" 
                            max="2025"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Price (JPY)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 5000000" 
                            min="0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={searchMutation.isPending}
                >
                  {searchMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching Auction Records...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search Auction Records
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {searchResults && (
          <div ref={resultsRef}>
            {searchResults.success ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Car className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {searchResults.totalResults}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Total Records
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          A${searchResults.averagePrice.aud.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Average Price
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          A${searchResults.priceRange.min.aud.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Minimum Price
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <MapPin className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          A${searchResults.priceRange.max.aud.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Maximum Price
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {searchResults.samples.length > 0 && (
                  <Card className="mb-8">
                    <CardHeader>
                      <CardTitle>Auction Samples</CardTitle>
                      <CardDescription>
                        Found {searchResults.samples.length} auction records matching your criteria
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6">
                        {searchResults.samples.map((sample) => (
                          <div key={sample.id} className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-800">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                  {sample.year} {sample.make} {sample.model}
                                </h3>
                                <p className="text-lg font-bold text-green-600">
                                  {formatPrice(sample.priceJpy, sample.priceAud)}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-sm">
                                Grade {sample.grade}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Gauge className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-600 dark:text-gray-300">
                                  {formatMileage(sample.mileage)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-600 dark:text-gray-300">
                                  {sample.auctionDate}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-600 dark:text-gray-300">
                                  {sample.location}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Fuel className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-600 dark:text-gray-300">
                                  {sample.fuelType}
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <Badge variant="secondary">{sample.transmission}</Badge>
                              <Badge variant="secondary">{sample.engineSize}</Badge>
                              <Badge variant="secondary">{sample.color}</Badge>
                              <Badge variant="secondary">{sample.auctionHouse}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Results Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      No auction records match your search criteria. Try adjusting your filters.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600 dark:text-gray-300">
              <p className="mb-4">
                <strong>Data Source:</strong> Kaggle Japanese Vehicle Auction Dataset
              </p>
              <p className="mb-4">
                <strong>Data Coverage:</strong> 5,200+ authentic auction records from major Japanese auction houses
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}