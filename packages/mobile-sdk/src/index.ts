export type PublishedTokenBundle = {
  generatedAt: string;
  designSystemId: string;
  sourceTokenCount: number;
  files: {
    json: { filename: string; content: string };
    swift: { filename: string; content: string };
    kotlin: { filename: string; content: string };
  };
  manifest: Array<{ filename: string; sha256: string; bytes: number }>;
};

export type MobileSdkOptions = {
  baseUrl: string;
  designSystemId: string;
  accessToken?: string;
  fetch?: typeof globalThis.fetch;
};

export class DesignSystemSyncError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DesignSystemSyncError';
  }
}

export class DesignSystemClient {
  private readonly options: Required<Pick<MobileSdkOptions, 'baseUrl' | 'designSystemId'>> & MobileSdkOptions;
  private readonly fetcher: NonNullable<MobileSdkOptions['fetch']>;
  private cachedBundle: PublishedTokenBundle | null = null;

  constructor(options: MobileSdkOptions) {
    if (!options.baseUrl || !options.designSystemId) throw new DesignSystemSyncError('baseUrl and designSystemId are required.');
    this.options = { ...options, fetch: options.fetch || globalThis.fetch };
    this.fetcher = options.fetch || globalThis.fetch;
  }

  public get cached(): PublishedTokenBundle | null {
    return this.cachedBundle;
  }

  public async refresh(signal?: AbortSignal): Promise<PublishedTokenBundle> {
    const url = new URL('/api/export', this.options.baseUrl);
    url.searchParams.set('format', 'all');
    url.searchParams.set('designSystemId', this.options.designSystemId);
    const response = await this.fetcher(url, {
      signal,
      headers: this.options.accessToken ? { Authorization: `Bearer ${this.options.accessToken}` } : undefined,
    });
    if (!response.ok) throw new DesignSystemSyncError(`Design-system refresh failed with HTTP ${response.status}.`);
    const payload = await response.json() as PublishedTokenBundle;
    if (!payload.manifest || !payload.files?.json || !payload.files?.swift || !payload.files?.kotlin) {
      throw new DesignSystemSyncError('Server returned an incomplete mobile artifact bundle.');
    }
    this.cachedBundle = payload;
    return payload;
  }

  public async watch(intervalMs = 60_000, onUpdate?: (bundle: PublishedTokenBundle) => void, signal?: AbortSignal): Promise<never> {
    while (!signal?.aborted) {
      const bundle = await this.refresh(signal);
      onUpdate?.(bundle);
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, intervalMs);
        signal?.addEventListener('abort', () => { clearTimeout(timer); resolve(); }, { once: true });
      });
    }
    throw new DOMException('Sync stopped.', 'AbortError');
  }
}
