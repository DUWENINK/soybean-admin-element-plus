# 通用本地化编辑器使用指南

## 概述

`GenericLocalizationEditor` 是一个通用的多语言编辑组件,支持菜单、角色、异常、枚举等多种本地化场景。

## 主要特性

- ✅ **通用性强**: 支持多种本地化类型 (Menu, Role, Exception, Enum)
- ✅ **动态语言**: 自动从后端 `/api/localization/cultures` 获取支持的语言列表
- ✅ **友好界面**: 美观的多语言编辑界面,支持默认语言高亮
- ✅ **类型安全**: 完整的 TypeScript 类型定义
- ✅ **易于集成**: 简单的 Props 配置即可使用

## 快速开始

### 1. 基本使用 - 菜单本地化

```vue
<script setup lang="ts">
import { ref } from 'vue';
import GenericLocalizationEditor from '@/components/common/generic-localization-editor.vue';

const localizationEditorVisible = ref(false);
const menuName = ref('Menu.System.UserManagement');

function openEditor() {
  localizationEditorVisible.value = true;
}

function handleSubmitted() {
  console.log('本地化已保存');
  // 刷新数据或其他操作
}
</script>

<template>
  <ElButton @click="openEditor">编辑菜单翻译</ElButton>

  <GenericLocalizationEditor
    v-model:visible="localizationEditorVisible"
    :resource-key="menuName"
    localization-type="Menu"
    @submitted="handleSubmitted"
  />
</template>
```

### 2. 角色本地化

```vue
<script setup lang="ts">
import { ref } from 'vue';
import GenericLocalizationEditor from '@/components/common/generic-localization-editor.vue';

const localizationEditorVisible = ref(false);
const roleName = ref('Role.Administrator');
</script>

<template>
  <GenericLocalizationEditor
    v-model:visible="localizationEditorVisible"
    :resource-key="roleName"
    localization-type="Role"
    title-prefix="角色"
    @submitted="handleSubmitted"
  />
</template>
```

### 3. 异常本地化

```vue
<script setup lang="ts">
import { ref } from 'vue';
import GenericLocalizationEditor from '@/components/common/generic-localization-editor.vue';

const localizationEditorVisible = ref(false);
const exceptionKey = ref('Exception.ValidationError');
</script>

<template>
  <GenericLocalizationEditor
    v-model:visible="localizationEditorVisible"
    :resource-key="exceptionKey"
    localization-type="Exception"
    @submitted="handleSubmitted"
  />
</template>
```

### 4. 枚举本地化

```vue
<script setup lang="ts">
import { ref } from 'vue';
import GenericLocalizationEditor from '@/components/common/generic-localization-editor.vue';

const localizationEditorVisible = ref(false);
const enumKey = ref('Enum.OrderStatus.Pending');
</script>

<template>
  <GenericLocalizationEditor
    v-model:visible="localizationEditorVisible"
    :resource-key="enumKey"
    localization-type="Enum"
    :show-description="false"
    @submitted="handleSubmitted"
  />
</template>
```

## Props 说明

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `visible` | `boolean` | 是 | `false` | 控制弹窗显示/隐藏 (使用 v-model) |
| `resourceKey` | `string` | 是 | - | 资源键,用于标识要编辑的资源 |
| `localizationType` | `'Menu' \| 'Role' \| 'Exception' \| 'Enum'` | 是 | - | 本地化类型 |
| `titlePrefix` | `string` | 否 | 根据类型自动生成 | 弹窗标题前缀 |
| `showDescription` | `boolean` | 否 | `true` | 是否显示描述字段 |

## Events 说明

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `submitted` | - | 保存成功后触发 |

## 资源键命名规范

为了保持代码的一致性和可维护性,建议遵循以下命名规范:

### 菜单 (Menu)
```
格式: Menu.模块名.菜单名
示例:
  - Menu.System.UserManagement
  - Menu.Order.OrderList
  - Menu.Product.CategoryManagement
```

### 角色 (Role)
```
格式: Role.角色名
示例:
  - Role.Administrator
  - Role.Manager
  - Role.User
```

### 异常 (Exception)
```
格式: Exception.异常类型
示例:
  - Exception.ValidationError
  - Exception.AuthenticationFailed
  - Exception.ResourceNotFound
```

### 枚举 (Enum)
```
格式: Enum.枚举名.枚举值
示例:
  - Enum.OrderStatus.Pending
  - Enum.OrderStatus.Completed
  - Enum.UserGender.Male
```

## 完整示例 - 在表单中集成

```vue
<script setup lang="ts">
import { ref } from 'vue';
import GenericLocalizationEditor from '@/components/common/generic-localization-editor.vue';

// 表单数据
const formModel = ref({
  name: 'Menu.System.Settings',
  icon: 'mdi:settings',
  order: 1
});

const localizationEditorVisible = ref(false);

function openLocalizationEditor() {
  if (!formModel.value.name) {
    window.$message?.warning('请先输入资源键');
    return;
  }
  localizationEditorVisible.value = true;
}

function handleLocalizationSubmitted() {
  window.$message?.success('多语言配置已保存');
}
</script>

<template>
  <ElForm :model="formModel" label-width="120px">
    <ElFormItem label="资源键">
      <ElInput v-model="formModel.name" placeholder="Menu.System.Settings">
        <template #append>
          <ElButton @click="openLocalizationEditor">
            <icon-mdi:translate class="text-icon" />
            编辑翻译
          </ElButton>
        </template>
      </ElInput>
    </ElFormItem>

    <ElFormItem label="图标">
      <ElInput v-model="formModel.icon" />
    </ElFormItem>

    <ElFormItem label="排序">
      <ElInputNumber v-model="formModel.order" />
    </ElFormItem>
  </ElForm>

  <GenericLocalizationEditor
    v-model:visible="localizationEditorVisible"
    :resource-key="formModel.name"
    localization-type="Menu"
    @submitted="handleLocalizationSubmitted"
  />
</template>
```

