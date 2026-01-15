# 后端API集成指南

## 📖 概述

本指南说明如何将前端框架与C#后端的 `NormalResult` 和 `PagedResult` 结构进行集成。

---

## 🏗️ 后端数据结构

### 1. 基础响应结构 - NormalResult

```csharp
public class NormalResult
{
    public int Code { get; set; }           // 响应码，200=成功
    public string Message { get; set; }     // 响应消息
    public bool? IsFinish { get; set; }     // 流式传输标识
    public string ServiceId;                // 服务ID
}

public class NormalResult<T> : NormalResult
{
    public T Data { get; set; }             // 响应数据
}
```

**示例响应：**
```json
{
  "Code": 200,
  "Message": "Success",
  "Data": {
    "id": "123",
    "name": "张三"
  }
}
```

### 2. 分页响应结构 - PagedResult

```csharp
public record PagedResult<T>
{
    public int Records { set; get; }        // 总记录数
    public IList<T> Datas { set; get; }     // 当前页数据
    public int PageIndex { set; get; }      // 当前页码
    public int PageSize { set; get; }       // 页大小
    public int TotalPage { get; }           // 总页数
}
```

**示例响应：**
```json
{
  "Code": 200,
  "Message": "Success",
  "Data": {
    "Records": 100,
    "Datas": [
      { "id": "1", "name": "张三" },
      { "id": "2", "name": "李四" }
    ],
    "PageIndex": 1,
    "PageSize": 30,
    "TotalPage": 4
  }
}
```

### 3. 分页请求结构 - PageBaseFilter

```csharp
public class PageBaseFilter<T> where T : BaseFilter
{
    public T Search { get; set; }           // 搜索条件
    public int PageIndex { get; set; }      // 页码（从1开始）
    public int PageSize { get; set; }       // 每页记录数
    public string SortField { get; set; } = "Id";   // 排序字段
    public string SortType { get; set; } = "asc";   // 排序方式
}

public class BaseFilter
{
    public string Keywords { get; set; }    // 关键字
}
```

**示例请求：**
```json
{
  "Search": {
    "Keywords": "test",
    "ITCode": "admin",
    "ActionUrl": "/api/test"
  },
  "PageIndex": 1,
  "PageSize": 30,
  "SortField": "ActionTime",
  "SortType": "desc"
}
```

---

## 🎯 前端适配方案

### 1. 类型定义

前端已添加后端结构的TypeScript类型定义：

**位置：** `src/typings/api/common.d.ts`

```typescript
declare namespace Api {
  namespace Common {
    /** Backend PagedResult format (C# backend structure) */
    interface BackendPagedResult<T = any> {
      Records: number;      // 总记录数
      Datas: T[];          // 当前页数据
      PageIndex: number;   // 当前页码
      PageSize: number;    // 页大小
      TotalPage: number;   // 总页数
    }

    /** Backend page request params (C# backend structure) */
    interface BackendPageRequestParams<T = any> {
      Search: T;           // 搜索条件
      PageIndex: number;   // 页码
      PageSize: number;    // 每页记录数
      SortField?: string;  // 排序字段
      SortType?: string;   // 排序方式
    }
  }
}
```

### 2. Axios拦截器适配

**位置：** `src/service/request/index.ts`

拦截器已自动支持 `{Code, Message, Data}` 格式：

```typescript
// ✅ 自动识别后端格式
isBackendSuccess(response) {
  // 支持后端 NormalResult 格式
  if ('Code' in response.data) {
    return response.data.Code === 200;
  }
  // 支持前端标准格式
  return String(response.data.code) === '0000';
}

// ✅ 自动提取数据
transform(response) {
  if ('Data' in response.data && 'Code' in response.data) {
    return response.data.Data;
  }
  return response.data.data;
}

// ✅ 自动提取错误消息
const errorMessage = response.data.Message || response.data.msg;
```

### 3. 分页转换函数

**位置：** `src/hooks/common/table.ts`

提供了专用的后端分页响应转换函数：

```typescript
import { backendPagedTransform } from '@/hooks/common/table';

// 使用后端分页转换
const { columns, data, loading, pagination } = useUIPaginatedTable({
  api: () => fetchGetActionLogList(searchParams.value),
  transform: backendPagedTransform,  // 使用后端转换函数
  // ... 其他配置
});
```

### 4. 请求参数构建工具

**位置：** `src/utils/request.ts`

提供了三个辅助函数来构建后端请求参数：

#### 方法1：手动构建（完全控制）

