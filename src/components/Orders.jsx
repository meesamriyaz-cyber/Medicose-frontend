import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import { toast } from "react-hot-toast";
import {
  downloadAuthenticatedFile,
  generateInvoiceFilename,
} from "../utils/downloadUtils";
import { API_URL } from "../lib/axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleInvoiceDownload = async (orderId) => {
    setDownloading(orderId);
    try {
      const filename = generateInvoiceFilename(orderId);

      console.log("Attempting admin download for order:", orderId);
      await downloadAuthenticatedFile(
        `${API_URL}/orders/admin/${orderId}/invoice`,
        filename
      );

      if (isMobile) {
        toast.success("Invoice saved to Documents folder!");
      } else {
        toast.success("Invoice downloaded successfully!");
      }
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
      setDownloading(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, filter]);

  const fetchOrders = async () => {
    try {
      const res = await api.get(
        `/orders/allorders?page=${page}&status=${filter}`
      );
      if (res.data?.success) {
        setOrders(res.data.orders || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error("Error fetching admin orders:", err);
      toast.error("Failed to load orders");
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      if (res.data?.success) {
        toast.success("Status updated");
        fetchOrders(); // refresh
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Update failed");
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "processing":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const OrderModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div
            className="sticky top-0 bg-white px-6 py-4 border-b border-teal-100 flex justify-between items-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 128, 128, 0.08) 0%, rgba(0, 51, 102, 0.08) 100%)",
            }}
          >
            <h2
              className="text-lg font-bold"
              style={{
                background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Order Details
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm text-slate-500">Order ID</span>
                <span className="text-sm font-mono text-slate-700 text-right max-w-[200px] break-all">
                  {order.razorpayOrderId}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">User</span>
                <span className="text-sm text-slate-700">
                  {order.user?.fullName || "Guest"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Date</span>
                <span className="text-sm text-slate-700">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Status</span>
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-semibold ${getStatusStyle(
                    order.status
                  )}`}
                >
                  {order.status || "N/A"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Total</span>
                <span
                  className="text-lg font-bold"
                  style={{ color: "#008080" }}
                >
                  ₹{order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-teal-100 space-y-3">
              <button
                onClick={() => handleInvoiceDownload(order._id)}
                disabled={downloading === order._id}
                className="w-full py-3 rounded-xl font-medium text-sm transition-all hover:shadow-md disabled:opacity-50"
                style={{
                  background:
                    "linear-gradient(135deg, #008080 0%, #003366 100%)",
                  color: "white",
                }}
              >
                {downloading === order._id
                  ? "Downloading..."
                  : "Download Invoice"}
              </button>

              <div>
                <label className="text-sm text-slate-500 mb-2 block">
                  Update Status
                </label>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border-2 border-teal-100 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none"
                >
                  <option value="processing">Processing</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main
      className="p-4 sm:p-6 max-w-5xl mx-auto min-h-screen"
      style={{
        background: "linear-gradient(180deg, #f8fffe 0%, #f0f9f7 100%)",
      }}
    >
      <h1
        className="text-2xl sm:text-3xl font-bold mb-6"
        style={{
          background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        All Orders
      </h1>

      {/* Filter + Pagination Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium border-2 border-teal-100 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 128, 128, 0.05) 0%, rgba(0, 51, 102, 0.05) 100%)",
          }}
        >
          <option value="">All Status</option>
          <option value="processing">Processing</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-xl font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-md"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 128, 128, 0.1) 0%, rgba(0, 51, 102, 0.1) 100%)",
              color: "#008080",
            }}
          >
            ← Prev
          </button>
          <span
            className="text-sm font-medium px-3 py-2 rounded-lg bg-white shadow-sm"
            style={{ color: "#003366" }}
          >
            {page} / {pagination?.totalPages || 1}
          </span>
          <button
            disabled={page >= (pagination?.totalPages || 1)}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-xl font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-md"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 128, 128, 0.1) 0%, rgba(0, 51, 102, 0.1) 100%)",
              color: "#008080",
            }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Mobile View - Compact Cards */}
      {isMobile ? (
        <div className="space-y-3">
          {orders.length > 0 ? (
            orders.map((o) => (
              <div
                key={o._id}
                className="bg-white rounded-xl shadow-md border border-teal-100 p-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500">
                        {new Date(o.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm font-medium text-slate-700">
                        {o.user?.fullName || "Guest"}
                      </p>
                      <p
                        className="text-lg font-bold"
                        style={{ color: "#008080" }}
                      >
                        ₹{o.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full border text-xs font-semibold ${getStatusStyle(
                        o.status
                      )}`}
                    >
                      {o.status || "N/A"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all hover:shadow-md"
                      style={{
                        background:
                          "linear-gradient(135deg, #008080 0%, #003366 100%)",
                        color: "white",
                      }}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleInvoiceDownload(o._id)}
                      disabled={downloading === o._id}
                      className="px-4 py-2 rounded-lg font-medium text-sm transition-all hover:shadow-md disabled:opacity-50"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(0, 128, 128, 0.1) 0%, rgba(0, 51, 102, 0.1) 100%)",
                        color: "#008080",
                      }}
                    >
                      {downloading === o._id ? "..." : "Invoice"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400 italic text-sm bg-white rounded-xl shadow-md">
              No orders found.
            </div>
          )}
        </div>
      ) : (
        /* Desktop View - Full Table */
        <div
          className="overflow-x-auto rounded-2xl shadow-lg border border-teal-100"
          style={{ background: "white" }}
        >
          <table className="min-w-full">
            <thead
              style={{
                background:
                  "linear-gradient(135deg, rgba(0, 128, 128, 0.08) 0%, rgba(0, 51, 102, 0.08) 100%)",
              }}
            >
              <tr>
                <th
                  className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider"
                  style={{ color: "#003366" }}
                >
                  Order ID
                </th>
                <th
                  className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider"
                  style={{ color: "#003366" }}
                >
                  User
                </th>
                <th
                  className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider"
                  style={{ color: "#003366" }}
                >
                  Date
                </th>
                <th
                  className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider"
                  style={{ color: "#003366" }}
                >
                  Status
                </th>
                <th
                  className="px-4 sm:px-6 py-4 text-right text-xs sm:text-sm font-semibold uppercase tracking-wider"
                  style={{ color: "#003366" }}
                >
                  Total
                </th>
                <th
                  className="px-4 sm:px-6 py-4 text-center text-xs sm:text-sm font-semibold uppercase tracking-wider"
                  style={{ color: "#003366" }}
                >
                  <div className="flex flex-col items-center">
                    <span>Invoice</span>
                    <span className="text-xs font-normal text-slate-400">
                      Downloads on all devices
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50">
              {orders.length > 0 ? (
                orders.map((o, idx) => (
                  <tr
                    key={o._id}
                    className={`transition-colors hover:bg-teal-50/50 ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    }`}
                  >
                    <td
                      className="px-4 sm:px-6 py-4 font-mono text-xs sm:text-sm"
                      style={{ color: "#334155" }}
                    >
                      <span className="truncate block max-w-[100px] sm:max-w-none">
                        {o.razorpayOrderId}
                      </span>
                    </td>
                    <td
                      className="px-4 sm:px-6 py-4 text-sm"
                      style={{ color: "#475569" }}
                    >
                      {o.user?.fullName || "Guest"}
                    </td>
                    <td
                      className="px-4 sm:px-6 py-4 text-sm"
                      style={{ color: "#475569" }}
                    >
                      {new Date(o.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                        className={`border rounded px-2 py-1 text-xs font-medium ${getStatusStyle(
                          o.status
                        )}`}
                      >
                        <option value="processing">Processing</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td
                      className="px-4 sm:px-6 py-4 text-right font-bold text-base"
                      style={{ color: "#008080" }}
                    >
                      ₹{o.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <button
                        onClick={() => handleInvoiceDownload(o._id)}
                        disabled={downloading === o._id}
                        className="inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all hover:shadow-md disabled:opacity-50"
                        style={{
                          background:
                            "linear-gradient(135deg, #008080 0%, #003366 100%)",
                          color: "white",
                        }}
                      >
                        {downloading === o._id ? "Downloading..." : "Download"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-12 text-slate-400 italic text-sm"
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </main>
  );
}
