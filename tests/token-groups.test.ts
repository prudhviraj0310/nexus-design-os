import { describe, it, expect } from 'vitest';
import {
  TokenGroup,
  buildGroupTree,
  validateGroupHierarchy,
  autoCreateGroupsFromTokenPaths,
  moveGroup,
  renameGroup,
  GroupHierarchyCycleError,
  GroupNotFoundError,
} from '../src/core/tokens/groups';
import { FlatToken } from '../src/core/tokens/types';

describe('Tier 1: Hierarchical Token Groups Engine', () => {
  const dsId = 'ds-token-groups';
  const verId = 'ver-draft-groups';

  const sampleTokens: FlatToken[] = [
    {
      id: 'tok-1',
      name: 'primary',
      path: 'color.brand.primary',
      category: 'color',
      type: 'color',
      rawValue: '#3b82f6',
      resolvedValue: '#3b82f6',
      isAlias: false,
    },
    {
      id: 'tok-2',
      name: 'secondary',
      path: 'color.brand.secondary',
      category: 'color',
      type: 'color',
      rawValue: '#1d4ed8',
      resolvedValue: '#1d4ed8',
      isAlias: false,
    },
    {
      id: 'tok-3',
      name: 'danger',
      path: 'color.feedback.danger',
      category: 'color',
      type: 'color',
      rawValue: '#ef4444',
      resolvedValue: '#ef4444',
      isAlias: false,
    },
    {
      id: 'tok-4',
      name: 'sm',
      path: 'spacing.layout.sm',
      category: 'spacing',
      type: 'dimension',
      rawValue: '8px',
      resolvedValue: '8px',
      isAlias: false,
    },
  ];

  it('automatically derives hierarchical groups from token path notation and assigns groupId', () => {
    const { groups, updatedTokens } = autoCreateGroupsFromTokenPaths(dsId, verId, sampleTokens);

    // Should create root groups "color" and "spacing", and child groups "brand", "feedback", "layout"
    expect(groups.length).toBe(5);

    const colorRoot = groups.find((g) => g.path === 'color' && g.isRoot);
    expect(colorRoot).toBeDefined();
    expect(colorRoot?.name).toBe('Color');

    const brandChild = groups.find((g) => g.path === 'color/brand');
    expect(brandChild).toBeDefined();
    expect(brandChild?.parentId).toBe(colorRoot?.id);

    const feedbackChild = groups.find((g) => g.path === 'color/feedback');
    expect(feedbackChild).toBeDefined();
    expect(feedbackChild?.parentId).toBe(colorRoot?.id);

    const spacingRoot = groups.find((g) => g.path === 'spacing' && g.isRoot);
    expect(spacingRoot).toBeDefined();

    const layoutChild = groups.find((g) => g.path === 'spacing/layout');
    expect(layoutChild).toBeDefined();
    expect(layoutChild?.parentId).toBe(spacingRoot?.id);

    // Verify all tokens have been assigned to their leaf groups
    expect(updatedTokens[0].groupId).toBe(brandChild?.id);
    expect(updatedTokens[1].groupId).toBe(brandChild?.id);
    expect(updatedTokens[2].groupId).toBe(feedbackChild?.id);
    expect(updatedTokens[3].groupId).toBe(layoutChild?.id);
  });

  it('builds full nested group tree with accurate depths and token counts', () => {
    const { groups, updatedTokens } = autoCreateGroupsFromTokenPaths(dsId, verId, sampleTokens);
    const tree = buildGroupTree(groups, updatedTokens);

    expect(tree).toHaveLength(2); // Two root groups: Color and Spacing

    const colorNode = tree.find((n) => n.group.path === 'color');
    expect(colorNode).toBeDefined();
    expect(colorNode?.depth).toBe(0);
    expect(colorNode?.totalTokensCount).toBe(3); // 2 in brand + 1 in feedback
    expect(colorNode?.children).toHaveLength(2);

    const brandNode = colorNode?.children.find((c) => c.group.name === 'Brand');
    expect(brandNode).toBeDefined();
    expect(brandNode?.depth).toBe(1);
    expect(brandNode?.tokens).toHaveLength(2);
    expect(brandNode?.totalTokensCount).toBe(2);

    const spacingNode = tree.find((n) => n.group.path === 'spacing');
    expect(spacingNode).toBeDefined();
    expect(spacingNode?.totalTokensCount).toBe(1);
  });

  it('detects dangling parent IDs and circular references in group hierarchy', () => {
    const brokenGroups: TokenGroup[] = [
      {
        id: 'grp-a',
        designSystemId: dsId,
        parentId: 'grp-missing',
        name: 'A',
        path: 'a',
        order: 0,
        isRoot: false,
      },
    ];

    const validation = validateGroupHierarchy(brokenGroups);
    expect(validation.valid).toBe(false);
    expect(validation.errors[0]).toContain('references non-existent parentId');

    const cyclicGroups: TokenGroup[] = [
      {
        id: 'grp-1',
        designSystemId: dsId,
        parentId: 'grp-2',
        name: '1',
        path: '1',
        order: 0,
        isRoot: false,
      },
      {
        id: 'grp-2',
        designSystemId: dsId,
        parentId: 'grp-1',
        name: '2',
        path: '2',
        order: 0,
        isRoot: false,
      },
    ];

    const cycleValidation = validateGroupHierarchy(cyclicGroups);
    expect(cycleValidation.valid).toBe(false);
    expect(cycleValidation.errors[0]).toContain('Circular hierarchy detected');

    expect(() => buildGroupTree(cyclicGroups, [])).toThrow(GroupHierarchyCycleError);
  });

  it('safely moves group and recomputes canonical paths while preventing cycle creation', () => {
    const { groups } = autoCreateGroupsFromTokenPaths(dsId, verId, sampleTokens);
    const brandGroup = groups.find((g) => g.path === 'color/brand')!;
    const spacingGroup = groups.find((g) => g.path === 'spacing')!;

    // Move brand group under spacing group
    const moved = moveGroup(groups, brandGroup.id, spacingGroup.id);
    const updatedBrand = moved.find((g) => g.id === brandGroup.id)!;

    expect(updatedBrand.parentId).toBe(spacingGroup.id);
    expect(updatedBrand.path).toBe('spacing/brand');

    // Attempting to move spacing under brand (which is now under spacing) must be rejected!
    expect(() => moveGroup(moved, spacingGroup.id, brandGroup.id)).toThrow(
      GroupHierarchyCycleError
    );

    // Attempting to move group to be its own parent must be rejected!
    expect(() => moveGroup(moved, brandGroup.id, brandGroup.id)).toThrow(
      GroupHierarchyCycleError
    );
  });

  it('renames group and updates paths of group and its descendants', () => {
    const { groups } = autoCreateGroupsFromTokenPaths(dsId, verId, sampleTokens);
    const colorGroup = groups.find((g) => g.path === 'color')!;

    const renamed = renameGroup(groups, colorGroup.id, 'Palette');
    const updatedColor = renamed.find((g) => g.id === colorGroup.id)!;
    expect(updatedColor.name).toBe('Palette');
    expect(updatedColor.path).toBe('palette');

    // Descendants must have their paths updated
    const brandChild = renamed.find((g) => g.parentId === colorGroup.id && g.name === 'Brand')!;
    expect(brandChild.path).toBe('palette/brand');
  });
});
