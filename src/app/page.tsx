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
} from 'lucide-react';

function FigmaIcon({ size = 16, color = '#06b6d4', style }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 38 57" fill="none" style={style} xmlns="http://www.w3.org/2000/svg">
      <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE" />
      <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83" />
      <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262" />
      <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E" />
      <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF" />
    </svg>
  );
}

export default function SupernovaStudio() {
  // Navigation matching Supernova Studio
  const [activeNav, setActiveNav] = useState<'tokens' | 'components' | 'figma' | 'exporters' | 'delivery' | 'audit' | 'releases' | 'mcp'>('tokens');

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
  const [exportFormat, setExportFormat] = useState<'css' | 'json' | 'typescript' | 'tailwind' | 'swift' | 'kotlin'>('css');
  const [exportedContent, setExportedContent] = useState<any>(null);
  const [loadingExport, setLoadingExport] = useState<boolean>(false);

  // Delivery state
  const [targetRepo, setTargetRepo] = useState<string>('acme-corp/web-platform-core');
  const [targetBranch, setTargetBranch] = useState<string>('main');
  const [prTitle, setPrTitle] = useState<string>('chore: update design tokens from Supernova Studio');
  const [delivering, setDelivering] = useState<boolean>(false);
  const [deliveryResult, setDeliveryResult] = useState<any>(null);

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
  const [newReleaseVersion, setNewReleaseVersion] = useState<string>('1.4.0');
  const [newReleaseTitle, setNewReleaseTitle] = useState<string>('Typography Scale & Mobile Exporters');
  const [newReleaseChangelog, setNewReleaseChangelog] = useState<string>('• Refined typography scale\n• Updated iOS SwiftUI and Android Kotlin color mappings\n• Enhanced component token dependencies');
  const [publishingRelease, setPublishingRelease] = useState<boolean>(false);

  // MCP state
  const [mcpTool, setMcpTool] = useState<string>('get_tokens');
  const [mcpCustomArg, setMcpCustomArg] = useState<string>('{"category": "color"}');
  const [mcpResult, setMcpResult] = useState<any>(null);
  const [mcpLoading, setMcpLoading] = useState<boolean>(false);

  // Copy feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchTokens();
    fetchComponents();
    fetchReleases();
  }, []);

  const fetchTokens = async () => {
    setLoadingTokens(true);
    try {
      const res = await fetch('/api/tokens');
      const data = await res.json();
      if (data.tokens) {
        setTokens(data.tokens);
        if (data.tokens.length > 0 && !selectedToken) {
          const defaultToken = data.tokens.find((t: any) => t.path === 'color.brand.primary') || data.tokens[0];
          setSelectedToken(defaultToken);
        }
      }
    } catch (err) {
      console.error('Failed to fetch tokens', err);
    } finally {
      setLoadingTokens(false);
    }
  };

  const fetchComponents = async () => {
    try {
      const res = await fetch('/api/components');
      const data = await res.json();
      if (data.components) {
        setComponents(data.components);
        if (data.components.length > 0 && !selectedComponent) {
          setSelectedComponent(data.components[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch components', err);
    }
  };

  const fetchReleases = async () => {
    try {
      const res = await fetch('/api/releases');
      const data = await res.json();
      if (data.releases) {
        setReleasesList(data.releases);
      }
    } catch (err) {
      console.error('Failed to fetch releases', err);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Add token
  const handleAddToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingToken(true);
    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: newTokenPath,
          category: newTokenCategory,
          rawValue: newTokenValue,
          description: newTokenDesc,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        await fetchTokens();
      } else {
        alert(data.error || 'Failed to save token');
      }
    } catch (err) {
      console.error('Failed to save token', err);
    } finally {
      setSavingToken(false);
    }
  };

  // Delete token
  const handleDeleteToken = async (id: string) => {
    if (!confirm('Are you sure you want to delete this token?')) return;
    try {
      const res = await fetch(`/api/tokens?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTokens((prev) => prev.filter((t) => t.id !== id));
        if (selectedToken?.id === id) {
          setSelectedToken(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete token', err);
    }
  };

  // Figma sync
  const handleFigmaSync = async (applyChanges: boolean = false) => {
    setFigmaSyncing(true);
    try {
      const res = await fetch('/api/figma/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileKey: figmaFileKey,
          figmaToken: figmaToken || undefined,
          modeName: figmaMode,
          applyChanges,
          dryRun: !figmaToken,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFigmaDiffResult(data);
        if (applyChanges) {
          await fetchTokens();
          alert(`Successfully synced ${data.appliedCount} tokens from Figma!`);
        }
      }
    } catch (err) {
      console.error('Figma sync error', err);
    } finally {
      setFigmaSyncing(false);
    }
  };

  // Exporters
  const loadExport = async (format: 'css' | 'json' | 'typescript' | 'tailwind' | 'swift' | 'kotlin') => {
    setLoadingExport(true);
    setExportFormat(format);
    try {
      const res = await fetch(`/api/export?format=${format}`);
      const data = await res.json();
      setExportedContent(data);
    } catch (err) {
      console.error('Failed to load export', err);
    } finally {
      setLoadingExport(false);
    }
  };

  useEffect(() => {
    if (activeNav === 'exporters' && !exportedContent) {
      loadExport('css');
    }
  }, [activeNav]);

  const handleDownloadExport = () => {
    if (!exportedContent?.content) return;
    const blob = new Blob([exportedContent.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportedContent.filename || `tokens.${exportFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Delivery
  const triggerDelivery = async () => {
    setDelivering(true);
    try {
      const res = await fetch('/api/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoOwner: targetRepo.split('/')[0] || 'acme-corp',
          repoName: targetRepo.split('/')[1] || 'web-platform-core',
          targetBranch,
          prTitle,
        }),
      });
      const data = await res.json();
      setDeliveryResult(data.result);
    } catch (err) {
      console.error('Delivery failed', err);
    } finally {
      setDelivering(false);
    }
  };

  // Audit
  const runAudit = async (customCode?: string) => {
    setAuditing(true);
    const code = customCode !== undefined ? customCode : auditCode;
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeContent: code, filePath: 'src/Card.tsx' }),
      });
      const data = await res.json();
      if (data.report) {
        setAuditReport(data.report);
      }
    } catch (err) {
      console.error('Failed to run audit', err);
    } finally {
      setAuditing(false);
    }
  };

  const handleApplyFix = (ruleId: string, fixText: string) => {
    let updated = auditCode;
    if (ruleId === 'no-hardcoded-colors') {
      updated = updated.replace(/#3b82f6/g, 'var(--color-brand-primary)');
    } else if (ruleId === 'spacing-scale-only') {
      updated = updated.replace(/'17px'/g, "'var(--space-md)'");
    } else if (ruleId === 'no-unregistered-tokens') {
      updated = updated.replace(/var\(--color-unknown-fake\)/g, 'var(--color-text-primary)');
    } else if (ruleId === 'no-deprecated-tokens') {
      updated = updated.replace(/var\(--color-legacy-accent\)/g, 'var(--color-brand-primary)');
    }
    setAuditCode(updated);
    runAudit(updated);
  };

  // Publish release
  const handlePublishRelease = async (e: React.FormEvent) => {
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
        await fetchReleases();
        alert(`Version release v${newReleaseVersion} published successfully!`);
      } else {
        alert(data.error || 'Failed to publish release');
      }
    } catch (err) {
      console.error('Failed to publish release', err);
    } finally {
      setPublishingRelease(false);
    }
  };

  // MCP tool call
  const executeMcpTool = async () => {
    setMcpLoading(true);
    try {
      let args = {};
      if (mcpCustomArg.trim()) {
        try { args = JSON.parse(mcpCustomArg); } catch (e) {}
      }
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName: mcpTool, args }),
      });
      const data = await res.json();
      setMcpResult(data.mcpResponse);
    } catch (err) {
      console.error('Failed to invoke MCP tool', err);
    } finally {
      setMcpLoading(false);
    }
  };

  // Token filtering
  const filteredTokens = tokens.filter((t) => {
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch =
      tokenSearch === '' ||
      t.path.toLowerCase().includes(tokenSearch.toLowerCase()) ||
      t.resolvedValue.toLowerCase().includes(tokenSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const tokenCategories = [
    { id: 'all', label: 'All Tokens', icon: '✦', count: tokens.length },
    { id: 'color', label: 'Color', icon: '🎨', count: tokens.filter((t) => t.category === 'color').length },
    { id: 'spacing', label: 'Spacing & Dimensions', icon: '📏', count: tokens.filter((t) => t.category === 'spacing').length },
    { id: 'borderRadius', label: 'Border Radius', icon: '🔲', count: tokens.filter((t) => t.category === 'borderRadius').length },
    { id: 'typography', label: 'Typography', icon: '✍️', count: tokens.filter((t) => t.category === 'typography').length },
  ];

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 50px)', background: 'var(--bg-app)' }}>
      {/* Supernova Left Sidebar Navigation */}
      <aside
        style={{
          width: '230px',
          borderRight: '1px solid var(--border-subtle)',
          background: 'var(--bg-sidebar)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 10px',
          gap: '20px',
          flexShrink: 0,
        }}
      >
        {/* SECTION: DATA SOURCES */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '0 8px 6px' }}>
            DATA SOURCES
          </div>
          <button
            onClick={() => setActiveNav('figma')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 10px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: activeNav === 'figma' ? 600 : 500,
              background: activeNav === 'figma' ? 'var(--bg-surface-hover)' : 'transparent',
              color: activeNav === 'figma' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FigmaIcon size={14} />
              <span>Figma Variables</span>
            </div>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
          </button>
        </div>

        {/* SECTION: DESIGN SYSTEM */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '0 8px 6px' }}>
            DESIGN SYSTEM
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <button
              onClick={() => setActiveNav('tokens')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeNav === 'tokens' ? 600 : 500,
                background: activeNav === 'tokens' ? 'var(--bg-surface-hover)' : 'transparent',
                color: activeNav === 'tokens' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={14} color={activeNav === 'tokens' ? '#3b82f6' : '#a1a1aa'} />
                <span>Tokens</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tokens.length}</span>
            </button>

            <button
              onClick={() => setActiveNav('components')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeNav === 'components' ? 600 : 500,
                background: activeNav === 'components' ? 'var(--bg-surface-hover)' : 'transparent',
                color: activeNav === 'components' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box size={14} color={activeNav === 'components' ? '#3b82f6' : '#a1a1aa'} />
                <span>Components</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{components.length}</span>
            </button>
          </div>
        </div>

        {/* SECTION: CODE INTEGRATION */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '0 8px 6px' }}>
            CODE INTEGRATION
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <button
              onClick={() => setActiveNav('exporters')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 10px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeNav === 'exporters' ? 600 : 500,
                background: activeNav === 'exporters' ? 'var(--bg-surface-hover)' : 'transparent',
                color: activeNav === 'exporters' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <FileCode size={14} color={activeNav === 'exporters' ? '#3b82f6' : '#a1a1aa'} />
              <span>Exporters Store</span>
            </button>

            <button
              onClick={() => setActiveNav('delivery')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 10px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeNav === 'delivery' ? 600 : 500,
                background: activeNav === 'delivery' ? 'var(--bg-surface-hover)' : 'transparent',
                color: activeNav === 'delivery' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <GitPullRequest size={14} color={activeNav === 'delivery' ? '#3b82f6' : '#a1a1aa'} />
              <span>Delivery Pipelines</span>
            </button>

            <button
              onClick={() => {
                setActiveNav('audit');
                if (!auditReport) runAudit();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 10px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeNav === 'audit' ? 600 : 500,
                background: activeNav === 'audit' ? 'var(--bg-surface-hover)' : 'transparent',
                color: activeNav === 'audit' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <ShieldCheck size={14} color={activeNav === 'audit' ? '#3b82f6' : '#a1a1aa'} />
              <span>Quality & Linter</span>
            </button>
          </div>
        </div>

        {/* SECTION: VERSION CONTROL */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '0 8px 6px' }}>
            VERSIONS & HISTORY
          </div>
          <button
            onClick={() => setActiveNav('releases')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 10px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: activeNav === 'releases' ? 600 : 500,
              background: activeNav === 'releases' ? 'var(--bg-surface-hover)' : 'transparent',
              color: activeNav === 'releases' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={14} color={activeNav === 'releases' ? '#3b82f6' : '#a1a1aa'} />
              <span>Releases</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{releasesList.length}</span>
          </button>
        </div>

        {/* SECTION: AI AGENTS */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '0 8px 6px' }}>
            AI AGENTS (MCP)
          </div>
          <button
            onClick={() => setActiveNav('mcp')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: activeNav === 'mcp' ? 600 : 500,
              background: activeNav === 'mcp' ? 'var(--bg-surface-hover)' : 'transparent',
              color: activeNav === 'mcp' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <Cpu size={14} color={activeNav === 'mcp' ? '#3b82f6' : '#a1a1aa'} />
            <span>MCP Agent Server</span>
          </button>
        </div>

        {/* Publish Version Action */}
        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setShowReleaseModal(true)}
            className="btn-primary"
            style={{ width: '100%', fontSize: '12px', padding: '7px 12px' }}
          >
            <Tag size={12} /> Publish Version...
          </button>
        </div>
      </aside>

      {/* Main Studio Work Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* ======================================================== */}
        {/* VIEW 1: TOKENS STUDIO (Supernova 3-Pane Layout) */}
        {/* ======================================================== */}
        {activeNav === 'tokens' && (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Left Sub-Sidebar: Token Taxonomy Categories */}
            <div
              style={{
                width: '210px',
                borderRight: '1px solid var(--border-subtle)',
                background: 'var(--bg-app)',
                display: 'flex',
                flexDirection: 'column',
                padding: '16px 10px',
                gap: '4px',
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0 8px 8px' }}>
                CATEGORIES
              </div>

              {tokenCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: selectedCategory === cat.id ? 600 : 500,
                    background: selectedCategory === cat.id ? 'var(--bg-surface)' : 'transparent',
                    color: selectedCategory === cat.id ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid',
                    borderColor: selectedCategory === cat.id ? 'var(--border-default)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px' }}>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cat.count}</span>
                </button>
              ))}

              <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-secondary"
                  style={{ width: '100%', fontSize: '12px', padding: '6px 10px' }}
                >
                  <Plus size={13} /> Add New Token
                </button>
              </div>
            </div>

            {/* Middle Main Canvas: Token Table */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Header Bar */}
              <div
                style={{
                  height: '46px',
                  borderBottom: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 18px',
                }}
              >
                {/* Theme Mode Tabs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {(['all', 'light', 'dark'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setActiveThemeMode(m)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        background: activeThemeMode === m ? '#27272a' : 'transparent',
                        color: activeThemeMode === m ? '#fff' : 'var(--text-muted)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {m === 'all' ? 'All Modes' : `${m} Mode`}
                    </button>
                  ))}
                </div>

                {/* Search & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                    <input
                      type="text"
                      placeholder="Filter tokens..."
                      value={tokenSearch}
                      onChange={(e) => setTokenSearch(e.target.value)}
                      style={{
                        background: '#121215',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '5px 10px 5px 28px',
                        color: '#fff',
                        fontSize: '12px',
                        width: '180px',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <button onClick={() => setActiveNav('figma')} className="btn-secondary" style={{ fontSize: '12px', padding: '5px 10px' }}>
                    <FigmaIcon size={12} /> Sync Figma
                  </button>
                </div>
              </div>

              {/* High-Density Token Table */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-app)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '10px 18px', fontWeight: 600 }}>NAME / PATH</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600, width: '60px' }}>PREVIEW</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>RAW / ALIAS</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>RESOLVED VALUE</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>CATEGORY</th>
                      <th style={{ padding: '10px 18px', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTokens.map((t) => {
                      const isSelected = selectedToken?.id === t.id;
                      return (
                        <tr
                          key={t.id}
                          onClick={() => setSelectedToken(t)}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            background: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background 0.1s ease',
                          }}
                        >
                          <td style={{ padding: '10px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="font-mono" style={{ fontWeight: 600, color: isSelected ? '#60a5fa' : '#f4f4f6' }}>
                                {t.path}
                              </span>
                              {t.isAlias && <span className="badge badge-indigo">Alias</span>}
                              {t.isDeprecated && <span className="badge badge-rose">Deprecated</span>}
                            </div>
                            {t.description && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{t.description}</div>}
                          </td>

                          <td style={{ padding: '10px 14px' }}>
                            {t.category === 'color' && t.resolvedValue.startsWith('#') && (
                              <div
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '4px',
                                  background: t.resolvedValue,
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                }}
                              />
                            )}
                            {t.category === 'spacing' && (
                              <div
                                style={{
                                  width: t.resolvedValue,
                                  height: '10px',
                                  background: '#3b82f6',
                                  borderRadius: '2px',
                                }}
                              />
                            )}
                            {t.category === 'borderRadius' && (
                              <div
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  border: '1px solid #06b6d4',
                                  borderRadius: t.resolvedValue === '9999px' ? '50%' : t.resolvedValue,
                                }}
                              />
                            )}
                            {t.category === 'typography' && (
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#a1a1aa' }}>Ag</span>
                            )}
                          </td>

                          <td style={{ padding: '10px 14px' }}>
                            <span className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                              {t.rawValue}
                            </span>
                          </td>

                          <td style={{ padding: '10px 14px' }}>
                            <span className="font-mono" style={{ color: '#10b981', fontWeight: 600 }}>
                              {t.resolvedValue}
                            </span>
                          </td>

                          <td style={{ padding: '10px 14px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.category}</span>
                          </td>

                          <td style={{ padding: '10px 18px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(`var(--${t.path.replace(/\./g, '-')})`, t.id);
                                }}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: copiedKey === t.id ? '#10b981' : 'var(--text-muted)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '11px',
                                }}
                              >
                                {copiedKey === t.id ? <Check size={12} /> : <Copy size={12} />}
                                {copiedKey === t.id ? 'Copied' : 'CSS'}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteToken(t.id);
                                }}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                title="Delete token"
                              >
                                <Trash2 size={12} color="#f43f5e" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Pane: Supernova Token Property Inspector */}
            {selectedToken && (
              <div
                style={{
                  width: '320px',
                  borderLeft: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '20px',
                  gap: '20px',
                  overflowY: 'auto',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    TOKEN INSPECTOR
                  </div>
                  <button
                    onClick={() => setSelectedToken(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <h3 className="font-mono" style={{ fontSize: '15px', fontWeight: 700, color: '#fff', wordBreak: 'break-all' }}>
                    {selectedToken.path}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {selectedToken.description || 'No description provided'}
                  </div>
                </div>

                {/* Swatch Preview */}
                <div style={{ background: '#121215', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {selectedToken.category === 'color' && (
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        background: selectedToken.resolvedValue,
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    />
                  )}
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>RESOLVED VALUE</div>
                    <div className="font-mono" style={{ fontSize: '16px', fontWeight: 700, color: '#10b981' }}>
                      {selectedToken.resolvedValue}
                    </div>
                  </div>
                </div>

                {/* Alias Chain Graph */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#a1a1aa', marginBottom: '8px' }}>
                    ALIAS DEPENDENCY CHAIN
                  </div>
                  {selectedToken.isAlias ? (
                    <div style={{ background: '#121215', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="badge badge-indigo">Semantic</span>
                        <span className="font-mono" style={{ fontSize: '12px', color: '#fff' }}>{selectedToken.path}</span>
                      </div>
                      <div style={{ paddingLeft: '14px', color: 'var(--text-muted)', fontSize: '11px' }}>↓ references</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="badge badge-emerald">Primitive</span>
                        <span className="font-mono" style={{ fontSize: '12px', color: '#6ee7b7' }}>{selectedToken.aliasTarget || selectedToken.rawValue}</span>
                      </div>
                      <div style={{ paddingLeft: '14px', color: 'var(--text-muted)', fontSize: '11px' }}>↓ resolves to</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="badge" style={{ background: '#2563eb', color: '#fff' }}>Literal</span>
                        <span className="font-mono" style={{ fontSize: '12px', color: '#fff' }}>{selectedToken.resolvedValue}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: '#121215', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Root primitive token with no upstream aliases.
                    </div>
                  )}
                </div>

                {/* Component Usage */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#a1a1aa', marginBottom: '8px' }}>
                    CONSUMED BY COMPONENTS
                  </div>
                  {components.filter((c) => c.tokenDependencies?.includes(selectedToken.path)).length > 0 ? (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {components
                        .filter((c) => c.tokenDependencies?.includes(selectedToken.path))
                        .map((c) => (
                          <span key={c.id} className="badge badge-indigo">
                            <Box size={10} style={{ marginRight: '4px' }} />
                            {c.name}
                          </span>
                        ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Not currently referenced by registered components.
                    </div>
                  )}
                </div>

                {/* Copy Syntax */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#a1a1aa', marginBottom: '8px' }}>
                    CODE SYNTAX (MULTI-PLATFORM)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <button
                      onClick={() => copyToClipboard(`var(--${selectedToken.path.replace(/\./g, '-')})`, 'insp-css')}
                      className="btn-secondary"
                      style={{ fontSize: '11px', padding: '5px 8px', justifyContent: 'center' }}
                    >
                      {copiedKey === 'insp-css' ? 'Copied' : 'CSS Variable'}
                    </button>
                    <button
                      onClick={() => copyToClipboard(`Tokens.${selectedToken.path.split('.').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join('')}`, 'insp-swift')}
                      className="btn-secondary"
                      style={{ fontSize: '11px', padding: '5px 8px', justifyContent: 'center' }}
                    >
                      {copiedKey === 'insp-swift' ? 'Copied' : 'Swift (iOS)'}
                    </button>
                    <button
                      onClick={() => copyToClipboard(`Tokens.${selectedToken.path.split('.').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join('')}`, 'insp-kt')}
                      className="btn-secondary"
                      style={{ fontSize: '11px', padding: '5px 8px', justifyContent: 'center' }}
                    >
                      {copiedKey === 'insp-kt' ? 'Copied' : 'Kotlin (Compose)'}
                    </button>
                    <button
                      onClick={() => copyToClipboard(`tokens.${selectedToken.path}`, 'insp-ts')}
                      className="btn-secondary"
                      style={{ fontSize: '11px', padding: '5px 8px', justifyContent: 'center' }}
                    >
                      {copiedKey === 'insp-ts' ? 'Copied' : 'TypeScript'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: COMPONENT REGISTRY & SANDBOX */}
        {/* ======================================================== */}
        {activeNav === 'components' && (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Component Sub-Nav */}
            <div
              style={{
                width: '220px',
                borderRight: '1px solid var(--border-subtle)',
                background: 'var(--bg-app)',
                display: 'flex',
                flexDirection: 'column',
                padding: '16px 10px',
                gap: '4px',
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0 8px 8px' }}>
                COMPONENTS ({components.length})
              </div>

              {components.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedComponent(c)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: selectedComponent?.id === c.id ? 600 : 500,
                    background: selectedComponent?.id === c.id ? 'var(--bg-surface)' : 'transparent',
                    color: selectedComponent?.id === c.id ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid',
                    borderColor: selectedComponent?.id === c.id ? 'var(--border-default)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Box size={14} color={selectedComponent?.id === c.id ? '#3b82f6' : '#a1a1aa'} />
                    <span>{c.name}</span>
                  </div>
                  <span className="badge" style={{ background: '#27272a', color: '#a1a1aa', fontSize: '10px' }}>
                    {c.category}
                  </span>
                </button>
              ))}
            </div>

            {/* Component Workbench */}
            {selectedComponent && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '24px 32px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>{selectedComponent.name}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
                      {selectedComponent.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="badge badge-emerald">React / TypeScript</span>
                    <span className="badge badge-indigo">{selectedComponent.category}</span>
                  </div>
                </div>

                {/* Interactive Variant Controls Bar */}
                {selectedComponent.name === 'Button' && (
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-subtle)', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Variant:</span>
                      {['primary', 'secondary', 'ghost', 'danger'].map((v) => (
                        <button
                          key={v}
                          onClick={() => setComponentVariant(v)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            border: '1px solid',
                            borderColor: componentVariant === v ? '#3b82f6' : 'var(--border-subtle)',
                            background: componentVariant === v ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                            color: componentVariant === v ? '#60a5fa' : 'var(--text-secondary)',
                            cursor: 'pointer',
                          }}
                        >
                          {v}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Size:</span>
                      {['sm', 'md', 'lg'].map((s) => (
                        <button
                          key={s}
                          onClick={() => setComponentSize(s)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            border: '1px solid',
                            borderColor: componentSize === s ? '#3b82f6' : 'var(--border-subtle)',
                            background: componentSize === s ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                            color: componentSize === s ? '#60a5fa' : 'var(--text-secondary)',
                            cursor: 'pointer',
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Component Canvas */}
                <div
                  style={{
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '140px',
                    marginBottom: '24px',
                  }}
                >
                  {selectedComponent.name === 'Button' && (
                    <button
                      onClick={() => setButtonClicks((c) => c + 1)}
                      className={componentVariant === 'primary' ? 'btn-primary' : componentVariant === 'secondary' ? 'btn-secondary' : componentVariant === 'danger' ? 'btn-danger' : 'btn-ghost'}
                      style={{
                        padding: componentSize === 'sm' ? '5px 12px' : componentSize === 'lg' ? '10px 20px' : '7px 16px',
                        fontSize: componentSize === 'sm' ? '12px' : componentSize === 'lg' ? '15px' : '13px',
                      }}
                    >
                      {selectedComponent.name} &bull; {componentVariant} ({componentSize}) {buttonClicks > 0 && `(${buttonClicks})`}
                    </button>
                  )}

                  {selectedComponent.name === 'Badge' && (
                    <span className="badge badge-emerald" style={{ padding: '6px 14px', fontSize: '13px' }}>
                      Production Ready &bull; Synced
                    </span>
                  )}

                  {selectedComponent.name === 'TextInput' && (
                    <div style={{ width: '100%', maxWidth: '320px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email Address</label>
                      <input
                        type="text"
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          background: '#121215',
                          border: '1px solid var(--border-default)',
                          color: '#fff',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                    </div>
                  )}

                  {selectedComponent.name === 'Card' && (
                    <div style={{ maxWidth: '380px', padding: '20px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 600, fontSize: '15px', color: '#fff', marginBottom: '6px' }}>Card Component</div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Container component bound to radius, spacing, and surface token dependencies.</p>
                    </div>
                  )}
                </div>

                {/* Tabs: Specs & Code */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  {(['props', 'tokens', 'code'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setComponentTab(t)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        background: componentTab === t ? 'var(--bg-surface)' : 'transparent',
                        color: componentTab === t ? '#fff' : 'var(--text-muted)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {t === 'props' ? 'Props Contract' : t === 'tokens' ? 'Token Dependencies' : 'Code Generator'}
                    </button>
                  ))}
                </div>

                {componentTab === 'props' && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                        <th style={{ padding: '8px 12px' }}>PROP</th>
                        <th style={{ padding: '8px 12px' }}>TYPE</th>
                        <th style={{ padding: '8px 12px' }}>REQUIRED</th>
                        <th style={{ padding: '8px 12px' }}>DEFAULT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedComponent.props?.map((p: any) => (
                        <tr key={p.name} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: '#fff' }}>{p.name}</td>
                          <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#60a5fa' }}>{p.type}</td>
                          <td style={{ padding: '8px 12px' }}>{p.required ? <span className="badge badge-rose">Yes</span> : 'No'}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{p.defaultValue || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {componentTab === 'tokens' && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedComponent.tokenDependencies?.map((dep: string) => (
                      <span key={dep} className="badge badge-indigo" style={{ fontFamily: 'monospace' }}>
                        {dep}
                      </span>
                    ))}
                  </div>
                )}

                {componentTab === 'code' && (
                  <div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                      {(['react', 'html', 'swift', 'kotlin'] as const).map((fw) => (
                        <button
                          key={fw}
                          onClick={() => setComponentFramework(fw)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            border: '1px solid',
                            borderColor: componentFramework === fw ? '#3b82f6' : 'var(--border-subtle)',
                            background: componentFramework === fw ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                            color: componentFramework === fw ? '#60a5fa' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                          }}
                        >
                          {fw}
                        </button>
                      ))}
                    </div>
                    <pre style={{ background: '#121215', padding: '16px', borderRadius: '6px', fontSize: '12px', color: '#e4e4e7', overflowX: 'auto' }}>
                      {componentFramework === 'react' && `<${selectedComponent.name} variant="${componentVariant}" size="${componentSize}">Click Me</${selectedComponent.name}>`}
                      {componentFramework === 'html' && `<button class="btn btn-${componentVariant} btn-${componentSize}">Click Me</button>`}
                      {componentFramework === 'swift' && `Button(action: { /* action */ }) {\n  Text("Click Me")\n    .padding(Tokens.Spacing.md)\n    .background(Tokens.ColorBrandPrimary)\n}`}
                      {componentFramework === 'kotlin' && `Button(\n  onClick = { /* action */ },\n  colors = ButtonDefaults.buttonColors(backgroundColor = Tokens.ColorBrandPrimary)\n) { Text("Click Me") }`}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: DATA SOURCES / FIGMA INTEGRATION */}
        {/* ======================================================== */}
        {activeNav === 'figma' && (
          <div style={{ flex: 1, padding: '28px 36px', overflowY: 'auto' }}>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>Figma Variables & Styles Ingestion</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                Extract collections, color modes, and typography variables directly into W3C DTCG format with conflict diff resolution.
              </p>
            </div>

            {/* Connected Figma File Card */}
            <div className="sn-panel" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#18181c', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-default)' }}>
                    <FigmaIcon size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Core UI Kit & Variable Collections</h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>File Key: {figmaFileKey} &bull; Mode: {figmaMode}</div>
                  </div>
                </div>
                <span className="badge badge-emerald">Synced</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#121215', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CONNECTED COLLECTIONS</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>Primitives, Semantic, Brand</div>
                </div>
                <div style={{ background: '#121215', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>EXTRACTED MODES</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>Light Mode, Dark Mode</div>
                </div>
                <div style={{ background: '#121215', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DTCG CONVERSION</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#10b981', marginTop: '4px' }}>W3C DTCG Standard v1</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleFigmaSync(false)}
                  disabled={figmaSyncing}
                  className="btn-secondary"
                >
                  {figmaSyncing ? <RefreshCw size={14} className="animate-spin" /> : <FigmaIcon size={14} />}
                  Fetch & Preview Conflict Diff
                </button>
                {figmaDiffResult && (
                  <button
                    onClick={() => handleFigmaSync(true)}
                    disabled={figmaSyncing}
                    className="btn-primary"
                  >
                    Apply Sync to Design System ({figmaDiffResult.totalVariablesFound} Tokens)
                  </button>
                )}
              </div>
            </div>

            {/* Conflict Diff Results Table */}
            {figmaDiffResult && (
              <div className="sn-panel" style={{ padding: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
                  Conflict Diff Preview ({figmaDiffResult.diff?.length} items):
                </div>
                <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {figmaDiffResult.diff?.map((item: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#121215', borderRadius: '4px', fontSize: '12px' }}>
                      <span className="font-mono" style={{ color: '#fff' }}>{item.path}</span>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{item.oldValue || 'none'} ➔ {item.newValue}</span>
                        <span className={`badge ${item.status === 'added' ? 'badge-emerald' : item.status === 'modified' ? 'badge-amber' : 'badge-indigo'}`}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: CODE EXPORTERS STORE */}
        {/* ======================================================== */}
        {activeNav === 'exporters' && (
          <div style={{ flex: 1, padding: '28px 36px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>Multi-Platform Exporters Store</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Production code generation for Web (CSS, TypeScript, Tailwind), iOS (SwiftUI), and Android (Jetpack Compose).
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleDownloadExport} className="btn-secondary">
                  <Download size={14} /> Download File
                </button>
                <button
                  onClick={() => exportedContent && copyToClipboard(exportedContent.content, 'exp-code')}
                  className="btn-primary"
                >
                  {copiedKey === 'exp-code' ? <Check size={14} /> : <Copy size={14} />}
                  {copiedKey === 'exp-code' ? 'Copied' : 'Copy Code'}
                </button>
              </div>
            </div>

            {/* Exporter Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {(['css', 'json', 'typescript', 'tailwind', 'swift', 'kotlin'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => loadExport(fmt)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: exportFormat === fmt ? '#3b82f6' : 'var(--border-subtle)',
                    background: exportFormat === fmt ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-surface)',
                    color: exportFormat === fmt ? '#60a5fa' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  {fmt === 'css' ? '@supernovaio/export-css' : fmt === 'json' ? 'tokens.json (DTCG)' : fmt === 'typescript' ? 'TypeScript' : fmt === 'tailwind' ? 'Tailwind Config' : fmt === 'swift' ? 'iOS Swift (SwiftUI)' : 'Android Kotlin (Compose)'}
                </button>
              ))}
            </div>

            {/* Generated Code Window */}
            <div className="sn-panel" style={{ padding: '20px' }}>
              <pre
                style={{
                  background: '#121215',
                  padding: '20px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#e4e4e7',
                  maxHeight: '520px',
                  overflowY: 'auto',
                }}
              >
                {loadingExport ? 'Generating deterministic code artifacts...' : exportedContent?.content}
              </pre>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 5: DELIVERY PIPELINES (GITHUB CI/CD) */}
        {/* ======================================================== */}
        {activeNav === 'delivery' && (
          <div style={{ flex: 1, padding: '28px 36px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>Continuous Delivery Pipelines</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Automate code delivery from your central design system to production repositories with automated branches and pull requests.
                </p>
              </div>

              <button onClick={triggerDelivery} disabled={delivering} className="btn-primary">
                {delivering ? <RefreshCw size={14} className="animate-spin" /> : <GitPullRequest size={14} />}
                Trigger Automated Release PR
              </button>
            </div>

            <div className="sn-panel" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>Target Git Repository</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Repository</label>
                  <input
                    type="text"
                    value={targetRepo}
                    onChange={(e) => setTargetRepo(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: '#121215', border: '1px solid var(--border-default)', borderRadius: '6px', color: '#fff', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Base Branch</label>
                  <input
                    type="text"
                    value={targetBranch}
                    onChange={(e) => setTargetBranch(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: '#121215', border: '1px solid var(--border-default)', borderRadius: '6px', color: '#fff', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Artifacts</label>
                  <div style={{ padding: '8px 10px', background: '#121215', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#10b981', fontSize: '13px', fontWeight: 500 }}>
                    CSS, TS, Swift, Kotlin
                  </div>
                </div>
              </div>

              {deliveryResult && (
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6ee7b7', fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>
                    <CheckCircle2 size={16} /> Pull Request Created & Idempotently Verified
                  </div>
                  <div style={{ fontSize: '12px', color: '#fff', marginBottom: '12px' }}>
                    PR Link: <a href={deliveryResult.pullRequestUrl} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>{deliveryResult.pullRequestUrl}</a>
                  </div>
                  <pre style={{ background: '#121215', padding: '12px', borderRadius: '4px', fontSize: '11px', color: '#a1a1aa' }}>
                    {deliveryResult.diffSummary}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 6: QUALITY & LINTER AUDITOR */}
        {/* ======================================================== */}
        {activeNav === 'audit' && (
          <div style={{ flex: 1, padding: '28px 36px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>Quality Intelligence & Design System Linter</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Deterministic AST & token rule auditor detecting hardcoded colors, unregistered variables, and non-scale spacing with 1-click fixes.
                </p>
              </div>

              <button onClick={() => runAudit()} disabled={auditing} className="btn-primary">
                {auditing ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                Run Code Audit
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Code Playground */}
              <div className="sn-panel" style={{ padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  SOURCE CODE TEST BENCH (src/Card.tsx)
                </div>
                <textarea
                  value={auditCode}
                  onChange={(e) => setAuditCode(e.target.value)}
                  style={{
                    width: '100%',
                    height: '400px',
                    background: '#121215',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '14px',
                    color: '#e4e4e7',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    lineHeight: '1.6',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              {/* Findings */}
              <div className="sn-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>
                    Audit Findings {auditReport && `(${auditReport.totalFindings})`}
                  </div>
                  {auditReport && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span className="badge badge-rose">Errors: {auditReport.errorCount}</span>
                      <span className="badge badge-amber">Warnings: {auditReport.warningCount}</span>
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {!auditReport ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      Click "Run Code Audit" to test code against token rules.
                    </div>
                  ) : auditReport.findings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#10b981' }}>
                      <CheckCircle2 size={32} style={{ marginBottom: '8px' }} />
                      <div style={{ fontWeight: 700 }}>100% Compliant</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>All styles reference valid design tokens.</div>
                    </div>
                  ) : (
                    auditReport.findings.map((f: any, idx: number) => (
                      <div key={idx} style={{ background: '#121215', padding: '12px', borderRadius: '6px', borderLeft: `3px solid ${f.severity === 'error' ? '#f43f5e' : '#f59e0b'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Line {f.line} &bull; {f.ruleId}</span>
                          <span className={`badge ${f.severity === 'error' ? 'badge-rose' : 'badge-amber'}`}>{f.severity}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{f.message}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: '#10b981' }}>Fix: {f.suggestedFix}</span>
                          <button
                            onClick={() => handleApplyFix(f.ruleId, f.suggestedFix)}
                            className="btn-secondary"
                            style={{ fontSize: '11px', padding: '3px 8px', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                          >
                            <Wand2 size={11} /> Auto-Fix
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 7: RELEASES & VERSION SNAPSHOTS */}
        {/* ======================================================== */}
        {activeNav === 'releases' && (
          <div style={{ flex: 1, padding: '28px 36px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>Releases & Version Snapshots</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Immutable SemVer releases with tokens, components count, and automated changelogs.
                </p>
              </div>

              <button onClick={() => setShowReleaseModal(true)} className="btn-primary">
                <Plus size={14} /> Publish Version...
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {releasesList.map((rel, idx) => (
                <div key={rel.id || idx} className="sn-panel" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '13px', padding: '4px 10px' }}>
                        v{rel.version}
                      </span>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{rel.title}</h3>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(rel.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    {rel.description}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                    <span className="badge badge-indigo">Tokens: {rel.tokensCount}</span>
                    <span className="badge badge-amber">Components: {rel.componentsCount}</span>
                  </div>

                  <div style={{ background: '#121215', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>CHANGELOG</div>
                    <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#cbd5e1', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                      {rel.changelog}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 8: MCP PROTOCOL SERVER FOR AI AGENTS */}
        {/* ======================================================== */}
        {activeNav === 'mcp' && (
          <div style={{ flex: 1, padding: '28px 36px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>Model Context Protocol (MCP) Server</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Official `@modelcontextprotocol/sdk` agent bridge for Cursor, Claude Code, and IDE assistants.
                </p>
              </div>
              <span className="badge badge-emerald">8 Tools Live</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
              <div className="sn-panel" style={{ padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>SELECT TOOL</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                  {[
                    'get_tokens',
                    'get_token',
                    'list_components',
                    'check_compliance',
                    'generate_code',
                    'import_figma_variables',
                    'propose_token_changes',
                    'get_design_system',
                  ].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setMcpTool(t);
                        if (t === 'get_tokens') setMcpCustomArg('{"category": "color"}');
                        if (t === 'get_token') setMcpCustomArg('{"tokenPath": "color.brand.primary"}');
                        if (t === 'generate_code') setMcpCustomArg('{"format": "swift"}');
                        if (t === 'import_figma_variables') setMcpCustomArg('{"fileKey": "figma-test", "dryRun": true}');
                        if (t === 'propose_token_changes') setMcpCustomArg('{"tokenPath": "color.accent.purple", "rawValue": "#a855f7", "category": "color"}');
                      }}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '4px',
                        background: mcpTool === t ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                        color: mcpTool === t ? '#60a5fa' : 'var(--text-secondary)',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        textAlign: 'left',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>ARGUMENTS (JSON)</div>
                <textarea
                  value={mcpCustomArg}
                  onChange={(e) => setMcpCustomArg(e.target.value)}
                  style={{ width: '100%', height: '80px', background: '#121215', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '8px', color: '#fff', fontFamily: 'monospace', fontSize: '11px', marginBottom: '12px', outline: 'none', resize: 'none' }}
                />

                <button onClick={executeMcpTool} disabled={mcpLoading} className="btn-primary" style={{ width: '100%' }}>
                  {mcpLoading ? <RefreshCw size={13} className="animate-spin" /> : <Cpu size={13} />}
                  Invoke Tool
                </button>
              </div>

              <div className="sn-panel" style={{ padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>JSON-RPC RESULT</div>
                <pre style={{ background: '#121215', padding: '16px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#10b981', maxHeight: '460px', overflowY: 'auto' }}>
                  {mcpLoading ? 'Invoking MCP server...' : mcpResult ? JSON.stringify(mcpResult, null, 2) : '// Select tool and click "Invoke Tool"'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD TOKEN */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="sn-panel" style={{ width: '460px', padding: '24px', background: '#18181c' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px', color: '#fff' }}>Add Design Token</h2>
            <form onSubmit={handleAddToken}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Token Path</label>
                <input
                  type="text"
                  value={newTokenPath}
                  onChange={(e) => setNewTokenPath(e.target.value)}
                  required
                  placeholder="color.brand.accent"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#121215', border: '1px solid var(--border-default)', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Raw Value / Alias reference</label>
                <input
                  type="text"
                  value={newTokenValue}
                  onChange={(e) => setNewTokenValue(e.target.value)}
                  required
                  placeholder="#06b6d4 or {color.primitive.blue.500}"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#121215', border: '1px solid var(--border-default)', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Category</label>
                <select
                  value={newTokenCategory}
                  onChange={(e) => setNewTokenCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#121215', border: '1px solid var(--border-default)', color: '#fff', fontSize: '13px', outline: 'none' }}
                >
                  <option value="color">color</option>
                  <option value="spacing">spacing</option>
                  <option value="borderRadius">borderRadius</option>
                  <option value="typography">typography</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Description</label>
                <input
                  type="text"
                  value={newTokenDesc}
                  onChange={(e) => setNewTokenDesc(e.target.value)}
                  placeholder="Usage notes"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#121215', border: '1px solid var(--border-default)', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={savingToken} className="btn-primary">
                  {savingToken ? 'Saving...' : 'Save Token'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PUBLISH RELEASE */}
      {showReleaseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="sn-panel" style={{ width: '480px', padding: '24px', background: '#18181c' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px', color: '#fff' }}>Publish Design System Version</h2>
            <form onSubmit={handlePublishRelease}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Version (SemVer)</label>
                <input
                  type="text"
                  value={newReleaseVersion}
                  onChange={(e) => setNewReleaseVersion(e.target.value)}
                  required
                  placeholder="1.4.0"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#121215', border: '1px solid var(--border-default)', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Release Title</label>
                <input
                  type="text"
                  value={newReleaseTitle}
                  onChange={(e) => setNewReleaseTitle(e.target.value)}
                  required
                  placeholder="Title"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#121215', border: '1px solid var(--border-default)', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Changelog Notes</label>
                <textarea
                  value={newReleaseChangelog}
                  onChange={(e) => setNewReleaseChangelog(e.target.value)}
                  rows={4}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#121215', border: '1px solid var(--border-default)', color: '#fff', fontSize: '12px', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowReleaseModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={publishingRelease} className="btn-primary">
                  {publishingRelease ? 'Publishing...' : 'Publish Version'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
