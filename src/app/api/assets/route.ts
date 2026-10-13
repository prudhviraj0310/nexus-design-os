import { NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { assets } from '@/db/schema';
import { seedDatabase } from '@/db/seed';
import { validateApiAuth } from '@/server/auth';

/**
 * Validates and sanitizes vector SVG markup against XSS, scripts, and malicious entities.
 */
function validateAndSanitizeSvg(svg: string): { valid: boolean; sanitized?: string; error?: string } {
  if (typeof svg !== 'string') {
    return { valid: false, error: 'SVG content must be a string.' };
  }

  const trimmed = svg.trim();
  if (!trimmed.toLowerCase().startsWith('<svg') || !trimmed.toLowerCase().endsWith('</svg>')) {
    return { valid: false, error: 'Malformed SVG: Must begin with <svg and end with </svg>.' };
  }

  // Dangerous element and attribute patterns
  const forbiddenPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<script/gi,
    /<foreignobject/gi,
    /javascript\s*:/gi,
    /data\s*:\s*text\/html/gi,
    /on\w+\s*=/gi, // Event handlers like onload=, onerror=, onclick=
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(trimmed)) {
      return { valid: false, error: 'SVG validation failed: Unsafe markup, scripts, or event handlers detected.' };
    }
  }

  return { valid: true, sanitized: trimmed };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q')?.toLowerCase();

    const { db } = await getDb();
    let allAssets = await db.select().from(assets);

    if (allAssets.length === 0) {
      await seedDatabase();
      allAssets = await db.select().from(assets);
    }

    let filtered = allAssets;
    if (category && category !== 'all') {
      filtered = filtered.filter((a: any) => a.category === category);
    }
    if (query) {
      filtered = filtered.filter(
        (a: any) =>
          a.name.toLowerCase().includes(query) ||
          (Array.isArray(a.tags) && a.tags.some((t: string) => t.toLowerCase().includes(query)))
      );
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      assets: filtered,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = validateApiAuth(request);
    if (!auth.authorized) return auth.errorResponse!;

    const body = await request.json();
    const { name, svgContent, category = 'icons', tags = [], width = 24, height = 24 } = body;

    if (!name || !svgContent) {
      return NextResponse.json(
        { success: false, error: 'Name and svgContent are required.' },
        { status: 400 }
      );
    }

    const validation = validateAndSanitizeSvg(svgContent);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { db } = await getDb();
    const id = `ast-${name.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}-${Date.now()}`;
    const designSystemId = body.designSystemId || 'ds-nova-design';

    await db.insert(assets).values({
      id,
      designSystemId,
      name,
      category,
      svgContent: validation.sanitized!,
      tags,
      width,
      height,
    });

    return NextResponse.json({
      success: true,
      id,
      message: `Asset "${name}" registered successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
