import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NovaDesign Platform | AI-Native Design System & Continuous Delivery',
  description: 'Enterprise AI-native design system management, MCP context delivery, deterministic code generation, and automated GitHub continuous delivery.',
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
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="ambient-glow" />
        <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Top Enterprise Bar */}
          <header
            style={{
              height: '56px',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'rgba(6, 9, 19, 0.85)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              position: 'sticky',
              top: 0,
              zIndex: 50,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                    fontSize: '16px',
                    color: '#fff',
                    boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
                  }}
                >
                  ✦
                </div>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.02em' }}>
                    NovaDesign
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      marginLeft: '6px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    PLATFORM
                  </span>
                </div>
              </div>

              <div style={{ height: '16px', width: '1px', background: 'var(--border-subtle)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Workspace:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Acme Corp</span>
                <span style={{ color: 'var(--text-muted)' }}>/</span>
                <span style={{ fontWeight: 600, color: '#a5b4fc' }}>Core Web Platform</span>
                <span className="badge badge-indigo" style={{ fontSize: '11px', marginLeft: '4px' }}>
                  v1.2.0
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  color: '#6ee7b7',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 8px #10b981',
                  }}
                />
                PostgreSQL Synced
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  color: '#a5b4fc',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#6366f1',
                    boxShadow: '0 0 8px #6366f1',
                  }}
                />
                MCP Protocol Live
              </div>
            </div>
          </header>

          <main style={{ flex: 1 }}>{children}</main>

          <footer
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(6, 9, 19, 0.6)',
            }}
          >
            <div>NovaDesign Platform &bull; Continuous Delivery for Design Systems</div>
            <div>Model Context Protocol (MCP) &bull; W3C DTCG Format &bull; Deterministic Engine</div>
          </footer>
        </div>
      </body>
    </html>
  );
}
