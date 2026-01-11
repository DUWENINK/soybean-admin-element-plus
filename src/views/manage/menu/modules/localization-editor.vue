<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { fetchGetMenuLocalization, fetchSaveMenuLocalization } from '@/service/api';
import { $t } from '@/locales';

defineOptions({ name: 'LocalizationEditor' });

interface Props {
  /** 资源键（菜单的 Name 字段） */
  resourceKey: string;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const loading = ref(false);

// 翻译数据
interface Translation {
  culture: string;
  value: string;
  label: string;
}

const translations = ref<Translation[]>([
  { culture: 'zh-CN', value: '', label: '简体中文' },
  { culture: 'en-US', value: '', label: 'English' }
]);

const description = ref('');

// 标题
const title = computed(() => `编辑菜单多语言 - ${props.resourceKey}`);

// 加载现有的翻译数据
async function loadTranslations() {
  if (!props.resourceKey) return;

  loading.value = true;
  try {
    const { data, error } = await fetchGetMenuLocalization(props.resourceKey);
    if (!error && data) {
      // 后端字段可能是大写（PascalCase）或小写（camelCase）
      const desc = (data as any).Description || (data as any).description || '';
      description.value = desc;

      // 更新翻译值 - 后端返回数组格式: [{ culture: "zh-CN", value: "首页" }, ...]
      // 兼容大写 Translations 和小写 translations
      const trans = (data as any).Translations || (data as any).translations;
      if (trans && Array.isArray(trans)) {
        trans.forEach((t: any) => {
          // 兼容大写 Culture/Value 和小写 culture/value
          const cultureName = t.Culture || t.culture;
          const translationValue = t.Value || t.value;
          const translation = translations.value.find(tr => tr.culture === cultureName);
          if (translation) {
            translation.value = translationValue || '';
          }
        });
      }
    } else {
      // 如果资源不存在，清空翻译值
      translations.value.forEach(t => {
        t.value = '';
      });
      description.value = '';
    }
  } finally {
    loading.value = false;
  }
}

// 保存翻译
async function handleSave() {
  // 验证至少有一个翻译不为空
  const hasTranslation = translations.value.some(t => t.value.trim() !== '');
  if (!hasTranslation) {
    window.$message?.error('请至少填写一个语言的翻译');
    return;
  }

  loading.value = true;
  try {
    const translationsDict: Record<string, string> = {};
    translations.value.forEach(t => {
      if (t.value.trim()) {
        translationsDict[t.culture] = t.value;
      }
    });

    const { error } = await fetchSaveMenuLocalization({
      key: props.resourceKey,
      description: description.value,
      translations: translationsDict
    });

    if (!error) {
      window.$message?.success('保存成功');
      closeModal();
      emit('submitted');
    }
  } finally {
    loading.value = false;
  }
}

function closeModal() {
  visible.value = false;
}

// 监听弹窗打开
watch(visible, val => {
  if (val) {
    loadTranslations();
  }
});
</script>

<template>
  <ElDialog v-model="visible" :title="title" width="600px" :close-on-click-modal="false">
    <ElSkeleton v-if="loading" :rows="5" animated />
    <div v-else>
      <ElForm label-position="right" :label-width="120">
        <ElFormItem label="资源键">
          <ElInput :model-value="resourceKey" disabled />
        </ElFormItem>

        <ElFormItem label="描述">
          <ElInput v-model="description" type="textarea" :rows="2" placeholder="请输入描述信息（可选）" />
        </ElFormItem>

        <ElDivider content-position="left">翻译内容</ElDivider>

        <ElFormItem v-for="translation in translations" :key="translation.culture" :label="translation.label">
          <ElInput
            v-model="translation.value"
            :placeholder="`请输入${translation.label}翻译`"
            clearable
          />
        </ElFormItem>

        <ElAlert
          title="提示"
          type="info"
          :closable="false"
          show-icon
          class="mb-16px"
        >
          <template #default>
            <div class="text-12px">
              <p>• 资源键用于在菜单中引用多语言文本</p>
              <p>• 建议格式: Menu.模块名.菜单名 (例如: Menu.System.UserManagement)</p>
              <p>• 至少需要填写一个语言的翻译</p>
            </div>
          </template>
        </ElAlert>
      </ElForm>
    </div>

    <template #footer>
      <ElSpace :size="16" class="float-right">
        <ElButton @click="closeModal">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSave">{{ $t('common.save') }}</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style scoped>
.mb-16px {
  margin-bottom: 16px;
}

.text-12px {
  font-size: 12px;
  line-height: 1.6;
}

.text-12px p {
  margin: 0;
  padding: 2px 0;
}
</style>
