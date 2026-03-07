import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ShoppingCart, Star, Plus, Minus, X, Filter,
  Package, Leaf, Bug, Droplets, Wrench, Scissors, ChevronRight, CreditCard,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import PaymentDialog from "@/components/PaymentDialog";

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  inStock: boolean;
  badge?: string;
}

interface CartItem extends Product {
  qty: number;
}

const categoryIcons: Record<string, any> = {
  Seeds: Leaf, Fertilizers: Package, Pesticides: Bug,
  Irrigation: Droplets, Equipment: Wrench, Tools: Scissors,
};

const products: Product[] = [
  { id: 1, name: "Hybrid Wheat Seeds (HD-3226)", brand: "IARI", price: 850, originalPrice: 1000, rating: 4.7, reviews: 342, image: "🌾", category: "Seeds", inStock: true, badge: "Best Seller" },
  { id: 2, name: "Basmati Rice Seeds (Pusa-1509)", brand: "IARI", price: 1200, rating: 4.5, reviews: 218, image: "🍚", category: "Seeds", inStock: true },
  { id: 3, name: "Tomato Seeds (Arka Rakshak)", brand: "IIHR", price: 320, rating: 4.8, reviews: 567, image: "🍅", category: "Seeds", inStock: true, badge: "Popular" },
  { id: 4, name: "Mustard Seeds (Pusa Bold)", brand: "IARI", price: 480, rating: 4.3, reviews: 189, image: "🌻", category: "Seeds", inStock: true },
  { id: 5, name: "Onion Seeds (Agrifound Dark Red)", brand: "NHRDF", price: 650, rating: 4.6, reviews: 134, image: "🧅", category: "Seeds", inStock: false },
  { id: 6, name: "DAP Fertilizer (50kg)", brand: "IFFCO", price: 1350, rating: 4.4, reviews: 890, image: "📦", category: "Fertilizers", inStock: true, badge: "Top Rated" },
  { id: 7, name: "Urea (45kg)", brand: "NFL", price: 266, rating: 4.2, reviews: 1200, image: "🧪", category: "Fertilizers", inStock: true },
  { id: 8, name: "NPK 20:20:0 (50kg)", brand: "IFFCO", price: 1050, rating: 4.5, reviews: 456, image: "⚗️", category: "Fertilizers", inStock: true },
  { id: 9, name: "Vermicompost Organic (25kg)", brand: "GreenGold", price: 480, originalPrice: 550, rating: 4.9, reviews: 678, image: "🌿", category: "Fertilizers", inStock: true, badge: "Organic" },
  { id: 10, name: "Neem Oil (1L)", brand: "AgroNeem", price: 320, rating: 4.6, reviews: 345, image: "🍃", category: "Pesticides", inStock: true },
  { id: 11, name: "Chlorpyrifos 20% EC (1L)", brand: "Tata Rallis", price: 420, rating: 4.1, reviews: 234, image: "🔬", category: "Pesticides", inStock: true },
  { id: 12, name: "Fungicide Mancozeb (500g)", brand: "UPL", price: 280, rating: 4.3, reviews: 178, image: "🧫", category: "Pesticides", inStock: true },
  { id: 13, name: "Drip Irrigation Kit (1 acre)", brand: "Jain Irrigation", price: 12500, originalPrice: 15000, rating: 4.7, reviews: 89, image: "💧", category: "Irrigation", inStock: true },
  { id: 14, name: "Sprinkler Set (Quarter acre)", brand: "Netafim", price: 4500, rating: 4.4, reviews: 67, image: "🌧️", category: "Irrigation", inStock: true },
  { id: 15, name: "Water Pump 1HP", brand: "Kirloskar", price: 8500, rating: 4.6, reviews: 234, image: "⚡", category: "Equipment", inStock: true },
  { id: 16, name: "Manual Seed Drill", brand: "KSNM", price: 3200, rating: 4.2, reviews: 56, image: "🔧", category: "Equipment", inStock: true },
  { id: 17, name: "Solar Panel Kit (100W)", brand: "Loom Solar", price: 6800, originalPrice: 7500, rating: 4.8, reviews: 123, image: "☀️", category: "Equipment", inStock: true, badge: "Eco" },
  { id: 18, name: "Pruning Shears (Professional)", brand: "Falcon", price: 450, rating: 4.5, reviews: 312, image: "✂️", category: "Tools", inStock: true },
  { id: 19, name: "Garden Hoe (Heavy Duty)", brand: "Falcon", price: 380, rating: 4.3, reviews: 201, image: "🪓", category: "Tools", inStock: true },
  { id: 20, name: "Soil Testing Kit", brand: "Himedia", price: 2400, rating: 4.7, reviews: 89, image: "🧪", category: "Tools", inStock: true, badge: "New" },
];

