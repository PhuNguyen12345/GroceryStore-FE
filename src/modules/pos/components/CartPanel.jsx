import { useState, useEffect } from "react";
import CheckoutModal from "./CheckoutModal";
import { voucherService } from "@/core/api/voucherService";

const CartPanel = ({ cart = [], orderId }) => {

  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [openCheckout, setOpenCheckout] = useState(false);

  const total = (cart || []).reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const discount = selectedVoucher
    ? selectedVoucher.discountValue
    : 0;

  const finalTotal = total - discount;

  // load voucher when total changes
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

  return (

    <div className="p-4">

      <h2 className="text-xl font-bold mb-4">
        Cart
      </h2>

      {(cart || []).length === 0 && (
        <div className="text-gray-400">
          Cart is empty
        </div>
      )}

      {(cart || []).map((item) => (

        <div
          key={item.id}
          className="
flex
justify-between
bg-gray-50
rounded-lg
p-3
mb-3
"
        >

          <div>

            <div className="font-medium">
              {item.productName}
            </div>

            <div className="text-sm text-gray-500">
              {item.productUnitName}
            </div>

            <div className="text-sm">
              x{item.quantity}
            </div>

          </div>

          <div className="text-right">

            <div>
              {item.price}đ
            </div>

            <div className="font-medium">
              {item.subtotal} đ
            </div>

          </div>

        </div>

      ))}

      {/* VOUCHER LIST */}

      {vouchers.length > 0 && (

        <div className="mt-4">

          <h3 className="font-semibold mb-2">
            Available Vouchers
          </h3>

          {vouchers.map(v => (

            <div
              key={v.id}
              className="
flex
justify-between
items-center
border
border-green-200
bg-green-50
p-3
mb-2
rounded-lg
"
            >

              <div>

                <div className="font-medium">
                  {v.code}
                </div>

                <div className="text-sm text-gray-500">
                  Discount: {v.discountValue}
                </div>

              </div>

              <button
                onClick={() => setSelectedVoucher(v)}
                className="
bg-[#2c9a67]
hover:bg-[#1a7a4d]
text-white
px-3
py-1
rounded
text-sm
"
              >
                Apply
              </button>

            </div>

          ))}

        </div>

      )}

      {/* TOTAL */}

      <div className="mt-4 border-t pt-3">

        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{total} đ</span>
        </div>

        {selectedVoucher && (

          <div className="flex justify-between text-green-600">

            <span>
              Voucher ({selectedVoucher.code})
            </span>

            <span>
              -{discount} đ
            </span>

          </div>

        )}

        <div className="flex justify-between font-bold text-lg mt-2">

          <span>Total</span>

          <span>
            {finalTotal} đ
          </span>

        </div>

      </div>

      {/* CHECKOUT */}

      <button
        onClick={() => setOpenCheckout(true)}
        className="
w-full
bg-[#1a7a4d]
hover:bg-[#145a3a]
text-white
py-3
rounded-lg
text-lg
font-semibold
mt-4
transition
"
      >
        Checkout
      </button>

      {openCheckout && (

        <CheckoutModal
          orderId={orderId}
          total={finalTotal}
          voucherId={selectedVoucher?.id}
          onClose={() => setOpenCheckout(false)}
        />

      )}

    </div>

  );

};

export default CartPanel;