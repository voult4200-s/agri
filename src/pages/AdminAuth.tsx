import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { LogIn, Lock, Mail, AlertCircle, CheckCircle, ShoppingCart, Snowflake, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BrandLogo from "@/components/BrandLogo";

export default function AdminAuth() {
  const navigate = useNavigate();
  const { adminLogin } = useAdminAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("admin");
  const [loading, setLoading] = useState(false);

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [shopEmail, setShopEmail] = useState("");
  const [shopPassword, setShopPassword] = useState("");

  const [coldEmail, setColdEmail] = useState("");
  const [coldPassword, setColdPassword] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await adminLogin(adminEmail, adminPassword);
    if (result.success) {
      toast({ title: "Success", description: "Admin login successful" });
      navigate("/admin/panel");
    } else {
      toast({ title: "Error", description: result.error || "Login failed", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleShopLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await adminLogin(shopEmail, shopPassword);
    if (result.success) {
      toast({ title: "Success", description: "Shop login successful" });
      navigate("/shop/dashboard");
    } else {
      toast({ title: "Error", description: result.error || "Login failed", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleColdStorageLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await adminLogin(coldEmail, coldPassword);
    if (result.success) {
      toast({ title: "Success", description: "Cold Storage login successful" });
      navigate("/cold-storage/management");
    } else {
      toast({ title: "Error", description: result.error || "Login failed", variant: "destructive" });
    }
    setLoading(false);
  };

  const demoCredentials = [
    {
      role: "System Admin",
      id: "20262026",
      password: "20262026",
      access: "Full system control, farmer management, activity tracking",
      icon: "🔐",
    },
    {
      role: "Shop Manager",
      id: "shop@shop.com",
      password: "shop1234",
      access: "Order management, product updates, sales tracking",
      icon: "🛍️",
    },
    {
      role: "Cold Storage Manager",
      id: "cold@cold.com",
      password: "cold1234",
      access: "Storage booking, inventory management, selling items",
      icon: "❄️",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Credentials Info */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-green-200 dark:border-green-900">
              <h2 className="text-xl font-bold text-green-700 dark:text-green-400 mb-4">Demo Credentials</h2>

              {demoCredentials.map((cred, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="mb-4 p-3 bg-gray-50 dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600"
                >
                  <div className="text-2xl mb-2">{cred.icon}</div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{cred.role}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    <span className="font-mono bg-gray-200 dark:bg-slate-800 px-2 py-1 rounded">ID: {cred.id}</span>
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    <span className="font-mono bg-gray-200 dark:bg-slate-800 px-2 py-1 rounded">Pass: {cred.password}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">{cred.access}</p>
                </motion.div>
              ))}
            </div>

            {/* Features */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-blue-200 dark:border-blue-900">
              <h3 className="font-bold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                <CheckCircle size={18} /> Features
              </h3>
              <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                <li>✓ Admin System Control</li>
                <li>✓ Shop Order Management</li>
                <li>✓ Cold Storage Booking</li>
                <li>✓ Farmer Activity Tracking</li>
                <li>✓ User Management</li>
                <li>✓ LocalStorage Database</li>
              </ul>
            </div>
          </div>

          {/* Login Forms */}
          <div>
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                <CardTitle>Admin & Business Login</CardTitle>
                <CardDescription className="text-green-100">Select your role to access dashboard</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="admin" className="flex gap-1">
                      <Shield size={16} /> Admin
                    </TabsTrigger>
                    <TabsTrigger value="shop" className="flex gap-1">
                      <ShoppingCart size={16} /> Shop
                    </TabsTrigger>
                    <TabsTrigger value="cold" className="flex gap-1">
                      <Snowflake size={16} /> Cold
                    </TabsTrigger>
                  </TabsList>

                  {/* Admin Tab */}
                  <TabsContent value="admin" className="space-y-4">
                    <form onSubmit={handleAdminLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="admin-email" className="text-gray-700 dark:text-gray-300">
                          Admin ID
                        </Label>
                        <Input
                          id="admin-email"
                          type="text"
                          placeholder="20262026"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="admin-pass" className="text-gray-700 dark:text-gray-300">
                          Password
                        </Label>
                        <Input
                          id="admin-pass"
                          type="password"
                          placeholder="••••••••"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                        <LogIn size={18} className="mr-2" />
                        {loading ? "Logging in..." : "Login as Admin"}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Shop Tab */}
                  <TabsContent value="shop" className="space-y-4">
                    <form onSubmit={handleShopLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="shop-email" className="text-gray-700 dark:text-gray-300">
                          Shop Email
                        </Label>
                        <Input
                          id="shop-email"
                          type="email"
                          placeholder="shop@shop.com"
                          value={shopEmail}
                          onChange={(e) => setShopEmail(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shop-pass" className="text-gray-700 dark:text-gray-300">
                          Password
                        </Label>
                        <Input
                          id="shop-pass"
                          type="password"
                          placeholder="••••••••"
                          value={shopPassword}
                          onChange={(e) => setShopPassword(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                        <LogIn size={18} className="mr-2" />
                        {loading ? "Logging in..." : "Login as Shop"}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Cold Storage Tab */}
                  <TabsContent value="cold" className="space-y-4">
                    <form onSubmit={handleColdStorageLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="cold-email" className="text-gray-700 dark:text-gray-300">
                          Cold Storage Email
                        </Label>
                        <Input
                          id="cold-email"
                          type="email"
                          placeholder="cold@cold.com"
                          value={coldEmail}
                          onChange={(e) => setColdEmail(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cold-pass" className="text-gray-700 dark:text-gray-300">
                          Password
                        </Label>
                        <Input
                          id="cold-pass"
                          type="password"
                          placeholder="••••••••"
                          value={coldPassword}
                          onChange={(e) => setColdPassword(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700" disabled={loading}>
                        <LogIn size={18} className="mr-2" />
                        {loading ? "Logging in..." : "Login as Cold Storage"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300 flex gap-2">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    <span>Admin and business login system. All data stored in LocalStorage.</span>
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={() => navigate("/auth")}
                  variant="outline"
                  className="w-full mt-4"
                >
                  ← Back to Farmer Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
