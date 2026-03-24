import { useEffect, useState } from "react";
import CheckoutModal from "./CheckoutModal";
import { voucherService } from "@/core/api/voucherService";

const CartPanel = ({
  cart = [],
  orderId,
  customer,
  selectedVoucher,
  usedPoints,
  onSelectVoucher,
  onChangePoints,
  onRemoveItem,
  onPaymentSuccess,
}) => {
  const [vouchers, setVouchers] = useState([]);
  const [openCheckout, setOpenCheckout] = useState(false);
  const voucherDiscount = Number(selectedVoucher?.discountValue || 0);
  const safeUsedPoints = Number(usedPoints || 0);

  const total = (cart || []).reduce(
    (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
    0,
  );

  const afterVoucher = Math.max(total - voucherDiscount, 0);
  const pointDiscount = Math.min(safeUsedPoints * 1000, afterVoucher);
  const finalTotal = Math.max(afterVoucher - pointDiscount, 0);

  useEffect(() => {
    if (total <= 0) {
      setVouchers([]);
      return;
    }

    const loadVoucher = async () => {
      try {
        const res = await voucherService.getApplicableVouchers(total);
        setVouchers(res.content || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadVoucher();
  }, [total]);

  useEffect(() => {
    if (!customer) return;

    const maxPointsByMoney = Math.floor(afterVoucher / 1000);

    if (usedPoints > customer.loyaltyPoints) {
      onChangePoints(customer.loyaltyPoints);
    } else if (usedPoints > maxPointsByMoney) {
      onChangePoints(maxPointsByMoney);
    } else if (usedPoints < 0) {
      onChangePoints(0);
    }
  }, [usedPoints, customer, afterVoucher, onChangePoints]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Giỏ hàng</h2>

      {(cart || []).length === 0 && <div className="text-gray-400">Giỏ hàng trống</div>}

      {(cart || []).map((item) => (
        <div
          key={item.id}
          className="flex justify-between bg-gray-50 rounded-lg p-3 mb-3"
        >
          <div>
            <div className="font-medium">{item.productName}</div>
            <div className="text-sm text-gray-500">{item.productUnitName}</div>
            <div className="text-sm">x{item.quantity}</div>
          </div>

          <div className="text-right">
            <div>{item.price}đ</div>
            <div className="font-medium">{item.subtotal} đ</div>
            <button
              type="button"
              className="text-red-600 text-sm mt-1 hover:underline"
              onClick={() => onRemoveItem?.(item.productUnitId)}
            >
              Xóa
            </button>
          </div>
        </div>
      ))}

      {vouchers.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Vouchers</h3>

          {vouchers.map((v) => (
            <div
              key={v.id}
              className="flex justify-between items-center border border-green-200 bg-green-50 p-3 mb-2 rounded-lg"
            >
              <div>
                <div className="font-medium">{v.code}</div>
                <div className="text-sm text-gray-500">Giảm giá: {v.discountValue}</div>
              </div>

              <button
                onClick={() => onSelectVoucher(v)}
                className="bg-[#2c9a67] hover:bg-[#1a7a4d] text-white px-3 py-1 rounded text-sm"
              >
                Áp dụng
              </button>
            </div>
          ))}
        </div>
      )}

      {customer && (
        <div className="mt-4 border rounded-lg p-3 bg-yellow-50">
          <div className="font-medium mb-2">Sử dụng điểm</div>

          <input
            type="number"
            value={usedPoints}
            onChange={(e) => onChangePoints(Number(e.target.value))}
            max={Math.min(customer?.loyaltyPoints || 0, Math.floor(afterVoucher / 1000))}
            min={0}
            className="border p-2 w-full rounded"
            placeholder="Nhập số điểm"
          />
          <button
            onClick={() =>
              onChangePoints(
                Math.min(customer.loyaltyPoints, Math.floor(afterVoucher / 1000)),
              )
            }
            className="text-sm text-blue-600 mt-1"
          >
            Dùng tối đa
          </button>
          <div className="text-xs text-gray-500 mt-1">Có: {customer.loyaltyPoints} điểm</div>
        </div>
      )}

      <div className="mt-4 border-t pt-3">
        <div className="flex justify-between">
          <span>Tổng phụ</span>
          <span>{total} đ</span>
        </div>

        {selectedVoucher && (
          <div className="flex justify-between text-green-600">
            <span>Voucher ({selectedVoucher.code})</span>
            <span>-{voucherDiscount} đ</span>
          </div>
        )}

        {usedPoints > 0 && (
          <div className="flex justify-between text-orange-500">
            <span>Dùng điểm</span>
            <span>-{pointDiscount} đ</span>
          </div>
        )}

        <div className="flex justify-between font-bold text-lg mt-2">
          <span>Tổng tiền</span>
          <span>{finalTotal} đ</span>
        </div>
      </div>

      <button
        onClick={() => setOpenCheckout(true)}
        className="w-full bg-[#1a7a4d] hover:bg-[#145a3a] text-white py-3 rounded-lg text-lg font-semibold mt-4 transition"
      >
        Thanh toán
      </button>

      {openCheckout && (
        <CheckoutModal
          orderId={orderId}
          total={finalTotal}
          onClose={() => setOpenCheckout(false)}
          onPaymentSuccess={onPaymentSuccess}
        />
      )}
    </div>
  );
};

export default CartPanel;
