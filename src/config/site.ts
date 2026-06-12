/**
 * Centralized site configuration for Tekton Bhopal.
 * Update these values to update them everywhere across the platform.
 */
export const SITE_CONFIG = {
  // Brand details
  businessName: "Tekton Bhopal",
  phone: "+91 70009 88880",         // ← Apna asli number yahan likho
  email: "hello@tektonbhopal.in",   // ← Apna asli email yahan likho
  address: "MP Nagar Zone 2, Bhopal, Madhya Pradesh – 462011",
  whatsapp: "917000988880",         // WhatsApp number (country code + number, no +)
  
  // Social media links — update when pages are created
  social: {
    facebook:  "https://facebook.com/tektonbhopal",
    twitter:   "https://twitter.com/tektonbhopal",
    instagram: "https://instagram.com/tektonbhopal",
    linkedin:  "https://linkedin.com/company/tektonbhopal",
  },
  
  // Custom UPI / QR Payment Settings
  upi: {
    id:   "tektonbhopal@ybl",  // ← Apna asli UPI ID yahan likho
    name: "Tekton Bhopal",
  },
  
  // Payment controls
  enableCashPayment: false,  // Toggle Cash payment method: true = Enabled, false = Disabled
};
