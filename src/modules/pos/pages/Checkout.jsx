import { useEffect } from "react";
import orderService from "@/core/api/orderService";
import useCartStore from "../store/useCartStore";
import CheckoutForm from "../components/CheckoutForm";

const Checkout = () => {

  const { orderId, setOrder } = useCartStore();

  const initOrder = async () => {
    try {
      const res = await orderService.initOrder({
        employeeId: 1
      });

      setOrder(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!orderId) {
      initOrder();
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        POS Checkout
      </h1>

      <CheckoutForm />
    </div>
  );
};

export default Checkout;