import { DeliveryInfo } from "@/components/DeliveryInfo";
import { Footer } from "@/components/Footer";
import { Freshness } from "@/components/Freshness";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { OrderSection } from "@/components/OrderSection";
import { ProductCatalog } from "@/components/ProductCatalog";
import { Subscription } from "@/components/Subscription";

// Даты ближайшей обжарки в hero пересчитываются раз в час.
export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link">
        К содержанию
      </a>
      <Header />
      <main id="main">
        <span id="top" />
        <Hero />
        <Freshness />
        <ProductCatalog />
        <Subscription />
        <DeliveryInfo />
        <OrderSection />
      </main>
      <Footer />
    </>
  );
}
