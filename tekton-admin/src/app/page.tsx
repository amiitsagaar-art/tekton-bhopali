"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Use actual schema field names from appointments table
  const total = bookings.length;
  const completed = bookings.filter(b => b.status?.toLowerCase() === "completed").length;
  const pending = bookings.filter(b => b.status?.toLowerCase() === "pending").length;
  const confirmed = bookings.filter(b => b.status?.toLowerCase() === "confirmed").length;
  const earnings = bookings
    .filter(b => b.paymentStatus?.toLowerCase() === "paid")
    .reduce((acc, b) => acc + (b.totalAmount || b.visitCharge || 0), 0);

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-black text-white p-5 hidden md:block">
        <h1 className="text-2xl font-bold mb-6">Tekton Admin</h1>
        <ul className="space-y-4 text-sm">
          <li className="font-bold text-yellow-400">Dashboard</li>
          <li className="text-gray-400 hover:text-white cursor-pointer">Bookings</li>
          <li className="text-gray-400 hover:text-white cursor-pointer">Partners</li>
        </ul>
      </div>

      {/* Main */}
      <div className="flex-1 p-5">

        {/* Top Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card title="Total Bookings" value={total} color="text-gray-800" />
          <Card title="Completed" value={completed} color="text-green-600" />
          <Card title="Confirmed" value={confirmed} color="text-blue-600" />
          <Card title="Pending" value={pending} color="text-yellow-600" />
          <Card title="Earnings ₹" value={earnings} color="text-emerald-600" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">All Bookings</h2>
            <button
              onClick={fetchData}
              className="text-xs px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No bookings found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">Customer</th>
                  <th className="py-2 px-3">Phone</th>
                  <th className="py-2 px-3">Service</th>
                  <th className="py-2 px-3">Location</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Payment</th>
                  <th className="py-2 px-3">Amount</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b hover:bg-gray-50 text-left">
                    <td className="py-2 px-3 font-mono text-xs text-gray-500">TEK-{b.id}</td>
                    <td className="py-2 px-3 font-medium">{b.customerName}</td>
                    <td className="py-2 px-3 text-gray-500">{b.customerPhone}</td>
                    <td className="py-2 px-3">{b.category}</td>
                    <td className="py-2 px-3">{b.location}</td>
                    <td className="py-2 px-3 text-xs">{b.appointmentDate} {b.appointmentTime}</td>
                    <td className={"py-2 px-3 font-semibold " + statusColor(b.status)}>
                      {b.status}
                    </td>
                    <td className={"py-2 px-3 text-xs font-semibold " + paymentColor(b.paymentStatus)}>
                      {b.paymentStatus}
                    </td>
                    <td className="py-2 px-3">₹{b.totalAmount || b.visitCharge || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}

// Card Component
function Card({ title, value, color }: { title: string; value: any; color?: string }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow text-center">
      <h2 className="text-gray-500 text-xs font-medium uppercase mb-1">{title}</h2>
      <p className={"text-2xl font-bold " + (color || "text-gray-800")}>{value}</p>
    </div>
  );
}

// Status Color
function statusColor(status: string) {
  const s = status?.toLowerCase() || "";
  if (s === "completed") return "text-green-600";
  if (s === "confirmed" || s === "assigned") return "text-blue-600";
  if (s === "cancelled") return "text-red-600";
  return "text-yellow-600";
}

// Payment Status Color
function paymentColor(paymentStatus: string) {
  const s = paymentStatus?.toLowerCase() || "";
  if (s === "paid") return "text-green-600";
  if (s === "refunded") return "text-blue-600";
  if (s === "failed") return "text-red-600";
  return "text-yellow-600";
}
