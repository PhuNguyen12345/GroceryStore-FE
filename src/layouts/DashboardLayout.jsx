import Header from "./Header";
import Footer from "./Footer";
import HeroBanner from "../modules/dashboard/components/HeroBanner";
import BrandLogoStrip from "../modules/dashboard/components/BrandLogoStrip";
import PromoQuickLinks from "../modules/dashboard/components/PromoQuickLinks";
import FeaturedCategories from "../modules/dashboard/components/FeaturedCategories";
import FeaturedProducts from "../modules/dashboard/components/FeaturedProducts";
import BlogHighlights from "../modules/dashboard/components/BlogHighlights";

export default function DashboardLayout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100 gs-dashboard-layout">
      <Header />

      <main className="flex-grow-1 gs-layout-main py-4">
        <div className="container mb-4">
          <HeroBanner />
          <BrandLogoStrip />
          <PromoQuickLinks />
          <FeaturedCategories />
          <FeaturedProducts />
          <BlogHighlights />
        </div>
        {children}
      </main>

      <Footer />
    </div>
  );
}
