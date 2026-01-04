/**
 * Menu utility functions
 */

/**
 * Convert old project menu data to new project format
 * Old project uses: { Id, Name, MenuType, ParentId, Icon, Order, Show, PermissionCode, Resource, Component, Children }
 * New project uses: { id, menuName, menuType, parentId, icon, order, show, permissionCode, routePath, component, children }
 */
export function convertOldMenuToNew(oldMenu: any): Api.SystemManage.Menu {
  // Map old MenuType enum to new type
  const menuTypeMap: Record<string, Api.SystemManage.MenuType> = {
    Folder: '1',
    Page: '2',
    External: '3',
    Api: '4'
  };

  const newMenu: Api.SystemManage.Menu = {
    id: oldMenu.Id,
    menuName: oldMenu.Name,
    menuType: menuTypeMap[oldMenu.MenuType] || '1',
    parentId: oldMenu.ParentId || 0,
    icon: oldMenu.Icon || '',
    iconType: '1', // Default to iconify
    order: oldMenu.Order || 0,
    status: oldMenu.Show ? '1' : '2',
    show: oldMenu.Show,
    permissionCode: oldMenu.PermissionCode,
    routeName: oldMenu.Name || '',
    routePath: oldMenu.Resource || '',
    component: oldMenu.Component,
    i18nKey: null,
    keepAlive: false,
    constant: false,
    href: oldMenu.MenuType === 'External' ? oldMenu.Resource : null,
    hideInMenu: !oldMenu.Show,
    activeMenu: undefined,
    multiTab: false,
    fixedIndexInTab: undefined,
    query: null,
    buttons: null,
    children: oldMenu.Children ? oldMenu.Children.map(convertOldMenuToNew) : null
  };

  return newMenu;
}

/**
 * Convert new project menu data to old project format for API submission
 */
export function convertNewMenuToOld(newMenu: Partial<Api.SystemManage.Menu>): any {
  // Map new type to old MenuType enum
  const menuTypeMap: Record<Api.SystemManage.MenuType, string> = {
    '1': 'Folder',
    '2': 'Page',
    '3': 'External',
    '4': 'Api'
  };

  const oldMenu: any = {
    Id: newMenu.id,
    Name: newMenu.menuName,
    MenuType: menuTypeMap[newMenu.menuType || '1'],
    ParentId: newMenu.parentId || 0,
    Icon: newMenu.icon,
    Order: newMenu.order || 0,
    Show: newMenu.show !== undefined ? newMenu.show : true,
    PermissionCode: newMenu.permissionCode,
    Resource: newMenu.routePath || newMenu.href || '',
    Component: newMenu.component
  };

  // Remove undefined fields
  Object.keys(oldMenu).forEach(key => {
    if (oldMenu[key] === undefined) {
      delete oldMenu[key];
    }
  });

  return oldMenu;
}

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