## API 接口要求

组件依赖以下后端接口:

### 1. 获取支持的语言列表
```
GET /api/localization/cultures

Response:
{
  "Data": {
    "DefaultCulture": "zh-CN",
    "SupportedCultures": ["zh-CN", "en-US", "ja-JP"]
  },
  "Code": 200,
  "Message": ""
}
```

### 2. 获取资源的本地化数据
```
GET /api/Localization/GetByKey?key={resourceKey}&localizationType={type}

Response:
{
  "Data": {
    "id": "xxx",
    "key": "Menu.System.UserManagement",
    "resourceType": "Menu",
    "description": "用户管理菜单",
    "isSystem": false,
    "translations": [
      {
        "id": "xxx",
        "culture": "zh-CN",
        "value": "用户管理",
        "isVerified": true
      },
      {
        "id": "yyy",
        "culture": "en-US",
        "value": "User Management",
        "isVerified": true
      }
    ]
  },
  "Code": 200
}
```

### 3. 保存本地化数据
```
POST /api/Localization/Save{Type}Localization
Content-Type: application/json

Body:
{
  "key": "Menu.System.UserManagement",
  "description": "用户管理菜单",
  "translations": {
    "zh-CN": "用户管理",
    "en-US": "User Management",
    "ja-JP": "ユーザー管理"
  }
}

Response:
{
  "Data": {
    "id": "xxx",
    "key": "Menu.System.UserManagement",
    "message": "保存成功"
  },
  "Code": 200
}
```

其中 `{Type}` 根据 `localizationType` 不同而不同:
- Menu → SaveMenuLocalization
- Role → SaveRoleLocalization
- Exception → SaveExceptionLocalization
- Enum → SaveEnumLocalization

## 后端服务配置

在后端 `Program.cs` 中添加对应的本地化服务:

```csharp
// 添加多层异常本地化服务
builder.Services.AddMultiLayerExceptionLocalizer<IExceptionLocalizer>("ExceptionLocalization");

// 添加枚举类型本地化服务
builder.Services.AddMultiLayerExceptionLocalizer<IEnumsLocalizer>("EnumLocalization");

// 添加菜单本地化服务
builder.Services.AddMultiLayerLocalizer<IMenuLocalizer>("MenuLocalization");

// 添加角色本地化服务
builder.Services.AddMultiLayerLocalizer<IRoleLocalizer>("RoleLocalization");
```

## 扩展新的本地化类型

如果需要添加新的本地化类型,请按照以下步骤:

### 1. 更新类型定义

编辑 `src/typings/api/system-manage.d.ts`:

```typescript
/** localization type enum */
type LocalizationType = 'Menu' | 'Role' | 'Exception' | 'Enum' | 'YourNewType';
```

### 2. 添加 API 端点

编辑 `src/service/api/system-manage.ts`:

```typescript
export function fetchSaveGenericLocalization(
  data: Api.SystemManage.GenericSaveLocalizationParams,
  localizationType: Api.SystemManage.LocalizationType
) {
  const endpoints: Record<Api.SystemManage.LocalizationType, string> = {
    Menu: '/api/Localization/SaveMenuLocalization',
    Role: '/api/Localization/SaveRoleLocalization',
    Exception: '/api/Localization/SaveExceptionLocalization',
    Enum: '/api/Localization/SaveEnumLocalization',
    YourNewType: '/api/Localization/SaveYourNewTypeLocalization' // 新增
  };

  return request<{ id: string; key: string; message: string }>({
    url: endpoints[localizationType],
    method: 'post',
    data
  });
}
```

### 3. 使用新类型

```vue
<GenericLocalizationEditor
  v-model:visible="visible"
  :resource-key="resourceKey"
  localization-type="YourNewType"
  title-prefix="自定义类型"
  @submitted="handleSubmitted"
/>
```

## 注意事项

1. **资源键唯一性**: 确保同一类型下的资源键是唯一的
2. **至少一个翻译**: 保存时至少需要填写一个语言的翻译
3. **默认语言**: 系统会从后端获取默认语言并在界面上高亮显示
4. **缓存刷新**: 保存后建议调用清除缓存接口以立即生效
5. **权限控制**: 根据实际需求在后端实现相应的权限控制

## 故障排查

### 问题: 语言列表为空或只显示默认语言

**解决方案**:
- 检查 `/api/localization/cultures` 接口是否正常返回
- 确认后端已正确配置支持的语言列表

### 问题: 保存失败

**解决方案**:
- 检查对应的保存接口是否存在
- 确认请求数据格式是否正确
- 查看后端日志确定具体错误原因

### 问题: 翻译未生效

**解决方案**:
- 调用清除缓存接口: `POST /api/Localization/ClearCache`
- 刷新页面重新加载数据
