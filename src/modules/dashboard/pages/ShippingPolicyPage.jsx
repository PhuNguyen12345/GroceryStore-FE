import Header from "../../../layouts/Header";
import Footer from "../../../layouts/Footer";

export default function ShippingPolicyPage() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 py-4">
        <div className="container">
          <div className="bg-white border rounded-4 shadow-sm p-4 p-md-5">
            <h2 className="fw-bold mb-3">Thông Tin Cửa Hàng</h2>
            <p className="text-muted mb-4">
              GroceryStore là cửa hàng mua sắm trực tiếp, chuyên thực phẩm tươi và hàng tiêu dùng thiết yếu
              cho gia đình.
            </p>

            <div className="row g-4">
              <div className="col-lg-7">
                <div className="border rounded-3 p-3 h-100 bg-light-subtle">
                  <h5 className="fw-bold mb-3">Thông tin liên hệ</h5>
                  <div className="d-flex flex-column gap-2 text-muted">
                    <div>
                      <span className="fw-semibold text-dark">Địa chỉ:</span> Thạch Thất, Hà Nội
                    </div>
                    <div>
                      <span className="fw-semibold text-dark">Điện thoại:</span> 1900 1234
                    </div>
                    <div>
                      <span className="fw-semibold text-dark">Email:</span> support@grocerystore.vn
                    </div>
                    <div>
                      <span className="fw-semibold text-dark">Fanpage:</span> GroceryStore Official
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="border rounded-3 p-3 h-100">
                  <h5 className="fw-bold mb-3">Giờ mở cửa</h5>
                  <div className="d-flex flex-column gap-2 text-muted">
                    <div>
                      <span className="fw-semibold text-dark">Thứ 2 - Thứ 6:</span> 07:00 - 21:30
                    </div>
                    <div>
                      <span className="fw-semibold text-dark">Thứ 7 - Chủ nhật:</span> 06:30 - 22:00
                    </div>
                    <div>
                      <span className="fw-semibold text-dark">Lễ/Tết:</span> Có thể điều chỉnh theo thông báo
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="border rounded-3 p-3 h-100">
                  <h6 className="fw-bold mb-2">Dịch vụ tại cửa hàng</h6>
                  <ul className="mb-0 text-muted ps-3">
                    <li>Tư vấn chọn hàng trực tiếp theo nhu cầu gia đình.</li>
                    <li>Hỗ trợ gói hàng và sắp xếp theo đơn mua.</li>
                    <li>Đổi trả tại quầy theo chính sách cửa hàng.</li>
                    <li>Thanh toán tiền mặt, chuyển khoản và quét QR.</li>
                  </ul>
                </div>
              </div>

              <div className="col-md-6">
                <div className="border rounded-3 p-3 h-100">
                  <h6 className="fw-bold mb-2">Lưu ý khi mua sắm</h6>
                  <ul className="mb-0 text-muted ps-3">
                    <li>Ưu đãi voucher áp dụng theo thời gian ghi trên chương trình.</li>
                    <li>Giữ hóa đơn để được hỗ trợ đổi trả nhanh chóng.</li>
                    <li>Khuyến khích kiểm tra thông tin sản phẩm trước khi thanh toán.</li>
                    <li>Liên hệ quầy chăm sóc khách hàng nếu cần hỗ trợ thêm.</li>
                  </ul>
                </div>
              </div>

              <div className="col-12">
                <div className="border rounded-3 p-3">
                  <h6 className="fw-bold mb-2">Mô tả cửa hàng</h6>
                  <p className="mb-0 text-muted">
                    Không gian mua sắm sạch sẽ, hàng hóa sắp xếp theo nhóm rõ ràng, giúp khách dễ chọn nhanh
                    các sản phẩm thiết yếu mỗi ngày. Đội ngũ nhân viên luôn sẵn sàng hỗ trợ để trải nghiệm mua
                    sắm tại GroceryStore thuận tiện và thoải mái hơn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
