export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';
export type DesignSystemRole = 'manager' | 'editor' | 'contributor' | 'viewer';

export type Permission =
  | 'workspace:manage_members'
  | 'workspace:delete'
  | 'workspace:settings'
  | 'design_system:create'
  | 'design_system:delete'
  | 'tokens:create'
  | 'tokens:edit'
  | 'tokens:delete'
  | 'tokens:release'
  | 'pipelines:configure'
  | 'pipelines:execute'
  | 'docs:edit'
  | 'export:read';

export interface UserContext {
  userId: string;
  email?: string;
  workspaceRole?: WorkspaceRole;
  designSystemRole?: DesignSystemRole;
}

const WORKSPACE_PERMISSIONS: Record<WorkspaceRole, Set<Permission>> = {
  owner: new Set<Permission>([
    'workspace:manage_members',
    'workspace:delete',
    'workspace:settings',
    'design_system:create',
    'design_system:delete',
    'tokens:create',
    'tokens:edit',
    'tokens:delete',
    'tokens:release',
    'pipelines:configure',
    'pipelines:execute',
    'docs:edit',
    'export:read',
  ]),
  admin: new Set<Permission>([
    'workspace:manage_members',
    'workspace:settings',
    'design_system:create',
    'design_system:delete',
    'tokens:create',
    'tokens:edit',
    'tokens:delete',
    'tokens:release',
    'pipelines:configure',
    'pipelines:execute',
    'docs:edit',
    'export:read',
  ]),
  member: new Set<Permission>([
    'tokens:create',
    'tokens:edit',
    'pipelines:execute',
    'docs:edit',
    'export:read',
  ]),
  viewer: new Set<Permission>(['export:read']),
};

const DS_PERMISSIONS: Record<DesignSystemRole, Set<Permission>> = {
  manager: new Set<Permission>([
    'design_system:delete',
    'tokens:create',
    'tokens:edit',
    'tokens:delete',
    'tokens:release',
    'pipelines:configure',
    'pipelines:execute',
    'docs:edit',
    'export:read',
  ]),
  editor: new Set<Permission>([
    'tokens:create',
    'tokens:edit',
    'tokens:release',
    'pipelines:execute',
    'docs:edit',
    'export:read',
  ]),
  contributor: new Set<Permission>([
    'tokens:create',
    'tokens:edit',
    'docs:edit',
    'export:read',
  ]),
  viewer: new Set<Permission>(['export:read']),
};

export class AccessDeniedError extends Error {
  public permission: Permission;
  constructor(permission: Permission, reason?: string) {
    super(reason || `Access Denied: missing required permission "${permission}"`);
    this.name = 'AccessDeniedError';
    this.permission = permission;
  }
}

export class RBACManager {
  private db?: any;

  constructor(db?: any) {
    this.db = db;
  }

  /**
   * Checks whether a user possesses a specific permission in their workspace/DS context.
   */
  public hasPermission(user: UserContext, permission: Permission): boolean {
    // 1. Check workspace-level role permissions (Owner/Admin have overarching authority)
    if (user.workspaceRole && WORKSPACE_PERMISSIONS[user.workspaceRole]?.has(permission)) {
      return true;
    }

    // 2. Check design system specific scoped role
    if (user.designSystemRole && DS_PERMISSIONS[user.designSystemRole]?.has(permission)) {
      return true;
    }

    return false;
  }

  /**
   * Asserts permission, throwing AccessDeniedError if not granted.
   */
  public assertPermission(user: UserContext, permission: Permission): void {
    if (!this.hasPermission(user, permission)) {
      throw new AccessDeniedError(
        permission,
        `User "${user.userId}" (WS: ${user.workspaceRole || 'none'}, DS: ${user.designSystemRole || 'none'}) is not authorized for "${permission}".`
      );
    }
  }

  /**
   * Evaluates role hierarchy comparison.
   */
  public isAtLeastWorkspaceRole(currentRole: WorkspaceRole, minimumRole: WorkspaceRole): boolean {
    const ranks: Record<WorkspaceRole, number> = {
      owner: 4,
      admin: 3,
      member: 2,
      viewer: 1,
    };
    return (ranks[currentRole] || 0) >= (ranks[minimumRole] || 0);
  }

  public isAtLeastDesignSystemRole(currentRole: DesignSystemRole, minimumRole: DesignSystemRole): boolean {
    const ranks: Record<DesignSystemRole, number> = {
      manager: 4,
      editor: 3,
      contributor: 2,
      viewer: 1,
    };
    return (ranks[currentRole] || 0) >= (ranks[minimumRole] || 0);
  }
}
