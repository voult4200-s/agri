import { Bot, CloudSun, TrendingUp, ShoppingCart, Warehouse, Handshake, MessageCircle, BookOpen, Calculator, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Bot, title: "AI Crop Advisor", desc: "Get personalized crop recommendations based on your soil, climate, and market conditions.", gradient: "from-emerald-500 to-teal-400", glow: "hover:shadow-emerald-500/20" },
  { icon: CloudSun, title: "Weather Intelligence", desc: "7-day forecasts with agriculture-specific advisories and smart alerts.", gradient: "from-sky-500 to-cyan-400", glow: "hover:shadow-sky-500/20" },
  { icon: TrendingUp, title: "Market Analytics", desc: "Real-time mandi prices, trends, and AI-powered price predictions.", gradient: "from-violet-500 to-purple-400", glow: "hover:shadow-violet-500/20" },
  { icon: ShoppingCart, title: "E-Commerce Marketplace", desc: "Buy seeds, fertilizers, equipment, and everything your farm needs.", gradient: "from-orange-500 to-amber-400", glow: "hover:shadow-orange-500/20" },
  { icon: Warehouse, title: "Storage Solutions", desc: "Book cold storage and warehouses with real-time quality monitoring.", gradient: "from-blue-500 to-indigo-400", glow: "hover:shadow-blue-500/20" },
  { icon: Handshake, title: "Farmer-to-Market", desc: "Sell directly to buyers — skip middlemen, earn more per harvest.", gradient: "from-green-500 to-lime-400", glow: "hover:shadow-green-500/20" },
  { icon: MessageCircle, title: "AI Chatbot", desc: "Ask farming questions, identify pests, and get instant expert advice.", gradient: "from-emerald-500 to-teal-400", glow: "hover:shadow-emerald-500/20" },
  { icon: BookOpen, title: "Knowledge Base", desc: "Learn modern farming techniques with guides, videos, and expert articles.", gradient: "from-sky-500 to-cyan-400", glow: "hover:shadow-sky-500/20" },
  { icon: Calculator, title: "Financial Tools", desc: "ROI calculator, expense tracker, and government subsidy finder.", gradient: "from-rose-500 to-pink-400", glow: "hover:shadow-rose-500/20" },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-14 sm:py-24 bg-background grain-texture">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Everything You Need</span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-heading font-bold text-foreground mt-2 mb-4">
            One Platform, Complete <span className="text-gradient-warm">Farm Management</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-lg">
            From planning and planting to selling and earning — KrishiGrowAI is your trusted farming companion.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.45 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`group relative cursor-pointer rounded-2xl p-5 sm:p-6 border border-border/60 bg-card overflow-hidden
                shadow-md hover:shadow-xl transition-shadow duration-300 ${f.glow}`}
            >
              {/* Top gradient stripe */}
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`} />

              {/* Subtle background glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-[0.05] transition-opacity duration-300`} />

              <div className="relative">
                {/* Icon + Arrow row */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className="w-5 h-5 text-white" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground/60 -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
                </div>

                <h3 className="font-heading font-semibold text-base sm:text-lg text-foreground mb-1.5 group-hover:text-foreground transition-colors">
                  {f.title}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