```typescript
import { buildBackendPageRequest } from '@/utils/request';

const params = buildBackendPageRequest(
  { ITCode: 'admin', ActionUrl: '/api/test' },  // 搜索条件
  1,                                            // PageIndex
  30,                                           // PageSize
  'ActionTime',                                 // SortField
  'desc'                                        // SortType
);
```

#### 方法2：从前端参数提取（推荐）

```typescript
import { buildBackendPageRequestFromSearch } from '@/utils/request';

const searchParams = {
  current: 1,
  size: 30,
  ITCode: 'admin',
  ActionUrl: '/api/test'
};

const params = buildBackendPageRequestFromSearch(
  searchParams,
  'ActionTime',  // SortField (可选，默认 'Id')
  'desc'         // SortType (可选，默认 'asc')
);
```

#### 方法3：仅提取搜索条件

```typescript
import { extractSearchParams } from '@/utils/request';

const searchParams = {
  current: 1,
  size: 30,
  ITCode: 'admin',
  ActionUrl: '/api/test'
};

const search = extractSearchParams(searchParams);
// 返回: { ITCode: 'admin', ActionUrl: '/api/test' }
```

---

## 📝 实战示例

### 示例1：操作日志列表（完整集成）

#### Step 1: 定义搜索参数类型

**位置：** `src/typings/api/system-manage.d.ts`

```typescript
namespace Api {
  namespace SystemManage {
    // 操作日志搜索参数（对应后端 BaseFilter 子类）
    type ActionLogSearchParams = Common.CommonSearchParams & {
      ITCode?: string;
      ActionUrl?: string;
      LogType?: number;
      ActionTime?: string;
      IP?: string;
      Duration?: number;
    };

    // 操作日志数据项
    type ActionLog = {
      id: string;
      logType: number;
      moduleName: string;
      actionName: string;
      iTCode: string;
      actionUrl: string;
      actionTime: string;
      duration: number;
      ip: string;
    };

    // 操作日志列表（使用后端分页格式）
    type ActionLogList = Common.BackendPagedResult<ActionLog>;
  }
}
```

#### Step 2: 编写API请求函数

**位置：** `src/service/api/system-manage.ts`

```typescript
import { request } from '../request';

/** 获取操作日志列表 */
export function fetchGetActionLogList(params?: Api.SystemManage.ActionLogSearchParams) {
  return request<Api.SystemManage.ActionLogList>({
    url: '/api/ActionLog/Search',
    method: 'post',
    data: params  // 后端会自动处理为 PageBaseFilter 格式
  });
}
```

#### Step 3: 在页面中使用

**位置：** `src/views/manage/actionlog/index.vue`

```vue
<script setup lang="tsx">
import { ref } from 'vue';
import { fetchGetActionLogList } from '@/service/api';
import { backendPagedTransform, useUIPaginatedTable } from '@/hooks/common/table';
import { buildBackendPageRequestFromSearch } from '@/utils/request';

// 初始化搜索参数
const searchParams = ref<Api.SystemManage.ActionLogSearchParams>({
  current: 1,
  size: 30,
  ITCode: undefined,
  ActionUrl: undefined,
  LogType: undefined,
  ActionTime: undefined,
  IP: undefined,
  Duration: undefined
});

// 配置分页表格
const { columns, data, getData, loading, pagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.current,
    pageSize: searchParams.value.size
  },
  api: () => {
    // 方式1: 使用工具函数构建请求参数
    const params = buildBackendPageRequestFromSearch(
      searchParams.value,
      'ActionTime',  // 排序字段
      'desc'         // 排序方式
    );
    return fetchGetActionLogList(params);
  },
  transform: backendPagedTransform,  // 使用后端分页转换
  onPaginationParamsChange: params => {
    searchParams.value.current = params.currentPage;
    searchParams.value.size = params.pageSize;
  },
  columns: () => [
    // ... 列定义
  ]
});
</script>
```

### 示例2：简化版（直接传参）

如果后端可以直接接受前端参数格式，可以更简单：

```vue
<script setup lang="tsx">
const { columns, data, loading, pagination } = useUIPaginatedTable({
  api: () => fetchGetActionLogList(searchParams.value),
  transform: backendPagedTransform,  // 仅需要使用后端转换函数
  // ... 其他配置
});
</script>
```

### 示例3：非分页请求

对于简单的增删改查（非分页），直接使用即可：

```typescript
// 删除操作日志
export function fetchDeleteActionLog(ids: string[]) {
  return request<boolean>({
    url: '/api/ActionLog/BatchDelete',
    method: 'post',
    data: ids
  });
}

// 使用
const result = await fetchDeleteActionLog(['id1', 'id2']);
// result 会自动从 response.data.Data 中提取
```

