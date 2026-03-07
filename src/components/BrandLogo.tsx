import { motion } from "framer-motion";
import logo from "@/assets/logo.jpg";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showIcon?: boolean;
  animated?: boolean;
  className?: string;
  /** Use "onLight" when placed on light backgrounds */
  variant?: "onDark" | "onLight";
}

const sizeMap = {
  sm: { icon: "h-7 w-7", text: "text-base", ai: "text-[0.65em]" },
  md: { icon: "h-9 w-9", text: "text-lg", ai: "text-[0.65em]" },
  lg: { icon: "h-11 w-11", text: "text-xl", ai: "text-[0.65em]" },
  xl: { icon: "h-14 w-14", text: "text-3xl", ai: "text-[0.6em]" },
};

export default function BrandLogo({
  size = "md",
  showIcon = true,
  animated = true,
  className = "",
  variant = "onDark",
}: BrandLogoProps) {
  const s = sizeMap[size];

  const TextWrapper = animated ? motion.span : "span";
  const textProps = animated
    ? {
        initial: { opacity: 0, y: 5 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay: 0.2 },
      }
    : {};

  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      {showIcon && (
        <span className="relative shrink-0">
          <img
            src={logo}
            alt="KrishiGrowAI"
            className={`${s.icon} object-contain rounded-lg`}
          />
          {/* Subtle glow ring */}
          <span className="absolute inset-0 rounded-lg ring-1 ring-orange-400/20" />
        </span>
      )}

      <span className={`${s.text} font-bold tracking-tight leading-none whitespace-nowrap`}>
        {/* "Krishi" – adapts to background */}
        <TextWrapper
          {...(textProps as any)}
          className={`font-heading ${
            variant === "onLight"
              ? "text-gray-800"
              : "text-white"
          }`}
          style={{ display: "inline" }}
        >
          Krishi
        </TextWrapper>

        {/* "Grow" – vibrant orange */}
        <TextWrapper
          {...(animated
            ? {
                initial: { opacity: 0, y: 5 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.5, delay: 0.35 },
              }
            : ({} as any))}
          className="font-heading bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 bg-clip-text text-transparent"
          style={{ display: "inline", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          Grow
        </TextWrapper>

        {/* "AI" – accent badge style */}
        <TextWrapper
          {...(animated
            ? {
                initial: { opacity: 0, scale: 0.7 },
                animate: { opacity: 1, scale: 1 },
                transition: {
                  duration: 0.4,
                  delay: 0.5,
                  type: "spring",
                  stiffness: 200,
                },
              }
            : ({} as any))}
          className="relative inline-flex items-center ml-0.5"
        >
          <span
            className={`${s.ai} font-black font-heading tracking-widest uppercase
              bg-gradient-to-br from-orange-500 via-red-400 to-rose-400
              bg-clip-text text-transparent`}
            style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            AI
          </span>
          {/* Tiny sparkle dot */}
          {animated && (
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-0.5 -right-1.5 w-1.5 h-1.5 rounded-full bg-orange-400"
            />
          )}
        </TextWrapper>
      </span>
    </span>
  );
}
