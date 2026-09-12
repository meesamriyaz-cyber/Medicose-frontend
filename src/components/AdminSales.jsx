import { useState, useEffect, useCallback } from "react";
import api from "../lib/axios";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Banknote,
  Percent,
  Download,
  Printer,
  Filter,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import OrderTracking from "./OrderTracking";

const PERIODS = [
  { id: "day", label: "Day" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

const PAYMENT_FILTERS = [
  { id: "all", label: "All" },
  { id: "online", label: "Online" },
  { id: "direct", label: "Cash/Direct" },
];

export default function AdminSales() {
  const [period, setPeriod] = useState("day");
  const [payment, setPayment] = useState("all");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customRange, setCustomRange] = useState(false);

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Helper to format INR
  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n || 0);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { period, payment };

      if (customRange && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      } else {
        switch (period) {
          case "day":
            params.date = date;
            break;
          case "month":
            params.month = month;
            params.year = year;
            break;
          case "year":
            params.year = year;
            break;
        }
      }

      const { data } = await api.get("/sales/report", { params });
      if (data.success) {
        setReport(data);
      } else {
        setError(data.message || "Failed to fetch report");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [period, payment, date, month, year, startDate, endDate, customRange]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePrint = () => {
    window.print();
  };

  const getPeriodLabel = () => {
    if (customRange) {
      return `${new Date(startDate).toLocaleDateString()} - ${new Date(
        endDate
      ).toLocaleDateString()}`;
    }
    switch (period) {
      case "day":
        return new Date(date).toLocaleDateString("en-IN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      case "month":
        return new Date(year, month - 1).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
        });
      case "year":
        return year;
      default:
        return "";
    }
  };

  return (
    <div className="w-full">
      {/* Print header - hidden on screen */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--primary)" }}>
          Haleem Medicose - Sales Report
        </h1>
        <p className="text-gray-600">{getPeriodLabel()}</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-lg border border-teal-100 p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5" style={{ color: "var(--primary)" }} />
          <span className="font-bold text-lg" style={{ color: "var(--accent)" }}>
            Filters
          </span>
        </div>

        {/* Period selector */}
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setPeriod(p.id);
                setCustomRange(false);
              }}
              className={`px-4 py-2 rounded-lg font-bold border-2 border-teal-200 transition-all ${
                period === p.id && !customRange
                  ? "text-white shadow-md"
                  : "bg-white hover:bg-teal-50"
              }`}
              style={
                period === p.id && !customRange
                  ? {
                      background:
                        "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                    }
                  : { color: "var(--primary)" }
              }
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => setCustomRange(!customRange)}
            className={`px-4 py-2 rounded-lg font-bold border-2 transition-all ${
              customRange
                ? "text-white shadow-md"
                : "bg-white hover:bg-teal-50"
            }`}
            style={{
              borderColor: "var(--primary)",
              ...(customRange
                ? {
                    background:
                      "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                    borderColor: "transparent",
                  }
                : { color: "var(--primary)" }),
            }}
          >
            Custom Range
          </button>
        </div>

        {/* Date inputs */}
        <div className="flex flex-wrap gap-4 items-end mt-4">
          {!customRange && period === "day" && (
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "var(--accent)" }}>
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-2 border-teal-200 rounded-lg px-3 py-2 font-medium focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>
          )}

          {!customRange && period === "month" && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: "var(--accent)" }}>
                  Month
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="border-2 border-teal-200 rounded-lg px-3 py-2 font-medium focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString("default", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: "var(--accent)" }}>
                  Year
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min="2020"
                  max="2099"
                  className="border-2 border-teal-200 rounded-lg px-3 py-2 font-medium w-24 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>
            </>
          )}

          {!customRange && period === "year" && (
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "var(--accent)" }}>
                Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min="2020"
                max="2099"
                className="border-2 border-teal-200 rounded-lg px-3 py-2 font-medium w-28 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>
          )}

          {customRange && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: "var(--accent)" }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-2 border-teal-200 rounded-lg px-3 py-2 font-medium focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: "var(--accent)" }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border-2 border-teal-200 rounded-lg px-3 py-2 font-medium focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>
            </>
          )}

          {/* Payment filter */}
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "var(--accent)" }}>
              Payment
            </label>
            <div className="flex gap-1">
              {PAYMENT_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setPayment(f.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                    payment === f.id
                      ? "text-white shadow-sm"
                      : "bg-white hover:bg-teal-50"
                  }`}
                  style={{
                    borderColor: "var(--primary)",
                    ...(payment === f.id
                      ? {
                          background:
                            "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                          borderColor: "transparent",
                        }
                      : { color: "var(--primary)" }),
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={fetchReport}
            disabled={loading}
            className="px-5 py-2 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            style={{
              background:
                "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
            }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading..." : "Load"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Report content */}
      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <SummaryCard
              icon={ShoppingBag}
              label="Total Orders"
              value={report.summary.totalOrders}
            />
            <SummaryCard
              icon={DollarSign}
              label="Total Revenue"
              value={fmt(report.summary.totalRevenue)}
            />
            <SummaryCard
              icon={Percent}
              label="Discount Given"
              value={fmt(report.summary.totalDiscount)}
            />
            <SummaryCard
              icon={TrendingUp}
              label="Avg Order Value"
              value={
                report.summary.totalOrders > 0
                  ? fmt(
                      report.summary.totalRevenue /
                        report.summary.totalOrders
                    )
                  : fmt(0)
              }
            />
          </div>

          {/* Online vs Direct */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <SummaryCard
              icon={CreditCard}
              label={`Online Orders (${report.summary.onlineOrders})`}
              value={fmt(report.summary.onlineRevenue)}
            />
            <SummaryCard
              icon={Banknote}
              label={`Cash/Direct Orders (${report.summary.directOrders})`}
              value={fmt(report.summary.directRevenue)}
            />
          </div>

          {/* Aggregated table */}
          {report.aggregates.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-teal-100 overflow-hidden mb-6">
              <div
                className="px-4 py-3 font-bold border-b border-teal-100 flex items-center gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0, 128, 128, 0.08) 0%, rgba(0, 51, 102, 0.08) 100%)",
                  color: "var(--accent)",
                }}
              >
                <Calendar className="w-5 h-5" style={{ color: "var(--primary)" }} />
                {period === "day"
                  ? "Hourly Breakdown"
                  : period === "month"
                  ? "Daily Breakdown"
                  : "Monthly Breakdown"}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(0, 128, 128, 0.05) 0%, rgba(0, 51, 102, 0.05) 100%)",
                      }}
                    >
                      <th className="text-left px-4 py-3 font-bold" style={{ color: "var(--accent)" }}>
                        {period === "day"
                          ? "Hour"
                          : period === "month"
                          ? "Date"
                          : "Period"}
                      </th>
                      <th className="text-right px-4 py-3 font-bold" style={{ color: "var(--accent)" }}>Orders</th>
                      <th className="text-right px-4 py-3 font-bold" style={{ color: "var(--accent)" }}>Revenue</th>
                      <th className="text-right px-4 py-3 font-bold" style={{ color: "var(--accent)" }}>Discount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.aggregates.map((row, idx) => (
                      <tr
                        key={row._id}
                        className={`border-b border-teal-50 hover:bg-teal-50/50 transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-teal-50/30"
                        }`}
                      >
                        <td className="px-4 py-3 font-medium">{row._id}</td>
                        <td className="px-4 py-3 text-right">{row.orderCount}</td>
                        <td className="px-4 py-3 text-right font-semibold" style={{ color: "var(--primary)" }}>
                          {fmt(row.totalRevenue)}
                        </td>
                        <td className="px-4 py-3 text-right" style={{ color: "#d97706" }}>
                          {fmt(row.discountAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Detailed Orders */}
          {report.orders.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-teal-100 overflow-hidden">
              <div
                className="px-4 py-3 font-bold border-b border-teal-100 flex items-center justify-between"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0, 128, 128, 0.08) 0%, rgba(0, 51, 102, 0.08) 100%)",
                  color: "var(--accent)",
                }}
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" style={{ color: "var(--primary)" }} />
                  Order Details ({report.orders.length})
                </span>
                <div className="flex gap-2 print:hidden">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border-2 border-teal-200 rounded-lg font-bold text-sm hover:bg-teal-50 transition-all"
                    style={{ color: "var(--primary)" }}
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(0, 128, 128, 0.05) 0%, rgba(0, 51, 102, 0.05) 100%)",
                      }}
                    >
                      <th className="text-left px-4 py-3 font-bold" style={{ color: "var(--accent)" }}>Order ID</th>
                      <th className="text-left px-4 py-3 font-bold" style={{ color: "var(--accent)" }}>Customer</th>
                      <th className="text-left px-4 py-3 font-bold" style={{ color: "var(--accent)" }}>Salesperson</th>
                      <th className="text-left px-4 py-3 font-bold" style={{ color: "var(--accent)" }}>Items</th>
                      <th className="text-right px-4 py-3 font-bold" style={{ color: "var(--accent)" }}>Amount</th>
                      <th className="text-center px-4 py-3 font-bold" style={{ color: "var(--accent)" }}>Payment</th>
                      <th className="text-center px-4 py-3 font-bold" style={{ color: "var(--accent)" }}>Status</th>
                      <th className="text-center px-4 py-3 font-bold" style={{ color: "var(--accent)" }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.orders.map((order, idx) => (
                      <tr
                        key={order._id}
                        className={`border-b border-teal-50 hover:bg-teal-50/50 transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-teal-50/30"
                        }`}
                      >
                        <td className="px-4 py-3 font-mono text-xs">
                          #{order._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3">
                          {order.customerName || order.user?.fullName || "N/A"}
                          {order.customerPhone && (
                            <span className="block text-xs text-gray-500">{order.customerPhone}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {order.user?.fullName || "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          {order.orderItems
                            ?.slice(0, 3)
                            .map(
                              (item) =>
                                item.product?.name || `Product x${item.quantity}`
                            )
                            .join(", ")}
                          {(order.orderItems?.length || 0) > 3 &&
                            ` +${order.orderItems.length - 3} more`}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold" style={{ color: "var(--primary)" }}>
                          {fmt(order.totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold cursor-pointer ${
                              order.razorpayPaymentId
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {order.razorpayPaymentId ? "Online" : "Cash"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-xs font-semibold px-2 py-1 rounded bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
                          >
                            {order.status || "pending"}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-500 text-xs">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {report.orders.length === 0 && (
            <div className="text-center py-12 text-gray-400 font-medium text-lg bg-white rounded-2xl shadow-lg border border-teal-100">
              No orders found for this period.
            </div>
          )}
        </>
      )}

      {/* Loading state */}
      {loading && !report && (
        <div className="flex items-center justify-center py-16">
          <RefreshCw
            className="w-10 h-10 animate-spin"
            style={{ color: "var(--primary)" }}
          />
        </div>
      )}

      {/* Order Tracking Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: "var(--primary)" }}>
                Order Tracking - #{selectedOrder._id.slice(-8).toUpperCase()}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>
            <OrderTracking
              order={selectedOrder}
              onStatusUpdate={async (newStatus) => {
                try {
                  await axios.put(`/api/orders/${selectedOrder._id}/status`, { status: newStatus });
                  toast.success(`Order status updated to ${newStatus}`);
                  setSelectedOrder({ ...selectedOrder, status: newStatus });
                  fetchReport();
                } catch (err) {
                  toast.error("Failed to update order status");
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:block, .print\\:block * { visibility: visible; }
          .print\\:block { position: absolute; left: 0; top: 0; width: 100%; }
          button { display: none !important; }
          input, select { display: none !important; }
          .print\\:hidden { display: none !important; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ccc; padding: 8px; }
          .rounded-2xl { border-radius: 0 !important; }
          .shadow-lg { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-teal-100 p-4 transition-all hover:shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="p-2 rounded-lg"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 128, 128, 0.1) 0%, rgba(0, 51, 102, 0.1) 100%)",
          }}
        >
          <Icon className="w-4 h-4" style={{ color: "var(--primary)" }} />
        </div>
        <span className="text-sm font-semibold text-gray-600">{label}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
        {value}
      </div>
    </div>
  );
}
