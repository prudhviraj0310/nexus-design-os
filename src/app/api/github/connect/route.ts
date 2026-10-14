import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getGitHubAppConfig,
  getGitHubInstallation,
  getInstallationAccessToken,
  getInstallationRepositories,
  clearGitHubInstallation,
} from '@/core/github/app';
import { validateApiAuth } from '@/server/auth';


export async function GET(request: Request) {
  try {
    const appConfig = getGitHubAppConfig();
    const hasAppConfig = Boolean(appConfig && appConfig.appId);

    // 1. Check if connected via GitHub App Installation (Zero-token native install)
    const installation = getGitHubInstallation();
    let installationIdFromCookie: string | undefined;
    try {
      const cookieStore = await cookies();
      installationIdFromCookie = cookieStore.get('nexus_github_installation_id')?.value;
    } catch {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(/nexus_github_installation_id=([^;]+)/);
      installationIdFromCookie = match ? match[1] : undefined;
    }
    const activeInstallationId = installationIdFromCookie || installation?.installationId;

    if (activeInstallationId) {
      const tokenResult = await getInstallationAccessToken(activeInstallationId);
      if (tokenResult) {
        let repoCount = 0;
        try {
          const repos = await getInstallationRepositories(tokenResult.token);
          repoCount = repos.length;
        } catch {}

        return NextResponse.json({
          connected: true,
          authMethod: 'github_app',
          installationId: activeInstallationId,
          appSlug: appConfig?.slug || 'nexus-design-os',
          appInstalled: true,
          hasAppConfig,
          user: {
            login: installation?.accountLogin || 'GitHub Organization / Account',
            name: installation?.accountLogin || 'GitHub Account',
            avatarUrl: installation?.accountAvatar || '',
            htmlUrl: `https://github.com/${installation?.accountLogin || ''}`,
            publicRepos: repoCount,
            totalPrivateRepos: 0,
            accountType: installation?.accountType || 'User',
          },
        });
      }
    }

    // 2. Check token-based connection (legacy fallback)
    let tokenFromCookie: string | undefined;
    try {
      const cookieStore = await cookies();
      tokenFromCookie = cookieStore.get('nexus_github_token')?.value;
    } catch {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(/nexus_github_token=([^;]+)/);
      tokenFromCookie = match ? match[1] : undefined;
    }
    const tokenFromHeader = request.headers.get('x-github-token') || request.headers.get('authorization')?.replace(/^Bearer\s+/, '');
    const token = tokenFromCookie || tokenFromHeader || process.env.GITHUB_TOKEN;

    const oauthAvailable = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);

    if (!token) {
      return NextResponse.json({
        connected: false,
        oauthAvailable,
        hasAppConfig,
        appSlug: appConfig?.slug || 'nexus-design-os',
        message: 'No GitHub App installed or token connected.',
      });
    }

    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Nexus-Design-OS/1.0.0',
      },
    });

    if (!res.ok) {
      return NextResponse.json({
        connected: false,
        hasAppConfig,
        appSlug: appConfig?.slug || 'nexus-design-os',
        error: `GitHub token rejected: ${res.status} ${res.statusText}`,
      });
    }

    const userData = await res.json();

    return NextResponse.json({
      connected: true,
      authMethod: 'token',
      hasAppConfig,
      appSlug: appConfig?.slug || 'nexus-design-os',
      user: {
        login: userData.login,
        name: userData.name || userData.login,
        avatarUrl: userData.avatar_url,
        htmlUrl: userData.html_url,
        publicRepos: userData.public_repos,
        totalPrivateRepos: userData.total_private_repos || 0,
        email: userData.email,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ connected: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = validateApiAuth(request);
    if (!auth.authorized) return auth.errorResponse!;

    const body = await request.json();
    const token = body.token?.trim();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'GitHub Personal Access Token is required.' },
        { status: 400 }
      );
    }

    // Verify token with GitHub
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Nexus-Design-OS/1.0.0',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Invalid GitHub token: ${res.status} ${res.statusText}` },
        { status: 401 }
      );
    }

    const userData = await res.json();

    // Set secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      connected: true,
      user: {
        login: userData.login,
        name: userData.name || userData.login,
        avatarUrl: userData.avatar_url,
        htmlUrl: userData.html_url,
        publicRepos: userData.public_repos,
        totalPrivateRepos: userData.total_private_repos || 0,
      },
    });

    response.cookies.set('nexus_github_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = validateApiAuth(request);
    if (!auth.authorized) return auth.errorResponse!;

    clearGitHubInstallation();

    const response = NextResponse.json({
      success: true,
      connected: false,
      message: 'GitHub account and app installation disconnected successfully.',
    });

    response.cookies.delete('nexus_github_token');
    response.cookies.delete('nexus_github_installation_id');
    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
