import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X, Eye, EyeOff, Upload, Trash2 } from "lucide-react";

interface Listing {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  images: string[];
  description: string;
  visible: boolean;
  notes?: string;
  source: string;
  createdAt: string;
}

export default function AdminListingManager() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Listing>>({});
  const [newImageUrl, setNewImageUrl] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: listings, isLoading } = useQuery({
    queryKey: ['/api/admin/listings'],
    queryFn: () => apiRequest('/api/admin/listings')
  });

  const updateListingMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<Listing> }) =>
      apiRequest(`/api/admin/listings/${data.id}`, 'PATCH', data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      setEditingId(null);
      setEditData({});
      toast({
        title: "Success",
        description: "Listing updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive"
      });
    }
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: (data: { id: string; visible: boolean }) =>
      apiRequest(`/api/admin/listings/${data.id}/visibility`, 'PATCH', { visible: data.visible }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      toast({
        title: "Success",
        description: "Listing visibility updated"
      });
    }
  });

  const deleteListingMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/admin/listings/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      toast({
        title: "Success",
        description: "Listing deleted successfully"
      });
    }
  });

  const startEditing = (listing: Listing) => {
    setEditingId(listing.id);
    setEditData({ ...listing });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
    setNewImageUrl("");
  };

  const saveChanges = () => {
    if (editingId && editData) {
      updateListingMutation.mutate({
        id: editingId,
        updates: editData
      });
    }
  };

  const addImage = () => {
    if (newImageUrl && editData.images) {
      setEditData({
        ...editData,
        images: [...editData.images, newImageUrl]
      });
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    if (editData.images) {
      const newImages = editData.images.filter((_, i) => i !== index);
      setEditData({
        ...editData,
        images: newImages
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Listing Management</h1>
          <p className="text-gray-600">Manage vehicle listings, images, and visibility</p>
        </div>
        <Badge variant="outline">
          {listings?.length || 0} total listings
        </Badge>
      </div>

      <div className="grid gap-6">
        {listings?.map((listing: Listing) => (
          <Card key={listing.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    {editingId === listing.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={editData.make || ''}
                          onChange={(e) => setEditData({ ...editData, make: e.target.value })}
                          className="w-24"
                          placeholder="Make"
                        />
                        <Input
                          value={editData.model || ''}
                          onChange={(e) => setEditData({ ...editData, model: e.target.value })}
                          className="w-32"
                          placeholder="Model"
                        />
                        <Input
                          type="number"
                          value={editData.year || ''}
                          onChange={(e) => setEditData({ ...editData, year: parseInt(e.target.value) })}
                          className="w-20"
                          placeholder="Year"
                        />
                      </div>
                    ) : (
                      `${listing.year} ${listing.make} ${listing.model}`
                    )}
                    {listing.visible ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4">
                    <span>{listing.currency} {listing.price.toLocaleString()}</span>
                    <Badge variant="secondary">{listing.source}</Badge>
                    <span className="text-xs">{new Date(listing.createdAt).toLocaleDateString()}</span>
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={listing.visible}
                      onCheckedChange={(checked) =>
                        toggleVisibilityMutation.mutate({ id: listing.id, visible: checked })
                      }
                    />
                    <Label className="text-xs">Visible</Label>
                  </div>
                  
                  {editingId === listing.id ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveChanges} disabled={updateListingMutation.isPending}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditing}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEditing(listing)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => deleteListingMutation.mutate(listing.id)}
                        disabled={deleteListingMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {editingId === listing.id ? (
                <div className="space-y-4">
                  {/* Price Editing */}
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={editData.price || ''}
                      onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                      placeholder="Price"
                    />
                    <Input
                      value={editData.currency || ''}
                      onChange={(e) => setEditData({ ...editData, currency: e.target.value })}
                      className="w-20"
                      placeholder="Currency"
                    />
                  </div>

                  {/* Description Editing */}
                  <Textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    placeholder="Description"
                    rows={3}
                  />

                  {/* Notes Editing */}
                  <Textarea
                    value={editData.notes || ''}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    placeholder="Internal notes (admin only)"
                    rows={2}
                  />

                  {/* Image Management */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Images</Label>
                    <div className="space-y-2">
                      {editData.images?.map((url, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <img src={url} alt="" className="w-16 h-16 object-cover rounded" />
                          <Input value={url} readOnly className="flex-1" />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <div className="flex gap-2">
                        <Input
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="Enter image URL"
                          className="flex-1"
                        />
                        <Button onClick={addImage} disabled={!newImageUrl}>
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm">{listing.description}</p>
                  
                  {listing.notes && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <Label className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                        Admin Notes:
                      </Label>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                        {listing.notes}
                      </p>
                    </div>
                  )}
                  
                  {listing.images && listing.images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {listing.images.slice(0, 5).map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`${listing.make} ${listing.model}`}
                          className="w-20 h-20 object-cover rounded flex-shrink-0"
                        />
                      ))}
                      {listing.images.length > 5 && (
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-xs">
                          +{listing.images.length - 5} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}