// /**
//  * 后端请求参数工具函数
//  */

// /**
//  * 从搜索参数中提取纯搜索条件（移除分页字段）
//  *
//  * @param searchParams - 包含分页信息的搜索参数
//  * @returns 纯搜索条件对象
//  *
//  * @example
//  * ```ts
//  * const params = { current: 1, size: 30, keywords: 'test' };
//  * const search = extractSearchParams(params);
//  * // 返回: { keywords: 'test' }
//  * ```
//  */
// export function extractSearchParams<T extends Record<string, any>>(
//   searchParams: T
// ): Omit<T, 'current' | 'size' | 'sortField' | 'sortType'> {
//   const { current, size, sortField, sortType, ...search } = searchParams as any;
//   return search;
// }

// /**
//  * 构建后端分页请求参数
//  * 将前端搜索参数转换为后端 PageBaseFilter<T> 格式
//  *
//  * @param searchParams - 前端搜索参数 (包含 current, size, sortField?, sortType?, 及其他搜索条件)
//  * @returns 后端 PageBaseFilter 请求对象
//  *
//  * @example
//  * ```ts
//  * const searchParams = {
//  *   current: 1,
//  *   size: 30,
//  *   sortField: 'key',
//  *   sortType: 'asc',
//  *   keywords: 'test'
//  * };
//  * const params = buildPageRequest(searchParams);
//  * // 返回: {
//  * //   search: { keywords: 'test' },
//  * //   currentPage: 1,
//  * //   pageSize: 30,
//  * //   sortField: 'key',
//  * //   sortType: 'asc'
//  * // }
//  * ```
//  */
// export function buildPageRequest<T extends { current: number; size: number; sortField?: string; sortType?: string }>(
//   searchParams: T
// ): Api.Common.BackendPageRequestParams<Omit<T, 'current' | 'size' | 'sortField' | 'sortType'>> {
//   const { current, size, sortField = 'Id', sortType = 'asc' } = searchParams;
//   const search = extractSearchParams(searchParams);

//   return {
//     search,
//     currentPage: current,
//     pageSize: size,
//     sortField,
//     sortType
//   };
// }
