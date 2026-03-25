import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductSearch from "../components/ProductSearch";
import ProductGrid from "../components/ProductGrid";
import CartPanel from "../components/CartPanel";
import { orderService } from "@/core/api/orderService";
import AdminLayout from "@/layouts/AdminLayout";
import CustomerPanel from "../components/CustomerPanel";
import { productService } from "@/core/api/productService";
import { useAuthStore } from "@/core/store/useAuthStore";

const POS_ORDER_CACHE_KEY = "pos_order_tabs_cache_v1";

function mapApiOrderToUi(order) {
  return {
    id: order.id,
    cart: order.orderDetails || [],
    customer: order.customer || null,
    selectedVoucher: null,
    usedPoints: 0,
  };
}

function getOrderStatus(payload) {
  const raw = payload?.status ?? payload?.data?.status ?? payload?.content?.status ?? "";
  return String(raw).trim().toUpperCase();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readOrderCache() {
  try {
    const raw = localStorage.getItem(POS_ORDER_CACHE_KEY);
    if (!raw) return { orders: [], activeOrderId: null };
    const parsed = JSON.parse(raw);
    return {
      orders: Array.isArray(parsed?.orders) ? parsed.orders : [],
      activeOrderId: typeof parsed?.activeOrderId === "number" ? parsed.activeOrderId : null,
    };
  } catch {
    return { orders: [], activeOrderId: null };
  }
}

function writeOrderCache(orders, activeOrderId) {
  try {
    localStorage.setItem(POS_ORDER_CACHE_KEY, JSON.stringify({ orders, activeOrderId }));
  } catch {
    // Ignore browser storage errors.
  }
}



const POSPage = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paymentNotice, setPaymentNotice] = useState(null);
  const [pendingSyncOrderId, setPendingSyncOrderId] = useState(null);
  const ordersRef = useRef([]);

  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = useAuthStore((state) => state.user);
  const currentEmployeeId = currentUser?.employeeId || currentUser?.id || null;

  const setCustomerForOrder = async (customer) => {
    if (!activeOrderId) return;
    try {
      if (customer?.id) {
        await orderService.updateCustomer(activeOrderId, customer.id);
      }
      setOrders((prev) => prev.map((o) => (o.id === activeOrderId ? { ...o, customer } : o)));
    } catch (err) {
      console.error("Loi khi cap nhat khach hang", err);
    }
  };

  const setVoucherForOrder = (voucher) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === activeOrderId ? { ...o, selectedVoucher: voucher } : o)),
    );
  };

  const setPointsForOrder = (points) => {
    setOrders((prev) => prev.map((o) => (o.id === activeOrderId ? { ...o, usedPoints: points } : o)));
  };

  const loadProducts = async (p = 0) => {
    const res = await productService.searchProducts("", p, 6);
    setProducts(res.content || []);
    setTotalPages(res.totalPages || 0);
    setPage(p);
  };

  const pruneCompletedOrders = async () => {
    const currentOrders = ordersRef.current;
    if (!currentOrders.length) return;

    try {
      const checks = await Promise.all(
        currentOrders.map(async (o) => {
          try {
            const latest = await orderService.getOrderById(o.id);
            return { id: o.id, status: getOrderStatus(latest) || "PENDING" };
          } catch {
            return { id: o.id, status: "PENDING" };
          }
        }),
      );

      const completedIds = new Set(
        checks.filter((x) => x.status === "COMPLETED").map((x) => x.id),
      );
      if (!completedIds.size) return;

      let firstRemainingId = null;
      setOrders((prev) => {
        const next = prev.filter((o) => !completedIds.has(o.id));
        firstRemainingId = next.length ? next[0].id : null;
        return next;
      });
      setActiveOrderId((prev) => {
        if (!prev || completedIds.has(prev)) return firstRemainingId;
        return prev;
      });

      setPaymentNotice((prev) => (prev && completedIds.has(prev.orderId) ? null : prev));
      if (pendingSyncOrderId && completedIds.has(pendingSyncOrderId)) {
        setPendingSyncOrderId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const pendingOrdersAPI = await orderService.getPendingOrders();
        const cached = readOrderCache();
        const cachedOrders = cached.orders || [];
        
        let pendingOnly = [];
        if (pendingOrdersAPI && pendingOrdersAPI.length > 0) {
          pendingOnly = pendingOrdersAPI.map((o) => {
            const cachedMatch = cachedOrders.find((c) => c.id === o.id);
            return {
              ...mapApiOrderToUi(o),
              customer: o.customer || cachedMatch?.customer || null,
              selectedVoucher: cachedMatch?.selectedVoucher || null,
              usedPoints: cachedMatch?.usedPoints || 0,
            };
          });
        }
        
        setOrders(pendingOnly);
        
        if (pendingOnly.length > 0) {
          const cachedActiveId = cached?.activeOrderId;
          if (cachedActiveId && pendingOnly.some((o) => o.id === cachedActiveId)) {
            setActiveOrderId(cachedActiveId);
          } else {
            setActiveOrderId(pendingOnly[0].id);
          }
        } else {
          setActiveOrderId(null);
        }
      } catch (err) {
        console.error("Failed to load pending orders on bootstrap:", err);
      }

      loadProducts(0);
    };

    bootstrap();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      pruneCompletedOrders();
    }, 5000);

    return () => clearInterval(timer);
  }, [pendingSyncOrderId]);

  useEffect(() => {
    ordersRef.current = orders;
    writeOrderCache(orders, activeOrderId);
  }, [orders, activeOrderId]);

  useEffect(() => {
    if (!paymentNotice) return;
    if (paymentNotice.orderId && paymentNotice.orderId !== activeOrderId) {
      setPaymentNotice(null);
    }
  }, [activeOrderId, paymentNotice]);

  useEffect(() => {
    if (!paymentNotice) return undefined;
    const timer = setTimeout(() => setPaymentNotice(null), 8000);
    return () => clearTimeout(timer);
  }, [paymentNotice]);

  const handleOrderPaid = (paidOrderId) => {
    setOrders((prev) => {
      const next = prev.filter((o) => o.id !== paidOrderId);
      setActiveOrderId((current) => {
        if (!next.length) return null;
        if (current && next.some((o) => o.id === current)) return current;
        return next[0].id;
      });
      return next;
    });

    setPaymentNotice({
      orderId: paidOrderId,
      message: `Don #${paidOrderId} da thanh toan thanh cong.`,
    });
    setPendingSyncOrderId(null);

    // Refresh inventory products after a successful payment
    setRefreshKey((prev) => prev + 1);
    loadProducts(page);
  };

  const closeOrderTab = async (orderId) => {
    try {
      await orderService.cancelOrder(orderId);
    } catch (err) {
      console.error("Failed to cancel order on close", err);
    }

    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === orderId);
      if (idx < 0) return prev;

      const next = prev.filter((o) => o.id !== orderId);
      setActiveOrderId((current) => {
        if (current !== orderId) return current;
        if (!next.length) return null;
        if (idx < next.length) return next[idx].id;
        return next[next.length - 1].id;
      });
      return next;
    });

    if (paymentNotice?.orderId === orderId) {
      setPaymentNotice(null);
    }
    if (pendingSyncOrderId === orderId) {
      setPendingSyncOrderId(null);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const provider = params.get("provider");
    const orderIdParam = params.get("orderId");

    if (provider !== "payos" || !orderIdParam) return;

    const orderId = Number(orderIdParam);
    if (!Number.isFinite(orderId) || orderId <= 0) {
      navigate("/orders", { replace: true });
      return;
    }

    const syncAfterReturn = async () => {
      try {
        const order = await orderService.syncPaymentStatus(orderId);
        if (getOrderStatus(order) === "COMPLETED") {
          handleOrderPaid(orderId);
        } else {
          let latest = await orderService.getOrderById(orderId);
          let latestStatus = getOrderStatus(latest);

          for (let i = 0; i < 2 && latestStatus !== "COMPLETED"; i += 1) {
            await sleep(1000);
            latest = await orderService.getOrderById(orderId);
            latestStatus = getOrderStatus(latest);
          }

          if (latestStatus === "COMPLETED") {
            handleOrderPaid(orderId);
          } else {
            setPaymentNotice({
              orderId,
              message: `Don #${orderId} chua hoan tat. He thong dang dong bo lai.`,
            });
            setPendingSyncOrderId(orderId);
          }
        }
      } catch (err) {
        console.error(err);
        setPaymentNotice({
          orderId,
          message: `Khong the dong bo thanh toan cho don #${orderId}.`,
        });
        setPendingSyncOrderId(orderId);
      } finally {
        navigate("/orders", { replace: true });
      }
    };

    syncAfterReturn();
  }, [location.search, navigate]);

  useEffect(() => {
    if (!pendingSyncOrderId) return undefined;

    const timer = setInterval(async () => {
      try {
        const latest = await orderService.getOrderById(pendingSyncOrderId);
        if (getOrderStatus(latest) === "COMPLETED") {
          handleOrderPaid(pendingSyncOrderId);
        }
      } catch {
        // Continue retry until backend status is updated.
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [pendingSyncOrderId]);

  const createNewOrder = async () => {
    if (!currentEmployeeId) {
      alert("Khong xac dinh duoc tai khoan nhan vien dang dang nhap.");
      return null;
    }

    const res = await orderService.createOrder(currentEmployeeId);
    const newOrder = {
      id: res.id,
      cart: [],
      customer: null,
      selectedVoucher: null,
      usedPoints: 0,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrderId(res.id);
    return res.id;
  };

  const activeOrder = orders.find((o) => o.id === activeOrderId);

  const handleAddToCart = async ({ productUnitId, quantity }) => {
    let targetOrderId = activeOrderId;

    if (!targetOrderId) {
      targetOrderId = await createNewOrder();
      if (!targetOrderId) return;
    }

    const res = await orderService.updateCart(targetOrderId, productUnitId, quantity);
    setOrders((prev) =>
      prev.map((o) => (o.id === targetOrderId ? { ...o, cart: res.orderDetails || [] } : o)),
    );
  };

  const handleRemoveFromCart = async (productUnitId) => {
    if (!activeOrderId) return;

    const res = await orderService.updateCart(activeOrderId, productUnitId, 0);
    setOrders((prev) =>
      prev.map((o) => (o.id === activeOrderId ? { ...o, cart: res.orderDetails || [] } : o)),
    );
  };

  return (
    <AdminLayout>
      <div className="flex gap-2 mb-3 overflow-x-auto">
        {orders.map((o) => (
          <button
            key={o.id}
            onClick={() => setActiveOrderId(o.id)}
            className={`inline-flex items-center px-4 py-2 rounded ${
              o.id === activeOrderId ? "bg-green-600 text-white" : "bg-gray-200"
            }`}
          >
            <span>Order #{o.id}</span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                closeOrderTab(o.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  closeOrderTab(o.id);
                }
              }}
              className={`ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                o.id === activeOrderId ? "bg-white/20" : "bg-black/10"
              }`}
            >
              x
            </span>
          </button>
        ))}

        <button onClick={createNewOrder} className="px-4 py-2 bg-blue-600 text-white rounded">
          + Thêm mới
        </button>
      </div>

      {paymentNotice?.message && (
        <div className="mb-3 rounded border border-green-300 bg-green-50 px-4 py-3 text-green-800">
          {paymentNotice.message}
        </div>
      )}

      <div className="bg-[#f6f8f7] min-h-screen p-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 bg-white rounded-xl shadow-sm p-5">
            <ProductSearch onSelect={setProducts} />

            <ProductGrid
              products={products}
              onAdd={handleAddToCart}
              page={page}
              totalPages={totalPages}
              onPageChange={loadProducts}
              refreshKey={refreshKey}
            />
          </div>

          <div className="col-span-4">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-6">
              <CustomerPanel onSelect={setCustomerForOrder} />

              {activeOrder?.customer && (
                <div className="mb-3 p-3 bg-green-50 border rounded-lg space-y-1">
                  <div className="font-medium">{activeOrder.customer.fullName}</div>
                  <div className="text-sm text-gray-500">{activeOrder.customer.phone}</div>
                  <div className="text-sm text-yellow-600 font-medium">
                    * {activeOrder.customer.loyaltyPoints} diem
                  </div>
                  <div className="text-xs text-gray-500">Hang: {activeOrder.customer.customerTier}</div>
                </div>
              )}

              <CartPanel
                cart={activeOrder?.cart}
                orderId={activeOrderId}
                customer={activeOrder?.customer}
                selectedVoucher={activeOrder?.selectedVoucher}
                usedPoints={activeOrder?.usedPoints}
                onSelectVoucher={setVoucherForOrder}
                onChangePoints={setPointsForOrder}
                onRemoveItem={handleRemoveFromCart}
                onPaymentSuccess={handleOrderPaid}
              />
            </div>
            <div className="mb-4" />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default POSPage;
