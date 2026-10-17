import { eq, and } from 'drizzle-orm';
import { deliveryPipelines, deliveryJobs, tokens, designSystems } from '../../db/schema';
import { GeneratedFile } from '../exporters/types';
import { exportToCss } from '../exporters/css';
import { exportToTypeScript } from '../exporters/typescript';
import { exportToTailwind } from '../exporters/tailwind';
import { exportToSwift } from '../exporters/swift';
import { exportToKotlin } from '../exporters/kotlin';
import { exportToJson } from '../exporters/json';
import { resolveTokenAliases } from '../tokens/resolver';
import { getDeliveryEngine } from './index';
import { GitProvider, DeliveryResult } from './types';

export type PipelineTrigger = 'OnVersionReleased' | 'OnHeadChanged' | 'OnSourceUpdated' | 'Manual';

export interface DeliveryPipeline {
  id: string;
  designSystemId: string;
  name: string;
  provider: GitProvider;
  trigger: PipelineTrigger;
  repoOwner: string;
  repoName: string;
  targetBranch: string;
  createPullRequest: boolean;
  exporters: string[]; // e.g. ['css', 'typescript', 'tailwind']
  directoryPurge: boolean;
  commitMessageTemplate?: string | null;
  prTitleTemplate?: string | null;
  prBodyTemplate?: string | null;
  enabled: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface PipelineExecutionReport {
  pipelineId: string;
  pipelineName: string;
  provider: GitProvider;
  success: boolean;
  deliveryResult: DeliveryResult;
}

export class PipelineManager {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Registers a new delivery pipeline.
   */
  public async createPipeline(input: Omit<DeliveryPipeline, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeliveryPipeline> {
    const id = `pipe-${input.designSystemId}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newPipeline: DeliveryPipeline = {
      ...input,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.insert(deliveryPipelines).values(newPipeline);
    return newPipeline;
  }

  /**
   * Updates an existing pipeline.
   */
  public async updatePipeline(
    id: string,
    updates: Partial<Omit<DeliveryPipeline, 'id' | 'designSystemId' | 'createdAt'>>
  ): Promise<DeliveryPipeline | null> {
    const existing = await this.db.select().from(deliveryPipelines).where(eq(deliveryPipelines.id, id));
    if (existing.length === 0) return null;

    const updated = {
      ...existing[0],
      ...updates,
      updatedAt: new Date(),
    };

    await this.db.update(deliveryPipelines).set(updated).where(eq(deliveryPipelines.id, id));
    return updated;
  }

  /**
   * Deletes a pipeline.
   */
  public async deletePipeline(id: string): Promise<boolean> {
    await this.db.delete(deliveryPipelines).where(eq(deliveryPipelines.id, id));
    return true;
  }

  /**
   * Lists all delivery pipelines for a design system.
   */
  public async listPipelines(designSystemId: string): Promise<DeliveryPipeline[]> {
    return this.db
      .select()
      .from(deliveryPipelines)
      .where(eq(deliveryPipelines.designSystemId, designSystemId));
  }

  /**
   * Triggered when a new release snapshot is sealed (OnVersionReleased).
   */
  public async onVersionReleased(
    designSystemId: string,
    release: { version: string; title: string; changelog?: string | null }
  ): Promise<PipelineExecutionReport[]> {
    const pipelines: DeliveryPipeline[] = await this.db
      .select()
      .from(deliveryPipelines)
      .where(
        and(
          eq(deliveryPipelines.designSystemId, designSystemId),
          eq(deliveryPipelines.trigger, 'OnVersionReleased'),
          eq(deliveryPipelines.enabled, true)
        )
      );

    if (pipelines.length === 0) {
      return [];
    }

    // Fetch tokens for this design system
    const rawTokens = await this.db
      .select()
      .from(tokens)
      .where(
        and(
          eq(tokens.designSystemId, designSystemId),
          eq(tokens.isDeleted, false)
        )
      );

    const resolved = resolveTokenAliases(rawTokens).tokens;
    const reports: PipelineExecutionReport[] = [];

    for (const pipeline of pipelines) {
      const report = await this.executePipeline(pipeline, resolved, {
        version: release.version,
        title: release.title,
        changelog: release.changelog || '',
      });
      reports.push(report);
    }

    return reports;
  }

  /**
   * Triggered when tokens in draft are modified or synced (OnHeadChanged).
   */
  public async onHeadChanged(designSystemId: string): Promise<PipelineExecutionReport[]> {
    const pipelines: DeliveryPipeline[] = await this.db
      .select()
      .from(deliveryPipelines)
      .where(
        and(
          eq(deliveryPipelines.designSystemId, designSystemId),
          eq(deliveryPipelines.trigger, 'OnHeadChanged'),
          eq(deliveryPipelines.enabled, true)
        )
      );

    if (pipelines.length === 0) {
      return [];
    }

    const rawTokens = await this.db
      .select()
      .from(tokens)
      .where(
        and(
          eq(tokens.designSystemId, designSystemId),
          eq(tokens.isDeleted, false)
        )
      );

    const resolved = resolveTokenAliases(rawTokens).tokens;
    const reports: PipelineExecutionReport[] = [];

    for (const pipeline of pipelines) {
      const report = await this.executePipeline(pipeline, resolved, {
        version: 'head',
        title: 'Draft Tokens Update',
        changelog: 'Automated continuous sync from active draft.',
      });
      reports.push(report);
    }

    return reports;
  }

  /**
   * Manually executes a pipeline by ID.
   */
  public async executePipelineById(
    pipelineId: string,
    contextOverride?: { version?: string; title?: string; changelog?: string; dryRun?: boolean }
  ): Promise<PipelineExecutionReport> {
    const records = await this.db
      .select()
      .from(deliveryPipelines)
      .where(eq(deliveryPipelines.id, pipelineId));

    if (records.length === 0) {
      throw new Error(`Pipeline with ID "${pipelineId}" not found.`);
    }

    const pipeline = records[0] as DeliveryPipeline;
    const rawTokens = await this.db
      .select()
      .from(tokens)
      .where(
        and(
          eq(tokens.designSystemId, pipeline.designSystemId),
          eq(tokens.isDeleted, false)
        )
      );

    const resolved = resolveTokenAliases(rawTokens).tokens;
    return this.executePipeline(pipeline, resolved, {
      version: contextOverride?.version || 'manual',
      title: contextOverride?.title || `Manual Delivery: ${pipeline.name}`,
      changelog: contextOverride?.changelog || 'Manual pipeline execution.',
      dryRun: contextOverride?.dryRun,
    });
  }

  /**
   * Internal runner: generates exporter artifacts and invokes provider delivery engine.
   */
  private async executePipeline(
    pipeline: DeliveryPipeline,
    tokenSet: any[],
    context: { version: string; title: string; changelog: string; dryRun?: boolean }
  ): Promise<PipelineExecutionReport> {
    // 1. Run configured exporters
    const files: GeneratedFile[] = [];
    const exporterNames = Array.isArray(pipeline.exporters) ? pipeline.exporters : ['css', 'typescript'];

    for (const exp of exporterNames) {
      switch (exp.toLowerCase()) {
        case 'css':
          files.push(exportToCss(tokenSet));
          break;
        case 'typescript':
        case 'ts':
          files.push(exportToTypeScript(tokenSet));
          break;
        case 'tailwind':
          files.push(exportToTailwind(tokenSet));
          break;
        case 'swift':
        case 'ios':
          files.push(exportToSwift(tokenSet));
          break;
        case 'kotlin':
        case 'android':
          files.push(exportToKotlin(tokenSet));
          break;
        case 'json':
        case 'dtcg':
          files.push(exportToJson(tokenSet));
          break;
      }
    }

    // 2. Interpolate template variables
    const vars: Record<string, string> = {
      '{{version}}': context.version,
      '{{title}}': context.title,
      '{{changelog}}': context.changelog,
      '{{tokenCount}}': String(tokenSet.length),
      '{{date}}': new Date().toISOString().split('T')[0],
      '{{designSystemId}}': pipeline.designSystemId,
    };

    const interpolate = (tpl?: string | null, fallback: string = ''): string => {
      let result = tpl || fallback;
      for (const [key, val] of Object.entries(vars)) {
        result = result.replaceAll(key, val);
      }
      return result;
    };

    const commitMessage = interpolate(
      pipeline.commitMessageTemplate,
      `chore(tokens): sync design tokens ${context.version}`
    );
    const prTitle = interpolate(pipeline.prTitleTemplate, `Sync Design Tokens ${context.version}`);
    const prBody = interpolate(
      pipeline.prBodyTemplate,
      `Automated PR generated by Nexus continuous delivery pipeline "${pipeline.name}".\n\n${context.changelog}`
    );

    const newBranchName = `nexus/tokens-${context.version.replace(/[^a-zA-Z0-9._-]/g, '-')}-${Date.now().toString(36)}`;

    // 3. Invoke delivery engine
    const engine = getDeliveryEngine(pipeline.provider);
    const deliveryResult = await engine.deliver({
      projectId: pipeline.designSystemId,
      provider: pipeline.provider,
      repoOwner: pipeline.repoOwner,
      repoName: pipeline.repoName,
      baseBranch: pipeline.targetBranch || 'main',
      newBranchName,
      commitMessage,
      prTitle,
      prBody,
      files,
      dryRun: context.dryRun !== undefined ? context.dryRun : true,
      directoryPurge: pipeline.directoryPurge,
    });

    // 4. Record delivery job in database
    try {
      const ds = await this.db
        .select({ projectId: designSystems.projectId })
        .from(designSystems)
        .where(eq(designSystems.id, pipeline.designSystemId));
      const targetProjectId = ds[0]?.projectId;

      if (targetProjectId) {
        const jobId = `job-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
        await this.db.insert(deliveryJobs).values({
          id: jobId,
          projectId: targetProjectId,
          targetRepo: `${pipeline.repoOwner}/${pipeline.repoName}`,
          branch: newBranchName,
          pullRequestUrl: deliveryResult.pullRequestUrl,
          status: deliveryResult.success ? (deliveryResult.dryRun ? 'simulated' : 'success') : 'failed',
          diffSummary: deliveryResult.diffSummary,
          createdAt: new Date(),
        });
      }
    } catch (jobErr) {
      console.warn(`[PipelineManager] Failed to record delivery job:`, jobErr);
    }

    return {
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      provider: pipeline.provider,
      success: deliveryResult.success,
      deliveryResult,
    };
  }
}
