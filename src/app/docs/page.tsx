'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Play,
  Cpu,
  RefreshCw,
  FolderDown,
  Sliders,
  Eye,
  Code2,
  Tag,
  AlertTriangle,
  Monitor,
  Smartphone,
  GitPullRequest,
  CheckSquare,
  SlidersHorizontal,
  Info,
  Maximize2,
  X,
} from 'lucide-react';

export default function NexusDocumentationPortal() {
  // Navigation & Active Section
  const [activeSection, setActiveSection] = useState<string>('welcome');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Framework preference for code snippets
  const [codeFramework, setCodeFramework] = useState<'css' | 'tailwind' | 'typescript' | 'swift' | 'kotlin'>('css');

  // Loaded data from database
  const [tokens, setTokens] = useState<any[]>([]);
  const [componentsList, setComponentsList] = useState<any[]>([]);
  const [assetsList, setAssetsList] = useState<any[]>([]);
  const [releasesList, setReleasesList] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Component Sandbox Controls
  const [selectedCompId, setSelectedCompId] = useState<string>('comp-button');
  const [btnVariant, setBtnVariant] = useState<'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'>('primary');
  const [btnSize, setBtnSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
  const [btnClicks, setBtnClicks] = useState<number>(0);

  const [inputVal, setInputVal] = useState<string>('engineering@nexus-design.io');
  const [badgeTone, setBadgeTone] = useState<'neutral' | 'success' | 'warning' | 'critical' | 'indigo'>('success');
  const [cardVariant, setCardVariant] = useState<'elevated' | 'outlined' | 'ghost'>('elevated');
  const [switchChecked, setSwitchChecked] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // Storybook embed toggle
  const [showStorybookEmbed, setShowStorybookEmbed] = useState<boolean>(false);
  const [storybookUrl, setStorybookUrl] = useState<string>('https://storybook.js.org');

  // MCP Test Widget
  const [mcpPingRes, setMcpPingRes] = useState<any>(null);
  const [mcpTesting, setMcpTesting] = useState<boolean>(false);

  // Typography interactive specimen text
  const [typographySample, setTypographySample] = useState<string>('The quick brown fox jumps over the lazy dog');

  // Load all data on mount
  useEffect(() => {
    async function loadAll() {
      try {
        const [tokRes, compRes, assetRes, relRes] = await Promise.all([
          fetch('/api/tokens').then((r) => r.json()),
          fetch('/api/components').then((r) => r.json()),
          fetch('/api/assets').then((r) => r.json()),
          fetch('/api/releases').then((r) => r.json()),
        ]);

        if (tokRes.tokens) setTokens(tokRes.tokens);
        if (compRes.components) setComponentsList(compRes.components);
        if (assetRes.assets) setAssetsList(assetRes.assets);
        if (relRes.releases) setReleasesList(relRes.releases);
      } catch (err) {
        console.error('Failed to load portal data:', err);
      } finally {
        setLoadingData(false);
      }
    }
    loadAll();
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Convert token path to selected code framework snippet
  const getTokenSnippet = (token: any, framework: string): string => {
    const cssVar = `var(--nexus-${token.path.replace(/\./g, '-')})`;
    if (framework === 'css') return cssVar;
    if (framework === 'tailwind') {
      if (token.category === 'color') return `bg-[${cssVar}] text-[${cssVar}]`;
      if (token.category === 'spacing') return `p-[${cssVar}] m-[${cssVar}]`;
      if (token.category === 'borderRadius') return `rounded-[${cssVar}]`;
      return `[${cssVar}]`;
    }
    if (framework === 'typescript') {
      return `tokens.${token.path}`;
    }
    if (framework === 'swift') {
      const parts = token.path.split('.');
      const pascal = parts.map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
      return `Tokens.${pascal}`;
    }
    if (framework === 'kotlin') {
      const parts = token.path.split('.');
      const pascal = parts.map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
      return `DesignTokens.${pascal}`;
    }
    return cssVar;
  };

  /** Calculates WCAG 2.1 relative luminance and contrast ratio against white (#ffffff) */
  const getContrastRatioOnWhite = (hexColor: string): { ratio: number; label: string; passAA: boolean } => {
    if (!hexColor || !hexColor.startsWith('#')) return { ratio: 1, label: 'N/A', passAA: false };
    let hex = hexColor.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    if (hex.length < 6) return { ratio: 1, label: 'N/A', passAA: false };

    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    const ratio = Math.round((1.05 / (L + 0.05)) * 10) / 10;
    const passAA = ratio >= 4.5;
    const label = `${ratio}:1 on white ${ratio >= 7 ? '(AAA)' : ratio >= 4.5 ? '(AA)' : '(Fail)'}`;
    return { ratio, label, passAA };
  };

  const [mcpApiKey, setMcpApiKey] = useState<string>('');

  const handleTestMcpPing = async () => {
    setMcpTesting(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (mcpApiKey.trim()) {
        headers['Authorization'] = `Bearer ${mcpApiKey.trim()}`;
      }

      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'get_tokens',
            arguments: { workspaceId: 'ws-acme-corp', projectId: 'proj-core-web' },
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

  // Filtered Tokens
  const filteredTokens = useMemo(() => {
    if (!searchQuery) return tokens;
    const q = searchQuery.toLowerCase();
    return tokens.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.path.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.resolvedValue && t.resolvedValue.toLowerCase().includes(q))
    );
  }, [tokens, searchQuery]);

  // Token subsets
  const colorTokens = filteredTokens.filter((t) => t.category === 'color');
  const spacingTokens = filteredTokens.filter((t) => t.category === 'spacing' || t.category === 'dimension');
  const typographyTokens = filteredTokens.filter((t) => t.category === 'typography' || t.category === 'fontFamily');
  const radiusTokens = filteredTokens.filter((t) => t.category === 'borderRadius');

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    if (!searchQuery) return assetsList;
    const q = searchQuery.toLowerCase();
    return assetsList.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (Array.isArray(a.tags) && a.tags.some((tag: string) => tag.toLowerCase().includes(q)))
    );
  }, [assetsList, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans antialiased flex flex-col">
      {/* 1. TOP HEADER */}
      <header className="h-14 bg-white border-b border-[#e2e8f0] px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 text-decoration-none group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#2563eb] to-[#4f46e5] text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
              N
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0f172a] tracking-tight">Nexus Design OS</span>
                <span className="px-1.5 py-0.2 bg-[#eff6ff] text-[#2563eb] text-[10px] font-semibold rounded-md border border-[#bfdbfe]">
                  Docs Portal
                </span>
              </div>
              <span className="text-[10px] text-[#64748b]">v1.3.0 · Production Ready</span>
            </div>
          </Link>

          {/* Top Horizontal Nav */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-[#475569]">
            <button
              onClick={() => setActiveSection('welcome')}
              className={`transition-colors py-4 border-b-2 ${
                activeSection === 'welcome'
                  ? 'text-[#2563eb] border-[#2563eb] font-semibold'
                  : 'border-transparent hover:text-[#0f172a]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSection('tokens-colors')}
              className={`transition-colors py-4 border-b-2 ${
                activeSection.startsWith('tokens-')
                  ? 'text-[#2563eb] border-[#2563eb] font-semibold'
                  : 'border-transparent hover:text-[#0f172a]'
              }`}
            >
              Foundations
            </button>
            <button
              onClick={() => setActiveSection('components-library')}
              className={`transition-colors py-4 border-b-2 ${
                activeSection === 'components-library'
                  ? 'text-[#2563eb] border-[#2563eb] font-semibold'
                  : 'border-transparent hover:text-[#0f172a]'
              }`}
            >
              Components & Storybook
            </button>
            <button
              onClick={() => setActiveSection('assets-icons')}
              className={`transition-colors py-4 border-b-2 ${
                activeSection === 'assets-icons'
                  ? 'text-[#2563eb] border-[#2563eb] font-semibold'
                  : 'border-transparent hover:text-[#0f172a]'
              }`}
            >
              Vector Assets
            </button>
            <button
              onClick={() => setActiveSection('ai-mcp-101')}
              className={`transition-colors py-4 border-b-2 ${
                activeSection.startsWith('ai-')
                  ? 'text-[#2563eb] border-[#2563eb] font-semibold'
                  : 'border-transparent hover:text-[#0f172a]'
              }`}
            >
              AI & MCP
            </button>
            <button
              onClick={() => setActiveSection('releases-changelog')}
              className={`transition-colors py-4 border-b-2 ${
                activeSection === 'releases-changelog'
                  ? 'text-[#2563eb] border-[#2563eb] font-semibold'
                  : 'border-transparent hover:text-[#0f172a]'
              }`}
            >
              Releases
            </button>
          </nav>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-3">
          {/* Framework Snippet Preference */}
          <div className="hidden sm:flex items-center bg-[#f1f5f9] p-0.5 rounded-lg border border-[#e2e8f0]">
            <span className="text-[10px] font-semibold text-[#64748b] px-2">Stack:</span>
            {(['css', 'tailwind', 'typescript', 'swift', 'kotlin'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setCodeFramework(fmt)}
                className={`px-2 py-1 text-[10px] rounded-md font-semibold uppercase tracking-wider transition-colors ${
                  codeFramework === fmt ? 'bg-white text-[#2563eb] shadow-xs' : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                {fmt === 'typescript' ? 'TS' : fmt}
              </button>
            ))}
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eff6ff] hover:bg-[#dbeafe] text-[#2563eb] rounded-lg text-xs font-semibold border border-[#bfdbfe] transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Launch Studio</span>
          </Link>
        </div>
      </header>

      {/* 2. BODY LAYOUT */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-64 flex-shrink-0 bg-white border-r border-[#e2e8f0] p-4 flex flex-col justify-between sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <div className="space-y-4">
            {/* Search Box */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-[#94a3b8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tokens, components..."
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] pl-8 pr-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-[#2563eb] placeholder-[#94a3b8]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-[#94a3b8] hover:text-[#0f172a]"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Nav Menu */}
            <div className="space-y-4 text-xs">
              {/* Getting Started */}
              <div>
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                  Getting Started
                </div>
                <div className="space-y-0.5 mt-1">
                  <button
                    onClick={() => setActiveSection('welcome')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      activeSection === 'welcome'
                        ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                        : 'text-[#475569] hover:bg-[#f8fafc]'
                    }`}
                  >
                    Welcome to Nexus
                  </button>
                  <button
                    onClick={() => setActiveSection('architecture')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      activeSection === 'architecture'
                        ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                        : 'text-[#475569] hover:bg-[#f8fafc]'
                    }`}
                  >
                    Architecture & Pipeline
                  </button>
                </div>
              </div>

              {/* Design Foundations */}
              <div>
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                  Design Foundations
                </div>
                <div className="space-y-0.5 mt-1">
                  <button
                    onClick={() => setActiveSection('tokens-colors')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md font-medium transition-colors flex items-center justify-between ${
                      activeSection === 'tokens-colors'
                        ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                        : 'text-[#475569] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <span>Color Tokens & Themes</span>
                    <span className="text-[10px] text-[#94a3b8]">{colorTokens.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('tokens-dimensions')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md font-medium transition-colors flex items-center justify-between ${
                      activeSection === 'tokens-dimensions'
                        ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                        : 'text-[#475569] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <span>Spacing & Dimensions</span>
                    <span className="text-[10px] text-[#94a3b8]">{spacingTokens.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('tokens-typography')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md font-medium transition-colors flex items-center justify-between ${
                      activeSection === 'tokens-typography'
                        ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                        : 'text-[#475569] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <span>Typography Scale</span>
                    <span className="text-[10px] text-[#94a3b8]">{typographyTokens.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('tokens-radii')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md font-medium transition-colors flex items-center justify-between ${
                      activeSection === 'tokens-radii'
                        ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                        : 'text-[#475569] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <span>Border Radii & Geometry</span>
                    <span className="text-[10px] text-[#94a3b8]">{radiusTokens.length}</span>
                  </button>
                </div>
              </div>

              {/* Components */}
              <div>
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                  Component System
                </div>
                <div className="space-y-0.5 mt-1">
                  <button
                    onClick={() => setActiveSection('components-library')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md font-medium transition-colors flex items-center justify-between ${
                      activeSection === 'components-library'
                        ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                        : 'text-[#475569] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <span>Interactive Sandbox</span>
                    <span className="text-[10px] text-[#94a3b8]">{componentsList.length}</span>
                  </button>
                </div>
              </div>

              {/* Assets & Icons */}
              <div>
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                  Vector Assets
                </div>
                <div className="space-y-0.5 mt-1">
                  <button
                    onClick={() => setActiveSection('assets-icons')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md font-medium transition-colors flex items-center justify-between ${
                      activeSection === 'assets-icons'
                        ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                        : 'text-[#475569] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <span>Icon Library (SVG)</span>
                    <span className="text-[10px] text-[#94a3b8]">{assetsList.length}</span>
                  </button>
                </div>
              </div>

              {/* AI & MCP */}
              <div>
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                  AI & Developer Context
                </div>
                <div className="space-y-0.5 mt-1">
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
                    onClick={() => setActiveSection('automation-delivery')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      activeSection === 'automation-delivery'
                        ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                        : 'text-[#475569] hover:bg-[#f8fafc]'
                    }`}
                  >
                    Idempotent Git Pipelines
                  </button>
                </div>
              </div>

              {/* Releases */}
              <div>
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                  Releases
                </div>
                <div className="space-y-0.5 mt-1">
                  <button
                    onClick={() => setActiveSection('releases-changelog')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      activeSection === 'releases-changelog'
                        ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                        : 'text-[#475569] hover:bg-[#f8fafc]'
                    }`}
                  >
                    Version History & Changelog
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#f1f5f9] text-[11px] text-[#64748b] space-y-1">
            <div className="font-semibold text-[#0f172a]">Nexus Design OS</div>
            <div>Self-Hosted · Data Sovereign</div>
          </div>
        </aside>

        {/* MAIN DOCUMENTATION CONTENT */}
        <main className="flex-1 p-8 overflow-y-auto max-w-4xl">
          {/* SECTION: WELCOME */}
          {activeSection === 'welcome' && (
            <div className="space-y-8">
              {/* Header Hero */}
              <div className="bg-gradient-to-br from-white to-[#f1f5f9] border border-[#e2e8f0] rounded-2xl p-8 shadow-sm">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#eff6ff] text-[#2563eb] rounded-full text-xs font-semibold mb-3 border border-[#bfdbfe]">
                  <Sparkles size={13} />
                  <span>The Self-Hosted Alternative to Supernova</span>
                </div>
                <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">
                  Design-System Automation & AI Context Platform
                </h1>
                <p className="text-sm text-[#475569] mt-3 leading-relaxed max-w-2xl">
                  Nexus Design OS connects your Figma designs, code repositories, and AI coding assistants through one
                  centralized source of truth. Manage design tokens, preview real-time visual diffs, deliver
                  pull requests idempotently to GitHub, and ground AI coding tools via Model Context Protocol.
                </p>

                <div className="flex items-center gap-3 mt-6">
                  <button
                    onClick={() => setActiveSection('tokens-colors')}
                    className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span>Explore Foundations</span>
                    <ArrowRight size={13} />
                  </button>
                  <button
                    onClick={() => setActiveSection('ai-mcp-101')}
                    className="px-4 py-2 bg-white border border-[#cbd5e1] hover:bg-[#f8fafc] text-[#0f172a] rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Cpu size={13} className="text-[#2563eb]" />
                    <span>Setup MCP in Cursor</span>
                  </button>
                </div>
              </div>

              {/* The 4 Core Product Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-xs space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center font-bold">
                    <Layers size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-[#0f172a]">Manage Tokens & Assets</h3>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    W3C DTCG-compliant token engine supporting alias graph resolution, light/dark modes, and SVG vector
                    assets.
                  </p>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-xs space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] text-[#059669] flex items-center justify-center font-bold">
                    <BookOpen size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-[#0f172a]">Living Documentation</h3>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    Documentation connected directly to design data, with interactive component sandboxes and Storybook
                    integration.
                  </p>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-xs space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#f5f3ff] text-[#7c3aed] flex items-center justify-center font-bold">
                    <GitPullRequest size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-[#0f172a]">Idempotent Deliveries</h3>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    Automated GitHub pipelines with zero-diff no-op detection and single-branch PR reuse to eliminate Git
                    spam.
                  </p>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-xs space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#fff7ed] text-[#ea580c] flex items-center justify-center font-bold">
                    <Cpu size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-[#0f172a]">AI Context (MCP)</h3>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    JSON-RPC 2.0 Model Context Protocol server giving AI agents direct access to authenticated design
                    tokens.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: ARCHITECTURE */}
          {activeSection === 'architecture' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Architecture</span>
                <h1 className="text-2xl font-bold text-[#0f172a] mt-1">Design-to-Code Pipeline</h1>
                <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                  Nexus automates the complete lifecycle from Figma canvas extraction to multi-platform code generation
                  and Git delivery.
                </p>
              </div>

              <div className="bg-[#0f172a] text-[#f8fafc] rounded-xl p-6 font-mono text-xs overflow-x-auto leading-relaxed shadow-sm">
                <pre>{`[FIGMA CANVAS / VARIABLES]
         │ (Figma REST API + Depth-6 Fallback Scraper)
         ▼
[DTCG TOKEN NORMALIZATION]
         │ (W3C Standard $value, $type, description)
         ▼
[ALIAS GRAPH RESOLUTION & DIFF DETECTOR]
         │ (Cycle detection & pre-sync visual diff)
         ├────────────────────────────────────────┐
         ▼                                        ▼
[LIVING PORTAL & AI MCP]               [MULTI-PLATFORM EXPORTERS]
 • /docs interactive swatches           • CSS Custom Properties
 • Model Context Protocol JSON-RPC      • Tailwind CSS v4 Theme
 • Component sandbox                    • TypeScript Typed Constants
                                        • Swift / SwiftUI Color/CGFloat
                                        • Kotlin / Compose Color/Dp
                                                 │
                                                 ▼
                                        [GITHUB APP ENGINE]
                                         • RS256 JWT Authentication
                                         • Base branch diff check (No-Op)
                                         • Reuses open PR on nexus/tokens-sync`}</pre>
              </div>
            </div>
          )}

          {/* SECTION: COLOR TOKENS */}
          {activeSection === 'tokens-colors' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-[#0f172a]">Color System & Semantic Themes</h1>
                  <p className="text-xs text-[#475569] mt-1">
                    Strict separation between primitive palettes and semantic theme aliases with light/dark support.
                  </p>
                </div>
                <div className="text-xs font-semibold text-[#2563eb] bg-[#eff6ff] px-2.5 py-1 rounded-md border border-[#bfdbfe]">
                  Active Stack: {codeFramework.toUpperCase()}
                </div>
              </div>

              {/* Color Swatches Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {colorTokens.map((t) => {
                  const snippet = getTokenSnippet(t, codeFramework);
                  return (
                    <div
                      key={t.id}
                      className="p-3.5 bg-white border border-[#e2e8f0] rounded-xl flex items-center justify-between shadow-xs hover:border-[#cbd5e1] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg border border-[#cbd5e1] shadow-xs flex-shrink-0"
                          style={{ backgroundColor: t.resolvedValue || t.rawValue }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-mono font-bold text-[#0f172a] truncate">{t.path}</div>
                          <div className="text-[11px] font-mono text-[#2563eb] font-semibold">
                            {t.resolvedValue || t.rawValue}
                          </div>
                          {(() => {
                            const val = t.resolvedValue || t.rawValue;
                            const contrast = getContrastRatioOnWhite(val);
                            return (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span
                                  className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                                    contrast.ratio >= 4.5
                                      ? 'bg-[#ecfdf5] text-[#059669]'
                                      : 'bg-[#fff1f2] text-[#e11d48]'
                                  }`}
                                >
                                  WCAG {contrast.label}
                                </span>
                              </div>
                            );
                          })()}
                          {t.isAlias && (
                            <span className="text-[9px] text-[#059669] font-mono bg-[#ecfdf5] px-1 py-0.2 rounded mt-0.5 inline-block">
                              alias ➔ {t.aliasTarget}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => copyToClipboard(snippet, t.id)}
                        className="btn-secondary text-xs p-1.5 flex items-center gap-1"
                        title={`Copy ${codeFramework.toUpperCase()} snippet`}
                      >
                        {copiedKey === t.id ? <Check size={12} className="text-[#10b981]" /> : <Copy size={12} />}
                        <span className="text-[10px] hidden sm:inline">
                          {copiedKey === t.id ? 'Copied' : 'Copy'}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION: SPACING & DIMENSIONS */}
          {activeSection === 'tokens-dimensions' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
                <h1 className="text-xl font-bold text-[#0f172a]">Spacing & Dimension Scale</h1>
                <p className="text-xs text-[#475569] mt-1">
                  Built on a strict 4px/8px modular geometry for consistent layouts across Web, iOS, and Android.
                </p>
              </div>

              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-3">
                {spacingTokens.map((t) => {
                  const pxValue = parseInt(t.rawValue) || 16;
                  const snippet = getTokenSnippet(t, codeFramework);
                  return (
                    <div
                      key={t.id}
                      className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-mono font-bold text-[#0f172a]">{t.path}</div>
                        <div className="text-[11px] font-mono text-[#64748b]">{t.rawValue}</div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Visual scale bar */}
                        <div
                          className="h-4 bg-[#2563eb] rounded-xs transition-all"
                          style={{ width: `${Math.min(pxValue * 3, 160)}px` }}
                        />
                        <button
                          onClick={() => copyToClipboard(snippet, t.id)}
                          className="btn-secondary text-xs p-1.5 flex items-center gap-1"
                        >
                          {copiedKey === t.id ? <Check size={12} className="text-[#10b981]" /> : <Copy size={12} />}
                          <span className="text-[10px]">{copiedKey === t.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION: TYPOGRAPHY */}
          {activeSection === 'tokens-typography' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
                <h1 className="text-xl font-bold text-[#0f172a]">Typography Scale & Fonts</h1>
                <p className="text-xs text-[#475569] mt-1">
                  Font families, modular weights, and readable specimens.
                </p>
              </div>

              {/* Interactive Specimen Box */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#475569] block mb-1">Interactive Specimen Text</label>
                  <input
                    type="text"
                    value={typographySample}
                    onChange={(e) => setTypographySample(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-2 rounded-lg text-xs font-sans focus:outline-none focus:border-[#2563eb]"
                  />
                </div>

                <div className="space-y-4 pt-2 border-t border-[#f1f5f9]">
                  <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                    <div className="text-[10px] font-mono text-[#64748b] mb-1">fontFamily.sans (Inter, sans-serif)</div>
                    <div className="text-xl font-bold text-[#0f172a] font-sans">{typographySample}</div>
                  </div>

                  <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                    <div className="text-[10px] font-mono text-[#64748b] mb-1">fontFamily.mono (JetBrains Mono)</div>
                    <div className="text-base font-semibold text-[#0f172a] font-mono">{typographySample}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: BORDER RADII */}
          {activeSection === 'tokens-radii' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
                <h1 className="text-xl font-bold text-[#0f172a]">Border Radii & Geometry</h1>
                <p className="text-xs text-[#475569] mt-1">Corner curvature scales from micro-controls to pill buttons.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {radiusTokens.map((t) => {
                  const snippet = getTokenSnippet(t, codeFramework);
                  return (
                    <div
                      key={t.id}
                      className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-xs flex flex-col items-center text-center space-y-3"
                    >
                      <div
                        className="w-16 h-16 bg-[#eff6ff] border-2 border-[#2563eb]"
                        style={{ borderRadius: t.resolvedValue || t.rawValue }}
                      />
                      <div>
                        <div className="text-xs font-mono font-bold text-[#0f172a]">{t.path}</div>
                        <div className="text-[11px] font-mono text-[#64748b]">{t.rawValue}</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(snippet, t.id)}
                        className="btn-secondary text-xs py-1 px-2.5 w-full flex items-center justify-center gap-1"
                      >
                        {copiedKey === t.id ? <Check size={12} className="text-[#10b981]" /> : <Copy size={12} />}
                        <span className="text-[10px]">{copiedKey === t.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION: LIVING COMPONENT SANDBOX */}
          {activeSection === 'components-library' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-[#0f172a]">Interactive Component Sandbox</h1>
                  <p className="text-xs text-[#475569] mt-1">
                    Living React component implementations wired to genuine design token primitives.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowStorybookEmbed(!showStorybookEmbed)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                      showStorybookEmbed
                        ? 'bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]'
                        : 'bg-white text-[#475569] border-[#cbd5e1] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <SlidersHorizontal size={13} />
                    <span>{showStorybookEmbed ? 'Live React Mode' : 'Storybook Mode'}</span>
                  </button>
                </div>
              </div>

              {/* Storybook Embed Mode */}
              {showStorybookEmbed ? (
                <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-[#0f172a]">Storybook Iframe Integration</h2>
                      <p className="text-xs text-[#64748b]">Embed your live Storybook component stories directly into documentation.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={storybookUrl}
                        onChange={(e) => setStorybookUrl(e.target.value)}
                        placeholder="https://your-storybook.chromatic.com"
                        className="bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-lg text-xs w-64"
                      />
                      <a
                        href={storybookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Open ↗</span>
                      </a>
                    </div>
                  </div>

                  <div className="border border-[#cbd5e1] rounded-xl overflow-hidden h-96 bg-[#0f172a] relative">
                    <iframe
                      src={storybookUrl}
                      className="w-full h-full border-0"
                      title="Storybook Sandbox"
                    />
                  </div>
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-3 text-xs text-[#64748b] flex items-center justify-between">
                    <span>
                      <strong>Embedding Notice:</strong> If the Storybook view appears blank, the remote host may restrict iframe embedding via <code className="bg-white px-1 py-0.5 rounded border border-[#cbd5e1]">X-Frame-Options</code> or CSP. Click <strong>Open ↗</strong> to view directly.
                    </span>
                  </div>
                </div>
              ) : (
                /* Native Interactive Component Playground */
                <div className="space-y-6">
                  {/* Component Selector Tabs */}
                  <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-2">
                    {componentsList.map((comp) => (
                      <button
                        key={comp.id}
                        onClick={() => setSelectedCompId(comp.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          selectedCompId === comp.id
                            ? 'bg-[#2563eb] text-white shadow-xs'
                            : 'bg-white text-[#475569] border border-[#e2e8f0] hover:bg-[#f8fafc]'
                        }`}
                      >
                        {comp.name}
                      </button>
                    ))}
                  </div>

                  {/* BUTTON PLAYGROUND */}
                  {selectedCompId === 'comp-button' && (
                    <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-6">
                      <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
                        <div>
                          <h2 className="text-base font-bold text-[#0f172a]">Button Component</h2>
                          <p className="text-xs text-[#64748b] mt-0.5">Primary interactive control supporting variants, sizes, and disabled states.</p>
                        </div>
                        <span className="text-[10px] font-mono text-[#2563eb] bg-[#eff6ff] px-2 py-0.5 rounded border border-[#bfdbfe]">
                          React 19 / Tailwind v4
                        </span>
                      </div>

                      {/* Controls Bar */}
                      <div className="grid grid-cols-3 gap-4 bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] text-xs">
                        <div>
                          <label className="font-semibold text-[#475569] block mb-1">Variant</label>
                          <select
                            value={btnVariant}
                            onChange={(e) => setBtnVariant(e.target.value as any)}
                            className="w-full bg-white border border-[#cbd5e1] px-2.5 py-1.5 rounded-lg"
                          >
                            <option value="primary">Primary</option>
                            <option value="secondary">Secondary</option>
                            <option value="outline">Outline</option>
                            <option value="ghost">Ghost</option>
                            <option value="destructive">Destructive</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-semibold text-[#475569] block mb-1">Size</label>
                          <select
                            value={btnSize}
                            onChange={(e) => setBtnSize(e.target.value as any)}
                            className="w-full bg-white border border-[#cbd5e1] px-2.5 py-1.5 rounded-lg"
                          >
                            <option value="sm">Small (sm)</option>
                            <option value="md">Medium (md)</option>
                            <option value="lg">Large (lg)</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-semibold text-[#475569] block mb-1">State</label>
                          <button
                            onClick={() => setBtnDisabled(!btnDisabled)}
                            className={`w-full py-1.5 px-3 rounded-lg border font-semibold ${
                              btnDisabled ? 'bg-[#fee2e2] text-[#dc2626] border-[#fecaca]' : 'bg-white text-[#475569] border-[#cbd5e1]'
                            }`}
                          >
                            {btnDisabled ? 'Disabled: Yes' : 'Disabled: No'}
                          </button>
                        </div>
                      </div>

                      {/* Interactive Canvas */}
                      <div className="p-12 bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] rounded-xl border border-[#e2e8f0] flex flex-col items-center justify-center gap-3">
                        <button
                          disabled={btnDisabled}
                          onClick={() => setBtnClicks((c) => c + 1)}
                          className={`font-semibold rounded-lg transition-all shadow-xs flex items-center gap-2 ${
                            btnSize === 'sm' ? 'px-3 py-1.5 text-xs' : btnSize === 'lg' ? 'px-6 py-3 text-sm' : 'px-4 py-2 text-xs'
                          } ${
                            btnVariant === 'primary'
                              ? 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white disabled:bg-[#94a3b8]'
                              : btnVariant === 'secondary'
                              ? 'bg-white border border-[#cbd5e1] hover:bg-[#f8fafc] text-[#0f172a] disabled:text-[#94a3b8]'
                              : btnVariant === 'outline'
                              ? 'bg-transparent border-2 border-[#2563eb] text-[#2563eb] hover:bg-[#eff6ff] disabled:border-[#94a3b8] disabled:text-[#94a3b8]'
                              : btnVariant === 'ghost'
                              ? 'bg-transparent hover:bg-[#f1f5f9] text-[#0f172a] disabled:text-[#94a3b8]'
                              : 'bg-[#ef4444] hover:bg-[#dc2626] text-white disabled:bg-[#94a3b8]'
                          }`}
                        >
                          <CheckSquare size={14} />
                          <span>Interactive Button ({btnClicks} clicks)</span>
                        </button>
                        <span className="text-[10px] text-[#94a3b8]">Click the button to test living event handlers</span>
                      </div>

                      {/* Code Usage Snippet */}
                      <div className="p-4 bg-[#0f172a] text-[#f8fafc] rounded-xl font-mono text-xs overflow-x-auto flex items-center justify-between">
                        <code>{`<Button variant="${btnVariant}" size="${btnSize}"${btnDisabled ? ' disabled' : ''}>Click Me</Button>`}</code>
                        <button
                          onClick={() => copyToClipboard(`<Button variant="${btnVariant}" size="${btnSize}"${btnDisabled ? ' disabled' : ''}>Click Me</Button>`, 'code_btn')}
                          className="btn-secondary text-[10px] py-1 px-2 text-white bg-slate-800 hover:bg-slate-700"
                        >
                          {copiedKey === 'code_btn' ? 'Copied!' : 'Copy JSX'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TEXT INPUT PLAYGROUND */}
                  {selectedCompId === 'comp-input' && (
                    <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-4">
                      <h2 className="text-base font-bold text-[#0f172a]">TextInput Component</h2>
                      <div className="p-8 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] max-w-md mx-auto">
                        <label className="text-xs font-semibold text-[#475569] block mb-1">Email Address</label>
                        <input
                          type="text"
                          value={inputVal}
                          onChange={(e) => setInputVal(e.target.value)}
                          className="w-full bg-white border border-[#cbd5e1] px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-[#2563eb]"
                        />
                      </div>
                    </div>
                  )}

                  {/* BADGE PLAYGROUND */}
                  {selectedCompId === 'comp-badge' && (
                    <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-4">
                      <h2 className="text-base font-bold text-[#0f172a]">Badge Component</h2>
                      <div className="flex items-center justify-center gap-4 p-8 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]">
                          Default Badge
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                          Success Badge
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]">
                          Critical Badge
                        </span>
                      </div>
                    </div>
                  )}

                  {/* CARD PLAYGROUND */}
                  {selectedCompId === 'comp-card' && (
                    <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-4">
                      <h2 className="text-base font-bold text-[#0f172a]">Card Component</h2>
                      <div className="p-8 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex justify-center">
                        <div className="w-80 bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm space-y-2">
                          <h3 className="text-sm font-bold text-[#0f172a]">Elena Voss Portfolio</h3>
                          <p className="text-xs text-[#64748b]">Structured container styled using Nexus design tokens.</p>
                          <button className="btn-primary text-xs w-full mt-2">View Project</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SECTION: VECTOR ASSETS & ICONS */}
          {activeSection === 'assets-icons' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-[#0f172a]">Vector Asset & Icon Library</h1>
                  <p className="text-xs text-[#475569] mt-1">
                    Direct SVG vector assets extracted from Figma and packaged for web and native mobile codebases.
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#059669] bg-[#ecfdf5] px-2.5 py-1 rounded-md border border-[#a7f3d0]">
                  {filteredAssets.length} SVGs Active
                </span>
              </div>

              {/* Icon Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-4 bg-white border border-[#e2e8f0] rounded-xl flex flex-col items-center text-center space-y-2 shadow-xs hover:border-[#2563eb] transition-all group"
                  >
                    <div
                      className="w-10 h-10 rounded-lg bg-[#f8fafc] text-[#0f172a] group-hover:text-[#2563eb] flex items-center justify-center transition-colors"
                      dangerouslySetInnerHTML={{ __html: asset.svgContent }}
                    />
                    <span className="text-[11px] font-mono font-semibold text-[#0f172a] truncate w-full">
                      {asset.name}
                    </span>
                    <button
                      onClick={() => copyToClipboard(asset.svgContent, asset.id)}
                      className="btn-secondary text-[10px] py-1 px-2 w-full flex items-center justify-center gap-1"
                    >
                      {copiedKey === asset.id ? <Check size={11} className="text-[#10b981]" /> : <Copy size={11} />}
                      <span>{copiedKey === asset.id ? 'Copied' : 'SVG'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: AI & MODEL CONTEXT PROTOCOL (MCP) */}
          {activeSection === 'ai-mcp-101' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">AI Grounding</span>
                <h1 className="text-2xl font-bold text-[#0f172a] mt-1">Model Context Protocol (MCP)</h1>
                <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                  Feed authentic, real-time design tokens directly into Cursor, Claude Code, Windsurf, and Copilot.
                  Prevent AI agents from guessing colors or hallucinating arbitrary CSS margin units.
                </p>
              </div>

              {/* Cursor Config */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[#0f172a]">1. Cursor Configuration (.cursor/mcp.json)</h2>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(
                          {
                            mcpServers: {
                              nexus: {
                                url: 'http://16.176.31.130/api/mcp',
                                transport: 'http',
                                headers: { Authorization: 'Bearer <YOUR_NEXUS_API_KEY>' },
                              },
                            },
                          },
                          null,
                          2
                        ),
                        'cursor_mcp'
                      )
                    }
                    className="btn-secondary text-xs"
                  >
                    {copiedKey === 'cursor_mcp' ? <Check size={13} className="text-[#10b981]" /> : <Copy size={13} />}
                    <span>{copiedKey === 'cursor_mcp' ? 'Copied' : 'Copy Config'}</span>
                  </button>
                </div>
                <div className="p-3 bg-[#0f172a] text-[#f8fafc] rounded-lg text-xs font-mono overflow-x-auto">
                  <pre>{`{
  "mcpServers": {
    "nexus": {
      "url": "http://16.176.31.130/api/mcp",
      "transport": "http",
      "headers": {
        "Authorization": "Bearer <YOUR_NEXUS_API_KEY>"
      }
    }
  }
}`}</pre>
                </div>
              </div>

              {/* Claude Code CLI Connection */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-3">
                <h2 className="text-sm font-bold text-[#0f172a]">2. Claude Code CLI Command</h2>
                <div className="p-3 bg-[#0f172a] text-[#f8fafc] rounded-lg text-xs font-mono flex items-center justify-between">
                  <pre className="truncate">claude mcp add nexus -- http http://16.176.31.130/api/mcp</pre>
                  <button
                    onClick={() =>
                      copyToClipboard('claude mcp add nexus -- http http://16.176.31.130/api/mcp', 'claude_cli')
                    }
                    className="btn-secondary text-xs p-1"
                  >
                    {copiedKey === 'claude_cli' ? <Check size={12} className="text-[#10b981]" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              {/* Live MCP Tester */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-[#0f172a]">Live MCP Diagnostic Ping Tester</h2>
                    <p className="text-xs text-[#64748b]">Sends JSON-RPC 2.0 tool call to /api/mcp</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      placeholder="API Key (optional)"
                      value={mcpApiKey}
                      onChange={(e) => setMcpApiKey(e.target.value)}
                      className="bg-[#f8fafc] border border-[#cbd5e1] px-2.5 py-1 rounded-lg text-xs w-44"
                    />
                    <button onClick={handleTestMcpPing} disabled={mcpTesting} className="btn-primary text-xs">
                      {mcpTesting ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
                      <span>{mcpTesting ? 'Testing...' : 'Ping MCP'}</span>
                    </button>
                  </div>
                </div>

                {mcpPingRes && (
                  <div className="p-4 bg-[#0f172a] text-[#f8fafc] rounded-xl text-xs font-mono max-h-60 overflow-y-auto">
                    <pre>{JSON.stringify(mcpPingRes, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION: IDEMPOTENT GIT DELIVERY */}
          {activeSection === 'automation-delivery' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Continuous Delivery</span>
                <h1 className="text-2xl font-bold text-[#0f172a] mt-1">Idempotent GitHub Pipelines</h1>
                <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                  Nexus guarantees zero pull request spam through pre-flight base branch diffing and single-branch PR
                  reuse.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-xs space-y-2">
                  <span className="text-xs font-bold text-[#059669]">Step 1: Pre-Flight Diff</span>
                  <h3 className="text-sm font-bold text-[#0f172a]">No-Op Prevention</h3>
                  <p className="text-xs text-[#64748b]">
                    Compares incoming token bundle against current remote files. If identical, aborts with noOp: true.
                  </p>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-xs space-y-2">
                  <span className="text-xs font-bold text-[#2563eb]">Step 2: Deterministic Branch</span>
                  <h3 className="text-sm font-bold text-[#0f172a]">nexus/tokens-sync</h3>
                  <p className="text-xs text-[#64748b]">
                    Targets a stable feature branch instead of spawning random timestamp branches.
                  </p>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-xs space-y-2">
                  <span className="text-xs font-bold text-[#7c3aed]">Step 3: PR Reuse</span>
                  <h3 className="text-sm font-bold text-[#0f172a]">Zero Duplicates</h3>
                  <p className="text-xs text-[#64748b]">
                    Checks for open PRs on GitHub before creating. Reuses existing PRs cleanly with new commits.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: RELEASES */}
          {activeSection === 'releases-changelog' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
                <h1 className="text-xl font-bold text-[#0f172a]">Version History & Releases</h1>
                <p className="text-xs text-[#475569] mt-1">
                  Semantic version milestones tracking token additions, component registrations, and multi-platform exporters.
                </p>
              </div>

              <div className="space-y-4">
                {releasesList.map((rel) => (
                  <div key={rel.id} className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-extrabold text-[#2563eb] bg-[#eff6ff] px-2.5 py-1 rounded-md border border-[#bfdbfe]">
                          {rel.version}
                        </span>
                        <h3 className="text-sm font-bold text-[#0f172a]">{rel.title}</h3>
                      </div>
                      <span className="text-[11px] text-[#94a3b8]">
                        {new Date(rel.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-[#475569]">{rel.description}</p>

                    <div className="bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0] text-xs font-mono text-[#334155] whitespace-pre-line">
                      {rel.changelog}
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-[#64748b] pt-1">
                      <span>Tokens: <strong>{rel.tokensCount}</strong></span>
                      <span>Components: <strong>{rel.componentsCount}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
