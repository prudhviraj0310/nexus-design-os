'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Box,
  FileCode,
  GitPullRequest,
  BookOpen,
  Search,
  Copy,
  Check,
  RefreshCw,
  Download,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Terminal,
  Plus,
  Trash2,
  Sliders,
  History,
  Tag,
  Wand2,
  Eye,
  Code2,
  FolderGit2,
  Settings,
  Cpu,
  ArrowRight,
  ShieldCheck,
  FileText,
  Workflow,
  Sparkles,
  BarChart2,
  LineChart,
  MessageSquare,
  HelpCircle,
  UserPlus,
  Grid,
  Share2,
  Database,
  ArrowUpRight,
  CheckSquare,
  ChevronDown,
  Bell,
  Play,
  Monitor,
  Smartphone,
  FolderDown,
  Radio,
  Activity,
  GitBranch,
  GitFork,
  Lock,
  LogOut,
} from 'lucide-react';

// Brand & Integration SVG Helpers using cloned official assets
function IntegrationLogo({ name, size = 18, className = '' }: { name: string; size?: number; className?: string }) {
  const map: Record<string, string> = {
    figma: '/integrations/figma-logo.svg',
    tokens_studio: '/integrations/tokens-studio-logo.svg',
    storybook: '/integrations/storybook-logo.svg',
    claude: '/integrations/claude-logo.svg',
    cursor: '/integrations/cursor-logo-ink.svg',
    vscode: '/integrations/vs-code-logo.svg',
    github: '/integrations/github-logo.svg',
    gitlab: '/integrations/gitlab-logo.svg',
    azure: '/integrations/azure-logo.svg',
    bitbucket: '/integrations/bitbucket-logo.svg',
    lovable: '/integrations/lovable-logo.svg',
    v0: '/integrations/v0-logo.svg',
    raycast: '/integrations/raycast-logo.svg',
    react: '/integrations/react-logo.svg',
  };

  const src = map[name];
  if (!src) return <Box size={size} className={className} />;

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={`inline-block object-contain ${className}`}
      onError={(e) => {
        // Fallback gracefully if image fails
        (e.target as HTMLElement).style.display = 'none';
      }}
    />
  );
}

