import React from 'react';

interface SwatchProps {
  value: string | null | undefined;
  className?: string;
  size?: number | string;
}

export function Swatch({ value, className = '', size }: SwatchProps) {
  const bg = value || 'transparent';
  return (
    <span
      className={`inline-block shrink-0 border border-black/10 shadow-xs ${className}`}
      style={{
        background: bg,
        width: size,
        height: size,
      }}
    />
  );
}
