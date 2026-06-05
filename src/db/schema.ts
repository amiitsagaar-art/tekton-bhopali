import { pgTable, serial, varchar, text, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";

export const workers = pgTable("workers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  experienceYears: integer("experience_years").notNull().default(2),
  basePrice: integer("base_price").notNull().default(49),
  locations: text("locations").notNull(),
  rating: numeric("rating", { precision: 2, scale: 1 }).notNull().default("4.8"),
  reviewsCount: integer("reviews_count").notNull().default(12),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  isVerified: boolean("is_verified").notNull().default(true),
  status: varchar("status", { length: 50 }).notNull().default("Approved"),
  aadhaarUrl: text("aadhaar_url"),
  panUrl: text("pan_url"),
  passbookUrl: text("passbook_url"),
  selfieUrl: text("selfie_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
  customerAddress: text("customer_address").notNull(),
  location: varchar("location", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description").notNull(),
  appointmentDate: varchar("appointment_date", { length: 50 }).notNull(),
  appointmentTime: varchar("appointment_time", { length: 50 }).notNull(),
  assignedWorkerId: integer("assigned_worker_id").references(() => workers.id),
  status: varchar("status", { length: 50 }).notNull().default("Pending"),
  paymentStatus: varchar("payment_status", { length: 50 }).notNull().default("Pending"), // Added for refund logic
  cancellationReason: text("cancellation_reason"), // Added for cancellation tracking
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  location: varchar("location", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// NEW TABLE: Service Areas (Geofencing)
export const serviceAreas = pgTable("service_areas", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(), // e.g. MP Nagar, Kolar
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// NEW TABLE: Payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").references(() => appointments.id).notNull(),
  amount: integer("amount").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("Success"), // Success, Refunded, Failed
  transactionId: varchar("transaction_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// NEW TABLE: Verified Reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").references(() => appointments.id).notNull().unique(),
  workerId: integer("worker_id").references(() => workers.id).notNull(),
  customerId: integer("customer_id").references(() => users.id),
  rating: integer("rating").notNull(), // 1 to 5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// NEW TABLE: Recent Works
export const recentWorks = pgTable("recent_works", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  location: varchar("location", { length: 100 }).notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// TABLE: Email OTPs (for authentication)
export const emailOtps = pgTable("email_otps", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  code: varchar("code", { length: 10 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// TABLE: Service Pricing (Admin-Controlled per category)
export const servicePricing = pgTable("service_pricing", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 100 }).notNull().unique(),
  basePrice: integer("base_price").notNull().default(149),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// TABLE: Admin-Managed Coupons
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountValue: integer("discount_value").notNull(),
  isPercentage: boolean("is_percentage").notNull().default(false),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
