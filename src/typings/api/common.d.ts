/**
 * Namespace Api
 *
 * All backend api type
 */
declare namespace Api {
  namespace Common {
    /**
     * 后端分页响应 PagedResult<T>
     * 与请求参数字段名保持一致
     */
    interface BackendPagedResult<T = any> {
      /** 总记录数 */
      records: number;
      /** 当前页的所有项 */
      datas: T[];
      /** 当前页码 */
      current: number;
      /** 每页记录数 */
      size: number;
      /** 页总数 */
      totalPage: number;
    }

    /**
     * 后端分页请求参数 PageBaseFilter<T>
     * 前端搜索参数可直接作为请求体发送，无需转换
     */
    interface BackendPageRequestParams<T = any> {
      /** 搜索条件 */
      search: T;
      /** 当前页码 (从1开始) */
      current: number;
      /** 每页记录数 */
      size: number;
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
