import { motion } from "framer-motion";
import { useCartStore } from "../hooks/useCartStore";
import { MoveRight } from "lucide-react";
import formatCurrency from "../lib/formatCurrency";
import { Link, useNavigate } from "react-router-dom";
import { isLocalMode } from "../config/appMode";

const OrderSummary = () => {
  const { total, subtotal, coupon, isCouponApplied, cart, isDirectDiscountApplied, directDiscountPercentage } = useCartStore();
  const navigate = useNavigate();

  const savings = subtotal - total;
  const formattedSubtotal = formatCurrency(subtotal.toFixed(2));
  const formattedTotal = formatCurrency(total.toFixed(2));
  const formattedSavings = savings.toFixed(2);

  const handleProceed = () => {
    if (!cart || cart.length === 0) return;
    if (isLocalMode) {
      navigate("/sale-review");
    } else {
      navigate("/checkout");
    }
  };

  return (
    <motion.div
      className="space-y-4 rounded-2xl p-5 sm:p-6 w-full max-w-md mx-auto"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f8fffe 100%)",
        border: "1px solid rgba(0, 128, 128, 0.15)",
        boxShadow: "0 8px 24px rgba(0, 128, 128, 0.08)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p
        className="text-lg sm:text-xl font-bold text-center sm:text-left"
        style={{
          background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Order Summary
      </p>

      <div className="space-y-4">
        <div
          className="space-y-3 p-4 rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 128, 128, 0.03) 0%, rgba(0, 51, 102, 0.03) 100%)",
          }}
        >
          <dl className="flex items-center justify-between gap-2 sm:gap-4">
            <dt
              className="text-sm sm:text-base font-normal"
              style={{ color: "#64748b" }}
            >
              Original price
            </dt>
            <dd
              className="text-sm sm:text-base font-semibold"
              style={{ color: "#334155" }}
            >
              {formattedSubtotal}
            </dd>
          </dl>

          {savings > 0 && (
            <dl className="flex items-center justify-between gap-2 sm:gap-4">
              <dt
                className="text-sm sm:text-base font-normal"
                style={{ color: "#64748b" }}
              >
                Savings
              </dt>
              <dd
                className="text-sm sm:text-base font-semibold"
                style={{ color: "#2ecc71" }}
              >
                -{formattedSavings}
              </dd>
            </dl>
          )}

          {coupon && isCouponApplied && (
            <dl className="flex items-center justify-between gap-2 sm:gap-4">
              <dt
                className="text-sm sm:text-base font-normal"
                style={{ color: "#64748b" }}
              >
                <span className="hidden sm:inline">Coupon ({coupon.code})</span>
                <span className="sm:hidden">Coupon</span>
              </dt>
              <dd
                className="text-sm sm:text-base font-semibold"
                style={{ color: "#2ecc71" }}
              >
                -{coupon.discountPercentage}%
              </dd>
            </dl>
          )}

          <dl
            className="flex items-center justify-between gap-2 sm:gap-4 pt-3"
            style={{ borderTop: "1px solid rgba(0, 128, 128, 0.1)" }}
          >
            <dt
              className="text-base sm:text-lg font-bold"
              style={{ color: "#003366" }}
            >
              Total
            </dt>
            <dd
              className="text-base sm:text-lg font-bold"
              style={{ color: "#008080" }}
            >
              {formattedTotal}
            </dd>
          </dl>
        </div>

        <motion.button
          className="flex w-full items-center justify-center rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white min-h-[48px] transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
            boxShadow: "0 4px 14px rgba(0, 128, 128, 0.25)",
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleProceed}
        >
          {isLocalMode ? "Proceed with Sale" : "Proceed to Checkout"}
        </motion.button>

        <div className="flex items-center justify-center gap-2 pt-2">
          <span
            className="text-xs sm:text-sm font-normal"
            style={{ color: "#94a3b8" }}
          >
            or
          </span>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium underline hover:no-underline transition-colors duration-200"
            style={{ color: "#008080" }}
          >
            Continue Shopping
            <MoveRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderSummary;


