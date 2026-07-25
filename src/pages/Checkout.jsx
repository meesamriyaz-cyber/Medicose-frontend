import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useCartStore } from "../hooks/useCartStore";
import api from "../lib/axios";
import { toast } from "react-hot-toast";

const Checkout = () => {
  const navigate = useNavigate();
  const {
    cart,
    subtotal,
    total,
    coupon,
    isCouponApplied,
    directDiscountPercentage,
    isDirectDiscountApplied,
  } = useCartStore();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!cart || cart.length === 0) {
      navigate("/cart");
    }
  }, [cart, navigate]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (processing) return;
    setProcessing(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Payment gateway failed to load. Please try again.");
        setProcessing(false);
        return;
      }

      const orderItems = cart.map((item) => ({
        product: item.productId || item._id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
      }));

      const payload = {
        totalAmount: Number(total.toFixed(2)),
        cartItems: orderItems,
        couponCode: isCouponApplied && coupon ? coupon.code : undefined,
      };

      const [createRes, keyRes] = await Promise.all([
        api.post("/payment/createcheckout", payload),
        api.get("/payment/getkey"),
      ]);

      const order = createRes.data?.order;
      const key = keyRes.data?.key;

      if (!order || !key) {
        toast.error(createRes.data?.message || "Failed to initiate checkout");
        setProcessing(false);
        return;
      }

      const options = {
        key,
        amount: order.amount || Math.round(Number(total.toFixed(2)) * 100),
        currency: "INR",
        name: "Haleem Medicose",
        order_id: order.id,
        handler: function (response) {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
          navigate(`/location?fromCheckout=true&pendingOrder=${encodeURIComponent(razorpay_order_id)}`, {
            state: {
              fromCheckout: true,
              pendingPayment: {
                payment_id: razorpay_payment_id,
                order_id: razorpay_order_id,
                signature: razorpay_signature,
                orderItems,
                totalAmount: Number(total.toFixed(2)),
                couponApplied: isCouponApplied && coupon ? { code: coupon.code, discountPercentage: coupon.discountPercentage } : null,
              },
            },
          });
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#008080",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        toast.error("Payment failed. Please try again.");
        setProcessing(false);
      });
      rzp.open();
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.message || error.message || "Checkout failed");
      setProcessing(false);
    }
  };

  if (!cart || cart.length === 0) return null;

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "linear-gradient(180deg, #f8fffe 0%, #f0f9f7 100%)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/cart")}
            className="p-2 rounded-lg transition-all hover:shadow-md"
            style={{
              background: "linear-gradient(135deg, rgba(0, 128, 128, 0.1) 0%, rgba(0, 51, 102, 0.1) 100%)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#008080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{
              background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Checkout
          </h1>
        </div>

        <div className="rounded-2xl p-5 sm:p-6 mb-4" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8fffe 100%)", border: "1px solid rgba(0, 128, 128, 0.15)", boxShadow: "0 8px 24px rgba(0, 128, 128, 0.08)" }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: "#003366" }}>Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between" style={{ color: "#334155" }}>
              <span>Subtotal</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            {isCouponApplied && coupon && (
              <div className="flex justify-between" style={{ color: "#2ecc71" }}>
                <span>Coupon ({coupon.code})</span>
                <span className="font-semibold">-{coupon.discountPercentage}%</span>
              </div>
            )}
            {isDirectDiscountApplied && directDiscountPercentage > 0 && (
              <div className="flex justify-between" style={{ color: "#2ecc71" }}>
                <span>Direct Discount</span>
                <span className="font-semibold">-{directDiscountPercentage}%</span>
              </div>
            )}
            <div className="flex justify-between pt-3" style={{ borderTop: "1px solid rgba(0, 128, 128, 0.1)" }}>
              <span className="text-base font-bold" style={{ color: "#003366" }}>Total</span>
              <span className="text-base font-bold" style={{ color: "#008080" }}>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={processing}
          className="w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #008080 0%, #003366 100%)", boxShadow: "0 4px 14px rgba(0, 128, 128, 0.25)" }}
        >
          {processing ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Proceed to Payment"
          )}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
