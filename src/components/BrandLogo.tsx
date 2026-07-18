import React from 'react';

// ── Stadium Copilot Brand Mark ─────────────────────────────────────────────────
// Original design inspired by FIFA's visual language — a stylised football crest.
// Uses the project's four FIFA-palette colours:
//   #E61D25 (red) · #2A398D (blue) · #3CAC3B (green) · #D1D4D1 (light gray)
//
// Structure:
//   • Outer shield outline in deep blue
//   • Left half of shield: red   |  Right half: green
//   • Centred football with hexagon/pentagon stitching in white / light-gray
//   • Three gold stars above the shield crest
// ──────────────────────────────────────────────────────────────────────────────

interface BrandLogoProps {
  /** Overall size of the square bounding box in px */
  size?: number;
  className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ size = 36, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="Stadium Copilot brand mark"
  >
    {/* ── Shield base ──────────────────────────────────────────────────────── */}
    {/* Clip: left half = red, right half = green */}
    <defs>
      <clipPath id="sc-left">
        <rect x="0" y="0" width="50" height="100" />
      </clipPath>
      <clipPath id="sc-right">
        <rect x="50" y="0" width="50" height="100" />
      </clipPath>
      {/* Shield path for clip masking */}
      <clipPath id="sc-shield-clip">
        <path d="M50 5 L88 18 L88 52 C88 73 68 88 50 97 C32 88 12 73 12 52 L12 18 Z" />
      </clipPath>
    </defs>

    {/* Left shield half — Red */}
    <path
      d="M50 5 L88 18 L88 52 C88 73 68 88 50 97 C32 88 12 73 12 52 L12 18 Z"
      fill="#E61D25"
      clipPath="url(#sc-left)"
    />
    {/* Right shield half — Dark Cornflower Blue */}
    <path
      d="M50 5 L88 18 L88 52 C88 73 68 88 50 97 C32 88 12 73 12 52 L12 18 Z"
      fill="#2A398D"
      clipPath="url(#sc-right)"
    />

    {/* Center dividing stripe — Light Gray */}
    <rect x="48.5" y="5" width="3" height="92" clipPath="url(#sc-shield-clip)" fill="#D1D4D1" opacity="0.6" />

    {/* Shield border — dark blue outline */}
    <path
      d="M50 5 L88 18 L88 52 C88 73 68 88 50 97 C32 88 12 73 12 52 L12 18 Z"
      stroke="#0e1a30"
      strokeWidth="3"
      fill="none"
    />

    {/* ── Football (soccer ball) centred in shield ──────────────────────────── */}
    {/* Outer circle */}
    <circle cx="50" cy="53" r="20" fill="#f8fafc" stroke="#D1D4D1" strokeWidth="1.2" />

    {/* Centre pentagon (black) */}
    <polygon
      points="50,40 58,46 55,56 45,56 42,46"
      fill="#0e1a30"
      opacity="0.85"
    />

    {/* Surrounding hexagon patches */}
    {/* Top-left patch */}
    <polygon
      points="37,44 42,40 42,46 38,49"
      fill="#0e1a30"
      opacity="0.6"
    />
    {/* Top-right patch */}
    <polygon
      points="63,44 58,40 58,46 62,49"
      fill="#0e1a30"
      opacity="0.6"
    />
    {/* Bottom-left patch */}
    <polygon
      points="38,62 42,58 45,63 40,66"
      fill="#0e1a30"
      opacity="0.6"
    />
    {/* Bottom-right patch */}
    <polygon
      points="62,62 58,58 55,63 60,66"
      fill="#0e1a30"
      opacity="0.6"
    />
    {/* Bottom-centre patch */}
    <polygon
      points="45,66 55,66 54,72 46,72"
      fill="#0e1a30"
      opacity="0.6"
    />

    {/* ── Three stars above the crest ──────────────────────────────────────── */}
    {/* Star helper — 5-point, centred at cx/cy */}
    {/* Left star */}
    <polygon
      points="32,18 33.2,14.5 34.4,18 31,15.8 35.4,15.8"
      fill="#D1D4D1"
    />
    {/* Centre star (slightly larger) */}
    <polygon
      points="50,16 51.5,11.5 53,16 48.8,13.2 53.2,13.2"
      fill="#D1D4D1"
    />
    {/* Right star */}
    <polygon
      points="68,18 69.2,14.5 70.4,18 67,15.8 71.4,15.8"
      fill="#D1D4D1"
    />

    {/* ── Green bottom accent strip ─────────────────────────────────────────── */}
    <path
      d="M50 97 C32 88 12 73 12 52 L12 80 C12 80 25 93 50 97 Z"
      fill="#3CAC3B"
      opacity="0.45"
      clipPath="url(#sc-shield-clip)"
    />
    <path
      d="M50 97 C68 88 88 73 88 52 L88 80 C88 80 75 93 50 97 Z"
      fill="#3CAC3B"
      opacity="0.45"
      clipPath="url(#sc-shield-clip)"
    />
  </svg>
);

export default BrandLogo;
