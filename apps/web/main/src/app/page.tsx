import Header from "@main/components/landing/Header";
import AssistantFeatureSection from "@main/components/landing/AssistantFeatureSection";
import PricingSection from "@main/components/landing/PricingSection";
import Footer from "@main/components/landing/Footer";
import Hero from "@main/components/landing/Hero";
import Features from "@main/components/landing/Features";
import FAQ from "@main/components/landing/FAQ";
import NewsCards from "@main/components/landing/NewsCard";
import ConsultForm from "@main/components/landing/ConsultForm";
import OperationsShowcase from "@main/components/landing/OperationsShowcase";
import { LandingSection, SectionHeader } from "@main/components/landing/LandingSection";

export default function Page() {
  return (
    <>
      <Header />
      <main className="overflow-x-hidden bg-white pt-20 text-slate-900">
        <Hero />
        <Features />
        <OperationsShowcase />
        <AssistantFeatureSection />
        <PricingSection />
        <ConsultForm />
        <FAQ />
        <LandingSection id="news" tone="soft">
          <SectionHeader
            eyebrow="Góc vận hành"
            title="Kiến thức bán lẻ để đội ngũ ra quyết định tốt hơn"
            description="Các bài viết ngắn gọn về kho, đơn hàng, dữ liệu và quy trình giúp cửa hàng nhỏ lẫn chuỗi bán lẻ vận hành chắc tay hơn."
          />
          <div className="mt-10">
            <NewsCards />
          </div>
        </LandingSection>
        <Footer />
      </main>
    </>
  );
}
