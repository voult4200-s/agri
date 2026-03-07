import { ShoppingCart, Star, Truck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const products = [
  { name: "Hybrid Tomato Seeds", brand: "SeedTech Pro", price: "₹450", original: "₹650", rating: 4.8, reviews: 234, badge: "Bestseller", emoji: "🍅" },
  { name: "NPK 19-19-19 Fertilizer", brand: "GrowFast", price: "₹1,200", original: "₹1,500", rating: 4.6, reviews: 189, badge: "20% Off", emoji: "🧪" },
  { name: "Drip Irrigation Kit", brand: "AquaSmart", price: "₹3,499", original: "₹4,999", rating: 4.9, reviews: 412, badge: "Top Rated", emoji: "💧" },
  { name: "Neem Oil Pesticide", brand: "OrganicGuard", price: "₹350", original: "₹500", rating: 4.7, reviews: 156, badge: "Organic", emoji: "🌿" },
];

export default function MarketplacePreview() {
  return (
    <section id="marketplace" className="py-14 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="text-sm font-semibold text-commerce uppercase tracking-wider">Marketplace</span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-heading font-bold text-foreground mt-2 mb-4">
            Everything Your Farm <span className="text-gradient-warm">Needs</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-lg">
            Quality seeds, fertilizers, equipment, and tools — delivered to your doorstep.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
          {products.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card-hover rounded-2xl overflow-hidden group"
            >
              <div className="h-28 sm:h-40 bg-muted/50 flex items-center justify-center text-4xl sm:text-6xl relative">
                {p.emoji}
                <span className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full gradient-warm text-secondary-foreground">
                  {p.badge}
                </span>
              </div>
              <div className="p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">{p.brand}</p>
                <h3 className="font-heading font-semibold text-xs sm:text-sm text-foreground mb-1.5 sm:mb-2 line-clamp-2">{p.name}</h3>
                <div className="flex items-center gap-1 mb-2 sm:mb-3">
                  <Star className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-accent text-accent" />
                  <span className="text-[10px] sm:text-xs font-mono font-medium text-foreground">{p.rating}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">({p.reviews})</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-sm sm:text-base text-foreground">{p.price}</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground line-through ml-1 sm:ml-2">{p.original}</span>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <ShoppingCart className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-8 text-muted-foreground"
        >
          {[
            { icon: Truck, label: "Free Delivery above ₹999" },
            { icon: Shield, label: "100% Genuine Products" },
            { icon: Star, label: "Quality Guaranteed" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <item.icon className="w-4 h-4 text-primary" />
              <span>{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
