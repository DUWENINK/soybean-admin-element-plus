<script setup lang="tsx">
import { reactive } from 'vue';
import { ElButton, ElPopconfirm } from 'element-plus';
import { fetchDeleteWechatAppConfig, fetchGetWechatAppConfig, fetchGetWechatAppConfigList } from '@/service/api';
import { useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import SystemEnumTag from '@/components/custom/system-enum-tag.vue';
import StatusTag from '@/components/custom/status-tag.vue';
import WechatAppConfigSearch from './modules/wechat-config-search.vue';
import WechatAppConfigAddDrawer from './modules/wechat-config-add-drawer.vue';
import WechatAppConfigEditDrawer from './modules/wechat-config-edit-drawer.vue';

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
      formatter: row => <SystemEnumTag enumName="WechatAppType" value={row.type} />
    },
    {
      prop: 'isActive',
      label: '是否启用',
      width: 100,
      formatter: row => <StatusTag value={row.isActive} />
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

const { checkedRowKeys, onBatchDeleted, onDeleted, handleAdd, drawerVisible, operateType, editingData } =
  useTableOperate(data, 'id', getData);

async function handleDelete(id: string) {
  await onDeleted(async () => {
    await fetchDeleteWechatAppConfig([id]);
  });
}

async function handleEdit(row: Api.SystemManage.WechatAppConfig) {
  operateType.value = 'edit';
  const editData = await fetchGetWechatAppConfig(row.id);
  if (editData) {
    editingData.value = editData;
    drawerVisible.value = true;
  }
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
    <ElCard class="card-wrapper sm:flex-1-hidden" body-class="ht50" :bordered="false" size="small">
      <template #header>
        <div class="flex items-center justify-between">
          <p>微信应用配置列表</p>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading"
            @add="handleAdd"
            @delete="handleBatchDelete"
            @refresh="getData"
          />
        </div>
      </template>
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
    <WechatAppConfigAddDrawer
      v-if="operateType === 'add'"
      v-model:visible="drawerVisible"
      @submitted="getData"
    />
    <WechatAppConfigEditDrawer
      v-if="operateType === 'edit'"
      v-model:visible="drawerVisible"
      :id="editingData?.id"
      @submitted="getData"
    />
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-card) {
  .ht50 {
    height: calc(100% - 50px);
  }
}
</style>