---

## ⚙️ 环境配置

**位置：** `.env`

```bash
# 成功响应码（后端使用 200）
VITE_SERVICE_SUCCESS_CODE=200

# 登出码（会立即登出）
VITE_SERVICE_LOGOUT_CODES=8888,8889

# 模态登出码（显示模态框后登出）
VITE_SERVICE_MODAL_LOGOUT_CODES=7777,7778

# Token过期码（会自动刷新token）
VITE_SERVICE_EXPIRED_TOKEN_CODES=9999,9998,3333
```

---

## 🔧 错误处理

### 1. 异常响应处理

后端抛出异常时，`WebApiResponseDataFilter` 会自动包装成 `NormalResult` 格式：

```json
{
  "Code": 400,
  "Message": "参数验证失败：用户名不能为空",
  "Data": null
}
```

前端会自动：
1. ✅ 识别 `Code !== 200` 为失败
2. ✅ 提取 `Message` 并显示错误提示
3. ✅ 不会执行成功回调

### 2. 自定义错误码处理

```typescript
// 在拦截器中已经处理了常见错误码
async onBackendFail(response, instance) {
  const responseCode = String(response.data.Code || response.data.code);

  // 登出码
  if (logoutCodes.includes(responseCode)) {
    handleLogout();
    return null;
  }

  // 模态登出码
  if (modalLogoutCodes.includes(responseCode)) {
    window.$messageBox?.confirm(errorMessage, '错误', {
      // ... 显示确认框
    });
    return null;
  }

  // Token过期码
  if (expiredTokenCodes.includes(responseCode)) {
    const success = await handleExpiredRequest(request.state);
    if (success) {
      return instance.request(response.config);  // 重试请求
    }
  }
}
```

---

## 📊 数据流程图

### 分页查询流程

```
┌─────────────────┐
│  前端页面组件    │
│  searchParams   │
│  {              │
│    current: 1,  │
│    size: 30,    │
│    ITCode: "x"  │
│  }              │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  工具函数                        │
│  buildBackendPageRequestFromSearch│
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│  后端请求格式    │
│  {              │
│    Search: {    │
│      ITCode:"x" │
│    },           │
│    PageIndex:1, │
│    PageSize:30  │
│  }              │
└────────┬────────┘
         │
         ▼  HTTP POST
┌─────────────────┐
│  C# Controller  │
│  [HttpPost]     │
│  Search(        │
│    PageBaseFilter<ActionLogSearcherDto>│
│  )              │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  C# Service     │
│  返回            │
│  PagedResult<T> │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  WebApiFilter   │
│  包装为          │
│  NormalResult<  │
│    PagedResult<>│
│  >              │
└────────┬────────┘
         │
         ▼  HTTP Response
┌─────────────────┐
│  Axios拦截器    │
│  提取 Data字段   │
│  返回PagedResult│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Transform函数  │
│  backendPaged   │
│  Transform()    │
│  转换为前端格式  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  前端表格组件    │
│  {              │
│    data: [],    │
│    total: 100,  │
│    pageNum: 1,  │
│    pageSize: 30 │
│  }              │
└─────────────────┘
```

---

## ✅ 检查清单

使用此清单确保正确集成：

- [ ] **类型定义**：在 `typings/api/*.d.ts` 中定义了后端数据类型
- [ ] **API函数**：在 `service/api/*.ts` 中创建了请求函数
- [ ] **响应类型**：使用了 `Api.Common.BackendPagedResult<T>` 类型
- [ ] **转换函数**：使用了 `backendPagedTransform` 转换响应
- [ ] **请求构建**：使用了 `buildBackendPageRequestFromSearch` 或相关工具
- [ ] **错误处理**：在 `.env` 中配置了正确的错误码
- [ ] **测试验证**：测试了分页、搜索、排序功能

---

## 🚀 快速开始模板

### 创建新的分页列表页面（4步走）

#### Step 1: 定义类型

```typescript
// src/typings/api/your-module.d.ts
namespace Api {
  namespace YourModule {
    type SearchParams = Common.CommonSearchParams & {
      name?: string;
      status?: number;
    };

    type YourItem = {
      id: string;
      name: string;
      status: number;
    };

    type YourList = Common.BackendPagedResult<YourItem>;
  }
}
```

#### Step 2: 创建API

