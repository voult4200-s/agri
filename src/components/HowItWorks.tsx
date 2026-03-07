import { MapPin, Brain, LineChart, Rocket } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { icon: MapPin, title: "Enter Farm Details", desc: "Share your location, soil type, and resources — it takes just 2 minutes.", step: "01" },
  { icon: Brain, title: "AI Analysis", desc: "Our AI analyzes soil, climate, market data, and 100+ parameters instantly.", step: "02" },
  { icon: LineChart, title: "Get Recommendations", desc: "Receive crop suggestions ranked by profitability, risk, and suitability.", step: "03" },
  { icon: Rocket, title: "Grow & Sell", desc: "Buy inputs, track growth, store harvest, and sell directly to buyers.", step: "04" },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 gradient-hero">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-widest">Simple Process</span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-heading font-bold text-primary-foreground mt-2 mb-4">
            How KrishiGrowAI Works
          </h2>
          <p className="text-primary-foreground/70 max-w-xl mx-auto text-sm sm:text-lg">
            Four simple steps to transform your farming journey.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-10 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-5">
                  <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300">
                    <step.icon className="w-8 h-8 text-accent" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base sm:text-lg text-primary-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-primary-foreground/60 text-xs sm:text-sm leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
