<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 240 140"
  className="w-16 h-10"
  aria-label="Ichthys Emblem Logo"
>
  <defs>
    <linearGradient id="fishGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#4f46e5" />
    </linearGradient>
  </defs>

  <rect width="240" height="140" rx="28" fill="url(#fishGrad)" />

  <path
    d="M 30 70 C 80 20, 160 20, 210 110 M 30 70 C 80 120, 160 120, 210 30"
    fill="none"
    stroke="#ffffff"
    stroke-width="10"
    stroke-linecap="round"
  />

  <text
    x="110"
    y="75"
    fill="#ffffff"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="18"
    font-weight="700"
    letter-spacing="3"
    text-anchor="middle"
    dominant-baseline="middle"
  >
    IXΘYΣ
  </text>
</svg>;

import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: number;
  showLabel?: boolean;
}

export const IchthysLogo: React.FC<LogoProps> = ({
  className = "text-cyan-400",
  size = 40,
  showLabel = false,
}) => {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 transition-opacity hover:opacity-80 ${className}`}
      aria-label="Home"
    >
      <svg
        width={size}
        height={(size * 3) / 5}
        viewBox="0 0 200 120"
        className="fill-none stroke-current"
      >
        <path
          d="M 20 60 C 70 10, 140 10, 180 90 M 20 60 C 70 110, 140 110, 180 30"
          strokeWidth="14"
          strokeLinecap="round"
        />
      </svg>
      {showLabel && (
        <span className="text-xl font-bold tracking-tight text-white">
          BookStore
        </span>
      )}
    </Link>
  );
};

export default IchthysLogo;
