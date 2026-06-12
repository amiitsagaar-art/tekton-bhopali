// src/components/TruecallerScript.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/context/ToastContext";

/**
 * Truecaller verification button with:
 *  - Mock fallback when no app key is set.
 *  - Real deep‑link flow with timeout fallback.
 *  - Post‑deep‑link callback handling via URL query or hash parameters.
 *    After a successful Truecaller verification the app redirects back with
 *    `token`, `name` and `phone` (may appear in the query string or hash).
 *    This component automatically consumes those values, calls the backend
 *    verify endpoint, and logs the user in without further interaction.
 */
interface TruecallerScriptProps {
  onProcessingChange?: (active: boolean) => void;
}

const TruecallerScript: React.FC<TruecallerScriptProps> = ({ onProcessingChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  // helper to trigger haptic safely
  const vibrate = (pattern: number | number[]) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern as any);
    }
  };

  // ---------------------------------------------------------------
  // 1️⃣ Detect Truecaller callback (query string **or** hash fragment)
  // ---------------------------------------------------------------
  useEffect(() => {
    const getParam = (key: string): string | null => {
      const fromSearch = searchParams?.get(key);
      if (fromSearch) return fromSearch;
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        return hashParams.get(key);
      }
      return null;
    };

    const token = getParam("token");
    const name = getParam("name");
    const phone = getParam("phone");

    if (typeof window === 'undefined') return;
    console.log("🚀 [Truecaller Debug] Callback Payload Received:", { token, name, phone });
    if (token || (name && phone)) {
      setLoading(true);
      onProcessingChange?.(true);
      const payload = token
        ? { token }
        : { token: "mock-token", profile: { name, phone } };

      fetch("/api/auth/verify-truecaller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || "Verification failed");
          }
          // success vibration
          vibrate(50);
          // success toast already handled by caller
          window.location.reload();
        })
        .catch((e) => {
          // error vibration
          vibrate([100, 50, 100]);
          addToast(`Truecaller verification error: ${e.message}`, "error");
        })
        .finally(() => {
          setLoading(false);
          onProcessingChange?.(false);
        });

      router.replace(window.location.pathname, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router, onProcessingChange]);

  // ---------------------------------------------------------------
  // 2️⃣ Click handler – mock fallback or real deep‑link with timeout
  // ---------------------------------------------------------------
  const handleVerify = async () => {
    const appKey = process.env.NEXT_PUBLIC_TRUECALLER_APP_KEY;

    // ---- Mock fallback when no app key is configured ----
    if (!appKey) {
      setLoading(true);
      onProcessingChange?.(true);
      try {
        const resp = await fetch("/api/auth/verify-truecaller", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: "mock-token",
            profile: { name: "Bhopal Tester", phone: "+916262329044" },
          }),
        });
        if (!resp.ok) {
          const errText = await resp.text();
          addToast(`Mock login failed: ${errText}`, "error");
        } else {
          addToast("Welcome back, Bhopal Tester! 🎉", "success");
          vibrate(50);
          window.location.reload();
        }
      } catch (e) {
        addToast(`Mock login error: ${e}`, "error");
        vibrate([100, 50, 100]);
      } finally {
        setLoading(false);
        onProcessingChange?.(false);
      }
      return;
    }

    // ---- Real Truecaller deep‑link flow with 2 s fallback ----
    setLoading(true);
    onProcessingChange?.(true);
    addToast("Opening Truecaller App... 📲", "info");
    const requestNonce = Math.random().toString(36).substring(2, 12);
    const deepLink = `truecallersdk://truesdk/web_verify?type=btmsheet` +
      `&requestNonce=${requestNonce}` +
      `&partnerKey=${appKey}` +
      `&partnerName=TektonBhopal` +
      `&lang=en`;

    const fallbackTimer = setTimeout(() => {
      setLoading(false);
      onProcessingChange?.(false);
      addToast("Truecaller app not found. Switching to SMS OTP.", "error");
      vibrate([100, 50, 100]);
    }, 2000);

    const onBlur = () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener("blur", onBlur);
      // success vibration will be handled after callback processing
    };
    window.addEventListener("blur", onBlur);

    window.location.href = deepLink;
  };

  // ---------------------------------------------------------------
  // 3️⃣ Render the button (official branding) and any error message
  // ---------------------------------------------------------------
  return (
    <div className="flex items-center justify-center my-4 w-full">
      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full bg-[#0087FF] text-white hover:bg-[#0076E5] font-bold py-2 px-4 rounded transition"
      >
        {loading ? "Opening Truecaller…" : "Verify with Truecaller"}
      </button>
      {error && <span className="ml-2 text-red-400 text-sm">{error}</span>}
    </div>
  );
};

export default TruecallerScript;
