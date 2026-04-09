import {
  Navbar,
  HeroSection,
  StatsSection,
  FeaturesSection,
  AISection,
  HowItWorksSection,
  PartnersSection,
  TestimonialsSection,
  PricingSection,
  FAQSection,
  NewsletterSection,
  CTASection,
  Footer,
} from "@/components/modules/Home";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
		<AISection />
        <FeaturesSection />
        <HowItWorksSection />
        <PartnersSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <NewsletterSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
