import type { ReactNode } from 'react';
import clsx from 'clsx';

type TipKind = 'tip' | 'danger' | 'warning';

const MARKS: Record<TipKind, string> = {
  tip: '※',
  warning: '!',
  danger: '⚠',
};

interface TipProps {
  kind?: TipKind;
  children: ReactNode;
}

export default function Tip({ kind = 'tip', children }: TipProps) {
  return (
    <div
      className={clsx('hd-tip', {
        'hd-tip-danger': kind === 'danger',
        'hd-tip-warning': kind === 'warning',
      })}
    >
      <span className="hd-tip-mark" aria-hidden="true">
        {MARKS[kind]}
      </span>
      <div className="hd-tip-body">{children}</div>
    </div>
  );
}
