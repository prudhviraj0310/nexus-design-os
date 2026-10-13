import { FigmaVariablesResponse, FigmaSyncRequest } from './types';

export class FigmaClient {
  public async getVariables(request: FigmaSyncRequest): Promise<FigmaVariablesResponse> {
    const { fileKey, figmaToken, dryRun } = request;

    // If no live Figma token or dryRun, return realistic Figma Variables API fixture
    if (!figmaToken || dryRun) {
      return this.getFixtureVariables(fileKey);
    }

    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}/variables/local`, {
      headers: {
        'X-Figma-Token': figmaToken,
        'User-Agent': 'NovaDesign-Platform/0.1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as FigmaVariablesResponse;
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
