import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Gavel, TrendingUp, Calendar, MapPin, Car, MessageCircle, HelpCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const searchSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  yearFrom: z.number().min(1945).max(2025),
  yearTo: z.number().min(1945).max(2025),
  auctionHouse: z.string().optional(),
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

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      make: "",
      model: "",
      yearFrom: 1990,
      yearTo: 2025,
      auctionHouse: "",
    },
  });

  const searchMutation = useQuery({
    queryKey: ["/api/auction-explorer", form.watch()],
    enabled: false,
  });

  const onSubmit = async (data: SearchFormData) => {
    try {
      const response = await fetch("/api/auction-explorer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result: AuctionExplorerResponse = await response.json();
      setSearchResults(result);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Auction Sample Explorer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Explore real Japanese auction data from Kaggle datasets. Search historical auction 
            results to understand market pricing and trends for specific vehicles.
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              Search Auction Data
            </CardTitle>
            <CardDescription>
              Search through thousands of real auction records from Japanese auction houses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                          <Input placeholder="Toyota, Nissan, Honda..." {...field} />
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
                          <Input placeholder="Skyline, Supra, Civic..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yearFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year From</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1945} 
                            max={2025} 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yearTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year To</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1945} 
                            max={2025} 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="auctionHouse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auction House (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select auction house" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">All Auction Houses</SelectItem>
                            <SelectItem value="USS">USS</SelectItem>
                            <SelectItem value="IAA">IAA</SelectItem>
                            <SelectItem value="JU">JU</SelectItem>
                            <SelectItem value="HAA">HAA</SelectItem>
                            <SelectItem value="TAA">TAA</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <Gavel className="h-4 w-4 mr-2" />
                  Search Auction Records
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults && (
          <>
            {searchResults.success ? (
              <>
                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Car className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {searchResults.totalResults}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Records Found</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          ¥{searchResults.averagePrice.jpy.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Average Price (JPY)</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${searchResults.averagePrice.aud.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Average Price (AUD)</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Gavel className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {searchResults.popularAuctionHouses.length}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Auction Houses</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Auction Samples */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {searchResults.samples.slice(0, 9).map((sample) => (
                    <Card key={sample.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {sample.year} {sample.make} {sample.model}
                            </CardTitle>
                            <CardDescription>{sample.auctionHouse} - {sample.location}</CardDescription>
                          </div>
                          <Badge variant="outline">{sample.grade}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Mileage</p>
                              <p className="font-medium">{sample.mileage}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Auction Date</p>
                              <p className="font-medium">{sample.auctionDate}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Transmission</p>
                              <p className="font-medium">{sample.transmission}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Fuel Type</p>
                              <p className="font-medium">{sample.fuelType}</p>
                            </div>
                          </div>

                          <Separator />

                          <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Final Price</p>
                            <div className="space-y-1">
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                ¥{sample.priceJpy.toLocaleString()}
                              </p>
                              <p className="text-md font-semibold text-green-600">
                                ${sample.priceAud.toLocaleString()} AUD
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Market Insights */}
                {searchResults.marketInsights.length > 0 && (
                  <Card className="mb-8">
                    <CardHeader>
                      <CardTitle>Market Insights</CardTitle>
                      <CardDescription>
                        Analysis based on auction data patterns
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {searchResults.marketInsights.map((insight, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-1">{index + 1}</Badge>
                            <p className="text-gray-700 dark:text-gray-300">{insight}</p>
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
          </>
        )}

        {/* Data Source Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600 dark:text-gray-300">
              <p className="mb-4">
                <strong>Data Source:</strong> Kaggle Japanese Vehicle Auction Dataset
              </p>
              <p className="mb-4">
                Auction data compiled from major Japanese auction houses including USS, IAA, JU, HAA, and TAA.
              </p>
              
              {/* Contact Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6">
                <a
                  href="https://driveimmaculate.com/contact-us/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Need Help Finding Specific Auctions?
                </a>
                <a
                  href="https://driveimmaculate.com/quiz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  What Should I Import?
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}