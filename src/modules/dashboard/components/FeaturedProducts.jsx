import { useEffect, useMemo, useState } from "react";
import { Alert, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { productService } from "../../../core/api/productService";
import { productUnitService } from "../../../core/api/productUnitService";

function normalizeProducts(content = []) {
  return (Array.isArray(content) ? content : []).filter((item) => item?.isActive !== false).slice(0, 20);
}

function truncateText(value = "", max = 90) {
  if (!value) return "";
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}...`;
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

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [productPrices, setProductPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await productService.getAllProducts(0, 40);
        const normalizedProducts = normalizeProducts(result.content);
        setProducts(normalizedProducts);

        const unitResults = await Promise.all(
          normalizedProducts.map(async (product) => {
            try {
              const units = await productUnitService.getUnitsByProduct(product.id);
              return [product.id, resolveSellingPrice(units)];
            } catch {
              return [product.id, null];
            }
          })
        );

        setProductPrices(Object.fromEntries(unitResults));
      } catch {
        setError("Không thể tải sản phẩm nổi bật.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const featuredProducts = useMemo(() => products.slice(0, 20), [products]);

  return (
    <section className="featured-products mt-4">
      <div className="featured-products-head">
        <h4>Sản phẩm nổi bật</h4>
        <p>Một số sản phẩm được quan tâm nhiều tại cửa hàng.</p>
      </div>

      {loading && (
        <div className="bg-white border rounded-4 shadow-sm p-4 d-flex justify-content-center">
          <Spinner animation="border" role="status" />
        </div>
      )}

      {!loading && error && (
        <Alert variant="danger" className="mb-0">
          {error}
        </Alert>
      )}

      {!loading && !error && featuredProducts.length > 0 && (
        <div className="featured-products-grid">
          {featuredProducts.map((item) => (
            <Link
              key={item.id}
              to={`/products/${item.id}`}
              state={{ product: item, price: productPrices[item.id] }}
              className="store-product-card-link"
            >
              <article className="featured-product-card">
                <div className="featured-product-image-wrap">
                  {item.imageUrl ? (
                    <img
                      src={productService.toAbsoluteMediaUrl(item.imageUrl)}
                      alt={item.name}
                      className="featured-product-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="featured-product-image-placeholder">Chưa có ảnh</div>
                  )}
                </div>

                <div className="featured-product-content">
                  <h6>{item.name}</h6>
                  <div className="featured-product-price">{formatCurrency(productPrices[item.id])}</div>
                  <p>{truncateText(item.description || "Sản phẩm đang có tại cửa hàng.")}</p>
                  <div className="featured-product-meta">
                    <span>{item.categoryName || "Khác"}</span>
                    <span>{item.brandName || "Không thương hiệu"}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
