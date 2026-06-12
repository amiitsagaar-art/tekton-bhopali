CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_phone" varchar(20) NOT NULL,
	"customer_address" text NOT NULL,
	"location" varchar(100) NOT NULL,
	"category" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"appointment_date" varchar(50) NOT NULL,
	"appointment_time" varchar(50) NOT NULL,
	"assigned_worker_id" integer,
	"status" varchar(50) DEFAULT 'Pending' NOT NULL,
	"payment_status" varchar(50) DEFAULT 'Pending' NOT NULL,
	"cancellation_reason" text,
	"transaction_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"discount_value" integer NOT NULL,
	"is_percentage" boolean DEFAULT false NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "email_otps" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"code" varchar(10) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_otps_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"appointment_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"status" varchar(50) DEFAULT 'Success' NOT NULL,
	"transaction_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "phone_otps" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone" varchar(20) NOT NULL,
	"code" varchar(10) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "phone_otps_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "recent_works" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"location" varchar(100) NOT NULL,
	"image_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"vendor_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_areas" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_areas_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "service_pricing" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(100) NOT NULL,
	"base_price" integer DEFAULT 149 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_pricing_category_unique" UNIQUE("category")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"email" varchar(255) NOT NULL,
	"location" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"category" varchar(100) NOT NULL,
	"experience_years" integer DEFAULT 2 NOT NULL,
	"base_price" integer DEFAULT 49 NOT NULL,
	"locations" text NOT NULL,
	"rating" numeric(2, 1) DEFAULT '4.8' NOT NULL,
	"reviews_count" integer DEFAULT 12 NOT NULL,
	"avatar_url" text,
	"bio" text,
	"is_verified" boolean DEFAULT true NOT NULL,
	"status" varchar(50) DEFAULT 'Approved' NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL,
	"aadhaar_url" text,
	"pan_url" text,
	"passbook_url" text,
	"selfie_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_assigned_worker_id_workers_id_fk" FOREIGN KEY ("assigned_worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_vendor_id_workers_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;