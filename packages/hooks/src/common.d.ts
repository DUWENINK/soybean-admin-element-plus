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
   type PagedResult<T> = {
      data: T[];
      /** 当前页码 (从1开始) */
      pageNum: number;
      /** 每页记录数 */
      pageSize: number;
      /** 总记录数 */
      total: number;
    }


    /**
     * 后端分页请求参数 PageBaseFilter<T>
     * 前端搜索参数可直接作为请求体发送，无需转换
     */
    type PageBaseFilter<T = any> = {
      /** 搜索条件 */
      search: T;
      /** 当前页码 (从1开始) */
      currentPage: number;
      /** 每页记录数 */
      pageSize: number;
      /** 排序字段 */
      sortField?: string;
      /** 排序方式 (asc/desc) */
      sortType?: string;
    }

    /**
     * 基础搜索条件 BaseFilter
     */
    type BaseFilter = {
      /** 关键字 */
      keywords?: string;
    }

    /**
     * enable status
     *
     * - "1": enabled
     * - "2": disabled
     */
    type EnableStatus = '1' | '2';

    type  AuditRecord =
    {
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
      /** record remark */
      remark?: string;
    }

    type BaseRecord= {
      /** record id */
      id: string | null;
    };

    /** common record */
    type CommonRecord<T = any> = {
      /** record id */
      id: string ;
    } & T & AuditRecord;
  }
}
