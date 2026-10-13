import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nexus Design OS | Enterprise Design Token Engine & MCP Platform',
  description:
    'Autonomous design system platform: Figma variables synchronization, W3C DTCG tokens, multi-platform code generation, AST compliance, and Model Context Protocol (MCP) distribution.',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
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
      <body>{children}</body>
    </html>
  );
}
