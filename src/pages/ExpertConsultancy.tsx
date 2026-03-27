import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Star, Clock, DollarSign, Search, Filter, Calendar,
  CheckCircle, AlertCircle, Loader2, X, Phone, Mail, BookOpen
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

interface Expert {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  experience_years: number;
  rating: number;
  reviews_count: number;
  daily_rate: number;
  monthly_rate: number;
  availability_status: string;
  image_url: string;
  phone: string;
  email: string;
  languages?: string[];
  certifications?: string[];
}

interface ExpertBooking {
  id: string;
  expert_id: string;
  expert?: Expert;
  booking_date: string;
  duration: "daily" | "monthly";
  total_amount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  payment_status: "pending" | "completed" | "failed";
  created_at: string;
}

const FALLBACK_EXPERTS: Expert[] = [
  {
    id: "fallback-1",
    name: "Dr. Rajesh Kumar",
    specialty: "Soil Management",
    bio: "PhD in Soil Science with 15+ years of farming consulting experience. Helps farmers improve soil fertility, pH balance, and nutrient planning for better yield.",
    experience_years: 15,
    rating: 4.9,
    reviews_count: 127,
    daily_rate: 300,
    monthly_rate: 3500,
    availability_status: "available",
    image_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh",
    phone: "+91 98765 43210",
    email: "rajesh@agriexperts.in",
    languages: ["English", "Hindi", "Punjabi"],
    certifications: ["PhD Soil Science", "ISO 14001"],
  },
  {
    id: "fallback-2",
    name: "Priya Sharma",
    specialty: "Organic Farming",
    bio: "Expert in organic certification and sustainable farming practices. Guides complete organic conversion, compost planning, and certification readiness.",
    experience_years: 12,
    rating: 4.8,
    reviews_count: 98,
    daily_rate: 280,
    monthly_rate: 3200,
    availability_status: "available",
    image_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
    phone: "+91 98765 43211",
    email: "priya@agriexperts.in",
    languages: ["English", "Hindi"],
    certifications: ["NPOP Certified", "Organic Master Trainer"],
  },
  {
    id: "fallback-3",
    name: "Amit Patel",
    specialty: "Irrigation Systems",
    bio: "Specialist in drip irrigation setup, water budgeting, and reducing wastage. Proven track record in water conservation techniques.",
    experience_years: 10,
    rating: 4.7,
    reviews_count: 85,
    daily_rate: 250,
    monthly_rate: 3000,
    availability_status: "available",
    image_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=amit",
    phone: "+91 98765 43212",
    email: "amit@agriexperts.in",
    languages: ["English", "Hindi", "Gujarati"],
    certifications: ["Water Management Specialist", "Drip Irrigation Expert"],
  },
  {
    id: "fallback-4",
    name: "Dr. Meena Singh",
    specialty: "Crop Science",
    bio: "Agricultural scientist specializing in high-yield crop varieties. Provides variety selection, sowing windows, and crop planning for local climate.",
    experience_years: 18,
    rating: 4.9,
    reviews_count: 142,
    daily_rate: 350,
    monthly_rate: 4000,
    availability_status: "busy",
    image_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=meena",
    phone: "+91 98765 43213",
    email: "meena@agriexperts.in",
    languages: ["English", "Hindi"],
    certifications: ["PhD Agriculture", "Crop Breeding Specialist"],
  },
  {
    id: "fallback-5",
    name: "Vikram Desai",
    specialty: "Pest Management",
    bio: "IPM specialist with proven track record in organic pest control. Focuses on strategies and low-cost pest control plans for small farmers.",
    experience_years: 11,
    rating: 4.6,
    reviews_count: 76,
    daily_rate: 240,
    monthly_rate: 2800,
    availability_status: "available",
    image_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=vikram",
    phone: "+91 98765 43214",
    email: "vikram@agriexperts.in",
    languages: ["English", "Hindi", "Marathi"],
    certifications: ["IPM Certified", "Entomology Expert"],
  },
  {
    id: "fallback-6",
    name: "Neha Gupta",
    specialty: "Farm Business",
    bio: "Business consultant helping farmers scale operations profitably. Helps with cost tracking, pricing strategy, and profit-focused farm decisions.",
    experience_years: 9,
    rating: 4.8,
    reviews_count: 104,
    daily_rate: 320,
    monthly_rate: 3600,
    availability_status: "available",
    image_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=neha",
    phone: "+91 98765 43215",
    email: "neha@agriexperts.in",
    languages: ["English", "Hindi"],
    certifications: ["MBA Agriculture", "Business Consultant"],
  },
];

