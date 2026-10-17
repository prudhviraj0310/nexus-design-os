import { FlatToken } from './types';

export class GroupHierarchyCycleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GroupHierarchyCycleError';
  }
}

export class GroupNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GroupNotFoundError';
  }
}

export interface TokenGroup {
  id: string;
  designSystemId: string;
  versionId?: string | null;
  parentId?: string | null;
  name: string;
  description?: string | null;
  tokenType?: string | null;
  path: string; // e.g. "color/brand"
  order: number;
  isRoot: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface TokenGroupNode {
  group: TokenGroup;
  children: TokenGroupNode[];
  tokens: FlatToken[];
  depth: number;
  totalTokensCount: number;
}

/**
 * Validates group hierarchy for dangling parent references or cycles.
 */
export function validateGroupHierarchy(groups: TokenGroup[]): { valid: boolean; errors: string[] } {
  const groupMap = new Map<string, TokenGroup>(groups.map((g) => [g.id, g]));
  const errors: string[] = [];

  for (const group of groups) {
    if (group.parentId) {
      if (!groupMap.has(group.parentId)) {
        errors.push(`Group "${group.name}" (${group.id}) references non-existent parentId "${group.parentId}".`);
        continue;
      }

      // Check for cycles
      const visited = new Set<string>([group.id]);
      let currentId: string | null | undefined = group.parentId;

      while (currentId) {
        if (visited.has(currentId)) {
          errors.push(`Circular hierarchy detected in group "${group.name}" (${group.id}) via ancestor "${currentId}".`);
          break;
        }
        visited.add(currentId);
        const parent = groupMap.get(currentId);
        currentId = parent?.parentId;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Computes canonical breadcrumb path for a group based on its parent hierarchy.
 * e.g. "color/brand/interactive"
 */
export function computeGroupPath(
  group: TokenGroup,
  groupMap: Map<string, TokenGroup>,
  delimiter: string = '/'
): string {
  const parts: string[] = [group.name.toLowerCase().trim()];
  let currentId = group.parentId;
  const visited = new Set<string>([group.id]);

  while (currentId) {
    if (visited.has(currentId)) {
      break; // Cycle safeguard
    }
    visited.add(currentId);
    const parent = groupMap.get(currentId);
    if (!parent) break;
    parts.unshift(parent.name.toLowerCase().trim());
    currentId = parent.parentId;
  }

  return parts.join(delimiter);
}

/**
 * Builds a nested group tree from flat list of groups and tokens.
 */
export function buildGroupTree(groups: TokenGroup[], tokens: FlatToken[]): TokenGroupNode[] {
  const validation = validateGroupHierarchy(groups);
  if (!validation.valid) {
    throw new GroupHierarchyCycleError(`Cannot build tree: ${validation.errors.join(' ')}`);
  }

  const groupMap = new Map<string, TokenGroup>(groups.map((g) => [g.id, g]));
  const tokensByGroupId = new Map<string, FlatToken[]>();

  for (const token of tokens) {
    if (token.groupId) {
      const list = tokensByGroupId.get(token.groupId) || [];
      list.push(token);
      tokensByGroupId.set(token.groupId, list);
    }
  }

  // Build node lookup
  const nodeMap = new Map<string, TokenGroupNode>();
  for (const group of groups) {
    nodeMap.set(group.id, {
      group,
      children: [],
      tokens: tokensByGroupId.get(group.id) || [],
      depth: 0,
      totalTokensCount: 0,
    });
  }

  const roots: TokenGroupNode[] = [];

  for (const group of groups) {
    const node = nodeMap.get(group.id)!;
    if (group.parentId && nodeMap.has(group.parentId)) {
      const parentNode = nodeMap.get(group.parentId)!;
      parentNode.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Sort children by order then name, calculate depths and total token counts recursively
  function finalizeNode(node: TokenGroupNode, depth: number): number {
    node.depth = depth;
    node.children.sort((a, b) => a.group.order - b.group.order || a.group.name.localeCompare(b.group.name));

    let count = node.tokens.length;
    for (const child of node.children) {
      count += finalizeNode(child, depth + 1);
    }
    node.totalTokensCount = count;
    return count;
  }

  roots.sort((a, b) => a.group.order - b.group.order || a.group.name.localeCompare(b.group.name));
  for (const root of roots) {
    finalizeNode(root, 0);
  }

  return roots;
}

/**
 * Automatically creates a hierarchical group structure from token paths
 * (e.g. "color.brand.primary" -> group "color", child group "brand").
 * Maps each token to its leaf group.
 */
export function autoCreateGroupsFromTokenPaths(
  designSystemId: string,
  versionId: string,
  tokens: FlatToken[]
): { groups: TokenGroup[]; updatedTokens: FlatToken[] } {
  const groupPathMap = new Map<string, TokenGroup>();
  const updatedTokens: FlatToken[] = [];

  for (const token of tokens) {
    const rawPath = token.path || token.name;
    const parts = rawPath.includes('/') ? rawPath.split('/') : rawPath.split('.');
    
    // The leaf is the token name, preceding parts form the group hierarchy
    const groupSegments = parts.slice(0, parts.length - 1);

    if (groupSegments.length === 0) {
      // Top-level token or root category
      const rootCategory = token.category || 'general';
      const rootPath = rootCategory.toLowerCase();

      if (!groupPathMap.has(rootPath)) {
        const id = `grp-${designSystemId}-${rootPath.replace(/[^a-zA-Z0-9]/g, '-')}`;
        groupPathMap.set(rootPath, {
          id,
          designSystemId,
          versionId,
          parentId: null,
          name: rootCategory.charAt(0).toUpperCase() + rootCategory.slice(1),
          description: `${rootCategory} token group`,
          tokenType: token.type,
          path: rootPath,
          order: 0,
          isRoot: true,
        });
      }

      const assignedGroup = groupPathMap.get(rootPath)!;
      updatedTokens.push({
        ...token,
        groupId: assignedGroup.id,
      });
      continue;
    }

    // Build hierarchy segments
    let currentParentId: string | null = null;
    let accumulatedPath = '';

    for (let i = 0; i < groupSegments.length; i++) {
      const segment = groupSegments[i].trim();
      accumulatedPath = accumulatedPath ? `${accumulatedPath}/${segment.toLowerCase()}` : segment.toLowerCase();

      if (!groupPathMap.has(accumulatedPath)) {
        const id = `grp-${designSystemId}-${accumulatedPath.replace(/[^a-zA-Z0-9]/g, '-')}`;
        const isRoot = i === 0;
        const newGroup: TokenGroup = {
          id,
          designSystemId,
          versionId,
          parentId: currentParentId,
          name: segment.charAt(0).toUpperCase() + segment.slice(1),
          description: `${segment} group`,
          tokenType: isRoot ? token.type : undefined,
          path: accumulatedPath,
          order: i,
          isRoot,
        };
        groupPathMap.set(accumulatedPath, newGroup);
      }

      currentParentId = groupPathMap.get(accumulatedPath)!.id;
    }

    updatedTokens.push({
      ...token,
      groupId: currentParentId,
    });
  }

  const groups = Array.from(groupPathMap.values());
  return { groups, updatedTokens };
}

/**
 * Reparents a group, verifying that moving it does not create a circular reference.
 * Updates paths of the group and all its recursive descendants.
 */
export function moveGroup(
  groups: TokenGroup[],
  groupId: string,
  newParentId: string | null
): TokenGroup[] {
  const groupMap = new Map<string, TokenGroup>(groups.map((g) => [g.id, { ...g }]));
  const targetGroup = groupMap.get(groupId);

  if (!targetGroup) {
    throw new GroupNotFoundError(`Group with ID "${groupId}" not found.`);
  }

  if (newParentId === groupId) {
    throw new GroupHierarchyCycleError(`Cannot move group "${targetGroup.name}" to be its own parent.`);
  }

  // Check if newParentId is a descendant of groupId
  if (newParentId) {
    let checkId: string | null | undefined = newParentId;
    while (checkId) {
      if (checkId === groupId) {
        throw new GroupHierarchyCycleError(
          `Cannot move group "${targetGroup.name}" under its own descendant "${newParentId}".`
        );
      }
      const parent = groupMap.get(checkId);
      checkId = parent?.parentId;
    }
  }

  targetGroup.parentId = newParentId;
  targetGroup.isRoot = newParentId === null;

  // Recompute paths for all groups
  for (const group of groupMap.values()) {
    group.path = computeGroupPath(group, groupMap);
  }

  return Array.from(groupMap.values());
}

/**
 * Renames a group and recomputes canonical paths for itself and its descendants.
 */
export function renameGroup(
  groups: TokenGroup[],
  groupId: string,
  newName: string
): TokenGroup[] {
  const cleanName = newName.trim();
  if (!cleanName) {
    throw new Error('Group name cannot be empty.');
  }

  const groupMap = new Map<string, TokenGroup>(groups.map((g) => [g.id, { ...g }]));
  const targetGroup = groupMap.get(groupId);

  if (!targetGroup) {
    throw new GroupNotFoundError(`Group with ID "${groupId}" not found.`);
  }

  targetGroup.name = cleanName;

  // Recompute paths
  for (const group of groupMap.values()) {
    group.path = computeGroupPath(group, groupMap);
  }

  return Array.from(groupMap.values());
}
