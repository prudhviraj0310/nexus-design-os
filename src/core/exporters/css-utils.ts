import { BorderValue, FlatToken, ShadowLayer, TypographyValue } from '../tokens/types';

export function formatCssValue(token: FlatToken): string {
  if (typeof token.resolvedValue === 'string') {
    return token.resolvedValue;
  }

  if (token.type === 'typography') {
    const v = token.resolvedValue as TypographyValue;
    const weight = v.fontWeight ? `${v.fontWeight} ` : '';
    const line = v.lineHeight ? `/${v.lineHeight}` : '';
    return `${weight}${v.fontSize}${line} ${v.fontFamily}`.trim();
  }

  if (token.type === 'shadow') {
    const layers = Array.isArray(token.resolvedValue) ? token.resolvedValue : [token.resolvedValue as ShadowLayer];
    return layers
      .map((l) => `${l.inset ? 'inset ' : ''}${l.offsetX} ${l.offsetY} ${l.blur}${l.spread ? ' ' + l.spread : ''} ${l.color}`)
      .join(', ');
  }

  if (token.type === 'border') {
    const v = token.resolvedValue as BorderValue;
    return `${v.width} ${v.style || 'solid'} ${v.color}`.trim();
  }

  return JSON.stringify(token.resolvedValue);
}
