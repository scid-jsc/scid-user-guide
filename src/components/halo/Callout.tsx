import type { ReactNode } from 'react';

interface CalloutProps {
  label?: string;
  children: ReactNode;
}

export default function Callout({ label = 'Labs', children }: CalloutProps) {
  return (
    <div className="hd-callout">
      <div className="hd-callout-hd">
        <SparkleIcon />
        <span>{label}</span>
      </div>
      <div className="hd-callout-body">{children}</div>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.5 2.5M16 16l2.5 2.5M5.5 18.5L8 16M16 8l2.5-2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
