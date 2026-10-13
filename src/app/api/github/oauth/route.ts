import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return NextResponse.redirect(`${origin}/?github_error=missing_oauth_credentials`);
  }

  const redirectUri = `${origin}/api/github/oauth/callback`;
  const scope = 'repo,read:user';
  const state = Math.random().toString(36).substring(7);

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scope)}&state=${state}`;

  return NextResponse.redirect(authUrl);
}
