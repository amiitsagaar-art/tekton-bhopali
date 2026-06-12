import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  manifest: "/partner-manifest.json",
  title: "Join as a Partner - Tekton Bhopal",
  description: "Register as a skilled technician and get high-paying bookings in Bhopal."
};

export default function PartnerJoinLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
