/**
 * Menu utility functions
 * Backend now returns camelCase format matching frontend expectations
 * No conversion functions needed anymore
 */

/**
 * Build tree structure from flat array
 */
export function buildMenuTree<T extends { id: number | string; parentId: number | string; children?: T[] }>(
  items: T[],
  parentId: number | string = 0
): T[] {
  const tree: T[] = [];

  for (const item of items) {
    if (item.parentId === parentId) {
      const children = buildMenuTree(items, item.id);
      if (children.length > 0) {
        item.children = children;
      }
      tree.push(item);
    }
  }

  return tree;
}

/**
 * Flatten tree structure to array
 */
export function flattenMenuTree<T extends { children?: T[] }>(items: T[]): T[] {
  const result: T[] = [];

  function flatten(item: T) {
    const { children, ...rest } = item as any;
    result.push(rest as T);

    if (children && Array.isArray(children)) {
      children.forEach(flatten);
    }
  }

  items.forEach(flatten);
  return result;
}

/**
 * Find menu by id in tree structure
 */
export function findMenuById<T extends { id: number | string; children?: T[] }>(
  menus: T[],
  id: number | string
): T | null {
  for (const menu of menus) {
    if (menu.id === id) {
      return menu;
    }

    if (menu.children) {
      const found = findMenuById(menu.children, id);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

/**
 * Get all parent menus of a menu
 */
export function getMenuParents<T extends { id: number | string; parentId: number | string; children?: T[] }>(
  menus: T[],
  targetId: number | string
): T[] {
  const parents: T[] = [];
  const flatMenus = flattenMenuTree(menus);

  let currentId = targetId;

  while (currentId) {
    const menu = flatMenus.find(m => m.id === currentId);
    if (!menu || !menu.parentId) break;

    const parent = flatMenus.find(m => m.id === menu.parentId);
    if (parent) {
      parents.unshift(parent);
      currentId = parent.parentId;
    } else {
      break;
    }
  }

  return parents;
}

/**
 * Extract all unique component paths from menu tree
 * Backend now returns camelCase format
 *
 * @param menus - Menu tree data
 * @returns Array of unique component paths, sorted alphabetically
 */
export function extractComponentsFromMenuTree(menus: Api.SystemManage.Menu[]): string[] {
  const components = new Set<string>();

  function traverse(menuList: Api.SystemManage.Menu[]) {
    menuList.forEach(menu => {
      // Only extract component from Page type menus
      if (menu.menuType === 'Page' && menu.component) {
        components.add(menu.component);
      }
      // Recursively traverse children
      if (menu.children && menu.children.length > 0) {
        traverse(menu.children);
      }
    });
  }

  traverse(menus);
  return Array.from(components).sort();
}
