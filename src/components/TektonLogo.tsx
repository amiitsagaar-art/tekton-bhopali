"use client";
import React, { useId } from "react";

interface TektonLogoProps {
  className?: string;
}

export default function TektonLogo({ className = "w-10 h-10 shrink-0" }: TektonLogoProps) {
  const id = useId();
  const hexGoldId = `hexGold-${id}`.replace(/:/g, "_");
  const innerGoldId = `innerGold-${id}`.replace(/:/g, "_");
  const lgShadowId = `lgShadow-${id}`.replace(/:/g, "_");

  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={hexGoldId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C9960C" />
          <stop offset="50%" stopColor="#F0B429" />
          <stop offset="100%" stopColor="#C9960C" />
        </linearGradient>
        <linearGradient id={innerGoldId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5C842" />
          <stop offset="100%" stopColor="#D4960A" />
        </linearGradient>
        <filter id={lgShadowId} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.35)" />
        </filter>
      </defs>

      {/* Outer gold hexagon */}
      <polygon
        points="100,8 182,52 182,148 100,192 18,148 18,52"
        fill={`url(#${hexGoldId})`}
        filter={`url(#${lgShadowId})`}
      />

      {/* Dark navy inner hexagon (slightly smaller) */}
      <polygon
        points="100,20 170,58 170,142 100,180 30,142 30,58"
        fill="#1A3150"
      />

      {/* Gold decorative inner hexagon border */}
      <polygon
        points="100,28 162,63 162,137 100,172 38,137 38,63"
        fill="none"
        stroke={`url(#${innerGoldId})`}
        strokeWidth="3"
      />

      {/* ── Building / Architecture shape (left side) ── */}
      {/* Main building body */}
      <rect x="52" y="72" width="48" height="52" rx="2" fill={`url(#${innerGoldId})`} />
      {/* Building roof triangle */}
      <polygon points="46,72 76,48 106,72" fill={`url(#${innerGoldId})`} />
      {/* Building windows */}
      <rect x="58" y="78" width="10" height="10" rx="1" fill="#1A3150" />
      <rect x="74" y="78" width="10" height="10" rx="1" fill="#1A3150" />
      <rect x="90" y="78" width="10" height="10" rx="1" fill="#1A3150" />
      <rect x="58" y="94" width="10" height="10" rx="1" fill="#1A3150" />
      <rect x="74" y="94" width="10" height="10" rx="1" fill="#1A3150" />
      <rect x="90" y="94" width="10" height="10" rx="1" fill="#1A3150" />
      {/* Door */}
      <rect x="70" y="108" width="16" height="16" rx="2" fill="#1A3150" />

      {/* ── Wrench (overlapping right side) ── */}
      {/* Wrench head (circle/ring) */}
      <circle cx="136" cy="76" r="18" fill="none" stroke={`url(#${innerGoldId})`} strokeWidth="9" />
      <circle cx="136" cy="76" r="8" fill="#1A3150" />
      {/* Wrench handle */}
      <rect
        x="118" y="88"
        width="9" height="46"
        rx="4"
        fill={`url(#${innerGoldId})`}
        transform="rotate(45 122 102)"
      />
    </svg>
  );
}
