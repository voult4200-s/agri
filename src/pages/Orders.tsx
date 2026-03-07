import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, TrendingUp, Package, Truck, CheckCircle2, Clock,
  XCircle, Eye, IndianRupee, Calendar, MapPin, Filter, Search,
  ArrowUpRight, ArrowDownLeft, BarChart3, CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import PaymentDialog from "@/components/PaymentDialog";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

interface Order {
  id: string;
  item: string;
  category: string;
  quantity: string;
  total: number;
  date: string;
  status: OrderStatus;
  counterparty: string;
  location: string;
  trackingId?: string;
  paymentStatus?: "paid" | "pending" | "cod";
}

const statusConfig: Record<OrderStatus, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: "Pending", icon: Clock, color: "bg-warning/15 text-warning" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "bg-info/15 text-info" },
  shipped: { label: "Shipped", icon: Truck, color: "bg-accent/15 text-accent-foreground" },
  delivered: { label: "Delivered", icon: CheckCircle2, color: "bg-success/15 text-success" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-destructive/15 text-destructive" },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  paid: { label: "Paid", color: "bg-success/15 text-success" },
  pending: { label: "Unpaid", color: "bg-warning/15 text-warning" },
  cod: { label: "COD", color: "bg-info/15 text-info" },
};

const myOrders: Order[] = [
  { id: "ORD-1024", item: "Hybrid Tomato Seeds (5kg)", category: "Seeds", quantity: "5 kg", total: 2250, date: "2026-02-10", status: "shipped", counterparty: "AgriMart Supplies", location: "Nashik, MH", trackingId: "TRK89012", paymentStatus: "paid" },
  { id: "ORD-1019", item: "NPK Fertilizer 19:19:19", category: "Fertilizer", quantity: "50 kg", total: 1800, date: "2026-02-06", status: "delivered", counterparty: "Kisan Corner", location: "Pune, MH", paymentStatus: "paid" },
  { id: "ORD-1031", item: "Drip Irrigation Kit", category: "Equipment", quantity: "1 set", total: 8500, date: "2026-02-12", status: "pending", counterparty: "IrriTech Solutions", location: "Indore, MP", paymentStatus: "pending" },
  { id: "ORD-1015", item: "Organic Neem Pesticide", category: "Pesticide", quantity: "10 L", total: 1200, date: "2026-01-28", status: "cancelled", counterparty: "GreenShield Agro", location: "Nagpur, MH", paymentStatus: "pending" },
];

const mySales: Order[] = [
  { id: "SL-2048", item: "Premium Basmati Rice", category: "Grain", quantity: "200 qtl", total: 420000, date: "2026-02-11", status: "confirmed", counterparty: "Delhi Grain Market", location: "New Delhi", paymentStatus: "pending" },
  { id: "SL-2041", item: "Fresh Onions (Grade A)", category: "Vegetable", quantity: "50 qtl", total: 87500, date: "2026-02-08", status: "shipped", counterparty: "Metro Fresh Pvt Ltd", location: "Mumbai, MH", trackingId: "TRK77234", paymentStatus: "paid" },
  { id: "SL-2055", item: "Organic Turmeric Powder", category: "Spice", quantity: "10 qtl", total: 95000, date: "2026-02-12", status: "pending", counterparty: "SpiceWorld Exports", location: "Kochi, KL", paymentStatus: "pending" },
  { id: "SL-2033", item: "Soybean (FAQ Grade)", category: "Grain", quantity: "100 qtl", total: 450000, date: "2026-02-03", status: "delivered", counterparty: "Agri Commodities Ltd", location: "Indore, MP", paymentStatus: "paid" },
  { id: "SL-2028", item: "Cotton Bales", category: "Fiber", quantity: "30 bales", total: 180000, date: "2026-01-25", status: "delivered", counterparty: "Textile Hub", location: "Ahmedabad, GJ", paymentStatus: "paid" },
];

const summaryStats = [
  { icon: ShoppingCart, label: "Total Orders", value: "24", change: "+3 this month", color: "text-info" },
  { icon: TrendingUp, label: "Total Sales", value: "₹12.3L", change: "+18% vs last month", color: "text-success" },
  { icon: Package, label: "Active Shipments", value: "5", change: "2 arriving today", color: "text-warning" },
  { icon: BarChart3, label: "Avg Order Value", value: "₹3,450", change: "+8% growth", color: "text-accent-foreground" },
];

