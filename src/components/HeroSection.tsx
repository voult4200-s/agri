import { Link } from "react-router-dom";
import { ArrowRight, Play, Users, Wheat, TrendingUp, IndianRupee, Leaf, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import heroImage from "@/assets/hero-ferm.png";
import Hero3DScene from "@/components/Hero3DScene";
import { useTranslation } from "react-i18next";

/* ── Handwriting Typewriter Component ─────────────────── */
function HandwritingText({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) {
  const [displayedChars, setDisplayedChars] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setDisplayedChars(i);
        if (i >= text.length) {
          clearInterval(interval);
          // Hide cursor after typing finishes
          setTimeout(() => setShowCursor(false), 400); // Reduced from 800ms
        }
      }, 50 + Math.random() * 30); // Reduced from 70+40ms for faster typing
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(startTimeout);
  }, [text, delay]);

  return (
    <span className={`font-handwriting ${className}`}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 8, rotateZ: -3 }}
          animate={
            i < displayedChars
              ? { opacity: 1, y: 0, rotateZ: 0 }
              : { opacity: 0, y: 8, rotateZ: -3 }
          }
          transition={{
            duration: 0.1, // Reduced from 0.15
            ease: "easeOut",
          }}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {char}
        </motion.span>
      ))}
      {showCursor && displayedChars < text.length && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }} // Reduced from 0.8
          className="inline-block w-[3px] h-[0.8em] bg-current ml-0.5 align-middle rounded-full"
        />
      )}
    </span>
  );
}

const stats = [
  { icon: Users, value: "10K+", labelKey: "stats.farmers" },
  { icon: Wheat, value: "500+", labelKey: "stats.crops" },
  { icon: TrendingUp, value: "95%", labelKey: "stats.successRate" },
  { icon: IndianRupee, value: "₹50Cr+", labelKey: "stats.transactions" },
];

const floatingCards = [
  { icon: Leaf, text: "Soil Analysis", color: "from-success/80 to-success/40", delay: 0.5 }, // Reduced from 0.9
  { icon: Sparkles, text: "AI Powered", color: "from-accent/80 to-accent/40", delay: 0.7 }, // Reduced from 1.1
];

export default function HeroSection() {
  const { t } = useTranslation();
  const fixedHeadline = {
    line1: "Grow Smarter",
    connector: "with",
  };

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* Background Image with Parallax Feel */}
      <div className="absolute inset-0">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.0, ease: "easeOut" }} // Reduced from 1.5
          src={heroImage}
          alt="Smart farming landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/60 to-foreground/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-foreground/30" />
      </div>

      {/* Animated Grain Overlay */}
      <div className="absolute inset-0 grain-texture pointer-events-none" />

      {/* Floating Orbs */}
      <motion.div
        animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} // Reduced from 8
        className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-accent/10 blur-3xl"
      />
      <motion.div
        animate={{ y: [15, -15, 15], x: [10, -10, 10] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} // Reduced from 10
        className="absolute bottom-1/3 right-1/3 w-48 h-48 rounded-full bg-success/10 blur-3xl"
      />

      <div className="relative container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16 sm:pb-20">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          {/* Left Content — 3 cols */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full bg-success/15 border border-success/25 backdrop-blur-sm mb-5 sm:mb-8"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
              </span>
              <span className="text-xs sm:text-sm font-medium text-success tracking-wide">{t("hero.badge")}</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="mb-4 sm:mb-6"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.15]">
                <span className="block">
                  <HandwritingText
                    text={fixedHeadline.line1}
                    delay={0.5}
                    className="text-background font-bold text-[1.15em]"
                  />
                </span>
                <span className="block mt-1">
                  <HandwritingText
                    text={`${fixedHeadline.connector} `}
                    delay={1.6}
                    className="text-background font-bold text-[1.15em]"
                  />
                  <span className="relative inline-block">
                    <HandwritingText
                      text="Krishi"
                      delay={2.0}
                      className="text-background font-bold text-[1.15em]"
                    />
                    <HandwritingText
                      text="Grow"
                      delay={2.5}
                      className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 bg-clip-text text-transparent font-bold text-[1.15em] tracking-wide"
                    />
                    <motion.span
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.5, delay: 2.5 }} // Reduced from 0.8, 3.5
                      className="absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400"
                    />
                  </span>
                  <span className="inline-block w-2" />
                  <HandwritingText
                    text="AI"
                    delay={3.1}
                    className="bg-gradient-to-br from-orange-500 via-red-400 to-rose-400 bg-clip-text text-transparent font-black text-[1.15em] tracking-widest"
                  />
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="text-sm sm:text-base md:text-lg text-background/75 mb-6 sm:mb-10 max-w-xl leading-relaxed"
            >
              {t("hero.description")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
              className="flex flex-wrap gap-3 sm:gap-4 mb-8 sm:mb-14"
            >
              <Button
                size="lg"
                className="gradient-warm text-secondary-foreground border-0 hover:opacity-90 text-sm sm:text-base px-6 sm:px-8 h-11 sm:h-13 shadow-lg shadow-secondary/25 rounded-xl group flex-1 sm:flex-none min-w-0"
                asChild
              >
                <Link to="/auth">
                  {t("hero.startFree")}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-background/20 text-background bg-background/5 backdrop-blur-md hover:bg-background/15 hover:text-background text-sm sm:text-base px-6 sm:px-8 h-11 sm:h-13 rounded-xl flex-1 sm:flex-none min-w-0"
                asChild
              >
                <a
                  href="https://youtu.be/PhWjIH4LfjI" // Placeholder URL
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Watch Agri Companion demo on YouTube"
                >
                  <Play className="mr-2 w-4 h-4" />
                  {t("hero.watchDemo")}
                </a>
              </Button>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }} // Reduced from 0.7, 0.8
              className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6 md:gap-8"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.labelKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }} // Reduced from 0.9, 0.1
                  className="text-center"
                >
                  <div className="font-mono font-bold text-xl sm:text-2xl md:text-3xl text-background">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-background/50 mt-0.5 uppercase tracking-wider">{t(stat.labelKey)}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right — Interactive 3D Model — 2 cols */}
          <div className="lg:col-span-2 hidden lg:flex flex-col items-center justify-center relative">
            <motion.div
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }} // Reduced from 0.8, 0.7
              className="relative w-full h-[400px] xl:h-[600px]"
            >
              {/* 3D Scene */}
              <div className="relative w-full h-full">
                <Hero3DScene />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" className="w-full" preserveAspectRatio="none">
          <path
            d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