const categories = ["All", "Seeds", "Fertilizers", "Pesticides", "Irrigation", "Equipment", "Tools"];

export default function Marketplace() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || p.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id);
      if (existing) return prev.map((c) => c.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...product, qty: 1 }];
    });
    toast({ title: "Added to cart", description: `${product.name} added` });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((c) => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter((c) => c.qty > 0)
    );
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const handleCheckoutSuccess = () => {
    setCart([]);
    setShowCart(false);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">🛒 Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">Seeds, fertilizers, equipment & more</p>
        </div>
        <Button variant="outline" className="relative" onClick={() => setShowCart(!showCart)}>
          <ShoppingCart className="w-4 h-4 mr-2" /> Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>
      </div>

      {/* Categories */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const Icon = categoryIcons[cat] || Package;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shrink-0 transition-all ${
                category === cat
                  ? "gradient-hero text-primary-foreground shadow-md"
                  : "glass-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat !== "All" && <Icon className="w-4 h-4" />}
              {cat}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search products, brands..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-6">
        {/* Product Grid */}
        <div className={`flex-1 grid grid-cols-1 sm:grid-cols-2 ${showCart ? "lg:grid-cols-2" : "lg:grid-cols-3"} gap-4`}>
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card-hover rounded-xl p-4 flex flex-col"
            >
              {product.badge && (
                <span className="self-start text-[10px] px-2 py-0.5 rounded-full gradient-warm text-secondary-foreground font-semibold mb-2">
                  {product.badge}
                </span>
              )}
              <div className="text-5xl text-center py-4">{product.image}</div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{product.brand}</p>
                <h3 className="font-heading font-semibold text-sm text-foreground mt-0.5 line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 text-accent fill-accent" />
                  <span className="text-xs font-numbers text-foreground">{product.rating}</span>
                  <span className="text-xs text-muted-foreground">({product.reviews})</span>
                </div>
              </div>
              <div className="flex items-end justify-between mt-3">
                <div>
                  <span className="font-numbers font-bold text-lg text-foreground">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through ml-1">₹{product.originalPrice.toLocaleString()}</span>
                  )}
                </div>
                <Button
                  size="sm"
                  disabled={!product.inStock}
                  onClick={() => addToCart(product)}
                  className="gradient-hero text-primary-foreground border-0 hover:opacity-90"
                >
                  {product.inStock ? <><Plus className="w-3 h-3 mr-1" /> Add</> : "Out of Stock"}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cart Sidebar */}
        <AnimatePresence>
          {showCart && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-80 shrink-0 hidden lg:block"
            >
              <div className="glass-card rounded-2xl p-5 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-foreground">Cart ({cartCount})</h3>
                  <button onClick={() => setShowCart(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <span className="text-2xl">{item.image}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground line-clamp-1">{item.name}</p>
                            <p className="text-xs text-muted-foreground font-numbers">₹{item.price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded bg-muted flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                            <span className="text-sm font-numbers w-6 text-center">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded bg-muted flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border mt-4 pt-4">
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-numbers font-bold text-foreground">₹{cartTotal.toLocaleString()}</span>
                      </div>
                      <Button
                        className="w-full gradient-warm text-secondary-foreground border-0 hover:opacity-90"
                        onClick={() => setPaymentOpen(true)}
                      >
                        <CreditCard className="w-4 h-4 mr-2" /> Checkout <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        amount={cartTotal}
        description={`Marketplace order — ${cartCount} items`}
        onSuccess={handleCheckoutSuccess}
      />
    </>
  );
}
