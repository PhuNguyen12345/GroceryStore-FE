import { useEffect, useMemo, useState } from "react";
import { Alert, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import Header from "../../../layouts/Header";
import Footer from "../../../layouts/Footer";
import { promotionService } from "../../../core/api/promotionService";
import { productService } from "../../../core/api/productService";
import { productUnitService } from "../../../core/api/productUnitService";

function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `http://localhost:8080${url}`;
}

function resolveSellingPrice(units = []) {
  const activeUnits = (Array.isArray(units) ? units : []).filter((unit) => unit?.isActive !== false);
  if (!activeUnits.length) return null;

  const baseUnit = activeUnits.find((unit) => unit?.isBaseUnit);
  if (baseUnit?.sellingPrice != null) return Number(baseUnit.sellingPrice);

  const prices = activeUnits
    .map((unit) => Number(unit?.sellingPrice))
    .filter((value) => Number.isFinite(value) && value >= 0);

  if (!prices.length) return null;
  return Math.min(...prices);
}

function formatCurrency(value) {
  if (!Number.isFinite(value)) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN");
}

function truncateText(value = "", max = 95) {
  if (!value) return "";
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}...`;
}

export default function HotDealPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [productPrices, setProductPrices] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [promotionResult, productResult] = await Promise.all([
          promotionService.getActivePromotions(0, 6),
          productService.getAllProducts(0, 60),
        ]);

        const promoItems = Array.isArray(promotionResult?.content)
          ? promotionResult.content.filter((item) => item?.isActive && item?.bannerUrl).slice(0, 3)
          : [];
        setPromotions(promoItems);

        const activeProducts = Array.isArray(productResult?.content)
          ? productResult.content.filter((item) => item?.isActive !== false)
          : [];

        const unitResults = await Promise.all(
          activeProducts.map(async (product) => {
            try {
              const units = await productUnitService.getUnitsByProduct(product.id);
              return [product.id, resolveSellingPrice(units)];
            } catch {
              return [product.id, null];
            }
          })
        );

        const pricesById = Object.fromEntries(unitResults);
        setProductPrices(pricesById);

        const hotProducts = [...activeProducts]
          .sort((a, b) => {
            const first = pricesById[a.id] ?? Number.MAX_SAFE_INTEGER;
            const second = pricesById[b.id] ?? Number.MAX_SAFE_INTEGER;
            return first - second;
          })
          .slice(0, 20);

        setProducts(hotProducts);
      } catch {
        setError("Không thể tải dữ liệu Hot Deal.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const titleText = useMemo(() => {
    if (!promotions.length) return "Hot Deal Hôm Nay";
    return "Hot Deal Theo Chương Trình Khuyến Mại";
  }, [promotions]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />

      <main className="flex-grow-1 py-4">
        <div className="container">
          <section className="hotdeal-wrap">
            <div className="hotdeal-head">
              <h2>{titleText}</h2>
              <p>Danh sách sản phẩm giá tốt và ưu đãi đang áp dụng tại cửa hàng.</p>
            </div>

            {loading && (
              <div className="bg-white border rounded-4 shadow-sm p-4 d-flex justify-content-center">
                <Spinner animation="border" role="status" />
              </div>
            )}

            {!loading && error && <Alert variant="danger" className="mb-0">{error}</Alert>}

            {!loading && !error && promotions.length > 0 && (
              <div className="hotdeal-promo-grid mb-4">
                {promotions.map((promotion) => (
                  <Link key={promotion.id} to="/khuyen-mai" className="hotdeal-promo-card">
                    <img src={resolveImageUrl(promotion.bannerUrl)} alt={promotion.name || "Khuyến mại"} className="hotdeal-promo-image" />
                    <div className="hotdeal-promo-overlay">
                      <h6>{promotion.name}</h6>
                      <p>{formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <div className="hotdeal-products-grid">
                {products.map((item) => (
                  <Link key={item.id} to={`/products/${item.id}`} state={{ product: item, price: productPrices[item.id] }} className="store-product-card-link">
                    <article className="store-product-card">
                      <div className="store-product-image-wrap">
                        {item.imageUrl ? (
                          <img src={productService.toAbsoluteMediaUrl(item.imageUrl)} alt={item.name} className="store-product-image" loading="lazy" />
                        ) : (
                          <div className="store-product-image-placeholder">Chưa có ảnh</div>
                        )}
                      </div>

                      <div className="store-product-content">
                        <h6>{item.name}</h6>
                        <div className="store-product-price">{formatCurrency(productPrices[item.id])}</div>
                        <p>{truncateText(item.description || "Sản phẩm đang có tại cửa hàng.")}</p>
                        <div className="store-product-meta">
                          <span>{item.categoryName || "Khác"}</span>
                          <span>Hot Deal</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
