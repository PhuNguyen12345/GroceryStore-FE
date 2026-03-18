import { useEffect, useMemo, useRef, useState } from "react";
import { Container, Row, Col, Navbar, Nav, Spinner } from "react-bootstrap";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, Menu, ShieldCheck, Clock3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { categoryService } from "../core/api/categoryService";
import { brandService } from "../core/api/brandService";

export default function Header() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryTree, setCategoryTree] = useState([]);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [brands, setBrands] = useState([]);
  const [showBrandMenu, setShowBrandMenu] = useState(false);
  const [brandKeyword, setBrandKeyword] = useState("");
  const [loadingCategoryTree, setLoadingCategoryTree] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const closeMenuTimerRef = useRef(null);
  const closeBrandMenuTimerRef = useRef(null);

  useEffect(() => {
    const loadCategoryTree = async () => {
      try {
        setLoadingCategoryTree(true);
        const tree = await categoryService.getCategoryTreeActive();
        const normalizedTree = Array.isArray(tree) ? tree : [];
        setCategoryTree(normalizedTree);
        setActiveCategoryId(normalizedTree[0]?.id ?? null);
      } catch {
        setCategoryTree([]);
        setActiveCategoryId(null);
      } finally {
        setLoadingCategoryTree(false);
      }
    };

    loadCategoryTree();

    const loadBrands = async () => {
      try {
        setLoadingBrands(true);
        const result = await brandService.getActiveBrands(0, 200);
        const list = Array.isArray(result?.content) ? result.content : [];
        setBrands(list);
      } catch {
        setBrands([]);
      } finally {
        setLoadingBrands(false);
      }
    };

    loadBrands();
  }, []);

  useEffect(() => {
    return () => {
      if (closeMenuTimerRef.current) {
        clearTimeout(closeMenuTimerRef.current);
      }
      if (closeBrandMenuTimerRef.current) {
        clearTimeout(closeBrandMenuTimerRef.current);
      }
    };
  }, []);

  const activeCategory = useMemo(
    () => categoryTree.find((item) => item.id === activeCategoryId) ?? categoryTree[0] ?? null,
    [categoryTree, activeCategoryId]
  );

  const filteredBrands = useMemo(() => {
    const keyword = brandKeyword.trim().toLowerCase();
    if (!keyword) return brands;
    return brands.filter((brand) => String(brand?.name || "").toLowerCase().includes(keyword));
  }, [brands, brandKeyword]);

  const openCategoryMenu = () => {
    if (closeMenuTimerRef.current) {
      clearTimeout(closeMenuTimerRef.current);
      closeMenuTimerRef.current = null;
    }
    setShowCategoryMenu(true);
  };

  const closeCategoryMenu = () => {
    if (closeMenuTimerRef.current) {
      clearTimeout(closeMenuTimerRef.current);
    }
    closeMenuTimerRef.current = setTimeout(() => {
      setShowCategoryMenu(false);
    }, 180);
  };

  const openBrandMenu = () => {
    if (closeBrandMenuTimerRef.current) {
      clearTimeout(closeBrandMenuTimerRef.current);
      closeBrandMenuTimerRef.current = null;
    }
    setShowBrandMenu(true);
  };

  const closeBrandMenu = () => {
    if (closeBrandMenuTimerRef.current) {
      clearTimeout(closeBrandMenuTimerRef.current);
    }
    closeBrandMenuTimerRef.current = setTimeout(() => {
      setShowBrandMenu(false);
      setBrandKeyword("");
    }, 180);
  };

  const goToCategoryProducts = (category) => {
    if (!category?.id) return;
    const params = new URLSearchParams({
      categoryId: String(category.id),
      categoryName: category.name || "",
    });
    setShowCategoryMenu(false);
    navigate(`/products?${params.toString()}`);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const keyword = searchTerm.trim();
    if (!keyword) {
      navigate("/products");
      return;
    }

    const params = new URLSearchParams({ keyword });
    navigate(`/products?${params.toString()}`);
  };

  const goToBrandProducts = (brand) => {
    if (!brand?.id) return;
    const params = new URLSearchParams({
      brandId: String(brand.id),
      brandName: brand.name || "",
    });
    setShowBrandMenu(false);
    navigate(`/products?${params.toString()}`);
  };

  return (
    <header className="border-bottom shadow-sm">
      <div
        className="py-3 text-white"
        style={{ background: "linear-gradient(135deg, #145a3a 0%, #1a7a4d 55%, #2c9a67 100%)" }}
      >
        <Container>
          <Row className="align-items-center gy-3">
            <Col lg={3} md={4} sm={12}>
              <Link to="/" className="text-decoration-none text-white">
                <div className="fw-bold fs-3 lh-1">GroceryStore</div>
                <small className="text-white-50">Cửa hàng cho mọi nhà</small>
              </Link>
            </Col>

            <Col lg={5} md={8} sm={12}>
              <form
                className="w-100"
                role="search"
                onSubmit={handleSearchSubmit}
              >
                <div className="position-relative w-100">
                  <Search
                    size={18}
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-dark"
                  />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    aria-label="Tìm kiếm sản phẩm"
                    className="ps-5 bg-white text-dark border-white shadow-sm"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
              </form>
            </Col>

            <Col lg={4} sm={12}>
              <div className="rounded-4 border border-light-subtle bg-white bg-opacity-10 px-3 py-2">
                <div className="d-flex align-items-center gap-2 small fw-semibold text-white">
                  <ShieldCheck size={15} />
                  Khách tham quan
                </div>
                <div className="mt-1 d-flex align-items-center gap-2 text-white-50 small">
                  <Clock3 size={14} />
                  Xem danh mục, giá bán và chương trình khuyến mãi
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Navbar expand="lg" bg="white" className="py-2 gs-header-navbar" sticky="top" data-bs-theme="light">
        <Container>
          <Navbar.Toggle aria-controls="header-nav">
            <Menu size={20} />
          </Navbar.Toggle>

          <Navbar.Collapse id="header-nav">
            <Nav className="me-auto gap-lg-2 align-items-lg-center">
              <Nav.Link as={NavLink} to="/" end className="fw-medium text-dark">
                Trang chủ
              </Nav.Link>

              <Nav.Item
                className="position-relative"
                onMouseEnter={openCategoryMenu}
                onMouseLeave={closeCategoryMenu}
              >
                <button
                  type="button"
                  className="nav-link fw-medium text-dark border-0 bg-transparent category-mega-trigger"
                  onClick={() => setShowCategoryMenu((prev) => !prev)}
                  onMouseEnter={openCategoryMenu}
                  aria-expanded={showCategoryMenu}
                >
                  <Menu size={18} />
                  <span>Danh mục</span>
                </button>

                {showCategoryMenu && (
                  <div className="category-mega-dropdown shadow-sm">
                    <div className="category-mega-tabs">
                      <button type="button" className="active">Danh mục</button>
                    </div>

                    <div className="category-mega-body">
                      <div className="category-mega-left">
                        {loadingCategoryTree ? (
                          <div className="d-flex align-items-center gap-2 text-muted small p-2">
                            <Spinner animation="border" size="sm" />
                            Đang tải danh mục...
                          </div>
                        ) : (
                          <ul className="category-mega-parent-list">
                            {categoryTree.map((node) => (
                              <li key={node.id}>
                                <button
                                  type="button"
                                  className={`category-mega-parent-item ${activeCategory?.id === node.id ? "active" : ""}`}
                                  onMouseEnter={() => setActiveCategoryId(node.id)}
                                  onFocus={() => setActiveCategoryId(node.id)}
                                  onClick={() => goToCategoryProducts(node)}
                                >
                                  {node.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="category-mega-right">
                        {!loadingCategoryTree && (!activeCategory || categoryTree.length === 0) ? (
                          <div className="text-muted small p-2">Chưa có danh mục.</div>
                        ) : null}

                        {!loadingCategoryTree && activeCategory && (
                          <ul className="category-mega-child-list">
                            {(activeCategory.children || []).map((child) => (
                              <li key={child.id}>
                                <button
                                  type="button"
                                  className="category-mega-child-item"
                                  onClick={() => goToCategoryProducts(child)}
                                >
                                  <span>{child.name}</span>
                                </button>
                              </li>
                            ))}

                            {(activeCategory.children || []).length === 0 ? (
                              <li className="text-muted small p-2">Danh mục này chưa có nhóm con.</li>
                            ) : null}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Nav.Item>

              <Nav.Item
                className="position-relative"
                onMouseEnter={openBrandMenu}
                onMouseLeave={closeBrandMenu}
              >
                <button
                  type="button"
                  className="nav-link fw-medium text-dark border-0 bg-transparent category-mega-trigger"
                  onClick={() => setShowBrandMenu((prev) => !prev)}
                  onMouseEnter={openBrandMenu}
                  aria-expanded={showBrandMenu}
                >
                  <span>Nhãn hàng</span>
                </button>

                {showBrandMenu && (
                  <div className="category-mega-dropdown brand-menu-dropdown shadow-sm">
                    <div className="category-mega-tabs">
                      <button type="button" className="active">Nhãn hàng</button>
                    </div>

                    {loadingBrands ? (
                      <div className="d-flex align-items-center gap-2 text-muted small p-2">
                        <Spinner animation="border" size="sm" />
                        Đang tải nhãn hàng...
                      </div>
                    ) : (
                      <>
                        <div className="p-2 pb-1">
                          <Input
                            type="text"
                            value={brandKeyword}
                            onChange={(event) => setBrandKeyword(event.target.value)}
                            placeholder="Tìm nhãn hàng..."
                            className="bg-white"
                          />
                        </div>
                        <ul className="category-mega-child-list brand-menu-list">
                          {filteredBrands.map((brand) => (
                            <li key={brand.id}>
                              <button
                                type="button"
                                className="category-mega-child-item"
                                onClick={() => goToBrandProducts(brand)}
                              >
                                <span>{brand.name}</span>
                              </button>
                            </li>
                          ))}

                          {filteredBrands.length === 0 ? (
                            <li className="text-muted small p-2">Không tìm thấy nhãn hàng phù hợp.</li>
                          ) : null}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </Nav.Item>

              <Nav.Link as={NavLink} to="/products" className="fw-medium text-dark">
                Hàng hóa
              </Nav.Link>
              <Nav.Link as={NavLink} to="/promotions" className="fw-medium text-dark">
                Khuyến mãi
              </Nav.Link>
              <Nav.Link as={NavLink} to="/blog" className="fw-medium text-dark">
                Blog
              </Nav.Link>
              <Nav.Link as={NavLink} to="/hot-deal" className="fw-semibold text-danger">
                Hot Deal
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}
