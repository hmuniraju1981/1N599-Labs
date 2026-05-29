// =============================================================================
// FILE: src/components/ui/Logo.tsx
// PURPOSE: Renders the 1N599 Labs brand logo as an animated SVG.
//          Hexagonal frame with neural network nodes — symbolizing AI.
// =============================================================================

export default function Logo({ size = 48, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="hover:scale-105 transition-transform duration-300"
      >
        <defs>
          <linearGradient id="logoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="logoGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Hexagonal border */}
        <path d="M32 4L56 18V46L32 60L8 46V18L32 4Z" stroke="url(#logoGrad1)" strokeWidth="1.5" fill="none" opacity="0.8" />

        {/* Neural network nodes */}
        <circle cx="32" cy="20" r="3" fill="url(#logoGrad1)" filter="url(#glow)" />
        <circle cx="20" cy="34" r="2.5" fill="#06b6d4" opacity="0.8" />
        <circle cx="44" cy="34" r="2.5" fill="#8b5cf6" opacity="0.8" />
        <circle cx="32" cy="46" r="3" fill="url(#logoGrad1)" filter="url(#glow)" />
        <circle cx="26" cy="27" r="1.5" fill="#06b6d4" opacity="0.5" />
        <circle cx="38" cy="27" r="1.5" fill="#8b5cf6" opacity="0.5" />
        <circle cx="26" cy="40" r="1.5" fill="#ec4899" opacity="0.5" />
        <circle cx="38" cy="40" r="1.5" fill="#06b6d4" opacity="0.5" />

        {/* Neural connections */}
        <line x1="32" y1="20" x2="20" y2="34" stroke="url(#logoGrad2)" strokeWidth="0.8" />
        <line x1="32" y1="20" x2="44" y2="34" stroke="url(#logoGrad2)" strokeWidth="0.8" />
        <line x1="20" y1="34" x2="32" y2="46" stroke="url(#logoGrad2)" strokeWidth="0.8" />
        <line x1="44" y1="34" x2="32" y2="46" stroke="url(#logoGrad2)" strokeWidth="0.8" />
        <line x1="32" y1="20" x2="26" y2="27" stroke="url(#logoGrad2)" strokeWidth="0.5" opacity="0.6" />
        <line x1="32" y1="20" x2="38" y2="27" stroke="url(#logoGrad2)" strokeWidth="0.5" opacity="0.6" />
        <line x1="20" y1="34" x2="26" y2="40" stroke="url(#logoGrad2)" strokeWidth="0.5" opacity="0.6" />
        <line x1="44" y1="34" x2="38" y2="40" stroke="url(#logoGrad2)" strokeWidth="0.5" opacity="0.6" />
        <line x1="26" y1="27" x2="38" y2="27" stroke="url(#logoGrad2)" strokeWidth="0.4" opacity="0.4" />
        <line x1="26" y1="40" x2="38" y2="40" stroke="url(#logoGrad2)" strokeWidth="0.4" opacity="0.4" />

        {/* Central pulse — animated breathing circle */}
        <circle cx="32" cy="33" r="5" fill="none" stroke="url(#logoGrad1)" strokeWidth="1" opacity="0.4">
          <animate attributeName="r" values="4;6;4" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>

      {showText && (
        <span className="text-xl font-bold tracking-tight">
          <span className="gradient-text">1N599</span>
          <span className="text-white ml-1">Labs</span>
        </span>
      )}
    </div>
  );
}
