import { FigmaVariablesResponse, FigmaSyncRequest } from './types';

export class FigmaClient {
  public async getVariables(request: FigmaSyncRequest): Promise<FigmaVariablesResponse> {
    const { fileKey, figmaToken, dryRun } = request;

    // Handle Dry Run explicitly
    if (dryRun) {
      return this.getFixtureVariables(fileKey);
    }

    if (!figmaToken) {
      throw new Error('Figma API token is required for live variable synchronization.');
    }

    // Configurable timeout (10,000ms) and bounded retry logic for 429/503
    const maxRetries = 2;
    let attempt = 0;

    while (attempt <= maxRetries) {
      attempt++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`https://api.figma.com/v1/files/${fileKey}/variables/local`, {
          headers: {
            'X-Figma-Token': figmaToken,
            'User-Agent': 'NovaDesign-Platform/0.1.0',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = (await response.json()) as FigmaVariablesResponse;
          if (!data || !data.meta || !data.meta.variables) {
            throw new Error('Incomplete response received from Figma API: missing variables payload.');
          }
          return data;
        }

        // Bounded retry on 429 rate limit or 503 transient service error
        if ((response.status === 429 || response.status === 503) && attempt <= maxRetries) {
          const retryAfterHeader = response.headers.get('Retry-After');
          const delayMs = retryAfterHeader ? Math.min(parseInt(retryAfterHeader, 10) * 1000, 5000) : attempt * 1000;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          throw new Error(`Figma API request timed out after 10000ms for file "${fileKey}".`);
        }
        if (attempt > maxRetries) {
          throw err;
        }
      }
    }

    throw new Error('Failed to retrieve Figma variables after retry attempts.');
  }

  public getFixtureVariables(fileKey: string): FigmaVariablesResponse {
    return {
      status: 200,
      meta: {
        variableCollections: {
          'col:1': {
            id: 'col:1',
            name: 'Primitives & Semantic Colors',
            modes: [
              { modeId: 'm:1', name: 'Light' },
              { modeId: 'm:2', name: 'Dark' },
            ],
            defaultModeId: 'm:1',
          },
          'col:2': {
            id: 'col:2',
            name: 'Spacing & Radii',
            modes: [{ modeId: 'm:3', name: 'Default' }],
            defaultModeId: 'm:3',
          },
        },
        variables: {
          'var:1': {
            id: 'var:1',
            name: 'color/primitive/cyan/500',
            key: 'key-cyan-500',
            variableCollectionId: 'col:1',
            resolvedType: 'COLOR',
            valuesByMode: {
              'm:1': { r: 0.02, g: 0.71, b: 0.83, a: 1 }, // #06b6d4
              'm:2': { r: 0.02, g: 0.71, b: 0.83, a: 1 },
            },
            description: 'Vibrant cyan primitive',
          },
          'var:2': {
            id: 'var:2',
            name: 'color/brand/accent',
            key: 'key-brand-accent',
            variableCollectionId: 'col:1',
            resolvedType: 'COLOR',
            valuesByMode: {
              'm:1': { type: 'VARIABLE_ALIAS', id: 'var:1' }, // Aliased to cyan
              'm:2': { type: 'VARIABLE_ALIAS', id: 'var:1' },
            },
            description: 'Brand accent aliased to cyan 500',
          },
          'var:3': {
            id: 'var:3',
            name: 'spacing/2xl',
            key: 'key-spacing-2xl',
            variableCollectionId: 'col:2',
            resolvedType: 'FLOAT',
            valuesByMode: {
              'm:3': 48,
            },
            description: '48px extra large spacing scale',
          },
        },
      },
    };
  }
}
