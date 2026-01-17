<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useForm, useFormRules } from '@/hooks/common/form';
import { fetchAddWechatAppConfig, fetchUpdateWechatAppConfig } from '@/service/api';
import { $t } from '@/locales';
import { ElMessage } from 'element-plus';
import SystemEnumSelect from '@/components/custom/system-enum-select.vue';

defineOptions({ name: 'WechatAppConfigOperateDrawer' });

interface Props {
  operateType: UI.TableOperateType;
  rowData?: Api.SystemManage.WechatAppConfig | null;
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

const title = computed(() => {
  const titles: Record<UI.TableOperateType, string> = {
    add: '添加应用配置',
    edit: '编辑应用配置'
  };
  return titles[props.operateType];
});

type Model = Api.SystemManage.WechatAppConfig;

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    id: '',
    name: '',
    appId: '',
    appSecret: '',
    token: '',
    encodingAESKey: '',
    type: 0,
    isActive: true
  };
}

const rules = {
  name: defaultRequiredRule,
  appId: defaultRequiredRule,
  appSecret: defaultRequiredRule,
  type: defaultRequiredRule
};

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model.value, props.rowData);
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  
  const func = props.operateType === 'add' ? fetchAddWechatAppConfig : fetchUpdateWechatAppConfig;
  const { error } = await func(model.value);

  if (!error) {
    ElMessage.success($t('common.updateSuccess'));
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
  <ElDrawer v-model="visible" :title="title" :size="360">
    <ElForm ref="formRef" :model="model" :rules="rules" label-position="top">
      <ElFormItem label="应用名称" prop="name">
        <ElInput v-model="model.name" placeholder="请输入应用名称" />
      </ElFormItem>
      <ElFormItem label="AppId" prop="appId">
        <ElInput v-model="model.appId" placeholder="请输入AppId" />
      </ElFormItem>
      <ElFormItem label="AppSecret" prop="appSecret">
        <ElInput v-model="model.appSecret" placeholder="请输入AppSecret" type="password" show-password />
      </ElFormItem>
      <ElFormItem label="Token" prop="token">
        <ElInput v-model="model.token" placeholder="请输入Token" />
      </ElFormItem>
      <ElFormItem label="EncodingAESKey" prop="encodingAESKey">
        <ElInput v-model="model.encodingAESKey" placeholder="请输入EncodingAESKey" />
      </ElFormItem>
      <ElFormItem label="应用类型" prop="type">
        <SystemEnumSelect v-model="model.type" enum-name="WechatAppType" placeholder="请选择应用类型" />
      </ElFormItem>
      <ElFormItem label="是否启用" prop="isActive">
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
