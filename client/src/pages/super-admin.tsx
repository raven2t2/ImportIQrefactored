import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Edit, 
  Save, 
  Trash2, 
  Plus, 
  Image, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  RefreshCw,
  Settings,
  Database,
  FileText,
  Camera,
  DragHandleDots2Icon
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface Vehicle {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  priceAUD: number;
  currency: string;
  mileage: string;
  location: string;
  images: string[];
  transmission: string;
  fuelType: string;
  engineSize: string;
  description: string;
  source: string;
  lastUpdated: string;
}

interface ImageManagement {
  vehicleId: string;
  images: { id: string; url: string; order: number; hidden: boolean }[];
}

function ImageManager({ vehicle, onUpdate }: { vehicle: Vehicle; onUpdate: () => void }) {
  const [images, setImages] = useState(
    vehicle.images.map((url, index) => ({
      id: `img-${index}`,
      url,
      order: index,
      hidden: false
    }))
  );

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedImages = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setImages(updatedImages);
  };

  const toggleImageVisibility = (imageId: string) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, hidden: !img.hidden } : img
    ));
  };

  const saveImageOrder = async () => {
    try {
      const orderedUrls = images
        .filter(img => !img.hidden)
        .sort((a, b) => a.order - b.order)
        .map(img => img.url);

      await fetch(`/api/admin/vehicles/${vehicle.id}/images`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: orderedUrls })
      });

      onUpdate();
    } catch (error) {
      console.error('Failed to save image order:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Image Management</h3>
        <Button onClick={saveImageOrder}>
          <Save className="h-4 w-4 mr-2" />
          Save Order
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="images">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {images.map((image, index) => (
                <Draggable key={image.id} draggableId={image.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center space-x-4 p-3 border rounded-lg ${
                        image.hidden ? 'bg-gray-100 opacity-50' : 'bg-white'
                      }`}
                    >
                      <div {...provided.dragHandleProps} className="cursor-move">
                        <DragHandleDots2Icon className="h-5 w-5 text-gray-400" />
                      </div>
                      
                      <img 
                        src={image.url} 
                        alt={`Vehicle ${index + 1}`}
                        className="w-16 h-12 object-cover rounded"
                      />
                      
                      <div className="flex-1">
                        <p className="text-sm font-medium">Image {index + 1}</p>
                        <p className="text-xs text-gray-500 truncate">{image.url}</p>
                      </div>
                      
                      <Badge variant={image.hidden ? "secondary" : "default"}>
                        {image.hidden ? "Hidden" : "Visible"}
                      </Badge>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleImageVisibility(image.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

function VehicleEditor({ vehicle, onSave }: { vehicle: Vehicle; onSave: () => void }) {
  const [editData, setEditData] = useState(vehicle);

  const handleSave = async () => {
    try {
      await fetch(`/api/admin/vehicles/${vehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      onSave();
    } catch (error) {
      console.error('Failed to save vehicle:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Title</Label>
          <Input
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          />
        </div>
        
        <div>
          <Label>Make</Label>
          <Input
            value={editData.make}
            onChange={(e) => setEditData({ ...editData, make: e.target.value })}
          />
        </div>
        
        <div>
          <Label>Model</Label>
          <Input
            value={editData.model}
            onChange={(e) => setEditData({ ...editData, model: e.target.value })}
          />
        </div>
        
        <div>
          <Label>Year</Label>
          <Input
            type="number"
            value={editData.year}
            onChange={(e) => setEditData({ ...editData, year: parseInt(e.target.value) })}
          />
        </div>
        
        <div>
          <Label>Price</Label>
          <Input
            type="number"
            value={editData.price}
            onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
          />
        </div>
        
        <div>
          <Label>Price AUD</Label>
          <Input
            type="number"
            value={editData.priceAUD}
            onChange={(e) => setEditData({ ...editData, priceAUD: parseFloat(e.target.value) })}
          />
        </div>
        
        <div>
          <Label>Mileage</Label>
          <Input
            value={editData.mileage}
            onChange={(e) => setEditData({ ...editData, mileage: e.target.value })}
          />
        </div>
        
        <div>
          <Label>Location</Label>
          <Input
            value={editData.location}
            onChange={(e) => setEditData({ ...editData, location: e.target.value })}
          />
        </div>
        
        <div>
          <Label>Transmission</Label>
          <Select 
            value={editData.transmission} 
            onValueChange={(value) => setEditData({ ...editData, transmission: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Manual">Manual</SelectItem>
              <SelectItem value="Automatic">Automatic</SelectItem>
              <SelectItem value="CVT">CVT</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Fuel Type</Label>
          <Select 
            value={editData.fuelType} 
            onValueChange={(value) => setEditData({ ...editData, fuelType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Petrol">Petrol</SelectItem>
              <SelectItem value="Diesel">Diesel</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
              <SelectItem value="Electric">Electric</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label>Description</Label>
        <Textarea
          value={editData.description}
          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          rows={4}
        />
      </div>
      
      <Button onClick={handleSave} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Save Changes
      </Button>
    </div>
  );
}

export default function SuperAdminPanel() {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  
  const queryClient = useQueryClient();

  const { data: vehicles, refetch } = useQuery<Vehicle[]>({
    queryKey: ['/api/admin/vehicles'],
    enabled: isAuthenticated,
  });

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const refreshData = async () => {
    try {
      await fetch('/api/refresh-market-data', { method: 'POST' });
      refetch();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Super Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="admin"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="admin123"
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
            <div className="text-sm text-gray-600 text-center">
              <p>Username: <code>admin</code></p>
              <p>Password: <code>admin123</code></p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Panel</h1>
            <div className="flex space-x-2">
              <Button onClick={refreshData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              <Button onClick={() => setIsAuthenticated(false)} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="vehicles">
          <TabsList>
            <TabsTrigger value="vehicles">Vehicle Management</TabsTrigger>
            <TabsTrigger value="images">Image Management</TabsTrigger>
            <TabsTrigger value="system">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Vehicle Listings ({vehicles?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehicles?.map((vehicle) => (
                    <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <img 
                            src={vehicle.images[0]} 
                            alt={vehicle.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{vehicle.title}</h3>
                            <p className="text-sm text-gray-500">{vehicle.make} {vehicle.model} {vehicle.year}</p>
                            <p className="text-sm font-medium">${vehicle.priceAUD.toLocaleString()} AUD</p>
                            <Badge variant="outline" className="mt-1">
                              <Camera className="h-3 w-3 mr-1" />
                              {vehicle.images.length} photos
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit Vehicle: {vehicle.title}</DialogTitle>
                              </DialogHeader>
                              <VehicleEditor 
                                vehicle={vehicle} 
                                onSave={() => refetch()} 
                              />
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Image className="h-4 w-4 mr-1" />
                                Images
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Manage Images: {vehicle.title}</DialogTitle>
                              </DialogHeader>
                              <ImageManager 
                                vehicle={vehicle} 
                                onUpdate={() => refetch()} 
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Global Image Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 text-center">
                    <Camera className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">{vehicles?.reduce((sum, v) => sum + v.images.length, 0) || 0}</div>
                    <div className="text-sm text-gray-600">Total Images</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <Eye className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">{vehicles?.filter(v => v.images.length >= 8).length || 0}</div>
                    <div className="text-sm text-gray-600">Complete Sets (8+ photos)</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <Settings className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <div className="text-2xl font-bold">Active</div>
                    <div className="text-sm text-gray-600">Image Filter</div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Data Refresh</h3>
                    <p className="text-sm text-gray-600 mb-3">Automatic refresh every 12 hours</p>
                    <Button onClick={refreshData} className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Manual Refresh
                    </Button>
                  </Card>
                  
                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Image Filtering</h3>
                    <p className="text-sm text-gray-600 mb-3">Remove promotional content automatically</p>
                    <Badge variant="secondary">Core sequences: 102-109, 202-209</Badge>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}