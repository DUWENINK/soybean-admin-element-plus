import { request } from '../request';

/** get constant routes */
export function fetchGetConstantRoutes() {
  return request<Api.Route.MenuRoute[]>({ url: '/api/Route/GetConstantRoutes' });
}

// /** get user routes */
// export function fetchGetUserRoutes() {
//   return request<Api.Route.UserRoute>({ url: '/api/Route/GetUserRoutes' });
// }

/**
 * whether the route is exist
 *
 * @param routePath route path (e.g., "/system/user")
 */
export function fetchIsRouteExist(routePath: string) {
  return request<boolean>({ url: '/api/Route/IsRouteExist', params: { routePath } });
}
