import { NextResponse } from "next/server";

// In-memory database for rapid prototyping
let bookings = [
  { id: "BKG-001", date: new Date().toISOString(), customer: "Rahul Sharma", phone: "9876543210", service: "Plumber", location: "MP Nagar", status: "NEW", amount: 0 },
  { id: "BKG-002", date: new Date(Date.now() - 86400000).toISOString(), customer: "Priya Singh", phone: "9876543211", service: "Electrician", location: "Arera Colony", status: "ASSIGNED", amount: 450 },
  { id: "BKG-003", date: new Date(Date.now() - 172800000).toISOString(), customer: "Amit Patel", phone: "9876543212", service: "Painter", location: "Kolar", status: "COMPLETED", amount: 2500 }
];

export async function GET() {
  // Return bookings sorted by newest first
  const sorted = [...bookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return NextResponse.json(sorted);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newBooking = {
      id: `BKG-${String(bookings.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString(),
      customer: data.customer || "Unknown",
      phone: data.phone || "",
      service: data.service || "General",
      location: data.location || "Bhopal",
      status: "NEW",
      amount: data.amount || 0
    };
    
    bookings.push(newBooking);
    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid booking data" }, { status: 400 });
  }
}

// Export the array so we can update it in the dynamic route
export function updateBookingStatus(id: string, newStatus: string) {
  const index = bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    bookings[index].status = newStatus;
    return bookings[index];
  }
  return null;
}
