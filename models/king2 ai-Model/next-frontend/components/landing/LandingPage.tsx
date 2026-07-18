'use client';

import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { HowItWorks } from './HowItWorks';
import { ModelsShowcase } from './ModelsShowcase';
import { CTASection } from './CTASection';
import { Footer } from './Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-primary">
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <ModelsShowcase />
      <CTASection />
      <Footer />
    </div>
  );
}