```typescript
// src/service/api/your-module.ts
export function fetchGetYourList(params?: Api.YourModule.SearchParams) {
  return request<Api.YourModule.YourList>({
    url: '/api/YourModule/Search',
    method: 'post',
    data: params
  });
}
```

#### Step 3: 创建页面

```vue
<!-- src/views/your-module/index.vue -->
<script setup lang="tsx">
import { ref } from 'vue';
import { fetchGetYourList } from '@/service/api';
import { backendPagedTransform, useUIPaginatedTable } from '@/hooks/common/table';
import { buildBackendPageRequestFromSearch } from '@/utils/request';

const searchParams = ref({ current: 1, size: 30, name: undefined });

const { columns, data, loading, pagination } = useUIPaginatedTable({
  api: () => fetchGetYourList(
    buildBackendPageRequestFromSearch(searchParams.value, 'Id', 'asc')
  ),
  transform: backendPagedTransform,
  columns: () => [
    { prop: 'id', label: 'ID' },
    { prop: 'name', label: '名称' }
  ]
});
</script>

<template>
  <UIPaginatedTable
    :columns="columns"
    :data="data"
    :loading="loading"
    :pagination="pagination"
  />
</template>
```

#### Step 4: 创建后端Controller

```csharp
// C# Controller
[HttpPost("Search")]
public async Task<PagedResult<YourDto>> Search(PageBaseFilter<YourSearchDto> searcher)
{
    var search = searcher.Search;
    return await service.GetQueryAsync(search)
        .PagingResultAsync(
            searcher.PageIndex,
            searcher.PageSize,
            searcher.SortField,
            searcher.SortType
        );
}
```

---

## 📚 相关文件索引

| 功能 | 文件路径 |
|-----|---------|
| **类型定义** | `src/typings/api/common.d.ts` |
| **请求工具** | `src/utils/request.ts` |
| **表格Hook** | `src/hooks/common/table.ts` |
| **Axios配置** | `src/service/request/index.ts` |
| **示例页面** | `src/views/manage/actionlog/index.vue` |
| **示例API** | `src/service/api/system-manage.ts` |

---

## 💡 最佳实践

### 1. 统一使用工具函数

✅ **推荐：**
```typescript
const params = buildBackendPageRequestFromSearch(searchParams.value, 'ActionTime', 'desc');
return fetchGetActionLogList(params);
```

❌ **不推荐：**
```typescript
return fetchGetActionLogList({
  Search: { ITCode: searchParams.value.ITCode },
  PageIndex: searchParams.value.current,
  PageSize: searchParams.value.size
});
```

### 2. 明确转换函数

✅ **推荐：**
```typescript
transform: backendPagedTransform  // 明确使用后端转换
```

❌ **不推荐：**
```typescript
transform: backendPagedTransform  // 可能导致字段映射错误
```

### 3. 类型安全

✅ **推荐：**
```typescript
type ActionLogList = Common.BackendPagedResult<ActionLog>;
```

❌ **不推荐：**
```typescript
type ActionLogList = any;
```

---

## 🆘 常见问题

### Q1: 分页数据显示为空？

**A:** 检查是否使用了正确的转换函数：
```typescript
// ✅ 正确
transform: backendPagedTransform

// ❌ 错误（字段名不匹配）
transform: backendPagedTransform
```

### Q2: 总记录数显示不正确？

**A:** 后端 `Records` 字段是总记录数，不是数据数组。检查：
```csharp
// ✅ 正确
PagedResult {
    Records = totalCount,      // 总记录数
    Datas = items,            // 数据数组
    PageIndex = pageIndex,
    PageSize = pageSize
}

// ❌ 错误
PagedResult {
    Records = items.Count,    // 当前页数量
    Datas = items
}
```

### Q3: 搜索条件没有传递到后端？

**A:** 使用 `buildBackendPageRequestFromSearch` 包装参数：
```typescript
// ✅ 正确
const params = buildBackendPageRequestFromSearch(searchParams.value);

// ❌ 错误（分页参数也在Search中了）
const params = { Search: searchParams.value, ... }
```

### Q4: 异常响应没有显示错误消息？

**A:** 确保后端使用了 `WebApiResponseDataFilter`：
```csharp
// ✅ 在 Startup.cs 或 Program.cs 中注册
services.AddControllers(options =>
{
    options.Filters.Add<WebApiResponseDataFilter>();
});
```

---

## 📞 支持

如有问题，请查看：
- 前端框架文档：`README.md`
- 后端API文档：查看Swagger或后端项目文档
- 示例代码：`src/views/manage/actionlog/index.vue`

---

**最后更新：** 2026-01-13
