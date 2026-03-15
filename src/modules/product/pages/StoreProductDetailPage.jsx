import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Spinner } from "react-bootstrap";
import { Link, useLocation, useParams } from "react-router-dom";
import Header from "../../../layouts/Header";
import Footer from "../../../layouts/Footer";
import { productService } from "../../../core/api/productService";
import { productUnitService } from "../../../core/api/productUnitService";

function formatCurrency(value) {
  if (!Number.isFinite(value)) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function resolveSellingPrice(units = []) {
  const activeUnits = (Array.isArray(units) ? units : []).filter((unit) => unit?.isActive !== false);
  if (!activeUnits.length) return null;
  const baseUnit = activeUnits.find((unit) => unit?.isBaseUnit);
  if (baseUnit?.sellingPrice != null) return Number(baseUnit.sellingPrice);
  const prices = activeUnits.map((unit) => Number(unit?.sellingPrice)).filter((value) => Number.isFinite(value) && value >= 0);
  if (!prices.length) return null;
  return Math.min(...prices);
}

export default function StoreProductDetailPage() {
  const { productId } = useParams();
  const location = useLocation();
  const initialProduct = location.state?.product || null;
  const initialPrice = location.state?.price;

  const [product, setProduct] = useState(initialProduct);
  const [units, setUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fallbackPrice, setFallbackPrice] = useState(Number.isFinite(initialPrice) ? initialPrice : null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!product) {
          const result = await productService.getAllProducts(0, 300);
          const items = Array.isArray(result?.content) ? result.content : [];
          const found = items.find((item) => String(item.id) === String(productId));
          if (!found) {
            setError("Không tìm thấy sản phẩm.");
            return;
          }
          setProduct(found);
        }
      } catch {
        setError("Không thể tải thông tin sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, product]);

  useEffect(() => {
    const loadUnits = async () => {
      if (!product?.id) return;

      try {
        const result = await productUnitService.getUnitsByProduct(product.id);
        const activeUnits = (Array.isArray(result) ? result : []).filter((unit) => unit?.isActive !== false);
        setUnits(activeUnits);

        const baseUnit = activeUnits.find((unit) => unit?.isBaseUnit);
        const firstUnit = baseUnit || activeUnits[0] || null;
        setSelectedUnitId(firstUnit?.id ?? null);

        if (!Number.isFinite(initialPrice)) {
          setFallbackPrice(resolveSellingPrice(activeUnits));
        }
      } catch {
        setUnits([]);
      }
    };

    loadUnits();
  }, [product, initialPrice]);

  const selectedUnit = useMemo(() => units.find((unit) => unit.id === selectedUnitId) || null, [units, selectedUnitId]);

  const displayPrice = Number.isFinite(Number(selectedUnit?.sellingPrice))
    ? Number(selectedUnit.sellingPrice)
    : Number.isFinite(fallbackPrice)
      ? fallbackPrice
      : null;

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 py-4">
        <div className="container">
          <section className="store-product-detail-wrap">
            {loading && <div className="bg-white border rounded-4 shadow-sm p-4 d-flex justify-content-center"><Spinner animation="border" role="status" /></div>}
            {!loading && error && <Alert variant="danger" className="mb-0">{error}</Alert>}

            {!loading && !error && product && (
              <article className="store-product-detail-card">
                <div className="store-product-detail-image-wrap">
                  {product.imageUrl ? (
                    <img src={productService.toAbsoluteMediaUrl(product.imageUrl)} alt={product.name} className="store-product-detail-image" />
                  ) : (
                    <div className="store-product-detail-no-image">Chưa có ảnh sản phẩm</div>
                  )}
                </div>

                <div className="store-product-detail-content">
                  <h2>{product.name}</h2>
                  <div className="store-product-detail-price">{formatCurrency(displayPrice)}</div>

                  <div className="store-product-detail-meta">
                    <Badge bg="light" text="dark">{product.categoryName || "Khác"}</Badge>
                    <Badge bg="light" text="dark">{product.brandName || "Không thương hiệu"}</Badge>
                  </div>

                  <p className="text-muted mt-3 mb-3">{product.description || "Sản phẩm đang kinh doanh tại cửa hàng."}</p>

                  {units.length > 0 && (
                    <div>
                      <h6 className="fw-bold mb-2">Đơn vị sản phẩm</h6>
                      <div className="product-unit-list">
                        {units.map((unit) => (
                          <button type="button" key={unit.id} className={`product-unit-item ${selectedUnitId === unit.id ? "active" : ""}`} onClick={() => setSelectedUnitId(unit.id)}>
                            <div className="product-unit-head">
                              <span className="fw-semibold">{unit.unitName || unit.name || "Đơn vị"}</span>
                              {unit.isBaseUnit ? <span className="product-unit-badge">Đơn vị gốc</span> : null}
                            </div>
                            <div className="product-unit-price">{formatCurrency(Number(unit.sellingPrice))}</div>
                            <div className="product-unit-note">Mã vạch: {unit.barcode || "-"} | Quy đổi: {unit.conversionFactor ?? 1}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4"><Link to="/products" className="blog-highlights-more">← Quay lại danh sách hàng hóa</Link></div>
                </div>
              </article>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
