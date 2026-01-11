<script setup lang="tsx">
import { computed, ref, watch } from 'vue';
import type { TreeInstance } from 'element-plus';
import { ElButton, ElCard, ElPopconfirm, ElRadioButton, ElRadioGroup, ElTag } from 'element-plus';
import { useBoolean } from '@sa/hooks';
import { menuTypeRecord } from '@/constants/business';
import {
  fetchBatchDeleteMenus,
  fetchDeleteMenu,
  fetchGetMenuTree,
  fetchUpdateMenu,
  fetchUpdateMenuOrder
} from '@/service/api';
import { fetchGetUserMenus } from '@/service/api/menu';
import { extractComponentsFromMenuTree } from '@/utils/menu';
import { $t } from '@/locales';
import GenericLocalizationEditor from '@/components/common/generic-localization-editor.vue';
import LocalizedMenuName from '@/components/common/localized-menu-name.vue';
import SvgIcon from '@/components/custom/svg-icon.vue';
import MenuOperateModal, { type OperateType } from './modules/menu-operate-modal.vue';

defineOptions({ name: 'MenuManagement' });

const { bool: visible, setTrue: openModal } = useBoolean();

// View mode: 'table' or 'tree'
const viewMode = ref<'table' | 'tree'>('tree');

// Menu data
const menuData = ref<Api.SystemManage.Menu[]>([]);
const loading = ref(false);

// Tree filter
const filterText = ref('');
const hoveredNodeId = ref<string | null>(null);
const treeRef = ref<TreeInstance>();

// Selected menu for detail view
const selectedMenu = ref<Api.SystemManage.Menu | null>(null);

// Tree props
const treeProps = {
  children: 'Children',
  label: 'Name'
};

const menuTypeOptions: { value: Api.SystemManage.MenuType; label: string }[] = Object.entries(menuTypeRecord).map(
  ([value, label]) => ({
    value: value as Api.SystemManage.MenuType,
    label
  })
);

// Default expanded keys (first level only)
const expandedKeys = computed(() => menuData.value.map(node => node.Id));

// Watch filter text
watch(filterText, val => {
  treeRef.value?.filter(val);
});

// Filter node method
function filterNode(value: string, data: Api.SystemManage.Menu) {
  if (!value) return true;
  return data.Name.toLowerCase().includes(value.toLowerCase());
}

// Allow drop for drag and drop
function allowDrop(draggingNode: any, dropNode: any, type: 'prev' | 'next' | 'inner') {
  // Only Folder and Page can have children
  if (type === 'inner' && dropNode.data.MenuType !== 'Folder' && dropNode.data.MenuType !== 'Page') {
    return false;
  }
  return true;
}

// Handle node drop
async function handleNodeDrop(draggingNode: any, dropNode: any, dropType: 'before' | 'after' | 'inner') {
  const dragKey = draggingNode.data.Id;
  const dropKey = dropNode.data.Id;

  // Convert dropType to old project format
  let moveType: Api.SystemManage.MenuMoveType;
  let insertPosition: Api.SystemManage.MenuInsertPosition;

  if (dropType === 'inner') {
    moveType = 'MoveToParent';
    insertPosition = 'AsChild';
  } else {
    moveType = 'MoveToSibling';
    insertPosition = dropType === 'before' ? 'Before' : 'After';
  }

  loading.value = true;
  try {
    const { error } = await fetchUpdateMenuOrder({
      id: dragKey,
      targetId: dropKey,
      moveType,
      insertPosition
    });

    if (!error) {
      window.$message?.success($t('common.updateSuccess'));
      await loadMenuTree();
    }
  } finally {
    loading.value = false;
  }
}

// Load menu tree
async function loadMenuTree() {
  loading.value = true;
  try {
    const { data, error } = await fetchGetMenuTree();
    if (!error && data) {
      // Use old project data format directly
      menuData.value = Array.isArray(data) ? data : [];
    }
  } finally {
    loading.value = false;
  }
}

// Selected menu IDs for batch operations
const checkedRowKeys = ref<string[]>([]);

const operateType = ref<OperateType>('add');
const editingData = ref<Api.SystemManage.Menu | null>(null);

function handleAdd() {
  operateType.value = 'add';
  editingData.value = null;
  openModal();
}

async function handleBatchDelete() {
  if (checkedRowKeys.value.length === 0) return;

  loading.value = true;
  try {
    const { error } = await fetchBatchDeleteMenus(checkedRowKeys.value);
    if (!error) {
      window.$message?.success($t('common.deleteSuccess'));
      checkedRowKeys.value = [];
      await loadMenuTree();
    }
  } finally {
    loading.value = false;
  }
}

