import type { ElegantConstRoute } from '@elegant-router/types';

/**
 * Transform backend menu to elegant route
 */
export function transformMenuToRoute(menu: Api.Menu.MenuTreeDto): ElegantConstRoute | null {
  // Skip API type menus as they are permission markers, not routes
  if (menu.MenuType === 'Api') {
    return null;
  }

  // For Folder type menus, generate a path from the name if Resource is null
  const menuPath = menu.Resource || `/${getRouteNameFromPath(menu.Name || 'folder')}`;

  const route: ElegantConstRoute = {
    name: getRouteNameFromPath(menuPath),
    path: menuPath,
    component: getComponentPath(menu),
    meta: {
      title: menu.Name,
      i18nKey: undefined,
      icon: menu.Icon || 'mdi:menu',
      order: menu.Order,
      hide: !menu.Show,
      permissions: menu.PermissionCode ? [menu.PermissionCode] : undefined
    }
  };

  // Handle children
  if (menu.Children && menu.Children.length > 0) {
    const childRoutes = menu.Children.map(child => transformMenuToRoute(child)).filter(
      (r): r is ElegantConstRoute => r !== null
    );
    if (childRoutes.length > 0) {
      route.children = childRoutes;
    }
  }

  return route;
}

/**
 * Get route name from resource path
 */
export function getRouteNameFromPath(path: string): string {
  if (!path || path === '/') return 'root';

  // Remove leading/trailing slashes and convert to camelCase
  const parts = path
    .replace(/^\/|\/$/g, '')
    .split('/')
    .filter(Boolean);

  if (parts.length === 0) return 'root';

  // Convert to camelCase: /system/user -> systemUser
  return parts
    .map((part, index) => {
      const cleaned = part.replace(/[^a-zA-Z0-9]/g, '');
      if (index === 0) return cleaned;
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    })
    .join('');
}

/**
 * Get component path for route
 * Falls back to placeholder component if specified component doesn't exist
 */
function getComponentPath(menu: Api.Menu.MenuTreeDto): string {
  if (menu.MenuType === 'External') {
    return 'layout.base$view.iframe-page';
  }

  if (menu.MenuType === 'Folder') {
    return 'layout.base';
  }

  // Page type - use placeholder component that shows "Component not configured"
  // This allows routes to work even when specific components don't exist yet
  // You can configure the actual component path in menu management later
  if (menu.Component) {
    // Convert old component path to new format
    // Old: views/system/user/index.vue
    // New: view.system_user
    const componentPath = menu.Component
      .replace(/^views\//, '')
      .replace(/\/index\.vue$/, '')
      .replace(/\.vue$/, '')
      .replace(/\//g, '_');

    // Log warning if component might not exist (for debugging)
    if (import.meta.env.DEV) {
      console.warn(`[Menu Transform] Component path: ${componentPath} for menu: ${menu.Name}`);
    }

    return `layout.base$view.${componentPath}`;
  }

  // No component specified - use placeholder
  return 'layout.base$view.404';
}

/**
 * Transform menu tree to routes array
 */
export function transformMenusToRoutes(menus: Api.Menu.MenuTreeDto[]): ElegantConstRoute[] {
  return menus.map(menu => transformMenuToRoute(menu)).filter((r): r is ElegantConstRoute => r !== null);
}

/**
 * Get all permission codes from menu tree
 */
export function getPermissionsFromMenus(menus: Api.Menu.MenuTreeDto[]): string[] {
  const permissions: string[] = [];

  function traverse(menu: Api.Menu.MenuTreeDto) {
    if (menu.PermissionCode) {
      permissions.push(menu.PermissionCode);
    }

    if (menu.Children) {
      menu.Children.forEach(child => traverse(child));
    }
  }

  menus.forEach(menu => traverse(menu));

  return [...new Set(permissions)]; // Remove duplicates
}

/**
 * Get first available page route from menus
 * Skip folder and API type menus, find the first Page menu
 */
export function getFirstPageRoute(menus: Api.Menu.MenuTreeDto[]): Api.Menu.MenuTreeDto | null {
  for (const menu of menus) {
    // If it's a Page menu and it's visible, return it
    if (menu.MenuType === 'Page' && menu.Show) {
      return menu;
    }

    // If it's a Folder with children, search recursively
    if (menu.MenuType === 'Folder' && menu.Children && menu.Children.length > 0) {
      const firstChild = getFirstPageRoute(menu.Children);
      if (firstChild) {
        return firstChild;
      }
    }
  }

  return null;
}
