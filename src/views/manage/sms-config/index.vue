<script setup lang="tsx">
import { reactive, ref } from 'vue';
import { ElButton, ElPopconfirm } from 'element-plus';
import { fetchDeleteSmsConfig, fetchGetSmsConfig, fetchGetSmsConfigList } from '@/service/api';
import { useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import SystemEnumTag from '@/components/custom/system-enum-tag.vue';
import SmsConfigSearch from './modules/sms-config-search.vue';
import SmsConfigAddDrawer from './modules/sms-config-add-drawer.vue';
import SmsConfigEditDrawer from './modules/sms-config-edit-drawer.vue';
import SmsTestSendModal from './modules/sms-test-send-modal.vue';

defineOptions({ name: 'SmsConfigManage' });

const pageRequest = reactive<Api.SystemManage.SmsConfigPageRequest>({
  search: {},
  currentPage: 1,
  pageSize: 20,
  sortField: 'CreatedAt',
  sortType: 'desc'
});

const testVisible = ref(false);
const testAppType = ref<string | number | undefined>(undefined);

function openTest(appType?: string | number) {
  testAppType.value = appType;
  testVisible.value = true;
}

const { columns, columnChecks, data, getData, loading, mobilePagination } = useUIPaginatedTable<
  Api.SystemManage.SmsConfigList,
  Api.SystemManage.SmsConfig
>({
  paginationProps: {
    currentPage: pageRequest.currentPage,
    pageSize: pageRequest.pageSize
  },
  api: () => fetchGetSmsConfigList(pageRequest),
  onPaginationParamsChange: params => {
    pageRequest.currentPage = params.currentPage ?? pageRequest.currentPage;
    pageRequest.pageSize = params.pageSize ?? pageRequest.pageSize;
  },
  columns: () => [
    { prop: 'selection', type: 'selection', width: 48 },
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    {
      prop: 'appType',
      label: '应用类型',
      width: 120,
      formatter: row => <SystemEnumTag enumName="AppType" value={row.appType} />
    },
    {
      prop: 'provider',
      label: '服务商',
      width: 120,
      formatter: row => <SystemEnumTag enumName="SmsProviderType" value={row.provider} />
    },
    { prop: 'appId', label: 'AppId/AccessKeyId', minWidth: 140 },
    { prop: 'signName', label: '签名名称', minWidth: 120 },
    { prop: 'sdkAppId', label: 'SDK AppId', minWidth: 120 },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 220,
      formatter: row => (
        <div class="flex-center gap-8px">
          <ElButton type="success" plain size="small" onClick={() => openTest(row.appType)}>
            {$t('page.manage.smsConfig.testSend')}
          </ElButton>
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
    await fetchDeleteSmsConfig([id]);
  });
}

async function handleEdit(row: Api.SystemManage.SmsConfig) {
  operateType.value = 'edit';
  const editData = await fetchGetSmsConfig(row.id);
  if (editData) {
    editingData.value = editData;
    drawerVisible.value = true;
  }
}

async function handleBatchDelete() {
  await onBatchDeleted(async () => {
    await fetchDeleteSmsConfig(checkedRowKeys.value);
  });
}

function handleReset() {
  pageRequest.search = {};
  getData();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <SmsConfigSearch v-model:model="pageRequest.search" @reset="handleReset" @search="getData" />
    <ElCard class="card-wrapper sm:flex-1-hidden" body-class="ht50" :bordered="false" size="small">
      <template #header>
        <div class="flex items-center justify-between">
          <p>短信配置列表</p>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading"
            @add="handleAdd"
            @delete="handleBatchDelete"
            @refresh="getData"
          >
            <template #prefix>
              <ElButton type="success" plain @click="openTest()">
                {{ $t('page.manage.smsConfig.testSend') }}
              </ElButton>
            </template>
          </TableHeaderOperation>
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
    <SmsConfigAddDrawer v-if="operateType === 'add'" v-model:visible="drawerVisible" @submitted="getData" />
    <SmsConfigEditDrawer
      v-if="operateType === 'edit'"
      v-model:visible="drawerVisible"
      :id="editingData?.id"
      @submitted="getData"
    />
    <SmsTestSendModal v-model:visible="testVisible" :initial-app-type="testAppType" />
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-card) {
  .ht50 {
    height: calc(100% - 50px);
  }
}
</style>
