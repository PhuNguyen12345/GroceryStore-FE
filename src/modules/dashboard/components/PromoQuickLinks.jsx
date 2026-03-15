import { Link } from "react-router-dom";

const quickLinks = [
  {
    id: "voucher",
    title: "Bộ Voucher Tháng Này",
    subtitle: "Bấm để xem danh sách voucher chi tiết tại cửa hàng",
    to: "/uu-dai-voucher",
    imageUrl: "http://localhost:8080/uploads/images/voucher.png",
  },
  {
    id: "store-info",
    title: "Mua Tại Cửa Hàng",
    subtitle: "Xem giờ mở cửa, địa chỉ và tư vấn tại quầy",
    to: "/thong-tin-cua-hang",
    imageUrl: "http://localhost:8080/uploads/images/grocery.png",
  },
];

export default function PromoQuickLinks() {
  return (
    <section className="promo-quick-links mt-4">
      <div className="promo-quick-links-grid">
        {quickLinks.map((item) => (
          <Link key={item.id} to={item.to} className="promo-quick-link-card">
            <img src={item.imageUrl} alt={item.title} className="promo-quick-link-image" loading="lazy" />
            <div className="promo-quick-link-overlay">
              <h5>{item.title}</h5>
              <p>{item.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
