import React from 'react';
import HeroSection from './HeroSection';
import OfflineFeatures from './OfflineFeatures';
import FeaturesSection from './FeaturesSection';
import SolutionClusters from './SolutionClusters';
import HowItWorksSection from './HowItWorksSection';
import UseCasesSection from './UseCasesSection';
//import TeamSection from './TeamSection';
import PricingSection from './PricingSection';
import TestimonialsSection from './TestimonialsSection';
import FAQSection from './FAQSection';
import CTASection from './CTASection';
import FeatureScreens from './FeatureScreens';
import MockupScreens from './MockupScreens';
import Footer from './Footer';
import Navbar from './Navbar';
import WhatsAppChatPopup from './WhatsAppChatPopup';
//import WarehouseCTASection from './WarehouseCTASection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <WhatsAppChatPopup />
      <Navbar />
      <main>
        <HeroSection />
        <OfflineFeatures />
        <FeatureScreens />
        <FeaturesSection />
        <SolutionClusters />
        <MockupScreens />
        {/*<WarehouseCTASection/> 
        {/*<TeamSection>*/}
        <HowItWorksSection />
        <UseCasesSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}