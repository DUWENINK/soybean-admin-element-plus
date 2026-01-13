import { request } from '../request';

/**
 * Get user menus
 */
export function fetchGetUserMenus() {
  return request<Api.SystemManage.Menu[]>({
    url: '/api/Account/Menu',
    method: 'post'
  });
}

/**
 * Search menus (for menu management)
 */
export function fetchSearchMenus() {
  return request<Api.SystemManage.Menu[]>({
    url: '/api/_Menu/Search',
    method: 'post'
  });
}

/**
 * Refresh menu cache
 */
export function fetchRefreshMenu() {
  return request({
    url: '/api/_Menu/RefreshMenu',
    method: 'get'
  });
}
