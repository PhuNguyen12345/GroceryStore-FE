import { useEffect, useMemo, useState } from "react";
import { Alert, Spinner } from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../../../layouts/Header";
import Footer from "../../../layouts/Footer";
import { productService } from "../../../core/api/productService";
import { productUnitService } from "../../../core/api/productUnitService";
import { categoryService } from "../../../core/api/categoryService";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 20;

function resolveSellingPrice(units = []) {
  const activeUnits = (Array.isArray(units) ? units : []).filter((unit) => unit?.isActive !== false);
  if (!activeUnits.length) return null;

  const baseUnit = activeUnits.find((unit) => unit?.isBaseUnit);
  if (baseUnit?.sellingPrice != null) return Number(baseUnit.sellingPrice);

  const prices = activeUnits.map((unit) => Number(unit?.sellingPrice)).filter((value) => Number.isFinite(value) && value >= 0);
  if (!prices.length) return null;
  return Math.min(...prices);
}

function formatCurrency(value) {
  if (!Number.isFinite(value)) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function truncateText(value = "", max = 100) {
  if (!value) return "";
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}...`;
}

function getPageItems(total, current) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push("ellipsis-left");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (current < total - 2) pages.push("ellipsis-right");
  pages.push(total);
  return pages;
}

function collectNodeIds(node, bucket) {
  if (!node) return;
  bucket.push(node.id);
  (node.children || []).forEach((child) => collectNodeIds(child, bucket));
}

function findCategoryWithDescendants(tree = [], targetId) {
  const stack = [...tree];
  while (stack.length) {
    const node = stack.pop();
    if (node?.id === targetId) {
      const ids = [];
      collectNodeIds(node, ids);
      return ids;
    }
    (node?.children || []).forEach((child) => stack.push(child));
  }
  return targetId ? [targetId] : [];
}

async function loadAllActiveProducts() {
  const size = 60;
  let page = 0;
  let totalPages = 1;
  const all = [];

  while (page < totalPages) {
    const result = await productService.getAllProducts(page, size);
    const pageItems = Array.isArray(result?.content) ? result.content : [];
    all.push(...pageItems.filter((item) => item?.isActive !== false));
    totalPages = Number.isFinite(result?.totalPages) ? result.totalPages : page + 1;
    page += 1;
  }

  return all;
}

export default function StoreProductsPage() {
  const [searchParams] = useSearchParams();
  const categoryIdParam = searchParams.get("categoryId");
  const categoryNameParam = searchParams.get("categoryName");
  const keywordParam = (searchParams.get("keyword") || "").trim();
  const categoryId = categoryIdParam ? Number(categoryIdParam) : null;
  const hasCategoryFilter = Number.isFinite(categoryId) && categoryId > 0;
  const hasKeywordFilter = keywordParam.length > 0;
  const hasLocalFilter = hasCategoryFilter || hasKeywordFilter;

  const [products, setProducts] = useState([]);
  const [allFilteredProducts, setAllFilteredProducts] = useState([]);
  const [productPrices, setProductPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setPage(0);
  }, [categoryIdParam, keywordParam]);

  useEffect(() => {
    const loadFilteredProducts = async () => {
      if (!hasLocalFilter) {
        setAllFilteredProducts([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const allProducts = await loadAllActiveProducts();

        let categoryIdSet = null;
        if (hasCategoryFilter) {
          const tree = await categoryService.getCategoryTreeActive();
          const categoryIds = findCategoryWithDescendants(Array.isArray(tree) ? tree : [], categoryId);
          categoryIdSet = new Set(categoryIds);
        }

        const normalizedKeyword = keywordParam.toLowerCase();
        const filtered = allProducts.filter((item) => {
          const inCategory = !categoryIdSet || categoryIdSet.has(item.categoryId);
          const name = String(item?.name || "").toLowerCase();
          const description = String(item?.description || "").toLowerCase();
          const inKeyword = !hasKeywordFilter || name.includes(normalizedKeyword) || description.includes(normalizedKeyword);
          return inCategory && inKeyword;
        });

        setAllFilteredProducts(filtered);
        setTotalPages(Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1));
      } catch {
        setError("Không thể tải danh sách hàng hóa.");
      } finally {
        setLoading(false);
      }
    };

    loadFilteredProducts();
  }, [hasLocalFilter, hasCategoryFilter, hasKeywordFilter, categoryId, keywordParam]);

  useEffect(() => {
    const loadProductsByPage = async () => {
      if (hasLocalFilter) {
        const start = page * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        setProducts(allFilteredProducts.slice(start, end));
        setTotalPages(Math.max(Math.ceil(allFilteredProducts.length / PAGE_SIZE), 1));
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await productService.getAllProducts(page, PAGE_SIZE);
        const pageItems = Array.isArray(result?.content) ? result.content.filter((item) => item?.isActive !== false) : [];
        setProducts(pageItems);
        setTotalPages(Math.max(result?.totalPages || 1, 1));
      } catch {
        setError("Không thể tải danh sách hàng hóa.");
      } finally {
        setLoading(false);
      }
    };

    loadProductsByPage();
  }, [page, hasLocalFilter, allFilteredProducts]);

  useEffect(() => {
    const loadPrices = async () => {
      if (!products.length) {
        setProductPrices({});
        return;
      }

      const unitResults = await Promise.all(
        products.map(async (product) => {
          try {
            const units = await productUnitService.getUnitsByProduct(product.id);
            return [product.id, resolveSellingPrice(units)];
          } catch {
            return [product.id, null];
          }
        })
      );

      setProductPrices(Object.fromEntries(unitResults));
    };

    loadPrices();
  }, [products]);

  const displayProducts = useMemo(() => products, [products]);
  const currentPage = page + 1;
  const pageItems = getPageItems(totalPages, currentPage);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 py-4">
        <div className="container">
          <section className="store-products-wrap">
            <div className="store-products-head">
              <h2>
                {hasKeywordFilter
                  ? `Kết quả tìm kiếm: "${keywordParam}"`
                  : categoryNameParam
                    ? `Hàng hóa: ${categoryNameParam}`
                    : "Hàng hóa của cửa hàng"}
              </h2>
              <p>
                {hasKeywordFilter
                  ? "Hiển thị sản phẩm phù hợp với từ khóa tìm kiếm."
                  : categoryNameParam
                    ? `Hiển thị sản phẩm thuộc danh mục ${categoryNameParam} và toàn bộ danh mục con.`
                    : "Danh sách đầy đủ sản phẩm đang kinh doanh tại GroceryStore."}
              </p>
            </div>

            {loading && <div className="bg-white border rounded-4 shadow-sm p-4 d-flex justify-content-center"><Spinner animation="border" role="status" /></div>}
            {!loading && error && <Alert variant="danger" className="mb-0">{error}</Alert>}
            {!loading && !error && displayProducts.length === 0 && (
              <Alert variant="info" className="mb-0">
                {hasKeywordFilter
                  ? "Không tìm thấy sản phẩm phù hợp với từ khóa."
                  : "Không có sản phẩm phù hợp với danh mục đã chọn."}
              </Alert>
            )}

            {!loading && !error && displayProducts.length > 0 && (
              <>
                <div className="store-products-grid">
                  {displayProducts.map((item) => (
                    <Link key={item.id} to={`/products/${item.id}`} state={{ product: item, price: productPrices[item.id] }} className="store-product-card-link">
                      <article className="store-product-card">
                        <div className="store-product-image-wrap">
                          {item.imageUrl ? <img src={productService.toAbsoluteMediaUrl(item.imageUrl)} alt={item.name} className="store-product-image" loading="lazy" /> : <div className="store-product-image-placeholder">Chưa có ảnh</div>}
                        </div>

                        <div className="store-product-content">
                          <h6>{item.name}</h6>
                          <div className="store-product-price">{formatCurrency(productPrices[item.id])}</div>
                          <p>{truncateText(item.description || "Sản phẩm đang có tại cửa hàng.")}</p>
                          <div className="store-product-meta">
                            <span>{item.categoryName || "Khác"}</span>
                            <span>{item.brandName || "Không thương hiệu"}</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>

                <div className="store-products-pagination mt-4 d-flex justify-content-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" onClick={(event) => { event.preventDefault(); if (page > 0) setPage((prev) => prev - 1); }} className={page === 0 ? "pointer-events-none opacity-50" : ""} />
                      </PaginationItem>

                      {pageItems.map((item) => (
                        <PaginationItem key={item}>
                          {typeof item === "number" ? (
                            <PaginationLink href="#" isActive={item === currentPage} onClick={(event) => { event.preventDefault(); setPage(item - 1); }}>{item}</PaginationLink>
                          ) : (
                            <PaginationEllipsis />
                          )}
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext href="#" onClick={(event) => { event.preventDefault(); if (page < totalPages - 1) setPage((prev) => prev + 1); }} className={page >= totalPages - 1 ? "pointer-events-none opacity-50" : ""} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
