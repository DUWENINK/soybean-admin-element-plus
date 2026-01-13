/**
 * Request utility functions for API parameter transformation
 */

/**
 * Build backend page request params (C# PageBaseFilter format)
 * Converts frontend pagination format to backend PageBaseFilter<T> format
 *
 * @param search - Search condition object
 * @param pageIndex - Current page number (1-based)
 * @param pageSize - Page size
 * @param sortField - Sort field name (optional, default: 'Id')
 * @param sortType - Sort type (optional, default: 'asc')
 * @returns Backend PageBaseFilter request object
 *
 * @example
 * ```ts
 * const params = buildBackendPageRequest(
 *   { ITCode: 'admin', ActionUrl: '/api/test' },
 *   1,
 *   30,
 *   'ActionTime',
 *   'desc'
 * );
 * // Returns: {
 * //   Search: { ITCode: 'admin', ActionUrl: '/api/test' },
 * //   PageIndex: 1,
 * //   PageSize: 30,
 * //   SortField: 'ActionTime',
 * //   SortType: 'desc'
 * // }
 * ```
 */
export function buildBackendPageRequest<T extends Record<string, any>>(
  search: T,
  pageIndex: number,
  pageSize: number,
  sortField: string = 'Id',
  sortType: 'asc' | 'desc' = 'asc'
): Api.Common.BackendPageRequestParams<T> {
  return {
    search: search,
    pageIndex: pageIndex,
    pageSize: pageSize,
    sortField: sortField,
    sortType: sortType
  };
}

/**
 * Extract search params from frontend pagination search params
 * Removes pagination-specific fields (current, size) and returns only search conditions
 *
 * @param searchParams - Frontend search params with pagination
 * @returns Pure search condition object
 *
 * @example
 * ```ts
 * const frontendParams = {
 *   current: 1,
 *   size: 30,
 *   ITCode: 'admin',
 *   ActionUrl: '/api/test'
 * };
 * const search = extractSearchParams(frontendParams);
 * // Returns: { ITCode: 'admin', ActionUrl: '/api/test' }
 * ```
 */
export function extractSearchParams<T extends Record<string, any>>(
  searchParams: T
): Omit<T, 'current' | 'size'> {
  const { current, size, ...search } = searchParams as any;
  return search;
}

/**
 * Build backend page request from frontend search params
 * Combines extractSearchParams and buildBackendPageRequest for convenience
 *
 * @param searchParams - Frontend search params with current and size
 * @param sortField - Sort field name (optional, default: 'Id')
 * @param sortType - Sort type (optional, default: 'asc')
 * @returns Backend PageBaseFilter request object
 *
 * @example
 * ```ts
 * const frontendParams = {
 *   current: 1,
 *   size: 30,
 *   ITCode: 'admin',
 *   ActionUrl: '/api/test'
 * };
 * const backendParams = buildBackendPageRequestFromSearch(frontendParams, 'ActionTime', 'desc');
 * // Returns: {
 * //   Search: { ITCode: 'admin', ActionUrl: '/api/test' },
 * //   PageIndex: 1,
 * //   PageSize: 30,
 * //   SortField: 'ActionTime',
 * //   SortType: 'desc'
 * // }
 * ```
 */
export function buildBackendPageRequestFromSearch<T extends Record<string, any> & { current: number; size: number }>(
  searchParams: T,
  sortField: string = 'Id',
  sortType: 'asc' | 'desc' = 'asc'
): Api.Common.BackendPageRequestParams<Omit<T, 'current' | 'size'>> {
  const search = extractSearchParams(searchParams);
  return buildBackendPageRequest(search, searchParams.current, searchParams.size, sortField, sortType);
}
