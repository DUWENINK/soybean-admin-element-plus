/**
 * Namespace Api
 *
 * All backend api type
 */
declare namespace Api {
  namespace Common {
    /** Backend PagedResult format (C# backend structure) */
    interface BackendPagedResult<T = any> {
      /** 总记录数 */
      records: number;
      /** 当前页的所有项 */
      datas: T[];
      /** 当前页 */
      pageIndex: number;
      /** 页大小 */
      pageSize: number;
      /** 页总数 */
      totalPage: number;
    }

    /** Backend page request params (C# backend structure) */
    interface BackendPageRequestParams<T = any> {
      /** 搜索条件 */
      search: T;
      /** 页码 (从1开始) */
      pageIndex: number;
      /** 每页记录数 */
      pageSize: number;
      /** 排序字段 */
      sortField?: string;
      /** 排序方式 (asc/desc) */
      sortType?: string;
    }

    /**
     * enable status
     *
     * - "1": enabled
     * - "2": disabled
     */
    type EnableStatus = '1' | '2';

    /** common record */
    type CommonRecord<T = any> = {
      /** record id */
      id: number;
      /** record creator */
      createBy: string;
      /** record create time */
      createTime: string;
      /** record updater */
      updateBy: string;
      /** record update time */
      updateTime: string;
      /** record status */
      status: EnableStatus | undefined;
    } & T;
  }
}
