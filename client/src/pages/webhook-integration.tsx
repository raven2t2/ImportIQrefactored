import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Code, Database, Globe, Shield, Zap, CheckCircle, AlertTriangle, Clock } from "lucide-react";

interface IngestionLog {
  id: number;
  sourceName: string;
  recordsReceived: number;
  recordsProcessed: number;
  recordsSkipped: number;
  status: string;
  processingTimeMs: number;
  createdAt: string;
  errors: string[] | null;
}

interface AuctionListing {
  id: number;
  title: string;
  price: string;
  currency: string;
  location: string;
  sourceSite: string;
  make?: string;
  model?: string;
  year?: number;
  dataSource: string;
  createdAt: string;
}

export default function WebhookIntegration() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const { data: ingestionLogs } = useQuery<{ logs: IngestionLog[] }>({
    queryKey: ["/api/ingestion-logs"],
    refetchInterval: 30000,
  });

  const { data: recentListings } = useQuery<{ listings: AuctionListing[] }>({
    queryKey: ["/api/auction-listings"],
    refetchInterval: 30000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Webhook Data Integration
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Real-time auction data ingestion system for external scraping services
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-500" />
                    Real-Time Ingestion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Accept auction data from external scraping services via secure webhook endpoints
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    Data Validation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Comprehensive validation and sanitization of incoming auction data
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    High Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Process thousands of auction listings with detailed logging and monitoring
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Architecture</CardTitle>
                <CardDescription>
                  How external scraping services integrate with ImportIQ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Data Flow Process</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>External scraping service (ScraperAPI, BrightData, Oxylabs) collects auction data</li>
                      <li>Service sends POST request to /api/receive-scan webhook endpoint</li>
                      <li>ImportIQ validates and processes each auction listing</li>
                      <li>Validated data is stored in PostgreSQL database</li>
                      <li>Processing logs are created for monitoring and debugging</li>
                      <li>Real-time market intelligence becomes available to users</li>
                    </ol>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Supported Sources</h5>
                      <ul className="text-sm space-y-1">
                        <li>• Yahoo Auctions Japan</li>
                        <li>• Copart (US)</li>
                        <li>• IAAI (US)</li>
                        <li>• Manheim (US)</li>
                        <li>• Custom auction sites</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2">Data Quality</h5>
                      <ul className="text-sm space-y-1">
                        <li>• Schema validation</li>
                        <li>• Price normalization</li>
                        <li>• Vehicle detail extraction</li>
                        <li>• Duplicate detection</li>
                        <li>• Error tracking</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Endpoint</CardTitle>
                <CardDescription>
                  Technical specifications for integrating external scraping services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                  <div>POST /api/receive-scan</div>
                  <div>Content-Type: application/json</div>
                  <div>User-Agent: YourServiceName</div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Required Request Format</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
{`{
  "listings": [
    {
      "title": "2020 Toyota Supra GR 3.0L Turbo",
      "price": 45000,
      "currency": "USD",
      "location": "Los Angeles, CA",
      "listingUrl": "https://example.com/listing/123",
      "sourceSite": "copart",
      "make": "Toyota",
      "model": "Supra", 
      "year": 2020,
      "condition": "good",
      "mileage": "25000",
      "auctionId": "COPART123",
      "lotNumber": "45678901"
    }
  ]
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Required Fields</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Badge variant="outline">title</Badge>
                      <Badge variant="outline">price</Badge>
                      <Badge variant="outline">currency</Badge>
                      <Badge variant="outline">location</Badge>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline">listingUrl</Badge>
                      <Badge variant="outline">sourceSite</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Optional Fields</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <span>make</span>
                    <span>model</span>
                    <span>year</span>
                    <span>condition</span>
                    <span>mileage</span>
                    <span>auctionId</span>
                    <span>lotNumber</span>
                    <span>imageUrl</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Format</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
{`{
  "success": true,
  "message": "Auction data processed successfully",
  "summary": {
    "totalReceived": 3,
    "processed": 3,
    "skipped": 0,
    "errors": null,
    "processingTimeMs": 377
  }
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {recentListings?.listings?.length || 0}
                  </div>
                  <p className="text-sm text-gray-500">Active auction listings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {ingestionLogs?.logs?.length ? 
                      Math.round((ingestionLogs.logs.filter(log => log.status === 'success').length / ingestionLogs.logs.length) * 100) + '%'
                      : '100%'
                    }
                  </div>
                  <p className="text-sm text-gray-500">Data ingestion success</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Last Update</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
                    {ingestionLogs?.logs?.[0] ? 
                      formatTimestamp(ingestionLogs.logs[0].createdAt).split(',')[1].trim()
                      : 'No data'
                    }
                  </div>
                  <p className="text-sm text-gray-500">Most recent ingestion</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Ingestion Logs</CardTitle>
                <CardDescription>
                  Real-time monitoring of data ingestion from external services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ingestionLogs?.logs?.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(log.status)}`}></div>
                        <div>
                          <div className="font-medium">{log.sourceName}</div>
                          <div className="text-sm text-gray-500">
                            {log.recordsProcessed}/{log.recordsReceived} records processed
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{log.processingTimeMs}ms</div>
                        <div className="text-xs text-gray-500">
                          {formatTimestamp(log.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {!ingestionLogs?.logs?.length && (
                    <div className="text-center py-8 text-gray-500">
                      No ingestion logs available yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Auction Listings</CardTitle>
                <CardDescription>
                  Latest auction data received via webhook integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentListings?.listings?.slice(0, 5).map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <div className="font-medium">{listing.title}</div>
                        <div className="text-sm text-gray-500">
                          {listing.make} {listing.model} {listing.year} • {listing.location}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          ${parseFloat(listing.price).toLocaleString()}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {listing.sourceSite}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {!recentListings?.listings?.length && (
                    <div className="text-center py-8 text-gray-500">
                      No auction listings available yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration Examples</CardTitle>
                <CardDescription>
                  Sample implementations for popular scraping services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Python with Requests</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>
{`import requests
import json

# Sample auction data
auction_data = {
    "listings": [
        {
            "title": "2020 Toyota Supra GR 3.0L Turbo",
            "price": 45000,
            "currency": "USD",
            "location": "Los Angeles, CA",
            "listingUrl": "https://example.com/listing/123",
            "sourceSite": "copart",
            "make": "Toyota",
            "model": "Supra",
            "year": 2020
        }
    ]
}

# Send to ImportIQ webhook
response = requests.post(
    "https://your-domain.replit.app/api/receive-scan",
    headers={
        "Content-Type": "application/json",
        "User-Agent": "ScraperAPI-Service"
    },
    json=auction_data
)

print(response.json())`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">cURL Command</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>
{`curl -X POST https://your-domain.replit.app/api/receive-scan \\
  -H "Content-Type: application/json" \\
  -H "User-Agent: BrightData-Service" \\
  -d '{
    "listings": [
      {
        "title": "2019 Nissan GT-R Premium AWD",
        "price": 89500,
        "currency": "USD",
        "location": "Dallas, TX",
        "listingUrl": "https://iaai.com/auction/lot/12345",
        "sourceSite": "iaai",
        "make": "Nissan",
        "model": "GT-R",
        "year": 2019
      }
    ]
  }'`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Node.js with Axios</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>
{`const axios = require('axios');

const auctionData = {
  listings: [
    {
      title: "2021 Honda Civic Type R Touring",
      price: 42000,
      currency: "USD",
      location: "Miami, FL",
      listingUrl: "https://copart.com/lot/98765",
      sourceSite: "copart",
      make: "Honda",
      model: "Civic",
      year: 2021
    }
  ]
};

axios.post('https://your-domain.replit.app/api/receive-scan', auctionData, {
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Oxylabs-Service'
  }
}).then(response => {
  console.log('Success:', response.data);
}).catch(error => {
  console.error('Error:', error.response.data);
});`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Batch Processing</div>
                      <div className="text-sm text-gray-600">Send multiple listings in a single request for better performance</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Unique User-Agent</div>
                      <div className="text-sm text-gray-600">Use identifiable User-Agent headers for tracking and debugging</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Error Handling</div>
                      <div className="text-sm text-gray-600">Implement retry logic for failed requests and monitor response status</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Rate Limiting</div>
                      <div className="text-sm text-gray-600">Respect reasonable request limits to maintain system performance</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}