import { pgTable, serial, varchar, text, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";

export const workers = pgTable("workers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // Plumber, Carpenter, Electrician, Painter, Civil Architect, Cleaning, etc.
  experienceYears: integer("experience_years").notNull().default(2),
  basePrice: integer("base_price").notNull().default(49),
  locations: text("locations").notNull(), // comma separated cities/areas
  rating: numeric("rating", { precision: 2, scale: 1 }).notNull().default("4.8"),
  reviewsCount: integer("reviews_count").notNull().default(12),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  isVerified: boolean("is_verified").notNull().default(true),
  status: varchar("status", { length: 50 }).notNull().default("Approved"), // Pending, Approved, Rejected
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
  location: varchar("location", { length: 100 }).notNull(), // Area/City
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description").notNull(), // User's enquiry details: kya kam karana h
  appointmentDate: varchar("appointment_date", { length: 50 }).notNull(),
  appointmentTime: varchar("appointment_time", { length: 50 }).notNull(),
  assignedWorkerId: integer("assigned_worker_id").references(() => workers.id),
  status: varchar("status", { length: 50 }).notNull().default("Pending"), // Pending, Confirmed, Completed, Cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  email: varchar("email", { length: 255 }),
  location: varchar("location", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

