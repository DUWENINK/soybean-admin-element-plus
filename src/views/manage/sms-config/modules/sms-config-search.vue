<script setup lang="ts">
import { $t } from '@/locales';
import SystemEnumSelect from '@/components/custom/system-enum-select.vue';

defineOptions({ name: 'SmsConfigSearch' });

const emit = defineEmits<{
  reset: [];
  search: [];
}>();

const model = defineModel<Api.SystemManage.SmsConfigSearch>('model', { required: true });

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
      <ElCollapseItem :title="$t('common.search')" name="sms-config-search">
        <ElForm :model="model" label-width="80px">
          <ElRow :gutter="24">
            <ElCol :span="6">
              <ElFormItem label="应用类型">
                <SystemEnumSelect v-model="model.appType" enum-name="AppType" placeholder="请选择应用类型" value-type="number" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem label="服务商">
                <SystemEnumSelect
                  v-model="model.provider"
                  enum-name="SmsProviderType"
                  placeholder="请选择服务商"
                  value-type="number"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem label="AppId/AccessKeyId">
                <ElInput v-model="model.appId" placeholder="请输入AppId/AccessKeyId" clearable />
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem label="签名名称">
                <ElInput v-model="model.signName" placeholder="请输入签名名称" clearable />
              </ElFormItem>
            </ElCol>
            <ElCol :span="24">
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

