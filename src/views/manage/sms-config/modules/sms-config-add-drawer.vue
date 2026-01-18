<script setup lang="ts">
import { ref, watch } from 'vue';
import { fetchAddSmsConfig } from '@/service/api';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
import SystemEnumSelect from '@/components/custom/system-enum-select.vue';
import TemplateIdMapEditor from './template-id-map-editor.vue';

defineOptions({ name: 'SmsConfigAddDrawer' });

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useForm();
const { defaultRequiredRule } = useFormRules();

type AddModel = Omit<Api.SystemManage.SmsConfig, keyof Api.Common.AuditRecord | keyof Api.Common.BaseRecord>;

const model = ref<AddModel>({} as AddModel);

const rules = {
  appType: defaultRequiredRule,
  provider: defaultRequiredRule,
  appId: defaultRequiredRule,
  appSecret: defaultRequiredRule,
  signName: defaultRequiredRule
};

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  const data = await fetchAddSmsConfig(model.value);

  if (data) {
    window.$message?.success($t('common.addSuccess'));
    closeDrawer();
    emit('submitted');
  }
}

watch(visible, () => {
  if (visible.value) {
    restoreValidation();
  }
});
</script>

<template>
  <ElDrawer v-model="visible" :title="$t('page.manage.smsConfig.add')" :size="420">
    <ElForm ref="formRef" :model="model" :rules="rules" label-position="top">
      <ElFormItem :label="$t('page.manage.smsConfig.appType')" prop="appType">
        <SystemEnumSelect
          v-model="model.appType"
          enum-name="AppType"
          :placeholder="$t('page.manage.smsConfig.form.appType')"
          value-type="number"
        />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.smsConfig.provider')" prop="provider">
        <SystemEnumSelect
          v-model="model.provider"
          enum-name="SmsProviderType"
          :placeholder="$t('page.manage.smsConfig.form.provider')"
          value-type="number"
        />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.smsConfig.appId')" prop="appId">
        <ElInput v-model="model.appId" :placeholder="$t('page.manage.smsConfig.form.appId')" />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.smsConfig.appSecret')" prop="appSecret">
        <ElInput
          v-model="model.appSecret"
          :placeholder="$t('page.manage.smsConfig.form.appSecret')"
          type="password"
          show-password
        />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.smsConfig.signName')" prop="signName">
        <ElInput v-model="model.signName" :placeholder="$t('page.manage.smsConfig.form.signName')" />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.smsConfig.sdkAppId')" prop="sdkAppId">
        <ElInput v-model="model.sdkAppId" :placeholder="$t('page.manage.smsConfig.form.sdkAppId')" />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.smsConfig.templateIdMap')" prop="templateIdMap">
        <TemplateIdMapEditor v-model:model-value="model.templateIdMap" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElSpace :size="16">
        <ElButton @click="closeDrawer">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDrawer>
</template>

<style scoped></style>
