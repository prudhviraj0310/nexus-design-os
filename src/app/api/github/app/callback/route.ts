import { NextResponse } from 'next/server';
import {
  saveGitHubInstallation,
  getInstallationAccessToken,
  createAppJwt,
  getGitHubAppConfig,
} from '@/core/github/app';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const installationId = searchParams.get('installation_id');
  const setupAction = searchParams.get('setup_action');

  if (!installationId) {
    return NextResponse.redirect(`${origin}/?github_error=missing_installation_id`);
  }

  try {
    const config = getGitHubAppConfig();
    let accountLogin = 'GitHub Account';
    let accountAvatar = '';
    let accountType = 'User';

    // If app credentials exist, fetch installation details from GitHub
    if (config && config.appId && config.privateKey) {
      const jwt = createAppJwt(config.appId, config.privateKey);
      const installRes = await fetch(
        `https://api.github.com/app/installations/${installationId}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Nexus-Design-OS/1.0.0',
          },
        }
      );

      if (installRes.ok) {
        const installData = await installRes.json();
        accountLogin = installData.account?.login || accountLogin;
        accountAvatar = installData.account?.avatar_url || '';
        accountType = installData.account?.type || 'User';
      }
    }

    // Save installation metadata
    saveGitHubInstallation({
      installationId,
      accountLogin,
      accountAvatar,
      accountType,
      installedAt: new Date().toISOString(),
    });

    const response = NextResponse.redirect(`${origin}/?github=installed`);

    // Set cookie for session persistence
    response.cookies.set('nexus_github_installation_id', installationId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  } catch (err: any) {
    console.error('Error handling GitHub App installation callback:', err);
    return NextResponse.redirect(`${origin}/?github_error=${encodeURIComponent(err.message)}`);
  }
}
