import { NextResponse } from 'next/server';
import { getGitHubAppConfig } from '@/core/github/app';

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const config = getGitHubAppConfig();

  if (config && config.slug) {
    return NextResponse.redirect(`https://github.com/apps/${config.slug}/installations/new`);
  }

  // Redirect to manifest creation
  return NextResponse.redirect(`${origin}/api/github/app/manifest`);
}
