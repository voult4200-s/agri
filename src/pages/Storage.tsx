import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Warehouse, Snowflake, ThermometerSun, MapPin, Star, IndianRupee,
  Search, Filter, Calendar, Phone, User, Package, ArrowRight,
  CheckCircle2, Clock, ShieldCheck, Truck, X, CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import PaymentDialog from "@/components/PaymentDialog";

type FacilityType = "cold" | "warehouse" | "silo";

interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  location: string;
  distance: string;
  rating: number;
  reviews: number;
  pricePerQuintal: number;
  capacity: string;
  available: string;
  temperature?: string;
  features: string[];
  image: string;
  verified: boolean;
}

const facilities: Facility[] = [
  { id: "1", name: "Agri Cool Storage", type: "cold", location: "Nashik, Maharashtra", distance: "12 km", rating: 4.7, reviews: 128, pricePerQuintal: 45, capacity: "5,000 MT", available: "1,200 MT", temperature: "2°C – 8°C", features: ["24/7 Monitoring", "Insurance", "Loading Dock", "CCTV"], image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80", verified: true },
  { id: "2", name: "Kisan Warehouse Hub", type: "warehouse", location: "Pune, Maharashtra", distance: "8 km", rating: 4.5, reviews: 95, pricePerQuintal: 25, capacity: "10,000 MT", available: "3,500 MT", features: ["Fumigation", "Weighbridge", "Security", "Transport"], image: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80", verified: true },
  { id: "3", name: "FreshKeep Cold Chain", type: "cold", location: "Nagpur, Maharashtra", distance: "5 km", rating: 4.9, reviews: 210, pricePerQuintal: 55, capacity: "3,000 MT", available: "800 MT", temperature: "0°C – 4°C", features: ["Multi-Temp Zones", "Humidity Control", "Insurance", "24/7 Monitoring"], image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80", verified: true },
  { id: "4", name: "GrainSafe Silos", type: "silo", location: "Indore, MP", distance: "18 km", rating: 4.3, reviews: 67, pricePerQuintal: 20, capacity: "8,000 MT", available: "4,000 MT", features: ["Aeration System", "Pest Control", "Weighbridge", "Rail Connected"], image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80", verified: false },
  { id: "5", name: "Harvest Store Premium", type: "warehouse", location: "Kolhapur, Maharashtra", distance: "3 km", rating: 4.6, reviews: 145, pricePerQuintal: 30, capacity: "6,000 MT", available: "2,100 MT", features: ["Fumigation", "Insurance", "CCTV", "Loading Dock"], image: "https://images.unsplash.com/photo-1595246135406-803418233494?w=600&q=80", verified: true },
  { id: "6", name: "Arctic Fresh Storage", type: "cold", location: "Aurangabad, Maharashtra", distance: "10 km", rating: 4.4, reviews: 78, pricePerQuintal: 50, capacity: "2,500 MT", available: "600 MT", temperature: "-5°C – 5°C", features: ["Blast Freezing", "Multi-Temp Zones", "Insurance", "Transport"], image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80", verified: true },
];

const typeConfig: Record<FacilityType, { label: string; icon: typeof Warehouse; color: string }> = {
  cold: { label: "Cold Storage", icon: Snowflake, color: "bg-info/15 text-info" },
  warehouse: { label: "Warehouse", icon: Warehouse, color: "bg-warning/15 text-warning" },
  silo: { label: "Grain Silo", icon: ThermometerSun, color: "bg-success/15 text-success" },
};

const stats = [
  { icon: Warehouse, value: "500+", label: "Verified Facilities", color: "text-primary" },
  { icon: ShieldCheck, value: "100%", label: "Insured Storage", color: "text-success" },
  { icon: Truck, value: "24hr", label: "Delivery Support", color: "text-warning" },
  { icon: Clock, value: "Instant", label: "Booking Confirmation", color: "text-info" },
];

export default function Storage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("rating");
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    commodity: "", quantity: "", startDate: "", duration: "1",
    contactName: "", contactPhone: "",
  });

  const bookingAmount = selectedFacility
    ? selectedFacility.pricePerQuintal * Number(bookingForm.quantity || 0) * Number(bookingForm.duration)
    : 0;

  const filtered = facilities
    .filter((f) => {
      const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.location.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || f.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price") return a.pricePerQuintal - b.pricePerQuintal;
      return 0;
    });

  const handleBook = (facility: Facility) => {
    setSelectedFacility(facility);
    setBookingOpen(true);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.commodity || !bookingForm.quantity || !bookingForm.startDate || !bookingForm.contactName || !bookingForm.contactPhone) {
      toast.error("Please fill all required fields");
      return;
    }
    if (bookingAmount <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    setBookingOpen(false);
    setPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    toast.success(`Booking confirmed for ${selectedFacility?.name}!`, {
      description: `${bookingForm.quantity} quintals of ${bookingForm.commodity} starting ${bookingForm.startDate}`,
    });
    setBookingForm({ commodity: "", quantity: "", startDate: "", duration: "1", contactName: "", contactPhone: "" });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-heading font-bold text-foreground">
          Storage Booking
        </motion.h1>
        <p className="text-muted-foreground mt-1">Find and book cold storage, warehouses & silos near you</p>
      </div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-4 text-center hover:shadow-[var(--shadow-hover)] transition-all">
            <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
            <div className="font-mono font-bold text-xl text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or location..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="cold">Cold Storage</SelectItem>
            <SelectItem value="warehouse">Warehouse</SelectItem>
            <SelectItem value="silo">Grain Silo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="price">Lowest Price</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Facility Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((facility, i) => {
            const config = typeConfig[facility.type];
            return (
              <motion.div
                key={facility.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card-hover rounded-xl overflow-hidden group"
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={facility.image} alt={facility.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <Badge className={`absolute top-3 left-3 ${config.color} border-0`}>
                    <config.icon className="w-3 h-3 mr-1" />
                    {config.label}
                  </Badge>
                  {facility.verified && (
                    <Badge className="absolute top-3 right-3 bg-success/90 text-success-foreground border-0">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                    </Badge>
                  )}
                  {facility.temperature && (
                    <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-mono font-medium text-foreground">
                      {facility.temperature}
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">{facility.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {facility.location} · {facility.distance}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span className="font-semibold text-foreground">{facility.rating}</span>
                      <span className="text-muted-foreground">({facility.reviews})</span>
                    </div>
                    <div className="flex items-center font-mono font-semibold text-foreground">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {facility.pricePerQuintal}
                      <span className="text-muted-foreground font-normal text-xs ml-0.5">/qtl/mo</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Capacity: {facility.capacity}</span>
                    <span className="text-success font-medium">Available: {facility.available}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {facility.features.slice(0, 3).map((f) => (
                      <span key={f} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{f}</span>
                    ))}
                    {facility.features.length > 3 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{facility.features.length - 3} more</span>
                    )}
                  </div>

                  <Button onClick={() => handleBook(facility)} className="w-full gradient-hero text-primary-foreground border-0 hover:opacity-90 group/btn">
                    <CreditCard className="w-4 h-4 mr-1" /> Book & Pay
                    <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Warehouse className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No facilities found matching your criteria</p>
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Book Storage</DialogTitle>
            <DialogDescription>
              {selectedFacility && <span>{selectedFacility.name} · {selectedFacility.location}</span>}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitBooking} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Commodity *</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="e.g. Wheat, Rice" value={bookingForm.commodity} onChange={(e) => setBookingForm({ ...bookingForm, commodity: e.target.value })} className="pl-10" maxLength={100} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Quantity (Quintals) *</label>
                <Input type="number" placeholder="e.g. 100" value={bookingForm.quantity} onChange={(e) => setBookingForm({ ...bookingForm, quantity: e.target.value })} min="1" max="100000" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Start Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="date" value={bookingForm.startDate} onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })} className="pl-10" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Duration</label>
                <Select value={bookingForm.duration} onValueChange={(v) => setBookingForm({ ...bookingForm, duration: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Month</SelectItem>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Contact Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Your name" value={bookingForm.contactName} onChange={(e) => setBookingForm({ ...bookingForm, contactName: e.target.value })} className="pl-10" maxLength={100} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="+91 XXXXX XXXXX" value={bookingForm.contactPhone} onChange={(e) => setBookingForm({ ...bookingForm, contactPhone: e.target.value })} className="pl-10" maxLength={15} />
                </div>
              </div>
            </div>

            {selectedFacility && (
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-mono text-foreground">₹{selectedFacility.pricePerQuintal}/qtl/month</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Quantity × Duration</span>
                  <span className="font-mono text-foreground">{bookingForm.quantity || 0} qtl × {bookingForm.duration} mo</span>
                </div>
                <div className="border-t border-border pt-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Total Amount</span>
                  <span className="font-mono font-bold text-lg text-foreground">₹{bookingAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full gradient-warm text-secondary-foreground border-0 hover:opacity-90 h-11">
              <CreditCard className="w-4 h-4 mr-2" /> Proceed to Payment
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        amount={bookingAmount}
        description={`Storage booking at ${selectedFacility?.name}`}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
