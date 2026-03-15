import { useState } from "react";
import { orderService } from "@/core/api/orderService";

const CheckoutModal = ({ orderId, total, voucherId }) => {

  const [qrUrl, setQrUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const finishPayment = () => {

    alert("Payment success");

    window.location.reload();

  };

  const checkoutCash = async () => {

    try {

      setLoading(true);

      await orderService.checkout(orderId, {
        paymentMethod: "CASH",
        voucherId: voucherId || null
      });

      finishPayment();

    } catch (err) {

      console.error(err);
      alert("Payment failed");

    } finally {

      setLoading(false);

    }

  };

  const checkoutQR = async () => {

    try {

      setLoading(true);

      const res = await orderService.checkout(orderId, {
        paymentMethod: "QR_CODE",
        voucherId: voucherId || null
      });

      setQrUrl(res.qrUrl);

    } catch (err) {

      console.error(err);
      alert("QR payment failed");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white w-[500px] p-6 rounded">

        <h2 className="text-2xl font-bold mb-4">
          Checkout
        </h2>

        <div className="text-xl mb-6">
          Total: <b>{total.toLocaleString()} đ</b>
        </div>

        {!qrUrl && (

          <div className="flex gap-4">

            <button
              disabled={loading}
              onClick={checkoutCash}
              className="flex-1 bg-green-600 text-white py-4 text-lg rounded"
            >
              Cash
            </button>

            <button
              disabled={loading}
              onClick={checkoutQR}
              className="flex-1 bg-blue-600 text-white py-4 text-lg rounded"
            >
              Bank QR
            </button>

          </div>

        )}

        {qrUrl && (

          <div className="text-center">

            <p className="mb-3">
              Scan QR to pay
            </p>

            <img
              src={qrUrl}
              alt="QR"
              className="mx-auto w-64"
            />

            <button
              onClick={finishPayment}
              className="mt-4 px-4 py-2 border rounded"
            >
              Done
            </button>

          </div>

        )}

      </div>

    </div>

  );

};

export default CheckoutModal;