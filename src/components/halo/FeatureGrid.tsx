import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';

export interface FeatureItem {
  icon?: ReactNode;
  label: string;
  path?: string;
  body: string;
  link?: { label: string; href: string };
}

interface FeatureGridProps {
  items: FeatureItem[];
}

export default function FeatureGrid({ items }: FeatureGridProps) {
  return (
    <div className="hd-feature-grid">
      {items.map((item) => (
        <FeatureCard key={item.label} item={item} />
      ))}
    </div>
  );
}

function FeatureCard({ item }: { item: FeatureItem }) {
  const inner = (
    <>
      <div className="hd-feature-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {item.icon && <span className="hd-feature-icon">{item.icon}</span>}
          <span className="hd-feature-label">{item.label}</span>
        </div>
        {item.path && <span className="hd-feature-path">{item.path}</span>}
      </div>
      <p className="hd-feature-body">{item.body}</p>
      {item.link && (
        <span className="hd-feature-link">
          {item.link.label} <ArrowIcon />
        </span>
      )}
    </>
  );

  if (item.link) {
    return (
      <Link to={item.link.href} className="hd-feature">
        {inner}
      </Link>
    );
  }
  return <div className="hd-feature">{inner}</div>;
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M13 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
