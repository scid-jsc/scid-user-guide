import type { ReactNode } from 'react';
import clsx from 'clsx';

interface HaloPageProps {
  children: ReactNode;
  className?: string;
}

export default function HaloPage({ children, className }: HaloPageProps) {
  return <div className={clsx('hd-page hd-theme-pulse', className)}>{children}</div>;
}
