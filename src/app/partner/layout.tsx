import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  manifest: "/partner-manifest.json",
  title: "Partner Dashboard - Tekton Bhopal",
  description: "View your bookings, earnings, and manage your duty status in Bhopal."
};

export default function PartnerLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
