import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ClientProviders } from "../components/ClientProviders";
export const viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "TEKTON Bhopal | Instant Home Services in 10 Minutes",
  description: "Book verified Plumbers, Carpenters, Electricians, Painters, Civil Architects & Cleaning Services instantly anywhere in Bhopal, MP. Services start at ₹49. Quick response like Blinkit.",
  keywords: [
    "Tekton Bhopal", 
    "home services Bhopal", 
    "plumber in Bhopal", 
    "electrician near me MP Nagar", 
    "carpenter in Arera Colony", 
    "deep cleaning services Bhopal", 
    "instant repairs MP", 
    "washing machine repair Kolar"
  ],
  authors: [{ name: "Tekton Technologies MP" }],
  openGraph: {
    title: "TEKTON Bhopal - Fast Home Services",
    description: "Get verified professionals at your doorstep in Bhopal within 10 minutes. Transparent pricing starting at ₹49.",
    url: "https://tektonbhopal.com",
    siteName: "Tekton Skilled Worker Marketplace",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TEKTON Bhopal | Instant Home Services",
    description: "Book verified Plumbers, Carpenters, Electricians, and more instantly anywhere in Bhopal.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Tekton Bhopal" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased w-full min-h-screen overflow-x-hidden">
        <ClientProviders>
          {children}
        </ClientProviders>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                const registerSW = function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }).catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                };
                if (document.readyState === 'complete') {
                  registerSW();
                } else {
                  window.addEventListener('load', registerSW);
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