async function handleDelete(id: string) {
  loading.value = true;
  try {
    const { error } = await fetchDeleteMenu(id);
    if (!error) {
      window.$message?.success($t('common.deleteSuccess'));
      await loadMenuTree();
    }
  } finally {
    loading.value = false;
  }
}

function handleEdit(item: Api.SystemManage.Menu) {
  if (viewMode.value === 'tree') {
    // In tree view, show detail in right panel
    selectedMenu.value = { ...item };
  } else {
    // In table view, open modal
    operateType.value = 'edit';
    editingData.value = { ...item };
    openModal();
  }
}

function handleAddChildMenu(item: Api.SystemManage.Menu) {
  operateType.value = 'addChild';
  editingData.value = { ...item };
  openModal();
}

// Localization editor
const localizationEditorVisible = ref(false);
const localizationResourceKey = ref('');

function openLocalizationEditor() {
  if (!selectedMenu.value?.Name) {
    window.$message?.warning('请先输入菜单名称Key');
    return;
  }
  localizationResourceKey.value = selectedMenu.value.Name;
  localizationEditorVisible.value = true;
}

function handleLocalizationSubmitted() {
  // Refresh if needed
}

const allPages = ref<string[]>([]);

async function getAllPages() {
  const { data: userMenus } = await fetchGetUserMenus();
  if (userMenus) {
    allPages.value = extractComponentsFromMenuTree(userMenus);
  }
}

async function handleSubmitted() {
  await loadMenuTree();
  // Refresh selected menu if it was being edited
  if (selectedMenu.value?.Id) {
    const updatedMenu = findMenuInTree(menuData.value, selectedMenu.value.Id);
    if (updatedMenu) {
      selectedMenu.value = { ...updatedMenu };
    }
  }
}

// Helper function to find menu in tree
function findMenuInTree(menus: Api.SystemManage.Menu[], id: string): Api.SystemManage.Menu | null {
  for (const menu of menus) {
    if (menu.Id === id) return menu;
    if (menu.Children) {
      const found = findMenuInTree(menu.Children, id);
      if (found) return found;
    }
  }
  return null;
}

// Validate selected menu before save
function validateSelectedMenu(): boolean {
  if (!selectedMenu.value) return false;

  const { Name, MenuType, Resource, Component, PermissionCode } = selectedMenu.value;

  // Name is always required
  if (!Name?.trim()) {
    window.$message?.error($t('page.manage.menu.form.menuName'));
    return false;
  }

  // Validate Resource for Folder, Page, External
  if ((MenuType === 'Folder' || MenuType === 'Page' || MenuType === 'External') && !Resource?.trim()) {
    const msg = MenuType === 'External' ? $t('page.manage.menu.form.href') : $t('page.manage.menu.form.routePath');
    window.$message?.error(msg);
    return false;
  }

  // Validate Component for Page
  if (MenuType === 'Page' && !Component?.trim()) {
    window.$message?.error($t('page.manage.menu.form.page'));
    return false;
  }

  // Validate PermissionCode for Api
  if (MenuType === 'Api' && !PermissionCode?.trim()) {
    window.$message?.error('请输入权限标识');
    return false;
  }

  return true;
}

// Save selected menu changes
async function handleSaveDetail() {
  if (!selectedMenu.value) return;

  // Validate before save
  if (!validateSelectedMenu()) {
    return;
  }

  loading.value = true;
  try {
    const { error } = await fetchUpdateMenu(selectedMenu.value);
    if (!error) {
      window.$message?.success($t('common.updateSuccess'));
      await loadMenuTree();
      // Update selected menu with latest data
      const updatedMenu = findMenuInTree(menuData.value, selectedMenu.value.Id!);
      if (updatedMenu) {
        selectedMenu.value = { ...updatedMenu };
      }
    }
  } finally {
    loading.value = false;
  }
}

// Initialize
function init() {
  getAllPages();
  loadMenuTree();
}

init();

// Render menu type tag
function renderMenuType(menuType: Api.SystemManage.MenuType) {
  const tagMap: Record<Api.SystemManage.MenuType, UI.ThemeColor> = {
    Folder: 'info',
    Page: 'primary',
    External: 'warning',
    Api: 'success'
  };

  const label = $t(menuTypeRecord[menuType]);
  return <ElTag type={tagMap[menuType]}>{label}</ElTag>;
}

// Render menu icon
function renderIcon(row: Api.SystemManage.Menu) {
  return (
    <div class="flex-center">
      <SvgIcon icon={row.Icon} class="text-icon" />
    </div>
  );
}

