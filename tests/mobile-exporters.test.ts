import { describe, it, expect } from 'vitest';
import { exportToSwift } from '../src/core/exporters/swift';
import { exportToKotlin } from '../src/core/exporters/kotlin';
import { FlatToken } from '../src/core/tokens/types';

describe('Mobile Exporters: iOS Swift & Android Jetpack Compose', () => {
  const sampleTokens: FlatToken[] = [
    {
      name: 'primary',
      path: 'color.brand.primary',
      category: 'color',
      type: 'color',
      rawValue: '#3b82f6',
      resolvedValue: '#3b82f6',
      isAlias: false,
      description: 'Primary brand blue',
    },
    {
      name: 'md',
      path: 'spacing.md',
      category: 'spacing',
      type: 'dimension',
      rawValue: '16px',
      resolvedValue: '16px',
      isAlias: false,
    },
  ];

  it('generates valid iOS SwiftUI code matching tokens', () => {
    const swift = exportToSwift(sampleTokens);
    expect(swift.filename).toBe('Tokens.swift');
    expect(swift.content).toContain('import SwiftUI');
    expect(swift.content).toContain('public struct NovaTokens');
    expect(swift.content).toContain('public static let brandPrimary = Color(hex: 0x3b82f6)');
    expect(swift.content).toContain('public static let md: CGFloat = 16');
  });

  it('generates valid Android Jetpack Compose code matching tokens', () => {
    const kotlin = exportToKotlin(sampleTokens);
    expect(kotlin.filename).toBe('Tokens.kt');
    expect(kotlin.content).toContain('package com.novadesign.tokens');
    expect(kotlin.content).toContain('object NovaColors');
    expect(kotlin.content).toContain('val BrandPrimary = Color(0xFF3B82F6L)');
    expect(kotlin.content).toContain('object NovaSpacing');
    expect(kotlin.content).toContain('val Md: Dp = 16.dp');
  });
});
