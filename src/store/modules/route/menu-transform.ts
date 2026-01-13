import type { ElegantConstRoute } from '@elegant-router/types';

/**
 * Transform backend menu to elegant route
 * @param menu - The menu item to transform
 * @param parentMenuType - The type of parent menu (to determine if parent has layout)
 */
export function transformMenuToRoute(
  menu: Api.SystemManage.Menu,
  parentMenuType?: 'Folder' | 'Page' | 'Api' | 'External'
): ElegantConstRoute | null {
  // Skip API type menus as they are permission markers, not routes
  if (menu.menuType === 'Api') {
    return null;
  }

  // For Folder type menus, generate a path from the name if Resource is null
  const menuPath = menu.resource || `/${getRouteNameFromPath(menu.name || 'folder')}`;

  // Check if parent is a Folder with layout
  const hasLayoutParent = parentMenuType === 'Folder';

  const route: ElegantConstRoute = {
    name: getRouteNameFromPath(menuPath),
    path: menuPath,
    component: getComponentPath(menu, hasLayoutParent),
    meta: {
      title: menu.localizedName || menu.name,
      icon: menu.icon || 'mdi:menu',
      order: menu.order,
      hide: !menu.show,
      permissions: menu.permissionCode ? [menu.permissionCode] : undefined
    }
  };

  // Handle children - pass current menu type as parent type
  if (menu.children && menu.children.length > 0) {
    const childRoutes = menu.children
      .map(child => transformMenuToRoute(child, menu.menuType))
      .filter((r): r is ElegantConstRoute => r !== null);
    if (childRoutes.length > 0) {
      route.children = childRoutes;
    }
  }

  return route;
}

/**
 * Get route name from resource path
 * Converts path to underscore format to match frontend route naming convention
 * Example: /manage/user -> manage_user
 */
export function getRouteNameFromPath(path: string): string {
  if (!path || path === '/') return 'root';

  // Remove leading/trailing slashes and convert to underscore format
  const parts = path
    .replace(/^\/|\/$/g, '')
    .split('/')
    .filter(Boolean);

  if (parts.length === 0) return 'root';

  // Convert to underscore format: /manage/user -> manage_user
  // This matches the frontend route naming convention (manage_user, manage_menu, etc.)
  return parts.map(part => part.replace(/[^a-zA-Z0-9-]/g, '')).join('_');
}

/**
 * Get component path for route
 * Falls back to placeholder component if specified component doesn't exist
 * @param menu - The menu item
 * @param hasLayoutParent - Whether the parent route already has a layout
 */
function getComponentPath(menu: Api.SystemManage.Menu, hasLayoutParent = false): string {
  if (menu.menuType === 'External') {
    return 'layout.base$view.iframe-page';
  }

  if (menu.menuType === 'Folder') {
    return 'layout.base';
  }

  // Page type - use placeholder component that shows "Component not configured"
  // This allows routes to work even when specific components don't exist yet
  // You can configure the actual component path in menu management later
  if (menu.component) {
    // Convert old component path to new format
    // Old: views/system/user/index.vue
    // New: view.system_user
    const componentPath = menu.component
      .replace(/^views\//, '')
      .replace(/\/index\.vue$/, '')
      .replace(/\.vue$/, '')
      .replace(/\//g, '_');

    // Log warning if component might not exist (for debugging)
    if (import.meta.env.DEV) {
      console.warn(`[Menu Transform] Component path: ${componentPath} for menu: ${menu.name}`);
    }

    // If parent already has layout, just use view component
    // Otherwise use layout.base$view format for top-level pages
    return hasLayoutParent ? `view.${componentPath}` : `layout.base$view.${componentPath}`;
  }

  // No component specified - use placeholder
  return hasLayoutParent ? 'view.404' : 'layout.base$view.404';
}

/**
 * Transform menu tree to routes array
 */
export function transformMenusToRoutes(menus: Api.SystemManage.Menu[]): ElegantConstRoute[] {
  return menus.map(menu => transformMenuToRoute(menu)).filter((r): r is ElegantConstRoute => r !== null);
}

/**
 * Get all permission codes from menu tree
 */
export function getPermissionsFromMenus(menus: Api.SystemManage.Menu[]): string[] {
  const permissions: string[] = [];

  function traverse(menu: Api.SystemManage.Menu) {
    if (menu.permissionCode) {
      permissions.push(menu.permissionCode);
    }

    if (menu.children) {
      menu.children.forEach(child => traverse(child));
    }
  }

  menus.forEach(menu => traverse(menu));

  return [...new Set(permissions)]; // Remove duplicates
}

/**
 * Get first available page route from menus
 * Skip folder and API type menus, find the first Page menu
 */
export function getFirstPageRoute(menus: Api.SystemManage.Menu[]): Api.SystemManage.Menu | null {
  for (const menu of menus) {
    // If it's a Page menu and it's visible, return it
    if (menu.menuType === 'Page' && menu.show) {
      return menu;
    }

    // If it's a Folder with children, search recursively
    if (menu.menuType === 'Folder' && menu.children && menu.children.length > 0) {
      const firstChild = getFirstPageRoute(menu.children);
      if (firstChild) {
        return firstChild;
      }
    }
  }

  return null;
}
