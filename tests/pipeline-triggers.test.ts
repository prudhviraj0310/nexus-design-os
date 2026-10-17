import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getDb } from '../src/db/index';
import {
  workspaces,
  projects,
  designSystems,
  tokens,
  deliveryPipelines,
  deliveryJobs,
  designSystemVersions,
} from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { PipelineManager } from '../src/core/delivery/pipelines';
import { VersionManager } from '../src/core/versions/version-manager';

describe('Tier 1: Pipeline Event Triggers (OnVersionReleased & OnHeadChanged)', () => {
  let db: any;
  let pipelineManager: PipelineManager;
  let versionManager: VersionManager;

  const wsId = 'ws-pipe-test';
  const projId = 'proj-pipe-test';
  const dsId = 'ds-pipe-test';

  beforeEach(async () => {
    const res = await getDb(':memory:');
    db = res.db;
    pipelineManager = new PipelineManager(db);
    versionManager = new VersionManager(db);

    await db.delete(deliveryJobs);
    await db.delete(deliveryPipelines);
    await db.delete(tokens);
    await db.delete(designSystemVersions);
    await db.delete(designSystems);
    await db.delete(projects);
    await db.delete(workspaces);

    await db.insert(workspaces).values({ id: wsId, name: 'Pipe Org', slug: 'pipe-org' });
    await db.insert(projects).values({ id: projId, workspaceId: wsId, name: 'Pipe Proj', slug: 'pipe-proj' });
    await db.insert(designSystems).values({ id: dsId, projectId: projId, name: 'Pipe DS', version: '1.0.0' });

    // Seed draft version and initial token
    const draft = await versionManager.getOrCreateDraftVersion(dsId);
    await db.insert(tokens).values({
      id: 'tok-pipe-1',
      persistentId: 'pid-pipe-1',
      designSystemId: dsId,
      versionId: draft.id,
      name: 'primary',
      path: 'color.brand.primary',
      category: 'color',
      type: 'color',
      rawValue: '#2563eb',
      resolvedValue: '#2563eb',
      isAlias: false,
    });
  });

  it('manages pipeline lifecycle (create, list, update, delete)', async () => {
    const created = await pipelineManager.createPipeline({
      designSystemId: dsId,
      name: 'Production Web Tokens',
      provider: 'github',
      trigger: 'OnVersionReleased',
      repoOwner: 'acme-corp',
      repoName: 'frontend-core',
      targetBranch: 'main',
      createPullRequest: true,
      exporters: ['css', 'typescript'],
      directoryPurge: false,
      commitMessageTemplate: 'chore(tokens): sync {{version}}',
      prTitleTemplate: 'Tokens Release {{version}}',
      enabled: true,
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Production Web Tokens');

    const list = await pipelineManager.listPipelines(dsId);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(created.id);

    // Update
    const updated = await pipelineManager.updatePipeline(created.id, {
      directoryPurge: true,
      targetBranch: 'develop',
    });
    expect(updated?.directoryPurge).toBe(true);
    expect(updated?.targetBranch).toBe('develop');

    // Delete
    await pipelineManager.deletePipeline(created.id);
    const listAfterDelete = await pipelineManager.listPipelines(dsId);
    expect(listAfterDelete).toHaveLength(0);
  });

  it('dispatches OnVersionReleased automatically when release is sealed', async () => {
    // Register pipeline with dryRun delivery
    const pipeline = await pipelineManager.createPipeline({
      designSystemId: dsId,
      name: 'Release Auto Delivery',
      provider: 'github',
      trigger: 'OnVersionReleased',
      repoOwner: 'acme-corp',
      repoName: 'web-app',
      targetBranch: 'main',
      createPullRequest: true,
      exporters: ['css', 'typescript', 'tailwind'],
      directoryPurge: false,
      commitMessageTemplate: 'chore(tokens): publish v{{version}} ({{tokenCount}} tokens)',
      prTitleTemplate: '🚀 Design Tokens v{{version}}',
      prBodyTemplate: 'Changelog:\n{{changelog}}',
      enabled: true,
    });

    // Mock fetch for dryRun / live checks so pipeline succeeds cleanly
    const releaseResult = await versionManager.releaseVersion({
      designSystemId: dsId,
      version: '1.2.0',
      title: 'Sprint 24 Token Drop',
      changelog: '• Added brand primary token',
      triggerPipelines: true,
    });

    expect(releaseResult.pipelineResults).toBeDefined();
    expect(releaseResult.pipelineResults).toHaveLength(1);

    const report = releaseResult.pipelineResults![0];
    expect(report.pipelineId).toBe(pipeline.id);
    expect(report.success).toBe(true);
    expect(report.deliveryResult.filesCommitted.length).toBeGreaterThanOrEqual(3);

    // Verify delivery job was recorded in database
    const jobs = await db.select().from(deliveryJobs).where(eq(deliveryJobs.projectId, projId));
    expect(jobs).toHaveLength(1);
    expect(jobs[0].targetRepo).toBe('acme-corp/web-app');
    expect(['simulated', 'success']).toContain(jobs[0].status);
  });

  it('dispatches OnHeadChanged event for draft token updates', async () => {
    await pipelineManager.createPipeline({
      designSystemId: dsId,
      name: 'Draft Continuous Sync',
      provider: 'gitlab',
      trigger: 'OnHeadChanged',
      repoOwner: 'acme-corp',
      repoName: 'mobile-app',
      targetBranch: 'main',
      createPullRequest: true,
      exporters: ['swift', 'kotlin'],
      directoryPurge: false,
      commitMessageTemplate: 'chore(draft): continuous token sync ({{tokenCount}} tokens)',
      enabled: true,
    });

    const reports = await pipelineManager.onHeadChanged(dsId);
    expect(reports).toHaveLength(1);
    expect(reports[0].provider).toBe('gitlab');
    expect(reports[0].success).toBe(true);
    expect(reports[0].deliveryResult.filesCommitted).toHaveLength(2); // swift and kotlin
  });

  it('supports manual pipeline execution by ID', async () => {
    const pipe = await pipelineManager.createPipeline({
      designSystemId: dsId,
      name: 'Manual Export Pipeline',
      provider: 'bitbucket',
      trigger: 'Manual',
      repoOwner: 'acme-corp',
      repoName: 'backend-service',
      targetBranch: 'main',
      createPullRequest: true,
      exporters: ['json'],
      directoryPurge: false,
      enabled: true,
    });

    const report = await pipelineManager.executePipelineById(pipe.id, {
      version: 'manual-run-1',
      title: 'Manual Ad-Hoc Sync',
      dryRun: true,
    });

    expect(report.success).toBe(true);
    expect(report.provider).toBe('bitbucket');
    expect(report.deliveryResult.filesCommitted).toEqual(['tokens.json']);
  });
});
