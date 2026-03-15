import Header from "./Header";
import Footer from "./Footer";
import HeroBanner from "../modules/dashboard/components/HeroBanner";

export default function DashboardLayout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100 gs-dashboard-layout">
      <Header />

      <main className="flex-grow-1 gs-layout-main py-4">
        <div className="container mb-4">
          <HeroBanner />
        </div>
        {children}
      </main>

      <Footer />
    </div>
  );
}
