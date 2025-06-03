import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Phone, Mail, User, Car, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: number;
  name: string;
  email: string;
  phone: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  vehicleDetails?: string;
  message?: string;
  status: string;
  createdAt: string;
}

export default function BookingAdmin() {
  const { toast } = useToast();
  
  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/bookings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/bookings");
      return await response.json();
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/bookings/${id}/status`, { status });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Status Updated",
        description: "Booking status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update booking status.",
        variant: "destructive",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Booking Management</h1>
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Booking Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage consultation bookings and appointments
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            Refresh
          </Button>
        </div>

        <div className="grid gap-6">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No bookings yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  When customers book consultations, they'll appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking: Booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 dark:bg-gray-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {booking.name}
                      </CardTitle>
                      <CardDescription>
                        Booking #{booking.id} • {booking.service}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{booking.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{booking.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{booking.preferredDate}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{booking.preferredTime}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {booking.vehicleDetails && (
                        <div className="flex items-start gap-3">
                          <Car className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div className="text-sm">
                            <span className="font-medium">Vehicle Details:</span>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              {booking.vehicleDetails}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {booking.message && (
                        <div className="flex items-start gap-3">
                          <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div className="text-sm">
                            <span className="font-medium">Message:</span>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              {booking.message}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex gap-2 flex-wrap">
                    {booking.status !== "confirmed" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "confirmed" })}
                        disabled={updateStatusMutation.isPending}
                      >
                        Confirm
                      </Button>
                    )}
                    
                    {booking.status !== "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "pending" })}
                        disabled={updateStatusMutation.isPending}
                      >
                        Set Pending
                      </Button>
                    )}
                    
                    {booking.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "completed" })}
                        disabled={updateStatusMutation.isPending}
                      >
                        Mark Complete
                      </Button>
                    )}
                    
                    {booking.status !== "cancelled" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "cancelled" })}
                        disabled={updateStatusMutation.isPending}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}