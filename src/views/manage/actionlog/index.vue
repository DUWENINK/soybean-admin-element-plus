<script setup lang="tsx">
import { ref } from 'vue';
import { ElButton, ElPopconfirm, ElTag } from 'element-plus';
import { fetchGetActionLogList, fetchDeleteActionLog } from '@/service/api';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import ActionLogSearch from './modules/actionlog-search.vue';

defineOptions({ name: 'ActionLogManage' });

const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Api.SystemManage.ActionLogSearchParams {
  return {
    current: 1,
    size: 30,
    ITCode: undefined,
    ActionUrl: undefined,
    LogType: undefined,
    ActionTime: undefined,
    IP: undefined,
    Duration: undefined
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.current,
    pageSize: searchParams.value.size
  },
  api: () => fetchGetActionLogList(searchParams.value),
  transform: response => {
    return defaultTransform(response);
  },
  onPaginationParamsChange: params => {
    searchParams.value.current = params.currentPage;
    searchParams.value.size = params.pageSize;
  },
  columns: () => [
    { prop: 'selection', type: 'selection', width: 48 },
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    {
      prop: 'logType',
      label: $t('page.manage.actionlog.logType'),
      width: 100,
      formatter: row => {
        if (row.logType === undefined) return '';
        const typeMap: Record<number, string> = {
          0: $t('page.manage.actionlog.typeNormal'),
          1: $t('page.manage.actionlog.typeException'),
          2: $t('page.manage.actionlog.typeDebug')
        };
        const colorMap: Record<number, UI.ThemeColor> = {
          0: 'success',
          1: 'danger',
          2: 'warning'
        };
        return <ElTag type={colorMap[row.logType]}>{typeMap[row.logType] || row.logType}</ElTag>;
      }
    },
    { prop: 'moduleName', label: $t('page.manage.actionlog.moduleName'), minWidth: 120 },
    { prop: 'actionName', label: $t('page.manage.actionlog.actionName'), minWidth: 120 },
    { prop: 'iTCode', label: $t('page.manage.actionlog.account'), width: 100 },
    { prop: 'actionUrl', label: $t('page.manage.actionlog.url'), minWidth: 200 },
    { prop: 'actionTime', label: $t('page.manage.actionlog.actionTime'), width: 180 },
    {
      prop: 'duration',
      label: $t('page.manage.actionlog.duration'),
      width: 100,
      align: 'right',
      formatter: row => (row.duration !== undefined ? `${row.duration} ms` : '')
    },
    { prop: 'ip', label: $t('page.manage.actionlog.ip'), width: 130 },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 100,
      formatter: row => (
        <div class="flex-center gap-8px">
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

const { operateType, checkedRowKeys, onBatchDeleted, onDeleted, openDrawer } = useTableOperate(data, getData);

async function handleDelete(id: string) {
  await onDeleted(
    async () => {
      const result = await fetchDeleteActionLog([id]);
      return result;
    },
    () => $t('common.deleteSuccess')
  );
}

async function handleBatchDelete() {
  await onBatchDeleted(
    async () => {
      const result = await fetchDeleteActionLog(checkedRowKeys.value);
      return result;
    },
    () => $t('common.deleteSuccess')
  );
}

function handleReset() {
  searchParams.value = getInitSearchParams();
  getData();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ActionLogSearch v-model:model="searchParams" @reset="handleReset" @search="getData" />
    <NCard
      :title="$t('page.manage.actionlog.title')"
      :bordered="false"
      size="small"
      class="sm:flex-1-hidden card-wrapper"
    >
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="() => {}"
          @delete="handleBatchDelete"
          @refresh="getData"
        >
          <template #default="{ disabled, size }">
            <ElButton :disabled="disabled" :size="size" @click="handleBatchDelete">
              {{ $t('common.batchDelete') }}
            </ElButton>
          </template>
        </TableHeaderOperation>
      </template>
      <UIPaginatedTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        :loading="loading"
        :pagination="mobilePagination"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