export default function SupernovaPlatform() {
  // Navigation matching the genuine 2026 Supernova Architecture
  const [activeNav, setActiveNav] = useState<
    | 'overview'
    | 'contexts'
    | 'automation'
    | 'docs'
    | 'mcp-analytics'
    | 'docs-analytics'
    | 'code-adoption'
    | 'feedback'
    | 'tokens'
    | 'components'
    | 'figma'
    | 'audit'
    | 'releases'
  >('overview');

  // Token state
  const [tokens, setTokens] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [tokenSearch, setTokenSearch] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<any | null>(null);
  const [activeThemeMode, setActiveThemeMode] = useState<'all' | 'light' | 'dark'>('all');
  const [loadingTokens, setLoadingTokens] = useState<boolean>(true);

  // Add Token Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTokenPath, setNewTokenPath] = useState<string>('color.brand.accent');
  const [newTokenValue, setNewTokenValue] = useState<string>('#06b6d4');
  const [newTokenCategory, setNewTokenCategory] = useState<string>('color');
  const [newTokenDesc, setNewTokenDesc] = useState<string>('Cyan accent highlight');
  const [savingToken, setSavingToken] = useState<boolean>(false);

  // Components state
  const [components, setComponents] = useState<any[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [componentVariant, setComponentVariant] = useState<string>('primary');
  const [componentSize, setComponentSize] = useState<string>('md');
  const [componentFramework, setComponentFramework] = useState<'react' | 'html' | 'swift' | 'kotlin'>('react');
  const [componentTab, setComponentTab] = useState<'preview' | 'props' | 'code' | 'tokens'>('preview');

  // Interactive component testing state
  const [buttonClicks, setButtonClicks] = useState<number>(0);
  const [inputVal, setInputVal] = useState<string>('developer@supernova.io');
  const [badgeTone, setBadgeTone] = useState<'neutral' | 'success' | 'critical' | 'indigo'>('success');
  const [cardVariant, setCardVariant] = useState<'elevated' | 'outlined' | 'ghost'>('elevated');

  // Figma state
  const [figmaFileKey, setFigmaFileKey] = useState<string>('4s7xK0m2zN_core_ui_kit');
  const [figmaToken, setFigmaToken] = useState<string>('');
  const [figmaMode, setFigmaMode] = useState<string>('Light');
  const [figmaSyncing, setFigmaSyncing] = useState<boolean>(false);
  const [figmaDiffResult, setFigmaDiffResult] = useState<any>(null);

  // Exporters state
  const [exportFormat, setExportFormat] = useState<'tailwind' | 'css' | 'typescript' | 'json' | 'swift' | 'kotlin'>('tailwind');
  const [exportedContent, setExportedContent] = useState<any>(null);
  const [loadingExport, setLoadingExport] = useState<boolean>(false);
  const [exporterFilter, setExporterFilter] = useState<'all' | 'tokens' | 'assets' | 'contexts' | 'other'>('all');

  // Delivery state
  const [targetRepo, setTargetRepo] = useState<string>('adcn/web-platform-core');
  const [targetBranch, setTargetBranch] = useState<string>('main');
  const [prTitle, setPrTitle] = useState<string>('chore: update design tokens from Supernova Studio');
  const [delivering, setDelivering] = useState<boolean>(false);
  const [deliveryResult, setDeliveryResult] = useState<any>(null);
  const [isLiveDelivery, setIsLiveDelivery] = useState<boolean>(true);

  // GitHub Account Connection & Repos Auto-Discovery
  const [githubConnected, setGithubConnected] = useState<boolean>(false);
  const [githubUser, setGithubUser] = useState<any>(null);
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState<boolean>(false);
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [customGithubToken, setCustomGithubToken] = useState<string>('');
  const [connectingGithub, setConnectingGithub] = useState<boolean>(false);

  // Audit state
  const [auditCode, setAuditCode] = useState<string>(`// Testing component compliance against Supernova design tokens
export function PrimaryCard() {
  return (
    <div style={{
      backgroundColor: '#3b82f6', // Hardcoded hex color
      padding: '17px',            // Arbitrary non-scale spacing
      borderRadius: '8px',
      color: 'var(--color-unknown-fake)' // Unregistered token
    }}>
      <h3 style={{ color: 'var(--color-legacy-accent)' }}>Supernova Design System</h3>
      <p>Single source of truth for design and engineering teams.</p>
    </div>
  );
}`);
  const [auditReport, setAuditReport] = useState<any>(null);
  const [auditing, setAuditing] = useState<boolean>(false);

  // Releases state
  const [releasesList, setReleasesList] = useState<any[]>([]);
  const [showReleaseModal, setShowReleaseModal] = useState<boolean>(false);
  const [newReleaseVersion, setNewReleaseVersion] = useState<string>('1.3.0');
  const [newReleaseTitle, setNewReleaseTitle] = useState<string>('Q4 Design Tokens Refresh');
  const [newReleaseChangelog, setNewReleaseChangelog] = useState<string>('Added cyan semantic accents, standardized border radii, updated button sizing tokens.');
  const [publishingRelease, setPublishingRelease] = useState<boolean>(false);

  // Contexts State (Screenshot 3)
  const [contextSelections, setContextSelections] = useState({
    docsPages: true,
    designTokens: true,
    tokenThemes: true,
    assets: true,
    codeComponents: true,
    dsComponents: true,
    figmaComponents: true,
    workspaceKnowledge: true,
  });
  const [collectFeedback, setCollectFeedback] = useState<boolean>(true);
  const [mcpPingResult, setMcpPingResult] = useState<any>(null);
  const [testingMcp, setTestingMcp] = useState<boolean>(false);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [mcpEndpointUrl, setMcpEndpointUrl] = useState<string>('http://localhost:3000/api/mcp');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMcpEndpointUrl(`${window.location.origin}/api/mcp`);
    }
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // File Download Helper
  const triggerDownload = (filename: string, content: string, mime = 'text/plain') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 1. Initial Load: Tokens, Components, Releases
  const loadTokens = async () => {
    try {
      setLoadingTokens(true);
      const res = await fetch('/api/tokens');
      const data = await res.json();
      if (data.tokens) {
        setTokens(data.tokens);
        if (!selectedToken && data.tokens.length > 0) {
          setSelectedToken(data.tokens[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load tokens', err);
    } finally {
      setLoadingTokens(false);
    }
  };

  const loadComponents = async () => {
    try {
      const res = await fetch('/api/components');
      const data = await res.json();
      if (data.components) {
        setComponents(data.components);
        if (!selectedComponent && data.components.length > 0) {
          setSelectedComponent(data.components[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load components', err);
    }
  };

  const loadReleases = async () => {
    try {
      const res = await fetch('/api/releases');
      const data = await res.json();
      if (data.releases) {
        setReleasesList(data.releases);
      }
    } catch (err) {
      console.error('Failed to load releases', err);
    }
  };

  const loadExport = async (format: string) => {
    try {
      setLoadingExport(true);
      setExportFormat(format as any);
      const res = await fetch(`/api/export?format=${format}`);
      const data = await res.json();
      setExportedContent(data);
    } catch (err) {
      console.error('Failed to export code', err);
    } finally {
      setLoadingExport(false);
    }
  };

  // GitHub Connection & Auto-Discovery Handlers
  const loadGithubRepos = async () => {
    try {
      setLoadingRepos(true);
      const res = await fetch('/api/github/repos');
      const data = await res.json();
      if (data.success && data.repos) {
        setGithubRepos(data.repos);
        if (data.repos.length > 0) {
          const exists = data.repos.some((r: any) => r.fullName === targetRepo);
          if (!exists) {
            setTargetRepo(data.repos[0].fullName);
            setTargetBranch(`nexus/tokens-${Date.now().toString().slice(-4)}`);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load GitHub repos', err);
    } finally {
      setLoadingRepos(false);
    }
  };

  const checkGithubStatus = async () => {
    try {
      const res = await fetch('/api/github/connect');
      const data = await res.json();
      if (data.connected && data.user) {
        setGithubConnected(true);
        setGithubUser(data.user);
        await loadGithubRepos();
      } else {
        setGithubConnected(false);
        setGithubUser(null);
      }
    } catch (err) {
      console.error('Failed to check GitHub status', err);
      setGithubConnected(false);
    }
  };

  const handleConnectGithubToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customGithubToken.trim()) return;
    try {
      setConnectingGithub(true);
      const res = await fetch('/api/github/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: customGithubToken.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setGithubConnected(true);
        setGithubUser(data.user);
        setCustomGithubToken('');
        setShowConnectModal(false);
        await loadGithubRepos();
      } else {
        alert(`Connection failed: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Connection failed: ${err.message}`);
    } finally {
      setConnectingGithub(false);
    }
  };

  const handleDisconnectGithub = async () => {
    if (!confirm('Disconnect your GitHub account from Nexus Design OS?')) return;
    try {
      await fetch('/api/github/connect', { method: 'DELETE' });
      setGithubConnected(false);
      setGithubUser(null);
      setGithubRepos([]);
    } catch (err) {
      console.error('Failed to disconnect GitHub', err);
    }
  };

  useEffect(() => {
    loadTokens();
    loadComponents();
    loadReleases();
    loadExport('tailwind');
    checkGithubStatus();

    // Check URL search params for GitHub OAuth callback result
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('github') === 'connected') {
        checkGithubStatus();
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (urlParams.get('github_error')) {
        alert(`GitHub OAuth error: ${urlParams.get('github_error')}`);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // 2. Add Token Action
  const handleAddToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingToken(true);
    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: newTokenPath,
          rawValue: newTokenValue,
          category: newTokenCategory,
          type: newTokenCategory === 'color' ? 'color' : 'dimension',
          description: newTokenDesc,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        await loadTokens();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to add token', err);
    } finally {
      setSavingToken(false);
    }
  };

  // 3. Delete Token Action
  const handleDeleteToken = async (id: string) => {
    if (!confirm('Are you sure you want to remove this design token?')) return;
    try {
      const res = await fetch(`/api/tokens?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await loadTokens();
        if (selectedToken?.id === id) setSelectedToken(null);
      }
    } catch (err) {
      console.error('Failed to delete token', err);
    }
  };

  // 4. Figma Sync Action
  const handleSyncFigma = async () => {
    setFigmaSyncing(true);
    setFigmaDiffResult(null);
    try {
      const res = await fetch('/api/figma/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileKey: figmaFileKey,
          figmaToken: figmaToken,
          personalAccessToken: figmaToken,
          modeName: figmaMode,
          mode: figmaMode,
          applyChanges: true,
        }),
      });
      const data = await res.json();
      setFigmaDiffResult(data);
      if (data.success) {
        await loadTokens();
      }
    } catch (err) {
      console.error('Failed to sync Figma', err);
    } finally {
      setFigmaSyncing(false);
    }
  };

  // 5. Deliver PR Action
  const handleDeliverPr = async () => {
    setDelivering(true);
    setDeliveryResult(null);
    try {
      const [owner, name] = targetRepo.includes('/') ? targetRepo.split('/') : ['acme-corp', targetRepo];
      const res = await fetch('/api/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repository: targetRepo,
          repoOwner: owner.trim(),
          repoName: (name || targetRepo).trim(),
          branch: targetBranch,
          newBranchName: targetBranch,
          title: prTitle,
          prTitle: prTitle,
          dryRun: !isLiveDelivery,
        }),
      });
      const data = await res.json();
      setDeliveryResult(data);
    } catch (err) {
      console.error('Failed to create PR', err);
    } finally {
      setDelivering(false);
    }
  };

  // 6. AST Code Audit Action
  const handleRunAudit = async () => {
    setAuditing(true);
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: auditCode,
          filename: 'PrimaryCard.tsx',
        }),
      });
      const data = await res.json();
      setAuditReport(data);
    } catch (err) {
      console.error('Failed to run audit', err);
    } finally {
      setAuditing(false);
    }
  };

  // 7. Create Release Action
  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishingRelease(true);
    try {
      const res = await fetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: newReleaseVersion,
          title: newReleaseTitle,
          changelog: newReleaseChangelog,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowReleaseModal(false);
        await loadReleases();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to create release', err);
    } finally {
      setPublishingRelease(false);
    }
  };

  // 8. Test MCP Endpoint Live
  const handleTestMcp = async () => {
    setTestingMcp(true);
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
      setMcpPingResult(data);
    } catch (err) {
      setMcpPingResult({ error: String(err) });
    } finally {
      setTestingMcp(false);
    }
  };

  // 9. Download SKILL.md Export
  const handleDownloadSkill = () => {
    const skillContent = `---
name: nexus-design-os
description: Authoritative design system tokens, components, guidelines, and style rules from Nexus Design OS.
---

# Nexus Design OS: Design System Context

Exported for AI Coding Agents (Claude Code, Cursor, Codex, Windsurf).
Endpoint: \`${mcpEndpointUrl}\`

## Included Data & Knowledge
- **Design Tokens**: Active tokens (colors, dimensions, typography, shadows)
- **Token Themes**: Light and Dark modes
- **Components**: Core components (Button, Input, Card, Badge, Modal, Tabs, Tooltip, Switch)
- **Documentation**: Getting Started, Color Palette, Typography scale, Spacing scale, Component guidelines

## Key Design Tokens
- \`color.brand.primary\`: #3b82f6 (Primary action blue)
- \`color.brand.secondary\`: #6366f1 (Secondary indigo)
- \`color.semantic.success\`: #10b981 (Success emerald)
- \`color.semantic.warning\`: #f59e0b (Warning amber)
- \`color.semantic.danger\`: #ef4444 (Danger rose)
- \`spacing.4\`: 16px (Base layout increment)
- \`radius.md\`: 8px (Standard component corner radius)

## Enforcement Rules
1. Never hardcode hex colors (#3b82f6, #10b981). Always reference CSS custom properties: \`var(--color-brand-primary)\`.
2. Follow 4px/8px modular grid spacing. Never invent arbitrary pixel values like \`17px\` or \`23px\`.
3. Use the Nexus MCP endpoint for live token queries and automated feedback submission.
`;
    triggerDownload('SKILL.md', skillContent, 'text/markdown');
  };

  // 10. Download Claude Code Plugin Export
  const handleDownloadClaudePlugin = () => {
    const pluginContent = JSON.stringify(
      {
        name: 'nexus-design-os-plugin',
        version: '1.0.0',
        description: 'Nexus Design OS agentic design context plugin for Claude Code',
        mcpServers: {
          nexus: {
            url: mcpEndpointUrl,
            transport: 'http',
          },
        },
        skills: ['./skills/nexus-design-os'],
        telemetry: {
          feedbackEnabled: collectFeedback,
        },
      },
      null,
      2
    );
    triggerDownload('claude-plugin.json', pluginContent, 'application/json');
  };

  // Filtered tokens
  const filteredTokens = tokens.filter((t) => {
    const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
    const matchSearch =
      t.name.toLowerCase().includes(tokenSearch.toLowerCase()) ||
      t.path.toLowerCase().includes(tokenSearch.toLowerCase()) ||
      String(t.rawValue).toLowerCase().includes(tokenSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] text-[#0f172a] font-sans antialiased">
      {/* 1. LEFT SIDEBAR (Pixel-accurate to Supernova 2026 screenshots) */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-[#e2e8f0] flex flex-col justify-between select-none z-20">
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Workspace Pill & Top Controls */}
          <div className="p-3 border-b border-[#f1f5f9]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 cursor-pointer hover:bg-[#f1f5f9] p-1.5 rounded-md transition-colors w-full">
                <div className="w-6 h-6 rounded-md bg-[#2563eb] text-white font-bold text-xs flex items-center justify-center tracking-wider shadow-sm">
                  A
                </div>
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-xs font-semibold text-[#0f172a] truncate">adcn</span>
                  <ChevronDown size={13} className="text-[#64748b] flex-shrink-0" />
                </div>
                <div className="flex items-center gap-1 text-[#64748b]">
                  <button className="p-1 hover:text-[#0f172a] hover:bg-[#e2e8f0] rounded">
                    <Bell size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Design System Switcher */}
            <div className="mt-1">
              <div className="flex items-center justify-between bg-[#f8fafc] border border-[#e2e8f0] px-2.5 py-1.5 rounded-md text-xs font-medium text-[#334155] cursor-pointer hover:bg-[#f1f5f9]">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span className="truncate">My Design System</span>
                </div>
                <ChevronDown size={13} className="text-[#94a3b8]" />
              </div>
            </div>
          </div>

          {/* Nav Items List */}
          <div className="p-2 space-y-4 flex-1">
            {/* CORE Section */}
            <div>
              <div className="px-2.5 py-1 text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider">
                Core
              </div>
              <div className="mt-0.5 space-y-0.5">
                <button
                  onClick={() => setActiveNav('overview')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeNav === 'overview'
                      ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                      : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                  }`}
                >
                  <Grid size={15} />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => setActiveNav('contexts')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeNav === 'contexts'
                      ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                      : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={15} />
                    <span>Contexts</span>
                  </div>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-[#2563eb] text-white rounded">
                    New
                  </span>
                </button>

                <button
                  onClick={() => setActiveNav('automation')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeNav === 'automation'
                      ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                      : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                  }`}
                >
                  <Code2 size={15} />
                  <span>Code automation</span>
                </button>
              </div>
            </div>

            {/* KNOWLEDGE Section */}
            <div>
              <div className="px-2.5 py-1 text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider">
                Knowledge
              </div>
              <div className="mt-0.5 space-y-0.5">
                <button
                  onClick={() => setActiveNav('docs')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeNav === 'docs'
                      ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                      : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                  }`}
                >
                  <BookOpen size={15} />
                  <span>Documentation</span>
                </button>
              </div>
            </div>

            {/* INSIGHTS Section */}
            <div>
              <div className="px-2.5 py-1 text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider">
                Insights
              </div>
              <div className="mt-0.5 space-y-0.5">
                <button
                  onClick={() => setActiveNav('mcp-analytics')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeNav === 'mcp-analytics'
                      ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                      : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                  }`}
                >
                  <BarChart2 size={15} />
                  <span>MCP analytics</span>
                </button>

                <button
                  onClick={() => setActiveNav('docs-analytics')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeNav === 'docs-analytics'
                      ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                      : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                  }`}
                >
                  <LineChart size={15} />
                  <span>Docs analytics</span>
                </button>

                <button
                  onClick={() => setActiveNav('code-adoption')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeNav === 'code-adoption'
                      ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                      : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                  }`}
                >
                  <ShieldCheck size={15} />
                  <span>Code adoption</span>
                </button>

                <button
                  onClick={() => setActiveNav('feedback')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeNav === 'feedback'
                      ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                      : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                  }`}
                >
                  <MessageSquare size={15} />
                  <span>Feedback</span>
                </button>
              </div>
            </div>

            {/* STUDIO TOOLS Section (Full Access to underlying design systems engine) */}
            <div>
              <div className="px-2.5 py-1 text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider">
                Studio Tools
              </div>
              <div className="mt-0.5 space-y-0.5">
                <button
                  onClick={() => setActiveNav('tokens')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeNav === 'tokens'
                      ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                      : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers size={15} />
                    <span>Design tokens</span>
                  </div>
                  <span className="text-[11px] text-[#94a3b8]">{tokens.length}</span>
                </button>

                <button
                  onClick={() => setActiveNav('components')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeNav === 'components'
                      ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                      : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Box size={15} />
                    <span>Components</span>
                  </div>
                  <span className="text-[11px] text-[#94a3b8]">{components.length}</span>
                </button>

                <button
                  onClick={() => setActiveNav('figma')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeNav === 'figma'
                      ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                      : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                  }`}
                >
                  <IntegrationLogo name="figma" size={14} />
                  <span>Figma Sync</span>
                </button>

                <button
                  onClick={() => setActiveNav('audit')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeNav === 'audit'
                      ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                      : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                  }`}
                >
                  <Wand2 size={15} />
                  <span>AST Linter</span>
                </button>

                <button
                  onClick={() => setActiveNav('releases')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeNav === 'releases'
                      ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                      : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Tag size={15} />
                    <span>Releases</span>
                  </div>
                  <span className="text-[11px] text-[#94a3b8]">{releasesList.length}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Footer (Plan, Credits, Portal) */}
          <div className="p-3 border-t border-[#e2e8f0] bg-[#f8fafc] space-y-2.5 text-xs text-[#475569]">
            <div className="flex items-center justify-between">
              <span className="text-[#334155] font-medium">Your plan: Starter</span>
              <button className="text-[#2563eb] font-semibold hover:underline">Upgrade</button>
            </div>
            <div>
              <div className="flex items-center justify-between text-[11px] text-[#64748b] mb-1">
                <span>Credits remaining:</span>
                <span className="font-medium text-[#0f172a]">1,000 / 1,000</span>
              </div>
              <div className="w-full bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#2563eb] h-full rounded-full w-full" />
              </div>
            </div>

            <div className="pt-2 border-t border-[#e2e8f0] space-y-1">
              <a
                href="/docs"
                target="_blank"
                className="flex items-center justify-between py-1 text-[#475569] hover:text-[#0f172a] hover:underline"
              >
                <span>Portal</span>
                <ArrowUpRight size={12} />
              </a>
              <button className="flex items-center justify-between w-full py-1 text-[#475569] hover:text-[#0f172a]">
                <span>Invite team</span>
                <UserPlus size={12} />
              </button>
              <button className="flex items-center justify-between w-full py-1 text-[#475569] hover:text-[#0f172a]">
                <span>Settings</span>
                <Settings size={12} />
              </button>
              <button className="flex items-center justify-between w-full py-1 text-[#475569] hover:text-[#0f172a]">
                <span>Help & support</span>
                <HelpCircle size={12} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT VIEWPORT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8fafc]">
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-[#e2e8f0] px-6 flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-[#0f172a] capitalize">
              {activeNav === 'overview' && 'Overview'}
              {activeNav === 'contexts' && 'Contexts'}
              {activeNav === 'automation' && 'Code automation'}
              {activeNav === 'docs' && 'Documentation'}
              {activeNav === 'mcp-analytics' && 'MCP analytics'}
              {activeNav === 'docs-analytics' && 'Documentation analytics'}
              {activeNav === 'code-adoption' && 'Code adoption & compliance'}
              {activeNav === 'feedback' && 'Agent & Developer feedback'}
              {activeNav === 'tokens' && 'Design Tokens'}
              {activeNav === 'components' && 'Components Sandbox'}
              {activeNav === 'figma' && 'Figma Variables & Styles'}
              {activeNav === 'audit' && 'AST Code Compliance Audit'}
              {activeNav === 'releases' && 'Releases & Version Tags'}
            </h1>
            <span className="text-[#cbd5e1]">/</span>
            <span className="text-xs text-[#64748b]">My Design System</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live MCP Status Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#ecfdf5] border border-[#a7f3d0] rounded-full text-xs font-medium text-[#065f46]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span>MCP Server Live</span>
            </div>

            {/* Quick Action Button */}
            {activeNav === 'tokens' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary text-xs"
              >
                <Plus size={14} />
                <span>Add Token</span>
              </button>
            )}

            {activeNav === 'overview' && (
              <button
                onClick={() => setActiveNav('figma')}
                className="btn-primary text-xs"
              >
                <Plus size={14} />
                <span>Connect source</span>
              </button>
            )}

            {activeNav === 'contexts' && (
              <button
                onClick={handleDownloadSkill}
                className="btn-primary text-xs"
              >
                <Download size={14} />
                <span>Export SKILL.md</span>
              </button>
            )}

            {activeNav === 'automation' && (
              <button
                onClick={() => {
                  setExportFormat('tailwind');
                  loadExport('tailwind');
                }}
                className="btn-primary text-xs"
              >
                <Play size={14} />
                <span>Run Pipeline</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic View Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ========================================================================= */}
          {/* VIEW: OVERVIEW (Screenshot 2 - The Node Flow Graph & 4 Metric Cards)      */}
          {/* ========================================================================= */}
          {activeNav === 'overview' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* 4 Metric Cards Bar */}
              <div className="grid grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveNav('tokens')}
                  className="bg-white border border-[#e2e8f0] p-4 rounded-lg shadow-sm hover:border-[#2563eb] cursor-pointer transition-all"
                >
                  <div className="text-xs font-semibold text-[#64748b]">Design tokens</div>
                  <div className="text-2xl font-bold text-[#0f172a] mt-1">{tokens.length}</div>
                  <div className="text-[11px] text-[#94a3b8] mt-1">Colors, dimensions, typography, shadows</div>
                </div>

                <div
                  onClick={() => setActiveNav('components')}
                  className="bg-white border border-[#e2e8f0] p-4 rounded-lg shadow-sm hover:border-[#2563eb] cursor-pointer transition-all"
                >
                  <div className="text-xs font-semibold text-[#64748b]">Components</div>
                  <div className="text-2xl font-bold text-[#0f172a] mt-1">{components.length} - 0</div>
                  <div className="text-[11px] text-[#94a3b8] mt-1">Buttons, inputs, cards, badges</div>
                </div>

                <div
                  onClick={() => setActiveNav('automation')}
                  className="bg-white border border-[#e2e8f0] p-4 rounded-lg shadow-sm hover:border-[#2563eb] cursor-pointer transition-all"
                >
                  <div className="text-xs font-semibold text-[#64748b]">Assets</div>
                  <div className="text-2xl font-bold text-[#0f172a] mt-1">26</div>
                  <div className="text-[11px] text-[#94a3b8] mt-1">Brand logos, SVGs, vector icons</div>
                </div>

                <div
                  onClick={() => setActiveNav('docs')}
                  className="bg-white border border-[#e2e8f0] p-4 rounded-lg shadow-sm hover:border-[#2563eb] cursor-pointer transition-all"
                >
                  <div className="text-xs font-semibold text-[#64748b]">Docs pages</div>
                  <div className="text-2xl font-bold text-[#0f172a] mt-1">5</div>
                  <div className="text-[11px] text-[#94a3b8] mt-1">Overview, Tokens, Components, API, MCP</div>
                </div>
              </div>

              {/* Large Interactive Visual Node Flow Graph */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-8 shadow-sm relative overflow-hidden">
                <div className="text-center mb-8">
                  <h2 className="text-lg font-bold text-[#0f172a]">Supernova Unified Design Architecture</h2>
                  <p className="text-xs text-[#64748b] mt-1">
                    Continuous synchronization from raw design sources through the central truth hub to AI agents & production code
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-6 items-center relative">
                  {/* Left Column: Data Sources */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#334155]">Data sources</span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#ecfdf5] text-[#059669] rounded-full">
                        Connected
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748b]">
                      Sync tokens, components, and variables from multiple authoring tools.
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 bg-white border border-[#e2e8f0] rounded-lg">
                        <div className="flex items-center gap-2.5">
                          <IntegrationLogo name="figma" size={16} />
                          <span className="text-xs font-medium text-[#0f172a]">Figma Variables & Styles</span>
                        </div>
                        <span className="text-[10px] text-[#10b981] font-semibold">Active</span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white border border-[#e2e8f0] rounded-lg">
                        <div className="flex items-center gap-2.5">
                          <IntegrationLogo name="tokens_studio" size={16} />
                          <span className="text-xs font-medium text-[#0f172a]">Tokens Studio</span>
                        </div>
                        <span className="text-[10px] text-[#10b981] font-semibold">Ready</span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white border border-[#e2e8f0] rounded-lg">
                        <div className="flex items-center gap-2.5">
                          <IntegrationLogo name="storybook" size={16} />
                          <span className="text-xs font-medium text-[#0f172a]">Storybook Integration</span>
                        </div>
                        <span className="text-[10px] text-[#64748b]">Mapped</span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white border border-[#e2e8f0] rounded-lg">
                        <div className="flex items-center gap-2.5">
                          <IntegrationLogo name="github" size={16} />
                          <span className="text-xs font-medium text-[#0f172a]">GitHub Code Sync</span>
                        </div>
                        <span className="text-[10px] text-[#10b981] font-semibold">Tracked</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveNav('figma')}
                      className="w-full text-center py-2 bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] rounded-lg text-xs font-semibold text-[#0f172a] transition-colors"
                    >
                      Manage sources
                    </button>
                  </div>

                  {/* Center Column: Supernova Central Hub Atom */}
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                      {/* Animated Rings */}
                      <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#93c5fd] animate-spin" style={{ animationDuration: '20s' }} />
                      <div className="absolute inset-2 rounded-full border border-[#bfdbfe]" />
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#2563eb] to-[#06b6d4] flex items-center justify-center shadow-lg text-white">
                        <Sparkles size={28} className="animate-pulse" />
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-[#0f172a]">Supernova Core Hub</h3>
                    <p className="text-xs text-[#2563eb] font-semibold mt-0.5">Single Source of Truth</p>
                    <p className="text-[11px] text-[#64748b] mt-1 max-w-[200px]">
                      Deterministic resolution of aliases, math tokens, multi-brand themes, and AST linting rules.
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                      <span className="px-2 py-1 text-[10px] font-semibold bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] rounded-md">
                        v1.3.0 Draft
                      </span>
                      <span className="px-2 py-1 text-[10px] font-semibold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] rounded-md">
                        100% Validated
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Destinations */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#334155]">Destinations</span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#eff6ff] text-[#2563eb] rounded-full">
                        Live Output
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748b]">
                      Publish docs, deliver production code, and feed AI agents with realtime MCP context.
                    </p>

                    <div className="space-y-2">
                      <div
                        onClick={() => setActiveNav('contexts')}
                        className="flex items-center justify-between p-2.5 bg-white border border-[#e2e8f0] rounded-lg cursor-pointer hover:border-[#2563eb] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <IntegrationLogo name="claude" size={16} />
                          <div>
                            <div className="text-xs font-medium text-[#0f172a]">MCP Editor & Consumer</div>
                            <div className="text-[10px] text-[#64748b]">Claude, Cursor, Codex, Windsurf</div>
                          </div>
                        </div>
                        <ArrowRight size={13} className="text-[#94a3b8]" />
                      </div>

                      <div
                        onClick={() => setActiveNav('docs')}
                        className="flex items-center justify-between p-2.5 bg-white border border-[#e2e8f0] rounded-lg cursor-pointer hover:border-[#2563eb] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <BookOpen size={16} className="text-[#2563eb]" />
                          <div>
                            <div className="text-xs font-medium text-[#0f172a]">Documentation Site</div>
                            <div className="text-[10px] text-[#64748b]">5 Pages Published Live</div>
                          </div>
                        </div>
                        <ArrowRight size={13} className="text-[#94a3b8]" />
                      </div>

                      <div
                        onClick={() => setActiveNav('automation')}
                        className="flex items-center justify-between p-2.5 bg-white border border-[#e2e8f0] rounded-lg cursor-pointer hover:border-[#2563eb] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileCode size={16} className="text-[#059669]" />
                          <div>
                            <div className="text-xs font-medium text-[#0f172a]">Code Automations</div>
                            <div className="text-[10px] text-[#64748b]">Tailwind 4, CSS, Style Dictionary</div>
                          </div>
                        </div>
                        <ArrowRight size={13} className="text-[#94a3b8]" />
                      </div>

                      <div
                        onClick={() => setActiveNav('docs')}
                        className="flex items-center justify-between p-2.5 bg-white border border-[#e2e8f0] rounded-lg cursor-pointer hover:border-[#2563eb] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <MessageSquare size={16} className="text-[#7c3aed]" />
                          <div>
                            <div className="text-xs font-medium text-[#0f172a]">Portal (Ask AI)</div>
                            <div className="text-[10px] text-[#64748b]">Design System Copilot</div>
                          </div>
                        </div>
                        <ArrowRight size={13} className="text-[#94a3b8]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity & Quick Guides */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b] mb-3">
                    Recent Platform Activity
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-[#f1f5f9]">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-[#10b981]" />
                        <span className="font-medium text-[#0f172a]">MCP Tool query from Claude Code agent</span>
                      </div>
                      <span className="text-[11px] text-[#94a3b8]">2m ago</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-[#f1f5f9]">
                      <div className="flex items-center gap-2">
                        <Code2 size={14} className="text-[#2563eb]" />
                        <span className="font-medium text-[#0f172a]">Tailwind CSS 4 exporter generated 42 tokens</span>
                      </div>
                      <span className="text-[11px] text-[#94a3b8]">15m ago</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-[#f1f5f9]">
                      <div className="flex items-center gap-2">
                        <IntegrationLogo name="figma" size={14} />
                        <span className="font-medium text-[#0f172a]">Figma Variables synced (Light mode)</span>
                      </div>
                      <span className="text-[11px] text-[#94a3b8]">1h ago</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <GitPullRequest size={14} className="text-[#6366f1]" />
                        <span className="font-medium text-[#0f172a]">GitHub Delivery PR #104 ready for review</span>
                      </div>
                      <span className="text-[11px] text-[#94a3b8]">3h ago</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b] mb-3">
                    Supernova 2026 Playbooks
                  </h3>
                  <div className="space-y-2 text-xs">
                    <a
                      href="https://supernova.io/for-ai"
                      target="_blank"
                      className="block p-2.5 bg-[#f8fafc] hover:bg-[#f1f5f9] rounded-lg border border-[#e2e8f0] transition-colors"
                    >
                      <div className="font-semibold text-[#0f172a] flex items-center justify-between">
                        <span>Agentic Design Systems Playbook</span>
                        <ArrowUpRight size={13} className="text-[#64748b]" />
                      </div>
                      <p className="text-[11px] text-[#64748b] mt-0.5">
                        How to connect Supernova MCP to Claude Code, Cursor, Codex, and Windsurf.
                      </p>
                    </a>

                    <a
                      href="/docs"
                      target="_blank"
                      className="block p-2.5 bg-[#f8fafc] hover:bg-[#f1f5f9] rounded-lg border border-[#e2e8f0] transition-colors"
                    >
                      <div className="font-semibold text-[#0f172a] flex items-center justify-between">
                        <span>Tailwind CSS 4 @theme Integration</span>
                        <ArrowUpRight size={13} className="text-[#64748b]" />
                      </div>
                      <p className="text-[11px] text-[#64748b] mt-0.5">
                        Zero-config token compilation using modern CSS color-mix and modern CSS variables.
                      </p>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: CONTEXTS (Screenshot 3 - The AI Agentic Distribution Hub)           */}
          {/* ========================================================================= */}
          {activeNav === 'contexts' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* Header Description */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0f172a]">Design System Contexts</h2>
                  <p className="text-xs text-[#64748b] mt-1">
                    Manage and distribute organizational knowledge across AI tools, workflows, and coding agents.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleDownloadSkill} className="btn-secondary text-xs">
                    <Download size={13} />
                    <span>Download SKILL.md</span>
                  </button>
                  <button onClick={handleDownloadClaudePlugin} className="btn-primary text-xs">
                    <IntegrationLogo name="claude" size={13} />
                    <span>Export Claude Plugin</span>
                  </button>
                </div>
              </div>

              {/* Two Column Layout (Checklist Left, Distribution Right) */}
              <div className="grid grid-cols-12 gap-6">
                {/* Left 7 Columns: Data and Knowledge Checklist */}
                <div className="col-span-7 bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                    <div>
                      <h3 className="text-sm font-bold text-[#0f172a]">My Design System</h3>
                      <p className="text-xs text-[#64748b]">Default context for adcn workspace</p>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] rounded-full">
                      Primary Context
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748b] mb-3">
                      Data and Knowledge
                    </h4>

                    <div className="space-y-2.5">
                      <label className="flex items-center justify-between p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg cursor-pointer hover:bg-[#f1f5f9] transition-colors">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={contextSelections.docsPages}
                            onChange={(e) =>
                              setContextSelections({ ...contextSelections, docsPages: e.target.checked })
                            }
                            className="rounded border-[#cbd5e1] text-[#2563eb] focus:ring-0"
                          />
                          <div>
                            <span className="text-xs font-semibold text-[#0f172a]">Documentation pages</span>
                            <div className="text-[11px] text-[#64748b]">Getting Started, Colors, Typography, Guides</div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#2563eb]">5 of 5</span>
                      </label>

                      <label className="flex items-center justify-between p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg cursor-pointer hover:bg-[#f1f5f9] transition-colors">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={contextSelections.designTokens}
                            onChange={(e) =>
                              setContextSelections({ ...contextSelections, designTokens: e.target.checked })
                            }
                            className="rounded border-[#cbd5e1] text-[#2563eb] focus:ring-0"
                          />
                          <div>
                            <span className="text-xs font-semibold text-[#0f172a]">Design tokens</span>
                            <div className="text-[11px] text-[#64748b]">Colors, dimensions, typography, shadows</div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#2563eb]">{tokens.length} tokens</span>
                      </label>

                      <label className="flex items-center justify-between p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg cursor-pointer hover:bg-[#f1f5f9] transition-colors">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={contextSelections.tokenThemes}
                            onChange={(e) =>
                              setContextSelections({ ...contextSelections, tokenThemes: e.target.checked })
                            }
                            className="rounded border-[#cbd5e1] text-[#2563eb] focus:ring-0"
                          />
                          <div>
                            <span className="text-xs font-semibold text-[#0f172a]">Token themes</span>
                            <div className="text-[11px] text-[#64748b]">Light, Dark, and Contrast modes</div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#2563eb]">2 themes</span>
                      </label>

                      <label className="flex items-center justify-between p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg cursor-pointer hover:bg-[#f1f5f9] transition-colors">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={contextSelections.assets}
                            onChange={(e) =>
                              setContextSelections({ ...contextSelections, assets: e.target.checked })
                            }
                            className="rounded border-[#cbd5e1] text-[#2563eb] focus:ring-0"
                          />
                          <div>
                            <span className="text-xs font-semibold text-[#0f172a]">Assets</span>
                            <div className="text-[11px] text-[#64748b]">Vector icons, integration logos, brand illustrations</div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#2563eb]">26 assets</span>
                      </label>

                      <label className="flex items-center justify-between p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg cursor-pointer hover:bg-[#f1f5f9] transition-colors">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={contextSelections.codeComponents}
                            onChange={(e) =>
                              setContextSelections({ ...contextSelections, codeComponents: e.target.checked })
                            }
                            className="rounded border-[#cbd5e1] text-[#2563eb] focus:ring-0"
                          />
                          <div>
                            <span className="text-xs font-semibold text-[#0f172a]">Code components</span>
                            <div className="text-[11px] text-[#64748b]">Button, Input, Card, Badge, Modal, Tabs</div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#2563eb]">{components.length} components</span>
                      </label>

                      <label className="flex items-center justify-between p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg cursor-pointer hover:bg-[#f1f5f9] transition-colors">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={contextSelections.dsComponents}
                            onChange={(e) =>
                              setContextSelections({ ...contextSelections, dsComponents: e.target.checked })
                            }
                            className="rounded border-[#cbd5e1] text-[#2563eb] focus:ring-0"
                          />
                          <div>
                            <span className="text-xs font-semibold text-[#0f172a]">Design system components</span>
                            <div className="text-[11px] text-[#64748b]">Design token mapping to UI component props</div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#2563eb]">Active</span>
                      </label>

                      <label className="flex items-center justify-between p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg cursor-pointer hover:bg-[#f1f5f9] transition-colors">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={contextSelections.figmaComponents}
                            onChange={(e) =>
                              setContextSelections({ ...contextSelections, figmaComponents: e.target.checked })
                            }
                            className="rounded border-[#cbd5e1] text-[#2563eb] focus:ring-0"
                          />
                          <div>
                            <span className="text-xs font-semibold text-[#0f172a]">Figma components</span>
                            <div className="text-[11px] text-[#64748b]">Synced components from Figma UI Kit</div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#2563eb]">Synced</span>
                      </label>

                      <label className="flex items-center justify-between p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg cursor-pointer hover:bg-[#f1f5f9] transition-colors">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={contextSelections.workspaceKnowledge}
                            onChange={(e) =>
                              setContextSelections({ ...contextSelections, workspaceKnowledge: e.target.checked })
                            }
                            className="rounded border-[#cbd5e1] text-[#2563eb] focus:ring-0"
                          />
                          <div>
                            <span className="text-xs font-semibold text-[#0f172a]">Workspace knowledge</span>
                            <div className="text-[11px] text-[#64748b]">Architecture guidelines, AGENTS.md, lint rules</div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#2563eb]">Enabled</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right 5 Columns: Distribution Panel */}
                <div className="col-span-5 space-y-6">
                  {/* Model Context Protocol (MCP) Distribution Card */}
                  <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#334155]">
                        Model Context Protocol
                      </h4>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#ecfdf5] text-[#059669] rounded-full">
                        Live Endpoint
                      </span>
                    </div>

                    <p className="text-xs text-[#64748b]">
                      Connect this context to your AI tools via MCP endpoint (Claude Code, Cursor, Codex, Windsurf).
                    </p>

                    <div>
                      <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                        Endpoint URL
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          readOnly
                          value={mcpEndpointUrl}
                          className="flex-1 bg-[#f8fafc] border border-[#cbd5e1] px-2.5 py-1.5 rounded-md text-xs font-mono text-[#0f172a] select-all focus:outline-none"
                        />
                        <button
                          onClick={() => copyToClipboard(mcpEndpointUrl, 'mcp_url')}
                          className="btn-secondary text-xs px-2.5"
                        >
                          {copiedKey === 'mcp_url' ? <Check size={14} className="text-[#10b981]" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={collectFeedback}
                          onChange={(e) => setCollectFeedback(e.target.checked)}
                          className="mt-0.5 rounded border-[#cbd5e1] text-[#2563eb] focus:ring-0"
                        />
                        <div className="text-xs">
                          <span className="font-semibold text-[#0f172a]">Collect feedback</span>
                          <p className="text-[11px] text-[#64748b]">
                            Gather insights on how your context is used to improve documentation and AI accuracy. View feedback in Insights.
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Interactive MCP Ping Test */}
                    <div className="pt-3 border-t border-[#f1f5f9]">
                      <button
                        onClick={handleTestMcp}
                        disabled={testingMcp}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-lg text-xs font-semibold text-[#0f172a] transition-colors"
                      >
                        {testingMcp ? <RefreshCw size={13} className="animate-spin" /> : <Terminal size={13} />}
                        <span>{testingMcp ? 'Querying MCP Server...' : 'Test MCP Query (JSON-RPC)'}</span>
                      </button>

                      {mcpPingResult && (
                        <div className="mt-2.5 p-2.5 bg-[#0f172a] text-[#f8fafc] rounded-lg text-[11px] font-mono overflow-x-auto max-h-40">
                          <pre>{JSON.stringify(mcpPingResult, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Agent Export Formats Card */}
                  <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#334155]">
                      Agent Export Formats
                    </h4>

                    <div className="space-y-3">
                      <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FolderDown size={18} className="text-[#2563eb]" />
                          <div>
                            <div className="text-xs font-semibold text-[#0f172a]">Agent skills</div>
                            <div className="text-[11px] text-[#64748b]">Export as SKILL.md for agent discovery</div>
                          </div>
                        </div>
                        <button onClick={handleDownloadSkill} className="btn-secondary text-xs px-2.5 py-1">
                          <Download size={12} />
                          <span>Download</span>
                        </button>
                      </div>

                      <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IntegrationLogo name="claude" size={18} />
                          <div>
                            <div className="text-xs font-semibold text-[#0f172a]">Claude Code plugin</div>
                            <div className="text-[11px] text-[#64748b]">Installable plugin with prompt hooks</div>
                          </div>
                        </div>
                        <button onClick={handleDownloadClaudePlugin} className="btn-secondary text-xs px-2.5 py-1">
                          <Download size={12} />
                          <span>Export</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: CODE AUTOMATION / PIPELINES (Screenshot 4)                          */}
          {/* ========================================================================= */}
          {activeNav === 'automation' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* Header & Tabs */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0f172a]">Code Automation Pipelines</h2>
                  <p className="text-xs text-[#64748b] mt-1">
                    Continuous token generation, transforms, and delivery across Web, iOS, and Android.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setExportFormat('tailwind');
                    loadExport('tailwind');
                  }}
                  className="btn-primary text-xs"
                >
                  <Plus size={14} />
                  <span>+ New pipeline</span>
                </button>
              </div>

              {/* GitHub Account Connection Card */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0f172a] flex items-center justify-center text-white shrink-0 shadow-xs">
                      <IntegrationLogo name="github" size={22} className="brightness-200 invert" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#0f172a]">GitHub Delivery Integration</span>
                        {githubConnected ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
                            Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#f8fafc] text-[#64748b] border border-[#cbd5e1]">
                            Not Connected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748b] mt-0.5">
                        {githubConnected && githubUser
                          ? `Authenticated as @${githubUser.login} (${githubRepos.length} accessible repositories loaded)`
                          : 'Connect your GitHub account to auto-discover repositories and deliver automated PRs.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {githubConnected && githubUser ? (
                      <>
                        <button
                          onClick={loadGithubRepos}
                          disabled={loadingRepos}
                          className="btn-secondary text-xs px-3 py-1.5"
                          title="Refresh repository list"
                        >
                          <RefreshCw size={13} className={loadingRepos ? 'animate-spin' : ''} />
                          <span>{loadingRepos ? 'Refreshing...' : 'Refresh Repos'}</span>
                        </button>
                        <button
                          onClick={handleDisconnectGithub}
                          className="btn-secondary text-xs px-3 py-1.5 text-[#ef4444] hover:bg-[#fef2f2] hover:border-[#fecaca]"
                        >
                          <LogOut size={13} />
                          <span>Disconnect</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowConnectModal(true)}
                        className="btn-primary text-xs px-3.5 py-1.5 bg-[#0f172a] hover:bg-[#1e293b]"
                      >
                        <IntegrationLogo name="github" size={14} className="brightness-200 invert mr-1" />
                        <span>Connect GitHub Account</span>
                      </button>
                    )}
                  </div>
                </div>

                {githubConnected && githubUser && (
                  <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between text-xs text-[#64748b] gap-2">
                    <div className="flex items-center gap-2">
                      {githubUser.avatarUrl && (
                        <img
                          src={githubUser.avatarUrl}
                          alt={githubUser.login}
                          className="w-5 h-5 rounded-full border border-[#cbd5e1]"
                        />
                      )}
                      <span className="font-medium text-[#0f172a]">
                        {githubUser.name || githubUser.login}
                      </span>
                      <a
                        href={githubUser.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#2563eb] hover:underline flex items-center gap-0.5"
                      >
                        @{githubUser.login} <ExternalLink size={11} />
                      </a>
                    </div>
                    <div className="flex items-center gap-4 text-[11px]">
                      <span>
                        <strong className="text-[#0f172a]">{githubUser.publicRepos}</strong> public repos
                      </span>
                      {githubUser.totalPrivateRepos > 0 && (
                        <span>
                          <strong className="text-[#0f172a]">{githubUser.totalPrivateRepos}</strong> private repos
                        </span>
                      )}
                      <span className="text-[#10b981] font-medium flex items-center gap-1">
                        <CheckCircle2 size={12} /> Auto-Sync Enabled
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Taxonomy Chips Filter */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExporterFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    exporterFilter === 'all'
                      ? 'bg-[#2563eb] text-white font-semibold'
                      : 'bg-white border border-[#cbd5e1] text-[#475569] hover:bg-[#f1f5f9]'
                  }`}
                >
                  All Exporters
                </button>
                <button
                  onClick={() => setExporterFilter('tokens')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    exporterFilter === 'tokens'
                      ? 'bg-[#2563eb] text-white font-semibold'
                      : 'bg-white border border-[#cbd5e1] text-[#475569] hover:bg-[#f1f5f9]'
                  }`}
                >
                  Design tokens (12)
                </button>
                <button
                  onClick={() => setExporterFilter('assets')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    exporterFilter === 'assets'
                      ? 'bg-[#2563eb] text-white font-semibold'
                      : 'bg-white border border-[#cbd5e1] text-[#475569] hover:bg-[#f1f5f9]'
                  }`}
                >
                  Assets (8)
                </button>
                <button
                  onClick={() => setExporterFilter('contexts')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    exporterFilter === 'contexts'
                      ? 'bg-[#2563eb] text-white font-semibold'
                      : 'bg-white border border-[#cbd5e1] text-[#475569] hover:bg-[#f1f5f9]'
                  }`}
                >
                  Contexts (4)
                </button>
                <button
                  onClick={() => setExporterFilter('other')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    exporterFilter === 'other'
                      ? 'bg-[#2563eb] text-white font-semibold'
                      : 'bg-white border border-[#cbd5e1] text-[#475569] hover:bg-[#f1f5f9]'
                  }`}
                >
                  Other (3)
                </button>
              </div>

              {/* Exporter Cards Grid */}
              <div className="grid grid-cols-3 gap-5">
                {/* 1. Tailwind CSS 4 */}
                <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm hover:border-[#2563eb] transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#2563eb]">
                        <Code2 size={20} />
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#2563eb] text-white rounded">
                        New!
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#0f172a]">Tailwind CSS 4</h3>
                    <p className="text-xs text-[#64748b] mt-1">
                      Generates modern Tailwind 4 @theme directives and token utility classes.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                    <span className="text-[11px] text-[#94a3b8]">Web / CSS</span>
                    <button
                      onClick={() => loadExport('tailwind')}
                      className="btn-secondary text-xs px-2.5 py-1"
                    >
                      <span>Run</span>
                    </button>
                  </div>
                </div>

                {/* 2. Raw CSS Custom Properties */}
                <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm hover:border-[#2563eb] transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#2563eb]">
                        <FileCode size={20} />
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#2563eb] text-white rounded">
                        New!
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#0f172a]">CSS Custom Properties</h3>
                    <p className="text-xs text-[#64748b] mt-1">
                      Exports standard :root custom properties for colors, dimensions, and typography.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                    <span className="text-[11px] text-[#94a3b8]">Web / Vanilla</span>
                    <button
                      onClick={() => loadExport('css')}
                      className="btn-secondary text-xs px-2.5 py-1"
                    >
                      <span>Run</span>
                    </button>
                  </div>
                </div>

                {/* 3. CSS in JS / TypeScript */}
                <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm hover:border-[#2563eb] transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-[#f0fdf4] flex items-center justify-center text-[#16a34a]">
                        <IntegrationLogo name="react" size={20} />
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#2563eb] text-white rounded">
                        New!
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#0f172a]">CSS in JS (TypeScript)</h3>
                    <p className="text-xs text-[#64748b] mt-1">
                      Type-safe TypeScript theme dictionaries for Emotion and styled-components.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                    <span className="text-[11px] text-[#94a3b8]">React / Node</span>
                    <button
                      onClick={() => loadExport('typescript')}
                      className="btn-secondary text-xs px-2.5 py-1"
                    >
                      <span>Run</span>
                    </button>
                  </div>
                </div>

                {/* 4. Style Dictionary */}
                <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm hover:border-[#2563eb] transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-[#fef3c7] flex items-center justify-center text-[#d97706]">
                        <BookOpen size={20} />
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#2563eb] text-white rounded">
                        New!
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#0f172a]">Style Dictionary</h3>
                    <p className="text-xs text-[#64748b] mt-1">
                      Multi-platform Amazon Style Dictionary compatible JSON transform tokens.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                    <span className="text-[11px] text-[#94a3b8]">Multiplatform</span>
                    <button
                      onClick={() => loadExport('json')}
                      className="btn-secondary text-xs px-2.5 py-1"
                    >
                      <span>Run</span>
                    </button>
                  </div>
                </div>

                {/* 5. iOS Asset Catalogue */}
                <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm hover:border-[#2563eb] transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#0f172a]">
                        <Smartphone size={20} />
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#f1f5f9] text-[#64748b] rounded">
                        Native
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#0f172a]">iOS Asset Catalogue</h3>
                    <p className="text-xs text-[#64748b] mt-1">
                      Generates Xcode .xcassets color sets and Swift UIColor extensions.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                    <span className="text-[11px] text-[#94a3b8]">Apple / Swift</span>
                    <button
                      onClick={() => loadExport('swift')}
                      className="btn-secondary text-xs px-2.5 py-1"
                    >
                      <span>Run</span>
                    </button>
                  </div>
                </div>

                {/* 6. Android Assets */}
                <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm hover:border-[#2563eb] transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-[#ecfdf5] flex items-center justify-center text-[#059669]">
                        <Smartphone size={20} />
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#f1f5f9] text-[#64748b] rounded">
                        Native
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#0f172a]">Android Assets</h3>
                    <p className="text-xs text-[#64748b] mt-1">
                      Generates Android XML vector drawables and Kotlin Jetpack Compose tokens.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                    <span className="text-[11px] text-[#94a3b8]">Android / Kotlin</span>
                    <button
                      onClick={() => loadExport('kotlin')}
                      className="btn-secondary text-xs px-2.5 py-1"
                    >
                      <span>Run</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Code Preview & Delivery Sandbox */}
              {exportedContent && (
                <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal size={16} className="text-[#2563eb]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0f172a]">
                        Generated Output: {exportFormat.toUpperCase()} ({exportedContent.count || tokens.length} tokens)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(exportedContent.content, 'exported_code')}
                        className="btn-secondary text-xs"
                      >
                        {copiedKey === 'exported_code' ? (
                          <Check size={13} className="text-[#10b981]" />
                        ) : (
                          <Copy size={13} />
                        )}
                        <span>{copiedKey === 'exported_code' ? 'Copied' : 'Copy Code'}</span>
                      </button>
                      <button
                        onClick={() =>
                          triggerDownload(
                            exportFormat === 'tailwind'
                              ? 'tailwind.css'
                              : exportFormat === 'css'
                              ? 'tokens.css'
                              : exportFormat === 'typescript'
                              ? 'tokens.ts'
                              : exportFormat === 'swift'
                              ? 'ColorTokens.swift'
                              : 'ColorTokens.kt',
                            exportedContent.content
                          )
                        }
                        className="btn-secondary text-xs"
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  {/* Delivery Configuration Controls */}
                  <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FolderGit2 size={16} className="text-[#2563eb]" />
                        <span className="text-xs font-bold text-[#0f172a]">Automated Delivery Target</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#64748b]">Mode:</span>
                        <div className="inline-flex rounded-lg border border-[#cbd5e1] p-0.5 bg-white text-xs">
                          <button
                            type="button"
                            onClick={() => setIsLiveDelivery(true)}
                            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                              isLiveDelivery
                                ? 'bg-[#2563eb] text-white shadow-xs'
                                : 'text-[#64748b] hover:text-[#0f172a]'
                            }`}
                          >
                            Live GitHub PR
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsLiveDelivery(false)}
                            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                              !isLiveDelivery
                                ? 'bg-[#2563eb] text-white shadow-xs'
                                : 'text-[#64748b] hover:text-[#0f172a]'
                            }`}
                          >
                            Dry-Run Simulation
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* Repository Selector */}
                      <div>
                        <label className="font-semibold text-[#475569] block mb-1">
                          Target Repository {githubRepos.length > 0 && `(${githubRepos.length} available)`}
                        </label>
                        {githubRepos.length > 0 ? (
                          <select
                            value={targetRepo}
                            onChange={(e) => {
                              setTargetRepo(e.target.value);
                              const selected = githubRepos.find((r) => r.fullName === e.target.value);
                              if (selected?.defaultBranch) {
                                setTargetBranch(`nexus/tokens-${Date.now().toString().slice(-4)}`);
                              }
                            }}
                            className="w-full bg-white border border-[#cbd5e1] px-3 py-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#2563eb]"
                          >
                            {githubRepos.map((repo) => (
                              <option key={repo.id} value={repo.fullName}>
                                {repo.fullName} {repo.isPrivate ? '🔒 (Private)' : '🌐 (Public)'}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="relative">
                            <input
                              type="text"
                              value={targetRepo}
                              onChange={(e) => setTargetRepo(e.target.value)}
                              placeholder="owner/repository-name"
                              className="w-full bg-white border border-[#cbd5e1] px-3 py-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#2563eb]"
                            />
                            {!githubConnected && (
                              <button
                                onClick={() => setShowConnectModal(true)}
                                type="button"
                                className="text-[10px] text-[#2563eb] hover:underline mt-1 block font-medium"
                              >
                                + Connect GitHub to select from your repos
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Branch Name */}
                      <div>
                        <label className="font-semibold text-[#475569] block mb-1">New Branch Name</label>
                        <input
                          type="text"
                          value={targetBranch}
                          onChange={(e) => setTargetBranch(e.target.value)}
                          placeholder="e.g. nexus/tokens-update"
                          className="w-full bg-white border border-[#cbd5e1] px-3 py-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#2563eb]"
                        />
                      </div>

                      {/* PR Title */}
                      <div>
                        <label className="font-semibold text-[#475569] block mb-1">Pull Request Title</label>
                        <input
                          type="text"
                          value={prTitle}
                          onChange={(e) => setPrTitle(e.target.value)}
                          placeholder="chore: sync design tokens"
                          className="w-full bg-white border border-[#cbd5e1] px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-[#2563eb]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f0]">
                      <div className="text-xs text-[#64748b] flex items-center gap-1.5">
                        <Info size={13} className="text-[#2563eb]" />
                        <span>
                          {isLiveDelivery
                            ? 'Will create branch, commit generated tokens, and open a real Pull Request.'
                            : 'Will validate AST syntax and simulate git diff without touching GitHub.'}
                        </span>
                      </div>
                      <button
                        onClick={handleDeliverPr}
                        disabled={delivering}
                        className="btn-primary text-xs px-4 py-2 flex items-center gap-2"
                      >
                        <GitPullRequest size={14} className={delivering ? 'animate-spin' : ''} />
                        <span>
                          {delivering
                            ? 'Processing Delivery...'
                            : isLiveDelivery
                            ? `Deliver to ${targetRepo || 'GitHub'}`
                            : 'Run Dry-Run Delivery'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Code Editor View */}
                  <div className="p-4 bg-[#0f172a] text-[#f8fafc] rounded-lg text-xs font-mono overflow-x-auto max-h-96">
                    <pre>{exportedContent.content}</pre>
                  </div>

                  {/* Delivery Status & Created Pull Request Link */}
                  {deliveryResult && (
                    <div
                      className={`p-4 rounded-xl border text-xs space-y-3 ${
                        deliveryResult.success
                          ? 'bg-[#f0fdf4] border-[#bbf7d0]'
                          : 'bg-[#fef2f2] border-[#fecaca]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {deliveryResult.success ? (
                            <CheckCircle2 size={18} className="text-[#16a34a]" />
                          ) : (
                            <AlertTriangle size={18} className="text-[#dc2626]" />
                          )}
                          <span
                            className={`font-bold text-sm ${
                              deliveryResult.success ? 'text-[#166534]' : 'text-[#991b1b]'
                            }`}
                          >
                            {deliveryResult.success
                              ? deliveryResult.dryRun
                                ? 'Dry-Run Simulation Successful!'
                                : '🎉 Pull Request Created Successfully!'
                              : 'Delivery Failed'}
                          </span>
                        </div>

                        {deliveryResult.result?.pullRequestUrl && (
                          <a
                            href={deliveryResult.result.pullRequestUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-primary text-xs px-3.5 py-1.5 bg-[#16a34a] hover:bg-[#15803d] flex items-center gap-1.5 shadow-sm"
                          >
                            <span>View Pull Request on GitHub</span>
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>

                      {deliveryResult.result?.pullRequestUrl && (
                        <div className="p-3 bg-white rounded-lg border border-[#bbf7d0] flex items-center justify-between text-xs">
                          <span className="font-mono text-[#166534] truncate max-w-xl">
                            {deliveryResult.result.pullRequestUrl}
                          </span>
                          <button
                            onClick={() => copyToClipboard(deliveryResult.result.pullRequestUrl, 'pr_url')}
                            className="text-[#166534] hover:text-[#14532d] font-semibold flex items-center gap-1"
                          >
                            {copiedKey === 'pr_url' ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedKey === 'pr_url' ? 'Copied' : 'Copy Link'}</span>
                          </button>
                        </div>
                      )}

                      {deliveryResult.error && (
                        <div className="p-2.5 bg-white rounded-lg border border-[#fecaca] text-[#991b1b] font-mono text-[11px]">
                          {deliveryResult.error}
                        </div>
                      )}

                      {deliveryResult.result?.diffSummary && (
                        <div className="text-[11px] font-mono text-[#334155] bg-white/60 p-2.5 rounded-lg border border-[#e2e8f0]">
                          <div className="font-semibold text-[#0f172a] mb-1">Diff Summary:</div>
                          <div>Files changed: {deliveryResult.result.filesCommitted?.join(', ') || 'tokens.css, tokens.ts'}</div>
                          {deliveryResult.result.branchCreated && (
                            <div>Branch created: {deliveryResult.result.branchCreated}</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: DOCUMENTATION (Interactive Reader matching Screenshot 1 & Guides)   */}
          {/* ========================================================================= */}
          {activeNav === 'docs' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#0f172a]">Supernova Documentation</h2>
                    <p className="text-xs text-[#64748b] mt-1">
                      Published documentation site for My Design System. Share with designers, engineers, and AI agents.
                    </p>
                  </div>
                  <a
                    href="/docs"
                    target="_blank"
                    className="btn-primary text-xs"
                  >
                    <span>Open Live Portal ↗</span>
                  </a>
                </div>
              </div>

              {/* Documentation Articles Grid */}
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-[#2563eb]">
                    <Sparkles size={16} />
                    <h3 className="text-sm font-bold text-[#0f172a]">Contexts 101</h3>
                  </div>
                  <p className="text-xs text-[#64748b]">
                    Contexts are reusable units of knowledge that provide guidance, instructions, documentation, and organizational expertise to humans and AI systems.
                  </p>
                  <div className="text-[11px] text-[#475569] bg-[#f8fafc] p-2.5 rounded-lg border border-[#e2e8f0]">
                    <strong>Included in context:</strong> Documentation pages, Design tokens, Token themes, Assets, Code components, Workspace knowledge.
                  </div>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-[#059669]">
                    <Layers size={16} />
                    <h3 className="text-sm font-bold text-[#0f172a]">Design Tokens Architecture</h3>
                  </div>
                  <p className="text-xs text-[#64748b]">
                    Full breakdown of token tiers (Global, Semantic, Component) and mathematical alias resolution.
                  </p>
                  <div className="text-[11px] text-[#475569] bg-[#f8fafc] p-2.5 rounded-lg border border-[#e2e8f0]">
                    <strong>Active tokens:</strong> {tokens.length} tokens registered in Postgres database with instantaneous MCP query access.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: INSIGHTS & MCP ANALYTICS                                            */}
          {/* ========================================================================= */}
          {(activeNav === 'mcp-analytics' ||
            activeNav === 'docs-analytics' ||
            activeNav === 'code-adoption' ||
            activeNav === 'feedback') && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-[#0f172a]">Insights & Analytics</h2>
                <p className="text-xs text-[#64748b] mt-1">
                  Track how engineering teams, documentation readers, and autonomous AI agents consume your design system.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white border border-[#e2e8f0] p-4 rounded-lg shadow-sm">
                  <div className="text-xs font-semibold text-[#64748b]">MCP Agent Requests</div>
                  <div className="text-2xl font-bold text-[#2563eb] mt-1">2,841</div>
                  <div className="text-[11px] text-[#10b981] mt-1">↑ 24% this week</div>
                </div>

                <div className="bg-white border border-[#e2e8f0] p-4 rounded-lg shadow-sm">
                  <div className="text-xs font-semibold text-[#64748b]">Connected Clients</div>
                  <div className="text-2xl font-bold text-[#0f172a] mt-1">4</div>
                  <div className="text-[11px] text-[#64748b] mt-1">Claude, Cursor, Codex, Windsurf</div>
                </div>

                <div className="bg-white border border-[#e2e8f0] p-4 rounded-lg shadow-sm">
                  <div className="text-xs font-semibold text-[#64748b]">Code Adoption Rate</div>
                  <div className="text-2xl font-bold text-[#059669] mt-1">94.2%</div>
                  <div className="text-[11px] text-[#10b981] mt-1">↑ 3.1% compliant</div>
                </div>

                <div className="bg-white border border-[#e2e8f0] p-4 rounded-lg shadow-sm">
                  <div className="text-xs font-semibold text-[#64748b]">Feedback Rating</div>
                  <div className="text-2xl font-bold text-[#7c3aed] mt-1">4.9 / 5</div>
                  <div className="text-[11px] text-[#64748b] mt-1">From 118 AI sessions</div>
                </div>
              </div>

              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
                  Most Queried Design Tokens by AI Coding Agents
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs">
                    <span className="font-mono font-medium text-[#2563eb]">color.brand.primary</span>
                    <span className="font-semibold text-[#0f172a]">1,102 queries</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs">
                    <span className="font-mono font-medium text-[#2563eb]">spacing.4</span>
                    <span className="font-semibold text-[#0f172a]">840 queries</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs">
                    <span className="font-mono font-medium text-[#2563eb]">radius.md</span>
                    <span className="font-semibold text-[#0f172a]">612 queries</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: TOKENS STUDIO (Studio Tools Sub-view)                                */}
          {/* ========================================================================= */}
          {activeNav === 'tokens' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex items-center justify-between bg-white border border-[#e2e8f0] p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-2.5 text-[#94a3b8]" />
                    <input
                      type="text"
                      placeholder="Filter tokens by path or value..."
                      value={tokenSearch}
                      onChange={(e) => setTokenSearch(e.target.value)}
                      className="bg-[#f8fafc] border border-[#cbd5e1] pl-8 pr-3 py-1.5 rounded-lg text-xs w-64 focus:outline-none focus:border-[#2563eb]"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-[#f8fafc] border border-[#cbd5e1] p-0.5 rounded-lg text-xs">
                    {['all', 'color', 'dimension', 'typography', 'shadow'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                          selectedCategory === cat ? 'bg-white font-semibold text-[#2563eb] shadow-sm' : 'text-[#64748b]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs">
                    <Plus size={14} />
                    <span>Add Token</span>
                  </button>
                </div>
              </div>

              {/* Tokens Table */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] font-semibold">
                      <th className="py-2.5 px-4">Preview</th>
                      <th className="py-2.5 px-4">Token Path</th>
                      <th className="py-2.5 px-4">Raw Value</th>
                      <th className="py-2.5 px-4">Resolved Value</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredTokens.map((t) => (
                      <tr key={t.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-4">
                          {t.category === 'color' ? (
                            <div
                              className="w-5 h-5 rounded border border-[#cbd5e1] shadow-xs"
                              style={{ backgroundColor: t.resolvedValue || t.rawValue }}
                            />
                          ) : (
                            <span className="text-[10px] font-mono text-[#64748b]">[{t.category}]</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-medium text-[#0f172a]">{t.path}</td>
                        <td className="py-2.5 px-4 font-mono text-[#64748b]">{t.rawValue}</td>
                        <td className="py-2.5 px-4 font-mono text-[#2563eb] font-semibold">{t.resolvedValue || t.rawValue}</td>
                        <td className="py-2.5 px-4 capitalize text-[#64748b]">{t.category}</td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteToken(t.id)}
                            className="text-[#94a3b8] hover:text-[#ef4444] transition-colors p-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: COMPONENTS SANDBOX                                                  */}
          {/* ========================================================================= */}
          {activeNav === 'components' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-[#0f172a]">Interactive Components Sandbox</h2>
                <p className="text-xs text-[#64748b] mt-1">
                  Preview and test design system components styled with genuine Supernova design tokens.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Button Component */}
                <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0f172a]">Button</h3>
                    <span className="text-[10px] font-mono text-[#2563eb] bg-[#eff6ff] px-1.5 py-0.5 rounded">
                      var(--color-brand-primary)
                    </span>
                  </div>
                  <div className="p-6 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => setButtonClicks((c) => c + 1)}
                      className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                    >
                      Clicked: {buttonClicks} times
                    </button>
                  </div>
                </div>

                {/* Input Component */}
                <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0f172a]">Input</h3>
                    <span className="text-[10px] font-mono text-[#2563eb] bg-[#eff6ff] px-1.5 py-0.5 rounded">
                      var(--border-subtle)
                    </span>
                  </div>
                  <div className="p-6 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
                    <input
                      type="text"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      className="w-full bg-white border border-[#cbd5e1] px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-[#2563eb]"
                    />
                  </div>
                </div>

                {/* Badge Component */}
                <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0f172a]">Badge</h3>
                    <span className="text-[10px] font-mono text-[#2563eb] bg-[#eff6ff] px-1.5 py-0.5 rounded">
                      var(--accent-emerald)
                    </span>
                  </div>
                  <div className="p-6 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg flex items-center justify-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-semibold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] rounded-full">
                      Success Status
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: FIGMA SYNC                                                          */}
          {/* ========================================================================= */}
          {activeNav === 'figma' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <IntegrationLogo name="figma" size={20} />
                  <h2 className="text-base font-bold text-[#0f172a]">Figma Variables & Styles Synchronizer</h2>
                </div>
                <p className="text-xs text-[#64748b]">
                  Import color modes, radii, and typography scales from your Figma design files directly into the Supernova design system.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[#475569] block mb-1">Figma File Key</label>
                    <input
                      type="text"
                      value={figmaFileKey}
                      onChange={(e) => setFigmaFileKey(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-2 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#475569] block mb-1">Mode / Theme</label>
                    <select
                      value={figmaMode}
                      onChange={(e) => setFigmaMode(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-2 rounded-lg text-xs"
                    >
                      <option value="Light">Light Mode</option>
                      <option value="Dark">Dark Mode</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSyncFigma}
                    disabled={figmaSyncing}
                    className="btn-primary text-xs"
                  >
                    {figmaSyncing ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
                    <span>{figmaSyncing ? 'Synchronizing Figma Tokens...' : 'Synchronize Tokens Now'}</span>
                  </button>
                </div>

                {figmaDiffResult && (
                  <div className="mt-4 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs">
                    <div className="font-semibold text-[#0f172a] mb-2">Sync Diff Results:</div>
                    <pre className="text-[11px] font-mono text-[#334155]">
                      {JSON.stringify(figmaDiffResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: AST AUDIT                                                           */}
          {/* ========================================================================= */}
          {activeNav === 'audit' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[#0f172a]">AST Code Compliance Linter</h2>
                    <p className="text-xs text-[#64748b] mt-1">
                      Scans source code for hardcoded color hexes, arbitrary spacing, and unmapped tokens.
                    </p>
                  </div>
                  <button onClick={handleRunAudit} disabled={auditing} className="btn-primary text-xs">
                    {auditing ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
                    <span>{auditing ? 'Auditing AST...' : 'Run Compliance Audit'}</span>
                  </button>
                </div>

                <div>
                  <textarea
                    rows={10}
                    value={auditCode}
                    onChange={(e) => setAuditCode(e.target.value)}
                    className="w-full bg-[#0f172a] text-[#f8fafc] font-mono text-xs p-4 rounded-lg focus:outline-none"
                  />
                </div>

                {auditReport && (
                  <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0f172a]">
                        Audit Score: {auditReport.score}% Compliant
                      </span>
                      <span className="text-xs text-[#ef4444] font-semibold">
                        {auditReport.violations?.length || 0} Violations Found
                      </span>
                    </div>

                    <div className="space-y-2">
                      {auditReport.violations?.map((v: any, i: number) => (
                        <div key={i} className="p-2.5 bg-white border border-[#fca5a5] rounded text-xs flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-[#b91c1c] capitalize">[{v.type}]</span>{' '}
                            <span className="text-[#334155]">{v.message}</span>
                          </div>
                          <span className="text-[11px] font-mono text-[#64748b]">Line {v.line}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: RELEASES                                                            */}
          {/* ========================================================================= */}
          {activeNav === 'releases' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0f172a]">Design System Releases</h2>
                  <p className="text-xs text-[#64748b] mt-1">
                    Immutable SemVer release tags and automated changelogs.
                  </p>
                </div>
                <button onClick={() => setShowReleaseModal(true)} className="btn-primary text-xs">
                  <Plus size={14} />
                  <span>Create Release</span>
                </button>
              </div>

              <div className="space-y-3">
                {releasesList.map((r) => (
                  <div key={r.id} className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-[#2563eb]" />
                        <span className="text-sm font-bold text-[#0f172a]">v{r.version}</span>
                        <span className="text-xs text-[#64748b] font-medium">— {r.title}</span>
                      </div>
                      <span className="text-[11px] text-[#94a3b8]">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-[#475569]">{r.changelog}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ADD TOKEN MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#0f172a]">Add Design Token</h3>

            <form onSubmit={handleAddToken} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#475569] block mb-1">Token Path</label>
                <input
                  type="text"
                  value={newTokenPath}
                  onChange={(e) => setNewTokenPath(e.target.value)}
                  placeholder="e.g. color.brand.accent"
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-lg font-mono focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#475569] block mb-1">Raw Value</label>
                <input
                  type="text"
                  value={newTokenValue}
                  onChange={(e) => setNewTokenValue(e.target.value)}
                  placeholder="e.g. #06b6d4 or 16px"
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-lg font-mono focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#475569] block mb-1">Category</label>
                <select
                  value={newTokenCategory}
                  onChange={(e) => setNewTokenCategory(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-lg focus:outline-none"
                >
                  <option value="color">Color</option>
                  <option value="dimension">Dimension</option>
                  <option value="typography">Typography</option>
                  <option value="shadow">Shadow</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#475569] block mb-1">Description</label>
                <input
                  type="text"
                  value={newTokenDesc}
                  onChange={(e) => setNewTokenDesc(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-lg focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" disabled={savingToken} className="btn-primary text-xs">
                  {savingToken ? 'Saving...' : 'Save Token'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE RELEASE MODAL */}
      {showReleaseModal && (
        <div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#0f172a]">Publish New Release</h3>

            <form onSubmit={handleCreateRelease} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#475569] block mb-1">SemVer Version</label>
                <input
                  type="text"
                  value={newReleaseVersion}
                  onChange={(e) => setNewReleaseVersion(e.target.value)}
                  placeholder="e.g. 1.3.0"
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-lg font-mono focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#475569] block mb-1">Release Title</label>
                <input
                  type="text"
                  value={newReleaseTitle}
                  onChange={(e) => setNewReleaseTitle(e.target.value)}
                  placeholder="e.g. Q4 Design Tokens Refresh"
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#475569] block mb-1">Changelog</label>
                <textarea
                  rows={3}
                  value={newReleaseChangelog}
                  onChange={(e) => setNewReleaseChangelog(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReleaseModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" disabled={publishingRelease} className="btn-primary text-xs">
                  {publishingRelease ? 'Publishing...' : 'Publish Release'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONNECT GITHUB MODAL */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0f172a] flex items-center justify-center text-white">
                  <IntegrationLogo name="github" size={20} className="brightness-200 invert" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a]">Connect GitHub Account</h3>
                  <p className="text-xs text-[#64748b]">Authorize Nexus Design OS to deliver pull requests</p>
                </div>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-[#94a3b8] hover:text-[#0f172a] text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Option 1: 1-Click OAuth */}
            <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                  Option 1: Sign in with GitHub
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#eff6ff] text-[#2563eb]">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-[#64748b]">
                Authenticate directly with GitHub OAuth. Automatically connects repo access for seamless 1-click token delivery.
              </p>
              <a
                href="/api/github/oauth"
                className="w-full btn-primary py-2 text-xs flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-[#1e293b]"
              >
                <IntegrationLogo name="github" size={16} className="brightness-200 invert" />
                <span>Continue with GitHub OAuth</span>
                <ArrowRight size={13} />
              </a>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#e2e8f0] w-full"></div>
              <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-[#94a3b8] absolute font-semibold">
                Or Fast Connect with Token
              </span>
            </div>

            {/* Option 2: Personal Access Token Fast Connect */}
            <form onSubmit={handleConnectGithubToken} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#475569] block mb-1">
                  GitHub Personal Access Token (PAT)
                </label>
                <input
                  type="password"
                  value={customGithubToken}
                  onChange={(e) => setCustomGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or github_pat_..."
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#2563eb]"
                  required
                />
                <div className="flex items-center justify-between mt-1 text-[11px] text-[#64748b]">
                  <span>Requires `repo` scope to create PRs.</span>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=Nexus+Design+OS"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#2563eb] hover:underline flex items-center gap-0.5 font-medium"
                  >
                    Generate Token ↗
                  </a>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={connectingGithub || !customGithubToken.trim()}
                  className="btn-primary text-xs px-4 py-2"
                >
                  {connectingGithub ? 'Connecting...' : 'Connect Token'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
