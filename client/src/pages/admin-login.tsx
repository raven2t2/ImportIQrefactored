import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, Users, BarChart3, Building2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiRequest("POST", "/api/admin/login", formData);
      const data = await response.json();

      if (data.success) {
        // Store user info and redirect to admin dashboard
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        localStorage.setItem('admin_permissions', JSON.stringify(data.permissions));
        window.location.href = '/secure-admin-panel-iq2025';
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="space-y-8 text-center lg:text-left">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
              ImportIQ
              <span className="text-amber-400"> Admin</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Enterprise-grade analytics and user management for Australia's premier vehicle import intelligence platform
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
              <BarChart3 className="h-8 w-8 text-amber-400 mb-3" />
              <h3 className="font-semibold text-white mb-2">Advanced Analytics</h3>
              <p className="text-gray-400 text-sm">Real-time business intelligence and AI-powered insights</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
              <Users className="h-8 w-8 text-amber-400 mb-3" />
              <h3 className="font-semibold text-white mb-2">User Management</h3>
              <p className="text-gray-400 text-sm">Role-based access control with team permissions</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
              <Shield className="h-8 w-8 text-amber-400 mb-3" />
              <h3 className="font-semibold text-white mb-2">Secure Access</h3>
              <p className="text-gray-400 text-sm">Enterprise security with session management</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
              <Building2 className="h-8 w-8 text-amber-400 mb-3" />
              <h3 className="font-semibold text-white mb-2">Scale Ready</h3>
              <p className="text-gray-400 text-sm">Built for enterprise teams and departments</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md bg-gray-900/90 border-gray-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">Admin Access</CardTitle>
              <CardDescription className="text-gray-400">
                Sign in to access the administrative dashboard
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-200">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-200">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-amber-400"
                    placeholder="Enter your username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-200">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-amber-400"
                    placeholder="Enter your password"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-black font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}