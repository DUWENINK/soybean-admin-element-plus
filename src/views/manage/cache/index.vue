<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElPopconfirm, ElTag, ElStatistic, ElRow, ElCol, ElDivider } from 'element-plus';
import {
  fetchGetCacheList,
  fetchDeleteCache,
  fetchGetCacheStatistics,
  fetchBatchDeleteCache
} from '@/service/api';
import { backendPagedTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { buildBackendPageRequestFromSearch } from '@/utils/request';
import { $t } from '@/locales';
import CacheSearch from './modules/cache-search.vue';
import CacheOperateDrawer from './modules/cache-operate-drawer.vue';

defineOptions({ name: 'CacheManage' });

const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Api.SystemManage.CacheSearchParams {
  return {
    current: 1,
    size: 30,
    keywords: undefined,
    prefix: undefined
  };
}

// 统计数据
const statistics = ref<Api.SystemManage.CacheStatistics>({
  totalKeys: 0,
  totalHits: 0,
  totalMisses: 0,
  hitRate: 0,
  totalSizeInBytes: 0
});

// 加载统计信息
async function loadStatistics() {
  try {
    const result = await fetchGetCacheStatistics();
    if (result) {
      statistics.value = result;
    }
  } catch (error) {
    console.error('加载统计信息失败', error);
  }
}

// 格式化字节大小
function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.current,
    pageSize: searchParams.value.size
  },
  api: () => {
    // 使用后端分页请求格式
    const params = buildBackendPageRequestFromSearch(searchParams.value, 'key', 'asc');
    return fetchGetCacheList(params);
  },
  transform: response => backendPagedTransform(response), // 使用后端分页转换函数
  onPaginationParamsChange: params => {
    searchParams.value.current = params.currentPage;
    searchParams.value.size = params.pageSize;
  },
  columns: () => [
    { prop: 'selection', type: 'selection', width: 48 },
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'key', label: $t('page.manage.cache.key'), minWidth: 200 },
    {
      prop: 'valueType',
      label: $t('page.manage.cache.valueType'),
      width: 100,
      align: 'center',
      formatter: row => {
        const typeColors: Record<string, UI.ThemeColor> = {
          json: 'primary',
          string: 'success',
          number: 'warning',
          boolean: 'info'
        };
        return <ElTag type={typeColors[row.valueType] || 'info'}>{row.valueType}</ElTag>;
      }
    },
    {
      prop: 'latestValue',
      label: $t('page.manage.cache.latestValue'),
      minWidth: 200,
      formatter: row => {
        const value = row.latestValue || '';
        return value.length > 50 ? `${value.substring(0, 50)}...` : value;
      }
    },
    { prop: 'hits', label: $t('page.manage.cache.hits'), width: 80, align: 'right' },
    { prop: 'misses', label: $t('page.manage.cache.misses'), width: 80, align: 'right' },
    {
      prop: 'expirationTime',
      label: $t('page.manage.cache.expirationTime'),
      width: 180,
      formatter: row => (row.expirationTime ? row.expirationTime : $t('page.manage.cache.permanent'))
    },
    {
      prop: 'sizeInBytes',
      label: $t('page.manage.cache.size'),
      width: 100,
      align: 'right',
      formatter: row => formatBytes(row.sizeInBytes)
    },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 180,
      formatter: row => (
        <div class="flex-center gap-8px">
          <ElButton type="primary" plain size="small" onClick={() => edit(row.key)}>
            {$t('common.edit')}
          </ElButton>
          <ElPopconfirm title={$t('common.confirmDelete')} onConfirm={() => handleDelete(row.key)}>
            {{
              reference: () => (
                <ElButton type="danger" plain size="small">
                  {$t('common.delete')}
                </ElButton>
              )
            }}
          </ElPopconfirm>
        </div>
      )
    }
  ]
});

const { drawerVisible, operateType, handleAdd, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(data, 'key', getData);

function edit(key: string) {
  handleEdit(key);
}

async function handleDelete(key: string) {
  await onDeleted(
    async () => {
      const result = await fetchDeleteCache(key);
      await loadStatistics();
      return result;
    },
    () => $t('common.deleteSuccess')
  );
}

async function handleBatchDelete() {
  await onBatchDeleted(
    async () => {
      const result = await fetchBatchDeleteCache(checkedRowKeys.value);
      await loadStatistics();
      return result;
    },
    () => $t('common.deleteSuccess')
  );
}

function handleReset() {
  searchParams.value = getInitSearchParams();
  getData();
}

async function handleRefresh() {
  await getData();
  await loadStatistics();
}

// 页面加载时初始化
onMounted(() => {
  getData();
  loadStatistics();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <!-- 统计卡片 -->
    <ElCard :bordered="false" size="small" class="card-wrapper">
      <ElRow :gutter="20">
        <ElCol :span="6">
          <ElStatistic :title="$t('page.manage.cache.totalKeys')" :value="statistics.totalKeys" />
        </ElCol>
        <ElCol :span="6">
          <ElStatistic :title="$t('page.manage.cache.totalHits')" :value="statistics.totalHits" />
        </ElCol>
        <ElCol :span="6">
          <ElStatistic
            :title="$t('page.manage.cache.hitRate')"
            :value="statistics.hitRate * 100"
            :precision="2"
            suffix="%"
          />
        </ElCol>
        <ElCol :span="6">
          <ElStatistic :title="$t('page.manage.cache.totalSize')" :value="formatBytes(statistics.totalSizeInBytes)" />
        </ElCol>
      </ElRow>
    </ElCard>

    <CacheSearch v-model:model="searchParams" @reset="handleReset" @search="getData" />
    <ElCard :title="$t('page.manage.cache.title')" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="handleRefresh"
        />
      </template>
      <UIPaginatedTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        :loading="loading"
        :pagination="mobilePagination"
      />
      <CacheOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        @submitted="getData"
      />
    </ElCard>
  </div>
</template>

<style scoped></style>
