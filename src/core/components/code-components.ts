import { eq, and } from 'drizzle-orm';
import { components } from '../../db/schema';

export type ComponentStatus = 'ready' | 'in-progress' | 'deprecated' | 'planned';

export interface CodeComponentProp {
  name: string;
  type: string;
  required?: boolean;
  defaultValue?: any;
  description?: string;
}

export interface CodeComponent {
  id: string;
  designSystemId: string;
  name: string;
  category: string;
  framework: string;
  description?: string | null;
  packageName?: string | null;
  repositoryName?: string | null;
  filePath?: string | null;
  exportName?: string | null;
  status: ComponentStatus;
  props: Record<string, any>;
  variants?: Record<string, any> | null;
  codeSnippet?: string | null;
  tokenDependencies?: string[] | null;
  isDeprecated?: boolean;
  createdAt?: Date | string;
}

export class CodeComponentManager {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Registers a design system component with optional Git linkage.
   */
  public async registerComponent(
    input: Omit<CodeComponent, 'id' | 'createdAt'> & { id?: string }
  ): Promise<CodeComponent> {
    const id = input.id || `comp-${input.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}-${Date.now().toString(36)}`;
    const record: CodeComponent = {
      ...input,
      id,
      status: input.status || 'ready',
      isDeprecated: input.isDeprecated || false,
      createdAt: new Date(),
    };

    await this.db
      .insert(components)
      .values(record)
      .onConflictDoUpdate({
        target: components.id,
        set: {
          name: record.name,
          category: record.category,
          framework: record.framework,
          description: record.description,
          packageName: record.packageName,
          repositoryName: record.repositoryName,
          filePath: record.filePath,
          exportName: record.exportName,
          status: record.status,
          props: record.props,
          variants: record.variants,
          codeSnippet: record.codeSnippet,
          tokenDependencies: record.tokenDependencies,
          isDeprecated: record.isDeprecated,
        },
      });

    return record;
  }

  /**
   * Links a component to its Git source repository location.
   */
  public async linkGitSource(
    componentId: string,
    gitLink: {
      packageName: string;
      repositoryName: string;
      filePath: string;
      exportName?: string;
    }
  ): Promise<boolean> {
    const res = await this.db
      .update(components)
      .set({
        packageName: gitLink.packageName,
        repositoryName: gitLink.repositoryName,
        filePath: gitLink.filePath,
        exportName: gitLink.exportName || null,
      })
      .where(eq(components.id, componentId));

    return true;
  }

  /**
   * Lists components filtered by design system, category, or implementation status.
   */
  public async listComponents(
    designSystemId: string,
    filter?: { category?: string; status?: ComponentStatus }
  ): Promise<CodeComponent[]> {
    const conditions = [eq(components.designSystemId, designSystemId)];
    if (filter?.category) {
      conditions.push(eq(components.category, filter.category));
    }
    if (filter?.status) {
      conditions.push(eq(components.status, filter.status));
    }

    return this.db
      .select()
      .from(components)
      .where(and(...conditions));
  }

  /**
   * Generates a starter usage snippet based on component props and package info.
   */
  public generateUsageSnippet(component: CodeComponent): string {
    const importSource = component.packageName || '@/components';
    const compName = component.exportName || component.name;

    const propAttrs: string[] = [];
    if (component.props && typeof component.props === 'object') {
      for (const [propName, propDef] of Object.entries(component.props)) {
        if (propDef && typeof propDef === 'object' && propDef.defaultValue !== undefined) {
          const val = propDef.defaultValue;
          propAttrs.push(typeof val === 'string' ? `${propName}="${val}"` : `${propName}={${JSON.stringify(val)}}`);
        }
      }
    }

    const attrStr = propAttrs.length > 0 ? ` ${propAttrs.join(' ')}` : '';
    return `import { ${compName} } from '${importSource}';\n\nexport function Example() {\n  return <${compName}${attrStr} />;\n}`;
  }
}
