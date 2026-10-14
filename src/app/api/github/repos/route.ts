import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getGitHubInstallation,
  getInstallationAccessToken,
  getInstallationRepositories,
} from '@/core/github/app';
import { validateApiAuth } from '@/server/auth';

export async function GET(request: Request) {
  try {
    const auth = validateApiAuth(request);
    if (!auth.authorized) return auth.errorResponse!;

    // 1. Check if connected via GitHub App Installation
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
        const repos = await getInstallationRepositories(tokenResult.token);
        return NextResponse.json({
          success: true,
          authMethod: 'github_app',
          installationId: activeInstallationId,
          totalCount: repos.length,
          repos,
        });
      }
    }

    // 2. Token-based fallback
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

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'GitHub account is not connected. Please install the GitHub App or connect your account.' },
        { status: 401 }
      );
    }

    // Fetch user's accessible repositories sorted by last updated
    const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Nexus-Design-OS/1.0.0',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `GitHub API error (${res.status}): ${res.statusText}` },
        { status: res.status }
      );
    }

    const reposData = await res.json();

    const repos = reposData.map((r: any) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      owner: r.owner.login,
      ownerAvatar: r.owner.avatar_url,
      defaultBranch: r.default_branch || 'main',
      isPrivate: r.private,
      description: r.description || '',
      htmlUrl: r.html_url,
      pushedAt: r.pushed_at,
    }));

    return NextResponse.json({
      success: true,
      totalCount: repos.length,
      repos,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
