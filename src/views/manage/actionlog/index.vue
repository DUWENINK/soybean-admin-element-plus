<script setup lang="tsx">
import { reactive } from 'vue';
import { ElButton, ElPopconfirm, ElTag } from 'element-plus';
import { fetchDeleteActionLog, fetchGetActionLogList } from '@/service/api';
import { useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import ActionLogSearch from './modules/actionlog-search.vue';

defineOptions({ name: 'ActionLogManage' });

const pageRequest = reactive<Api.SystemManage.ActionLogPageRequest>({
  search: {},
  currentPage: 1,
  pageSize: 30,
  sortField: 'ActionTime',
  sortType: 'desc'
});

const { columns, columnChecks, data, getData, loading, mobilePagination } = useUIPaginatedTable<
  Api.SystemManage.ActionLogList,
  Api.SystemManage.ActionLog
>({
  paginationProps: {
    currentPage: pageRequest.currentPage,
    pageSize: pageRequest.pageSize
  },
  api: () => fetchGetActionLogList(pageRequest),
  onPaginationParamsChange: params => {
    pageRequest.currentPage = params.currentPage ?? pageRequest.currentPage;
    pageRequest.pageSize = params.pageSize ?? pageRequest.pageSize;
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
    { prop: 'itCode', label: $t('page.manage.actionlog.account'), width: 100 },
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

const { checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, 'id', getData);

async function handleDelete(id: string) {
  await onDeleted(async () => {
    await fetchDeleteActionLog([id]);
  });
}

async function handleBatchDelete() {
  await onBatchDeleted(async () => {
    await fetchDeleteActionLog(checkedRowKeys.value);
  });
}

function handleReset() {
  pageRequest.search = {};
  getData();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ActionLogSearch v-model:model="pageRequest.search" @reset="handleReset" @search="getData" />
    <ElCard
      :title="$t('page.manage.actionlog.title')"
      :bordered="false"
      size="small"
      class="card-wrapper sm:flex-1-hidden"
    >
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="() => {}"
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
  </div>
</template>

<style scoped></style>
