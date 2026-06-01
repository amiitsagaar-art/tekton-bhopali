import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    {
      name: "Amit",
      service: "Plumber",
      location: "Kolar",
      status: "COMPLETED",
      amount: 200,
      payment: "PAID"
    },
    {
      name: "Rahul",
      service: "Electrician",
      location: "MP Nagar",
      status: "NEW",
      amount: 150,
      payment: "PENDING"
    },
    {
      name: "Suresh",
      service: "Painter",
      location: "Bairagarh",
      status: "ASSIGNED",
      amount: 300,
      payment: "PENDING"
    }
  ];

  return NextResponse.json(data);
}
