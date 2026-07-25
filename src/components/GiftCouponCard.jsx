import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useCartStore } from "../hooks/useCartStore";
import { Gift, Tag, X, Percent } from "lucide-react";
import { toast } from "react-hot-toast";
import { isLocalMode } from "../config/appMode";

const GiftCouponCard = () => {
  const [userInputCode, setUserInputCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [directPercent, setDirectPercent] = useState("10");

  const {
    coupon,
    isCouponApplied,
    applyCoupon,
    getMyCoupon,
    removeCoupon,
    isDirectDiscountApplied,
    directDiscountPercentage,
    toggleDirectDiscount,
    setDirectDiscount,
    clearDirectDiscount,
  } = useCartStore();

  useEffect(() => {
    getMyCoupon();
  }, [getMyCoupon]);

  useEffect(() => {
    if (coupon && coupon.code) {
      setUserInputCode(coupon.code);
    } else {
      setUserInputCode("");
    }
  }, [coupon]);

  const handleApplyCoupon = async () => {
    const trimmedCode = userInputCode.trim();
    if (!trimmedCode) {
      toast.error("Please enter a coupon code");
      return;
    }
    setIsApplying(true);
    try {
      await applyCoupon(trimmedCode);
      if (isDirectDiscountApplied) {
        clearDirectDiscount();
        toggleDirectDiscount(false);
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
    setUserInputCode("");
  };

  const handleDirectDiscountToggle = async (e) => {
    const checked = e.target.checked;
    if (checked) {
      const percent = parseFloat(directPercent);
      if (isNaN(percent) || percent <= 0 || percent > 100) {
        toast.error("Enter a valid discount percentage between 1 and 100");
        return;
      }
      if (isCouponApplied && coupon) {
        await removeCoupon();
        setUserInputCode("");
      }
      setDirectDiscount(percent);
      toggleDirectDiscount(true);
      toast.success(`${percent}% discount applied`);
    } else {
      clearDirectDiscount();
      toggleDirectDiscount(false);
    }
  };

  const handleDirectPercentChange = (value) => {
    setDirectPercent(value);
    if (isDirectDiscountApplied) {
      const percent = parseFloat(value);
      if (!isNaN(percent) && percent > 0 && percent <= 100) {
        setDirectDiscount(percent);
        useCartStore.getState().calculateTotals();
      }
    }
  };

  useEffect(() => {
    if (!isDirectDiscountApplied) {
      setDirectPercent("10");
    }
  }, [isDirectDiscountApplied]);

  return (
    <motion.div
      className="space-y-4 rounded-2xl p-5 sm:p-6"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f8fffe 100%)",
        border: "1px solid rgba(0, 128, 128, 0.15)",
        boxShadow: "0 8px 24px rgba(0, 128, 128, 0.08)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5" style={{ color: "#008080" }} />
          <label
            htmlFor="voucher"
            className="text-sm font-semibold"
            style={{ color: "#003366" }}
          >
            Do you have a voucher or gift card?
          </label>
        </div>

        <div className="relative">
          <input
            key={coupon?.code || "empty"}
            type="text"
            id="voucher"
            className="block w-full rounded-xl p-3 pl-10 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition-all"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 128, 128, 0.05) 0%, rgba(0, 51, 102, 0.05) 100%)",
              border: "1px solid rgba(0, 128, 128, 0.2)",
              color: "#334155",
            }}
            placeholder="Enter code here"
            value={userInputCode}
            onChange={(e) => setUserInputCode(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !isApplying) {
                handleApplyCoupon();
              }
            }}
            disabled={isApplying}
          />
          <Tag
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "#008080" }}
          />
        </div>

        <motion.button
          type="button"
          className="flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
            boxShadow: "0 4px 14px rgba(0, 128, 128, 0.25)",
          }}
          whileHover={{ scale: isApplying ? 1 : 1.02 }}
          whileTap={{ scale: isApplying ? 1 : 0.98 }}
          onClick={handleApplyCoupon}
          disabled={isApplying}
        >
          {isApplying ? "Applying..." : "Apply Code"}
        </motion.button>
      </div>

      {isLocalMode && (
        <div
          className="mt-4 p-4 rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 128, 128, 0.03) 0%, rgba(0, 51, 102, 0.03) 100%)",
            border: "1px solid rgba(0, 128, 128, 0.1)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-4 h-4" style={{ color: "#008080" }} />
            <label className="text-sm font-semibold" style={{ color: "#003366" }}>
              Direct discount at sale
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="directDiscount"
              checked={isDirectDiscountApplied}
              onChange={handleDirectDiscountToggle}
              className="h-4 w-4 rounded border-gray-300 text-[#008080] focus:ring-[#008080]"
            />
            <span className="text-sm" style={{ color: "#334155" }}>
              Apply discount
            </span>
          </div>
          {isDirectDiscountApplied && (
            <div className="mt-3">
              <input
                type="number"
                min="1"
                max="100"
                value={directPercent}
                onChange={(e) => handleDirectPercentChange(e.target.value)}
                className="w-full rounded-xl p-2.5 text-sm border-2 border-teal-100 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                placeholder="Discount %"
              />
              <p className="mt-1 text-xs" style={{ color: "#64748b" }}>
                Default is 10%. You can enter a higher value.
              </p>
            </div>
          )}
        </div>
      )}

      {isCouponApplied && coupon && (
        <div
          className="mt-4 p-4 rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 128, 128, 0.03) 0%, rgba(0, 51, 102, 0.03) 100%)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "#003366" }}>
                Applied Coupon
              </h3>
              <p className="mt-1 text-sm" style={{ color: "#008080" }}>
                {coupon.code} - {coupon.discountPercentage}% off
              </p>
            </div>
            <motion.button
              type="button"
              className="p-2 rounded-lg transition-all"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRemoveCoupon}
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}

      {coupon && !isCouponApplied && (
        <div
          className="mt-4 p-4 rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 128, 128, 0.05) 0%, rgba(0, 51, 102, 0.05) 100%)",
            border: "1px solid rgba(0, 128, 128, 0.1)",
          }}
        >
          <h3 className="text-sm font-semibold" style={{ color: "#003366" }}>
            Your Available Coupon:
          </h3>
          <p className="mt-1 text-sm" style={{ color: "#008080" }}>
            {coupon.code} - {coupon.discountPercentage}% off
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default GiftCouponCard;
