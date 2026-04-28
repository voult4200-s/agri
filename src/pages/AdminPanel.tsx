import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, LogOut, Trash2, Lock, Unlock, Ban, Eye, Edit2, Search,
  Activity, TrendingUp, AlertTriangle, CheckCircle, Clock, User,
  Shield, Database, BarChart3, Settings, X, Save, Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FarmerData {
  id: string;
  email: string;
  name: string;
  location: string;
  farmSize: number;
  status: "active" | "suspended" | "blocked" | "deleted";
  joinDate: string;
  lastActive: string;
  orders: number;
  revenue: number;
}

interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details: string;
  type: "login" | "order" | "update" | "delete" | "suspend" | "block";
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const { admin, adminLogout, isAdminAuthenticated } = useAdminAuth();
  const { toast } = useToast();

  const [farmers, setFarmers] = useState<FarmerData[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerData | null>(null);
  const [editingFarmer, setEditingFarmer] = useState<FarmerData | null>(null);

  // Confirmation dialog states
  const [confirmAction, setConfirmAction] = useState<{
    action: "delete" | "suspend" | "block" | "unblock" | null;
    farmer: FarmerData | null;
  }>({ action: null, farmer: null });

  // Initialize demo data
  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate("/admin-login");
      return;
    }

    const storedFarmers = localStorage.getItem("adminFarmers");
    const storedLogs = localStorage.getItem("adminActivityLogs");

    if (!storedFarmers) {
      const demoFarmers: FarmerData[] = [
        {
          id: "FM001",
          email: "farmer1@email.com",
          name: "Rajesh Kumar",
          location: "Punjab, Ludhiana",
          farmSize: 25,
          status: "active",
          joinDate: "2025-06-15",
          lastActive: "2026-04-28",
          orders: 12,
          revenue: 245000,
        },
        {
          id: "FM002",
          email: "farmer2@email.com",
          name: "Priya Singh",
          location: "Haryana, Karnal",
          farmSize: 15,
          status: "active",
          joinDate: "2025-08-20",
          lastActive: "2026-04-27",
          orders: 8,
          revenue: 156000,
        },
        {
          id: "FM003",
          email: "farmer3@email.com",
          name: "Amit Patel",
          location: "Gujarat, Anand",
          farmSize: 30,
          status: "suspended",
          joinDate: "2025-05-10",
          lastActive: "2026-04-15",
          orders: 20,
          revenue: 450000,
        },
        {
          id: "FM004",
          email: "farmer4@email.com",
          name: "Kavita Sharma",
          location: "Maharashtra, Akola",
          farmSize: 10,
          status: "active",
          joinDate: "2025-10-12",
          lastActive: "2026-04-28",
          orders: 5,
          revenue: 78000,
        },
        {
          id: "FM005",
          email: "farmer5@email.com",
          name: "Vikram Singh",
          location: "Rajasthan, Jaipur",
          farmSize: 20,
          status: "blocked",
          joinDate: "2025-07-05",
          lastActive: "2026-02-10",
          orders: 15,
          revenue: 320000,
        },
      ];
      localStorage.setItem("adminFarmers", JSON.stringify(demoFarmers));
      setFarmers(demoFarmers);
    } else {
      setFarmers(JSON.parse(storedFarmers));
    }

    if (!storedLogs) {
      const demoLogs: ActivityLog[] = [
        {
          id: "LOG001",
          userId: "FM001",
          action: "User placed order",
          timestamp: "2026-04-28 10:30 AM",
          details: "Order ID: ORD-2026-001",
          type: "order",
        },
        {
          id: "LOG002",
          userId: "FM003",
          action: "Account suspended",
          timestamp: "2026-04-27 02:15 PM",
          details: "Reason: Non-payment of dues",
          type: "suspend",
        },
        {
          id: "LOG003",
          userId: "FM002",
          action: "Profile updated",
          timestamp: "2026-04-27 11:45 AM",
          details: "Changed farm size from 10 to 15 acres",
          type: "update",
        },
      ];
      localStorage.setItem("adminActivityLogs", JSON.stringify(demoLogs));
      setActivityLogs(demoLogs);
    } else {
      setActivityLogs(JSON.parse(storedLogs));
    }
  }, [isAdminAuthenticated, navigate]);

  const filteredFarmers = farmers.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Confirmation handlers that trigger dialog
  const confirmSuspendFarmer = (farmer: FarmerData) => {
    setConfirmAction({ action: "suspend", farmer });
  };

  const confirmBlockFarmer = (farmer: FarmerData) => {
    setConfirmAction({ action: "block", farmer });
  };

  const confirmDeleteFarmer = (farmer: FarmerData) => {
    setConfirmAction({ action: "delete", farmer });
  };

  const confirmUnblockFarmer = (farmer: FarmerData) => {
    setConfirmAction({ action: "unblock", farmer });
  };

  // Actual action handlers
  const handleSuspendFarmer = (farmer: FarmerData) => {
    const updated = farmers.map((f) => (f.id === farmer.id ? { ...f, status: "suspended" as const } : f));
    setFarmers(updated);
    localStorage.setItem("adminFarmers", JSON.stringify(updated));

    const newLog: ActivityLog = {
      id: `LOG${Date.now()}`,
      userId: farmer.id,
      action: "Account suspended",
      timestamp: new Date().toLocaleString(),
      details: `Suspended by admin - ${farmer.name}`,
      type: "suspend",
    };
    const updatedLogs = [...activityLogs, newLog];
    setActivityLogs(updatedLogs);
    localStorage.setItem("adminActivityLogs", JSON.stringify(updatedLogs));

    setSelectedFarmer(updated.find(f => f.id === farmer.id) || null);
    setConfirmAction({ action: null, farmer: null });
    toast({ title: "Suspended", description: `${farmer.name} account has been suspended`, variant: "default" });
  };

  const handleBlockFarmer = (farmer: FarmerData) => {
    const updated = farmers.map((f) => (f.id === farmer.id ? { ...f, status: "blocked" as const } : f));
    setFarmers(updated);
    localStorage.setItem("adminFarmers", JSON.stringify(updated));

    const newLog: ActivityLog = {
      id: `LOG${Date.now()}`,
      userId: farmer.id,
      action: "Account blocked",
      timestamp: new Date().toLocaleString(),
      details: `Blocked by admin - ${farmer.name}`,
      type: "block",
    };
    const updatedLogs = [...activityLogs, newLog];
    setActivityLogs(updatedLogs);
    localStorage.setItem("adminActivityLogs", JSON.stringify(updatedLogs));

    setSelectedFarmer(updated.find(f => f.id === farmer.id) || null);
    setConfirmAction({ action: null, farmer: null });
    toast({ title: "Blocked", description: `${farmer.name} account has been blocked`, variant: "destructive" });
  };

  const handleUnblockFarmer = (farmer: FarmerData) => {
    const updated = farmers.map((f) => (f.id === farmer.id ? { ...f, status: "active" as const } : f));
    setFarmers(updated);
    localStorage.setItem("adminFarmers", JSON.stringify(updated));

    const newLog: ActivityLog = {
      id: `LOG${Date.now()}`,
      userId: farmer.id,
      action: "Account activated",
      timestamp: new Date().toLocaleString(),
      details: `Activated by admin - ${farmer.name}`,
      type: "update",
    };
    const updatedLogs = [...activityLogs, newLog];
    setActivityLogs(updatedLogs);
    localStorage.setItem("adminActivityLogs", JSON.stringify(updatedLogs));

    setSelectedFarmer(updated.find(f => f.id === farmer.id) || null);
    setConfirmAction({ action: null, farmer: null });
    toast({ title: "Activated", description: `${farmer.name} account has been activated` });
  };

  const handleDeleteFarmer = (farmer: FarmerData) => {
    const updated = farmers.map((f) => (f.id === farmer.id ? { ...f, status: "deleted" as const } : f));
    setFarmers(updated);
    localStorage.setItem("adminFarmers", JSON.stringify(updated));

    const newLog: ActivityLog = {
      id: `LOG${Date.now()}`,
      userId: farmer.id,
      action: "Account deleted",
      timestamp: new Date().toLocaleString(),
      details: `Deleted by admin - ${farmer.name}`,
      type: "delete",
    };
    const updatedLogs = [...activityLogs, newLog];
    setActivityLogs(updatedLogs);
    localStorage.setItem("adminActivityLogs", JSON.stringify(updatedLogs));

    setSelectedFarmer(null);
    setConfirmAction({ action: null, farmer: null });
    toast({ title: "Deleted", description: `${farmer.name} account has been permanently deleted`, variant: "destructive" });
  };

  const handleSaveEdit = () => {
    if (!editingFarmer) return;

    const updated = farmers.map((f) => (f.id === editingFarmer.id ? editingFarmer : f));
    setFarmers(updated);
    localStorage.setItem("adminFarmers", JSON.stringify(updated));

    const newLog: ActivityLog = {
      id: `LOG${Date.now()}`,
      userId: editingFarmer.id,
      action: "Account information updated",
      timestamp: new Date().toLocaleString(),
      details: `Updated by admin - ${editingFarmer.name}`,
      type: "update",
    };
    const updatedLogs = [...activityLogs, newLog];
    setActivityLogs(updatedLogs);
    localStorage.setItem("adminActivityLogs", JSON.stringify(updatedLogs));

    setSelectedFarmer(editingFarmer);
    setEditingFarmer(null);
    toast({ title: "Saved", description: `${editingFarmer.name}'s information has been updated` });
  };

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/auth");
    toast({ title: "Logged out", description: "You have been logged out" });
  };

  const stats = [
    { label: "Total Farmers", value: farmers.filter((f) => f.status !== "deleted").length, icon: Users, color: "text-blue-600" },
    { label: "Active Users", value: farmers.filter((f) => f.status === "active").length, icon: CheckCircle, color: "text-green-600" },
    { label: "Suspended", value: farmers.filter((f) => f.status === "suspended").length, icon: AlertTriangle, color: "text-yellow-600" },
    { label: "Blocked", value: farmers.filter((f) => f.status === "blocked").length, icon: Ban, color: "text-red-600" },
  ];

  const totalRevenue = farmers.reduce((sum, f) => sum + f.revenue, 0);
  const totalOrders = farmers.reduce((sum, f) => sum + f.orders, 0);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Shield size={32} />
              <div>
                <h1 className="text-2xl font-bold">System Admin Panel</h1>
                <p className="text-green-100 text-sm">Full Platform Control & Management</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="destructive" className="flex gap-2">
              <LogOut size={18} />
              Logout
            </Button>
            <Button onClick={() => navigate("/admin/super-dashboard")} className="flex gap-2 bg-blue-600 hover:bg-blue-700">
              <Zap size={18} />
              Super Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                    <stat.icon size={40} className={`${stat.color} opacity-50`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Revenue Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} /> Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">From all farmers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} /> Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{totalOrders}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Across platform</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database size={20} /> System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-600">98%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="farmers" className="bg-white dark:bg-slate-800 rounded-lg shadow">
          <TabsList className="grid w-full grid-cols-3 rounded-t-lg">
            <TabsTrigger value="farmers" className="flex gap-2">
              <Users size={18} /> Farmer Management
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex gap-2">
              <Activity size={18} /> Activity Logs
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex gap-2">
              <Settings size={18} /> Settings
            </TabsTrigger>
          </TabsList>

          {/* Farmer Management Tab */}
          <TabsContent value="farmers" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-4">Farmer Database</h3>

              <div className="mb-4">
                <Input
                  placeholder="Search farmer by name, email, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                  icon={<Search size={18} />}
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {filteredFarmers.map((farmer, idx) => (
                    <motion.div
                      key={farmer.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedFarmer(farmer)}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                  {farmer.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 dark:text-white">{farmer.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{farmer.email}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                                <div>
                                  <p className="text-gray-600 dark:text-gray-400">Location</p>
                                  <p className="font-semibold text-gray-900 dark:text-white">{farmer.location}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 dark:text-gray-400">Farm Size</p>
                                  <p className="font-semibold text-gray-900 dark:text-white">{farmer.farmSize} acres</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 dark:text-gray-400">Orders</p>
                                  <p className="font-semibold text-gray-900 dark:text-white">{farmer.orders}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 dark:text-gray-400">Revenue</p>
                                  <p className="font-semibold text-green-600">₹{farmer.revenue.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <Badge
                                variant={
                                  farmer.status === "active"
                                    ? "default"
                                    : farmer.status === "suspended"
                                      ? "secondary"
                                      : farmer.status === "blocked"
                                        ? "destructive"
                                        : "outline"
                                }
                              >
                                {farmer.status.toUpperCase()}
                              </Badge>
                              <div className="flex flex-col gap-1 text-xs">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedFarmer(farmer)}
                                  className="h-7"
                                >
                                  <Eye size={14} className="mr-1" /> View
                                </Button>
                                {farmer.status !== "active" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => confirmUnblockFarmer(farmer)}
                                    className="h-7 text-green-600"
                                  >
                                    <Unlock size={14} className="mr-1" /> Unblock
                                  </Button>
                                )}
                                {farmer.status === "active" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => confirmSuspendFarmer(farmer)}
                                      className="h-7 text-yellow-600"
                                    >
                                      <AlertTriangle size={14} className="mr-1" /> Suspend
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => confirmBlockFarmer(farmer)}
                                      className="h-7 text-red-600"
                                    >
                                      <Ban size={14} className="mr-1" /> Block
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => confirmDeleteFarmer(farmer)}
                                  className="h-7"
                                >
                                  <Trash2 size={14} className="mr-1" /> Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="activity" className="p-6 space-y-4">
            <h3 className="text-lg font-bold mb-4">System Activity Logs</h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activityLogs.map((log, idx) => (
                <motion.div key={log.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-lg ${log.type === "suspend" ? "bg-yellow-100 dark:bg-yellow-950" : log.type === "block" ? "bg-red-100 dark:bg-red-950" : log.type === "delete" ? "bg-red-100 dark:bg-red-950" : "bg-blue-100 dark:bg-blue-950"}`}
                        >
                          <Activity
                            size={20}
                            className={
                              log.type === "suspend" ? "text-yellow-600" : log.type === "block" ? "text-red-600" : log.type === "delete" ? "text-red-600" : "text-blue-600"
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 dark:text-white">{log.action}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{log.details}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-2">
                            <Clock size={12} />
                            {log.timestamp}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="p-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Manage platform configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="font-bold text-blue-900 dark:text-blue-100 mb-2">📊 Database Statistics</p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">Total Farmers: {farmers.length}</p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">Active Users: {farmers.filter((f) => f.status === "active").length}</p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">Total Activity Logs: {activityLogs.length}</p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">Total Platform Revenue: ₹{totalRevenue.toLocaleString()}</p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="font-bold text-green-900 dark:text-green-100 mb-2">✓ System Status</p>
                  <p className="text-sm text-green-800 dark:text-green-200">✓ All systems operational</p>
                  <p className="text-sm text-green-800 dark:text-green-200">✓ Database connection: Healthy</p>
                  <p className="text-sm text-green-800 dark:text-green-200">✓ LocalStorage: {(Math.random() * 100).toFixed(1)}% used</p>
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700">Export Farmer Data</Button>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Generate Activity Report</Button>
                <Button className="w-full bg-red-600 hover:bg-red-700">Clear All Logs</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Farmer Details Modal */}
        <Dialog open={!!selectedFarmer} onOpenChange={(open) => { if (!open) { setSelectedFarmer(null); setEditingFarmer(null); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedFarmer && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {selectedFarmer.name.charAt(0)}
                      </div>
                      <div>
                        <DialogTitle>{selectedFarmer.name}</DialogTitle>
                        <DialogDescription>{selectedFarmer.email}</DialogDescription>
                      </div>
                    </div>
                    <Badge
                      variant={
                        selectedFarmer.status === "active"
                          ? "default"
                          : selectedFarmer.status === "suspended"
                            ? "secondary"
                            : selectedFarmer.status === "blocked"
                              ? "destructive"
                              : "outline"
                      }
                      className="text-lg px-3 py-1"
                    >
                      {selectedFarmer.status.toUpperCase()}
                    </Badge>
                  </div>
                </DialogHeader>

                {/* View Mode */}
                {!editingFarmer && (
                  <div className="space-y-6 py-4">
                    {/* Personal Information */}
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <User size={20} /> Personal Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedFarmer.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Email Address</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedFarmer.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedFarmer.location}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Farm Size</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedFarmer.farmSize} acres</p>
                        </div>
                      </div>
                    </div>

                    {/* Account Statistics */}
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <BarChart3 size={20} /> Account Statistics
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">{selectedFarmer.orders}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">₹{selectedFarmer.revenue.toLocaleString()}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-lg font-semibold">{selectedFarmer.joinDate}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Join Date</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-lg font-semibold">{selectedFarmer.lastActive}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Last Active</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Account ID */}
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Account ID</p>
                      <p className="font-mono font-bold text-blue-900 dark:text-blue-100">{selectedFarmer.id}</p>
                    </div>
                  </div>
                )}

                {/* Edit Mode */}
                {editingFarmer && (
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input
                        value={editingFarmer.name}
                        onChange={(e) => setEditingFarmer({ ...editingFarmer, name: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Email Address</Label>
                      <Input
                        value={editingFarmer.email}
                        onChange={(e) => setEditingFarmer({ ...editingFarmer, email: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={editingFarmer.location}
                        onChange={(e) => setEditingFarmer({ ...editingFarmer, location: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Farm Size (acres)</Label>
                      <Input
                        type="number"
                        value={editingFarmer.farmSize}
                        onChange={(e) => setEditingFarmer({ ...editingFarmer, farmSize: parseInt(e.target.value) })}
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}

                <DialogFooter className="flex gap-2 justify-between">
                  <div className="flex gap-2">
                    {!editingFarmer && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setEditingFarmer(selectedFarmer)}
                          className="gap-2"
                        >
                          <Edit2 size={16} /> Edit
                        </Button>
                        {selectedFarmer.status !== "active" && (
                          <Button
                            variant="outline"
                            onClick={() => confirmUnblockFarmer(selectedFarmer)}
                            className="gap-2 text-green-600 hover:text-green-700"
                          >
                            <Unlock size={16} /> Activate
                          </Button>
                        )}
                        {selectedFarmer.status === "active" && (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => confirmSuspendFarmer(selectedFarmer)}
                              className="gap-2 text-yellow-600 hover:text-yellow-700"
                            >
                              <AlertTriangle size={16} /> Suspend
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => confirmBlockFarmer(selectedFarmer)}
                              className="gap-2 text-red-600 hover:text-red-700"
                            >
                              <Ban size={16} /> Block
                            </Button>
                          </>
                        )}
                        <Button
                          variant="destructive"
                          onClick={() => confirmDeleteFarmer(selectedFarmer)}
                          className="gap-2"
                        >
                          <Trash2 size={16} /> Delete
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {editingFarmer && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setEditingFarmer(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveEdit}
                          className="gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <Save size={16} /> Save Changes
                        </Button>
                      </>
                    )}
                    {!editingFarmer && (
                      <Button
                        variant="outline"
                        onClick={() => setSelectedFarmer(null)}
                      >
                        Close
                      </Button>
                    )}
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Confirmation Alert Dialog */}
        <AlertDialog open={!!confirmAction.farmer} onOpenChange={(open) => { if (!open) setConfirmAction({ action: null, farmer: null }); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmAction.action === "delete" && "Delete Account Permanently?"}
                {confirmAction.action === "suspend" && "Suspend Account?"}
                {confirmAction.action === "block" && "Block Account?"}
                {confirmAction.action === "unblock" && "Activate Account?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmAction.action === "delete" && (
                  <>
                    <p>This will permanently delete {confirmAction.farmer?.name}'s account and all associated data.</p>
                    <p className="text-red-600 font-semibold mt-2">This action cannot be undone.</p>
                  </>
                )}
                {confirmAction.action === "suspend" && (
                  <p>{confirmAction.farmer?.name} will not be able to access their account until reactivated.</p>
                )}
                {confirmAction.action === "block" && (
                  <p>{confirmAction.farmer?.name}'s account will be blocked and flagged for suspicious activity.</p>
                )}
                {confirmAction.action === "unblock" && (
                  <p>This will reactivate {confirmAction.farmer?.name}'s account and restore full access.</p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (confirmAction.farmer) {
                    switch (confirmAction.action) {
                      case "delete":
                        handleDeleteFarmer(confirmAction.farmer);
                        break;
                      case "suspend":
                        handleSuspendFarmer(confirmAction.farmer);
                        break;
                      case "block":
                        handleBlockFarmer(confirmAction.farmer);
                        break;
                      case "unblock":
                        handleUnblockFarmer(confirmAction.farmer);
                        break;
                    }
                  }
                }}
                className={confirmAction.action === "delete" ? "bg-red-600 hover:bg-red-700" : ""}
              >
                {confirmAction.action === "delete" && "Delete Permanently"}
                {confirmAction.action === "suspend" && "Suspend Account"}
                {confirmAction.action === "block" && "Block Account"}
                {confirmAction.action === "unblock" && "Activate Account"}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
