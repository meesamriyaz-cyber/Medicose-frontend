import { ArrowRight, CheckCircle, HandHeart, FileDown } from "lucide-react";
import { Link } from "react-router-dom";
import Confetti from "react-confetti";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  downloadAuthenticatedFile,
  generateInvoiceFilename,
} from "../utils/downloadUtils";
import { API_URL } from "../lib/axios";
import { useCartStore } from "../hooks/useCartStore";
import { useProductStore } from "../hooks/useProductStore";

const PurchaseSuccessPage = () => {
  const params = new URLSearchParams(window.location.search);
  const paymentId = params.get("payment_id");
  const orderId = params.get("order_id");
  const [downloading, setDownloading] = useState(false);
  const { triggerStockRefresh } = useCartStore();
  const { fetchAllProducts } = useProductStore();

  // Trigger stock refresh when success page loads
  useEffect(() => {
    fetchAllProducts();
    triggerStockRefresh();
  }, [triggerStockRefresh, fetchAllProducts]);

  const handleInvoiceDownload = async () => {
    if (!orderId) return;

    setDownloading(true);
    try {

      const filename = generateInvoiceFilename(orderId);

      console.log("Attempting download for order:", orderId);
      await downloadAuthenticatedFile(
        `${API_URL}/orders/${orderId}/invoice`,
        filename
      );
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);

      // Provide specific error messages
      if (error.message.includes("Authentication failed")) {
        toast.error("Session expired. Please log in again.");
      } else if (error.message.includes("Access denied")) {
        toast.error("You don't have permission to download this invoice.");
      } else if (error.message.includes("not found")) {
        toast.error("Invoice not found.");
      } else {
        toast.error(error.message || "Failed to download invoice");
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background: "linear-gradient(180deg, #f8fffe 0%, #e8f5f3 100%)",
      }}
    >
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.1}
        style={{ zIndex: 99 }}
        numberOfPieces={700}
        recycle={false}
        colors={["#008080", "#003366", "#2ecc71", "#27ae60", "#00a8a8"]}
      />

      <div
        className="max-w-md w-full rounded-2xl shadow-2xl overflow-hidden relative z-10"
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #f8fffe 100%)",
          border: "1px solid rgba(0, 128, 128, 0.15)",
        }}
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(46, 204, 113, 0.15) 0%, rgba(39, 174, 96, 0.15) 100%)",
              }}
            >
              <CheckCircle className="w-12 h-12" style={{ color: "#2ecc71" }} />
            </div>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-center mb-2"
            style={{
              background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Purchase Successful!
          </h1>

          <p className="text-center mb-2" style={{ color: "#475569" }}>
            Thank you for your order. We're processing it now.
          </p>
          <p className="text-center text-sm mb-6" style={{ color: "#008080" }}>
            Check your email for order details and updates.
          </p>

          <div
            className="rounded-xl p-4 mb-6"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 128, 128, 0.05) 0%, rgba(0, 51, 102, 0.05) 100%)",
              border: "1px solid rgba(0, 128, 128, 0.1)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: "#64748b" }}>
                Payment ID
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: "#008080" }}
              >
                {paymentId || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "#64748b" }}>
                Estimated delivery
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: "#008080" }}
              >
                3-5 business days
              </span>
            </div>
          </div>

          {paymentId && (
            <div className="text-center mb-6">
              <button
                onClick={handleInvoiceDownload}
                disabled={downloading}
                className="inline-flex items-center justify-center gap-2 font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50"
                style={{
                  background: "transparent",
                  border: "2px solid #008080",
                  color: "#008080",
                }}
              >
                <FileDown size={18} />
                {downloading ? "Downloading..." : "Download Invoice (PDF)"}
              </button>
            </div>
          )}

          <div className="space-y-3">
            <button
              className="w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center text-white hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)",
                boxShadow: "0 4px 14px rgba(46, 204, 113, 0.25)",
              }}
            >
              <HandHeart className="mr-2" size={18} />
              Thanks for trusting us!
            </button>
            <Link
              to={"/"}
              className="w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center text-white hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
                boxShadow: "0 4px 14px rgba(0, 128, 128, 0.25)",
              }}
            >
              Continue Shopping
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;
