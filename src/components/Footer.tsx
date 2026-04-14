import { Sprout, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";
import { useTranslation } from "react-i18next";

const footerLinks = {
  Platform: ["AI Recommendations", "Marketplace", "Storage Solutions", "Direct Sales", "Weather"],
  Resources: ["Knowledge Base", "Community Forum", "Expert Consultation", "Blog", "FAQs"],
  Company: ["About Us", "Careers", "Contact", "Privacy Policy", "Terms of Service"],
};

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-foreground text-background/80">
      {/* Wave */}
      <svg className="w-full -mb-1" viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none" style={{ height: 60 }}>
        <path d="M0 60V20C240 0 480 40 720 30C960 20 1200 0 1440 20V60H0Z" fill="hsl(var(--background))" />
      </svg>

      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-8 sm:gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BrandLogo size="md" animated={false} />
            </div>
            <p className="text-background/60 text-xs sm:text-sm mb-4 sm:mb-6 max-w-xs leading-relaxed">
              {t("home.footer.description", { defaultValue: "Empowering farmers with AI-driven insights, a complete marketplace, and direct market connections for a smarter, more profitable harvest." })}
            </p>
            <div className="flex flex-col gap-2 text-xs sm:text-sm text-background/60">
              <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> {t("home.footer.contact.email", { defaultValue: "support@krishigrowai.com" })}</span>
              <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> {t("home.footer.contact.phone", { defaultValue: "+91-7908242467" })}</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {t("home.footer.contact.location", { defaultValue: "kolkata, India" })}</span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links], sectionIdx) => (
            <div key={title}>
              <h4 className="font-heading font-semibold text-background mb-4 text-sm">{t(`home.footer.sections.${sectionIdx}.title`, { defaultValue: title })}</h4>
              <ul className="space-y-2.5">
                {links.map((link, linkIdx) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-background/50 hover:text-accent transition-colors">{t(`home.footer.sections.${sectionIdx}.links.${linkIdx}`, { defaultValue: link })}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-background/10 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-xs text-background/40">{t("home.footer.copyright", { defaultValue: "© 2026 KrishiGrowAI. All rights reserved." })}</p>
          <p className="text-xs text-background/40">{t("home.footer.tagline", { defaultValue: "Made with ❤️ for Indian Farmers" })}</p>
        </div>
      </div>
    </footer>
  );
}
