import { NextResponse } from "next/server";
import { db } from "@/db";
import { workers, servicePricing, coupons } from "@/db/schema";
import { eq } from "drizzle-orm";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  try {
    const { workerId, category, couponCode } = await request.json();

    let basePrice = 149; // Default fallback price

    // 1. Resolve pricing from Worker or Service Category
    if (workerId) {
      const parsedWorkerId = parseInt(workerId, 10);
      if (!isNaN(parsedWorkerId)) {
        const workerRecord = await db
          .select()
          .from(workers)
          .where(eq(workers.id, parsedWorkerId))
          .limit(1);
        if (workerRecord.length > 0) {
          basePrice = workerRecord[0].basePrice;
        }
      }
    } else if (category) {
      const pricingRecord = await db
        .select()
        .from(servicePricing)
        .where(eq(servicePricing.category, category))
        .limit(1);
      if (pricingRecord.length > 0) {
        basePrice = pricingRecord[0].basePrice;
      }
    }

    // 2. Resolve coupon discount if couponCode is provided
    let discount = 0;
    if (couponCode) {
      const couponRecord = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, couponCode))
        .limit(1);
      
      if (couponRecord.length > 0 && couponRecord[0].isActive) {
        const c = couponRecord[0];
        if (c.isPercentage) {
          discount = Math.floor((basePrice * c.discountValue) / 100);
        } else {
          discount = c.discountValue;
        }
      }
    }

    const finalAmount = Math.max(0, basePrice - discount);
    const amountInPaise = finalAmount * 100; // Razorpay expects amount in paise

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // 3. Fallback mock mode if credentials are not present
    if (!keyId || !keySecret) {
      const mockOrderId = `order_mock_${Math.random().toString(36).substring(2, 12)}`;
      console.log(`[Razorpay Order DEBUG] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Mock Order created for ${category || "service"} (workerId: ${workerId || "none"}): ID: ${mockOrderId}, Amount: ₹${finalAmount}`);
      return NextResponse.json({
        success: true,
        mock: true,
        orderId: mockOrderId,
        amount: amountInPaise,
        currency: "INR",
        keyId: "rzp_test_mockkeyid",
        message: "Razorpay credentials not configured. Created mock order."
      });
    }

    // 4. Initialize Razorpay and create order
    try {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
      });

      return NextResponse.json({
        success: true,
        mock: false,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: keyId,
      });
    } catch (razorpayErr: any) {
      console.warn("⚠️ Razorpay order creation failed. Falling back to mock mode:", razorpayErr);
      const mockOrderId = `order_mock_fail_${Math.random().toString(36).substring(2, 12)}`;
      return NextResponse.json({
        success: true,
        mock: true,
        orderId: mockOrderId,
        amount: amountInPaise,
        currency: "INR",
        keyId: "rzp_test_mockkeyid",
        message: `Razorpay order creation failed (${razorpayErr.message}). Falling back to mock mode.`
      });
    }

  } catch (error: any) {
    console.error("🔥 Razorpay Order Setup Failure Log:", error);
    return NextResponse.json({ error: "Failed to initialize order: " + error.message }, { status: 500 });
  }
}
