# 后端集成快速参考卡片

## 🎯 三步快速集成

### 1️⃣ 定义类型
```typescript
// src/typings/api/your-module.d.ts
type YourList = Common.BackendPagedResult<YourItem>;
```

### 2️⃣ 创建API
```typescript
// src/service/api/your-module.ts
export function fetchGetYourList(params) {
  return request<Api.YourModule.YourList>({
    url: '/api/YourModule/Search',
    method: 'post',
    data: params
  });
}
```

### 3️⃣ 使用Hook
```typescript
// src/views/your-module/index.vue
import { backendPagedTransform, useUIPaginatedTable } from '@/hooks/common/table';
import { buildBackendPageRequestFromSearch } from '@/utils/request';

const { data, loading, pagination } = useUIPaginatedTable({
  api: () => fetchGetYourList(
    buildBackendPageRequestFromSearch(searchParams.value)
  ),
  transform: backendPagedTransform
});
```

---

## 📊 数据结构对照表

| 后端 (C#) | 前端 (TypeScript) | 说明 |
|----------|------------------|------|
| `Code: int` | `Code: number` | 响应码，200=成功 |
| `Message: string` | `Message: string` | 响应消息 |
| `Data: T` | `Data: T` | 响应数据 |
| `Records: int` | `Records: number` | **总记录数** |
| `Datas: T[]` | `Datas: T[]` | 当前页数据 |
| `PageIndex: int` | `PageIndex: number` | 当前页码 |
| `PageSize: int` | `PageSize: number` | 页大小 |
| `TotalPage: int` | `TotalPage: number` | 总页数 |

---

## 🔧 常用工具函数

### buildBackendPageRequestFromSearch
```typescript
// 从前端搜索参数构建后端请求
const params = buildBackendPageRequestFromSearch(
  searchParams.value,  // { current, size, ...searchFields }
  'ActionTime',        // 排序字段 (可选)
  'desc'              // 排序方式 (可选)
);
```

### backendPagedTransform
```typescript
// 转换后端分页响应为前端格式
transform: backendPagedTransform
```

### extractSearchParams
```typescript
// 仅提取搜索条件，去除分页参数
const search = extractSearchParams(searchParams.value);
```

---

## ⚠️ 常见错误

### ❌ 错误1：使用了错误的转换函数
```typescript
transform: backendPagedTransform  // ❌ 字段不匹配
```
✅ **正确：**
```typescript
transform: backendPagedTransform
```

### ❌ 错误2：直接传递前端参数
```typescript
fetchGetList(searchParams.value)  // ❌ 格式不匹配
```
✅ **正确：**
```typescript
fetchGetList(buildBackendPageRequestFromSearch(searchParams.value))
```

### ❌ 错误3：类型定义错误
```typescript
type YourList = Common.PaginatingQueryRecord<YourItem>;  // ❌ 前端格式
```
✅ **正确：**
```typescript
type YourList = Common.BackendPagedResult<YourItem>;
```

---

## 🎨 完整示例模板

```vue
<script setup lang="tsx">
import { ref } from 'vue';
import { fetchGetYourList } from '@/service/api';
import { backendPagedTransform, useUIPaginatedTable } from '@/hooks/common/table';
import { buildBackendPageRequestFromSearch } from '@/utils/request';

// 搜索参数
const searchParams = ref({
  current: 1,
  size: 30,
  name: undefined,
  status: undefined
});

// 分页表格
const { columns, data, loading, pagination, getData } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.current,
    pageSize: searchParams.value.size
  },
  api: () => fetchGetYourList(
    buildBackendPageRequestFromSearch(
      searchParams.value,
      'CreateTime',  // 排序字段
      'desc'         // 排序方式
    )
  ),
  transform: backendPagedTransform,
  onPaginationParamsChange: params => {
    searchParams.value.current = params.currentPage;
    searchParams.value.size = params.pageSize;
  },
  columns: () => [
    { prop: 'selection', type: 'selection', width: 48 },
    { prop: 'index', type: 'index', label: '序号', width: 64 },
    { prop: 'name', label: '名称', minWidth: 120 },
    { prop: 'status', label: '状态', width: 100 }
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

---

## 🔗 相关文件

- 📘 [完整集成指南](./BACKEND_INTEGRATION_GUIDE.md)
- 📁 [工具函数](./src/utils/request.ts)
- 📁 [表格Hook](./src/hooks/common/table.ts)
- 📁 [类型定义](./src/typings/api/common.d.ts)
- 📁 [示例页面](./src/views/manage/actionlog/index.vue)

---

**提示：** 所有后端响应都会被 Axios 拦截器自动处理，你只需要关注业务逻辑！
