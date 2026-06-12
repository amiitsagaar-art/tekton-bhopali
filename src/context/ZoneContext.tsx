// src/context/ZoneContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

interface ZoneContextProps {
  zone: string;
  setZone: (zone: string) => void;
}

const ZoneContext = createContext<ZoneContextProps>({
  zone: "all",
  setZone: () => {},
});

export const ZoneProvider = ({ children }: { children: ReactNode }) => {
  const [zone, setZoneState] = useState<string>("all");
  const router = useRouter();
  const pathname = usePathname();

  // Initialize from localStorage & URL on mount (client‑side only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("zone");
    const urlParams = new URLSearchParams(window.location.search);
    const urlZone = urlParams.get("zone");
    const initial = urlZone || stored || "all";
    setZoneState(initial);
    // sync URL if not present
    if (!urlZone && initial !== "all") {
      const params = new URLSearchParams(window.location.search);
      params.set("zone", initial);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, []);

  // Persist to localStorage and keep URL in sync when zone changes
  const setZone = (newZone: string) => {
    setZoneState(newZone);
    if (typeof window !== "undefined") {
      localStorage.setItem("zone", newZone);
      const params = new URLSearchParams(window.location.search);
      if (newZone && newZone !== "all") {
        params.set("zone", newZone);
      } else {
        params.delete("zone");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  return (
    <ZoneContext.Provider value={{ zone, setZone }}>{children}</ZoneContext.Provider>
  );
};

export const useZone = () => useContext(ZoneContext);
