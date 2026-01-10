<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  fetchGetGenericLocalization,
  fetchGetSupportedCultures,
  fetchSaveGenericLocalization
} from '@/service/api';
import { $t } from '@/locales';

defineOptions({ name: 'GenericLocalizationEditor' });

interface Props {
  /** 资源键 */
  resourceKey: string;
  /** 本地化类型 */
  localizationType: Api.SystemManage.LocalizationType;
  /** 标题前缀 (可选,默认根据类型生成) */
  titlePrefix?: string;
  /** 是否显示描述字段 */
  showDescription?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showDescription: true
});

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const loading = ref(false);
const culturesLoading = ref(false);

// 语言显示名称映射 (可以从后端配置或本地配置)
const cultureDisplayNames: Record<string, string> = {
  'zh-CN': '简体中文',
  'en-US': 'English',
  'ja-JP': '日本語',
  'zh-TW': '繁體中文',
  'ko-KR': '한국어',
  'fr-FR': 'Français',
  'de-DE': 'Deutsch',
  'es-ES': 'Español',
  'it-IT': 'Italiano',
  'pt-BR': 'Português',
  'ru-RU': 'Русский'
};

// 翻译数据
interface Translation {
  culture: string;
  value: string;
  label: string;
}

const supportedCultures = ref<string[]>([]);
const defaultCulture = ref<string>('zh-CN');
const translations = ref<Translation[]>([]);
const description = ref('');

// 标题
const title = computed(() => {
  const typeLabels: Record<Api.SystemManage.LocalizationType, string> = {
    Menu: '菜单',
    Role: '角色',
    Exception: '异常',
    Enum: '枚举'
  };

  const prefix = props.titlePrefix || typeLabels[props.localizationType];
  return `编辑${prefix}多语言 - ${props.resourceKey}`;
});

// 加载支持的语言列表
async function loadSupportedCultures() {
  culturesLoading.value = true;
  try {
    const { data, error } = await fetchGetSupportedCultures();
    if (!error && data) {
      supportedCultures.value = data.SupportedCultures || [];
      defaultCulture.value = data.DefaultCulture || 'zh-CN';

      // 初始化翻译数组
      translations.value = supportedCultures.value.map(culture => ({
        culture,
        value: '',
        label: cultureDisplayNames[culture] || culture
      }));

      // 将默认语言排在第一位
      const defaultIndex = translations.value.findIndex(t => t.culture === defaultCulture.value);
      if (defaultIndex > 0) {
        const defaultTrans = translations.value.splice(defaultIndex, 1)[0];
        translations.value.unshift(defaultTrans);
      }
    }
  } catch (err) {
    console.error('Failed to load supported cultures:', err);
    // 使用默认语言列表作为后备
    translations.value = [
      { culture: 'zh-CN', value: '', label: '简体中文' },
      { culture: 'en-US', value: '', label: 'English' }
    ];
  } finally {
    culturesLoading.value = false;
  }
}

// 加载现有的翻译数据
async function loadTranslations() {
  if (!props.resourceKey) return;

  loading.value = true;
  try {
    const { data, error } = await fetchGetGenericLocalization(props.resourceKey, props.localizationType);
    if (!error && data) {
      description.value = data.description || '';

      // 更新翻译值
      if (data.translations && Array.isArray(data.translations)) {
        data.translations.forEach((t: any) => {
          const translation = translations.value.find(tr => tr.culture === t.culture);
          if (translation) {
            translation.value = t.value || '';
          }
        });
      }
    } else {
      // 如果资源不存在,清空翻译值
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

    const { error } = await fetchSaveGenericLocalization(
      {
        key: props.resourceKey,
        description: description.value,
        translations: translationsDict
      },
      props.localizationType
    );

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
watch(visible, async val => {
  if (val) {
    // 如果还没有加载过语言列表,先加载
    if (supportedCultures.value.length === 0) {
      await loadSupportedCultures();
    }
    // 然后加载翻译数据
    await loadTranslations();
  }
});

// 获取资源键的提示文本
const resourceKeyHint = computed(() => {
  const hints: Record<Api.SystemManage.LocalizationType, string> = {
    Menu: 'Menu.模块名.菜单名 (例如: Menu.System.UserManagement)',
    Role: 'Role.角色名 (例如: Role.Administrator)',
    Exception: 'Exception.异常类型 (例如: Exception.ValidationError)',
    Enum: 'Enum.枚举名.枚举值 (例如: Enum.Status.Active)'
  };
  return hints[props.localizationType];
});
</script>

<template>
  <ElDialog v-model="visible" :title="title" width="700px" :close-on-click-modal="false">
    <ElSkeleton v-if="culturesLoading || loading" :rows="5" animated />
    <div v-else>
      <ElForm label-position="right" :label-width="120">
        <ElFormItem label="资源键">
          <ElInput :model-value="resourceKey" disabled />
        </ElFormItem>

        <ElFormItem v-if="showDescription" label="描述">
          <ElInput v-model="description" type="textarea" :rows="2" placeholder="请输入描述信息(可选)" />
        </ElFormItem>

        <ElDivider content-position="left">
          <div class="flex items-center gap-8px">
            <icon-mdi:translate class="text-16px" />
            <span>翻译内容</span>
          </div>
        </ElDivider>

        <ElFormItem
          v-for="translation in translations"
          :key="translation.culture"
          :label="translation.label"
          :class="{ 'is-default-culture': translation.culture === defaultCulture }"
        >
          <ElInput
            v-model="translation.value"
            :placeholder="`请输入${translation.label}翻译`"
            clearable
          >
            <template v-if="translation.culture === defaultCulture" #prepend>
              <ElTag type="primary" size="small">默认</ElTag>
            </template>
          </ElInput>
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
              <p>• 资源键用于在系统中引用多语言文本</p>
              <p>• 建议格式: {{ resourceKeyHint }}</p>
              <p>• 至少需要填写一个语言的翻译</p>
              <p v-if="defaultCulture">• 默认语言: {{ cultureDisplayNames[defaultCulture] || defaultCulture }}</p>
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

.text-16px {
  font-size: 16px;
}

/* 高亮默认语言 */
.is-default-culture :deep(.el-form-item__label) {
  font-weight: 600;
  color: var(--el-color-primary);
}
</style>
