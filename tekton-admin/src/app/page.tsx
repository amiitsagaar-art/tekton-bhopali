"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/bookings");
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const total = bookings.length;
  const completed = bookings.filter(b => b.status === "COMPLETED").length;
  const pending = bookings.filter(b => b.status === "NEW").length;
  const earnings = bookings
    .filter(b => b.payment === "PAID")
    .reduce((acc, b) => acc + b.amount, 0);

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-black text-white p-5 hidden md:block">
        <h1 className="text-2xl font-bold mb-6">Tekton Admin</h1>
        <ul className="space-y-4">
          <li>Dashboard</li>
          <li>Bookings</li>
          <li>Vendors</li>
        </ul>
      </div>

      {/* Main */}
      <div className="flex-1 p-5">

        {/* Top Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

          <Card title="Total Bookings" value={total} />
          <Card title="Completed" value={completed} />
          <Card title="Pending" value={pending} />
          <Card title="Earnings ₹" value={earnings} />

        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">All Bookings</h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th>Name</th>
                <th>Service</th>
                <th>Location</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((b, i) => (
                <tr key={i} className="border-b text-center">
                  <td>{b.name}</td>
                  <td>{b.service}</td>
                  <td>{b.location}</td>
                  <td className={statusColor(b.status)}>
                    {b.status}
                  </td>
                  <td>₹{b.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

// Card Component
function Card({ title, value }: { title: string, value: any }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow text-center">
      <h2 className="text-gray-500">{title}</h2>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

// Status Color
function statusColor(status: string) {
  if (status === "COMPLETED") return "text-green-600";
  if (status === "ASSIGNED") return "text-blue-600";
  return "text-yellow-600";
}
