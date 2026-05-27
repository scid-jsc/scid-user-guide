import Link from '@docusaurus/Link';

interface CtaBannerProps {
  eyebrow?: string;
  title: string;
  sub?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export default function CtaBanner({
  eyebrow = 'Sẵn sàng bắt đầu',
  title,
  sub,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: CtaBannerProps) {
  return (
    <div className="hd-cta-banner">
      <div className="hd-cta-banner-pattern" aria-hidden="true" />
      <div className="hd-cta-banner-text">
        <div className="hd-cta-banner-eyebrow">{eyebrow}</div>
        <p className="hd-cta-banner-title">{title}</p>
        {sub && <p className="hd-cta-banner-sub">{sub}</p>}
      </div>
      <div className="hd-cta-banner-actions">
        <Link to={primaryHref} className="hd-cta-banner-primary">
          {primaryLabel}
        </Link>
        {secondaryLabel && secondaryHref && (
          <Link to={secondaryHref} className="hd-cta-banner-secondary">
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
