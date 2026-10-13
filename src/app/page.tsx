'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Box,
  ShieldCheck,
  FileCode,
  Bot,
  GitPullRequest,
  BookOpen,
  Search,
  Copy,
  Check,
  RefreshCw,
  Download,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Terminal,
  Zap,
  Plus,
  Trash2,
  Moon,
  Sun,
  Sliders,
  Play,
  PenTool,
  History,
  Tag,
  Wand2,
  Eye,
  Code2,
} from 'lucide-react';

function FigmaIcon({ size = 18, color = '#06b6d4', style }: { size?: number; color?: string; style?: React.CSSProperties }) {
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

export default function NovaDesignApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tokens' | 'components' | 'audit' | 'exporter' | 'mcp' | 'delivery' | 'releases' | 'docs'>('dashboard');

  // Theme mode
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');

  // Brand mode
  const [activeBrand, setActiveBrand] = useState<'Core Web' | 'Mobile App' | 'Enterprise'>('Core Web');

  // Token state
  const [tokens, setTokens] = useState<any[]>([]);
  const [tokenCategory, setTokenCategory] = useState<string>('all');
  const [tokenSearch, setTokenSearch] = useState<string>('');
  const [loadingTokens, setLoadingTokens] = useState<boolean>(true);
  const [selectedToken, setSelectedToken] = useState<any | null>(null);

  // Add Token Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTokenPath, setNewTokenPath] = useState<string>('color.brand.accent');
  const [newTokenValue, setNewTokenValue] = useState<string>('#06b6d4');
  const [newTokenCategory, setNewTokenCategory] = useState<string>('color');
  const [newTokenDesc, setNewTokenDesc] = useState<string>('Accent cyan highlight');
  const [savingToken, setSavingToken] = useState<boolean>(false);

  // Figma Sync Modal state
  const [showFigmaModal, setShowFigmaModal] = useState<boolean>(false);
  const [figmaFileKey, setFigmaFileKey] = useState<string>('sample-figma-file-key');
  const [figmaToken, setFigmaToken] = useState<string>('');
  const [figmaMode, setFigmaMode] = useState<string>('Light');
  const [figmaSyncing, setFigmaSyncing] = useState<boolean>(false);
  const [figmaDiffResult, setFigmaDiffResult] = useState<any>(null);

  // Components state
  const [components, setComponents] = useState<any[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('primary');
  const [selectedSize, setSelectedSize] = useState<string>('md');
  const [componentFramework, setComponentFramework] = useState<'react' | 'html' | 'swift' | 'kotlin'>('react');
  const [buttonClickCount, setButtonClickCount] = useState<number>(0);
  const [inputVal, setInputVal] = useState<string>('hello@acme.corp');
  const [badgeTone, setBadgeTone] = useState<'neutral' | 'success' | 'critical' | 'indigo'>('success');
  const [cardVariant, setCardVariant] = useState<'elevated' | 'outlined' | 'ghost'>('elevated');
  const [cardPadding, setCardPadding] = useState<'sm' | 'md' | 'lg'>('md');

  // Audit state
  const [auditCode, setAuditCode] = useState<string>(`// UI Component under compliance evaluation
export function PrimaryCard() {
  return (
    <div style={{
      backgroundColor: '#3b82f6', // Hardcoded color!
      padding: '17px',            // Arbitrary non-scale spacing!
      borderRadius: '8px',
      color: 'var(--color-unknown-fake)' // Unregistered token!
    }}>
      <h3 style={{ color: 'var(--color-legacy-accent)' }}>Acme Feature</h3>
      <p>Building next-generation design systems.</p>
    </div>
  );
}`);
  const [auditReport, setAuditReport] = useState<any>(null);
  const [auditing, setAuditing] = useState<boolean>(false);

  // Exporters state
  const [exportFormat, setExportFormat] = useState<'css' | 'json' | 'typescript' | 'tailwind' | 'swift' | 'kotlin'>('css');
  const [exportedContent, setExportedContent] = useState<any>(null);
  const [loadingExport, setLoadingExport] = useState<boolean>(false);

  // Releases state
  const [releasesList, setReleasesList] = useState<any[]>([]);
  const [showReleaseModal, setShowReleaseModal] = useState<boolean>(false);
  const [newReleaseVersion, setNewReleaseVersion] = useState<string>('1.4.0');
  const [newReleaseTitle, setNewReleaseTitle] = useState<string>('Typography Scale & Mobile Sync');
  const [newReleaseChangelog, setNewReleaseChangelog] = useState<string>('• Refined typography scale\n• Updated iOS SwiftUI and Android Kotlin color mappings\n• Enhanced component token dependencies');
  const [publishingRelease, setPublishingRelease] = useState<boolean>(false);

  // MCP state
  const [mcpTool, setMcpTool] = useState<string>('get_tokens');
  const [mcpCustomArg, setMcpCustomArg] = useState<string>('{"category": "color"}');
  const [mcpResult, setMcpResult] = useState<any>(null);
  const [mcpLoading, setMcpLoading] = useState<boolean>(false);

  // Delivery state
  const [deliveryResult, setDeliveryResult] = useState<any>(null);
  const [delivering, setDelivering] = useState<boolean>(false);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Fetch initial data
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
          const brandPrimary = data.tokens.find((t: any) => t.path === 'color.brand.primary') || data.tokens[0];
          setSelectedToken(brandPrimary);
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

  // Add token directly to database
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
      console.error('Error saving token', err);
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

  // Publish release snapshot
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

  // Figma sync preview
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
          setShowFigmaModal(false);
        }
      }
    } catch (err) {
      console.error('Figma sync error', err);
    } finally {
      setFigmaSyncing(false);
    }
  };

  // Run audit
  const runAudit = async (customCode?: string) => {
    setAuditing(true);
    const codeToTest = customCode !== undefined ? customCode : auditCode;
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeContent: codeToTest, filePath: 'src/Card.tsx' }),
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

  // 1-Click auto-fix remediation
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

  // Load exported files
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

  // Download exported file
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

  useEffect(() => {
    if (activeTab === 'exporter' && !exportedContent) {
      loadExport('css');
    }
  }, [activeTab]);

  // Execute MCP tool call simulation
  const executeMcpTool = async () => {
    setMcpLoading(true);
    try {
      let parsedArgs = {};
      try {
        if (mcpCustomArg.trim()) {
          parsedArgs = JSON.parse(mcpCustomArg);
        }
      } catch (e) {
        // use empty if invalid json
      }

      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName: mcpTool, args: parsedArgs }),
      });
      const data = await res.json();
      setMcpResult(data.mcpResponse);
    } catch (err) {
      console.error('Failed to execute MCP tool', err);
    } finally {
      setMcpLoading(false);
    }
  };

  // Trigger continuous delivery
  const triggerDelivery = async () => {
    setDelivering(true);
    try {
      const res = await fetch('/api/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoOwner: 'acme-corp',
          repoName: 'web-platform-core',
          prTitle: 'Design Token Release & Sync (NovaDesign Automated PR)',
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

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filtered tokens
  const filteredTokens = tokens.filter((t) => {
    const matchesCategory = tokenCategory === 'all' || t.category === tokenCategory;
    const matchesSearch =
      tokenSearch === '' ||
      t.path.toLowerCase().includes(tokenSearch.toLowerCase()) ||
      t.resolvedValue.toLowerCase().includes(tokenSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', 'color', 'spacing', 'borderRadius', 'typography'];

  const activeRelease = releasesList[0] || { version: '1.3.0', title: 'Core Tokens' };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>
      {/* Sidebar Navigation */}
      <aside
        style={{
          width: '260px',
          borderRight: '1px solid var(--border-subtle)',
          background: 'rgba(6, 9, 19, 0.95)',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 12px 8px' }}>
          Platform Modules
        </div>

        <button
          onClick={() => setActiveTab('dashboard')}
          className="glass-card-interactive"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '8px',
            color: activeTab === 'dashboard' ? '#fff' : 'var(--text-secondary)',
            background: activeTab === 'dashboard' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            borderColor: activeTab === 'dashboard' ? 'var(--border-accent)' : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            fontWeight: 600,
            fontSize: '14px',
            textAlign: 'left',
          }}
        >
          <Sparkles size={18} color={activeTab === 'dashboard' ? '#a5b4fc' : '#94a3b8'} />
          Dashboard Overview
        </button>

        <button
          onClick={() => setActiveTab('tokens')}
          className="glass-card-interactive"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '8px',
            color: activeTab === 'tokens' ? '#fff' : 'var(--text-secondary)',
            background: activeTab === 'tokens' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            borderColor: activeTab === 'tokens' ? 'var(--border-accent)' : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            fontWeight: 600,
            fontSize: '14px',
            textAlign: 'left',
          }}
        >
          <Layers size={18} color={activeTab === 'tokens' ? '#a5b4fc' : '#94a3b8'} />
          Design Tokens Studio
        </button>

        <button
          onClick={() => setActiveTab('components')}
          className="glass-card-interactive"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '8px',
            color: activeTab === 'components' ? '#fff' : 'var(--text-secondary)',
            background: activeTab === 'components' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            borderColor: activeTab === 'components' ? 'var(--border-accent)' : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            fontWeight: 600,
            fontSize: '14px',
            textAlign: 'left',
          }}
        >
          <Box size={18} color={activeTab === 'components' ? '#a5b4fc' : '#94a3b8'} />
          Component Registry
        </button>

        <button
          onClick={() => {
            setActiveTab('audit');
            if (!auditReport) runAudit();
          }}
          className="glass-card-interactive"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '8px',
            color: activeTab === 'audit' ? '#fff' : 'var(--text-secondary)',
            background: activeTab === 'audit' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            borderColor: activeTab === 'audit' ? 'var(--border-accent)' : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            fontWeight: 600,
            fontSize: '14px',
            textAlign: 'left',
          }}
        >
          <ShieldCheck size={18} color={activeTab === 'audit' ? '#a5b4fc' : '#94a3b8'} />
          Quality Intelligence
        </button>

        <button
          onClick={() => setActiveTab('exporter')}
          className="glass-card-interactive"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '8px',
            color: activeTab === 'exporter' ? '#fff' : 'var(--text-secondary)',
            background: activeTab === 'exporter' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            borderColor: activeTab === 'exporter' ? 'var(--border-accent)' : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            fontWeight: 600,
            fontSize: '14px',
            textAlign: 'left',
          }}
        >
          <FileCode size={18} color={activeTab === 'exporter' ? '#a5b4fc' : '#94a3b8'} />
          Code Exporters
        </button>

        <button
          onClick={() => setActiveTab('releases')}
          className="glass-card-interactive"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '8px',
            color: activeTab === 'releases' ? '#fff' : 'var(--text-secondary)',
            background: activeTab === 'releases' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            borderColor: activeTab === 'releases' ? 'var(--border-accent)' : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            fontWeight: 600,
            fontSize: '14px',
            textAlign: 'left',
          }}
        >
          <History size={18} color={activeTab === 'releases' ? '#a5b4fc' : '#94a3b8'} />
          Releases & Versions
        </button>

        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px 12px 8px' }}>
          Integrations & Git
        </div>

        <button
          onClick={() => setShowFigmaModal(true)}
          className="glass-card-interactive"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '8px',
            color: '#06b6d4',
            background: 'rgba(6, 182, 212, 0.1)',
            borderColor: 'rgba(6, 182, 212, 0.3)',
            borderWidth: '1px',
            borderStyle: 'solid',
            fontWeight: 600,
            fontSize: '14px',
            textAlign: 'left',
          }}
        >
          <FigmaIcon size={18} color="#06b6d4" />
          Figma Live Sync
        </button>

        <button
          onClick={() => setActiveTab('mcp')}
          className="glass-card-interactive"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '8px',
            color: activeTab === 'mcp' ? '#fff' : 'var(--text-secondary)',
            background: activeTab === 'mcp' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            borderColor: activeTab === 'mcp' ? 'var(--border-accent)' : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            fontWeight: 600,
            fontSize: '14px',
            textAlign: 'left',
          }}
        >
          <Bot size={18} color={activeTab === 'mcp' ? '#a5b4fc' : '#94a3b8'} />
          MCP Agent Playground
        </button>

        <button
          onClick={() => setActiveTab('delivery')}
          className="glass-card-interactive"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '8px',
            color: activeTab === 'delivery' ? '#fff' : 'var(--text-secondary)',
            background: activeTab === 'delivery' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            borderColor: activeTab === 'delivery' ? 'var(--border-accent)' : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            fontWeight: 600,
            fontSize: '14px',
            textAlign: 'left',
          }}
        >
          <GitPullRequest size={18} color={activeTab === 'delivery' ? '#a5b4fc' : '#94a3b8'} />
          GitHub Delivery
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className="glass-card-interactive"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '8px',
            color: activeTab === 'docs' ? '#fff' : 'var(--text-secondary)',
            background: activeTab === 'docs' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            borderColor: activeTab === 'docs' ? 'var(--border-accent)' : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            fontWeight: 600,
            fontSize: '14px',
            textAlign: 'left',
          }}
        >
          <BookOpen size={18} color={activeTab === 'docs' ? '#a5b4fc' : '#94a3b8'} />
          Documentation Studio
        </button>

        {/* Brand Switcher at Bottom */}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
            ACTIVE BRAND / THEME
          </div>
          <select
            value={activeBrand}
            onChange={(e: any) => setActiveBrand(e.target.value)}
            style={{
              width: '100%',
              background: '#090d16',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '6px 8px',
              color: '#fff',
              fontSize: '12px',
              outline: 'none',
            }}
          >
            <option value="Core Web">Core Web (Acme)</option>
            <option value="Mobile App">Mobile App (iOS/Android)</option>
            <option value="Enterprise">Enterprise Dark</option>
          </select>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '28px 36px', overflowY: 'auto' }}>
        {/* SUPERNOVA GUIDED JOURNEY STEPPER */}
        <div
          className="glass-panel"
          style={{
            padding: '12px 18px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            overflowX: 'auto',
            background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
          }}
        >
          {[
            { id: 'figma', label: '1. Ingest (Figma)', sub: 'Sync & Diff', action: () => setShowFigmaModal(true), isFigma: true },
            { id: 'tokens', label: '2. Tokens Studio', sub: 'DTCG & Aliases', tab: 'tokens' },
            { id: 'components', label: '3. Components', sub: 'Props Sandbox', tab: 'components' },
            { id: 'exporter', label: '4. Exporters', sub: 'Web, iOS, Android', tab: 'exporter' },
            { id: 'audit', label: '5. Quality Linter', sub: 'SARIF Scanner', tab: 'audit' },
            { id: 'delivery', label: '6. GitHub PR', sub: 'Automated CI/CD', tab: 'delivery' },
            { id: 'releases', label: '7. Releases', sub: `v${activeRelease.version}`, tab: 'releases' },
            { id: 'docs', label: '8. Living Docs', sub: 'Styleguide Portal', tab: 'docs' },
            { id: 'mcp', label: '9. AI Agent', sub: 'MCP Protocol', tab: 'mcp' },
          ].map((step, idx) => {
            const isActive = step.tab ? activeTab === step.tab : false;
            return (
              <React.Fragment key={idx}>
                <button
                  onClick={() => {
                    if (step.action) step.action();
                    else if (step.tab) setActiveTab(step.tab as any);
                  }}
                  style={{
                    background: isActive ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid',
                    borderColor: isActive ? '#6366f1' : 'var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    minWidth: '110px',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 700, color: isActive ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {step.isFigma && <FigmaIcon size={12} />}
                    {step.label}
                  </span>
                  <span style={{ fontSize: '10px', color: isActive ? '#a5b4fc' : 'var(--text-muted)' }}>
                    {step.sub}
                  </span>
                </button>
                {idx < 8 && <ChevronRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                  NovaDesign Central Overview
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                  Unified source of truth connecting Figma Variables, W3C DTCG tokens, components, AI agents via MCP, and GitHub delivery.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowReleaseModal(true)} className="btn-secondary" style={{ color: '#a5b4fc', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
                  <Tag size={14} /> Publish Release (v{activeRelease.version})
                </button>
                <button onClick={() => setShowFigmaModal(true)} className="btn-secondary" style={{ color: '#06b6d4', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
                  <FigmaIcon size={14} /> Sync Figma Variables
                </button>
                <button onClick={() => setActiveTab('exporter')} className="btn-primary">
                  <Download size={14} /> Export All Artifacts
                </button>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
              <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '12px', fontSize: '13px' }}>
                  <span>DESIGN TOKENS</span>
                  <Layers size={16} color="#6366f1" />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff' }}>{tokens.length}</div>
                <div style={{ fontSize: '12px', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                  <CheckCircle2 size={13} /> 100% DTCG Compliant
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '12px', fontSize: '13px' }}>
                  <span>COMPONENTS</span>
                  <Box size={16} color="#06b6d4" />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff' }}>{components.length}</div>
                <div style={{ fontSize: '12px', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                  <Sparkles size={13} /> Multi-Framework Specs
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '12px', fontSize: '13px' }}>
                  <span>EXPORT TARGETS</span>
                  <FileCode size={16} color="#a855f7" />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff' }}>6</div>
                <div style={{ fontSize: '12px', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                  <CheckCircle2 size={13} /> Web, iOS (Swift), Android (Kotlin)
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '12px', fontSize: '13px' }}>
                  <span>ACTIVE RELEASE</span>
                  <Tag size={16} color="#10b981" />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff' }}>v{activeRelease.version}</div>
                <div style={{ fontSize: '12px', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                  <History size={13} /> {releasesList.length} Versions Recorded
                </div>
              </div>
            </div>

            {/* Architecture Pipeline Banner */}
            <div className="glass-panel" style={{ padding: '28px', marginBottom: '32px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={18} color="#6366f1" /> The Continuous Delivery Pipeline (Figma ⇄ Code)
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-subtle)', flex: 1, minWidth: '140px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>STEP 1: DESIGN</div>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginTop: '4px', color: '#06b6d4' }}>Figma Variables</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Live Sync & Conflict Diff</div>
                </div>
                <ChevronRight size={18} color="var(--text-muted)" />
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-subtle)', flex: 1, minWidth: '140px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>STEP 2: ENGINE</div>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginTop: '4px' }}>W3C DTCG Store</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Alias Resolution & Graph</div>
                </div>
                <ChevronRight size={18} color="var(--text-muted)" />
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-subtle)', flex: 1, minWidth: '140px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>STEP 3: EXPORTERS</div>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginTop: '4px' }}>Multi-Platform</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>CSS, TS, Swift, Kotlin</div>
                </div>
                <ChevronRight size={18} color="var(--text-muted)" />
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-subtle)', flex: 1, minWidth: '140px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>STEP 4: AGENTS</div>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginTop: '4px' }}>MCP Protocol</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Claude Code & Cursor</div>
                </div>
                <ChevronRight size={18} color="var(--text-muted)" />
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-subtle)', flex: 1, minWidth: '140px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>STEP 5: GIT PR</div>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginTop: '4px' }}>GitHub Delivery</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Automated Release PR</div>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
              <div onClick={() => setShowFigmaModal(true)} className="glass-card-interactive" style={{ padding: '24px' }}>
                <FigmaIcon size={24} color="#06b6d4" style={{ marginBottom: '12px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Sync from Figma</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Import Figma Variable collections, map them to DTCG tokens, and review visual conflict diffs.
                </p>
              </div>

              <div onClick={() => setActiveTab('audit')} className="glass-card-interactive" style={{ padding: '24px' }}>
                <ShieldCheck size={24} color="#10b981" style={{ marginBottom: '12px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Run Quality Audit</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Scan frontend React or CSS code for hardcoded colors, unregistered variables, and deprecated styles.
                </p>
              </div>

              <div onClick={() => setActiveTab('exporter')} className="glass-card-interactive" style={{ padding: '24px' }}>
                <FileCode size={24} color="#a855f7" style={{ marginBottom: '12px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Export for Mobile & Web</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Download production code for Web (CSS, TS, Tailwind), iOS (SwiftUI), and Android (Compose).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DESIGN TOKENS STUDIO & ALIAS GRAPH */}
        {activeTab === 'tokens' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                  Design Tokens Studio
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                  W3C DTCG standard tokens with automatic alias resolution, category taxonomy, and live graph visualizer.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowAddModal(true)} className="btn-primary">
                  <Plus size={14} /> Add Token
                </button>
                <button onClick={() => setShowFigmaModal(true)} className="btn-secondary" style={{ color: '#06b6d4', borderColor: 'rgba(6,182,212,0.3)' }}>
                  <FigmaIcon size={14} /> Figma Sync
                </button>
                <div style={{ position: 'relative' }}>
                  <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                  <input
                    type="text"
                    placeholder="Search tokens..."
                    value={tokenSearch}
                    onChange={(e) => setTokenSearch(e.target.value)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '8px 12px 8px 36px',
                      color: '#fff',
                      fontSize: '13px',
                      width: '220px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTokenCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: tokenCategory === cat ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                    color: tokenCategory === cat ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid',
                    borderColor: tokenCategory === cat ? '#6366f1' : 'var(--border-subtle)',
                    textTransform: 'capitalize',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Split View: Tokens Table + Token Inspector Drawer */}
            <div style={{ display: 'grid', gridTemplateColumns: selectedToken ? '1fr 380px' : '1fr', gap: '24px' }}>
              {/* Tokens Table */}
              <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '14px 20px', fontWeight: 600 }}>TOKEN PATH</th>
                      <th style={{ padding: '14px 20px', fontWeight: 600 }}>PREVIEW</th>
                      <th style={{ padding: '14px 20px', fontWeight: 600 }}>RESOLVED VALUE</th>
                      <th style={{ padding: '14px 20px', fontWeight: 600 }}>RAW / ALIAS</th>
                      <th style={{ padding: '14px 20px', fontWeight: 600 }}>CATEGORY</th>
                      <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
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
                            background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                        >
                          <td style={{ padding: '14px 20px', fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="font-mono" style={{ color: isSelected ? '#a5b4fc' : '#fff' }}>{t.path}</span>
                              {t.isDeprecated && <span className="badge badge-rose">Deprecated</span>}
                              {t.isAlias && <span className="badge badge-indigo">Alias</span>}
                            </div>
                            {t.description && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{t.description}</div>}
                          </td>

                          <td style={{ padding: '14px 20px' }}>
                            {t.category === 'color' && t.resolvedValue.startsWith('#') && (
                              <div
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '6px',
                                  background: t.resolvedValue,
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                                }}
                              />
                            )}
                            {t.category === 'spacing' && (
                              <div
                                style={{
                                  width: t.resolvedValue,
                                  height: '14px',
                                  background: '#6366f1',
                                  borderRadius: '2px',
                                  opacity: 0.8,
                                }}
                              />
                            )}
                            {t.category === 'borderRadius' && (
                              <div
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  border: '2px solid #06b6d4',
                                  borderRadius: t.resolvedValue === '9999px' ? '50%' : t.resolvedValue,
                                }}
                              />
                            )}
                            {t.category === 'typography' && <span style={{ fontSize: '11px', color: '#a5b4fc' }}>Aa</span>}
                          </td>

                          <td style={{ padding: '14px 20px' }}>
                            <span className="font-mono" style={{ color: '#6ee7b7' }}>{t.resolvedValue}</span>
                          </td>

                          <td style={{ padding: '14px 20px' }}>
                            <span className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                              {t.rawValue}
                            </span>
                          </td>

                          <td style={{ padding: '14px 20px' }}>
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                              {t.category}
                            </span>
                          </td>

                          <td style={{ padding: '14px 20px', textAlign: 'right' }}>
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
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '12px',
                                }}
                              >
                                {copiedKey === t.id ? <Check size={14} /> : <Copy size={14} />}
                                {copiedKey === t.id ? 'Copied' : 'CSS'}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteToken(t.id);
                                }}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  padding: '4px',
                                }}
                                title="Delete Token"
                              >
                                <Trash2 size={14} color="#f43f5e" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Token Inspector Drawer */}
              {selectedToken && (
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      TOKEN INSPECTOR & GRAPH
                    </div>
                    <button
                      onClick={() => setSelectedToken(null)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <h3 className="font-mono" style={{ fontSize: '16px', fontWeight: 800, color: '#fff', wordBreak: 'break-all' }}>
                      {selectedToken.path}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {selectedToken.description || 'No description provided'}
                    </div>
                  </div>

                  {/* Swatch & Value Preview */}
                  <div style={{ background: '#090d16', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {selectedToken.category === 'color' && (
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          background: selectedToken.resolvedValue,
                          border: '1px solid rgba(255,255,255,0.2)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        }}
                      />
                    )}
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>RESOLVED VALUE</div>
                      <div className="font-mono" style={{ fontSize: '18px', fontWeight: 800, color: '#6ee7b7' }}>
                        {selectedToken.resolvedValue}
                      </div>
                    </div>
                  </div>

                  {/* Visual Alias Chain Graph */}
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#a5b4fc', marginBottom: '8px' }}>
                      ALIAS DEPENDENCY GRAPH
                    </div>
                    {selectedToken.isAlias ? (
                      <div style={{ background: '#090d16', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="badge badge-indigo">Semantic</span>
                          <span className="font-mono" style={{ fontSize: '12px', color: '#fff' }}>{selectedToken.path}</span>
                        </div>
                        <div style={{ paddingLeft: '16px', color: 'var(--text-muted)', fontSize: '12px' }}>↓ references</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="badge badge-emerald">Primitive</span>
                          <span className="font-mono" style={{ fontSize: '12px', color: '#6ee7b7' }}>{selectedToken.aliasTarget || selectedToken.rawValue}</span>
                        </div>
                        <div style={{ paddingLeft: '16px', color: 'var(--text-muted)', fontSize: '12px' }}>↓ resolves to</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="badge" style={{ background: '#3b82f6', color: '#fff' }}>Literal</span>
                          <span className="font-mono" style={{ fontSize: '12px', color: '#fff' }}>{selectedToken.resolvedValue}</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        This is a root primitive token with no upstream aliases.
                      </div>
                    )}
                  </div>

                  {/* Connected Components in Design System */}
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#a5b4fc', marginBottom: '8px' }}>
                      CONNECTED COMPONENTS
                    </div>
                    {components.filter((c) => c.tokenDependencies?.includes(selectedToken.path)).length > 0 ? (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {components
                          .filter((c) => c.tokenDependencies?.includes(selectedToken.path))
                          .map((c) => (
                            <span key={c.id} className="badge badge-indigo" style={{ padding: '4px 10px' }}>
                              <Box size={12} style={{ marginRight: '4px' }} />
                              {c.name}
                            </span>
                          ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        No registered components currently declare direct dependency on this token.
                      </div>
                    )}
                  </div>

                  {/* Multi-Syntax Quick Copy */}
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                      COPY IMPLEMENTATION SYNTAX
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        onClick={() => copyToClipboard(`var(--${selectedToken.path.replace(/\./g, '-')})`, 'insp-css')}
                        className="btn-secondary"
                        style={{ fontSize: '11px', padding: '6px 8px', justifyContent: 'center' }}
                      >
                        {copiedKey === 'insp-css' ? 'Copied CSS' : 'CSS Custom Prop'}
                      </button>
                      <button
                        onClick={() => copyToClipboard(`Tokens.${selectedToken.path.split('.').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join('')}`, 'insp-swift')}
                        className="btn-secondary"
                        style={{ fontSize: '11px', padding: '6px 8px', justifyContent: 'center' }}
                      >
                        {copiedKey === 'insp-swift' ? 'Copied Swift' : 'iOS Swift'}
                      </button>
                      <button
                        onClick={() => copyToClipboard(`Tokens.${selectedToken.path.split('.').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join('')}`, 'insp-kt')}
                        className="btn-secondary"
                        style={{ fontSize: '11px', padding: '6px 8px', justifyContent: 'center' }}
                      >
                        {copiedKey === 'insp-kt' ? 'Copied Kotlin' : 'Android Kotlin'}
                      </button>
                      <button
                        onClick={() => copyToClipboard(`tokens.${selectedToken.path}`, 'insp-ts')}
                        className="btn-secondary"
                        style={{ fontSize: '11px', padding: '6px 8px', justifyContent: 'center' }}
                      >
                        {copiedKey === 'insp-ts' ? 'Copied TS' : 'TypeScript'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: COMPONENT REGISTRY & SANDBOX */}
        {activeTab === 'components' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                Component Registry & Interactive Sandbox
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                Interactive UI component catalog with live props customization, variant sandboxes, design token specs, and multi-platform code generation.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
              {/* Components List */}
              <div className="glass-panel" style={{ padding: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', paddingLeft: '8px' }}>
                  Components ({components.length})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {components.map((comp) => (
                    <div
                      key={comp.id}
                      onClick={() => setSelectedComponent(comp)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        background: selectedComponent?.id === comp.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid',
                        borderColor: selectedComponent?.id === comp.id ? 'var(--border-accent)' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{comp.name}</span>
                        <span className="badge badge-indigo">{comp.category}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {comp.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Component Detail & Interactive Sandbox */}
              {selectedComponent && (
                <div className="glass-panel" style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                      <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>{selectedComponent.name}</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                        {selectedComponent.description}
                      </p>
                    </div>
                    <span className="badge badge-emerald">Category: {selectedComponent.category}</span>
                  </div>

                  {/* Interactive Props Sandbox Controls */}
                  {selectedComponent.name === 'Button' && (
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', background: 'rgba(255,255,255,0.03)', padding: '14px 18px', borderRadius: '8px', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Variant:</span>
                        {['primary', 'secondary', 'ghost', 'danger'].map((v) => (
                          <button
                            key={v}
                            onClick={() => setSelectedVariant(v)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              background: selectedVariant === v ? '#6366f1' : 'transparent',
                              color: selectedVariant === v ? '#fff' : 'var(--text-secondary)',
                              border: '1px solid',
                              borderColor: selectedVariant === v ? '#6366f1' : 'var(--border-subtle)',
                            }}
                          >
                            {v}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Size:</span>
                        {['sm', 'md', 'lg'].map((s) => (
                          <button
                            key={s}
                            onClick={() => setSelectedSize(s)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              background: selectedSize === s ? '#6366f1' : 'transparent',
                              color: selectedSize === s ? '#fff' : 'var(--text-secondary)',
                              border: '1px solid',
                              borderColor: selectedSize === s ? '#6366f1' : 'var(--border-subtle)',
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedComponent.name === 'Badge' && (
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', background: 'rgba(255,255,255,0.03)', padding: '14px 18px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tone:</span>
                        {(['neutral', 'success', 'critical', 'indigo'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setBadgeTone(t)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              background: badgeTone === t ? '#6366f1' : 'transparent',
                              color: badgeTone === t ? '#fff' : 'var(--text-secondary)',
                              border: '1px solid',
                              borderColor: badgeTone === t ? '#6366f1' : 'var(--border-subtle)',
                            }}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedComponent.name === 'Card' && (
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', background: 'rgba(255,255,255,0.03)', padding: '14px 18px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Variant:</span>
                        {(['elevated', 'outlined', 'ghost'] as const).map((v) => (
                          <button
                            key={v}
                            onClick={() => setCardVariant(v)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              background: cardVariant === v ? '#6366f1' : 'transparent',
                              color: cardVariant === v ? '#fff' : 'var(--text-secondary)',
                              border: '1px solid',
                              borderColor: cardVariant === v ? '#6366f1' : 'var(--border-subtle)',
                            }}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live Rendered Interactive Sandbox Canvas */}
                  <div style={{ background: '#090d16', borderRadius: '10px', border: '1px solid var(--border-subtle)', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px', minHeight: '160px' }}>
                    {selectedComponent.name === 'Button' && (
                      <button
                        onClick={() => setButtonClickCount((c) => c + 1)}
                        className={selectedVariant === 'primary' ? 'btn-primary' : selectedVariant === 'secondary' ? 'btn-secondary' : selectedVariant === 'danger' ? 'btn-danger' : 'btn-ghost'}
                        style={{
                          padding: selectedSize === 'sm' ? '6px 14px' : selectedSize === 'lg' ? '14px 28px' : '10px 20px',
                          fontSize: selectedSize === 'sm' ? '12px' : selectedSize === 'lg' ? '16px' : '14px',
                          background: selectedVariant === 'danger' ? 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)' : undefined,
                        }}
                      >
                        Interactive {selectedVariant} Button ({selectedSize}) {buttonClickCount > 0 && `• Clicks: ${buttonClickCount}`}
                      </button>
                    )}

                    {selectedComponent.name === 'Badge' && (
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <span
                          className={`badge ${badgeTone === 'success' ? 'badge-emerald' : badgeTone === 'critical' ? 'badge-rose' : badgeTone === 'indigo' ? 'badge-indigo' : 'badge-amber'}`}
                          style={{ padding: '8px 18px', fontSize: '14px' }}
                        >
                          Status Indicator &bull; {badgeTone.toUpperCase()}
                        </span>
                      </div>
                    )}

                    {selectedComponent.name === 'TextInput' && (
                      <div style={{ width: '100%', maxWidth: '360px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Email Address</label>
                        <input
                          type="text"
                          value={inputVal}
                          onChange={(e) => setInputVal(e.target.value)}
                          placeholder="name@domain.com"
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            background: '#060913',
                            border: '1px solid var(--border-accent)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '14px',
                            outline: 'none',
                          }}
                        />
                      </div>
                    )}

                    {selectedComponent.name === 'Card' && (
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '420px',
                          padding: cardPadding === 'sm' ? '16px' : cardPadding === 'lg' ? '32px' : '24px',
                          borderRadius: '12px',
                          background: cardVariant === 'elevated' ? 'rgba(15, 23, 42, 0.9)' : cardVariant === 'outlined' ? 'transparent' : 'rgba(255,255,255,0.02)',
                          border: '1px solid',
                          borderColor: cardVariant === 'outlined' ? '#6366f1' : 'var(--border-subtle)',
                          boxShadow: cardVariant === 'elevated' ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : 'none',
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '8px' }}>
                          Elevated Enterprise Card
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                          Standard container component mapped to radius, spacing, and surface token dependencies.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Multi-Framework Code Generator Tabs */}
                  <div style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Code Generator</h3>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(['react', 'html', 'swift', 'kotlin'] as const).map((fw) => (
                          <button
                            key={fw}
                            onClick={() => setComponentFramework(fw)}
                            style={{
                              padding: '4px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              background: componentFramework === fw ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                              color: componentFramework === fw ? '#fff' : 'var(--text-secondary)',
                              border: '1px solid',
                              borderColor: componentFramework === fw ? '#6366f1' : 'var(--border-subtle)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {fw}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => copyToClipboard(selectedComponent.codeSnippet || '', 'comp-code')}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '12px',
                          background: 'rgba(255,255,255,0.1)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          color: '#fff',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {copiedKey === 'comp-code' ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                        {copiedKey === 'comp-code' ? 'Copied' : 'Copy'}
                      </button>
                      <pre
                        style={{
                          background: '#090d16',
                          padding: '18px 20px',
                          borderRadius: '8px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '13px',
                          lineHeight: '1.6',
                          color: '#a5b4fc',
                          overflowX: 'auto',
                        }}
                      >
                        {componentFramework === 'react' && (
                          selectedComponent.name === 'Button'
                            ? `<Button variant="${selectedVariant}" size="${selectedSize}">Click Me</Button>`
                            : selectedComponent.name === 'Badge'
                            ? `<Badge tone="${badgeTone}">Status Indicator</Badge>`
                            : selectedComponent.name === 'TextInput'
                            ? `<TextInput placeholder="Enter email..." value="${inputVal}" />`
                            : `<Card variant="${cardVariant}" padding="${cardPadding}">Content</Card>`
                        )}
                        {componentFramework === 'html' && (
                          selectedComponent.name === 'Button'
                            ? `<button class="btn btn-${selectedVariant} btn-${selectedSize}">Click Me</button>`
                            : selectedComponent.name === 'Badge'
                            ? `<span class="badge badge-${badgeTone}">Status Indicator</span>`
                            : selectedComponent.name === 'TextInput'
                            ? `<input class="form-input" placeholder="Enter email..." value="${inputVal}" />`
                            : `<div class="card card-${cardVariant} p-${cardPadding}">Content</div>`
                        )}
                        {componentFramework === 'swift' && (
                          selectedComponent.name === 'Button'
                            ? `Button(action: { /* action */ }) {\n  Text("Click Me")\n    .padding(.horizontal, Tokens.Spacing.md)\n    .background(Tokens.ColorBrandPrimary)\n    .cornerRadius(Tokens.BorderRadius.md)\n}`
                            : `Text("Badge").badge(Tokens.ColorBrandPrimary)`
                        )}
                        {componentFramework === 'kotlin' && (
                          selectedComponent.name === 'Button'
                            ? `Button(\n  onClick = { /* action */ },\n  colors = ButtonDefaults.buttonColors(backgroundColor = Tokens.ColorBrandPrimary),\n  shape = RoundedCornerShape(Tokens.BorderRadius.md)\n) {\n  Text("Click Me")\n}`
                            : `Badge { Text("Active") }`
                        )}
                      </pre>
                    </div>
                  </div>

                  {/* Token Dependencies */}
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Design Token Dependencies</h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedComponent.tokenDependencies?.map((dep: string) => (
                      <span key={dep} className="badge badge-indigo" style={{ fontFamily: 'monospace' }}>
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: QUALITY INTELLIGENCE AUDITOR */}
        {activeTab === 'audit' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                  Quality Intelligence & Compliance
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                  Deterministic linter catching hardcoded hex colors, unregistered variables, and deprecated tokens with SARIF reports and 1-click token remediation.
                </p>
              </div>

              <button onClick={() => runAudit()} disabled={auditing} className="btn-primary">
                {auditing ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                Run Code Audit
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Code Input Playground */}
              <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <span>SOURCE CODE UNDER TEST</span>
                  <span>src/components/Card.tsx</span>
                </div>
                <textarea
                  value={auditCode}
                  onChange={(e) => setAuditCode(e.target.value)}
                  style={{
                    width: '100%',
                    height: '420px',
                    background: '#090d16',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '16px',
                    color: '#e2e8f0',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              {/* Audit Findings Results */}
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>
                    Audit Findings {auditReport && `(${auditReport.totalFindings})`}
                  </div>
                  {auditReport && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span className="badge badge-rose">Errors: {auditReport.errorCount}</span>
                      <span className="badge badge-amber">Warnings: {auditReport.warningCount}</span>
                      <span className="badge badge-indigo">Info: {auditReport.infoCount}</span>
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {!auditReport ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                      Click "Run Code Audit" to evaluate the code snippet.
                    </div>
                  ) : auditReport.findings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#10b981' }}>
                      <CheckCircle2 size={36} style={{ marginBottom: '12px' }} />
                      <div style={{ fontWeight: 700, fontSize: '16px' }}>100% Compliant!</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Zero design system violations found. All styles cleanly utilize registered design tokens.
                      </div>
                    </div>
                  ) : (
                    auditReport.findings.map((f: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderLeft: `4px solid ${f.severity === 'error' ? '#f43f5e' : f.severity === 'warning' ? '#f59e0b' : '#6366f1'}`,
                          padding: '14px',
                          borderRadius: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px', color: '#fff' }}>
                            Line {f.line} &bull; {f.ruleId}
                          </span>
                          <span className={`badge ${f.severity === 'error' ? 'badge-rose' : f.severity === 'warning' ? 'badge-amber' : 'badge-indigo'}`}>
                            {f.severity}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          {f.message}
                        </div>
                        <div style={{ background: '#060913', padding: '8px 12px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                          {f.evidence}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {f.suggestedFix && (
                            <div style={{ fontSize: '12px', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <CheckCircle2 size={13} /> {f.suggestedFix}
                            </div>
                          )}
                          <button
                            onClick={() => handleApplyFix(f.ruleId, f.suggestedFix)}
                            className="btn-secondary"
                            style={{ fontSize: '11px', padding: '4px 10px', color: '#6ee7b7', borderColor: 'rgba(110, 231, 183, 0.3)' }}
                          >
                            <Wand2 size={12} /> Auto-Fix
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

        {/* TAB 5: DETERMINISTIC CODE EXPORTER */}
        {activeTab === 'exporter' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                  Deterministic Code Exporters
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                  Multi-platform exports for Web (CSS, TypeScript, Tailwind), iOS (SwiftUI), and Android (Jetpack Compose).
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleDownloadExport}
                  className="btn-secondary"
                  style={{ color: '#06b6d4', borderColor: 'rgba(6, 182, 212, 0.3)' }}
                >
                  <Download size={14} /> Download File
                </button>
                <button
                  onClick={() => exportedContent && copyToClipboard(exportedContent.content, 'exported-code')}
                  className="btn-primary"
                >
                  {copiedKey === 'exported-code' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  {copiedKey === 'exported-code' ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>

            {/* Target Format Pills */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {(['css', 'json', 'typescript', 'tailwind', 'swift', 'kotlin'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => loadExport(fmt)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: exportFormat === fmt ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                    color: exportFormat === fmt ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid',
                    borderColor: exportFormat === fmt ? '#6366f1' : 'var(--border-subtle)',
                    textTransform: 'uppercase',
                  }}
                >
                  {fmt === 'css'
                    ? 'tokens.css (Multi-Theme)'
                    : fmt === 'json'
                    ? 'tokens.json (DTCG)'
                    : fmt === 'typescript'
                    ? 'tokens.ts (TS types)'
                    : fmt === 'tailwind'
                    ? 'tailwind.config.js'
                    : fmt === 'swift'
                    ? 'Tokens.swift (iOS)'
                    : 'Tokens.kt (Android)'}
                </button>
              ))}
            </div>

            {/* Code Output Viewer */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <pre
                style={{
                  background: '#090d16',
                  padding: '24px',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#e2e8f0',
                  maxHeight: '520px',
                  overflowY: 'auto',
                }}
              >
                {loadingExport ? 'Generating code artifacts...' : exportedContent?.content}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 6: RELEASES & VERSION HISTORY */}
        {activeTab === 'releases' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                  Design System Releases & Version History
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                  Immutable version snapshots of design tokens and components with changelogs and audit metrics.
                </p>
              </div>

              <button onClick={() => setShowReleaseModal(true)} className="btn-primary">
                <Plus size={14} /> Publish New Release
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {releasesList.map((rel, idx) => (
                <div key={rel.id || idx} className="glass-panel" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '14px', padding: '6px 14px' }}>
                        v{rel.version}
                      </span>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{rel.title}</h3>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(rel.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    {rel.description}
                  </p>

                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <span className="badge badge-indigo">Tokens: {rel.tokensCount}</span>
                    <span className="badge badge-amber">Components: {rel.componentsCount}</span>
                    <span className="badge badge-emerald">W3C Compliant</span>
                  </div>

                  <div style={{ background: '#090d16', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#a5b4fc', marginBottom: '6px' }}>
                      CHANGELOG
                    </div>
                    <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#cbd5e1', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {rel.changelog}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: MCP AGENT PLAYGROUND */}
        {activeTab === 'mcp' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                  Model Context Protocol (MCP) Simulator
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                  Live agent testing playground using the official `@modelcontextprotocol/sdk` tool definitions.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-emerald">8 Tools Live</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px' }}>
              {/* Tool Selector */}
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Select Tool to Invoke</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
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
                        padding: '10px 14px',
                        borderRadius: '6px',
                        background: mcpTool === t ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid',
                        borderColor: mcpTool === t ? 'var(--border-accent)' : 'transparent',
                        color: mcpTool === t ? '#fff' : 'var(--text-secondary)',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Tool Arguments (JSON)</h3>
                <textarea
                  value={mcpCustomArg}
                  onChange={(e) => setMcpCustomArg(e.target.value)}
                  style={{
                    width: '100%',
                    height: '100px',
                    background: '#090d16',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '10px',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    outline: 'none',
                    resize: 'none',
                    marginBottom: '16px',
                  }}
                />

                <button onClick={executeMcpTool} disabled={mcpLoading} className="btn-primary" style={{ width: '100%' }}>
                  {mcpLoading ? <RefreshCw size={14} className="animate-spin" /> : <Bot size={14} />}
                  Invoke MCP Tool
                </button>
              </div>

              {/* JSON-RPC Output */}
              <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <span>MCP JSON-RPC RESULT</span>
                  <span>Project Scoped: proj-core-web</span>
                </div>
                <pre
                  style={{
                    background: '#090d16',
                    padding: '20px',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    color: '#6ee7b7',
                    height: '480px',
                    overflowY: 'auto',
                  }}
                >
                  {mcpLoading ? 'Invoking MCP server handler...' : mcpResult ? JSON.stringify(mcpResult, null, 2) : '// Click "Invoke MCP Tool" to see structured agent context'}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: GITHUB CONTINUOUS DELIVERY */}
        {activeTab === 'delivery' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                  GitHub Continuous Delivery Engine
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                  Automate code delivery from your central design system to production repositories with pull requests and diff previews.
                </p>
              </div>

              <button onClick={triggerDelivery} disabled={delivering} className="btn-primary">
                {delivering ? <RefreshCw size={14} className="animate-spin" /> : <GitPullRequest size={14} />}
                Trigger Automated Release PR
              </button>
            </div>

            <div className="glass-panel" style={{ padding: '28px', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Target Repository Configuration</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Repository</label>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#fff', marginTop: '4px' }}>acme-corp/web-platform-core</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Base Branch</label>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#fff', marginTop: '4px' }}>main</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Generated Files</label>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#6ee7b7', marginTop: '4px' }}>tokens.css, tokens.ts, Tokens.swift, Tokens.kt</div>
                </div>
              </div>

              {deliveryResult && (
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6ee7b7', fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>
                    <CheckCircle2 size={18} /> Pull Request Successfully Created & Idempotently Verified!
                  </div>
                  <div style={{ fontSize: '13px', color: '#fff', marginBottom: '12px' }}>
                    PR URL: <a href={deliveryResult.pullRequestUrl} target="_blank" rel="noreferrer" style={{ color: '#a5b4fc', textDecoration: 'underline' }}>{deliveryResult.pullRequestUrl}</a>
                  </div>
                  <pre style={{ background: '#090d16', padding: '16px', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace', color: '#94a3b8' }}>
                    {deliveryResult.diffSummary}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 9: DOCUMENTATION STUDIO */}
        {activeTab === 'docs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                  Living Documentation Studio
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                  Self-updating design system documentation directly bound to PostgreSQL database tokens.
                </p>
              </div>

              <a href="/docs" target="_blank" rel="noreferrer" className="btn-primary" style={{ textDecoration: 'none' }}>
                <ExternalLink size={14} /> Open Full Documentation Portal (/docs)
              </a>
            </div>

            <div className="glass-panel" style={{ padding: '36px', maxWidth: '880px', lineHeight: '1.8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>
                  Nova Design System Guidelines
                </h2>
                <span className="badge badge-indigo">Version v{activeRelease.version}</span>
              </div>

              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Welcome to Acme's unified design system. All engineering components and AI coding agents consume tokens verified through our Model Context Protocol (MCP) server.
              </p>

              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#a5b4fc' }}>
                Primary Action Color Tokens
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Our semantic primary colors resolve dynamically from our primitive blue palette:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#3b82f6' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '13px' }}>color.brand.primary</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Resolves to #3b82f6</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#2563eb' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '13px' }}>color.brand.primaryHover</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Resolves to #2563eb</div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#a5b4fc' }}>
                AI Coding Agent Instructions (MCP Integration)
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
                AI assistants must query the project MCP tools before proposing UI styles. Never hardcode arbitrary hex colors; always reference existing CSS custom properties.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD TOKEN */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '480px', padding: '28px', background: '#0c1222', border: '1px solid var(--border-accent)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>Add New Design Token</h2>
            <form onSubmit={handleAddToken}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Token Path (dot notation)</label>
                <input
                  type="text"
                  value={newTokenPath}
                  onChange={(e) => setNewTokenPath(e.target.value)}
                  required
                  placeholder="color.brand.accent"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#060913', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Raw Value (hex, px, or alias {"{path}"})</label>
                <input
                  type="text"
                  value={newTokenValue}
                  onChange={(e) => setNewTokenValue(e.target.value)}
                  required
                  placeholder="#06b6d4 or {color.primitive.blue.500}"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#060913', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Category</label>
                <select
                  value={newTokenCategory}
                  onChange={(e) => setNewTokenCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#060913', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px', outline: 'none' }}
                >
                  <option value="color">color</option>
                  <option value="spacing">spacing</option>
                  <option value="borderRadius">borderRadius</option>
                  <option value="typography">typography</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Description</label>
                <input
                  type="text"
                  value={newTokenDesc}
                  onChange={(e) => setNewTokenDesc(e.target.value)}
                  placeholder="Usage notes for teams"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#060913', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={savingToken} className="btn-primary">
                  {savingToken ? 'Saving...' : 'Save to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FIGMA SYNC PIPELINE */}
      {showFigmaModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '640px', maxHeight: '85vh', overflowY: 'auto', padding: '28px', background: '#0c1222', border: '1px solid #06b6d4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <FigmaIcon size={24} color="#06b6d4" />
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Figma Variables Live Sync</h2>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Ingest Figma Variable collections and review conflict diffs before committing.</div>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Figma File Key</label>
              <input
                type="text"
                value={figmaFileKey}
                onChange={(e) => setFigmaFileKey(e.target.value)}
                placeholder="e.g. 4s7xK0m2zN..."
                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#060913', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Figma Personal Access Token (Optional: leave blank for simulated fixture)</label>
              <input
                type="password"
                value={figmaToken}
                onChange={(e) => setFigmaToken(e.target.value)}
                placeholder="figd_..."
                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#060913', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Target Variable Mode</label>
              <select
                value={figmaMode}
                onChange={(e) => setFigmaMode(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#060913', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px', outline: 'none' }}
              >
                <option value="Light">Light Mode</option>
                <option value="Dark">Dark Mode</option>
                <option value="Default">Default</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button type="button" onClick={() => handleFigmaSync(false)} disabled={figmaSyncing} className="btn-secondary" style={{ flex: 1 }}>
                {figmaSyncing ? 'Fetching...' : '1. Preview Conflict Diff'}
              </button>
              {figmaDiffResult && (
                <button type="button" onClick={() => handleFigmaSync(true)} disabled={figmaSyncing} className="btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)' }}>
                  2. Apply Sync ({figmaDiffResult.totalVariablesFound} Tokens)
                </button>
              )}
            </div>

            {/* Diff Preview Results */}
            {figmaDiffResult && (
              <div style={{ background: '#060913', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#a5b4fc', marginBottom: '10px' }}>
                  Variable Diff Summary ({figmaDiffResult.diff.length} items):
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {figmaDiffResult.diff.map((item: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                      <span className="font-mono" style={{ color: '#fff' }}>{item.path}</span>
                      <span className={`badge ${item.status === 'added' ? 'badge-emerald' : item.status === 'modified' ? 'badge-amber' : 'badge-indigo'}`}>
                        {item.status.toUpperCase()} ({item.newValue})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="button" onClick={() => setShowFigmaModal(false)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PUBLISH VERSION RELEASE */}
      {showReleaseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '520px', padding: '28px', background: '#0c1222', border: '1px solid #a5b4fc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Tag size={22} color="#a5b4fc" />
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Publish Design System Release</h2>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Create an immutable version snapshot with tokens, components, and changelog.</div>
              </div>
            </div>

            <form onSubmit={handlePublishRelease}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Version (SemVer)</label>
                <input
                  type="text"
                  value={newReleaseVersion}
                  onChange={(e) => setNewReleaseVersion(e.target.value)}
                  required
                  placeholder="1.4.0"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#060913', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Release Title</label>
                <input
                  type="text"
                  value={newReleaseTitle}
                  onChange={(e) => setNewReleaseTitle(e.target.value)}
                  required
                  placeholder="Typography Scale & Component Refactor"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#060913', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Changelog Notes</label>
                <textarea
                  value={newReleaseChangelog}
                  onChange={(e) => setNewReleaseChangelog(e.target.value)}
                  rows={4}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#060913', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '12px', outline: 'none', resize: 'none', lineHeight: '1.6' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowReleaseModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={publishingRelease} className="btn-primary">
                  {publishingRelease ? 'Publishing...' : 'Publish Version Release'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
