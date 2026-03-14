import { useEffect, useState } from "react";
import { Alert, Carousel, Spinner } from "react-bootstrap";
import { promotionService } from "../../../core/api/promotionService";

function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `http://localhost:8080${url}`;
}

function formatSlideTitle(name) {
  return name || "Khuyến mãi nổi bật";
}

function formatSlideDescription(description) {
  if (!description?.trim()) {
    return "Khám phá các chương trình ưu đãi mới nhất dành cho khách hàng của cửa hàng.";
  }
  return description;
}

export default function HeroBanner() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await promotionService.filterByActive(true, 0, 10);
        const activeSlides = (result.content || []).filter((promotion) => promotion.bannerUrl);
        setSlides(activeSlides);
      } catch {
        setError("Không thể tải banner khuyến mãi.");
      } finally {
        setLoading(false);
      }
    };

    loadPromotions();
  }, []);

  if (loading) {
    return (
      <div className="admin-panel p-4 d-flex align-items-center justify-content-center" style={{ minHeight: 260 }}>
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (slides.length === 0) {
    return (
      <div className="admin-panel p-4" style={{ minHeight: 260 }}>
        <div className="h-100 d-flex flex-column justify-content-center">
          <h4 className="fw-bold mb-2">Chưa có banner khuyến mãi</h4>
          <p className="text-muted mb-0">
            Hãy thêm ảnh banner ở màn quản lý khuyến mãi để hiển thị trên dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel overflow-hidden p-0">
      <Carousel fade interval={4000} pause="hover">
        {slides.map((slide) => (
          <Carousel.Item key={slide.id}>
            <div
              className="position-relative overflow-hidden"
              style={{
                height: "min(36vw, 360px)",
                minHeight: 220,
                maxHeight: 380,
              }}
            >
              <img
                src={resolveImageUrl(slide.bannerUrl)}
                alt={slide.name}
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{ objectFit: "cover" }}
              />

              <div
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(6,14,28,0.88) 0%, rgba(6,14,28,0.58) 42%, rgba(6,14,28,0.18) 100%)",
                }}
              />

              <div className="position-absolute top-50 start-0 translate-middle-y text-white px-4 px-md-5">
                <span className="badge text-bg-warning text-dark mb-3">Khuyến mãi nổi bật</span>
                <h2
                  className="fw-bold mb-3"
                  style={{
                    maxWidth: 560,
                    fontSize: "clamp(1.4rem, 2.8vw, 2.8rem)",
                    lineHeight: 1.1,
                  }}
                >
                  {formatSlideTitle(slide.name)}
                </h2>
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
}
