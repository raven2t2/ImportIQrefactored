import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Search, Car, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { Link } from "wouter";

const japanValueSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1990, "Year must be 1990 or later").max(new Date().getFullYear(), "Year cannot be in the future"),
});

type FormData = z.infer<typeof japanValueSchema>;

interface JapanValueResponse {
  success: boolean;
  listings: Array<{
    source: string;
    price: number;
    priceWithMarkup: number;
    currency: string;
    mileage: string;
    condition: string;
    location: string;
    url: string;
    imageUrl: string;
  }>;
  averagePrice: number;
  averagePriceWithMarkup: number;
}

export default function JapanValue() {
  const [results, setResults] = useState<JapanValueResponse | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(japanValueSchema),
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear(),
    },
  });

  const searchMutation = useMutation({
    mutationFn: async (data: FormData): Promise<JapanValueResponse> => {
      const response = await apiRequest("POST", "/api/japan-value", data);
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data);
      toast({
        title: "Search Complete",
        description: `Found ${data.listings.length} listings for your vehicle.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Search Failed",
        description: error.message || "An error occurred while searching for vehicle values.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    searchMutation.mutate(data);
  };

  const formatCurrency = (amount: number, currency: string = "JPY") => {
    if (currency === "JPY") {
      return new Intl.NumberFormat("ja-JP", {
        style: "currency",
        currency: "JPY",
      }).format(amount);
    }
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-brand-gold rounded-lg">
                <Search className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">What's My Car Worth in Japan?</h1>
                <p className="text-sm text-gray-600">Search real Japanese auction data to find current market values</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Calculator</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Search Form */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Vehicle Search</h2>
                <p className="text-sm text-gray-600">Enter your vehicle details to search Japanese auctions</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Make <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Toyota, Nissan, Honda"
                            className="w-full"
                          />
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
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Model <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Skyline, Supra, NSX"
                            className="w-full"
                          />
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
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Year <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="1990"
                            max={new Date().getFullYear()}
                            placeholder="2000"
                            className="w-full"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-brand-gold hover:bg-brand-gold-dark"
                    disabled={searchMutation.isPending}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {searchMutation.isPending ? "Searching..." : "Search Japanese Markets"}
                  </Button>
                </form>
              </Form>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Live Market Data</p>
                    <p>Prices sourced from Goo-net Exchange, TradeCarView, and BeForward. All prices include 20% broker markup and are estimates only.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {results && (
              <div className="space-y-6">
                {/* Average Price Summary */}
                <Card className="shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Summary</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Average Market Price</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(results.averagePrice)}</p>
                        <p className="text-xs text-gray-500">Before broker markup</p>
                      </div>
                      <div className="text-center p-4 bg-brand-gold bg-opacity-10 rounded-lg border border-brand-gold border-opacity-20">
                        <p className="text-sm text-gray-600 mb-1">With Broker Markup</p>
                        <p className="text-2xl font-bold text-brand-gold">{formatCurrency(results.averagePriceWithMarkup)}</p>
                        <p className="text-xs text-gray-500">+20% broker fee included</p>
                      </div>
                    </div>
                    <p className="text-center text-xs text-gray-500 mt-4">
                      Prices are estimates. Real quotes available upon consultation.
                    </p>
                  </CardContent>
                </Card>

                {/* Individual Listings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Current Listings</h3>
                  {results.listings.map((listing, index) => (
                    <Card key={index} className="shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Car className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-900">{listing.source}</h4>
                                <p className="text-sm text-gray-600">{listing.location}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-brand-gold">
                                  {formatCurrency(listing.priceWithMarkup)}
                                </p>
                                <p className="text-sm text-gray-500 line-through">
                                  {formatCurrency(listing.price)}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Mileage: </span>
                                <span className="font-medium">{listing.mileage}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Condition: </span>
                                <span className="font-medium">{listing.condition}</span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3"
                              onClick={() => window.open(listing.url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Listing
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {!results && (
              <Card className="shadow-sm">
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Japanese Markets</h3>
                  <p className="text-gray-600">Enter your vehicle details to find current market values from Japanese auctions and dealers.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}