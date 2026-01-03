# DWK.WB Framework 迁移指南

本指南说明了如何从旧项目 (ClientApp_Old) 迁移到新的 UI 项目 (soybean-admin-element-plus)。

## 已完成的迁移工作

### 1. API 类型定义更新

#### ✅ 认证类型 (`src/typings/api/auth.d.ts`)
- 更新了 `LoginToken` 接口以支持老项目的 JWT 格式:
  - `access_token`, `refresh_token`, `token_type`, `expires_in`
- 更新了 `UserInfo` 接口以匹配老项目的用户数据结构:
  - `Id`, `ITCode`, `Name`, `PhotoId`, `IsSuperUser`, `Roles`, `Departments`

#### ✅ 菜单类型 (`src/typings/api/menu.d.ts`)
- 新增菜单类型定义以支持老项目的菜单结构
- 包含 `MenuType` 枚举和 `MenuTreeDto` 接口

### 2. API 服务层更新

#### ✅ 认证 API (`src/service/api/auth.ts`)
- 更新登录接口路径: `/api/Account/LoginJwt`
- 更新用户信息接口: `/api/Account/CheckUserInfo`
- 更新 Token 刷新接口: `/api/Account/RefreshToken`
- 新增登出接口: `/api/Account/Logout`

#### ✅ 菜单 API (`src/service/api/menu.ts`)
- 新增 `fetchGetUserMenus()`: 从 `/api/Account/Menu` 获取用户菜单
- 新增 `fetchSearchMenus()`: 用于菜单管理
- 新增 `fetchRefreshMenu()`: 刷新菜单缓存

### 3. 请求拦截器更新 (`src/service/request/index.ts`)

#### ✅ 响应格式兼容
- 支持老项目的响应格式: `{ Code, Message, Data }`
- 支持新项目的响应格式: `{ code, msg, data }`
- Code 200 表示成功 (老项目)

#### ✅ Token 处理
- 自动处理 `access_token` 和 `refresh_token` 格式
- 存储 Token 过期时间 (`tokenExpireTime`)
- 自动刷新 Token 机制

### 4. 状态管理更新

#### ✅ 认证 Store (`src/store/modules/auth/index.ts`)
- 更新 `userInfo` 结构以匹配老项目格式
- 支持 `IsSuperUser` 超级用户判断
- 处理老项目的 Token 格式 (`access_token`, `refresh_token`, `expires_in`)

#### ✅ 路由 Store (`src/store/modules/route/index.ts`)
- 集成菜单 API (`fetchGetUserMenus`)
- 新增菜单转换逻辑 (`menu-transform.ts`)
- 动态生成路由基于后端菜单数据

### 5. 菜单转换逻辑 (`src/store/modules/route/menu-transform.ts`)

#### ✅ 核心功能
- `transformMenuToRoute()`: 将后端菜单转换为前端路由
- `transformMenusToRoutes()`: 批量转换菜单树
- `getPermissionsFromMenus()`: 提取所有权限代码
- 自动处理路由命名、组件路径映射

#### ✅ 菜单类型处理
- **Folder**: 目录菜单 → 使用 `layout.base`
- **Page**: 页面菜单 → 动态组件路径
- **External**: 外链菜单 → 使用 `layout.base$view.iframe-page`
- **Api**: API权限 → 跳过 (仅作为权限标记)

### 6. 环境变量配置 (`.env`)

#### ✅ 关键配置更新
```env
# 应用标题
VITE_APP_TITLE=DWK.WB Framework

# 后端服务地址
VITE_SERVICE_BASE_URL=http://localhost:6491

# 路由模式 (改为 dynamic)
VITE_AUTH_ROUTE_MODE=dynamic

# 成功响应码 (老项目使用 200)
VITE_SERVICE_SUCCESS_CODE=200

# 存储前缀
VITE_STORAGE_PREFIX=DWK_
```

## 使用说明

### 1. 启动开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 2. 确保后端服务运行

确保老项目的后端服务运行在 `http://localhost:6491`。

### 3. 登录流程

1. 访问登录页面
2. 输入用户名和密码
3. 系统将:
   - 调用 `/api/Account/LoginJwt` 获取 Token
   - 调用 `/api/Account/CheckUserInfo` 获取用户信息
   - 调用 `/api/Account/Menu` 获取用户菜单
   - 动态生成路由并跳转到首页

