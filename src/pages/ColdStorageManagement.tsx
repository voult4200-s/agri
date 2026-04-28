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
  Snowflake, LogOut, Plus, Trash2, Edit2, Search, CheckCircle,
  TrendingUp, Package, Calendar, IndianRupee, AlertCircle, Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ColdStorageBooking {
  id: string;
  bookingId: string;
  farmerId: string;
  farmerName: string;
  itemName: string;
  quantity: number;
  unit: string;
  storageType: string;
  bookingDate: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  pricePerDay: number;
  totalPrice: number;
  status: "active" | "pending" | "completed" | "cancelled";
  purpose: string;
}

interface MarketListing {
  id: string;
  listingId: string;
  bookingId: string;
  farmerName: string;
  itemName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalValue: number;
  quality: string;
  listingDate: string;
  status: "available" | "negotiating" | "sold";
  inquiries: number;
}

export default function ColdStorageManagement() {
  const navigate = useNavigate();
  const { admin, adminLogout, isAdminAuthenticated, role } = useAdminAuth();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<ColdStorageBooking[]>([]);
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newBooking, setNewBooking] = useState({
    farmerName: "",
    itemName: "",
    quantity: "",
    startDate: "",
    endDate: "",
  });

  // Initialize demo data
  useEffect(() => {
    if (!isAdminAuthenticated || role !== "coldStorage") {
      navigate("/admin-login");
      return;
    }

    const storedBookings = localStorage.getItem("coldStorageBookings");
    const storedListings = localStorage.getItem("coldStorageListings");

    if (!storedBookings) {
      const demoBookings: ColdStorageBooking[] = [
        {
          id: "CS001",
          bookingId: "CSB-2026-001",
          farmerId: "FM001",
          farmerName: "Rajesh Kumar",
          itemName: "Tomatoes",
          quantity: 500,
          unit: "Kg",
          storageType: "Temperature Controlled",
          bookingDate: "2026-04-20",
          startDate: "2026-04-21",
          endDate: "2026-05-21",
          durationDays: 30,
          pricePerDay: 150,
          totalPrice: 4500,
          status: "active",
          purpose: "Market selling",
        },
        {
          id: "CS002",
          bookingId: "CSB-2026-002",
          farmerId: "FM002",
          farmerName: "Priya Singh",
          itemName: "Potatoes",
          quantity: 1000,
          unit: "Kg",
          storageType: "Dry Storage",
          bookingDate: "2026-04-22",
          startDate: "2026-04-23",
          endDate: "2026-06-23",
          durationDays: 61,
          pricePerDay: 100,
          totalPrice: 6100,
          status: "active",
          purpose: "Long-term storage",
        },
        {
          id: "CS003",
          bookingId: "CSB-2026-003",
          farmerId: "FM004",
          farmerName: "Kavita Sharma",
          itemName: "Onions",
          quantity: 300,
          unit: "Kg",
          storageType: "Temperature Controlled",
          bookingDate: "2026-04-15",
          startDate: "2026-04-16",
          endDate: "2026-05-16",
          durationDays: 30,
          pricePerDay: 120,
          totalPrice: 3600,
          status: "completed",
          purpose: "Market selling",
        },
      ];
      localStorage.setItem("coldStorageBookings", JSON.stringify(demoBookings));
      setBookings(demoBookings);
    } else {
      setBookings(JSON.parse(storedBookings));
    }

    if (!storedListings) {
      const demoListings: MarketListing[] = [
        {
          id: "LIST001",
          listingId: "CSL-2026-001",
          bookingId: "CSB-2026-001",
          farmerName: "Rajesh Kumar",
          itemName: "Tomatoes",
          quantity: 500,
          unit: "Kg",
          pricePerUnit: 35,
          totalValue: 17500,
          quality: "Grade A",
          listingDate: "2026-04-21",
          status: "available",
          inquiries: 3,
        },
        {
          id: "LIST002",
          listingId: "CSL-2026-002",
          bookingId: "CSB-2026-002",
          farmerName: "Priya Singh",
          itemName: "Potatoes",
          quantity: 1000,
          unit: "Kg",
          pricePerUnit: 28,
          totalValue: 28000,
          quality: "Grade A",
          listingDate: "2026-04-23",
          status: "negotiating",
          inquiries: 5,
        },
      ];
      localStorage.setItem("coldStorageListings", JSON.stringify(demoListings));
      setListings(demoListings);
    } else {
      setListings(JSON.parse(storedListings));
    }
  }, [isAdminAuthenticated, role, navigate]);

  const handleAddBooking = () => {
    if (!newBooking.farmerName || !newBooking.itemName || !newBooking.quantity || !newBooking.startDate || !newBooking.endDate) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    const start = new Date(newBooking.startDate);
    const end = new Date(newBooking.endDate);
    const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const booking: ColdStorageBooking = {
      id: `CS${Date.now()}`,
      bookingId: `CSB-2026-${Math.floor(Math.random() * 1000)}`,
      farmerId: `FM${Math.floor(Math.random() * 1000)}`,
      farmerName: newBooking.farmerName,
      itemName: newBooking.itemName,
      quantity: parseInt(newBooking.quantity),
      unit: "Kg",
      storageType: "Temperature Controlled",
      bookingDate: new Date().toISOString().split("T")[0],
      startDate: newBooking.startDate,
      endDate: newBooking.endDate,
      durationDays,
      pricePerDay: 150,
      totalPrice: durationDays * 150,
      status: "pending",
      purpose: "Market selling",
    };

    const updated = [...bookings, booking];
    setBookings(updated);
    localStorage.setItem("coldStorageBookings", JSON.stringify(updated));
    setNewBooking({ farmerName: "", itemName: "", quantity: "", startDate: "", endDate: "" });
    toast({ title: "Success", description: "Booking added successfully" });
  };

  const handleCreateMarketListing = (booking: ColdStorageBooking) => {
    const listing: MarketListing = {
      id: `LIST${Date.now()}`,
      listingId: `CSL-2026-${Math.floor(Math.random() * 1000)}`,
      bookingId: booking.id,
      farmerName: booking.farmerName,
      itemName: booking.itemName,
      quantity: booking.quantity,
      unit: booking.unit,
      pricePerUnit: Math.floor(Math.random() * 50) + 20,
      totalValue: booking.quantity * (Math.floor(Math.random() * 50) + 20),
      quality: "Grade A",
      listingDate: new Date().toISOString().split("T")[0],
      status: "available",
      inquiries: 0,
    };

    const updated = [...listings, listing];
    setListings(updated);
    localStorage.setItem("coldStorageListings", JSON.stringify(updated));
    toast({ title: "Success", description: "Item listed in market" });
  };

  const handleUpdateListingStatus = (listing: MarketListing, newStatus: MarketListing["status"]) => {
    const updated = listings.map((l) => (l.id === listing.id ? { ...l, status: newStatus } : l));
    setListings(updated);
    localStorage.setItem("coldStorageListings", JSON.stringify(updated));
    toast({ title: "Success", description: `Listing updated to ${newStatus}` });
  };

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/auth");
    toast({ title: "Logged out", description: "You have been logged out" });
  };

  const filteredBookings = bookings.filter((b) =>
    b.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.bookingId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeBookings = bookings.filter((b) => b.status === "active").length;
  const totalStorageRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const marketListingValue = listings.reduce((sum, l) => sum + l.totalValue, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300";
      case "completed":
        return "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300";
      case "cancelled":
        return "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300";
      case "available":
        return "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300";
      case "negotiating":
        return "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300";
      case "sold":
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Snowflake size={32} />
              <div>
                <h1 className="text-2xl font-bold">Cold Storage Management</h1>
                <p className="text-cyan-100 text-sm">Storage Booking & Market Sales Control</p>
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
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Active Bookings</p>
                    <p className="text-3xl font-bold text-cyan-600">{activeBookings}</p>
                  </div>
                  <Package size={40} className="text-cyan-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Storage Revenue</p>
                    <p className="text-3xl font-bold text-green-600">₹{totalStorageRevenue.toLocaleString()}</p>
                  </div>
                  <TrendingUp size={40} className="text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Market Listings Value</p>
                    <p className="text-3xl font-bold text-blue-600">₹{marketListingValue.toLocaleString()}</p>
                  </div>
                  <IndianRupee size={40} className="text-blue-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings" className="bg-white dark:bg-slate-800 rounded-lg shadow">
          <TabsList className="grid w-full grid-cols-2 rounded-t-lg">
            <TabsTrigger value="bookings" className="flex gap-2">
              <Snowflake size={18} /> Bookings ({bookings.length})
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex gap-2">
              <Package size={18} /> Market Listings ({listings.length})
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="p-6 space-y-6">
            <Card className="bg-cyan-50 dark:bg-cyan-950 border-cyan-200 dark:border-cyan-800">
              <CardHeader>
                <CardTitle className="text-cyan-900 dark:text-cyan-100">Add New Booking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Farmer Name"
                    value={newBooking.farmerName}
                    onChange={(e) => setNewBooking({ ...newBooking, farmerName: e.target.value })}
                  />
                  <Input
                    placeholder="Item Name"
                    value={newBooking.itemName}
                    onChange={(e) => setNewBooking({ ...newBooking, itemName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Quantity (Kg)"
                    type="number"
                    value={newBooking.quantity}
                    onChange={(e) => setNewBooking({ ...newBooking, quantity: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Start Date</label>
                    <Input
                      type="date"
                      value={newBooking.startDate}
                      onChange={(e) => setNewBooking({ ...newBooking, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">End Date</label>
                    <Input
                      type="date"
                      value={newBooking.endDate}
                      onChange={(e) => setNewBooking({ ...newBooking, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleAddBooking} className="w-full bg-cyan-600 hover:bg-cyan-700">
                  <Plus size={18} className="mr-2" /> Create Booking
                </Button>
              </CardContent>
            </Card>

            <div className="mb-4">
              <Input
                placeholder="Search by farmer name, item, or booking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {filteredBookings.map((booking, idx) => (
                  <motion.div
                    key={booking.id}
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
                              <Snowflake size={24} className="text-cyan-600" />
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white">{booking.bookingId}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{booking.farmerName}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">Item</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{booking.itemName}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">Quantity</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{booking.quantity} Kg</p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">Duration</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{booking.durationDays} days</p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">Total Price</p>
                                <p className="font-semibold text-green-600">₹{booking.totalPrice.toLocaleString()}</p>
                              </div>
                            </div>

                            <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} /> {booking.startDate} to {booking.endDate}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Badge className={getStatusColor(booking.status)}>{booking.status.toUpperCase()}</Badge>

                            {booking.status === "active" && (
                              <Button
                                size="sm"
                                onClick={() => handleCreateMarketListing(booking)}
                                className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs"
                              >
                                <Package size={14} className="mr-1" /> List in Market
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* Market Listings Tab */}
          <TabsContent value="listings" className="p-6 space-y-4">
            <div className="space-y-3">
              {listings.map((listing, idx) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {listing.farmerName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">{listing.listingId}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{listing.farmerName}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Item</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{listing.itemName}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Qty & Price</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {listing.quantity} Kg @ ₹{listing.pricePerUnit}/Kg
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Total Value</p>
                              <p className="font-semibold text-green-600">₹{listing.totalValue.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="flex gap-4 text-xs">
                            <span className="text-gray-600 dark:text-gray-400">Quality: {listing.quality}</span>
                            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <AlertCircle size={12} /> {listing.inquiries} inquiries
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Badge className={getStatusColor(listing.status)}>{listing.status.toUpperCase()}</Badge>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-xs h-8">
                                <Edit2 size={14} className="mr-1" /> Update
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update Listing Status - {listing.listingId}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-2">
                                {(["available", "negotiating", "sold"] as const).map((status) => (
                                  <Button
                                    key={status}
                                    onClick={() => handleUpdateListingStatus(listing, status)}
                                    variant={listing.status === status ? "default" : "outline"}
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
