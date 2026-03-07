import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const testimonials = [
  {
    name: "Rajesh Kumar",
    location: "Madhya Pradesh",
    text: "KrishiGrowAI recommended soybean for my farm and it gave me 40% more profit than last year's wheat crop. The market price alerts helped me sell at the best time.",
    rating: 5,
    crop: "Soybean",
    initials: "RK",
  },
  {
    name: "Priya Devi",
    location: "Bihar",
    text: "The cold storage booking saved my tomato harvest from spoiling. I was also able to sell directly to a restaurant chain through the marketplace — no middlemen!",
    rating: 5,
    crop: "Tomato",
    initials: "PD",
  },
  {
    name: "Arun Patel",
    location: "Gujarat",
    text: "I used to check mandi prices manually every morning. Now I get instant alerts and AI predictions. My income has gone up by 30% in just one season of using this platform.",
    rating: 5,
    crop: "Cotton",
    initials: "AP",
  },
  {
    name: "Sunita Sharma",
    location: "Rajasthan",
    text: "The AI chatbot identified a pest attack on my cumin crop within seconds from just a photo. Saved my entire harvest worth ₹3 lakhs. This app is a lifesaver!",
    rating: 5,
    crop: "Cumin",
    initials: "SS",
  },
  {
    name: "Mohan Das",
    location: "West Bengal",
    text: "I was confused about which rice variety to plant. The AI analyzed my soil type, rainfall data, and market trends — recommended Swarna variety. Best decision ever!",
    rating: 5,
    crop: "Rice",
    initials: "MD",
  },
  {
    name: "Kavita Yadav",
    location: "Uttar Pradesh",
    text: "The financial tools helped me find a government subsidy I didn't even know existed. Got ₹25,000 under PM-KISAN and crop insurance all through this one platform.",
    rating: 5,
    crop: "Wheat",
    initials: "KY",
  },
  {
    name: "Ravi Reddy",
    location: "Telangana",
    text: "Selling chillies directly to buyers through the marketplace got me 60% more than what the local middleman was offering. No more commission cuts!",
    rating: 5,
    crop: "Chillies",
    initials: "RR",
  },
  {
    name: "Lakshmi Naik",
    location: "Karnataka",
    text: "Weather alerts warned me about unexpected rains 3 days before they hit. I harvested my ragi early and saved the entire crop. My neighbors weren't so lucky.",
    rating: 5,
    crop: "Ragi",
    initials: "LN",
  },
  {
    name: "Baldev Singh",
    location: "Punjab",
    text: "The ROI calculator showed me that shifting from wheat to mustard would give better returns this season. Tried it — earned 45% more profit. Incredible tool!",
    rating: 5,
    crop: "Mustard",
    initials: "BS",
  },
  {
    name: "Geeta Kumari",
    location: "Jharkhand",
    text: "I'm a first-generation farmer. The knowledge base taught me everything — from soil testing to drip irrigation. Now my marigold farm earns ₹50,000/month!",
    rating: 5,
    crop: "Marigold",
    initials: "GK",
  },
  {
    name: "Dinesh Choudhary",
    location: "Maharashtra",
    text: "Booked cold storage for my onion crop through the app when prices were low. Sold 2 months later when prices doubled. Smart storage = smart money!",
    rating: 5,
    crop: "Onion",
    initials: "DC",
  },
  {
    name: "Anita Devi",
    location: "Haryana",
    text: "The community forum connected me with organic farming experts. Switched to organic tomatoes — now I sell at premium rates to big supermarket chains directly.",
    rating: 5,
    crop: "Tomato",
    initials: "AD",
  },
];

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 w-[280px] sm:w-[340px] shrink-0 flex flex-col justify-between hover:shadow-[var(--shadow-hover)] hover:-translate-y-1 transition-all duration-300">
      <div>
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: t.rating }).map((_, j) => (
            <Star key={j} className="w-3.5 h-3.5 fill-accent text-accent" />
          ))}
        </div>
        <p className="text-foreground/80 mb-5 leading-relaxed text-sm line-clamp-4">"{t.text}"</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-heading font-bold text-sm shrink-0">
          {t.initials}
        </div>
        <div className="min-w-0">
          <p className="font-heading font-semibold text-sm text-foreground truncate">{t.name}</p>
          <p className="text-xs text-muted-foreground truncate">{t.location} · {t.crop} Farmer</p>
        </div>
      </div>
    </div>
  );
}

/* Infinite scrolling row */
function ScrollingRow({ items, direction = "left", speed = 35 }: { items: typeof testimonials; direction?: "left" | "right"; speed?: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animId: number;
    let pos = direction === "left" ? 0 : -(el.scrollWidth / 2);

    const step = () => {
      if (direction === "left") {
        pos -= 0.5;
        if (Math.abs(pos) >= el.scrollWidth / 2) pos = 0;
      } else {
        pos += 0.5;
        if (pos >= 0) pos = -(el.scrollWidth / 2);
      }
      el.style.transform = `translateX(${pos}px)`;
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    // Pause on hover
    const pause = () => cancelAnimationFrame(animId);
    const resume = () => { animId = requestAnimationFrame(step); };
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume);

    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
    };
  }, [direction, speed]);

  // Duplicate items for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden">
      <div ref={scrollRef} className="flex gap-4 sm:gap-6 will-change-transform">
        {doubled.map((t, i) => (
          <TestimonialCard key={`${t.initials}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="community" className="py-14 sm:py-24 bg-muted/50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Real Stories</span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-heading font-bold text-foreground mt-2 mb-3">
            Trusted by <span className="text-gradient-warm">Thousands</span> of Farmers
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            Hear from real farmers who transformed their harvest and income with KrishiGrowAI.
          </p>
        </motion.div>
      </div>

      {/* Single row — scrolls left */}
      <ScrollingRow items={testimonials} direction="left" speed={35} />
    </section>
  );
}
