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
  { culture: 'zh-CN', value: '', label: $t('page.manage.menu.localization.languageZhCN') },
  { culture: 'en-US', value: '', label: $t('page.manage.menu.localization.languageEnUS') }
]);

const description = ref('');

// 标题
const title = computed(() => `${$t('page.manage.menu.localization.editTitle')} - ${props.resourceKey}`);

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
    window.$message?.error($t('page.manage.menu.localization.requireTranslation'));
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
      window.$message?.success($t('page.manage.menu.localization.saveSuccess'));
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
        <ElFormItem :label="$t('page.manage.menu.localization.resourceKey')">
          <ElInput :model-value="resourceKey" disabled />
        </ElFormItem>

        <ElFormItem :label="$t('page.manage.menu.localization.description')">
          <ElInput
            v-model="description"
            type="textarea"
            :rows="2"
            :placeholder="$t('page.manage.menu.localization.descriptionPlaceholder')"
          />
        </ElFormItem>

        <ElDivider content-position="left">{{ $t('page.manage.menu.localization.translationContent') }}</ElDivider>

        <ElFormItem v-for="translation in translations" :key="translation.culture" :label="translation.label">
          <ElInput
            v-model="translation.value"
            :placeholder="$t('page.manage.menu.localization.translationPlaceholder', { lang: translation.label })"
            clearable
          />
        </ElFormItem>

        <ElAlert
          :title="$t('page.manage.menu.localization.tipTitle')"
          type="info"
          :closable="false"
          show-icon
          class="mb-16px"
        >
          <template #default>
            <div class="text-12px">
              <p>• {{ $t('page.manage.menu.localization.tipResourceKey') }}</p>
              <p>• {{ $t('page.manage.menu.localization.tipFormat') }}</p>
              <p>• {{ $t('page.manage.menu.localization.tipRequired') }}</p>
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
