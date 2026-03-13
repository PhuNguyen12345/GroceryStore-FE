import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />

      <main className="flex-grow-1" style={{ backgroundColor: "#f8f9fa" }}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}