const mapBookingRows = (rows: any[]): ExpertBooking[] => {
  return rows.map((row) => ({
    ...row,
    expert: row.expert ?? row.experts ?? undefined,
  }));
};

export default function ExpertConsultancy() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [myBookings, setMyBookings] = useState<ExpertBooking[]>([]);
  const [usingFallbackExperts, setUsingFallbackExperts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("");
  const [bookingDuration, setBookingDuration] = useState<"daily" | "monthly">("daily");
  const [bookingDate, setBookingDate] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  // Fetch experts
  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const { data, error } = await supabase
          .from("experts")
          .select("*")
          .order("rating", { ascending: false });

        if (error) throw error;

        const fetchedExperts = (data as Expert[] | null) ?? [];
        if (fetchedExperts.length > 0) {
          setExperts(fetchedExperts);
          setUsingFallbackExperts(false);
        } else {
          setExperts(FALLBACK_EXPERTS);
          setUsingFallbackExperts(true);
        }
      } catch (error: any) {
        console.error("Error fetching experts:", error);
        setExperts(FALLBACK_EXPERTS);
        setUsingFallbackExperts(true);
        toast({
          title: "Live expert data unavailable",
          description: "Showing demo experts now. Please verify Supabase URL/network for live data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, [toast]);

  // Fetch user's bookings
  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      try {
        const { data, error } = await supabase
          .from("expert_bookings")
          .select("*, experts(*)")
          .eq("user_id", user.id)
          .order("booking_date", { ascending: false });

        if (error) throw error;
        setMyBookings(mapBookingRows((data as any[]) || []));
      } catch (error: any) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, [user]);

  // Filter experts
  const filteredExperts = experts.filter((expert) => {
    const matchesSearch =
      expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (expert.bio || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty =
      !specialtyFilter || expert.specialty === specialtyFilter;

    return matchesSearch && matchesSpecialty;
  });

  // Get unique specialties
  const specialties = Array.from(new Set(experts.map((e) => e.specialty)));

  // Handle booking submission
  const handleBooking = async () => {
    if (!user || !selectedExpert || !bookingDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setProcessingPayment(true);
    try {
      const bookingAmount =
        bookingDuration === "daily"
          ? selectedExpert.daily_rate
          : selectedExpert.monthly_rate;

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from("expert_bookings")
        .insert({
          user_id: user.id,
          expert_id: selectedExpert.id,
          booking_date: bookingDate,
          duration: bookingDuration,
          total_amount: bookingAmount,
          status: "pending",
          payment_status: "pending",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mark as payment completed
      const { error: updateError } = await supabase
        .from("expert_bookings")
        .update({
          payment_status: "completed",
          status: "confirmed",
        })
        .eq("id", booking.id);

      if (updateError) throw updateError;

      toast({
        title: "Booking Confirmed!",
        description: `Your consultation with ${selectedExpert.name} has been booked for ₹${bookingAmount}`,
      });

      // Reset and close
      setBookingDialogOpen(false);
      setSelectedExpert(null);
      setBookingDate("");
      setBookingDuration("daily");

      // Refresh bookings
      const { data: updated } = await supabase
        .from("expert_bookings")
        .select("*, experts(*)")
        .eq("user_id", user.id)
        .order("booking_date", { ascending: false });

      setMyBookings(mapBookingRows((updated as any[]) || []));
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to complete booking",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  // Cancel booking
  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("expert_bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully",
      });

      setMyBookings(myBookings.filter((b) => b.id !== bookingId));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-2">
            <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
              <BookOpen className="w-10 h-10 inline-block mr-3 text-primary" />
              Expert Consultancy Booking
            </h1>
            <p className="text-muted-foreground max-w-3xl">
              Connect with 80+ certified agricultural experts for personalized consulting. Book daily or monthly sessions at affordable rates.
            </p>
          </div>

          {usingFallbackExperts && (
            <div className="mt-4 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning-foreground">
              Live Supabase data is currently unreachable. Showing demo experts so the feature remains usable.
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            <div className="glass-card p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{experts.length}+</p>
                <p className="text-sm text-muted-foreground">Certified Experts</p>
              </div>
            </div>
            <div className="glass-card p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">4.8★</p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
            </div>
            <div className="glass-card p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">Verified</p>
                <p className="text-sm text-muted-foreground">Quality Check</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* My Bookings Section */}
        {user && myBookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              My Active Bookings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myBookings
                .filter((b) => b.status !== "cancelled")
                .map((booking) => (
                  <Card key={booking.id} className="glass-card-hover overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {booking.expert?.name || "Expert"}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {booking.expert?.specialty}
                          </CardDescription>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.status === "confirmed"
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : "bg-warning/20 text-warning border border-warning/30"
                          }`}
                        >
                          {booking.status.toUpperCase()}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3 text-sm text-foreground/80">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        {new Date(booking.booking_date).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-foreground/80">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Clock className="w-4 h-4 text-primary" />
                        </div>
                        {booking.duration === "daily" ? "Full Day Consultation" : "Monthly Support Plan"}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold bg-primary/5 p-3 rounded-lg border border-primary/10">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <span className="text-lg">₹{booking.total_amount}</span>
                      </div>
                      {booking.status === "confirmed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel Consultation
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </motion.div>
        )}

        {/* Search & Filter Section */}
        <Card className="glass-card mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  <Search className="w-4 h-4 inline mr-2" />
                  Search Expert
                </Label>
                <Input
                  placeholder="Name, specialty, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  <Filter className="w-4 h-4 inline mr-2" />
                  Specialty
                </Label>
                <Select value={specialtyFilter || "all"} onValueChange={(val) => setSpecialtyFilter(val === "all" ? "" : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSpecialtyFilter("");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Experts Grid */}
        {filteredExperts.length === 0 ? (
          <Card className="text-center py-12 border-2 border-dashed">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No experts found matching your criteria</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredExperts.map((expert, index) => (
                <motion.div
                  key={expert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass-card-hover overflow-hidden h-full">
                    {/* Expert Header */}
                    <div className="relative h-28 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6">
                      <div className="absolute -bottom-6 left-6 flex items-end gap-4">
                        <div className="w-20 h-20 bg-background rounded-xl border-4 border-background shadow-lg overflow-hidden flex items-center justify-center">
                          <img
                            src={expert.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.name}`}
                            alt={expert.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border border-primary/20 shadow-sm">
                        <p className="text-xs font-bold text-primary">
                          {expert.experience_years}+ YRS EXP
                        </p>
                      </div>
                    </div>

                    <CardContent className="pt-10 pb-6 px-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-xl text-foreground leading-tight">{expert.name}</h3>
                          <p className="text-sm font-semibold text-primary/80 uppercase tracking-wider">
                            {expert.specialty}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold text-foreground">
                            {expert.rating}
                          </span>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-sm text-muted-foreground mb-6 line-clamp-2 italic">
                        "{expert.bio}"
                      </p>

                      {/* Rates */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-muted px-4 py-3 rounded-xl border border-border/50 transition-colors hover:border-primary/30">
                          <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold mb-1">Daily Access</p>
                          <p className="text-lg font-black text-primary">₹{expert.daily_rate}</p>
                        </div>
                        <div className="bg-primary/5 px-4 py-3 rounded-xl border border-primary/20 transition-colors hover:border-primary/40">
                          <p className="text-[10px] uppercase tracking-tighter text-primary/70 font-bold mb-1">Monthly Plan</p>
                          <p className="text-lg font-black text-primary">₹{expert.monthly_rate}</p>
                        </div>
                      </div>

                      {/* Details Row */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                              expert.availability_status === "available"
                                ? "bg-success"
                                : "bg-muted-foreground"
                            }`}
                          />
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {expert.availability_status}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {expert.reviews_count} Reviews
                        </span>
                      </div>

                      {/* Languages */}
                      {expert.languages && expert.languages.length > 0 && (
                        <div className="mb-6 flex flex-wrap gap-2">
                          {expert.languages.slice(0, 3).map((lang) => (
                            <span
                              key={lang}
                              className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-1 rounded-md uppercase border border-border/50"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Book Button */}
                      <Dialog open={bookingDialogOpen && selectedExpert?.id === expert.id} onOpenChange={(open) => {
                        if (!open) setSelectedExpert(null);
                        setBookingDialogOpen(open);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full h-12 text-sm font-bold uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                            onClick={() => {
                              setSelectedExpert(expert);
                              setBookingDialogOpen(true);
                            }}
                          >
                            Explore Profile & Book
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader className="mb-6">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-primary/20 flex-shrink-0">
                                    <img src={expert.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.name}`} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black text-foreground">{expert.name}</DialogTitle>
                                    <DialogDescription className="text-primary font-bold uppercase tracking-widest text-xs mt-1">
                                        {expert.specialty} • {expert.experience_years}+ Years Experience
                                    </DialogDescription>
                                </div>
                            </div>
                          </DialogHeader>

                          <div className="space-y-8">
                            {/* Detailed Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="font-black text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" /> Professional Bio
                                    </Label>
                                    <p className="text-sm leading-relaxed text-foreground/80 bg-muted/30 p-4 rounded-xl border border-border/50 italic">
                                        "{expert.bio}"
                                    </p>
                                    
                                    <div className="space-y-4 pt-2">
                                        <Label className="font-black text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <Star className="w-4 h-4" /> Certifications & Skills
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {expert.certifications?.map(cert => (
                                                <span key={cert} className="text-[10px] font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/10">
                                                    {cert}
                                                </span>
                                            ))}
                                            {expert.languages?.map(lang => (
                                                <span key={lang} className="text-[10px] font-bold bg-muted text-muted-foreground px-3 py-1.5 rounded-full border border-border/50">
                                                    {lang}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Duration Selection */}
                                    <div className="space-y-4">
                                        <Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">Select Support Plan</Label>
                                        <div className="grid grid-cols-1 gap-3">
                                            <button
                                              onClick={() => setBookingDuration("daily")}
                                              className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left group ${
                                                bookingDuration === "daily" 
                                                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                                                  : "bg-background text-foreground border-border/50 hover:border-primary/50"
                                              }`}
                                            >
                                              <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${bookingDuration === "daily" ? "bg-white/20" : "bg-primary/5"}`}>
                                                    <Clock className={`w-5 h-5 ${bookingDuration === "daily" ? "text-white" : "text-primary"}`} />
                                                </div>
                                                <div>
                                                    <p className="font-bold">Instant Consultation</p>
                                                    <p className={`text-[10px] uppercase font-bold tracking-widest ${bookingDuration === "daily" ? "text-white/80" : "text-muted-foreground"}`}>1 Day Access</p>
                                                </div>
                                              </div>
                                              <p className="text-lg font-black">₹{expert.daily_rate}</p>
                                            </button>

                                            <button
                                              onClick={() => setBookingDuration("monthly")}
                                              className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left group ${
                                                bookingDuration === "monthly" 
                                                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                                                  : "bg-background text-foreground border-border/50 hover:border-primary/50"
                                              }`}
                                            >
                                              <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${bookingDuration === "monthly" ? "bg-white/20" : "bg-primary/5"}`}>
                                                    <Calendar className={`w-5 h-5 ${bookingDuration === "monthly" ? "text-white" : "text-primary"}`} />
                                                </div>
                                                <div>
                                                    <p className="font-bold">Monthly Expert Care</p>
                                                    <p className={`text-[10px] uppercase font-bold tracking-widest ${bookingDuration === "monthly" ? "text-white/80" : "text-muted-foreground"}`}>Unlimited Support</p>
                                                </div>
                                              </div>
                                              <p className="text-lg font-black">₹{expert.monthly_rate}</p>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Date Selection */}
                                    <div className="space-y-4">
                                        <Label htmlFor="booking-date" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Preferred Start Date</Label>
                                        <Input
                                            id="booking-date"
                                            type="date"
                                            value={bookingDate}
                                            onChange={(e) => setBookingDate(e.target.value)}
                                            min={new Date().toISOString().split("T")[0]}
                                            className="h-12 font-bold bg-muted/30 border-border/50 rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Privacy Notice */}
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    <span className="font-bold text-primary mr-1 uppercase">Instant Activation:</span> 
                                    Once confirmed, you will receive expert's official WhatsApp and Email contact for real-time support. All consultations are 100% money-back guaranteed.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4 sticky bottom-0 bg-background/80 backdrop-blur-sm py-4 border-t border-border/50 mt-auto">
                              <Button
                                variant="ghost"
                                onClick={() => setBookingDialogOpen(false)}
                                className="flex-1 font-bold uppercase tracking-widest text-xs h-12"
                              >
                                Go Back
                              </Button>
                              <Button
                                onClick={handleBooking}
                                disabled={!bookingDate || processingPayment}
                                className="flex-[2] h-12 font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-sm shadow-xl shadow-primary/30"
                              >
                                {processingPayment ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Verifying Payment...
                                  </>
                                ) : (
                                  <>
                                    Start Consultation & Pay ₹{bookingDuration === "daily" ? expert.daily_rate : expert.monthly_rate}
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty state when not logged in */}
        {!user && (
          <Card className="text-center py-12 border-2 border-dashed">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium mb-2">
              Please log in to book a consultation
            </p>
            <Button onClick={() => window.location.href = "/auth"}>
              Sign In / Sign Up
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
