import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Supernova Studio | Design System Platform',
  description: 'Enterprise design system management, Figma variables sync, W3C DTCG tokens, multi-platform code generation, and automated GitHub delivery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
          {/* Supernova Studio Header */}
          <header
            style={{
              height: '50px',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-sidebar)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 20px',
              position: 'sticky',
              top: 0,
              zIndex: 50,
            }}
          >
            {/* Left: Brand + Workspace + Design System + Version */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Supernova Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '13px',
                    color: '#fff',
                  }}
                >
                  ✦
                </div>
                <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '-0.01em', color: '#fff' }}>
                  Supernova
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  STUDIO
                </span>
              </div>

              <div style={{ height: '14px', width: '1px', background: 'var(--border-subtle)', margin: '0 4px' }} />

              {/* Workspace Picker */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                }}
              >
                <span>Acme Corp</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>▾</span>
              </div>

              {/* Design System Picker */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                }}
              >
                <span>Core Design System</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>▾</span>
              </div>

              {/* Version Chip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  color: '#6ee7b7',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                <span>● Draft (Working)</span>
              </div>
            </div>

            {/* Right: Status + Docs Link + User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#3b82f6' }} />
                <span>MCP Server Active</span>
              </div>

              <a
                href="/docs"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '5px 12px',
                  borderRadius: '6px',
                  background: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#60a5fa',
                  textDecoration: 'none',
                }}
              >
                <span>Documentation</span>
                <span style={{ fontSize: '10px' }}>↗</span>
              </a>

              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#27272a',
                  border: '1px solid #3f3f46',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#e4e4e7',
                }}
              >
                AC
              </div>
            </div>
          </header>

          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
