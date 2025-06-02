import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, Users, Shield, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  department?: string;
  jobTitle?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  canViewFinancials: boolean;
  canManageUsers: boolean;
  canExportData: boolean;
  canManageAffiliates: boolean;
}

interface AdminPermissions {
  canViewFinancials: boolean;
  canManageUsers: boolean;
  canExportData: boolean;
  canManageAffiliates: boolean;
  canViewAnalytics: boolean;
  canManageSystem: boolean;
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "viewer",
    department: "",
    jobTitle: ""
  });

  useEffect(() => {
    // Get current admin user and permissions
    const adminUser = localStorage.getItem('admin_user');
    const adminPermissions = localStorage.getItem('admin_permissions');
    
    if (adminUser) setCurrentUser(JSON.parse(adminUser));
    if (adminPermissions) setPermissions(JSON.parse(adminPermissions));

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiRequest("GET", "/api/admin/users");
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError("Failed to fetch admin users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError("");

    try {
      const response = await apiRequest("POST", "/api/admin/users", formData);
      const data = await response.json();

      if (response.ok) {
        setSuccess("Admin user created successfully");
        setShowCreateDialog(false);
        setFormData({
          username: "",
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          role: "viewer",
          department: "",
          jobTitle: ""
        });
        fetchUsers();
      } else {
        setError(data.error || "Failed to create user");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-600 text-white';
      case 'manager': return 'bg-purple-600 text-white';
      case 'sales': return 'bg-green-600 text-white';
      case 'marketing': return 'bg-blue-600 text-white';
      case 'finance': return 'bg-yellow-600 text-black';
      default: return 'bg-gray-600 text-white';
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!permissions?.canManageUsers && currentUser?.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800 max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400">You don't have permission to manage admin users.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin User Management</h1>
            <p className="text-gray-400">Manage admin accounts and role-based permissions</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700 text-black font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Create Admin User
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Admin User</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Create a new admin account with specific role permissions
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="sales">Sales Team</SelectItem>
                        <SelectItem value="marketing">Marketing Team</SelectItem>
                        <SelectItem value="finance">Finance Team</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        {currentUser?.role === 'super_admin' && (
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-700"
                        placeholder="e.g. Sales, Marketing"
                      />
                    </div>
                    <div>
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-700"
                        placeholder="e.g. Sales Manager"
                      />
                    </div>
                  </div>
                </div>
                
                {error && (
                  <Alert variant="destructive" className="bg-red-900/20 border-red-900 mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    className="bg-amber-600 hover:bg-amber-700 text-black"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create User"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {success && (
          <Alert className="bg-green-900/20 border-green-900 text-green-200 mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="h-5 w-5 mr-2 text-amber-400" />
              Admin Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Role</TableHead>
                    <TableHead className="text-gray-300">Department</TableHead>
                    <TableHead className="text-gray-300">Permissions</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Last Login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-gray-800">
                      <TableCell>
                        <div>
                          <div className="font-medium text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                          <div className="text-xs text-gray-500">@{user.username}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {formatRole(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-300">
                          {user.department || 'Not specified'}
                        </div>
                        {user.jobTitle && (
                          <div className="text-xs text-gray-500">{user.jobTitle}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.canViewFinancials && (
                            <Badge variant="outline" className="text-xs border-green-600 text-green-400">
                              Financials
                            </Badge>
                          )}
                          {user.canManageUsers && (
                            <Badge variant="outline" className="text-xs border-blue-600 text-blue-400">
                              Users
                            </Badge>
                          )}
                          {user.canExportData && (
                            <Badge variant="outline" className="text-xs border-purple-600 text-purple-400">
                              Export
                            </Badge>
                          )}
                          {user.canManageAffiliates && (
                            <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-400">
                              Affiliates
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-red-600 text-white">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}