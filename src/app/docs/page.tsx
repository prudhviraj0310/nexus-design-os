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
  CheckCircle2,
  FileCode,
  ArrowUpRight,
  ChevronDown,
  Play,
  Cpu,
  RefreshCw,
  FolderDown,
} from 'lucide-react';

export default function SupernovaDocumentationPortal() {
  const [activeSection, setActiveSection] = useState<string>('ai-contexts-101');
  const [tokens, setTokens] = useState<any[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Button interactive demo
  const [btnClicks, setBtnClicks] = useState<number>(0);
  const [btnVariant, setBtnVariant] = useState<'primary' | 'secondary' | 'outline'>('primary');

  // MCP test
  const [mcpPingRes, setMcpPingRes] = useState<any>(null);
  const [mcpTesting, setMcpTesting] = useState<boolean>(false);

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

  const handleTestMcpPing = async () => {
    setMcpTesting(true);
    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'get_tokens',
            arguments: { workspaceId: 'adcn', projectId: 'my-design-system' },
          },
        }),
      });
      const data = await res.json();
      setMcpPingRes(data);
    } catch (err) {
      setMcpPingRes({ error: String(err) });
    } finally {
      setMcpTesting(false);
    }
  };

  const colorTokens = tokens.filter((t) => t.category === 'color');
  const spacingTokens = tokens.filter((t) => t.category === 'dimension' || t.category === 'spacing');
  const typographyTokens = tokens.filter((t) => t.category === 'typography');

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans antialiased flex flex-col">
      {/* 1. TOP HEADER (Matching https://learn.supernova.io) */}
      <header className="h-14 bg-white border-b border-[#e2e8f0] px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-decoration-none group">
            <div className="w-7 h-7 rounded-md bg-[#2563eb] text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:bg-[#1d4ed8] transition-colors">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#0f172a] tracking-tight">Supernova Learn</span>
              <span className="text-[10px] text-[#64748b]">Shared draft &bull; v1.3.0</span>
            </div>
          </Link>

          {/* Top Horizontal Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-[#475569]">
            <span className="cursor-pointer hover:text-[#0f172a]">Welcome</span>
            <span className="cursor-pointer hover:text-[#0f172a]">Design systems</span>
            <span className="text-[#2563eb] font-semibold border-b-2 border-[#2563eb] py-4">AI</span>
            <span className="cursor-pointer hover:text-[#0f172a]">Documentation</span>
            <span className="cursor-pointer hover:text-[#0f172a]">Automation</span>
            <span className="cursor-pointer hover:text-[#0f172a]">Releases</span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155] rounded-md text-xs font-semibold transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Open Studio</span>
          </Link>
          <a
            href="https://app.supernova.io"
            target="_blank"
            className="btn-primary text-xs py-1.5 px-3"
          >
            <span>Get started for free</span>
          </a>
        </div>
      </header>

      {/* 2. BODY LAYOUT (Sidebar Left + Content Right) */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-64 flex-shrink-0 bg-white border-r border-[#e2e8f0] p-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Search Box */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Search documentation..."
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] pl-8 pr-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            {/* Tree Categories */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                  AI & Agent Contexts
                </div>
                <div className="space-y-0.5 mt-1">
                  <button
                    onClick={() => setActiveSection('ai-contexts-101')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      activeSection === 'ai-contexts-101'
                        ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                        : 'text-[#475569] hover:bg-[#f8fafc]'
                    }`}
                  >
                    Contexts 101
                  </button>

                  <button
                    onClick={() => setActiveSection('ai-mcp-101')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      activeSection === 'ai-mcp-101'
                        ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                        : 'text-[#475569] hover:bg-[#f8fafc]'
                    }`}
                  >
                    Model Context Protocol (MCP)
                  </button>

                  <button
                    onClick={() => setActiveSection('ai-feedback')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      activeSection === 'ai-feedback'
                        ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                        : 'text-[#475569] hover:bg-[#f8fafc]'
                    }`}
                  >
                    Feedback & Adoption
                  </button>
                </div>
              </div>

              <div>
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                  Design Foundations
                </div>
                <div className="space-y-0.5 mt-1">
                  <button
                    onClick={() => setActiveSection('tokens-colors')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      activeSection === 'tokens-colors'
                        ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                        : 'text-[#475569] hover:bg-[#f8fafc]'
                    }`}
                  >
                    Color Tokens & Scales
                  </button>

                  <button
                    onClick={() => setActiveSection('tokens-dimensions')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      activeSection === 'tokens-dimensions'
                        ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                        : 'text-[#475569] hover:bg-[#f8fafc]'
                    }`}
                  >
                    Spacing & Dimensions
                  </button>
                </div>
              </div>

              <div>
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                  Components
                </div>
                <div className="space-y-0.5 mt-1">
                  <button
                    onClick={() => setActiveSection('components-library')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      activeSection === 'components-library'
                        ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                        : 'text-[#475569] hover:bg-[#f8fafc]'
                    }`}
                  >
                    Component Library
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#f1f5f9] text-[11px] text-[#64748b]">
            Powered by Supernova Platform &bull; 2026
          </div>
        </aside>

        {/* MAIN DOCUMENTATION CONTENT */}
        <main className="flex-1 p-8 overflow-y-auto max-w-4xl">
          {/* SECTION: CONTEXTS 101 (Authentic article from Supernova) */}
          {activeSection === 'ai-contexts-101' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-8 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">AI &bull; Contexts</span>
                <h1 className="text-2xl font-bold text-[#0f172a] mt-1">Contexts 101</h1>
                <p className="text-sm text-[#475569] mt-2 leading-relaxed">
                  Manage and distribute organizational knowledge across AI tools, workflows, and teams.
                </p>
              </div>

              {/* What are contexts? */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-3">
                <h2 className="text-base font-bold text-[#0f172a]">What are contexts?</h2>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Contexts are reusable units of knowledge that provide guidance, instructions, documentation, and organizational expertise to humans and AI systems.
                </p>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Your contexts act as the source of truth for information that needs to be shared consistently across multiple destinations.
                </p>

                <div className="pt-2">
                  <strong className="text-xs font-semibold text-[#0f172a]">A context can contain:</strong>
                  <ul className="list-disc list-inside text-xs text-[#475569] mt-1.5 space-y-1">
                    <li>Product documentation</li>
                    <li>Engineering standards</li>
                    <li>Design guidelines</li>
                    <li>Team processes</li>
                    <li>Domain knowledge</li>
                    <li>Operating procedures</li>
                    <li>Custom instructions</li>
                  </ul>
                </div>
              </div>

              {/* Why use contexts? */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-3">
                <h2 className="text-base font-bold text-[#0f172a]">Why use contexts?</h2>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Teams often duplicate the same knowledge across documentation, prompts, AI assistants, and internal tools. Contexts solve this by allowing teams to maintain information once and distribute it everywhere it is needed. Contexts allow you to:
                </p>
                <ul className="list-disc list-inside text-xs text-[#475569] space-y-1">
                  <li>Keep information consistent and reduce duplication across tools</li>
                  <li>Maintain knowledge and instructions more easily</li>
                  <li>Improve the quality of AI responses</li>
                  <li>Control the distribution of knowledge to appropriate teams</li>
                </ul>
              </div>

              {/* Types of Contexts Table (Extracted verbatim from Supernova official documentation) */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-[#0f172a]">Types of Contexts</h2>
                <p className="text-xs text-[#475569]">
                  Supernova supports two main context tiers: Design system context and Workspace context.
                </p>

                <div className="overflow-x-auto border border-[#e2e8f0] rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] font-semibold">
                        <th className="py-2.5 px-4">Content Type</th>
                        <th className="py-2.5 px-4">Design System Context</th>
                        <th className="py-2.5 px-4">Workspace Context</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9] text-[#334155]">
                      <tr>
                        <td className="py-2.5 px-4 font-medium">Documentation pages</td>
                        <td className="py-2.5 px-4 text-[#10b981] font-semibold">Yes</td>
                        <td className="py-2.5 px-4 text-[#94a3b8]">—</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-medium">Design tokens</td>
                        <td className="py-2.5 px-4 text-[#10b981] font-semibold">Yes</td>
                        <td className="py-2.5 px-4 text-[#94a3b8]">—</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-medium">Token themes</td>
                        <td className="py-2.5 px-4 text-[#10b981] font-semibold">Yes</td>
                        <td className="py-2.5 px-4 text-[#94a3b8]">—</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-medium">Assets</td>
                        <td className="py-2.5 px-4 text-[#10b981] font-semibold">Yes</td>
                        <td className="py-2.5 px-4 text-[#94a3b8]">—</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-medium">Code components</td>
                        <td className="py-2.5 px-4 text-[#10b981] font-semibold">Yes</td>
                        <td className="py-2.5 px-4 text-[#94a3b8]">—</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-medium">Files and Agent skills</td>
                        <td className="py-2.5 px-4 text-[#10b981] font-semibold">Yes</td>
                        <td className="py-2.5 px-4 text-[#10b981] font-semibold">Yes</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Distribution & MCP Test Widget */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#0f172a]">Live MCP Distribution Endpoint</h2>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#ecfdf5] text-[#059669] rounded-full">
                    Production Ready
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="https://mcp.supernova.io/mcp/c/350527-my-design-system"
                    className="flex-1 bg-[#f8fafc] border border-[#cbd5e1] px-3 py-2 rounded-lg text-xs font-mono text-[#0f172a]"
                  />
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'https://mcp.supernova.io/mcp/c/350527-my-design-system',
                        'doc_mcp_url'
                      )
                    }
                    className="btn-secondary text-xs"
                  >
                    {copiedKey === 'doc_mcp_url' ? <Check size={14} className="text-[#10b981]" /> : <Copy size={14} />}
                    <span>{copiedKey === 'doc_mcp_url' ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleTestMcpPing}
                    disabled={mcpTesting}
                    className="btn-primary text-xs"
                  >
                    {mcpTesting ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
                    <span>{mcpTesting ? 'Testing...' : 'Test Endpoint'}</span>
                  </button>
                </div>

                {mcpPingRes && (
                  <div className="p-3 bg-[#0f172a] text-[#f8fafc] rounded-lg text-[11px] font-mono overflow-x-auto max-h-48">
                    <pre>{JSON.stringify(mcpPingRes, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION: COLOR TOKENS */}
          {activeSection === 'tokens-colors' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
                <h1 className="text-xl font-bold text-[#0f172a]">Color System & Semantic Tokens</h1>
                <p className="text-xs text-[#475569] mt-1">
                  Our color system maintains strict semantic separation between base scales and functional theme aliases.
                </p>
              </div>

              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
                  Registered Color Tokens ({colorTokens.length})
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  {colorTokens.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-md border border-[#cbd5e1] shadow-xs"
                          style={{ backgroundColor: t.resolvedValue || t.rawValue }}
                        />
                        <div>
                          <div className="text-xs font-mono font-bold text-[#0f172a]">{t.path}</div>
                          <div className="text-[11px] font-mono text-[#2563eb]">{t.resolvedValue || t.rawValue}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => copyToClipboard(`var(--${t.path.replace(/\./g, '-')})`, t.id)}
                        className="btn-secondary text-xs p-1.5"
                      >
                        {copiedKey === t.id ? <Check size={12} className="text-[#10b981]" /> : <Copy size={12} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: SPACING & DIMENSIONS */}
          {activeSection === 'tokens-dimensions' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
                <h1 className="text-xl font-bold text-[#0f172a]">Spacing & Dimension Scale</h1>
                <p className="text-xs text-[#475569] mt-1">
                  Built on a strict 4px/8px modular geometry for consistent layouts across platforms.
                </p>
              </div>

              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
                  Dimension Tokens ({spacingTokens.length})
                </h2>

                <div className="space-y-2">
                  {spacingTokens.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-mono font-bold text-[#0f172a]">{t.path}</div>
                        <div className="text-[11px] font-mono text-[#64748b]">{t.rawValue}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-4 bg-[#2563eb] rounded-xs"
                          style={{ width: `${Math.min(parseInt(t.rawValue) || 16, 120)}px` }}
                        />
                        <button
                          onClick={() => copyToClipboard(`var(--${t.path.replace(/\./g, '-')})`, t.id)}
                          className="btn-secondary text-xs p-1.5"
                        >
                          {copiedKey === t.id ? <Check size={12} className="text-[#10b981]" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: COMPONENT LIBRARY */}
          {activeSection === 'components-library' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
                <h1 className="text-xl font-bold text-[#0f172a]">Component Library</h1>
                <p className="text-xs text-[#475569] mt-1">
                  Living component implementations styled with Supernova token primitives.
                </p>
              </div>

              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-[#0f172a]">Interactive Button</h2>
                <div className="p-8 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg flex items-center justify-center gap-4">
                  <button
                    onClick={() => setBtnClicks((c) => c + 1)}
                    className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                  >
                    Primary Button ({btnClicks} clicks)
                  </button>

                  <button
                    onClick={() => setBtnClicks((c) => c + 1)}
                    className="px-4 py-2 bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] text-[#0f172a] rounded-lg text-xs font-semibold shadow-xs transition-all"
                  >
                    Secondary Button
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: MCP SETUP GUIDE */}
          {activeSection === 'ai-mcp-101' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
                <h1 className="text-xl font-bold text-[#0f172a]">Connecting Model Context Protocol (MCP)</h1>
                <p className="text-xs text-[#475569] mt-1">
                  Connect Supernova directly to Cursor, Claude Code, Codex, and Windsurf to feed live design tokens to AI coding agents.
                </p>
              </div>

              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-3">
                <h2 className="text-sm font-bold text-[#0f172a]">Cursor Configuration (.cursor/mcp.json)</h2>
                <div className="p-3 bg-[#0f172a] text-[#f8fafc] rounded-lg text-xs font-mono">
                  <pre>{`{
  "mcpServers": {
    "supernova": {
      "url": "https://mcp.supernova.io/mcp/c/350527-my-design-system",
      "transport": "sse"
    }
  }
}`}</pre>
                </div>
              </div>

              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-3">
                <h2 className="text-sm font-bold text-[#0f172a]">Claude Code CLI Connection</h2>
                <div className="p-3 bg-[#0f172a] text-[#f8fafc] rounded-lg text-xs font-mono">
                  <pre>claude mcp add supernova -- sse https://mcp.supernova.io/mcp/c/350527-my-design-system</pre>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
