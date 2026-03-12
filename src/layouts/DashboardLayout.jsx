import Header from "./Header";
import Footer from "./Footer";

export default function DashboardLayout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />

      <main className="flex-grow-1" style={{ backgroundColor: "#f8f9fa" }}>
        {children}
      </main>

      <Footer />
    </div>
  );
}