import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const navLinks = [
  { labelKey: "navbar.features", href: "#features" },
  { labelKey: "navbar.howItWorks", href: "#how-it-works" },
  { labelKey: "navbar.marketplace", href: "#marketplace" },
  { labelKey: "navbar.community", href: "#community" },
];

export default function Navbar() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      const sections = navLinks.map((link) => link.href.slice(1));
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(`#${section}`);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-6 gap-4">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0 min-w-0">
          <BrandLogo size="md" variant="onDark" />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 shrink-0">
          {navLinks.map((link) => (
            <a
              key={link.labelKey}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeSection === link.href
                  ? "text-white dark:text-black bg-white/5 dark:bg-black/10"
                  : "text-white/60 dark:text-black/70 hover:text-white dark:hover:text-black hover:bg-white/5 dark:hover:bg-black/10"
              }`}
            >
              {t(link.labelKey)}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher className="border-white/10 bg-white/5 text-white/70" />
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white/60 dark:text-black/70 hover:text-white dark:hover:text-black hover:bg-white/5 dark:hover:bg-black/10 font-medium"
            asChild
          >
            <Link to="/auth">{t("navbar.login")}</Link>
          </Button>
          <Button
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-5 rounded-lg shadow-lg shadow-emerald-500/20"
            asChild
          >
            <Link to="/auth">{t("navbar.getStarted")}</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 text-white hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.labelKey}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    activeSection === link.href
                      ? "text-white dark:text-black bg-white/5 dark:bg-black/10"
                      : "text-white/60 dark:text-black/70 hover:text-white dark:hover:text-black hover:bg-white/5 dark:hover:bg-black/10"
                  }`}
                >
                  {t(link.labelKey)}
                </a>
              ))}
              <div className="pt-2 space-y-2">
                <LanguageSwitcher className="w-full justify-center border-white/10 bg-white/5 text-white/80" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-transparent border-white/20 text-white/80 hover:text-white hover:bg-white/10"
                  asChild
                >
                  <Link to="/auth">{t("navbar.login")}</Link>
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
                  asChild
                >
                  <Link to="/auth">{t("navbar.getStarted")}</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
