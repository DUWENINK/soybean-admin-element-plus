import { request } from '../request';

/** get role list */
export function fetchGetRoleList(params?: Api.SystemManage.RoleSearchParams) {
  return request<Api.SystemManage.RoleList>({
    url: '/systemManage/getRoleList',
    method: 'get',
    params
  });
}

/**
 * get all roles
 *
 * these roles are all enabled
 */
export function fetchGetAllRoles() {
  return request<Api.SystemManage.AllRole[]>({
    url: '/systemManage/getAllRoles',
    method: 'get'
  });
}

/** get user list */
export function fetchGetUserList(params?: Api.SystemManage.UserSearchParams) {
  return request<Api.SystemManage.UserList>({
    url: '/systemManage/getUserList',
    method: 'get',
    params
  });
}

/** get menu list */
export function fetchGetMenuList() {
  return request<Api.SystemManage.MenuList>({
    url: '/systemManage/getMenuList/v2',
    method: 'get'
  });
}

/** get all pages */
export function fetchGetAllPages() {
  return request<string[]>({
    url: '/systemManage/getAllPages',
    method: 'get'
  });
}

/** get menu tree */
export function fetchGetMenuTree() {
  return request<Api.SystemManage.Menu[]>({
    url: '/api/Menu/Search',
    method: 'post',
    data: {}
  });
}

/** get menu by id */
export function fetchGetMenuById(id: number | string) {
  return request<Api.SystemManage.Menu>({
    url: `/api/Menu/${id}`,
    method: 'get'
  });
}

/** add menu */
export function fetchAddMenu(data: Partial<Api.SystemManage.Menu>) {
  return request<boolean>({
    url: '/api/Menu/Add',
    method: 'post',
    data
  });
}

/** update menu */
export function fetchUpdateMenu(data: Partial<Api.SystemManage.Menu>) {
  return request<boolean>({
    url: '/api/Menu/Edit',
    method: 'put',
    data
  });
}

/** delete menu */
export function fetchDeleteMenu(id: number | string) {
  return request<boolean>({
    url: `/api/Menu/Delete/${id}`,
    method: 'post'
  });
}

/** batch delete menus */
export function fetchBatchDeleteMenus(ids: (number | string)[]) {
  return request<boolean>({
    url: '/api/Menu/BatchDelete',
    method: 'post',
    data: ids
  });
}

/** update menu order */
export function fetchUpdateMenuOrder(params: Api.SystemManage.UpdateMenuOrderParams) {
  return request<boolean>({
    url: '/api/Menu/UpdateMenuOrder',
    method: 'post',
    data: params
  });
}

/** update menu icon */
export function fetchUpdateMenuIcon(id: number | string, icon: string) {
  return request<boolean>({
    url: '/api/Menu/MenuIconChange',
    method: 'post',
    data: { id, icon }
  });
}

/** refresh menu cache */
export function fetchRefreshMenuCache() {
  return request<boolean>({
    url: '/api/Menu/RefreshMenu',
    method: 'get'
  });
}

/** get action log list */
export function fetchGetActionLogList(params?: Api.SystemManage.ActionLogSearchParams) {
  return request<Api.SystemManage.ActionLogList>({
    url: '/api/ActionLog/Search',
    method: 'post',
    data: params
  });
}

/** delete action log */
export function fetchDeleteActionLog(ids: string[]) {
  return request<boolean>({
    url: '/api/ActionLog/BatchDelete',
    method: 'post',
    data: ids
  });
}

/** get cache list */
export function fetchGetCacheList(params?: Api.SystemManage.CacheSearchParams) {
  return request<Api.SystemManage.CacheList>({
    url: '/api/CacheManagement/search',
    method: 'post',
    data: params
  });
}

/** get cache statistics */
export function fetchGetCacheStatistics() {
  return request<Api.SystemManage.CacheStatistics>({
    url: '/api/CacheManagement/statistics',
    method: 'get'
  });
}

/** add cache */
export function fetchAddCache(data: Omit<Api.SystemManage.CacheItem, 'hits' | 'misses' | 'sizeInBytes' | 'latestValue' | 'expirationTime'>) {
  return request<boolean>({
    url: '/api/CacheManagement/item',
    method: 'post',
    data
  });
}

/** update cache */
export function fetchUpdateCache(data: Omit<Api.SystemManage.CacheItem, 'hits' | 'misses' | 'sizeInBytes' | 'latestValue' | 'expirationTime'>) {
  return request<boolean>({
    url: '/api/CacheManagement/item',
    method: 'put',
    data
  });
}

/** delete cache */
export function fetchDeleteCache(key: string) {
  return request<boolean>({
    url: `/api/CacheManagement/item/${encodeURIComponent(key)}`,
    method: 'delete'
  });
}

/** batch delete cache */
export function fetchBatchDeleteCache(keys: string[]) {
  return request<number>({
    url: '/api/CacheManagement/batch-delete',
    method: 'post',
    data: { keys }
  });
}
