# 语言切换功能测试指南

## 测试目的

验证系统是否正确从后端 API 获取语言列表,并在登录页面和主应用中正确显示所有支持的语言。

## 预期行为

### 后端配置 (三个语言)
根据您的后端配置,系统应该返回:
```json
{
  "Data": {
    "DefaultCulture": "zh-CN",
    "SupportedCultures": ["zh-CN", "en-US", "ja-JP"]
  }
}
```

### 前端显示
语言选择器应该显示:
- 简体中文 (zh-CN) - 默认语言,排在第一位
- English (en-US)
- 日本語 (ja-JP)

## 测试步骤

### 1. 启动应用

```bash
cd d:\repos\dwk_wb_framework\DWK.WB.Framework\soybean-admin-element-plus
npm run dev
```

### 2. 测试登录页面

1. **打开登录页面**
   - 访问 http://localhost:5173 (或您的开发服务器地址)

2. **检查语言选择器**
   - 在页面右上角找到语言图标 (地球图标)
   - 点击语言图标,下拉菜单应该显示三个语言选项

3. **验证语言列表**
   - 确认显示: 简体中文, English, 日本語
   - 默认选中: 简体中文

4. **测试语言切换**
   - 点击 "English",页面文字应切换为英文
   - 点击 "日本語",页面文字应切换为日文
   - 点击 "简体中文",页面文字应恢复中文

### 3. 测试主应用 (登录后)

1. **登录系统**
   - 使用有效凭据登录

2. **检查头部语言选择器**
   - 在主应用头部找到语言图标
   - 点击查看语言列表

3. **验证语言同步**
   - 登录前选择的语言应该在登录后保持
   - 可用语言列表应该与登录页面一致

### 4. 调试检查

打开浏览器开发者工具 (F12),切换到 Console 标签:

#### 检查 API 请求

1. 切换到 Network 标签
2. 筛选 XHR/Fetch 请求
3. 查找 `/api/localization/cultures` 请求
4. 检查响应数据:

```json
{
  "Data": {
    "DefaultCulture": "zh-CN",
    "SupportedCultures": ["zh-CN", "en-US", "ja-JP"]
  },
  "Code": 200,
  "Message": ""
}
```

#### 检查 App Store 状态

在 Console 中执行:

```javascript
// 获取 Pinia Store
const stores = Array.from(document.querySelectorAll('[data-v-app]'))[0]?.__vueParentComponent?.appContext?.app?.config?.globalProperties?.$pinia;

// 或者直接访问 (如果可用)
const appStore = useAppStore();

// 查看语言选项
console.log('Locale Options:', appStore.localeOptions);
// 应该输出:
// [
//   { key: 'zh-CN', label: '简体中文' },
//   { key: 'en-US', label: 'English' },
//   { key: 'ja-JP', label: '日本語' }
// ]

// 查看当前语言
console.log('Current Locale:', appStore.locale);

// 查看加载状态
console.log('Loading:', appStore.localesLoading);
```

## 问题排查

### 问题 1: 只显示两个语言 (zh-CN, en-US)

**可能原因:**
- 后端 API 未返回正确数据
- API 请求失败,使用了降级配置

**排查步骤:**

1. **检查 API 响应**
   ```javascript
   // 手动调用 API
   fetch('/api/localization/cultures')
     .then(r => r.json())
     .then(data => console.log('API Response:', data));
   ```

2. **检查控制台错误**
   - 查看是否有网络错误或 CORS 错误
   - 查看是否有 "Failed to load supported cultures" 日志

3. **检查后端配置**
   - 确认后端确实配置了三个语言
   - 确认 API 端点可访问

### 问题 2: 语言选择器不显示

**可能原因:**
- `themeStore.header.multilingual.visible` 为 false
- 组件渲染问题

**解决方案:**
```javascript
// 检查配置
const themeStore = useThemeStore();
console.log('Multilingual Visible:', themeStore.header.multilingual.visible);

// 如果为 false,手动启用
themeStore.header.multilingual.visible = true;
```

### 问题 3: 切换语言后页面不更新

**可能原因:**
- 使用了硬编码文本而非 `$t()` 函数
- i18n 未正确初始化

**解决方案:**
- 确保所有文本都使用 `$t('key')` 格式
- 检查 `src/locales/langs/` 下是否有对应的语言文件

## 预期日志输出

### 正常启动日志

```
[App Store] Loading supported locales...
[Locale Hook] Fetching cultures from API...
[Locale Hook] Received cultures: ["zh-CN", "en-US", "ja-JP"]
[Locale Hook] Converted to options: [
  { key: "zh-CN", label: "简体中文" },
  { key: "en-US", label: "English" },
  { key: "ja-JP", label: "日本語" }
]
[App Store] Locale options updated
```

### API 失败日志

```
[Locale Hook] Failed to load supported cultures: NetworkError
[Locale Hook] Using fallback configuration
[App Store] Using default locale options: [
  { key: "zh-CN", label: "简体中文" },
  { key: "en-US", label: "English" }
]
```

## 性能检查

### API 调用次数

- **应用启动**: 1 次调用 `/api/localization/cultures`
- **刷新页面**: 1 次调用
- **切换语言**: 0 次调用 (使用已加载的数据)

### 缓存策略

- 语言列表在应用启动时加载一次
- 存储在 App Store 中,所有组件共享
- 除非手动调用 `loadSupportedLocales()`,否则不会重新加载

## 成功标准

✅ 登录页面语言选择器显示三个语言
✅ 主应用语言选择器显示三个语言
✅ 语言切换功能正常工作
✅ 选择的语言在刷新后保持
✅ API 只在启动时调用一次
✅ 无控制台错误或警告

## 额外测试场景

### 测试 1: 离线/API 失败场景

1. 断开网络或停止后端服务
2. 刷新应用
3. 验证降级到默认的两个语言 (zh-CN, en-US)
4. 验证应用仍然可以正常使用

### 测试 2: 语言持久化

1. 选择日语 (ja-JP)
2. 刷新浏览器
3. 验证页面仍然显示日语
4. 验证 localStorage 中存储了 'lang': 'ja-JP'

```javascript
// 检查 localStorage
console.log('Stored language:', localStorage.getItem('lang'));
```

### 测试 3: 不支持的语言处理

1. 手动设置一个不支持的语言
   ```javascript
   localStorage.setItem('lang', 'fr-FR');
   ```
2. 刷新页面
3. 验证自动切换到默认语言 (zh-CN)

## 本地化编辑器集成测试

1. **进入菜单管理**
   - 导航到 系统管理 > 菜单管理

2. **编辑菜单**
   - 点击任意菜单的编辑按钮
   - 在菜单名称字段旁边点击翻译图标

3. **验证语言列表**
   - 本地化编辑器应该显示三个语言的输入框:
     - 简体中文
     - English
     - 日本語

4. **测试保存**
   - 为三个语言都填写翻译
   - 保存
   - 切换系统语言,验证显示对应的翻译

## 报告问题

如果测试失败,请收集以下信息:

1. **浏览器信息**
   - 浏览器类型和版本
   - 操作系统

2. **控制台日志**
   - Console 标签的所有错误和警告
   - Network 标签的 API 请求详情

3. **复现步骤**
   - 详细的操作步骤
   - 预期结果 vs 实际结果

4. **截图**
   - 语言选择器界面
   - 控制台错误信息
   - Network 请求响应

## 总结

这个测试指南帮助您验证语言切换系统是否正确工作。关键点:
- ✅ 从后端动态获取语言列表
- ✅ 正确显示所有配置的语言
- ✅ 语言切换功能正常
- ✅ 降级机制工作正常
