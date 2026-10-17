import { describe, it, expect, beforeEach } from 'vitest';
import { getDb } from '../src/db/index';
import { workspaces, projects, designSystems, components } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { CodeComponentManager } from '../src/core/components/code-components';

describe('Tier 2: Code Components (Git-linked Component Catalog)', () => {
  let db: any;
  let componentManager: CodeComponentManager;

  const wsId = 'ws-code-comp';
  const projId = 'proj-code-comp';
  const dsId = 'ds-code-comp';

  beforeEach(async () => {
    const res = await getDb(':memory:');
    db = res.db;
    componentManager = new CodeComponentManager(db);

    await db.delete(components);
    await db.delete(designSystems);
    await db.delete(projects);
    await db.delete(workspaces);

    await db.insert(workspaces).values({ id: wsId, name: 'Comp Org', slug: 'comp-org' });
    await db.insert(projects).values({ id: projId, workspaceId: wsId, name: 'Comp Proj', slug: 'comp-proj' });
    await db.insert(designSystems).values({ id: dsId, projectId: projId, name: 'Comp DS', version: '1.0.0' });
  });

  it('registers a code component with Git repository metadata and token dependencies', async () => {
    const registered = await componentManager.registerComponent({
      designSystemId: dsId,
      name: 'Button',
      category: 'inputs',
      framework: 'react',
      description: 'Primary interactive button component',
      packageName: '@nexus/ui',
      repositoryName: 'acme-corp/web-ui',
      filePath: 'packages/ui/src/Button/Button.tsx',
      exportName: 'Button',
      status: 'ready',
      props: {
        variant: { type: 'string', defaultValue: 'primary', description: 'Button visual style' },
        size: { type: 'string', defaultValue: 'md', description: 'Padding and font scale' },
        disabled: { type: 'boolean', defaultValue: false },
      },
      variants: {
        variant: ['primary', 'secondary', 'ghost', 'danger'],
        size: ['sm', 'md', 'lg'],
      },
      tokenDependencies: ['color.brand.primary', 'spacing.layout.sm', 'borderRadius.md'],
    });

    expect(registered.id).toBeDefined();
    expect(registered.status).toBe('ready');
    expect(registered.packageName).toBe('@nexus/ui');
    expect(registered.repositoryName).toBe('acme-corp/web-ui');

    // Retrieve from database
    const list = await componentManager.listComponents(dsId);
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('Button');
    expect(list[0].tokenDependencies).toEqual(['color.brand.primary', 'spacing.layout.sm', 'borderRadius.md']);
  });

  it('links or updates Git source repository location on an existing component', async () => {
    const initial = await componentManager.registerComponent({
      designSystemId: dsId,
      name: 'Card',
      category: 'layout',
      framework: 'react',
      props: {},
      status: 'in-progress',
    });

    expect(initial.packageName).toBeUndefined();

    // Link Git source
    await componentManager.linkGitSource(initial.id, {
      packageName: '@nexus/layout',
      repositoryName: 'acme-corp/web-ui',
      filePath: 'packages/layout/src/Card/Card.tsx',
      exportName: 'Card',
    });

    const updatedList = await componentManager.listComponents(dsId);
    expect(updatedList[0].packageName).toBe('@nexus/layout');
    expect(updatedList[0].filePath).toBe('packages/layout/src/Card/Card.tsx');
  });

  it('filters components by status or category', async () => {
    await componentManager.registerComponent({
      designSystemId: dsId,
      name: 'Button',
      category: 'inputs',
      framework: 'react',
      props: {},
      status: 'ready',
    });

    await componentManager.registerComponent({
      designSystemId: dsId,
      name: 'Input',
      category: 'inputs',
      framework: 'react',
      props: {},
      status: 'in-progress',
    });

    await componentManager.registerComponent({
      designSystemId: dsId,
      name: 'Grid',
      category: 'layout',
      framework: 'react',
      props: {},
      status: 'planned',
    });

    const readyComps = await componentManager.listComponents(dsId, { status: 'ready' });
    expect(readyComps).toHaveLength(1);
    expect(readyComps[0].name).toBe('Button');

    const inputComps = await componentManager.listComponents(dsId, { category: 'inputs' });
    expect(inputComps).toHaveLength(2);
  });

  it('generates idiomatic usage snippet from component props and package info', () => {
    const snippet = componentManager.generateUsageSnippet({
      id: 'comp-btn',
      designSystemId: dsId,
      name: 'Button',
      category: 'inputs',
      framework: 'react',
      packageName: '@acme/design-system',
      exportName: 'Button',
      status: 'ready',
      props: {
        variant: { defaultValue: 'primary' },
        size: { defaultValue: 'md' },
      },
    });

    expect(snippet).toContain("import { Button } from '@acme/design-system';");
    expect(snippet).toContain('<Button variant="primary" size="md" />');
  });
});
