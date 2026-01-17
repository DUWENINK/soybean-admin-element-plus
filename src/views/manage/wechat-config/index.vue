<script setup lang="tsx">
import { reactive } from 'vue';
import { ElButton, ElPopconfirm, ElTag } from 'element-plus';
import { fetchDeleteWechatAppConfig, fetchGetWechatAppConfigList } from '@/service/api';
import { useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import WechatAppConfigSearch from './modules/wechat-config-search.vue';
import WechatAppConfigOperateDrawer from './modules/wechat-config-operate-drawer.vue';

defineOptions({ name: 'WechatAppConfigManage' });

const pageRequest = reactive<Api.SystemManage.WechatAppConfigPageRequest>({
  search: {},
  currentPage: 1,
  pageSize: 20,
  sortField: 'CreatedAt',
  sortType: 'desc'
});

const { columns, columnChecks, data, getData, loading, mobilePagination } = useUIPaginatedTable<
  Api.SystemManage.WechatAppConfigList,
  Api.SystemManage.WechatAppConfig
>({
  paginationProps: {
    currentPage: pageRequest.currentPage,
    pageSize: pageRequest.pageSize
  },
  api: () => fetchGetWechatAppConfigList(pageRequest),
  onPaginationParamsChange: params => {
    pageRequest.currentPage = params.currentPage ?? pageRequest.currentPage;
    pageRequest.pageSize = params.pageSize ?? pageRequest.pageSize;
  },
  columns: () => [
    { prop: 'selection', type: 'selection', width: 48 },
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'name', label: '应用名称', minWidth: 120 },
    { prop: 'appId', label: 'AppId', minWidth: 120 },
    {
      prop: 'type',
      label: '应用类型',
      width: 100,
      formatter: row => {
        const typeMap: Record<number, string> = {
          0: '公众号',
          1: '小程序',
          2: '企业微信'
        };
        const colorMap: Record<number, UI.ThemeColor> = {
          0: 'success',
          1: 'primary',
          2: 'warning'
        };
        return <ElTag type={colorMap[row.type]}>{typeMap[row.type] || row.type}</ElTag>;
      }
    },
    {
      prop: 'isActive',
      label: '是否启用',
      width: 100,
      formatter: row => <ElTag type={row.isActive ? 'success' : 'danger'}>{row.isActive ? '启用' : '禁用'}</ElTag>
    },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 150,
      formatter: row => (
        <div class="flex-center gap-8px">
          <ElButton type="primary" plain size="small" onClick={() => handleEdit(row)}>
            {$t('common.edit')}
          </ElButton>
          <ElPopconfirm title={$t('common.confirmDelete')} onConfirm={() => handleDelete(row.id)}>
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

const { checkedRowKeys, onBatchDeleted, onDeleted, handleAdd, handleEdit, drawerVisible, operateType, editingData } =
  useTableOperate(data, 'id', getData);

async function handleDelete(id: string) {
  await onDeleted(async () => {
    await fetchDeleteWechatAppConfig([id]);
  });
}

async function handleBatchDelete() {
  await onBatchDeleted(async () => {
    await fetchDeleteWechatAppConfig(checkedRowKeys.value);
  });
}

function handleReset() {
  pageRequest.search = {};
  getData();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <WechatAppConfigSearch v-model:model="pageRequest.search" @reset="handleReset" @search="getData" />
    <ElCard title="微信应用配置列表" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        />
      </template>
      <div class="h-[calc(100%-50px)]">
        <ElTable
          v-loading="loading"
          height="100%"
          border
          class="sm:h-full"
          :data="data"
          row-key="id"
          @selection-change="checkedRowKeys = $event"
        >
          <ElTableColumn v-for="col in columns" :key="col.prop" v-bind="col" />
        </ElTable>
      </div>
      <div class="mt-20px flex justify-end">
        <ElPagination
          v-if="mobilePagination.total"
          layout="total,prev,pager,next,sizes"
          v-bind="mobilePagination"
          @current-change="mobilePagination['current-change']"
          @size-change="mobilePagination['size-change']"
        />
      </div>
    </ElCard>
    <WechatAppConfigOperateDrawer
      v-model:visible="drawerVisible"
      :operate-type="operateType"
      :row-data="editingData"
      @submitted="getData"
    />
  </div>
</template>

<style scoped></style>