// Render menu name
function renderMenuName(row: Api.SystemManage.Menu) {
  return <LocalizedMenuName menuKey={row.Name} localizedName={row.LocalizedName} />;
}

// Render status
function renderStatus(row: Api.SystemManage.Menu) {
  const tagType: UI.ThemeColor = row.Show ? 'success' : 'warning';
  const label = row.Show ? '显示' : '隐藏';
  return <ElTag type={tagType}>{label}</ElTag>;
}

// Render operations
function renderOperations(row: Api.SystemManage.Menu) {
  return (
    <div class="flex-center justify-end gap-8px pr-10px">
      {(row.MenuType === 'Folder' || row.MenuType === 'Page') && (
        <ElButton type="primary" plain size="small" onClick={() => handleAddChildMenu(row)}>
          {$t('page.manage.menu.addChildMenu')}
        </ElButton>
      )}
      <ElButton type="primary" plain size="small" onClick={() => handleEdit(row)}>
        {$t('common.edit')}
      </ElButton>
      <ElPopconfirm title={$t('common.confirmDelete')} onConfirm={() => handleDelete(row.Id)}>
        {{
          reference: () => (
            <ElButton type="danger" plain size="small">
              {$t('common.delete')}
            </ElButton>
          )
        }}
      </ElPopconfirm>
    </div>
  );
}
</script>

