import Header from "./Header";
import Footer from "./Footer";

export default function DashboardLayout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100 gs-dashboard-layout">
      <Header />

      <main className="flex-grow-1 gs-layout-main">
        {children}
      </main>

      <Footer />
    </div>
  );
}
