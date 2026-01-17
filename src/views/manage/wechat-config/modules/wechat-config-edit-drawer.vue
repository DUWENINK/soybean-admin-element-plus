<script setup lang="ts">
import { ref, watch } from 'vue';
import { fetchGetWechatAppConfig, fetchUpdateWechatAppConfig } from '@/service/api';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
import SystemEnumSelect from '@/components/custom/system-enum-select.vue';

defineOptions({ name: 'WechatAppConfigEditDrawer' });

interface Props {
  id: string;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useForm();
const { defaultRequiredRule } = useFormRules();

type EditModel = Omit<Api.SystemManage.WechatAppConfig, keyof Api.Common.AuditRecord>;

const model = ref<EditModel>({} as EditModel);

const rules = {
  name: defaultRequiredRule,
  appId: defaultRequiredRule,
  appSecret: defaultRequiredRule,
  type: defaultRequiredRule
};

async function handleInitModel() {
  const data = await fetchGetWechatAppConfig(props.id);
  if (data) {
    model.value = data;
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  const data = await fetchUpdateWechatAppConfig(model.value);

  if (data) {
    window.$message?.success($t('common.updateSuccess'));
    closeDrawer();
    emit('submitted');
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
  }
});
</script>

<template>
  <ElDrawer v-model="visible" :title="$t('page.manage.wechatConfig.edit')" :size="360">
    <ElForm ref="formRef" :model="model" :rules="rules" label-position="top">
      <ElFormItem :label="$t('page.manage.wechatConfig.name')" prop="name">
        <ElInput v-model="model.name" :placeholder="$t('page.manage.wechatConfig.form.name')" />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.wechatConfig.appId')" prop="appId">
        <ElInput v-model="model.appId" :placeholder="$t('page.manage.wechatConfig.form.appId')" />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.wechatConfig.appSecret')" prop="appSecret">
        <ElInput v-model="model.appSecret" :placeholder="$t('page.manage.wechatConfig.form.appSecret')" type="password" show-password />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.wechatConfig.token')" prop="token">
        <ElInput v-model="model.token" :placeholder="$t('page.manage.wechatConfig.form.token')" />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.wechatConfig.encodingAESKey')" prop="encodingAESKey">
        <ElInput v-model="model.encodingAESKey" :placeholder="$t('page.manage.wechatConfig.form.encodingAESKey')" />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.wechatConfig.type')" prop="type">
        <SystemEnumSelect
          v-model="model.type"
          enum-name="WechatAppType"
          :placeholder="$t('page.manage.wechatConfig.form.type')"
          value-type="number"
        />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.wechatConfig.isActive')" prop="isActive">
        <ElSwitch v-model="model.isActive" />
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
