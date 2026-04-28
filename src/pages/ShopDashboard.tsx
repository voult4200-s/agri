import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, LogOut, TrendingUp, Package, Users, MessageSquare,
  Plus, Trash2, Edit2, Search, CheckCircle, Clock, AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  products: { name: string; qty: number; price: number }[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  orderDate: string;
  deliveryDate?: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description: string;
}

export default function ShopDashboard() {
  const navigate = useNavigate();
  const { admin, adminLogout, isAdminAuthenticated, role } = useAdminAuth();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newProduct, setNewProduct] = useState({ name: "", category: "", price: "", stock: "" });

  // Initialize demo data
  useEffect(() => {
    if (!isAdminAuthenticated || role !== "shop") {
      navigate("/admin-login");
      return;
    }

    const storedOrders = localStorage.getItem("shopOrders");
    const storedProducts = localStorage.getItem("shopProducts");

    if (!storedOrders) {
      const demoOrders: Order[] = [
        {
          id: "SHP001",
          orderId: "ORD-2026-001",
          customerId: "FM001",
          customerName: "Rajesh Kumar",
          products: [
            { name: "Hybrid Wheat Seeds", qty: 5, price: 850 },
            { name: "NPK Fertilizer", qty: 2, price: 1050 },
          ],
          totalAmount: 6350,
          status: "shipped",
          orderDate: "2026-04-25",
          deliveryDate: "2026-04-29",
        },
        {
          id: "SHP002",
          orderId: "ORD-2026-002",
          customerId: "FM002",
          customerName: "Priya Singh",
          products: [{ name: "Tomato Seeds", qty: 10, price: 320 }],
          totalAmount: 3200,
          status: "processing",
          orderDate: "2026-04-27",
        },
        {
          id: "SHP003",
          orderId: "ORD-2026-003",
          customerId: "FM004",
          customerName: "Kavita Sharma",
          products: [
            { name: "Neem Oil", qty: 3, price: 320 },
            { name: "Fungicide", qty: 1, price: 280 },
          ],
          totalAmount: 1240,
          status: "pending",
          orderDate: "2026-04-28",
        },
      ];
      localStorage.setItem("shopOrders", JSON.stringify(demoOrders));
      setOrders(demoOrders);
    } else {
      setOrders(JSON.parse(storedOrders));
    }

    if (!storedProducts) {
      const demoProducts: Product[] = [
        {
          id: "PROD001",
          name: "Hybrid Wheat Seeds",
          category: "Seeds",
          price: 850,
          stock: 100,
          image: "🌾",
          description: "High-yield hybrid wheat seeds for optimal growth",
        },
        {
          id: "PROD002",
          name: "NPK Fertilizer (50kg)",
          category: "Fertilizers",
          price: 1050,
          stock: 45,
          image: "📦",
          description: "Balanced NPK fertilizer for all crops",
        },
        {
          id: "PROD003",
          name: "Neem Oil (1L)",
          category: "Pesticides",
          price: 320,
          stock: 200,
          image: "🍃",
          description: "Organic neem oil pesticide",
        },
        {
          id: "PROD004",
          name: "Tomato Seeds",
          category: "Seeds",
          price: 320,
          stock: 80,
          image: "🍅",
          description: "Premium tomato seed variety",
        },
      ];
      localStorage.setItem("shopProducts", JSON.stringify(demoProducts));
      setProducts(demoProducts);
    } else {
      setProducts(JSON.parse(storedProducts));
    }
  }, [isAdminAuthenticated, role, navigate]);

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.stock) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    const product: Product = {
      id: `PROD${Date.now()}`,
      name: newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      image: "📦",
      description: "",
    };

    const updated = [...products, product];
    setProducts(updated);
    localStorage.setItem("shopProducts", JSON.stringify(updated));
    setNewProduct({ name: "", category: "", price: "", stock: "" });
    toast({ title: "Success", description: "Product added successfully" });
  };

  const handleUpdateOrderStatus = (order: Order, newStatus: Order["status"]) => {
    const updated = orders.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o));
    setOrders(updated);
    localStorage.setItem("shopOrders", JSON.stringify(updated));
    toast({ title: "Success", description: `Order ${order.orderId} updated to ${newStatus}` });
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);
    localStorage.setItem("shopProducts", JSON.stringify(updated));
    toast({ title: "Deleted", description: "Product removed" });
  };

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/auth");
    toast({ title: "Logged out", description: "You have been logged out" });
  };

  const filteredOrders = orders.filter((o) =>
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.filter((o) => o.status !== "cancelled").length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300";
      case "shipped":
        return "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300";
      case "processing":
        return "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300";
      case "pending":
        return "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300";
      case "cancelled":
        return "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <ShoppingCart size={32} />
              <div>
                <h1 className="text-2xl font-bold">Shop Dashboard</h1>
                <p className="text-blue-100 text-sm">Order & Product Management</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="destructive" className="flex gap-2">
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
                  </div>
                  <TrendingUp size={40} className="text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Total Orders</p>
                    <p className="text-3xl font-bold text-blue-600">{totalOrders}</p>
                  </div>
                  <ShoppingCart size={40} className="text-blue-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Pending Orders</p>
                    <p className="text-3xl font-bold text-orange-600">{pendingOrders}</p>
                  </div>
                  <AlertCircle size={40} className="text-orange-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="bg-white dark:bg-slate-800 rounded-lg shadow">
          <TabsList className="grid w-full grid-cols-2 rounded-t-lg">
            <TabsTrigger value="orders" className="flex gap-2">
              <ShoppingCart size={18} /> Orders ({totalOrders})
            </TabsTrigger>
            <TabsTrigger value="products" className="flex gap-2">
              <Package size={18} /> Products ({products.length})
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="p-6 space-y-6">
            <div className="mb-4">
              <Input
                placeholder="Search by order ID or customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {filteredOrders.map((order, idx) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {order.customerName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white">{order.orderId}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{order.customerName}</p>
                              </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-slate-700 rounded p-3 mb-3 text-sm">
                              <p className="font-semibold mb-2">Products:</p>
                              {order.products.map((prod, i) => (
                                <p key={i} className="text-gray-700 dark:text-gray-300">
                                  • {prod.name} x{prod.qty} @ ₹{prod.price}
                                </p>
                              ))}
                            </div>

                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Order Date</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.orderDate}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
                                <p className="text-lg font-bold text-green-600">₹{order.totalAmount.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Badge className={getStatusColor(order.status)}>{order.status.toUpperCase()}</Badge>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-xs h-8">
                                  <Edit2 size={14} className="mr-1" /> Update Status
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Update Order Status - {order.orderId}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-2">
                                  {(["pending", "processing", "shipped", "delivered", "cancelled"] as const).map((status) => (
                                    <Button
                                      key={status}
                                      onClick={() => handleUpdateOrderStatus(order, status)}
                                      variant={order.status === status ? "default" : "outline"}
                                      className="w-full justify-start"
                                    >
                                      {status.toUpperCase()}
                                    </Button>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="p-6 space-y-6">
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">Add New Product</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                <Input
                  placeholder="Category (Seeds, Fertilizers, etc)"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                />
                <Input
                  placeholder="Price"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
                <Input
                  placeholder="Stock Quantity"
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                />
                <Button onClick={handleAddProduct} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus size={18} className="mr-2" /> Add Product
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {products.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="text-3xl">{product.image}</div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{product.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{product.category}</p>
                            <div className="flex gap-4 mt-3 text-sm">
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">Price</p>
                                <p className="font-bold text-green-600">₹{product.price}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">Stock</p>
                                <p className="font-bold text-blue-600">{product.stock} units</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="h-8"
                        >
                          <Trash2 size={14} className="mr-1" /> Delete
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
    </div>
  );
}
