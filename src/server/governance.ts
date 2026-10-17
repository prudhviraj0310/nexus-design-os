import { and, eq } from 'drizzle-orm';
import {
  auditEvents,
  planSubscriptions,
  usageCounters,
  users,
  workspaceMembers,
  projects,
  designSystems,
} from '@/db/schema';
import { Permission, WorkspaceRole } from '@/core/auth/rbac';

export interface Principal {
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
}

const rolePermissions: Record<WorkspaceRole, Set<Permission>> = {
  owner: new Set([
    'workspace:manage_members', 'workspace:delete', 'workspace:settings',
    'design_system:create', 'design_system:delete', 'tokens:create',
    'tokens:edit', 'tokens:delete', 'tokens:release', 'pipelines:configure',
    'pipelines:execute', 'docs:edit', 'export:read',
  ]),
  admin: new Set([
    'workspace:manage_members', 'workspace:settings', 'design_system:create',
    'design_system:delete', 'tokens:create', 'tokens:edit', 'tokens:delete',
    'tokens:release', 'pipelines:configure', 'pipelines:execute',
    'docs:edit', 'export:read',
  ]),
  member: new Set(['tokens:create', 'tokens:edit', 'pipelines:execute', 'docs:edit', 'export:read']),
  viewer: new Set(['export:read']),
};

export function hasWorkspacePermission(role: WorkspaceRole, permission: Permission): boolean {
  return rolePermissions[role]?.has(permission) ?? false;
}

export async function resolvePrincipal(
  db: any,
  workspaceId: string,
  userId = 'local-operator'
): Promise<Principal> {
  if (userId === 'local-operator' || userId === 'dev-user' || userId === 'admin' || userId === 'api-client') {
    const defaultWorkspace = process.env.NOVA_DEFAULT_WORKSPACE_ID || 'ws-acme-corp';
    if (workspaceId !== defaultWorkspace) {
      throw new Error('Authenticated service principal is not authorized for this workspace.');
    }
    return { userId, workspaceId, role: 'owner' };
  }

  const rows = await db
    .select({ userId: workspaceMembers.userId, workspaceId: workspaceMembers.workspaceId, role: workspaceMembers.role })
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)))
    .limit(1);

  if (!rows[0]) throw new Error('Workspace membership not found.');
  const role = rows[0].role as WorkspaceRole;
  if (!rolePermissions[role]) throw new Error(`Unsupported workspace role "${rows[0].role}".`);
  return { userId: rows[0].userId, workspaceId: rows[0].workspaceId, role };
}

export async function authorizeWorkspace(db: any, userId: string | undefined, workspaceId: string): Promise<Principal> {
  return resolvePrincipal(db, workspaceId, userId || 'local-operator');
}

export async function authorizeDesignSystem(
  db: any,
  userId: string | undefined,
  designSystemId: string
): Promise<{ principal: Principal; designSystem: any }> {
  let systems = await db.select().from(designSystems).where(eq(designSystems.id, designSystemId)).limit(1);
  if (!systems[0]) {
    // If the database has not been seeded yet or default design system is requested on clean DB, auto-seed
    const countCheck = await db.select().from(designSystems).limit(1);
    if (countCheck.length === 0 || designSystemId === 'ds-nova-design') {
      const { seedDatabase } = await import('@/db/seed');
      await seedDatabase({ db });
      systems = await db.select().from(designSystems).where(eq(designSystems.id, designSystemId)).limit(1);
    }
  }
  if (!systems[0]) throw new Error('Design system not found.');
  const projectRows = await db.select().from(projects).where(eq(projects.id, systems[0].projectId)).limit(1);
  if (!projectRows[0]) throw new Error('Design system project not found.');
  const principal = await authorizeWorkspace(db, userId, projectRows[0].workspaceId);
  return { principal, designSystem: systems[0] };
}

export async function assertWorkspacePermission(
  db: any,
  principal: Principal,
  permission: Permission
): Promise<void> {
  if (!hasWorkspacePermission(principal.role, permission)) {
    throw new Error(`Access denied: ${permission}`);
  }
  await recordAuditEvent(db, {
    workspaceId: principal.workspaceId,
    actorUserId: principal.userId,
    action: 'authorization.checked',
    resourceType: 'permission',
    resourceId: permission,
    metadata: { role: principal.role },
  });
}

export async function recordAuditEvent(
  db: any,
  event: {
    workspaceId?: string;
    actorUserId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
  }
): Promise<void> {
  await db.insert(auditEvents).values({
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    workspaceId: event.workspaceId || null,
    actorUserId: event.actorUserId && !['local-operator', 'dev-user', 'admin', 'api-client'].includes(event.actorUserId)
      ? event.actorUserId
      : null,
    action: event.action,
    resourceType: event.resourceType,
    resourceId: event.resourceId || null,
    metadata: event.metadata || null,
    ipAddress: event.ipAddress || null,
  });
}

export async function ensureWorkspaceGovernance(db: any, workspaceId: string): Promise<void> {
  const workspaceUserId = `user-system-${workspaceId}`;
  await db.insert(users).values({
    id: workspaceUserId,
    email: `${workspaceId}@local.nexus`,
    displayName: 'Workspace Owner',
    status: 'active',
  }).onConflictDoNothing();

  await db.insert(workspaceMembers).values({
    id: `member-${workspaceId}-system`,
    workspaceId,
    userId: workspaceUserId,
    role: 'owner',
  }).onConflictDoNothing();

  await db.insert(planSubscriptions).values({
    id: `plan-${workspaceId}`,
    workspaceId,
    plan: 'free',
    status: 'active',
    seatsLimit: 5,
    systemsLimit: 1,
    contextsLimit: 1,
    monthlyAiCredits: 100,
  }).onConflictDoNothing();
}

export async function incrementUsage(
  db: any,
  workspaceId: string,
  metric: string,
  amount = 1,
  periodKey = new Date().toISOString().slice(0, 7)
): Promise<void> {
  const id = `usage-${workspaceId}-${metric}-${periodKey}`;
  const existing = await db.select().from(usageCounters).where(eq(usageCounters.id, id)).limit(1);
  if (existing[0]) {
    await db.update(usageCounters)
      .set({ value: existing[0].value + amount, updatedAt: new Date() })
      .where(eq(usageCounters.id, id));
    return;
  }
  await db.insert(usageCounters).values({ id, workspaceId, metric, periodKey, value: amount });
}
