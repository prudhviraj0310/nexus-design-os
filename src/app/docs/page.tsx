'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Box,
  Copy,
  Check,
  Search,
  ExternalLink,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Terminal,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  FileCode,
} from 'lucide-react';

export default function LivingDocumentationPage() {
  const [activeSection, setActiveSection] = useState<string>('foundations-colors');
  const [docTheme, setDocTheme] = useState<'light' | 'dark'>('dark');
  const [tokens, setTokens] = useState<any[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Button demo state
  const [buttonVariant, setButtonVariant] = useState<'primary' | 'secondary' | 'ghost'>('primary');
  const [buttonSize, setButtonSize] = useState<'sm' | 'md' | 'lg'>('md');

  useEffect(() => {
    fetch('/api/tokens')
      .then((res) => res.json())
      .then((data) => {
        if (data.tokens) setTokens(data.tokens);
      })
      .catch((err) => console.error('Failed to load tokens for docs', err));
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const colorTokens = tokens.filter((t) => t.category === 'color');
  const spacingTokens = tokens.filter((t) => t.category === 'spacing');
  const radiusTokens = tokens.filter((t) => t.category === 'borderRadius');
  const typographyTokens = tokens.filter((t) => t.category === 'typography');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: docTheme === 'dark' ? '#060913' : '#f8fafc', color: docTheme === 'dark' ? '#f8fafc' : '#0f172a' }}>
      {/* Docs Sidebar */}
      <aside
        style={{
          width: '280px',
          borderRight: `1px solid ${docTheme === 'dark' ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
          background: docTheme === 'dark' ? '#0a0f1d' : '#ffffff',
          padding: '28px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          flexShrink: 0,
        }}
      >
        <div>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              marginBottom: '16px',
            }}
          >
            <ArrowLeft size={14} /> Back to Studio Dashboard
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                color: '#fff',
              }}
            >
              ✦
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px' }}>Nova Living Docs</div>
              <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: 600 }}>v1.2.0 &bull; Single Source of Truth</div>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Introduction
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={() => setActiveSection('intro-overview')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: activeSection === 'intro-overview' ? 700 : 500,
                  textAlign: 'left',
                  background: activeSection === 'intro-overview' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: activeSection === 'intro-overview' ? '#6366f1' : 'inherit',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Getting Started
              </button>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Design Foundations
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={() => setActiveSection('foundations-colors')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: activeSection === 'foundations-colors' ? 700 : 500,
                  textAlign: 'left',
                  background: activeSection === 'foundations-colors' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: activeSection === 'foundations-colors' ? '#6366f1' : 'inherit',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Color Palette & Tokens
              </button>
              <button
                onClick={() => setActiveSection('foundations-spacing')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: activeSection === 'foundations-spacing' ? 700 : 500,
                  textAlign: 'left',
                  background: activeSection === 'foundations-spacing' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: activeSection === 'foundations-spacing' ? '#6366f1' : 'inherit',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Spacing & Grid System
              </button>
              <button
                onClick={() => setActiveSection('foundations-radii')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: activeSection === 'foundations-radii' ? 700 : 500,
                  textAlign: 'left',
                  background: activeSection === 'foundations-radii' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: activeSection === 'foundations-radii' ? '#6366f1' : 'inherit',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Border Radii & Shapes
              </button>
              <button
                onClick={() => setActiveSection('foundations-typography')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: activeSection === 'foundations-typography' ? 700 : 500,
                  textAlign: 'left',
                  background: activeSection === 'foundations-typography' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: activeSection === 'foundations-typography' ? '#6366f1' : 'inherit',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Typography Scale
              </button>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Components
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={() => setActiveSection('components-button')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: activeSection === 'components-button' ? 700 : 500,
                  textAlign: 'left',
                  background: activeSection === 'components-button' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: activeSection === 'components-button' ? '#6366f1' : 'inherit',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Button
              </button>
              <button
                onClick={() => setActiveSection('components-badge')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: activeSection === 'components-badge' ? 700 : 500,
                  textAlign: 'left',
                  background: activeSection === 'components-badge' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: activeSection === 'components-badge' ? '#6366f1' : 'inherit',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Badge
              </button>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Developer & AI Handoff
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={() => setActiveSection('dev-mcp')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: activeSection === 'dev-mcp' ? 700 : 500,
                  textAlign: 'left',
                  background: activeSection === 'dev-mcp' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: activeSection === 'dev-mcp' ? '#6366f1' : 'inherit',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                AI Coding Agent / MCP
              </button>
              <button
                onClick={() => setActiveSection('dev-install')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: activeSection === 'dev-install' ? 700 : 500,
                  textAlign: 'left',
                  background: activeSection === 'dev-install' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: activeSection === 'dev-install' ? '#6366f1' : 'inherit',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Continuous Delivery Pipelines
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Documentation Viewer */}
      <main style={{ flex: 1, padding: '40px 60px', maxWidth: '960px', overflowY: 'auto' }}>
        {/* Section 1: Introduction */}
        {activeSection === 'intro-overview' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
              <BookOpen size={16} /> INTRODUCTION
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Nova Design System Guidelines
            </h1>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: '32px' }}>
              Nova is Acme Corporation's unified design system. Built on W3C Design Tokens Community Group standards, it serves as the single source of truth connecting our Figma design libraries directly to production web apps, iOS applications, Android apps, and AI coding agents via the Model Context Protocol (MCP).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
              <div className="glass-panel" style={{ padding: '20px' }}>
                <Layers size={20} color="#6366f1" style={{ marginBottom: '8px' }} />
                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>W3C DTCG Format</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Universal token taxonomy across all brand themes.</div>
              </div>

              <div className="glass-panel" style={{ padding: '20px' }}>
                <Terminal size={20} color="#06b6d4" style={{ marginBottom: '8px' }} />
                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>Automated Git PRs</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Tokens export directly to GitHub repositories.</div>
              </div>

              <div className="glass-panel" style={{ padding: '20px' }}>
                <Sparkles size={20} color="#10b981" style={{ marginBottom: '8px' }} />
                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>MCP Agent Protocol</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Grounds Claude Code & Cursor in real project tokens.</div>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Colors */}
        {activeSection === 'foundations-colors' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
              <Layers size={16} /> FOUNDATIONS
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Color System
            </h1>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: '32px' }}>
              Our color system uses a two-tier token hierarchy: <strong>Primitives</strong> (raw palette values) and <strong>Semantic Tokens</strong> (purpose-bound aliases that dynamically adapt to theme modes).
            </p>

            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Semantic Brand & Text Tokens</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '40px' }}>
              {colorTokens.filter((t) => t.isAlias || t.path.includes('brand') || t.path.includes('text')).map((token) => (
                <div key={token.id} className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      background: token.resolvedValue,
                      border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{token.path}</div>
                    <div style={{ fontSize: '12px', color: '#6ee7b7', fontFamily: 'monospace' }}>{token.resolvedValue}</div>
                    {token.isAlias && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Alias: {token.rawValue}</div>
                    )}
                  </div>
                  <button
                    onClick={() => copyToClipboard(`var(--${token.path.replace(/\./g, '-')})`, token.id)}
                    className="btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                  >
                    {copiedKey === token.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  </button>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Primitive Palette</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {colorTokens.filter((t) => !t.isAlias && !t.path.includes('brand') && !t.path.includes('text')).map((token) => (
                <div key={token.id} className="glass-panel" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: token.resolvedValue,
                      border: '1px solid rgba(255,255,255,0.2)',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '12px' }}>{token.name}</div>
                    <div style={{ fontSize: '11px', color: '#6ee7b7', fontFamily: 'monospace' }}>{token.resolvedValue}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Spacing */}
        {activeSection === 'foundations-spacing' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
              <Layers size={16} /> FOUNDATIONS
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Spacing & Grid Scale
            </h1>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: '32px' }}>
              Nova relies on an 8-point harmonic spacing scale with 4px half-steps for compact UI density. Never hardcode arbitrary pixel margins or paddings.
            </p>

            <div className="glass-panel" style={{ padding: '24px' }}>
              {spacingTokens.map((t) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: '140px', fontWeight: 700, fontSize: '14px' }}>{t.path}</div>
                  <div style={{ width: '80px', fontFamily: 'monospace', color: '#6ee7b7' }}>{t.resolvedValue}</div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <div
                      style={{
                        height: '16px',
                        width: t.resolvedValue,
                        background: '#6366f1',
                        borderRadius: '2px',
                        opacity: 0.9,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Border Radii */}
        {activeSection === 'foundations-radii' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
              <Layers size={16} /> FOUNDATIONS
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Border Radius & Shapes
            </h1>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: '32px' }}>
              Consistent corner curves convey hierarchy and tactile feedback across cards, inputs, buttons, and pill tags.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {radiusTokens.map((t) => (
                <div key={t.id} className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      border: '2px solid #06b6d4',
                      borderRadius: t.resolvedValue === '9999px' ? '50%' : t.resolvedValue,
                      margin: '0 auto 16px',
                      background: 'rgba(6, 182, 212, 0.1)',
                    }}
                  />
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: '#6ee7b7', fontFamily: 'monospace', marginTop: '4px' }}>{t.resolvedValue}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 5: Component - Button */}
        {activeSection === 'components-button' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
              <Box size={16} /> COMPONENTS
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Button Component
            </h1>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: '28px' }}>
              Buttons prompt users to take action and initiate key tasks. They feature high-contrast states, keyboard focus rings, and strict design token bindings.
            </p>

            {/* Interactive Sandbox */}
            <div className="glass-panel" style={{ padding: '28px', marginBottom: '36px' }}>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Variant:</span>
                  {(['primary', 'secondary', 'ghost'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setButtonVariant(v)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: buttonVariant === v ? '#6366f1' : 'transparent',
                        color: buttonVariant === v ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid',
                        borderColor: buttonVariant === v ? '#6366f1' : 'var(--border-subtle)',
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Size:</span>
                  {(['sm', 'md', 'lg'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setButtonSize(s)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: buttonSize === s ? '#6366f1' : 'transparent',
                        color: buttonSize === s ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid',
                        borderColor: buttonSize === s ? '#6366f1' : 'var(--border-subtle)',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: '#090d16', padding: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button
                  className={buttonVariant === 'primary' ? 'btn-primary' : buttonVariant === 'secondary' ? 'btn-secondary' : 'btn-ghost'}
                  style={{
                    padding: buttonSize === 'sm' ? '6px 12px' : buttonSize === 'lg' ? '12px 24px' : '10px 18px',
                    fontSize: buttonSize === 'sm' ? '12px' : buttonSize === 'lg' ? '16px' : '14px',
                  }}
                >
                  Interactive {buttonVariant} Button ({buttonSize})
                </button>
              </div>
            </div>

            {/* Code Snippet */}
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>Usage Example (React JSX)</h2>
            <pre style={{ background: '#090d16', padding: '16px', borderRadius: '8px', fontSize: '13px', fontFamily: 'monospace', color: '#a5b4fc', marginBottom: '32px' }}>
{`<Button variant="${buttonVariant}" size="${buttonSize}">
  Click Action
</Button>`}
            </pre>
          </div>
        )}

        {/* Section 6: AI Coding Agent / MCP Setup */}
        {activeSection === 'dev-mcp' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
              <Sparkles size={16} /> AI INTEGRATION
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Model Context Protocol (MCP) Setup
            </h1>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: '28px' }}>
              Give your AI coding assistant (Cursor, Claude Code, AGY) direct, live access to your design tokens, component specifications, and deterministic compliance linter.
            </p>

            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>Cursor / Claude Desktop Config</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Add NovaDesign's MCP server to your <code>claude_desktop_config.json</code> or <code>.cursor/mcp.json</code>:
            </p>

            <pre style={{ background: '#090d16', padding: '20px', borderRadius: '8px', fontSize: '13px', fontFamily: 'monospace', color: '#6ee7b7', marginBottom: '32px' }}>
{`{
  "mcpServers": {
    "novadesign": {
      "command": "node",
      "args": [
        "/Users/prudhviraj/Desktop/supernovaclone/node_modules/.bin/tsx",
        "/Users/prudhviraj/Desktop/supernovaclone/src/mcp/server.ts"
      ]
    }
  }
}`}
            </pre>

            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>Available Tools for AI Agents</h2>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <ul style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
                <li><code>get_tokens</code>: Fetch semantic tokens by category.</li>
                <li><code>list_components</code>: Inspect component props, variants, and dependencies.</li>
                <li><code>check_compliance</code>: Run deterministic design system linter on agent-written code.</li>
                <li><code>generate_code</code>: Produce CSS, TS, Swift, or Kotlin code artifacts.</li>
                <li><code>import_figma_variables</code>: Trigger Figma variable synchronization and diff.</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
