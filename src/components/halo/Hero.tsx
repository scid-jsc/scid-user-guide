import type { ReactNode } from 'react';

interface HeroProps {
  title: string;
  intro: ReactNode;
  version?: string;
  updated?: string;
  readTime?: string;
  illustration?: boolean;
}

export default function Hero({
  title,
  intro,
  version,
  updated,
  readTime,
  illustration = true,
}: HeroProps) {
  const hasMeta = version || updated || readTime;
  return (
    <header className="hd-hero">
      <div className="hd-hero-split">
        <div className="hd-hero-text">
          <h1 className="hd-h1">{title}</h1>
          <p className="hd-intro">{intro}</p>
          {hasMeta && (
            <div className="hd-hero-meta">
              {version && <span className="hd-pill">{version}</span>}
              {updated && <span>Cập nhật {updated}</span>}
              {updated && readTime && <span className="hd-hero-meta-sep">·</span>}
              {readTime && <span>{readTime}</span>}
            </div>
          )}
        </div>
        {illustration && <HeroIllustration />}
      </div>
    </header>
  );
}

function HeroIllustration() {
  return (
    <svg
      className="hd-hero-illus"
      viewBox="0 0 220 220"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="halo-hi-pulse" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6e47ff" />
          <stop offset="100%" stopColor="#b8ff3d" />
        </linearGradient>
        <radialGradient id="halo-hg-pulse" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#b8ff3d" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#b8ff3d" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="110" cy="110" r="100" fill="url(#halo-hg-pulse)" />
      <circle cx="110" cy="110" r="92" fill="none" stroke="#6e47ff" strokeWidth="1" opacity="0.18" />
      <circle
        cx="110"
        cy="110"
        r="72"
        fill="none"
        stroke="url(#halo-hi-pulse)"
        strokeWidth="1.5"
        strokeDasharray="2 8"
      />
      <circle cx="110" cy="110" r="52" fill="none" stroke="#6e47ff" strokeWidth="1.4" />
      <circle cx="110" cy="110" r="28" fill="#b8ff3d" opacity="0.85" />
      <circle cx="110" cy="110" r="14" fill="#6e47ff" />
      <circle cx="110" cy="110" r="4" fill="#ffffff" />
      <g>
        <circle cx="186" cy="60" r="4" fill="#6e47ff">
          <animate attributeName="r" values="3;5;3" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="186" cy="60" r="10" fill="none" stroke="#6e47ff" strokeWidth="1" opacity="0.3">
          <animate attributeName="r" values="6;14;6" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2.4s" repeatCount="indefinite" />
        </circle>
      </g>
      <circle cx="40" cy="170" r="3" fill="#b8ff3d">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="195" cy="160" r="2.5" fill="#6e47ff">
        <animate
          attributeName="opacity"
          values="0.3;0.9;0.3"
          dur="2.1s"
          begin="0.4s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="35" cy="55" r="2" fill="#b8ff3d">
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur="2s"
          begin="0.8s"
          repeatCount="indefinite"
        />
      </circle>
      <g stroke="#6e47ff" strokeWidth="1.2" opacity="0.5" strokeLinecap="round">
        <line x1="110" y1="14" x2="110" y2="22" />
        <line x1="110" y1="198" x2="110" y2="206" />
        <line x1="14" y1="110" x2="22" y2="110" />
        <line x1="198" y1="110" x2="206" y2="110" />
      </g>
    </svg>
  );
}
