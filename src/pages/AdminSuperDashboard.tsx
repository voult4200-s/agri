import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, LogOut, Trash2, Lock, Unlock, Ban, Eye, Edit2, Search,
  ShoppingCart, Warehouse, MessageCircle, Store, Activity, TrendingUp,
  AlertTriangle, CheckCircle, Clock, User, Shield, Database, BarChart3,
  Settings, X, Save, Plus, Download, Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BrandLogo from "@/components/BrandLogo";

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

interface OrderData {
  id: string;
  farmerId: string;
  farmerName: string;
  item: string;
  quantity: number;
  amount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  date: string;
}

interface StorageData {
  id: string;
  farmerId: string;
  farmerName: string;
  item: string;
  quantity: number;
  amount: number;
  status: "active" | "pending" | "completed";
  date: string;
}

interface CommunityPost {
  id: string;
  farmerId: string;
  farmerName: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  date: string;
}

interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details: string;
  type: "login" | "order" | "update" | "delete" | "suspend" | "block";
}

export default function AdminSuperDashboard() {
  const navigate = useNavigate();
  const { admin, adminLogout, isAdminAuthenticated } = useAdminAuth();
  const { toast } = useToast();

  const [farmers, setFarmers] = useState<FarmerData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [storage, setStorage] = useState<StorageData[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerData | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<StorageData | null>(null);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ type: string; id: string; name: string } | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderData | null>(null);
  const [editingStorage, setEditingStorage] = useState<StorageData | null>(null);

  // Initialize demo data
  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate("/admin/auth");
      return;
    }

    initializeData();
  }, [isAdminAuthenticated, navigate]);

  const initializeData = () => {
    // Demo farmers
    const demoFarmers: FarmerData[] = [
      {
        id: "FM001",
        email: "rajesh@email.com",
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
        email: "priya@email.com",
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
        email: "amit@email.com",
        name: "Amit Patel",
        location: "Gujarat, Anand",
        farmSize: 30,
        status: "suspended",
        joinDate: "2025-05-10",
        lastActive: "2026-04-15",
        orders: 20,
        revenue: 450000,
      },
    ];

    // Demo orders
    const demoOrders: OrderData[] = [
      {
        id: "ORD001",
        farmerId: "FM001",
        farmerName: "Rajesh Kumar",
        item: "Wheat Seeds",
        quantity: 50,
        amount: 12500,
        status: "delivered",
        date: "2026-04-20",
      },
      {
        id: "ORD002",
        farmerId: "FM002",
        farmerName: "Priya Singh",
        item: "Fertilizer NPK",
        quantity: 100,
        amount: 8500,
        status: "shipped",
        date: "2026-04-25",
      },
      {
        id: "ORD003",
        farmerId: "FM001",
        farmerName: "Rajesh Kumar",
        item: "Pesticide",
        quantity: 25,
        amount: 5600,
        status: "pending",
        date: "2026-04-28",
      },
      {
        id: "ORD004",
        farmerId: "FM003",
        farmerName: "Amit Patel",
        item: "Hybrid Maize",
        quantity: 75,
        amount: 22500,
        status: "confirmed",
        date: "2026-04-27",
      },
    ];

    // Demo storage
    const demoStorage: StorageData[] = [
      {
        id: "STG001",
        farmerId: "FM001",
        farmerName: "Rajesh Kumar",
        item: "Tomatoes",
        quantity: 500,
        amount: 4500,
        status: "active",
        date: "2026-04-21",
      },
      {
        id: "STG002",
        farmerId: "FM002",
        farmerName: "Priya Singh",
        item: "Potatoes",
        quantity: 1000,
        amount: 8000,
        status: "completed",
        date: "2026-04-10",
      },
      {
        id: "STG003",
        farmerId: "FM003",
        farmerName: "Amit Patel",
        item: "Onions",
        quantity: 800,
        amount: 6400,
        status: "active",
        date: "2026-04-15",
      },
    ];

    // Demo community posts
    const demoPosts: CommunityPost[] = [
      {
        id: "POST001",
        farmerId: "FM001",
        farmerName: "Rajesh Kumar",
        title: "Best practices for wheat farming",
        content: "High-quality wheat requires proper soil preparation...",
        likes: 45,
        comments: 12,
        date: "2026-04-26",
      },
      {
        id: "POST002",
        farmerId: "FM002",
        farmerName: "Priya Singh",
        title: "Monsoon preparation tips",
        content: "Getting ready for the monsoon season is crucial...",
        likes: 38,
        comments: 8,
        date: "2026-04-24",
      },
      {
        id: "POST003",
        farmerId: "FM003",
        farmerName: "Amit Patel",
        title: "Organic farming experience",
        content: "Sharing my 10 years of organic farming journey...",
        likes: 67,
        comments: 23,
        date: "2026-04-22",
      },
    ];

    setFarmers(demoFarmers);
    setOrders(demoOrders);
    setStorage(demoStorage);
    setCommunityPosts(demoPosts);
  };

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/auth");
    toast({ title: "Logged out", description: "You have been logged out" });
  };

  const logActivity = (action: string, details: string, type: ActivityLog["type"]) => {
    const newLog: ActivityLog = {
      id: `LOG${Date.now()}`,
      userId: admin?.email || "admin",
      action,
      timestamp: new Date().toLocaleString(),
      details,
      type,
    };
    setActivityLogs((prev) => [...prev, newLog]);
  };

  const handleDeleteOrder = (order: OrderData) => {
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    logActivity("Order deleted", `Deleted order ${order.id} from ${order.farmerName}`, "delete");
    toast({ title: "Deleted", description: `Order ${order.id} has been deleted` });
  };

  const handleUpdateOrder = (order: OrderData, updates: Partial<OrderData>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, ...updates } : o))
    );
    logActivity("Order updated", `Updated order ${order.id}`, "update");
    toast({ title: "Updated", description: `Order ${order.id} has been updated` });
  };

  const handleDeleteStorage = (storage: StorageData) => {
    setStorage((prev) => prev.filter((s) => s.id !== storage.id));
    logActivity("Storage deleted", `Deleted storage ${storage.id} from ${storage.farmerName}`, "delete");
    toast({ title: "Deleted", description: `Storage booking has been deleted` });
  };

  const handleUpdateStorage = (storage: StorageData, updates: Partial<StorageData>) => {
    setStorage((prev) =>
      prev.map((s) => (s.id === storage.id ? { ...s, ...updates } : s))
    );
    logActivity("Storage updated", `Updated storage ${storage.id}`, "update");
    toast({ title: "Updated", description: `Storage booking has been updated` });
  };

  const handleDeletePost = (post: CommunityPost) => {
    setCommunityPosts((prev) => prev.filter((p) => p.id !== post.id));
    logActivity("Post deleted", `Deleted community post from ${post.farmerName}`, "delete");
    toast({ title: "Deleted", description: "Community post has been deleted" });
  };

  const filteredFarmers = farmers.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter((o) =>
    o.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStorage = storage.filter((s) =>
    s.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPosts = communityPosts.filter((p) =>
    p.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <div>
              <h1 className="font-bold text-xl text-foreground">Admin Super Dashboard</h1>
              <p className="text-sm text-muted-foreground">Complete System Management</p>
            </div>
          </div>
          <Button variant="destructive" onClick={handleLogout} className="gap-2">
            <LogOut size={18} /> Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="mx-auto mb-2 text-blue-600" size={28} />
                <p className="text-3xl font-bold text-foreground">{farmers.length}</p>
                <p className="text-sm text-muted-foreground">Total Farmers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <ShoppingCart className="mx-auto mb-2 text-green-600" size={28} />
                <p className="text-3xl font-bold text-foreground">{orders.length}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Warehouse className="mx-auto mb-2 text-orange-600" size={28} />
                <p className="text-3xl font-bold text-foreground">{storage.length}</p>
                <p className="text-sm text-muted-foreground">Storage Bookings</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <MessageCircle className="mx-auto mb-2 text-purple-600" size={28} />
                <p className="text-3xl font-bold text-foreground">{communityPosts.length}</p>
                <p className="text-sm text-muted-foreground">Community Posts</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search farmers, orders, posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="farmers" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="farmers" className="gap-2">
              <Users size={18} /> Farmers
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart size={18} /> Orders
            </TabsTrigger>
            <TabsTrigger value="storage" className="gap-2">
              <Warehouse size={18} /> Storage
            </TabsTrigger>
            <TabsTrigger value="community" className="gap-2">
              <MessageCircle size={18} /> Community
            </TabsTrigger>
          </TabsList>

          {/* Farmers Tab */}
          <TabsContent value="farmers" className="space-y-4 mt-6">
            <div className="space-y-3">
              {filteredFarmers.map((farmer, idx) => (
                <motion.div key={farmer.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
                          <div className="grid grid-cols-4 gap-2 text-sm mt-3">
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Location</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{farmer.location}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Farm Size</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{farmer.farmSize}ac</p>
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
                          <Badge variant={farmer.status === "active" ? "default" : farmer.status === "suspended" ? "secondary" : "destructive"}>
                            {farmer.status.toUpperCase()}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => setSelectedFarmer(farmer)} className="h-7">
                            <Eye size={14} className="mr-1" /> View
                          </Button>
                          <Button size="sm" variant="destructive" className="h-7">
                            <Trash2 size={14} className="mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4 mt-6">
            <div className="space-y-3">
              {filteredOrders.map((order, idx) => (
                <motion.div key={order.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <ShoppingCart size={20} className="text-blue-600" />
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">{order.item}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{order.id} • {order.farmerName}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-sm mt-3">
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Quantity</p>
                              <p className="font-semibold">{order.quantity} units</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Amount</p>
                              <p className="font-semibold text-green-600">₹{order.amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Date</p>
                              <p className="font-semibold">{order.date}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Status</p>
                              <Badge variant={order.status === "delivered" ? "default" : order.status === "pending" ? "secondary" : "outline"}>
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)} className="h-7">
                            <Edit2 size={14} /> Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setDeleteConfirmation({ type: "order", id: order.id, name: order.item })} className="h-7">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage" className="space-y-4 mt-6">
            <div className="space-y-3">
              {filteredStorage.map((item, idx) => (
                <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Warehouse size={20} className="text-orange-600" />
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">{item.item}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{item.id} • {item.farmerName}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-sm mt-3">
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Quantity</p>
                              <p className="font-semibold">{item.quantity} kg</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Amount</p>
                              <p className="font-semibold text-green-600">₹{item.amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Date</p>
                              <p className="font-semibold">{item.date}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Status</p>
                              <Badge variant={item.status === "active" ? "default" : "secondary"}>
                                {item.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => setSelectedStorage(item)} className="h-7">
                            <Edit2 size={14} /> Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setDeleteConfirmation({ type: "storage", id: item.id, name: item.item })} className="h-7">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-4 mt-6">
            <div className="space-y-3">
              {filteredPosts.map((post, idx) => (
                <motion.div key={post.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <MessageCircle size={20} className="text-purple-600" />
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">{post.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{post.farmerName} • {post.date}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">{post.content}</p>
                          <div className="flex gap-4 mt-3 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">❤️ {post.likes} likes</span>
                            <span className="text-gray-600 dark:text-gray-400">💬 {post.comments} comments</span>
                          </div>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => setDeleteConfirmation({ type: "post", id: post.id, name: post.title })} className="h-7">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmation} onOpenChange={(open) => !open && setDeleteConfirmation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={20} /> Delete Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{deleteConfirmation?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteConfirmation?.type === "order") {
                  const order = orders.find((o) => o.id === deleteConfirmation.id);
                  if (order) handleDeleteOrder(order);
                } else if (deleteConfirmation?.type === "storage") {
                  const storageItem = storage.find((s) => s.id === deleteConfirmation.id);
                  if (storageItem) handleDeleteStorage(storageItem);
                } else if (deleteConfirmation?.type === "post") {
                  const post = communityPosts.find((p) => p.id === deleteConfirmation.id);
                  if (post) handleDeletePost(post);
                }
                setDeleteConfirmation(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Order Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>Make changes to the order details</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-input rounded-md mt-2"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <Label>Quantity</Label>
                <input
                  type="number"
                  value={selectedOrder.quantity}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, quantity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-input rounded-md mt-2"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleUpdateOrder(selectedOrder, selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Save size={16} /> Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Storage Dialog */}
      <Dialog open={!!selectedStorage} onOpenChange={(open) => !open && setSelectedStorage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Storage Booking</DialogTitle>
            <DialogDescription>Make changes to the storage booking</DialogDescription>
          </DialogHeader>
          {selectedStorage && (
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <select
                  value={selectedStorage.status}
                  onChange={(e) => setSelectedStorage({ ...selectedStorage, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-input rounded-md mt-2"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <Label>Quantity (kg)</Label>
                <input
                  type="number"
                  value={selectedStorage.quantity}
                  onChange={(e) => setSelectedStorage({ ...selectedStorage, quantity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-input rounded-md mt-2"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setSelectedStorage(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleUpdateStorage(selectedStorage, selectedStorage);
                    setSelectedStorage(null);
                  }}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Save size={16} /> Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Farmer Details Dialog */}
      <Dialog open={!!selectedFarmer} onOpenChange={(open) => !open && setSelectedFarmer(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedFarmer && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedFarmer.name.charAt(0)}
                  </div>
                  <div>
                    <DialogTitle>{selectedFarmer.name}</DialogTitle>
                    <DialogDescription>{selectedFarmer.email}</DialogDescription>
                  </div>
                  <Badge variant={selectedFarmer.status === "active" ? "default" : "destructive"} className="ml-auto">
                    {selectedFarmer.status.toUpperCase()}
                  </Badge>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                    <p className="font-semibold">{selectedFarmer.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Farm Size</p>
                    <p className="font-semibold">{selectedFarmer.farmSize} acres</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                    <p className="font-semibold">{selectedFarmer.orders}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="font-semibold text-green-600">₹{selectedFarmer.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Join Date</p>
                    <p className="font-semibold">{selectedFarmer.joinDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Last Active</p>
                    <p className="font-semibold">{selectedFarmer.lastActive}</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedFarmer(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