<template>
  <div class="flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-16px">
            <p>{{ $t('page.manage.menu.title') }}</p>
            <ElRadioGroup v-model="viewMode" size="small">
              <ElRadioButton value="tree">
                <icon-carbon-tree-view class="align-sub text-icon" />
                {{ $t('page.manage.menu.viewMode.tree') }}
              </ElRadioButton>
              <ElRadioButton value="table">
                <icon-carbon-table class="align-sub text-icon" />
                {{ $t('page.manage.menu.viewMode.table') }}
              </ElRadioButton>
            </ElRadioGroup>
          </div>
          <div class="flex gap-12px">
            <ElButton
              v-if="viewMode === 'table'"
              type="danger"
              plain
              :disabled="checkedRowKeys.length === 0"
              @click="handleBatchDelete"
            >
              <template #icon>
                <icon-ant-design:delete-outlined class="align-sub text-icon" />
              </template>
              {{ $t('common.delete') }}
            </ElButton>
            <ElButton type="primary" @click="handleAdd">
              <template #icon>
                <icon-ic:round-plus class="align-sub text-icon" />
              </template>
              {{ $t('common.add') }}
            </ElButton>
            <ElButton :loading="loading" @click="loadMenuTree">
              <template #icon>
                <icon-mdi:refresh class="align-sub text-icon" />
              </template>
              {{ $t('common.refresh') }}
            </ElButton>
          </div>
        </div>
      </template>

      <!-- Tree View -->
      <div v-if="viewMode === 'tree'" class="tree-view-wrapper">
        <!-- Left Panel: Tree -->
        <div class="tree-panel">
          <!-- Search toolbar -->
          <div class="tree-toolbar">
            <ElInput
              v-model="filterText"
              :placeholder="$t('page.manage.menu.form.menuName')"
              prefix-icon="Search"
              clearable
              class="search-input"
            />
          </div>

          <!-- Tree -->
          <ElScrollbar v-if="!loading && menuData.length > 0" class="tree-scrollbar">
            <ElTree
              ref="treeRef"
              :data="menuData"
              :props="treeProps"
              node-key="Id"
              draggable
              highlight-current
              :expand-on-click-node="false"
              :default-expanded-keys="expandedKeys"
              :filter-node-method="filterNode"
              :allow-drop="allowDrop"
              @node-click="handleEdit"
              @node-drop="handleNodeDrop"
            >
              <template #default="{ node, data }">
                <div
                  class="custom-tree-node"
                  @mouseenter="hoveredNodeId = data.Id"
                  @mouseleave="hoveredNodeId = null"
                >
                  <!-- Icon -->
                  <SvgIcon :icon="data.Icon" class="tree-icon text-icon" :class="{ 'opacity-50': !data.Show }" />

                  <!-- Menu info -->
                  <div class="menu-info">
                    <div class="menu-name" :class="{ 'opacity-50': !data.Show }">
                      <LocalizedMenuName :menu-key="data.Name" :localized-name="data.LocalizedName" />
                    </div>
                    <div v-if="data.Resource" class="menu-resource">{{ data.Resource }}</div>
                  </div>

                  <!-- Action buttons (show on hover) -->
                  <div class="menu-actions" :class="{ 'is-visible': hoveredNodeId === data.Id }">
                    <ElButton
                      icon="Plus"
                      size="small"
                      circle
                      :disabled="data.MenuType === 'External' || data.MenuType === 'Api'"
                      @click.stop="handleAddChildMenu(data)"
                    />
                    <ElButton
                      icon="Delete"
                      type="danger"
                      size="small"
                      circle
                      :disabled="data.Children && data.Children.length > 0"
                      @click.stop="handleDelete(data.Id)"
                    />
                  </div>
                </div>
              </template>
            </ElTree>
          </ElScrollbar>

          <!-- Empty state -->
          <div v-if="!loading && menuData.length === 0" class="empty-state">
            <ElEmpty description="暂无菜单数据" />
          </div>

          <!-- Loading state -->
          <div v-if="loading" class="loading-spinner">
            <IconSvgSpinners180RingWithBg class="text-24px animate-spin" />
            <span>加载中...</span>
          </div>
        </div>

        <!-- Right Panel: Detail -->
        <div class="detail-panel">
          <div v-if="selectedMenu" class="detail-content">
            <div class="detail-header">
              <h3 class="detail-title">菜单详情</h3>
              <ElSpace>
                <ElButton @click="selectedMenu = null">{{ $t('common.cancel') }}</ElButton>
                <ElButton type="primary" @click="handleSaveDetail">{{ $t('common.save') }}</ElButton>
              </ElSpace>
            </div>

            <ElScrollbar class="detail-scrollbar">
              <ElForm :model="selectedMenu" label-position="right" :label-width="120" class="detail-form">
                <ElFormItem :label="$t('page.manage.menu.menuType')">
                  <ElRadioGroup v-model="selectedMenu.MenuType" disabled>
                    <ElRadio v-for="item in menuTypeOptions" :key="item.value" :value="item.value" :label="item.value">
                      {{  $t(item.label) }}
                    </ElRadio>
                  </ElRadioGroup>
                </ElFormItem>

                <ElFormItem :label="$t('page.manage.menu.menuName')">
                  <ElInput v-model="selectedMenu.Name" :placeholder="$t('page.manage.menu.form.menuName')">
                    <template #append>
                      <ElButton @click="openLocalizationEditor">
                        <icon-mdi:translate class="text-icon" />
                      </ElButton>
                    </template>
                  </ElInput>
                </ElFormItem>

                <ElFormItem
                  v-if="selectedMenu.MenuType !== 'Api'"
                  :label="
                    selectedMenu.MenuType === 'External' ? $t('page.manage.menu.href') : $t('page.manage.menu.routePath')
                  "
                >
                  <ElInput
                    v-model="selectedMenu.Resource"
                    :placeholder="
                      selectedMenu.MenuType === 'External'
                        ? 'https://example.com'
                        : selectedMenu.MenuType === 'Folder'
                          ? '/system'
                          : '/user/list'
                    "
                  />
                </ElFormItem>

                <ElFormItem v-if="selectedMenu.MenuType === 'Page'" :label="$t('page.manage.menu.component')">
                  <ElSelect
                    v-model="selectedMenu.Component"
                    clearable
                    filterable
                    :placeholder="$t('page.manage.menu.form.page')"
                  >
                    <ElOption v-for="page in allPages" :key="page" :label="page" :value="page" />
                  </ElSelect>
                </ElFormItem>

                <ElFormItem :label="$t('page.manage.menu.icon')">
                  <ElInput v-model="selectedMenu.Icon" :placeholder="$t('page.manage.menu.form.icon')">
                    <template #suffix>
                      <SvgIcon v-if="selectedMenu.Icon" :icon="selectedMenu.Icon" class="text-icon" />
                    </template>
                  </ElInput>
                </ElFormItem>

                <ElFormItem :label="$t('page.manage.menu.order')">
                  <ElInputNumber
                    v-model="selectedMenu.Order"
                    class="w-full"
                    :placeholder="$t('page.manage.menu.form.order')"
                  />
                </ElFormItem>

                <ElFormItem :label="$t('page.manage.menu.show')">
                  <ElSwitch v-model="selectedMenu.Show" />
                </ElFormItem>

                <ElFormItem v-if="selectedMenu.MenuType !== 'Folder'" :label="$t('page.manage.menu.permissionCode')">
                  <ElInput v-model="selectedMenu.PermissionCode" placeholder="sys:user:add" />
                </ElFormItem>
              </ElForm>
            </ElScrollbar>
          </div>

          <div v-else class="detail-empty">
            <ElEmpty description="请在左侧选择菜单以查看详情" />
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div v-else class="h-full">
        <ElTable
          v-loading="loading"
          height="100%"
          border
          :data="menuData"
          row-key="Id"
          :tree-props="{ children: 'Children', hasChildren: 'hasChildren' }"
          :default-expand-all="false"
          @selection-change="checkedRowKeys = $event.map(item => item.Id)"
        >
          <ElTableColumn type="selection" width="48" />
          <ElTableColumn prop="Id" label="ID" width="250" />
          <ElTableColumn :label="$t('page.manage.menu.menuType')" width="100">
            <template #default="{ row }">
              <component :is="renderMenuType(row.MenuType)" />
            </template>
          </ElTableColumn>
          <ElTableColumn :label="$t('page.manage.menu.menuName')" min-width="150">
            <template #default="{ row }">
              <component :is="renderMenuName(row)" />
            </template>
          </ElTableColumn>
          <ElTableColumn :label="$t('page.manage.menu.icon')" width="80">
            <template #default="{ row }">
              <component :is="renderIcon(row)" />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="Resource" :label="$t('page.manage.menu.resource')" min-width="150" />
          <ElTableColumn prop="Component" :label="$t('page.manage.menu.component')" min-width="150" />
          <ElTableColumn prop="PermissionCode" :label="$t('page.manage.menu.permissionCode')" width="150" />
          <ElTableColumn :label="$t('page.manage.menu.show')" width="100">
            <template #default="{ row }">
              <component :is="renderStatus(row)" />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="Order" :label="$t('page.manage.menu.order')" width="80" />
          <ElTableColumn :label="$t('common.operate')" width="280" fixed="right">
            <template #default="{ row }">
              <component :is="renderOperations(row)" />
            </template>
          </ElTableColumn>
        </ElTable>
      </div>

      <MenuOperateModal
        v-model:visible="visible"
        :operate-type="operateType"
        :row-data="editingData"
        :all-pages="allPages"
        @submitted="handleSubmitted"
      />
      <GenericLocalizationEditor
        v-model:visible="localizationEditorVisible"
        :resource-key="localizationResourceKey"
        localization-type="Menu"
        @submitted="handleLocalizationSubmitted"
      />
    </ElCard>
  </div>
