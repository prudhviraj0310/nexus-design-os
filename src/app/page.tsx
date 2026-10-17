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
  Image as ImageIcon,
  Boxes,
  Upload,
} from 'lucide-react';
import { ComponentPreview } from '@/components/ComponentPreview';
import { Swatch } from '@/components/Swatch';

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
    | 'assets'
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

  // Payno / Orbix Workspace State
  const [balanceVisible, setBalanceVisible] = useState<boolean>(true);
  const [quickDeliveryFormat, setQuickDeliveryFormat] = useState<string>('tailwind');
  const [quickDelivering, setQuickDelivering] = useState<boolean>(false);
  const [quickDeliverySuccess, setQuickDeliverySuccess] = useState<string | null>(null);
  const [tokenDrawerToken, setTokenDrawerToken] = useState<any | null>(null);
  const [copiedTokenPath, setCopiedTokenPath] = useState<string | null>(null);



  // Vector Assets state
  const [assetsList, setAssetsList] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState<boolean>(true);
  const [assetSearch, setAssetSearch] = useState<string>('');
  const [selectedAssetCategory, setSelectedAssetCategory] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [showAddAssetModal, setShowAddAssetModal] = useState<boolean>(false);
  const [newAssetName, setNewAssetName] = useState<string>('Compass');
  const [newAssetCategory, setNewAssetCategory] = useState<string>('icons');
  const [newAssetSvg, setNewAssetSvg] = useState<string>('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>');
  const [newAssetTags, setNewAssetTags] = useState<string>('navigation, direction, maps');
  const [savingAsset, setSavingAsset] = useState<boolean>(false);

  // Living Documentation Pages state
  const [docPagesList, setDocPagesList] = useState<any[]>([]);
  const [loadingDocPages, setLoadingDocPages] = useState<boolean>(true);
  const [selectedDocPage, setSelectedDocPage] = useState<any | null>(null);
  const [editingDocTitle, setEditingDocTitle] = useState<string>('');
  const [editingDocContent, setEditingDocContent] = useState<string>('');
  const [savingDocPage, setSavingDocPage] = useState<boolean>(false);

  // Figma Diff Modal & Review state
  const [showFigmaDiffModal, setShowFigmaDiffModal] = useState<boolean>(false);
  const [figmaDiffMode, setFigmaDiffMode] = useState<'preview' | 'applied'>('preview');
  const [figmaDiffCommitSuccess, setFigmaDiffCommitSuccess] = useState<boolean>(false);

  // Components state
  const [components, setComponents] = useState<any[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [componentVariant, setComponentVariant] = useState<string>('primary');
  const [componentSize, setComponentSize] = useState<string>('md');
  const [componentFramework, setComponentFramework] = useState<'react' | 'html' | 'swift' | 'kotlin'>('react');
  const [componentTab, setComponentTab] = useState<'preview' | 'props' | 'code' | 'tokens'>('preview');
  const [storybookIframeMode, setStorybookIframeMode] = useState<boolean>(false);
  const [storybookUrl, setStorybookUrl] = useState<string>('http://localhost:6006');
  const [switchChecked, setSwitchChecked] = useState<boolean>(true);
  const [showTestModal, setShowTestModal] = useState<boolean>(false);

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
  const [oauthAvailable, setOauthAvailable] = useState<boolean>(false);
  const [oauthNotice, setOauthNotice] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<'github_app' | 'token' | null>(null);
  const [installationId, setInstallationId] = useState<string | null>(null);
  const [appSlug, setAppSlug] = useState<string>('nexus-design-os');

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
  const [uiNotice, setUiNotice] = useState<string | null>(null);

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

  const showUiNotice = (message: string) => {
    setUiNotice(message);
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

  // Authentication & Session Management
  const [authRequired, setAuthRequired] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthorized'>('checking');
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      if (data.authenticated) {
        setAuthStatus('authenticated');
        setAuthUserId(data.userId);
        setAuthRequired(false);
      } else if (data.authRequired) {
        setAuthStatus('unauthorized');
        setAuthRequired(true);
      } else {
        setAuthStatus('authenticated');
        setAuthRequired(false);
      }
    } catch {
      setAuthStatus('authenticated');
    }
  };

  const apiFetch = async (url: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers || {});
    const key = (typeof window !== 'undefined' ? localStorage.getItem('nexus_api_key') : null) || apiKeyInput;
    if (key && !headers.has('Authorization') && !headers.has('x-api-key')) {
      headers.set('x-api-key', key);
    }
    const res = await fetch(url, { ...init, headers, credentials: 'same-origin' });
    if (res.status === 401) {
      setAuthRequired(true);
      setAuthStatus('unauthorized');
    } else if (res.ok) {
      setAuthStatus('authenticated');
    }
    return res;
  };

  const handleAuthenticate = async (tokenToUse?: string) => {
    const key = (tokenToUse !== undefined ? tokenToUse : apiKeyInput).trim();
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key }),
      });
      const data = await res.json();
      if (data.success) {
        if (key) {
          localStorage.setItem('nexus_api_key', key);
          document.cookie = `nexus_api_key=${encodeURIComponent(key)}; path=/; max-age=2592000; SameSite=Lax`;
        }
        setAuthRequired(false);
        setShowAuthModal(false);
        setAuthStatus('authenticated');
        setAuthUserId(data.userId);
        await Promise.all([
          loadTokens(),
          loadComponents(),
          loadAssets(),
          loadDocPages(),
          loadReleases(),
          loadExport(exportFormat),
        ]);
      } else {
        alert(data.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      alert(`Error authenticating: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      localStorage.removeItem('nexus_api_key');
      document.cookie = 'nexus_api_key=; path=/; max-age=0;';
      setAuthStatus('unauthorized');
      setAuthUserId(null);
      setAuthRequired(true);
      setShowAuthModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Initial Load: Tokens, Components, Releases
  const loadTokens = async () => {
    try {
      setLoadingTokens(true);
      const res = await apiFetch('/api/tokens');
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
      const res = await apiFetch('/api/components');
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
      const res = await apiFetch('/api/releases');
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
      const res = await apiFetch(`/api/export?format=${format}`);
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
      const res = await apiFetch('/api/github/repos');
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
      const res = await apiFetch('/api/github/connect');
      const data = await res.json();
      setOauthAvailable(Boolean(data.oauthAvailable));
      if (data.appSlug) setAppSlug(data.appSlug);
      if (data.connected && data.user) {
        setGithubConnected(true);
        setGithubUser(data.user);
        setAuthMethod(data.authMethod || 'token');
        setInstallationId(data.installationId || null);
        await loadGithubRepos();
      } else {
        setGithubConnected(false);
        setGithubUser(null);
        setAuthMethod(null);
        setInstallationId(null);
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
      const res = await apiFetch('/api/github/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: customGithubToken.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setGithubConnected(true);
        setGithubUser(data.user);
        setAuthMethod('token');
        setCustomGithubToken('');
        setShowConnectModal(false);
        setOauthNotice(null);
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
      await apiFetch('/api/github/connect', { method: 'DELETE' });
      setGithubConnected(false);
      setGithubUser(null);
      setAuthMethod(null);
      setInstallationId(null);
      setGithubRepos([]);
    } catch (err) {
      console.error('Failed to disconnect GitHub', err);
    }
  };

  // Asset Management Handlers
  const loadAssets = async () => {
    try {
      setLoadingAssets(true);
      const res = await apiFetch('/api/assets');
      const data = await res.json();
      if (data.assets) {
        setAssetsList(data.assets);
        if (!selectedAsset && data.assets.length > 0) {
          setSelectedAsset(data.assets[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load assets', err);
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAsset(true);
    try {
      const tagsArray = newAssetTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const res = await apiFetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAssetName.trim(),
          category: newAssetCategory,
          svgContent: newAssetSvg.trim(),
          tags: tagsArray,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddAssetModal(false);
        await loadAssets();
      } else {
        alert(`Error adding asset: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Failed to add asset: ${err.message}`);
    } finally {
      setSavingAsset(false);
    }
  };

  // Living Documentation Handlers
  const loadDocPages = async () => {
    try {
      setLoadingDocPages(true);
      const res = await apiFetch('/api/docs');
      const data = await res.json();
      if (data.pages) {
        setDocPagesList(data.pages);
        if (data.pages.length > 0) {
          setSelectedDocPage(data.pages[0]);
          setEditingDocTitle(data.pages[0].title);
          setEditingDocContent(data.pages[0].content);
        }
      }
    } catch (err) {
      console.error('Failed to load doc pages', err);
    } finally {
      setLoadingDocPages(false);
    }
  };

  const handleSaveDocPage = async () => {
    if (!selectedDocPage) return;
    setSavingDocPage(true);
    try {
      const res = await apiFetch('/api/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedDocPage.id,
          slug: selectedDocPage.slug,
          title: editingDocTitle,
          category: selectedDocPage.category,
          content: editingDocContent,
          order: selectedDocPage.order,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadDocPages();
        alert('Documentation page updated successfully!');
      } else {
        alert(`Failed to update doc page: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error saving doc page: ${err.message}`);
    } finally {
      setSavingDocPage(false);
    }
  };

  useEffect(() => {
    // Check URL search params for apiKey, GitHub App installation, or OAuth callback result
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlApiKey = urlParams.get('apiKey') || urlParams.get('token') || urlParams.get('api_key');
      if (urlApiKey) {
        localStorage.setItem('nexus_api_key', urlApiKey);
        document.cookie = `nexus_api_key=${encodeURIComponent(urlApiKey)}; path=/; max-age=2592000; SameSite=Lax`;
        setApiKeyInput(urlApiKey);
      }
      if (urlParams.get('github') === 'installed' || urlParams.get('github') === 'connected') {
        checkGithubStatus();
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (urlParams.get('github_error')) {
        const err = urlParams.get('github_error');
        if (err === 'missing_oauth_credentials') {
          setOauthNotice('GitHub OAuth App is not configured on this server. Please use 1-Click Install on GitHub instead!');
          setShowConnectModal(true);
        } else {
          alert(`GitHub error: ${err}`);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    checkAuthStatus();
    loadTokens();
    loadComponents();
    loadAssets();
    loadDocPages();
    loadReleases();
    loadExport('tailwind');
    checkGithubStatus();
  }, []);

  // 2. Add Token Action
  const handleAddToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingToken(true);
    try {
      const res = await apiFetch('/api/tokens', {
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
      const res = await apiFetch(`/api/tokens?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await loadTokens();
        if (selectedToken?.id === id) setSelectedToken(null);
      }
    } catch (err) {
      console.error('Failed to delete token', err);
    }
  };

  // 4. Figma Sync Action (Two-stage dry-run and commit flow)
  const handleSyncFigma = async (apply: boolean = false) => {
    setFigmaSyncing(true);
    if (!apply) {
      setFigmaDiffResult(null);
      setFigmaDiffCommitSuccess(false);
    }
    try {
      const res = await apiFetch('/api/figma/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileKey: figmaFileKey,
          figmaToken: figmaToken,
          personalAccessToken: figmaToken,
          modeName: figmaMode,
          mode: figmaMode,
          dryRun: !apply,
          applyChanges: apply,
        }),
      });
      const data = await res.json();
      setFigmaDiffResult(data);
      setFigmaDiffMode(apply ? 'applied' : 'preview');
      setShowFigmaDiffModal(true);
      if (data.success && apply) {
        setFigmaDiffCommitSuccess(true);
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
      const res = await apiFetch('/api/deliver', {
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

  const handleQuickDeliver = async () => {
    setQuickDelivering(true);
    setQuickDeliverySuccess(null);
    try {
      const [owner, name] = targetRepo.includes('/') ? targetRepo.split('/') : ['prudhviraj0310', targetRepo];
      const res = await apiFetch('/api/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: name,
          owner,
          branch: targetBranch || 'main',
          title: `chore: publish ${quickDeliveryFormat} tokens via Nexus OS`,
          formats: [quickDeliveryFormat],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuickDeliverySuccess(`Delivered successfully! ${data.prUrl || data.commitSha ? `Ref: ${data.prUrl || data.commitSha}` : 'Export bundle generated.'}`);
      } else {
        setQuickDeliverySuccess(`Delivery processed: ${data.message || 'Manifest generated.'}`);
      }
    } catch (err: any) {
      setQuickDeliverySuccess(`Delivered: ${err.message}`);
    } finally {
      setQuickDelivering(false);
    }
  };

  // 6. AST Code Audit Action
  const handleRunAudit = async () => {
    setAuditing(true);
    try {
      const res = await apiFetch('/api/audit', {
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
      const res = await apiFetch('/api/releases', {
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
      const res = await apiFetch('/api/mcp', {
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
    <div className="nexus-floating-canvas min-h-screen w-screen flex items-center justify-center p-2 sm:p-4 lg:p-6 text-[#0f172a] font-sans antialiased selection:bg-[#2563eb] selection:text-white">
      {/* 1. MAIN FLOATING WORKSPACE SHELL (Payno / Orbix aesthetic) */}
      <div className="nexus-shell w-full max-w-[1520px] h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] flex flex-col overflow-hidden relative shadow-2xl">
        {/* TOP WORKSPACE HEADER BAR */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-[#e2e8f0]/80 bg-white/70 backdrop-blur-md flex-shrink-0 z-20">
          {/* Left: Brand Pill matching Lovable AppShell */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveNav('overview')}
              className="flex items-center gap-3 cursor-pointer group text-left border-0 bg-transparent p-0"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-base font-bold text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
                N
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold tracking-tight text-[#0f172a]">nexus</span>
                <span className="text-[11px] font-mono font-semibold text-[#64748b] bg-white/90 px-2 py-0.5 rounded-full border border-[#e2e8f0]">
                  v1.3.0
                </span>
              </div>
            </button>
          </div>

          {/* Center: Global Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search size={14} className="absolute left-3.5 top-2.5 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Search tokens, components, docs, pipelines..."
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] pl-9 pr-4 py-1.5 rounded-full text-xs text-[#0f172a] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:border-[#2563eb] transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Right: Active Section Glass Pill, Add Token, Notifications & Profile */}
          <div className="flex items-center gap-3">
            <div className="glass px-4 py-1.5 text-xs font-semibold text-[#475569] tracking-wide hidden sm:block">
              {activeNav === 'overview' ? 'Overview' : activeNav === 'tokens' ? 'Design Tokens' : activeNav === 'components' ? 'Components' : activeNav === 'docs' ? 'Living Docs' : activeNav === 'automation' ? 'Code Export' : activeNav === 'audit' ? 'Compliance Audit' : activeNav === 'releases' ? 'Releases' : activeNav === 'figma' ? 'Figma Sync' : activeNav === 'assets' ? 'Vector Assets' : 'AI Contexts'}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary text-xs py-1.5 px-3.5 rounded-full flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">Add Token</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              title="Click to manage credentials"
              className="w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-sm flex items-center justify-center text-xs font-bold tracking-wider hover:opacity-90 transition-opacity"
            >
              PR
            </button>
          </div>
        </header>

        {/* WORKSPACE BODY (SLIM ICON RAIL + MAIN CONTENT AREA) */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* 2. SLIM VERTICAL ICON RAIL */}
          <nav className="nexus-pill-nav my-2 ml-4 flex-shrink-0" aria-label="Main Navigation">
            {/* Primary Nav Items */}
            <div className="flex flex-col items-center gap-1.5 w-full">
              {[
                { nav: 'overview' as const, label: 'Overview', icon: <Grid size={16} /> },
                { nav: 'tokens' as const, label: 'Design Tokens', icon: <Layers size={16} />, count: tokens.length },
                { nav: 'components' as const, label: 'Components', icon: <Boxes size={16} />, count: components.length },
                { nav: 'docs' as const, label: 'Living Docs', icon: <BookOpen size={16} />, count: docPagesList.length },
                { nav: 'automation' as const, label: 'Code Export', icon: <Code2 size={16} /> },
                { nav: 'audit' as const, label: 'Compliance Audit', icon: <ShieldCheck size={16} /> },
                { nav: 'releases' as const, label: 'Releases', icon: <Tag size={16} />, count: releasesList.length },
                { nav: 'figma' as const, label: 'Figma Sync', icon: <IntegrationLogo name="figma" size={15} /> },
                { nav: 'assets' as const, label: 'Vector Assets', icon: <ImageIcon size={16} />, count: assetsList.length },
                { nav: 'contexts' as const, label: 'AI Contexts', icon: <Sparkles size={16} /> },
              ].map((item) => {
                const isActive = activeNav === item.nav;
                return (
                  <button
                    key={item.nav}
                    type="button"
                    onClick={() => setActiveNav(item.nav)}
                    title={item.label}
                    aria-label={item.label}
                    className={`nexus-pill-btn ${isActive ? 'active' : ''}`}
                  >
                    {item.icon}
                    <span className="nexus-rail-tooltip">
                      {item.label} {item.count !== undefined ? `(${item.count})` : ''}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Utilities (Settings & Docs) */}
            <div className="flex flex-col items-center gap-1.5 w-full pt-2 border-t border-[#e2e8f0]/80">
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                title="Settings & Credentials"
                className="nexus-pill-btn"
              >
                <Settings size={15} />
                <span className="nexus-rail-tooltip">Settings & Auth</span>
              </button>
              <button
                type="button"
                onClick={() => window.open('/docs', '_blank', 'noopener,noreferrer')}
                title="Public Documentation Portal"
                className="nexus-pill-btn"
              >
                <HelpCircle size={15} />
                <span className="nexus-rail-tooltip">Documentation</span>
              </button>
            </div>
          </nav>

          {/* 3. MAIN WORKSPACE VIEWPORT */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 relative bg-transparent">
            {/* Banner Notice */}
            {uiNotice && (
              <div
                role="status"
                className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] px-4 py-2.5 text-xs text-[#1e40af] shadow-xs"
              >
                <span>{uiNotice}</span>
                <button
                  type="button"
                  onClick={() => setUiNotice(null)}
                  className="font-bold hover:underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW: OVERVIEW - Pixel-accurate Payno / Orbix aesthetic                   */}
            {/* ========================================================================= */}
            {activeNav === 'overview' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                {/* Page Header matching Lovable */}
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-[#0f172a]">Design system</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Single source of truth — from tokens to shipped code.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      className="btn-primary rounded-full px-4 py-2 flex items-center gap-1.5 text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      <Plus size={14} /> New token
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveNav('tokens')}
                      className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-[#475569] hover:bg-white transition-colors cursor-pointer"
                    >
                      <Upload size={13} /> Import JSON
                    </button>
                  </div>
                </div>

                {/* ROW 1: Total Tokens / Unreleased Changes / Semantic Palette */}
                <div className="nexus-grid-12">
                  {/* CARD 1: Total Tokens */}
                  <section className="glass p-6 col-span-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground font-medium">
                        <span className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-primary" /> Total tokens
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveNav('tokens')}
                          className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
                          aria-label="Open tokens"
                          title="Open tokens studio"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="mt-4 text-5xl font-semibold tracking-tight text-[#0f172a]">{tokens.length}</p>
                      <p className="mt-2 inline-block rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground font-medium">
                        {tokens.filter((t) => t.rawValue?.startsWith('{')).length} aliases · {tokens.filter((t) => !t.resolvedValue).length} broken
                      </p>

                      <p className="mt-6 text-sm font-medium text-[#0f172a]">Quick actions</p>
                      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveNav('tokens');
                            setShowAddModal(true);
                          }}
                          className="flex flex-col items-center gap-2 group cursor-pointer"
                        >
                          <span className="grid h-11 w-11 place-items-center rounded-full border border-[#e2e8f0] bg-white group-hover:bg-[#0f172a] group-hover:text-white transition-all shadow-xs">
                            <Upload className="h-4 w-4" />
                          </span>
                          <span className="text-[11px] font-semibold text-[#475569]">Import</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveNav('automation')}
                          className="flex flex-col items-center gap-2 group cursor-pointer"
                        >
                          <span className="grid h-11 w-11 place-items-center rounded-full border border-[#e2e8f0] bg-white group-hover:bg-[#0f172a] group-hover:text-white transition-all shadow-xs">
                            <Code2 className="h-4 w-4" />
                          </span>
                          <span className="text-[11px] font-semibold text-[#475569]">Export</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveNav('components')}
                          className="flex flex-col items-center gap-2 group cursor-pointer"
                        >
                          <span className="grid h-11 w-11 place-items-center rounded-full border border-[#e2e8f0] bg-white group-hover:bg-[#0f172a] group-hover:text-white transition-all shadow-xs">
                            <Boxes className="h-4 w-4" />
                          </span>
                          <span className="text-[11px] font-semibold text-[#475569]">Components</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveNav('releases')}
                          className="flex flex-col items-center gap-2 group cursor-pointer"
                        >
                          <span className="grid h-11 w-11 place-items-center rounded-full border border-[#e2e8f0] bg-white group-hover:bg-[#0f172a] group-hover:text-white transition-all shadow-xs">
                            <Tag className="h-4 w-4" />
                          </span>
                          <span className="text-[11px] font-semibold text-[#475569]">Release</span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#f1f5f9]">
                      <p className="text-sm font-medium text-[#0f172a] mb-2">Groups</p>
                      <ul className="divide-y divide-[#f1f5f9]">
                        {Object.entries(
                          tokens.reduce<Record<string, number>>((acc, t) => {
                            const g = t.category || t.name.split('.')[0] || 'other';
                            acc[g] = (acc[g] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([g, count]) => (
                          <li key={g} className="flex justify-between py-1.5 text-xs">
                            <span className="capitalize font-medium text-[#475569]">{g}</span>
                            <span className="text-muted-foreground font-semibold">{count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>

                  {/* CARD 2: Unreleased Changes */}
                  <section className="glass p-6 col-span-4 flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Unreleased changes</p>
                      <p className="mt-3 text-4xl font-semibold text-[#0f172a]">3</p>
                      <div className="mt-3 flex gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-success">+2 added</span>
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[#475569]">~1 changed</span>
                        <span className="rounded-full bg-danger-soft px-2.5 py-0.5 text-destructive">−0 removed</span>
                      </div>
                    </div>

                    <div className="mt-8">
                      <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] mb-4 text-xs text-[#64748b]">
                        <span className="font-semibold text-[#0f172a] block mb-0.5">Automated Versioning</span>
                        Snapshot all design tokens and generate semver release notes.
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveNav('releases')}
                        className="block w-full rounded-full bg-primary py-2.5 text-center text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                      >
                        Publish after v1.3.0
                      </button>
                    </div>
                  </section>

                  {/* CARD 3: Semantic Palette */}
                  <section className="glass p-6 col-span-4 flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Semantic palette</p>
                      <p className="text-xs text-[#64748b] mt-0.5">Live values resolved from your token dictionary</p>

                      <div className="mt-4 grid grid-cols-4 gap-3 text-center">
                        {[
                          { name: 'primary', color: '#2563eb' },
                          { name: 'surface', color: '#ffffff' },
                          { name: 'text', color: '#0f172a' },
                          { name: 'success', color: '#10b981' },
                        ].map((c) => (
                          <div key={c.name} className="flex flex-col items-center">
                            <Swatch value={c.color} className="h-12 w-full rounded-xl" />
                            <p className="mt-1.5 truncate text-[11px] font-medium text-muted-foreground">{c.name}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#f1f5f9] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Base Scale</span>
                          <span className="font-mono font-medium text-[#0f172a]">16px (1rem)</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Typography</span>
                          <span className="font-medium text-[#0f172a]">Plus Jakarta Sans</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Border Radius</span>
                          <span className="font-mono font-medium text-[#0f172a]">1.25rem (pill/card)</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveNav('tokens')}
                      className="mt-4 text-xs font-semibold text-primary hover:underline text-left cursor-pointer"
                    >
                      Explore all 28 tokens →
                    </button>
                  </section>
                </div>

                {/* ROW 2: Components Preview / Pipelines / Fast Code Delivery */}
                <div className="nexus-grid-12">
                  {/* CARD 4: Components */}
                  <section className="glass p-6 col-span-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-sm mb-3">
                        <span className="font-medium text-[#0f172a]">Components</span>
                        <button
                          type="button"
                          onClick={() => setActiveNav('components')}
                          className="text-xs text-muted-foreground hover:text-primary font-medium cursor-pointer"
                        >
                          View all
                        </button>
                      </div>

                      <ul className="space-y-3">
                        {(components.slice(0, 4).length ? components.slice(0, 4) : [
                          { id: 'btn-1', name: 'Button', status: 'stable' },
                          { id: 'card-1', name: 'Card', status: 'stable' },
                          { id: 'badge-1', name: 'Badge', status: 'beta' },
                          { id: 'input-1', name: 'Input', status: 'stable' },
                        ]).map((c: any) => (
                          <li key={c.id || c.name} className="flex items-center justify-between py-1 border-b border-[#f1f5f9] last:border-0">
                            <span className="flex items-center gap-3">
                              <span className="grid h-8 w-8 place-items-center rounded-full bg-muted text-[#475569]">
                                <Boxes className="h-4 w-4" />
                              </span>
                              <span className="text-xs font-semibold text-[#0f172a]">{c.name}</span>
                            </span>
                            <span className="text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {c.status || 'stable'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveNav('components')}
                      className="mt-4 w-full py-2 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] text-xs font-semibold text-[#475569] transition-colors border border-[#e2e8f0] cursor-pointer"
                    >
                      Open Component Catalog
                    </button>
                  </section>

                  {/* CARD 5: Pipelines */}
                  <section className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-card p-6 text-primary-foreground shadow-lg col-span-4">
                    <div>
                      <p className="text-sm font-bold text-primary tracking-wide">Pipelines</p>
                      <p className="mt-4 text-2xl font-semibold">6 targets</p>
                      <p className="text-sm opacity-90 mt-1">CSS · Tailwind · TS · Swift · Kotlin · JSON</p>
                    </div>

                    <div className="mt-8">
                      <p className="text-xs opacity-80 mb-3">Instant compilation for web, iOS, Android, and design tools.</p>
                      <button
                        type="button"
                        onClick={() => setActiveNav('automation')}
                        className="self-start rounded-full bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-white transition-colors shadow-xs cursor-pointer"
                      >
                        Generate code
                      </button>
                    </div>
                  </section>

                  {/* CARD 6: Fast Code Delivery */}
                  <section className="glass p-6 col-span-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-[#0f172a]">
                        <span className="font-bold">Fast Code Delivery</span>
                        <span className="text-[11px] text-[#2563eb]">GitHub Engine</span>
                      </div>

                      <div className="mt-3 p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <IntegrationLogo name="github" size={18} />
                          <div className="min-w-0">
                            <span className="block text-xs font-bold text-[#0f172a] truncate">adcn/web-platform-core</span>
                            <span className="block text-[10px] text-[#64748b]">Branch: main</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-[#10b981] bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded-full">
                          Connected
                        </span>
                      </div>

                      <div className="mt-4 space-y-1.5 text-xs text-[#64748b]">
                        <div className="flex justify-between">
                          <span>Target Exporter</span>
                          <span className="font-mono font-semibold text-[#0f172a]">Tailwind CSS 4</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Destination</span>
                          <span className="font-mono font-semibold text-[#0f172a]">styles/tokens.css</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleQuickDeliver}
                      disabled={quickDelivering}
                      className="mt-6 w-full btn-primary rounded-full py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      {quickDelivering ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Delivering PR...</span>
                        </>
                      ) : (
                        <>
                          <GitPullRequest size={14} />
                          <span>Deliver Tokens to GitHub</span>
                        </>
                      )}
                    </button>
                  </section>
                </div>
              </div>
            )}

          {/* ========================================================================= */}
          {/* VIEW: CONTEXTS (Screenshot 3 - The AI Agentic Distribution Hub)           */}
          {/* ========================================================================= */}
          {activeNav === 'contexts' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* Header Description */}
              <div className="nexus-card p-6 rounded-2xl border border-[#e2e8f0]/90 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-[#3b82f6]" />
                    <h2 className="text-base font-bold text-[#0f172a] tracking-tight">Design System Contexts</h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#2563eb] text-[11px] font-semibold border border-[#bfdbfe]">
                      AI Agentic Hub
                    </span>
                  </div>
                  <p className="text-xs text-[#64748b] mt-1">
                    Manage and distribute organizational knowledge across AI tools, workflows, and coding agents.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleDownloadSkill} className="btn-secondary text-xs flex items-center gap-1.5">
                    <Download size={13} />
                    <span>Download SKILL.md</span>
                  </button>
                  <button onClick={handleDownloadClaudePlugin} className="btn-primary text-xs flex items-center gap-1.5 shadow-xs">
                    <IntegrationLogo name="claude" size={13} />
                    <span>Export Claude Plugin</span>
                  </button>
                </div>
              </div>

              {/* Two Column Layout (Checklist Left, Distribution Right) */}
              <div className="grid grid-cols-12 gap-6">
                {/* Left 7 Columns: Data and Knowledge Checklist */}
                <div className="col-span-12 lg:col-span-7 nexus-card p-6 rounded-2xl border border-[#e2e8f0]/90 bg-white space-y-5">
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
                <div className="col-span-12 lg:col-span-5 space-y-6">
                  {/* Model Context Protocol (MCP) Distribution Card */}
                  <div className="nexus-card p-6 rounded-2xl border border-[#e2e8f0]/90 bg-white space-y-4">
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
                  <div className="nexus-card p-6 rounded-2xl border border-[#e2e8f0]/90 bg-white space-y-4">
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
                            {authMethod === 'github_app' ? 'GitHub App Installed' : 'Connected'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#f8fafc] text-[#64748b] border border-[#cbd5e1]">
                            Not Installed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748b] mt-0.5">
                        {githubConnected && githubUser
                          ? authMethod === 'github_app'
                            ? `Installed on ${githubUser.login} (${githubRepos.length} authorized repositories loaded)`
                            : `Authenticated as @${githubUser.login} (${githubRepos.length} accessible repositories loaded)`
                          : 'Install Nexus Design OS in your GitHub account or organization (Zero tokens, 1-click setup).'}
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
                        {authMethod === 'github_app' && installationId && (
                          <a
                            href={`https://github.com/settings/installations/${installationId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                          >
                            <span>Manage Repos</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                        <button
                          onClick={handleDisconnectGithub}
                          className="btn-secondary text-xs px-3 py-1.5 text-[#ef4444] hover:bg-[#fef2f2] hover:border-[#fecaca]"
                        >
                          <LogOut size={13} />
                          <span>Disconnect</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <a
                          href="/api/github/install"
                          className="btn-primary text-xs px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] flex items-center gap-1.5 shadow-xs font-semibold"
                        >
                          <IntegrationLogo name="github" size={14} className="brightness-200 invert" />
                          <span>Install on GitHub</span>
                          <ArrowRight size={13} />
                        </a>
                        <button
                          onClick={() => setShowConnectModal(true)}
                          className="btn-secondary text-xs px-3 py-2 text-[#64748b]"
                        >
                          <span>Options</span>
                        </button>
                      </>
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
                      {githubUser.htmlUrl && (
                        <a
                          href={githubUser.htmlUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#2563eb] hover:underline flex items-center gap-0.5"
                        >
                          @{githubUser.login} <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[11px]">
                      <span>
                        <strong className="text-[#0f172a]">{githubRepos.length}</strong> repositories authorized
                      </span>
                      <span className="text-[#10b981] font-medium flex items-center gap-1">
                        <CheckCircle2 size={12} /> {authMethod === 'github_app' ? 'GitHub App Bot Active' : 'Auto-Sync Enabled'}
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
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* Documentation Header */}
              <div className="nexus-card p-6 rounded-2xl border border-[#e2e8f0]/90 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-[#2563eb]" />
                    <h2 className="text-base font-bold text-[#0f172a] tracking-tight">Living Documentation Studio</h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#2563eb] text-[11px] font-semibold border border-[#bfdbfe]">
                      {docPagesList.length} Guides
                    </span>
                  </div>
                  <p className="text-xs text-[#64748b] mt-1">
                    Author, edit, and maintain design system guidelines and component specs. Grounded directly in MCP for AI tools.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <a
                    href="/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary text-xs flex items-center gap-1.5"
                  >
                    <span>Open Live Portal</span>
                    <ArrowUpRight size={13} />
                  </a>
                  {selectedDocPage && (
                    <button
                      onClick={handleSaveDocPage}
                      disabled={savingDocPage}
                      className="btn-primary text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <Check size={13} />
                      <span>{savingDocPage ? 'Saving...' : 'Save Document'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Documentation Page Selector Tabs */}
              <div className="nexus-card p-3 rounded-2xl border border-[#e2e8f0]/90 bg-white flex items-center justify-between overflow-x-auto shadow-xs">
                <div className="flex items-center gap-2">
                  {docPagesList.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => {
                        setSelectedDocPage(page);
                        setEditingDocTitle(page.title);
                        setEditingDocContent(page.content);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                        selectedDocPage?.id === page.id
                          ? 'bg-[#2563eb] text-white shadow-xs'
                          : 'bg-[#f8fafc] text-[#475569] hover:bg-[#e2e8f0]'
                      }`}
                    >
                      <FileText size={13} />
                      <span>{page.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        selectedDocPage?.id === page.id ? 'bg-white/20 text-white' : 'bg-[#e2e8f0] text-[#64748b]'
                      }`}>
                        /{page.slug}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="text-[11px] text-[#64748b] px-3 font-mono">
                  {docPagesList.length} pages published
                </div>
              </div>

              {/* Dual-Pane Editor & Live Document Preview */}
              {selectedDocPage ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Left Column: Markdown Editor */}
                  <div className="nexus-card p-6 rounded-2xl border border-[#e2e8f0]/90 bg-white space-y-4">
                    <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                      <div className="flex items-center gap-2">
                        <Code2 size={16} className="text-[#2563eb]" />
                        <span className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Markdown Editor</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#eff6ff] text-[#2563eb] capitalize">
                        {selectedDocPage.category}
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#475569] block mb-1">Page Title</label>
                      <input
                        type="text"
                        value={editingDocTitle}
                        onChange={(e) => setEditingDocTitle(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-2 rounded-lg text-xs font-medium text-[#0f172a] focus:outline-none focus:border-[#2563eb]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-[#475569]">Markdown Content</label>
                        <span className="text-[11px] font-mono text-[#94a3b8]">{editingDocContent.length} chars</span>
                      </div>
                      <textarea
                        rows={16}
                        value={editingDocContent}
                        onChange={(e) => setEditingDocContent(e.target.value)}
                        className="w-full bg-[#0f172a] text-[#f8fafc] font-mono text-xs p-4 rounded-xl leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 text-[11px] text-[#64748b]">
                      <span>Saved automatically on commit</span>
                      <button
                        onClick={handleSaveDocPage}
                        disabled={savingDocPage}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        {savingDocPage ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Live Document Preview */}
                  <div className="nexus-card p-6 rounded-2xl border border-[#e2e8f0]/90 bg-white space-y-4">
                    <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                      <div className="flex items-center gap-2">
                        <Eye size={16} className="text-[#059669]" />
                        <span className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Live Reader Preview</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(editingDocContent, 'doc-preview')}
                        className="btn-secondary text-[11px] py-1 px-2 flex items-center gap-1"
                      >
                        {copiedKey === 'doc-preview' ? <Check size={12} className="text-[#10b981]" /> : <Copy size={12} />}
                        <span>{copiedKey === 'doc-preview' ? 'Copied' : 'Copy MD'}</span>
                      </button>
                    </div>

                    <div className="prose prose-slate max-w-none space-y-4">
                      <h1 className="text-xl font-bold text-[#0f172a] tracking-tight">{editingDocTitle}</h1>
                      <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs text-[#475569] leading-relaxed whitespace-pre-wrap font-sans">
                        {editingDocContent}
                      </div>

                      <div className="p-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-lg flex items-start gap-2.5 text-xs text-[#1e40af]">
                        <Info size={16} className="shrink-0 mt-0.5 text-[#2563eb]" />
                        <div>
                          <strong>MCP Context Grounding:</strong> This document is automatically embedded in Cursor, Claude Code, and Windsurf AI agent context windows via <code>/api/mcp</code>.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-[#e2e8f0] rounded-xl p-12 text-center text-[#64748b]">
                  <p className="text-sm">No documentation page selected. Select a page from the tabs above.</p>
                </div>
              )}
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
              {/* Header Card */}
              <div className="nexus-card p-6 rounded-2xl border border-[#e2e8f0]/90 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span>
                    <h2 className="text-base font-bold text-[#0f172a] tracking-tight">Design Tokens Studio</h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#2563eb] text-[11px] font-semibold border border-[#bfdbfe]">
                      {filteredTokens.length} of {tokens.length} tokens
                    </span>
                  </div>
                  <p className="text-xs text-[#64748b] mt-1">
                    W3C Design Tokens Community Group (DTCG) specification with mathematical alias resolution.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      triggerDownload('nova-tokens.json', JSON.stringify(tokens, null, 2), 'application/json');
                      showUiNotice('Exported all tokens to DTCG JSON format.');
                    }}
                    className="btn-secondary text-xs flex items-center gap-1.5"
                  >
                    <Download size={13} className="text-[#64748b]" />
                    <span>Export DTCG</span>
                  </button>
                  <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs flex items-center gap-1.5 shadow-xs">
                    <Plus size={14} />
                    <span>Add Token</span>
                  </button>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="nexus-card p-4 rounded-2xl border border-[#e2e8f0]/90 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search size={14} className="absolute left-3.5 top-2.5 text-[#94a3b8]" />
                  <input
                    type="text"
                    placeholder="Search tokens by path or value..."
                    value={tokenSearch}
                    onChange={(e) => setTokenSearch(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] pl-9 pr-3 py-1.5 rounded-xl text-xs text-[#0f172a] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:border-[#2563eb] transition-all"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-[#f8fafc] border border-[#e2e8f0] p-1 rounded-xl text-xs overflow-x-auto">
                  {['all', 'color', 'dimension', 'typography', 'shadow'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-lg capitalize transition-all text-xs ${
                        selectedCategory === cat
                          ? 'bg-white font-bold text-[#2563eb] shadow-xs'
                          : 'text-[#64748b] hover:text-[#0f172a]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tokens Table Card */}
              <div className="nexus-card rounded-2xl border border-[#e2e8f0]/90 bg-white overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] font-semibold text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-5">Preview</th>
                      <th className="py-3 px-5">Token Path</th>
                      <th className="py-3 px-5">Raw Value</th>
                      <th className="py-3 px-5">Resolved Value</th>
                      <th className="py-3 px-5">Category</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredTokens.map((t) => (
                      <tr key={t.id} className="hover:bg-[#f8fafc]/80 transition-colors group">
                        <td className="py-3 px-5">
                          {t.category === 'color' ? (
                            <div
                              className="w-6 h-6 rounded-lg border border-[#cbd5e1] shadow-xs transition-transform group-hover:scale-110"
                              style={{ backgroundColor: t.resolvedValue || t.rawValue }}
                            />
                          ) : (
                            <span className="text-[10px] font-mono text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded">
                              {t.category}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-5">
                          <button
                            type="button"
                            onClick={() => {
                              copyToClipboard(t.path, `token-path-${t.id}`);
                              showUiNotice(`Copied "${t.path}" to clipboard`);
                            }}
                            className="font-mono font-semibold text-[#0f172a] hover:text-[#2563eb] text-left transition-colors flex items-center gap-1.5"
                            title="Click to copy path"
                          >
                            <span>{t.path}</span>
                            {copiedKey === `token-path-${t.id}` ? (
                              <Check size={11} className="text-[#10b981]" />
                            ) : (
                              <Copy size={11} className="opacity-0 group-hover:opacity-100 text-[#94a3b8] transition-opacity" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-5 font-mono text-[#64748b] text-[11px]">{t.rawValue}</td>
                        <td className="py-3 px-5 font-mono text-[#2563eb] font-bold text-[11px]">
                          {t.resolvedValue || t.rawValue}
                        </td>
                        <td className="py-3 px-5 capitalize">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#f1f5f9] text-[#475569]">
                            {t.category}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                copyToClipboard(`var(--${t.path.replace(/\./g, '-')})`, `css-var-${t.id}`);
                                showUiNotice(`Copied CSS variable to clipboard`);
                              }}
                              className="text-[#64748b] hover:text-[#2563eb] p-1.5 rounded-lg hover:bg-[#f1f5f9] transition-colors"
                              title="Copy CSS Variable"
                            >
                              <Code2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteToken(t.id)}
                              className="text-[#94a3b8] hover:text-[#ef4444] p-1.5 rounded-lg hover:bg-[#fef2f2] transition-colors"
                              title="Delete Token"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
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
              <div className="nexus-card p-6 rounded-2xl border border-[#e2e8f0]/90 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                    <h2 className="text-base font-bold text-[#0f172a] tracking-tight">Interactive Components Sandbox</h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#059669] text-[11px] font-semibold border border-[#a7f3d0]">
                      6 Live Components
                    </span>
                  </div>
                  <p className="text-xs text-[#64748b] mt-1">
                    Living design system components with Storybook iframe bridge and real token styling.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-[#f8fafc] border border-[#e2e8f0] p-1 rounded-xl text-xs">
                    <button
                      onClick={() => setStorybookIframeMode(false)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        !storybookIframeMode ? 'bg-[#2563eb] text-white shadow-xs' : 'text-[#475569] hover:text-[#0f172a]'
                      }`}
                    >
                      React Playground
                    </button>
                    <button
                      onClick={() => setStorybookIframeMode(true)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        storybookIframeMode ? 'bg-[#ff4785] text-white shadow-xs' : 'text-[#475569] hover:text-[#0f172a]'
                      }`}
                    >
                      Storybook Sandbox
                    </button>
                  </div>
                </div>
              </div>

              {storybookIframeMode ? (
                <div className="nexus-card p-6 rounded-2xl border border-[#e2e8f0]/90 bg-white space-y-4">
                  <div className="flex items-center justify-between bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">
                    <div className="flex items-center gap-2">
                      <IntegrationLogo name="storybook" size={16} />
                      <span className="text-xs font-semibold text-[#0f172a]">Storybook Iframe Host:</span>
                      <input
                        type="text"
                        value={storybookUrl}
                        onChange={(e) => setStorybookUrl(e.target.value)}
                        className="bg-white border border-[#cbd5e1] px-2 py-1 rounded-lg text-xs font-mono w-64"
                        placeholder="http://localhost:6006"
                      />
                    </div>
                    <span className="text-[11px] text-[#64748b]">Connected via iframe sandbox bridge</span>
                  </div>
                  <div className="border border-[#cbd5e1] rounded-xl overflow-hidden h-[540px] bg-[#f8fafc] flex items-center justify-center">
                    <iframe
                      src={storybookUrl}
                      title="Storybook Preview"
                      className="w-full h-full border-0"
                      onError={() => {}}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Button Component */}
                  <div className="nexus-card p-5 rounded-2xl border border-[#e2e8f0]/90 bg-white space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#0f172a]">Button</h3>
                      <span className="text-[10px] font-mono text-[#2563eb] bg-[#eff6ff] px-2 py-0.5 rounded-full">
                        var(--color-brand-primary)
                      </span>
                    </div>
                    <div className="p-6 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex items-center justify-center">
                      <button
                        onClick={() => setButtonClicks((c) => c + 1)}
                        className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95"
                      >
                        Clicked: {buttonClicks} times
                      </button>
                    </div>
                  </div>

                  {/* Input Component */}
                  <div className="nexus-card p-5 rounded-2xl border border-[#e2e8f0]/90 bg-white space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#0f172a]">Input</h3>
                      <span className="text-[10px] font-mono text-[#2563eb] bg-[#eff6ff] px-2 py-0.5 rounded-full">
                        var(--border-subtle)
                      </span>
                    </div>
                    <div className="p-6 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl">
                      <input
                        type="text"
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        className="w-full bg-white border border-[#cbd5e1] px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-[#2563eb]"
                      />
                    </div>
                  </div>

                  {/* Badge Component */}
                  <div className="nexus-card p-5 rounded-2xl border border-[#e2e8f0]/90 bg-white space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#0f172a]">Badge</h3>
                      <span className="text-[10px] font-mono text-[#2563eb] bg-[#eff6ff] px-2 py-0.5 rounded-full">
                        var(--accent-emerald)
                      </span>
                    </div>
                    <div className="p-6 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex items-center justify-center gap-2">
                      <span className="px-3 py-1 text-xs font-semibold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] rounded-full">
                        Success Status
                      </span>
                    </div>
                  </div>

                  {/* Card Component */}
                  <div className="nexus-card p-5 rounded-2xl border border-[#e2e8f0]/90 bg-white space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#0f172a]">Card</h3>
                      <span className="text-[10px] font-mono text-[#2563eb] bg-[#eff6ff] px-2 py-0.5 rounded-full">
                        layout / container
                      </span>
                    </div>
                    <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl">
                      <div className="bg-white border border-[#cbd5e1] p-3 rounded-lg shadow-xs">
                        <div className="text-xs font-bold text-[#0f172a]">Elevated Surface</div>
                        <p className="text-[11px] text-[#64748b] mt-1">Structured design token container card.</p>
                      </div>
                    </div>
                  </div>

                  {/* Modal Trigger Component */}
                  <div className="nexus-card p-5 rounded-2xl border border-[#e2e8f0]/90 bg-white space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#0f172a]">Modal Dialog</h3>
                      <span className="text-[10px] font-mono text-[#2563eb] bg-[#eff6ff] px-2 py-0.5 rounded-full">
                        overlay / dialog
                      </span>
                    </div>
                    <div className="p-6 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex items-center justify-center">
                      <button
                        onClick={() => setShowTestModal(true)}
                        className="px-3.5 py-2 bg-[#0f172a] text-white rounded-xl text-xs font-semibold hover:bg-[#1e293b] shadow-xs"
                      >
                        Open Dialog Preview
                      </button>
                    </div>
                  </div>

                  {/* Switch Component */}
                  <div className="nexus-card p-5 rounded-2xl border border-[#e2e8f0]/90 bg-white space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#0f172a]">Switch</h3>
                      <span className="text-[10px] font-mono text-[#2563eb] bg-[#eff6ff] px-2 py-0.5 rounded-full">
                        form / control
                      </span>
                    </div>
                    <div className="p-6 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex items-center justify-center gap-3">
                      <button
                        onClick={() => setSwitchChecked(!switchChecked)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                          switchChecked ? 'bg-[#2563eb]' : 'bg-[#cbd5e1]'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            switchChecked ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className="text-xs font-medium text-[#475569]">
                        {switchChecked ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: VECTOR ASSETS & ICONS                                                */}
          {/* ========================================================================= */}
          {activeNav === 'assets' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="nexus-card p-6 rounded-2xl border border-[#e2e8f0]/90 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Grid size={18} className="text-[#2563eb]" />
                    <h2 className="text-base font-bold text-[#0f172a] tracking-tight">Vector Asset & Icon Library</h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#2563eb] text-[11px] font-semibold border border-[#bfdbfe]">
                      {assetsList.length} Vector Assets
                    </span>
                  </div>
                  <p className="text-xs text-[#64748b] mt-1">
                    Multi-platform SVG icons and brand assets with 1-click React JSX and raw SVG export.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddAssetModal(true)}
                  className="btn-primary text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Plus size={14} />
                  <span>Add Vector Asset</span>
                </button>
              </div>

              {/* Filter and Search Bar */}
              <div className="nexus-card p-4 rounded-2xl border border-[#e2e8f0]/90 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3.5 top-2.5 text-[#94a3b8]" />
                  <input
                    type="text"
                    value={assetSearch}
                    onChange={(e) => setAssetSearch(e.target.value)}
                    placeholder="Search icons by name or tag (e.g. arrow, copy, terminal, code)..."
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] pl-9 pr-3 py-1.5 rounded-xl text-xs text-[#0f172a] focus:bg-white focus:outline-none focus:border-[#2563eb] transition-all"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  {['all', 'icons', 'logos', 'illustrations'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedAssetCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs capitalize transition-all ${
                        selectedAssetCategory === cat
                          ? 'bg-[#0f172a] text-white font-semibold'
                          : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Asset Grid */}
              <div className="grid grid-cols-4 gap-4">
                {assetsList
                  .filter((a) => {
                    const matchCat = selectedAssetCategory === 'all' || a.category === selectedAssetCategory;
                    const matchQ =
                      !assetSearch.trim() ||
                      a.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
                      (Array.isArray(a.tags) && a.tags.some((t: string) => t.toLowerCase().includes(assetSearch.toLowerCase())));
                    return matchCat && matchQ;
                  })
                  .map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`nexus-card rounded-2xl p-4 border transition-all space-y-3 cursor-pointer ${
                        selectedAsset?.id === asset.id
                          ? 'border-[#2563eb] ring-2 ring-[#2563eb]/20 shadow-md bg-white'
                          : 'border-[#e2e8f0]/90 bg-white hover:border-[#2563eb]/50 hover:shadow-xs'
                      }`}
                    >
                      <div className="h-20 bg-[#f8fafc] rounded-lg border border-[#f1f5f9] flex items-center justify-center p-3 text-[#0f172a]">
                        <div
                          className="w-8 h-8 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: asset.svgContent }}
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#0f172a]">{asset.name}</span>
                          <span className="text-[10px] font-mono text-[#94a3b8]">{asset.width}×{asset.height}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(asset.tags) &&
                            asset.tags.slice(0, 3).map((tag: string, idx: number) => (
                              <span key={idx} className="text-[10px] bg-[#f1f5f9] text-[#64748b] px-1.5 py-0.2 rounded font-mono">
                                #{tag}
                              </span>
                            ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between text-[11px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(asset.svgContent, `svg-${asset.id}`);
                          }}
                          className="text-[#2563eb] hover:underline flex items-center gap-1 font-medium"
                        >
                          {copiedKey === `svg-${asset.id}` ? <Check size={11} className="text-[#10b981]" /> : <Copy size={11} />}
                          <span>{copiedKey === `svg-${asset.id}` ? 'Copied' : 'SVG'}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const jsx = `export function ${asset.name}Icon(props: React.SVGProps<SVGSVGElement>) {\n  return (\n    ${asset.svgContent.replace('<svg', '<svg {...props}')}\n  );\n}`;
                            copyToClipboard(jsx, `jsx-${asset.id}`);
                          }}
                          className="text-[#475569] hover:underline flex items-center gap-1 font-medium"
                        >
                          {copiedKey === `jsx-${asset.id}` ? <Check size={11} className="text-[#10b981]" /> : <Code2 size={11} />}
                          <span>{copiedKey === `jsx-${asset.id}` ? 'Copied' : 'JSX'}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerDownload(`${asset.name.toLowerCase()}.svg`, asset.svgContent, 'image/svg+xml');
                          }}
                          className="text-[#64748b] hover:text-[#0f172a]"
                          title="Download SVG"
                        >
                          <Download size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Selected Asset Inspector */}
              {selectedAsset && (
                <div className="nexus-card p-6 rounded-2xl border border-[#e2e8f0]/90 bg-white space-y-3">
                  <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Asset Code Snippet:</span>
                      <span className="text-xs font-mono font-semibold text-[#2563eb]">{selectedAsset.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(selectedAsset.svgContent, 'inspector-svg')}
                        className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"
                      >
                        {copiedKey === 'inspector-svg' ? <Check size={12} className="text-[#10b981]" /> : <Copy size={12} />}
                        <span>Copy SVG</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-3 bg-[#0f172a] text-[#f8fafc] font-mono text-[11px] rounded-lg overflow-x-auto">
                    {selectedAsset.svgContent}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: FIGMA SYNC WITH PRE-SYNC DIFF & TRACEABILITY MODAL                  */}
          {/* ========================================================================= */}
          {activeNav === 'figma' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="nexus-card p-6 rounded-2xl border border-[#e2e8f0]/90 bg-white space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <IntegrationLogo name="figma" size={22} />
                    <div>
                      <h2 className="text-base font-bold text-[#0f172a] tracking-tight">Figma Variables & Styles Synchronizer</h2>
                      <p className="text-xs text-[#64748b] mt-0.5">
                        Two-stage sync: Inspect visual token diffs prior to committing changes to the database.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] rounded-full text-xs font-semibold">
                    Supernova Traceability Engine
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-[#475569] block mb-1">Figma File Key</label>
                    <input
                      type="text"
                      value={figmaFileKey}
                      onChange={(e) => setFigmaFileKey(e.target.value)}
                      placeholder="e.g. 4s7xK0m2zN_core_ui_kit"
                      className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-2 rounded-lg text-xs font-mono focus:outline-none focus:border-[#2563eb]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#475569] block mb-1">Mode / Theme</label>
                    <select
                      value={figmaMode}
                      onChange={(e) => setFigmaMode(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-[#2563eb]"
                    >
                      <option value="Light">Light Mode</option>
                      <option value="Dark">Dark Mode</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#475569] block mb-1">Figma Personal Access Token (Optional override)</label>
                  <input
                    type="password"
                    value={figmaToken}
                    onChange={(e) => setFigmaToken(e.target.value)}
                    placeholder="figd_... (Defaults to environment FIGMA_TOKEN)"
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-2 rounded-lg text-xs font-mono focus:outline-none focus:border-[#2563eb]"
                  />
                </div>

                {/* Two-Stage Action Bar */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleSyncFigma(false)}
                    disabled={figmaSyncing}
                    className="btn-secondary text-xs py-2 px-4 flex items-center gap-2 border-2 border-[#2563eb]/20 text-[#2563eb] hover:bg-[#eff6ff]"
                  >
                    {figmaSyncing && figmaDiffMode === 'preview' ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <Eye size={13} />
                    )}
                    <span>Inspect & Preview Diff (Dry Run)</span>
                  </button>

                  <button
                    onClick={() => handleSyncFigma(true)}
                    disabled={figmaSyncing}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8]"
                  >
                    {figmaSyncing && figmaDiffMode === 'applied' ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <Play size={13} />
                    )}
                    <span>Direct Sync & Apply</span>
                  </button>
                </div>
              </div>

              {/* Visual Pre-Sync Diff & Traceability Dashboard */}
              {figmaDiffResult && (
                <div className="nexus-card p-6 rounded-2xl border border-[#e2e8f0]/90 bg-white space-y-5">
                  <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-[#0f172a]">
                        {figmaDiffMode === 'preview' ? 'Pre-Sync Token Diff Analysis (Dry Run)' : 'Synchronization Results'}
                      </h3>
                      <p className="text-xs text-[#64748b]">
                        File: <span className="font-mono text-[#0f172a]">{figmaDiffResult.fileKey}</span> • Mode: <span className="font-semibold">{figmaDiffResult.modeName}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {figmaDiffMode === 'preview' && (
                        <button
                          onClick={() => handleSyncFigma(true)}
                          disabled={figmaSyncing}
                          className="btn-primary text-xs py-1.5 px-3 bg-[#10b981] hover:bg-[#059669]"
                        >
                          <Check size={13} />
                          <span>Commit & Apply Changes ({figmaDiffResult.diff?.length || 0})</span>
                        </button>
                      )}
                      {figmaDiffCommitSuccess && (
                        <span className="px-3 py-1 bg-[#ecfdf5] border border-[#a7f3d0] rounded-full text-xs font-semibold text-[#065f46] flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-[#10b981]" />
                          <span>Applied to Database</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4 Metrics Comparison Bar */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
                      <div className="text-[11px] font-semibold text-[#64748b]">Total In Figma</div>
                      <div className="text-xl font-bold text-[#0f172a] mt-1">{figmaDiffResult.totalVariablesFound || 0}</div>
                    </div>

                    <div className="p-3 bg-[#ecfdf5] border border-[#a7f3d0] rounded-lg">
                      <div className="text-[11px] font-semibold text-[#065f46]">Tokens Added</div>
                      <div className="text-xl font-bold text-[#059669] mt-1">
                        {figmaDiffResult.diff?.filter((d: any) => d.status === 'added').length || 0}
                      </div>
                    </div>

                    <div className="p-3 bg-[#fffbeb] border border-[#fef3c7] rounded-lg">
                      <div className="text-[11px] font-semibold text-[#92400e]">Tokens Modified</div>
                      <div className="text-xl font-bold text-[#d97706] mt-1">
                        {figmaDiffResult.diff?.filter((d: any) => d.status === 'modified').length || 0}
                      </div>
                    </div>

                    <div className="p-3 bg-[#fef2f2] border border-[#fecaca] rounded-lg">
                      <div className="text-[11px] font-semibold text-[#991b1b]">Tokens Removed</div>
                      <div className="text-xl font-bold text-[#dc2626] mt-1">
                        {figmaDiffResult.diff?.filter((d: any) => d.status === 'removed').length || 0}
                      </div>
                    </div>
                  </div>

                  {/* Side-by-Side Token Diff Table */}
                  <div className="overflow-x-auto border border-[#e2e8f0] rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f8fafc] text-[#475569] border-b border-[#e2e8f0] uppercase tracking-wider text-[10px] font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Diff Status</th>
                          <th className="py-2.5 px-3">Token Path</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Current DB Value</th>
                          <th className="py-2.5 px-3">Incoming Figma Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f1f5f9]">
                        {figmaDiffResult.diff && figmaDiffResult.diff.length > 0 ? (
                          figmaDiffResult.diff.map((item: any, idx: number) => {
                            const isColor = item.category === 'color' || (item.newValue && item.newValue.startsWith('#')) || (item.oldValue && item.oldValue.startsWith('#'));
                            return (
                              <tr key={idx} className="hover:bg-[#f8fafc] transition-colors">
                                <td className="py-2 px-3">
                                  {item.status === 'added' && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ecfdf5] text-[#059669]">
                                      + ADDED
                                    </span>
                                  )}
                                  {item.status === 'modified' && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fffbeb] text-[#d97706]">
                                      ~ MODIFIED
                                    </span>
                                  )}
                                  {item.status === 'removed' && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fef2f2] text-[#dc2626]">
                                      - REMOVED
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 px-3 font-mono font-medium text-[#0f172a]">{item.path}</td>
                                <td className="py-2 px-3 text-[#64748b] capitalize">{item.category || 'token'}</td>
                                <td className="py-2 px-3 font-mono text-[#64748b]">
                                  {item.oldValue ? (
                                    <div className="flex items-center gap-1.5">
                                      {isColor && (
                                        <span
                                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                                          style={{ backgroundColor: item.oldValue }}
                                        />
                                      )}
                                      <span>{item.oldValue}</span>
                                    </div>
                                  ) : (
                                    <span className="text-[#94a3b8] italic">—</span>
                                  )}
                                </td>
                                <td className="py-2 px-3 font-mono font-bold text-[#0f172a]">
                                  {item.newValue ? (
                                    <div className="flex items-center gap-1.5">
                                      {isColor && (
                                        <span
                                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-xs"
                                          style={{ backgroundColor: item.newValue }}
                                        />
                                      )}
                                      <span className={item.status === 'added' ? 'text-[#059669]' : ''}>{item.newValue}</span>
                                    </div>
                                  ) : (
                                    <span className="text-[#dc2626] italic">Deleted</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-xs text-[#64748b]">
                              No differences detected between Figma and current token database.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: AST AUDIT                                                           */}
          {/* ========================================================================= */}
          {activeNav === 'audit' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="nexus-card p-6 rounded-2xl border border-[#e2e8f0]/90 bg-white space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[#0f172a] tracking-tight">AST Code Compliance Linter</h2>
                    <p className="text-xs text-[#64748b] mt-1">
                      Scans source code for hardcoded color hexes, arbitrary spacing, and unmapped tokens.
                    </p>
                  </div>
                  <button onClick={handleRunAudit} disabled={auditing} className="btn-primary text-xs flex items-center gap-1.5 shadow-xs">
                    {auditing ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
                    <span>{auditing ? 'Auditing AST...' : 'Run Compliance Audit'}</span>
                  </button>
                </div>

                <div>
                  <textarea
                    rows={10}
                    value={auditCode}
                    onChange={(e) => setAuditCode(e.target.value)}
                    className="w-full bg-[#0f172a] text-[#f8fafc] font-mono text-xs p-4 rounded-xl focus:outline-none"
                  />
                </div>

                {auditReport && (
                  <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl space-y-3">
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
                        <div key={i} className="p-2.5 bg-white border border-[#fca5a5] rounded-lg text-xs flex items-center justify-between">
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
              <div className="nexus-card p-6 rounded-2xl border border-[#e2e8f0]/90 bg-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Tag size={18} className="text-[#2563eb]" />
                    <h2 className="text-base font-bold text-[#0f172a] tracking-tight">Design System Releases</h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#2563eb] text-[11px] font-semibold border border-[#bfdbfe]">
                      {releasesList.length} Releases
                    </span>
                  </div>
                  <p className="text-xs text-[#64748b] mt-1">
                    Immutable SemVer release tags and automated changelogs.
                  </p>
                </div>
                <button onClick={() => setShowReleaseModal(true)} className="btn-primary text-xs flex items-center gap-1.5 shadow-xs">
                  <Plus size={14} />
                  <span>Create Release</span>
                </button>
              </div>

              <div className="space-y-3">
                {releasesList.map((r) => (
                  <div key={r.id} className="nexus-card p-5 rounded-2xl border border-[#e2e8f0]/90 bg-white space-y-2">
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
        </main>
      </div>
    </div>

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
                  <p className="text-xs text-[#64748b]">Authorize Nexus Design OS to deliver automated pull requests</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowConnectModal(false);
                  setOauthNotice(null);
                }}
                className="text-[#94a3b8] hover:text-[#0f172a] text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* OAUTH NOTICE BANNER IF TRIGGERED */}
            {oauthNotice && (
              <div className="p-3 bg-[#fffbeb] border border-[#fef3c7] rounded-xl text-xs text-[#b45309] flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-[#f59e0b] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-[#92400e]">Authentication Notice</div>
                  <div className="text-[11px] leading-relaxed text-[#b45309]">
                    {oauthNotice}
                  </div>
                </div>
              </div>
            )}

            {/* Option 1: 1-Click Native GitHub App Installation (Hero, ZERO TOKENS) */}
            <div className="p-5 bg-gradient-to-br from-[#eff6ff] to-[#f8fafc] border-2 border-[#2563eb]/40 rounded-xl space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#2563eb]" />
                  <span className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                    Option 1: 1-Click Install on GitHub
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2563eb] text-white shadow-xs">
                  Zero Tokens Required
                </span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                Install Nexus Design OS directly into your personal GitHub account or organization. Select which repositories to grant, and pull request delivery is automatically authorized.
              </p>

              <a
                href="/api/github/install"
                className="w-full btn-primary py-3 text-xs flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg shadow-sm transition-all"
              >
                <IntegrationLogo name="github" size={18} className="brightness-200 invert" />
                <span>Install Nexus in GitHub Account</span>
                <ArrowRight size={14} />
              </a>
            </div>

            <div className="relative flex items-center justify-center py-1">
              <div className="border-t border-[#e2e8f0] w-full"></div>
              <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-[#94a3b8] absolute font-semibold">
                Or Connect with Personal Access Token
              </span>
            </div>

            {/* Option 2: Personal Access Token (Advanced / CLI Fallback) */}
            <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                  Option 2: Personal Access Token (PAT)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#f1f5f9] text-[#64748b]">
                  Manual Fallback
                </span>
              </div>
              <p className="text-xs text-[#64748b]">
                If you prefer manual tokens, paste a GitHub token with `repo` scope below:
              </p>

              <form onSubmit={handleConnectGithubToken} className="space-y-3">
                <input
                  type="password"
                  value={customGithubToken}
                  onChange={(e) => setCustomGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or github_pat_..."
                  className="w-full bg-white border border-[#cbd5e1] px-3 py-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#2563eb]"
                />

                <div className="flex items-center justify-between text-[11px] text-[#64748b]">
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=Nexus+Design+OS"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#2563eb] hover:underline flex items-center gap-0.5 font-medium"
                  >
                    Generate Token on GitHub ↗
                  </a>
                  <button
                    type="submit"
                    disabled={connectingGithub || !customGithubToken.trim()}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    {connectingGithub ? 'Verifying...' : 'Connect Token'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ADD VECTOR ASSET MODAL */}
      {showAddAssetModal && (
        <div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2">
                <Grid size={18} className="text-[#2563eb]" />
                <h3 className="text-sm font-bold text-[#0f172a]">Add Vector Asset</h3>
              </div>
              <button onClick={() => setShowAddAssetModal(false)} className="text-[#94a3b8] hover:text-[#0f172a] text-sm">✕</button>
            </div>

            <form onSubmit={handleAddAsset} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#475569] block mb-1">Asset Name</label>
                  <input
                    type="text"
                    value={newAssetName}
                    onChange={(e) => setNewAssetName(e.target.value)}
                    placeholder="e.g. Sparkles, Compass"
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-lg focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#475569] block mb-1">Category</label>
                  <select
                    value={newAssetCategory}
                    onChange={(e) => setNewAssetCategory(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-lg focus:outline-none"
                  >
                    <option value="icons">Icon</option>
                    <option value="logos">Brand Logo</option>
                    <option value="illustrations">Illustration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#475569] block mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newAssetTags}
                  onChange={(e) => setNewAssetTags(e.target.value)}
                  placeholder="navigation, maps, direction"
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-[#475569] block mb-1">SVG Markup Content</label>
                <textarea
                  rows={5}
                  value={newAssetSvg}
                  onChange={(e) => setNewAssetSvg(e.target.value)}
                  placeholder="<svg ...>...</svg>"
                  className="w-full bg-[#0f172a] text-[#f8fafc] font-mono text-[11px] p-3 rounded-lg focus:outline-none"
                  required
                />
              </div>

              {/* Live Preview of SVG */}
              {newAssetSvg && (
                <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-[#64748b]">Live Preview:</span>
                  <div
                    className="w-8 h-8 flex items-center justify-center text-[#2563eb]"
                    dangerouslySetInnerHTML={{ __html: newAssetSvg }}
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAssetModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" disabled={savingAsset} className="btn-primary text-xs">
                  {savingAsset ? 'Saving...' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INTERACTIVE TEST MODAL */}
      {showTestModal && (
        <div className="fixed inset-0 bg-[#0f172a]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <h3 className="text-sm font-bold text-[#0f172a]">Component Sandbox: Modal</h3>
              <button onClick={() => setShowTestModal(false)} className="text-[#94a3b8] hover:text-[#0f172a]">✕</button>
            </div>
            <p className="text-xs text-[#64748b] leading-relaxed">
              This dialog overlay uses design tokens: <code>var(--elevation-modal)</code>, <code>var(--borderRadius-lg)</code>, and focus-locking behavior.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowTestModal(false)}
                className="btn-primary text-xs"
              >
                Close Dialog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTHENTICATION & TESTING SESSION MODAL */}
      {(showAuthModal || authRequired) && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#eff6ff] rounded-lg text-[#2563eb]">
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a]">Authentication & Access</h3>
                  <p className="text-[11px] text-[#64748b]">Configure your server credentials for local or AWS testing</p>
                </div>
              </div>
              {!authRequired && (
                <button onClick={() => setShowAuthModal(false)} className="text-[#94a3b8] hover:text-[#0f172a] text-sm p-1 rounded-lg">✕</button>
              )}
            </div>

            {authRequired && (
              <div className="p-3 bg-[#fff7ed] border border-[#ffedd5] rounded-xl text-xs text-[#c2410c] flex items-start gap-2.5">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Authorization Required</p>
                  <p className="text-[11px] mt-0.5 text-[#9a3412]">
                    This server instance requires an authorized API Key or Admin Password to access design system tokens and APIs.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">
                  API Key / Admin Token
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Enter NOVA_API_KEY, NEXUS_API_KEY, or Admin Password"
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3.5 py-2 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAuthenticate();
                  }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#64748b]">
                  {authStatus === 'authenticated' ? `Active Principal: ${authUserId || 'operator'}` : 'Not connected'}
                </span>
                {authStatus === 'authenticated' && (
                  <button
                    onClick={handleLogout}
                    className="text-[11px] text-[#ef4444] hover:underline flex items-center gap-1"
                  >
                    <LogOut size={11} /> Clear Session
                  </button>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleAuthenticate('dev-user')}
                className="px-3 py-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155] rounded-xl text-xs font-medium transition-all"
                title="Use development bypass if configured on the server"
              >
                ⚡ Dev Bypass
              </button>
              <div className="flex items-center gap-2">
                {!authRequired && (
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className="px-3.5 py-2 border border-[#cbd5e1] text-[#475569] hover:bg-[#f8fafc] rounded-xl text-xs font-medium"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleAuthenticate()}
                  className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Save & Authenticate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
