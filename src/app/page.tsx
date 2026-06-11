'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PromoSection from '@/components/home/PromoSection';
import Testimonials from '@/components/home/Testimonials';
import CTASection from '@/components/home/CTASection';
import ProductCatalog from '@/components/products/ProductCatalog';
import ProductDetail from '@/components/products/ProductDetail';
import { useStore } from '@/store/useStore';

export default function Home() {
  const currentView = useStore((s) => s.currentView);
  const selectedProductId = useStore((s) => s.selectedProduct?.id);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        {currentView === 'home' && <HomePage />}
        {currentView === 'catalog' && <ProductCatalog />}
        {currentView === 'product' && <ProductDetail key={selectedProductId} />}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <FeaturedProducts />
      <PromoSection />
      <Testimonials />
      <CTASection />
    </>
  );
}