### 4. 菜单和路由

- 菜单从后端动态加载
- 路由根据菜单自动生成
- 支持多层嵌套菜单
- 支持权限控制 (`PermissionCode`)

## 组件路径映射规则

老项目组件路径会自动转换为新项目格式:

| 老项目路径 | 新项目格式 |
|-----------|-----------|
| `views/system/user/index.vue` | `layout.base$view.system_user` |
| `views/dashboard/index.vue` | `layout.base$view.dashboard` |
| `views/system/menu/index.vue` | `layout.base$view.system_menu` |

## 需要注意的事项

### 1. 组件迁移

新项目需要根据菜单中的组件路径创建对应的 Vue 组件。例如:

- 菜单中 `Component: "views/system/user/index.vue"`
- 需要创建 `src/views/system/user/index.vue`

### 2. 权限控制

老项目的权限控制通过 `PermissionCode` 实现:
- 存储在菜单的 `PermissionCode` 字段
- 可用于按钮级别的权限控制
- 通过路由 meta 中的 `permissions` 字段传递

### 3. 超级用户

老项目使用 `IsSuperUser` 标识超级用户,新项目已适配此逻辑。

### 4. Token 刷新

系统支持自动 Token 刷新:
- Token 即将过期时自动调用刷新接口
- 刷新失败会自动登出

## 接口对照表

| 功能 | 老项目接口 | 状态 |
|-----|-----------|------|
| 登录 | `POST /api/Account/LoginJwt` | ✅ |
| 获取用户信息 | `POST /api/Account/CheckUserInfo` | ✅ |
| 刷新Token | `GET /api/Account/RefreshToken` | ✅ |
| 登出 | `POST /api/Account/Logout` | ✅ |
| 获取菜单 | `POST /api/Account/Menu` | ✅ |
| 搜索菜单 | `POST /api/_Menu/Search` | ✅ |
| 刷新菜单缓存 | `GET /api/_Menu/RefreshMenu` | ✅ |

## 下一步工作

### 建议完成的任务

1. **创建业务页面组件**
   - 根据后端菜单中的组件路径创建对应的 Vue 组件
   - 参考老项目的页面实现业务逻辑
   - 使用新 UI 框架的组件和样式

2. **权限指令实现**
   - 实现 `v-permission` 指令用于按钮级别权限控制
   - 参考老项目的权限检查逻辑

3. **国际化配置**
   - 将老项目的多语言资源迁移到新项目
   - 更新菜单的国际化键值

4. **错误处理优化**
   - 根据老项目的业务错误码配置错误提示
   - 优化用户体验

5. **测试**
   - 测试登录流程
   - 测试菜单加载和路由跳转
   - 测试权限控制
   - 测试Token自动刷新

## 文件清单

### 新增文件
- `src/typings/api/menu.d.ts` - 菜单类型定义
- `src/service/api/menu.ts` - 菜单 API 服务
- `src/store/modules/route/menu-transform.ts` - 菜单转换逻辑

### 修改文件
- `src/typings/api/auth.d.ts` - 认证类型定义
- `src/service/api/auth.ts` - 认证 API 服务
- `src/service/api/index.ts` - API 导出
- `src/service/request/index.ts` - 请求拦截器
- `src/service/request/shared.ts` - Token 处理
- `src/store/modules/auth/index.ts` - 认证 Store
- `src/store/modules/route/index.ts` - 路由 Store
- `.env` - 环境变量配置

## 技术栈对比

| 项目 | 框架 | UI库 | 状态管理 | 路由 |
|-----|------|------|---------|------|
| 老项目 | Vue 3.5 | Element Plus 2.13 | Pinia 3.0 | Vue Router 4.6 |
| 新项目 | Vue 3.5 | Element Plus 2.11 | Pinia 3.0 | Vue Router 4.5 + Elegant Router |

## 联系和支持

如有问题,请查看:
1. 老项目文档和代码
2. 新项目 [在线文档](https://elp.soybeanjs.cn)
3. [GitHub Issues](https://github.com/soybeanjs/soybean-admin/issues)

---

**迁移完成日期**: 2026-01-02
**迁移版本**: v1.0.0