</template>

<style scoped>
/* Tree view wrapper - split layout */
.tree-view-wrapper {
  display: flex;
  flex-direction: row;
  height: 100%;
  min-height: 500px;
  gap: 16px;
}

/* Left panel: Tree */
.tree-panel {
  flex: 0 0 380px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--el-border-color);
  background-color: var(--el-bg-color);
}

/* Tree toolbar */
.tree-toolbar {
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background-color: var(--el-bg-color-page);
}

.search-input {
  width: 100%;
}

/* Tree scrollbar */
.tree-scrollbar {
  flex: 1;
  min-height: 0;
  padding: 8px;
}

/* Right panel: Detail */
.detail-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background-color: var(--el-bg-color);
}

.detail-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background-color: var(--el-bg-color-page);
}

.detail-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.detail-scrollbar {
  flex: 1;
  padding: 20px;
}

.detail-form {
  max-width: 600px;
}

.detail-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

/* Tree node content */
:deep(.el-tree-node__content) {
  height: auto;
  min-height: 48px;
  padding: 6px 8px;
  transition: background-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}

:deep(.el-tree-node__content:hover) {
  background-color: var(--el-fill-color-light);
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: var(--el-color-primary-light-9);
}

/* Drag and drop styles */
:deep(.el-tree-node.is-drop-inner > .el-tree-node__content) {
  background-color: var(--el-color-primary-light-7);
}

:deep(.el-tree .el-tree-node__expand-icon) {
  font-size: 16px;
  transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

/* Custom tree node */
.custom-tree-node {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 36px;
  padding: 2px 4px;
  gap: 8px;
}

/* Tree icon */
.tree-icon {
  flex-shrink: 0;
  font-size: 18px;
  transition: opacity 0.2s;
}

/* Menu info */
.menu-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 2px 0;
}

.menu-name {
  font-size: 14px;
  color: var(--el-text-color-primary);
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity 0.2s;
}

.menu-resource {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Menu actions (hover buttons) */
.menu-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  overflow: hidden;
  max-width: 0;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.menu-actions.is-visible {
  max-width: 120px;
  opacity: 1;
}

.menu-actions :deep(.el-button) {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  padding: 0;
}

/* Empty state */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
}

/* Loading spinner */
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  min-height: 300px;
  color: var(--el-text-color-secondary);
}

/* Table view */
:deep(.el-table) {
  .el-table__header {
    background-color: var(--el-bg-color-page);
  }
}
</style>
