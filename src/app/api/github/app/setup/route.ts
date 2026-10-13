import { NextResponse } from 'next/server';
import { saveGitHubAppConfig } from '@/core/github/app';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/?github_error=missing_app_manifest_code`);
  }

  try {
    // Exchange manifest code with GitHub API for full app credentials
    const res = await fetch(`https://api.github.com/app-manifests/${code}/conversions`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Nexus-Design-OS/1.0.0',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('App manifest conversion failed:', errText);
      return NextResponse.redirect(
        `${origin}/?github_error=${encodeURIComponent('Failed to register GitHub App: ' + res.statusText)}`
      );
    }

    const appData = await res.json();

    // Save app credentials locally in .data/github-app.json
    saveGitHubAppConfig({
      appId: String(appData.id),
      slug: appData.slug,
      clientId: appData.client_id,
      clientSecret: appData.client_secret,
      privateKey: appData.pem,
      webhookSecret: appData.webhook_secret,
    });

    // Immediately redirect to the installation page so the user can select repositories
    return NextResponse.redirect(`https://github.com/apps/${appData.slug}/installations/new`);
  } catch (err: any) {
    console.error('Error in app manifest setup:', err);
    return NextResponse.redirect(`${origin}/?github_error=${encodeURIComponent(err.message)}`);
  }
}
