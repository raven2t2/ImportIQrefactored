import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TrendingUp, Database, Search, CheckCircle, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface QueryReview {
  id: number;
  originalQuery: string;
  lookupType: string;
  confidenceScore: number;
  resultQuality: string;
  adminNotes?: string;
  enhancementSuggestions?: string;
  flaggedForReview: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

interface PatternStaging {
  id: number;
  suggestedPattern: string;
  canonicalMake?: string;
  canonicalModel?: string;
  chassisCode?: string;
  confidenceEstimate: number;
  sourceContext?: string;
  adminStatus: string;
  adminNotes?: string;
  createdAt: string;
}

interface LookupAnalytics {
  id: number;
  queryText: string;
  lookupMethod: string;
  successRate: number;
  averageConfidence: number;
  commonFailureReasons: string[];
  suggestedImprovements: string[];
  dateAnalyzed: string;
}

export default function AdminIntelligencePortal() {
  const [selectedTab, setSelectedTab] = useState('reviews');
  const [editingReview, setEditingReview] = useState<QueryReview | null>(null);
  const [editingPattern, setEditingPattern] = useState<PatternStaging | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query review data
  const { data: queryReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['/api/admin/query-reviews'],
    select: (data: QueryReview[]) => data || []
  });

  // Pattern staging data
  const { data: patternStaging, isLoading: patternsLoading } = useQuery({
    queryKey: ['/api/admin/pattern-staging'],
    select: (data: PatternStaging[]) => data || []
  });

  // Analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/admin/lookup-analytics'],
    select: (data: LookupAnalytics[]) => data || []
  });

  // Update review mutation
  const updateReviewMutation = useMutation({
    mutationFn: async (review: Partial<QueryReview>) => {
      return apiRequest(`/api/admin/query-reviews/${review.id}`, {
        method: 'PATCH',
        body: JSON.stringify(review)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/query-reviews'] });
      setEditingReview(null);
      toast({ title: 'Review updated successfully' });
    }
  });

  // Pattern approval mutation
  const updatePatternMutation = useMutation({
    mutationFn: async (pattern: Partial<PatternStaging>) => {
      return apiRequest(`/api/admin/pattern-staging/${pattern.id}`, {
        method: 'PATCH',
        body: JSON.stringify(pattern)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pattern-staging'] });
      setEditingPattern(null);
      toast({ title: 'Pattern status updated' });
    }
  });

  const getQualityBadgeColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'poor': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Strategic Intelligence Portal</h1>
          <p className="text-muted-foreground">Enhance import intelligence through query analysis and pattern enrichment</p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Query Reviews
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Pattern Enrichment
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            System Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Query Review Dashboard</CardTitle>
              <CardDescription>
                Review recent lookup queries for quality assessment and enhancement opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviewsLoading ? (
                <div className="text-center py-8">Loading query reviews...</div>
              ) : (
                <div className="space-y-4">
                  {queryReviews?.map((review: QueryReview) => (
                    <Card key={review.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                {review.originalQuery}
                              </span>
                              <Badge className={getQualityBadgeColor(review.resultQuality)}>
                                {review.resultQuality}
                              </Badge>
                              <Badge variant="outline">{review.lookupType}</Badge>
                              {review.flaggedForReview && (
                                <Badge variant="destructive">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Flagged
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Confidence: {review.confidenceScore}% • {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingReview(review)}
                          >
                            Review
                          </Button>
                        </div>
                        {review.adminNotes && (
                          <div className="text-sm bg-blue-50 p-3 rounded">
                            <strong>Admin Notes:</strong> {review.adminNotes}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pattern Enrichment Queue</CardTitle>
              <CardDescription>
                Review and approve new vehicle patterns to expand from 29 to 250+ patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {patternsLoading ? (
                <div className="text-center py-8">Loading pattern suggestions...</div>
              ) : (
                <div className="space-y-4">
                  {patternStaging?.map((pattern: PatternStaging) => (
                    <Card key={pattern.id} className="border-l-4 border-l-green-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                {pattern.suggestedPattern}
                              </span>
                              <Badge className={getStatusBadgeColor(pattern.adminStatus)}>
                                {pattern.adminStatus}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {pattern.confidenceEstimate}% confidence
                              </span>
                            </div>
                            {pattern.canonicalMake && pattern.canonicalModel && (
                              <div className="text-sm">
                                <strong>Target:</strong> {pattern.canonicalMake} {pattern.canonicalModel}
                                {pattern.chassisCode && ` (${pattern.chassisCode})`}
                              </div>
                            )}
                            <div className="text-sm text-muted-foreground mt-1">
                              {new Date(pattern.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updatePatternMutation.mutate({
                                id: pattern.id,
                                adminStatus: 'approved'
                              })}
                              disabled={pattern.adminStatus !== 'pending'}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updatePatternMutation.mutate({
                                id: pattern.id,
                                adminStatus: 'rejected'
                              })}
                              disabled={pattern.adminStatus !== 'pending'}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingPattern(pattern)}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                        {pattern.sourceContext && (
                          <div className="text-sm bg-green-50 p-3 rounded">
                            <strong>Context:</strong> {pattern.sourceContext}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance Analytics</CardTitle>
              <CardDescription>
                Monitor lookup success rates and identify improvement opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="text-center py-8">Loading analytics...</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {analytics?.map((metric: LookupAnalytics) => (
                    <Card key={metric.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{metric.lookupMethod}</h4>
                          <Badge variant={metric.successRate > 80 ? 'default' : 'destructive'}>
                            {metric.successRate}% success
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>Average Confidence: {metric.averageConfidence}%</div>
                          <div>Query: "{metric.queryText}"</div>
                          {metric.commonFailureReasons.length > 0 && (
                            <div>
                              <strong>Common Issues:</strong>
                              <ul className="list-disc list-inside text-muted-foreground">
                                {metric.commonFailureReasons.map((reason, idx) => (
                                  <li key={idx}>{reason}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Review Query: {editingReview.originalQuery}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Result Quality</label>
                <Select
                  value={editingReview.resultQuality}
                  onValueChange={(value) => setEditingReview({...editingReview, resultQuality: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  value={editingReview.adminNotes || ''}
                  onChange={(e) => setEditingReview({...editingReview, adminNotes: e.target.value})}
                  placeholder="Add notes about this query result..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Enhancement Suggestions</label>
                <Textarea
                  value={editingReview.enhancementSuggestions || ''}
                  onChange={(e) => setEditingReview({...editingReview, enhancementSuggestions: e.target.value})}
                  placeholder="Suggest improvements for future queries like this..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingReview(null)}>
                  Cancel
                </Button>
                <Button onClick={() => updateReviewMutation.mutate(editingReview)}>
                  Save Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pattern Edit Modal */}
      {editingPattern && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Edit Pattern: {editingPattern.suggestedPattern}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Canonical Make</label>
                  <Input
                    value={editingPattern.canonicalMake || ''}
                    onChange={(e) => setEditingPattern({...editingPattern, canonicalMake: e.target.value})}
                    placeholder="Toyota"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Canonical Model</label>
                  <Input
                    value={editingPattern.canonicalModel || ''}
                    onChange={(e) => setEditingPattern({...editingPattern, canonicalModel: e.target.value})}
                    placeholder="Supra"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Chassis Code</label>
                <Input
                  value={editingPattern.chassisCode || ''}
                  onChange={(e) => setEditingPattern({...editingPattern, chassisCode: e.target.value})}
                  placeholder="JZA80"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  value={editingPattern.adminNotes || ''}
                  onChange={(e) => setEditingPattern({...editingPattern, adminNotes: e.target.value})}
                  placeholder="Notes about this pattern..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingPattern(null)}>
                  Cancel
                </Button>
                <Button onClick={() => updatePatternMutation.mutate(editingPattern)}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}