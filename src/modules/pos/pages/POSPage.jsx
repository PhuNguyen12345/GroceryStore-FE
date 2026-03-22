import ProductSearch from "../components/ProductSearch";
import ProductGrid from "../components/ProductGrid";
import CartPanel from "../components/CartPanel";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { orderService } from "@/core/api/orderService";
import AdminLayout from "@/layouts/AdminLayout";
import CustomerPanel from "../components/CustomerPanel";
import { productService } from "@/core/api/productService";

const POSPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState(null);
  const [cart, setCart] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const setCustomerForOrder = (customer) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === activeOrderId ? { ...o, customer } : o)),
    );
  };

  const setVoucherForOrder = (voucher) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === activeOrderId ? { ...o, selectedVoucher: voucher } : o,
      ),
    );
  };

  const setPointsForOrder = (points) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === activeOrderId ? { ...o, usedPoints: points } : o,
      ),
    );
  };

  const loadProducts = async (p = 0) => {
    const res = await productService.searchProducts("", p, 6);
    setProducts(res.content);
    setTotalPages(res.totalPages);
    setPage(p);
  };

  useEffect(() => {
    loadProducts(0);
  }, []);
  // useEffect(() => {

  //   const initOrder = async () => {
  //     const res = await orderService.createOrder(1);
  //     setOrder(res);
  //     setOrderId(res.id);
  //   };

  //   initOrder();
  // }, []);
  const createNewOrder = async () => {
    const res = await orderService.createOrder(1);

    const newOrder = {
      id: res.id,
      cart: [],
      customer: null,
      selectedVoucher: null,
      usedPoints: 0,
    };

    setOrders((prev) => [...prev, newOrder]);
    setActiveOrderId(res.id);
  };

  const activeOrder = orders.find((o) => o.id === activeOrderId);

  const handleAddToCart = async ({ productUnitId, quantity }) => {
    const res = await orderService.updateCart(
      activeOrderId,
      productUnitId,
      quantity,
    );

    setOrders((prev) =>
      prev.map((o) =>
        o.id === activeOrderId ? { ...o, cart: res.orderDetails } : o,
      ),
    );
  };
  return (
    <AdminLayout>
      <div className="flex gap-2 mb-3 overflow-x-auto">
        {orders.map((o) => (
          <button
            key={o.id}
            onClick={() => setActiveOrderId(o.id)}
            className={`px-4 py-2 rounded ${
              o.id === activeOrderId ? "bg-green-600 text-white" : "bg-gray-200"
            }`}
          >
            Order #{o.id}
          </button>
        ))}

        <button
          onClick={createNewOrder}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          + New
        </button>
      </div>
      <div className="bg-[#f6f8f7] min-h-screen p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* PRODUCT AREA */}

          <div className="col-span-8 bg-white rounded-xl shadow-sm p-5">
            <ProductSearch onSelect={setProducts} />

            <ProductGrid
              products={products}
              onAdd={handleAddToCart}
              page={page}
              totalPages={totalPages}
              onPageChange={loadProducts}
            />
          </div>

          {/* CART */}

          <div className="col-span-4">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-6">
              <CustomerPanel onSelect={setCustomerForOrder} />

              {/* Selected customer */}

              {activeOrder?.customer && (
                <div className="mb-3 p-3 bg-green-50 border rounded-lg space-y-1">
                  <div className="font-medium">
                    {activeOrder.customer.fullName}
                  </div>

                  <div className="text-sm text-gray-500">
                    {activeOrder.customer.phone}
                  </div>

                  <div className="text-sm text-yellow-600 font-medium">
                    ⭐ {activeOrder.customer.loyaltyPoints} điểm
                  </div>

                  <div className="text-xs text-gray-500">
                    Hạng: {activeOrder.customer.customerTier}
                  </div>
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
              />
            </div>
            <div className="mb-4"></div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default POSPage;