function OrderCard({ order, type }: { order: Order; type: "order" | "sale" }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const config = statusConfig[order.status];
  const payConfig = paymentStatusConfig[order.paymentStatus || "pending"];
  const Icon = type === "order" ? ArrowUpRight : ArrowDownLeft;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card-hover rounded-xl p-5 group"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${type === "order" ? "bg-info/10" : "bg-success/10"}`}>
              <Icon className={`w-5 h-5 ${type === "order" ? "text-info" : "text-success"}`} />
            </div>
            <div className="min-w-0">
              <p className="font-heading font-semibold text-foreground text-sm truncate">{order.item}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{order.counterparty}</p>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{order.date}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{order.location}</span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0 space-y-1.5">
            <p className="font-mono font-bold text-foreground text-sm">₹{order.total.toLocaleString("en-IN")}</p>
            <div className="flex flex-col items-end gap-1">
              <Badge className={`${config.color} border-0 text-[11px]`}>
                <config.icon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
              <Badge className={`${payConfig.color} border-0 text-[10px]`}>
                <CreditCard className="w-2.5 h-2.5 mr-0.5" />
                {payConfig.label}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground font-mono">{order.id} · {order.quantity}</span>
          <div className="flex gap-2">
            {order.paymentStatus === "pending" && order.status !== "cancelled" && (
              <Button variant="default" size="sm" className="h-7 text-xs gradient-warm text-secondary-foreground border-0" onClick={() => setPaymentOpen(true)}>
                <CreditCard className="w-3 h-3 mr-1" /> Pay Now
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setDetailOpen(true)}>
              <Eye className="w-3 h-3 mr-1" /> Details
            </Button>
          </div>
        </div>
      </motion.div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">{type === "order" ? "Order" : "Sale"} Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2 text-sm">
              {[
                ["ID", order.id],
                ["Item", order.item],
                ["Category", order.category],
                ["Quantity", order.quantity],
                [type === "order" ? "Seller" : "Buyer", order.counterparty],
                ["Location", order.location],
                ["Date", order.date],
                ...(order.trackingId ? [["Tracking ID", order.trackingId]] : []),
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center bg-muted rounded-lg p-3">
              <span className="text-sm text-muted-foreground">Total Amount</span>
              <span className="font-mono font-bold text-lg text-foreground">₹{order.total.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex gap-2">
              <Badge className={`${config.color} border-0 w-fit`}>
                <config.icon className="w-3 h-3 mr-1" /> {config.label}
              </Badge>
              <Badge className={`${payConfig.color} border-0 w-fit`}>
                <CreditCard className="w-3 h-3 mr-1" /> {payConfig.label}
              </Badge>
            </div>
            {order.paymentStatus === "pending" && order.status !== "cancelled" && (
              <Button className="w-full gradient-warm text-secondary-foreground border-0" onClick={() => { setDetailOpen(false); setPaymentOpen(true); }}>
                <CreditCard className="w-4 h-4 mr-2" /> Pay ₹{order.total.toLocaleString("en-IN")}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        amount={order.total}
        description={`${type === "order" ? "Order" : "Sale"} ${order.id} — ${order.item}`}
      />
    </>
  );
}

export default function Orders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filterOrders = (orders: Order[]) =>
    orders.filter((o) => {
      const matchesSearch = o.item.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.counterparty.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

  return (
    <div className="space-y-8">
      <div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-heading font-bold text-foreground">
          Orders & Sales
        </motion.h1>
        <p className="text-muted-foreground mt-1">Track your purchases and manage your sales</p>
      </div>

      {/* Summary Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryStats.map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-4 hover:shadow-[var(--shadow-hover)] transition-all">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className="font-mono font-bold text-xl text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-[11px] text-success mt-1">{s.change}</div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search orders, items, counterparty..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="orders">
        <TabsList className="bg-muted">
          <TabsTrigger value="orders" className="gap-1.5">
            <ShoppingCart className="w-4 h-4" /> My Orders
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-1.5">
            <TrendingUp className="w-4 h-4" /> My Sales
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-5">
          <div className="grid md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filterOrders(myOrders).map((order) => (
                <OrderCard key={order.id} order={order} type="order" />
              ))}
            </AnimatePresence>
          </div>
          {filterOrders(myOrders).length === 0 && (
            <div className="text-center py-16">
              <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sales" className="mt-5">
          <div className="grid md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filterOrders(mySales).map((order) => (
                <OrderCard key={order.id} order={order} type="sale" />
              ))}
            </AnimatePresence>
          </div>
          {filterOrders(mySales).length === 0 && (
            <div className="text-center py-16">
              <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No sales found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
