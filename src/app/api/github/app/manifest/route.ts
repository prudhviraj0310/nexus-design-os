import { NextResponse } from 'next/server';
import { generateAppManifest, getGitHubAppConfig } from '@/core/github/app';

export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  // If app is already configured, redirect directly to install
  const existingConfig = getGitHubAppConfig();
  if (existingConfig && existingConfig.slug) {
    return NextResponse.redirect(`https://github.com/apps/${existingConfig.slug}/installations/new`);
  }

  const manifest = generateAppManifest(origin);
  const manifestStr = JSON.stringify(manifest);

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Connecting to GitHub...</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #fff; }
    .box { text-align: center; }
    .spinner { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #3b82f6; border-radius: 50%; width: 32px; height: 32px; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="box">
    <div class="spinner"></div>
    <p>Opening GitHub App registration...</p>
    <form id="manifestForm" action="https://github.com/settings/apps/new" method="post">
      <input type="hidden" name="manifest" value='${manifestStr.replace(/'/g, '&#39;')}' />
      <noscript><button type="submit">Continue to GitHub</button></noscript>
    </form>
    <script>
      document.getElementById('manifestForm').submit();
    </script>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
