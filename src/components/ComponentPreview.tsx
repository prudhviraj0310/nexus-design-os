import React from 'react';

interface ComponentPreviewProps {
  id: string;
  tokens?: Array<{ name: string; value: string }>;
  resolveToken?: (path: string) => string | undefined;
}

export function ComponentPreview({ id, tokens = [], resolveToken }: ComponentPreviewProps) {
  const v = (path: string): string => {
    if (resolveToken) {
      const res = resolveToken(path);
      if (res) return res;
    }
    const t = tokens.find((tok) => tok.name === path);
    if (!t) {
      // Sensible beautiful fallbacks matching the Lovable design system
      const defaults: Record<string, string> = {
        'color.semantic.primary': '#34466e',
        'color.semantic.surface': '#ffffff',
        'color.semantic.text': '#1e293b',
        'color.semantic.text-muted': '#64748b',
        'color.semantic.success': '#10b981',
        'font.family.sans': 'inherit',
        'radius.pill': '9999px',
        'radius.lg': '16px',
        'radius.md': '10px',
        'spacing.xs': '4px',
        'spacing.sm': '8px',
        'spacing.md': '12px',
        'spacing.lg': '16px',
        'color.primitive.slate.200': '#e2e8f0',
      };
      return defaults[path] || '';
    }
    if (t.value && typeof t.value === 'string' && t.value.startsWith('{')) {
      const alias = t.value.replace(/[{}]/g, '');
      const ref = tokens.find((x) => x.name === alias);
      return ref?.value || t.value;
    }
    return t.value || '';
  };

  const primary = v('color.semantic.primary') || '#34466e';
  const surface = v('color.semantic.surface') || '#ffffff';
  const text = v('color.semantic.text') || '#1e293b';
  const font = v('font.family.sans') || 'inherit';

  switch (id) {
    case 'button':
      return (
        <button
          type="button"
          style={{
            background: primary,
            color: surface,
            borderRadius: v('radius.pill') || '9999px',
            padding: `${v('spacing.sm') || '8px'} ${v('spacing.lg') || '18px'}`,
            fontFamily: font,
            border: 'none',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(52, 70, 110, 0.25)',
            transition: 'all 0.18s ease',
          }}
        >
          Continue
        </button>
      );
    case 'card':
      return (
        <div
          style={{
            background: surface,
            color: text,
            borderRadius: v('radius.lg') || '16px',
            padding: v('spacing.lg') || '16px',
            fontFamily: font,
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px -12px rgba(0,0,0,.15)',
            maxWidth: '240px',
            textAlign: 'left',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Card title</div>
          <div style={{ color: v('color.semantic.text-muted') || '#64748b', fontSize: '12px' }}>
            Live component rendered straight from design tokens.
          </div>
        </div>
      );
    case 'badge':
      return (
        <span
          style={{
            background: v('color.semantic.success') || '#10b981',
            color: surface,
            borderRadius: v('radius.pill') || '9999px',
            padding: `${v('spacing.xs') || '4px'} ${v('spacing.md') || '12px'}`,
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: font,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 1px 3px rgba(16, 185, 129, 0.2)',
          }}
        >
          Active
        </span>
      );
    case 'input':
      return (
        <input
          readOnly
          value="Search design tokens…"
          style={{
            background: surface,
            color: text,
            borderRadius: v('radius.md') || '10px',
            padding: `${v('spacing.sm') || '8px'} ${v('spacing.md') || '14px'}`,
            border: `1px solid ${v('color.primitive.slate.200') || '#e2e8f0'}`,
            fontFamily: font,
            fontSize: '13px',
            outline: 'none',
            width: '200px',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
          }}
        />
      );
    default:
      return null;
  }
}
