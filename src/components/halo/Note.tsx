import type { ReactNode } from 'react';

export default function Note({ children }: { children: ReactNode }) {
  return <div className="hd-note">{children}</div>;
}
