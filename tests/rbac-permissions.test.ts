import { describe, it, expect } from 'vitest';
import { RBACManager, AccessDeniedError, UserContext } from '../src/core/auth/rbac';

describe('Tier 2: Two-Tier RBAC & Granular Permissions Engine', () => {
  const rbac = new RBACManager();

  describe('Workspace Role Hierarchy', () => {
    it('grants full administrative permissions to workspace owner', () => {
      const owner: UserContext = {
        userId: 'usr-owner-1',
        workspaceRole: 'owner',
      };

      expect(rbac.hasPermission(owner, 'workspace:manage_members')).toBe(true);
      expect(rbac.hasPermission(owner, 'workspace:delete')).toBe(true);
      expect(rbac.hasPermission(owner, 'design_system:create')).toBe(true);
      expect(rbac.hasPermission(owner, 'tokens:release')).toBe(true);
      expect(rbac.hasPermission(owner, 'pipelines:configure')).toBe(true);
    });

    it('prevents non-owner admins from deleting the workspace', () => {
      const admin: UserContext = {
        userId: 'usr-admin-1',
        workspaceRole: 'admin',
      };

      expect(rbac.hasPermission(admin, 'workspace:manage_members')).toBe(true);
      expect(rbac.hasPermission(admin, 'workspace:delete')).toBe(false);
      expect(rbac.hasPermission(admin, 'tokens:release')).toBe(true);
    });

    it('restricts workspace viewer to read-only export permissions', () => {
      const viewer: UserContext = {
        userId: 'usr-viewer-1',
        workspaceRole: 'viewer',
      };

      expect(rbac.hasPermission(viewer, 'export:read')).toBe(true);
      expect(rbac.hasPermission(viewer, 'tokens:edit')).toBe(false);
      expect(rbac.hasPermission(viewer, 'tokens:create')).toBe(false);
      expect(rbac.hasPermission(viewer, 'tokens:release')).toBe(false);

      expect(() => rbac.assertPermission(viewer, 'tokens:edit')).toThrow(AccessDeniedError);
    });
  });

  describe('Design System Scoped Roles', () => {
    it('allows design system manager to release versions and configure pipelines', () => {
      const dsManager: UserContext = {
        userId: 'usr-mgr-1',
        workspaceRole: 'viewer', // low workspace role
        designSystemRole: 'manager', // elevated design system role
      };

      expect(rbac.hasPermission(dsManager, 'tokens:release')).toBe(true);
      expect(rbac.hasPermission(dsManager, 'pipelines:configure')).toBe(true);
      expect(rbac.hasPermission(dsManager, 'tokens:delete')).toBe(true);
      // But cannot manage workspace members
      expect(rbac.hasPermission(dsManager, 'workspace:manage_members')).toBe(false);
    });

    it('allows contributor to edit tokens and docs but not release or configure pipelines', () => {
      const contributor: UserContext = {
        userId: 'usr-contrib-1',
        designSystemRole: 'contributor',
      };

      expect(rbac.hasPermission(contributor, 'tokens:edit')).toBe(true);
      expect(rbac.hasPermission(contributor, 'docs:edit')).toBe(true);
      expect(rbac.hasPermission(contributor, 'tokens:release')).toBe(false);
      expect(rbac.hasPermission(contributor, 'pipelines:configure')).toBe(false);
    });
  });

  describe('Role Hierarchy Comparison', () => {
    it('compares workspace and design system role ranks correctly', () => {
      expect(rbac.isAtLeastWorkspaceRole('owner', 'admin')).toBe(true);
      expect(rbac.isAtLeastWorkspaceRole('admin', 'owner')).toBe(false);
      expect(rbac.isAtLeastWorkspaceRole('member', 'viewer')).toBe(true);

      expect(rbac.isAtLeastDesignSystemRole('manager', 'editor')).toBe(true);
      expect(rbac.isAtLeastDesignSystemRole('contributor', 'editor')).toBe(false);
    });
  });
});
