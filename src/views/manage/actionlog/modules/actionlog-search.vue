<script setup lang="ts">
import { computed } from 'vue';
import { $t } from '@/locales';

defineOptions({ name: 'ActionLogSearch' });

interface Props {
  model: Api.SystemManage.ActionLogSearchParams;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  reset: [];
  search: [];
}>();

const model = defineModel<Api.SystemManage.ActionLogSearchParams>('model', { required: true });

function reset() {
  emit('reset');
}

function search() {
  emit('search');
}
</script>

<template>
  <ElCard :title="$t('common.search')" :bordered="false" size="small" class="card-wrapper">
    <ElCollapse>
      <ElCollapseItem :title="$t('common.search')" name="user-search">
        <ElForm :model="model" label-width="80px">
          <ElRow :gutter="24">
            <ElCol :span="6">
              <ElFormItem :label="$t('page.manage.actionlog.account')">
                <ElInput v-model="model.ITCode" :placeholder="$t('page.manage.actionlog.accountPlaceholder')"
                  clearable />
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem :label="$t('page.manage.actionlog.url')">
                <ElInput v-model="model.ActionUrl" :placeholder="$t('page.manage.actionlog.urlPlaceholder')"
                  clearable />
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem :label="$t('page.manage.actionlog.ip')">
                <ElInput v-model="model.IP" :placeholder="$t('page.manage.actionlog.ipPlaceholder')" clearable />
              </ElFormItem>
            </ElCol>

            <ElCol :span="12">
              <ElFormItem :label="$t('page.manage.actionlog.actionTime')">
                <ElDatePicker v-model="model.ActionTime" type="datetimerange" :range-separator="$t('common.to')"
                  :start-placeholder="$t('common.startDate')" :end-placeholder="$t('common.endDate')"
                  value-format="YYYY-MM-DDTHH:mm:ssZ" format="YYYY-MM-DD HH:mm:ss" class="w-full" clearable :shortcuts="[
                    {
                      text: $t('page.manage.actionlog.lastHour'),
                      value: () => {
                        const end = new Date();
                        const start = new Date();
                        start.setHours(start.getHours() - 1);
                        return [start, end];
                      }
                    },
                    {
                      text: $t('page.manage.actionlog.today'),
                      value: () => {
                        const end = new Date();
                        const start = new Date();
                        start.setHours(0, 0, 0, 0);
                        return [start, end];
                      }
                    },
                    {
                      text: $t('page.manage.actionlog.last7Days'),
                      value: () => {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(start.getDate() - 7);
                        return [start, end];
                      }
                    }
                  ]" />
              </ElFormItem>
            </ElCol>
            <ElCol :lg="12" :md="24" :sm="24">
              <ElSpace class="w-full justify-end" alignment="end">
                <ElButton @click="reset">
                  <template #icon>
                    <icon-ic-round-refresh class="text-icon" />
                  </template>
                  {{ $t('common.reset') }}
                </ElButton>
                <ElButton type="primary" plain @click="search">
                  <template #icon>
                    <icon-ic-round-search class="text-icon" />
                  </template>
                  {{ $t('common.search') }}
                </ElButton>
              </ElSpace>
            </ElCol>
          </ElRow>
        </ElForm>
      </ElCollapseItem>
    </ElCollapse>
  </ElCard>
</template>

<style scoped></style>
