import { useTheme } from '../components/smarttime/ThemeContext';
import { LandingNav } from '../components/landing/LandingNav';
import { LandingHero } from '../components/landing/LandingHero';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { DashboardPreview } from '../components/landing/DashboardPreview';
import { StatsSection } from '../components/landing/StatsSection';
import { CTASection } from '../components/landing/CTASection';
import { LandingFooter } from '../components/landing/LandingFooter';

export function LandingPage() {
  const { colors } = useTheme();

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: colors.bg }}>
      <LandingNav />
      <LandingHero />
      <FeaturesSection />
      <HowItWorksSection />
      <DashboardPreview />
      <StatsSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
