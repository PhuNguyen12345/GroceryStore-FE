import Header from "../../../layouts/Header";
import Footer from "../../../layouts/Footer";

const voucherGallery = [
  {
    imageUrl: "http://localhost:8080/uploads/images/voucher1.png",
    title: "Voucher 200K",
    description: "Giảm 200.000đ cho đơn mua sắm đủ điều kiện.",
    note: "Hiệu lực đến hết tháng.",
  },
  {
    imageUrl: "http://localhost:8080/uploads/images/voucher2.png",
    title: "Voucher 15%",
    description: "Giảm 15% cho nhóm hàng tiêu dùng nhanh.",
    note: "Giảm tối đa theo chương trình.",
  },
  {
    imageUrl: "http://localhost:8080/uploads/images/voucher3.png",
    title: "Voucher Khách Mới",
    description: "Ưu đãi cho khách hàng mới mua tại cửa hàng.",
    note: "Áp dụng 1 lần/tài khoản.",
  },
  {
    imageUrl: "http://localhost:8080/uploads/images/voucher4.png",
    title: "Voucher Cuối Tuần",
    description: "Ưu đãi thêm vào Thứ 7 và Chủ nhật.",
    note: "Số lượng có hạn.",
  },
  {
    imageUrl: "http://localhost:8080/uploads/images/voucher5.png",
    title: "Voucher Thành Viên",
    description: "Ưu đãi riêng cho khách hàng thân thiết.",
    note: "Xem chi tiết điều kiện tại quầy.",
  },
];

export default function VoucherInfoPage() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 py-4">
        <div className="container">
          <div className="bg-white border rounded-4 shadow-sm p-4 p-md-5">
            <h2 className="fw-bold mb-3">Ưu Đãi Voucher GroceryStore</h2>
            <p className="text-muted mb-4">Bộ voucher hiện có cho khách hàng mua sắm trực tiếp tại cửa hàng.</p>

            <div className="promotion-gallery">
              {voucherGallery.map((item) => (
                <article key={item.title} className="promotion-gallery-card">
                  <img src={item.imageUrl} alt={item.title} className="promotion-gallery-image" loading="lazy" />
                  <div className="promotion-gallery-content">
                    <h5>{item.title}</h5>
                    <p>{item.description}</p>
                    <small>{item.note}</small>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
