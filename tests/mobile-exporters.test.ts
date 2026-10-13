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
      name: 'primaryTranslucent',
      path: 'color.brand.translucent',
      category: 'color',
      type: 'color',
      rawValue: '#3b82f680',
      resolvedValue: '#3b82f680',
      isAlias: false,
      description: 'Primary with 50% alpha',
    },
    {
      name: 'transparentRed',
      path: 'color.feedback.dangerTransparent',
      category: 'color',
      type: 'color',
      rawValue: '#ff000000',
      resolvedValue: '#ff000000',
      isAlias: false,
      description: 'Fully transparent red',
    },
    {
      name: 'whiteOpaque',
      path: 'color.base.white',
      category: 'color',
      type: 'color',
      rawValue: '#ffffffff',
      resolvedValue: '#ffffffff',
      isAlias: false,
      description: 'Opaque white',
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
    {
      name: 'lg',
      path: 'borderRadius.lg',
      category: 'borderRadius',
      type: 'dimension',
      rawValue: '12px',
      resolvedValue: '12px',
      isAlias: false,
    },
    {
      name: 'headline',
      path: 'typography.heading.xl',
      category: 'typography',
      type: 'fontSize',
      rawValue: '32px',
      resolvedValue: '32px',
      isAlias: false,
    },
    {
      name: 'cardElevation',
      path: 'shadow.card',
      category: 'shadow',
      type: 'shadow',
      rawValue: '0 4px 6px rgba(0,0,0,0.1)',
      resolvedValue: '0 4px 6px rgba(0,0,0,0.1)',
      isAlias: false,
    },
  ];

  it('correctly serializes 6-digit and 8-digit RGBA hexes in iOS Swift', () => {
    const swift = exportToSwift(sampleTokens);
    expect(swift.filename).toBe('Tokens.swift');
    expect(swift.content).toContain('import SwiftUI');
    expect(swift.content).toContain('public struct NovaTokens');

    // 6-digit hex
    expect(swift.content).toContain('public static let brandPrimary = Color(hex: 0x3b82f6)');
    // 8-digit hex (#3b82f680)
    expect(swift.content).toContain('public static let brandTranslucent = Color(hexRGBA: 0x3b82f680)');
    // 8-digit transparent red (#ff000000)
    expect(swift.content).toContain('public static let feedbackDangerTransparent = Color(hexRGBA: 0xff000000)');
    // 8-digit opaque white (#ffffffff)
    expect(swift.content).toContain('public static let baseWhite = Color(hexRGBA: 0xffffffff)');

    // Spacing and Radii
    expect(swift.content).toContain('public static let md: CGFloat = 16');
    expect(swift.content).toContain('public static let lg: CGFloat = 12');

    // Initializer helpers
    expect(swift.content).toContain('init(hexRGBA: UInt32)');
    expect(swift.content).toContain('red: Double((hexRGBA >> 24) & 0xff) / 255.0');
    expect(swift.content).toContain('green: Double((hexRGBA >> 16) & 0xff) / 255.0');
    expect(swift.content).toContain('blue: Double((hexRGBA >> 8) & 0xff) / 255.0');
    expect(swift.content).toContain('opacity: Double(hexRGBA & 0xff) / 255.0');
  });

  it('correctly serializes 6-digit and 8-digit ARGB hexes in Android Jetpack Compose', () => {
    const kotlin = exportToKotlin(sampleTokens);
    expect(kotlin.filename).toBe('Tokens.kt');
    expect(kotlin.content).toContain('package com.novadesign.tokens');
    expect(kotlin.content).toContain('object NovaColors');

    // 6-digit hex: #3b82f6 -> 0xFF3B82F6L
    expect(kotlin.content).toContain('val BrandPrimary = Color(0xFF3B82F6L)');
    // 8-digit CSS RGBA #3b82f680 -> Compose ARGB 0x803B82F6L (Alpha is 80)
    expect(kotlin.content).toContain('val BrandTranslucent = Color(0x803B82F6L)');
    // 8-digit CSS RGBA #ff000000 -> Compose ARGB 0x00FF0000L (Alpha is 00)
    expect(kotlin.content).toContain('val FeedbackDangerTransparent = Color(0x00FF0000L)');
    // 8-digit CSS RGBA #ffffffff -> Compose ARGB 0xFFFFFFFFL (Alpha is FF)
    expect(kotlin.content).toContain('val BaseWhite = Color(0xFFFFFFFFL)');

    // Spacing and Radii
    expect(kotlin.content).toContain('val Md: Dp = 16.dp');
    expect(kotlin.content).toContain('object NovaRadii');
    expect(kotlin.content).toContain('val Lg: Dp = 12.dp');
  });

  it('explicitly warns about omitted token categories in mobile exports instead of silent omission', () => {
    const swift = exportToSwift(sampleTokens);
    expect(swift.content).toContain('WARNING: 2 token(s) across 2 category/categories omitted');
    expect(swift.content).toContain('- typography');
    expect(swift.content).toContain('- shadow');

    const kotlin = exportToKotlin(sampleTokens);
    expect(kotlin.content).toContain('WARNING: 2 token(s) across 2 category/categories omitted');
    expect(kotlin.content).toContain('- typography');
    expect(kotlin.content).toContain('- shadow');
  });
});
