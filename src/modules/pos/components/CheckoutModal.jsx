import { useEffect, useRef, useState } from "react";
import { orderService } from "@/core/api/orderService";

function getErrorMessage(err, fallback) {
  const data = err?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  return fallback;
}

const CheckoutModal = ({
  orderId,
  total,
  onClose,
  onPaymentSuccess,
  usedPoints,
  voucherId,
  customerId,
}) => {
  const [qrUrl, setQrUrl] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const completedRef = useRef(false);

  const hasOnlinePaymentSession = Boolean(qrUrl || checkoutUrl);

  const finishPayment = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsCompleted(true);
    onPaymentSuccess?.(orderId);
    alert("Thanh toán thành công");
    onClose?.();
  };

  const checkoutCash = async () => {
    try {
      setLoading(true);
      await orderService.checkout(orderId, {
        paymentMethod: "CASH",
        amountPaid: total,
        usedPoints: usedPoints,
        voucherId: voucherId,
        customerId: customerId,
      });
      finishPayment();
    } catch (err) {
      console.error(err);
      alert(getErrorMessage(err, "Thanh toán thất bại"));
    } finally {
      setLoading(false);
    }
  };

  const checkoutQR = async () => {
    if (!orderId) {
      alert("Chua co don hang de tao thanh toan.");
      return;
    }

    if (Number(total || 0) <= 0) {
      alert("Don hang trong hoac tong tien bang 0, chua the thanh toan.");
      return;
    }

    try {
      setLoading(true);
      setQrUrl(null);
      setCheckoutUrl(null);

      const res = await orderService.createQr(orderId);
      const nextQrUrl = res?.qrUrl || null;
      const nextCheckoutUrl = res?.checkoutUrl || null;
      setQrUrl(nextQrUrl);
      setCheckoutUrl(nextCheckoutUrl);

      if (nextCheckoutUrl) {
        window.location.assign(nextCheckoutUrl);
        return;
      }

      if (!nextQrUrl) {
        alert("Khong tao duoc ma QR/link thanh toan.");
      }
    } catch (err) {
      console.error(err);
      alert(getErrorMessage(err, "Tao thanh toan that bai"));
    } finally {
      setLoading(false);
    }
  };

  const confirmQrPaid = async () => {
    try {
      setLoading(true);
      await orderService.checkout(orderId, {
        paymentMethod: "QR_CODE",
        amountPaid: total,
        usedPoints: usedPoints,
        voucherId: voucherId,
      });
      finishPayment();
    } catch (err) {
      console.error(err);
      alert(getErrorMessage(err, "Xac nhan thanh toan QR that bai"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasOnlinePaymentSession || isCompleted) return undefined;

    const timer = setInterval(async () => {
      try {
        const order = await orderService.syncPaymentStatus(orderId);
        if (order?.status === "COMPLETED") {
          finishPayment();
        }
      } catch {
        // Keep polling even if one request fails.
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [hasOnlinePaymentSession, orderId, isCompleted]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-[500px] p-6 rounded"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Thanh toán</h2>

        <div className="text-xl mb-6">
          Tổng tiền: <b>{Number(total || 0).toLocaleString()} đ</b>
        </div>

        {!qrUrl && (
          <div className="flex gap-4">
            <button
              disabled={loading}
              onClick={checkoutCash}
              className="flex-1 bg-green-600 text-white py-4 text-lg rounded"
            >
              Tiền mặt
            </button>

            <button
              disabled={loading || Number(total || 0) <= 0 || !orderId}
              onClick={checkoutQR}
              className="flex-1 bg-blue-600 text-white py-4 text-lg rounded"
            >
              Bank QR
            </button>
          </div>
        )}

        {qrUrl && (
          <div className="text-center">
            <p className="mb-3">Quet ma QR de thanh toan</p>
            <img src={qrUrl} alt="QR" className="mx-auto w-64" />

            <button
              onClick={confirmQrPaid}
              disabled={loading}
              className="mt-4 px-4 py-2 border rounded"
            >
              Toi da thanh toan
            </button>

            <p className="text-sm text-gray-500 mt-2">
              He thong se tu xac nhan khi nhan duoc giao dich dung noi dung.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
