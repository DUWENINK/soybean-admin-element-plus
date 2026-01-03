<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { $t } from '@/locales';
import { fetchAddCache, fetchUpdateCache } from '@/service/api';

defineOptions({ name: 'CacheOperateDrawer' });

interface Props {
  operateType: UI.TableOperateType;
  rowData?: string | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const title = computed(() => {
  const titles: Record<UI.TableOperateType, string> = {
    add: $t('page.manage.cache.addCache'),
    edit: $t('page.manage.cache.editCache')
  };
  return titles[props.operateType];
});

type Model = Pick<Api.SystemManage.CacheItem, 'key' | 'value' | 'valueType' | 'expirationSeconds'>;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    key: '',
    value: '',
    valueType: 'json',
    expirationSeconds: undefined
  };
}

type RuleKey = Extract<keyof Model, 'key' | 'value'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  key: {
    required: true,
    message: $t('page.manage.cache.form.key.required')
  },
  value: {
    required: true,
    message: $t('page.manage.cache.form.value.required')
  }
};

const valueTypeOptions = [
  { value: 'json', label: 'JSON' },
  { value: 'string', label: $t('page.manage.cache.valueTypeString') },
  { value: 'number', label: $t('page.manage.cache.valueTypeNumber') },
  { value: 'boolean', label: $t('page.manage.cache.valueTypeBoolean') }
];

function handleInitModel() {
  Object.assign(model, createDefaultModel());

  if (props.operateType === 'edit' && props.rowData) {
    // Edit mode - rowData is the cache key
    // We need to fetch the full data or pass it from parent
    model.key = props.rowData;
    // In a real scenario, you would fetch the cache details here
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  try {
    if (props.operateType === 'add') {
      await fetchAddCache(model);
      ElMessage.success($t('common.addSuccess'));
    } else {
      await fetchUpdateCache(model);
      ElMessage.success($t('common.updateSuccess'));
    }
    closeDrawer();
    emit('submitted');
  } catch (error) {
    console.error('提交失败:', error);
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
  }
});
</script>

<template>
  <ElDrawer
    v-model="visible"
    :title="title"
    :size="600"
    @close="closeDrawer"
  >
    <ElForm :model="model" :rules="rules" label-width="120px">
      <ElFormItem :label="$t('page.manage.cache.key')" prop="key">
        <ElInput
          v-model="model.key"
          :placeholder="$t('page.manage.cache.form.key.placeholder')"
          :disabled="operateType === 'edit'"
        />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.cache.valueType')" prop="valueType">
        <ElSelect v-model="model.valueType" :placeholder="$t('page.manage.cache.form.valueType.placeholder')">
          <ElOption v-for="item in valueTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.cache.value')" prop="value">
        <ElInput
          v-model="model.value"
          type="textarea"
          :rows="10"
          :placeholder="$t('page.manage.cache.form.value.placeholder')"
        />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.cache.expirationSeconds')">
        <ElInputNumber
          v-model="model.expirationSeconds"
          :min="0"
          :placeholder="$t('page.manage.cache.form.expirationSeconds.placeholder')"
          class="w-full"
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="flex justify-end gap-12px">
        <ElButton @click="closeDrawer">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </div>
    </template>
  </ElDrawer>
</template>

<style scoped></style>
