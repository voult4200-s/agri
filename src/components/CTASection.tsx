import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-14 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="gradient-hero rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(30_88%_65%/0.15),transparent)]" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-heading font-bold text-primary-foreground mb-3 sm:mb-4">
              Ready to Farm Smarter?
            </h2>
            <p className="text-primary-foreground/80 text-sm sm:text-lg max-w-xl mx-auto mb-6 sm:mb-8">
              Join 10,000+ farmers who are already growing more and earning better with AI-powered insights.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="gradient-warm text-secondary-foreground border-0 hover:opacity-90 text-base px-8 h-12 shadow-lg"
                asChild
              >
                <Link to="/dashboard">
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 hover:text-primary-foreground text-base px-8 h-12"
              >
                Talk to an Expert
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
