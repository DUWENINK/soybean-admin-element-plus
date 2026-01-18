<script setup lang="ts">
import { $t } from '@/locales';
import SystemEnumSelect from '@/components/custom/system-enum-select.vue';

defineOptions({ name: 'SmsLogSearch' });

const emit = defineEmits<{
  reset: [];
  search: [];
}>();

const model = defineModel<Api.SystemManage.SmsLogSearch>('model', { required: true });

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
      <ElCollapseItem :title="$t('common.search')" name="sms-log-search">
        <ElForm :model="model" label-width="80px">
          <ElRow :gutter="24">
            <ElCol :span="6">
              <ElFormItem label="手机号">
                <ElInput v-model="model.phoneNumber" placeholder="请输入手机号" clearable />
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem label="发送状态">
                <ElSelect v-model="model.success" placeholder="请选择状态" clearable>
                  <ElOption label="成功" :value="true" />
                  <ElOption label="失败" :value="false" />
                </ElSelect>
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
