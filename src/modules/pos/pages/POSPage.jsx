import ProductSearch from "../components/ProductSearch";
import ProductGrid from "../components/ProductGrid";
import CartPanel from "../components/CartPanel";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { orderService } from "@/core/api/orderService";


const POSPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState(null);
  const [cart, setCart] = useState(null);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const initOrder = async () => {
      const res = await orderService.createOrder(1);
      setOrder(res);
      setOrderId(res.id);
    };

    initOrder();
  }, []);

  const handleAddToCart = async ({ productUnitId, quantity }) => {

    const res = await orderService.updateCart(
      order.id,
      productUnitId,
      quantity
    );

    setCart(res.orderDetails);

  };

  return (

    <div className="bg-[#f6f8f7] min-h-screen p-6">

      <div className="grid grid-cols-12 gap-6">

        {/* PRODUCT AREA */}

        <div className="col-span-8 bg-white rounded-xl shadow-sm p-5">

          <ProductSearch onSelect={setProducts} />

          <ProductGrid
            products={products}
            onAdd={handleAddToCart}
          />

        </div>

        {/* CART */}

        <div className="col-span-4">

          <div className="bg-white rounded-xl shadow-sm p-5 sticky top-6">

            <CartPanel
              cart={cart}
              orderId={orderId}
            />

          </div>
<div className="mb-4">

    <button
      onClick={() => navigate("/")}
      className="
      bg-gray-200
      hover:bg-gray-300
      px-4
      py-2
      rounded-lg
      font-medium
      transition
      "
    >
      ← Back to Home
    </button>

  </div>
        </div>
        
      </div>

    </div>

  );

};

export default POSPage;