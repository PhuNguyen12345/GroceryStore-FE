import { useEffect, useMemo, useState } from "react";
import Header from "../../../layouts/Header";
import Footer from "../../../layouts/Footer";
import { promotionService } from "../../../core/api/promotionService";

function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `http://localhost:8080${url}`;
}

function toDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value) {
  const date = toDate(value);
  if (!date) return "";
  return date.toLocaleDateString("vi-VN");
}

function getPeriodText(item) {
  const start = formatDate(item.startDate);
  const end = formatDate(item.endDate);
  if (start && end) return `${start} - ${end}`;
  return "Đang cập nhật thời gian áp dụng";
}

export default function PromotionInfoPage() {
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const result = await promotionService.getActivePromotions(0, 24);
        setPromotions(Array.isArray(result?.content) ? result.content : []);
      } catch {
        setPromotions([]);
      }
    };

    loadPromotions();
  }, []);

  const items = useMemo(() => {
    if (!promotions.length) return [];
    const now = new Date();

    return [...promotions]
      .filter((item) => {
        if (!item?.isActive) return false;
        if (!item?.bannerUrl) return false;
        const endDate = toDate(item.endDate);
        return !endDate || endDate >= now;
      })
      .sort((a, b) => {
        const first = toDate(a.endDate)?.getTime() || Number.MAX_SAFE_INTEGER;
        const second = toDate(b.endDate)?.getTime() || Number.MAX_SAFE_INTEGER;
        return first - second;
      });
  }, [promotions]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 py-4">
        <div className="container">
          <div className="bg-white border rounded-4 shadow-sm p-4 p-md-5">
            <h2 className="fw-bold mb-3">Khuyến Mại Nổi Bật</h2>
            <p className="text-muted mb-4">Danh sách chương trình khuyến mại đang áp dụng tại cửa hàng.</p>

            <div className="promotion-gallery">
              {items.map((item) => (
                <article key={item.id} className="promotion-gallery-card">
                  <img src={resolveImageUrl(item.bannerUrl)} alt={item.name || "Khuyến mại"} className="promotion-gallery-image" loading="lazy" />
                  <div className="promotion-gallery-content">
                    <h5>{item.name || "Khuyến mại"}</h5>
                    <p>{item.description || "Thông tin chi tiết đang được cập nhật."}</p>
                    <small>Thời gian: {getPeriodText(item)}</small>
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
