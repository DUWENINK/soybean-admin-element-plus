import { ref } from 'vue';
import { fetchGetSupportedCultures } from '@/service/api';

/**
 * 语言显示名称映射
 * 可根据需要扩展更多语言
 */
const LOCALE_DISPLAY_NAMES: Record<string, string> = {
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
  'ru-RU': 'Русский',
  'ar-SA': 'العربية',
  'th-TH': 'ไทย',
  'vi-VN': 'Tiếng Việt'
};

/**
 * 获取语言的显示名称
 * @param locale - 语言代码 (如 'zh-CN', 'en-US')
 * @returns 显示名称
 */
export function getLocaleDisplayName(locale: string): string {
  return LOCALE_DISPLAY_NAMES[locale] || locale;
}

/**
 * 从后端获取支持的语言列表
 */
export function useSupportedLocales() {
  const loading = ref(false);
  const defaultLocale = ref<string>('zh-CN');
  const supportedCultures = ref<string[]>([]);
  const localeOptions = ref<App.I18n.LangOption[]>([]);

  /**
   * 获取后备语言配置
   */
  function getFallbackLocaleConfig() {
    const fallbackOptions: App.I18n.LangOption[] = [
      { key: 'zh-CN', label: '简体中文' },
      { key: 'en-US', label: 'English' }
    ];

    localeOptions.value = fallbackOptions;
    defaultLocale.value = 'zh-CN';
    supportedCultures.value = ['zh-CN', 'en-US'];

    return {
      defaultLocale: defaultLocale.value,
      supportedCultures: supportedCultures.value,
      localeOptions: localeOptions.value
    };
  }

  /**
   * 加载支持的语言列表
   */
  async function loadSupportedCultures() {
    loading.value = true;
    try {
      const data = await fetchGetSupportedCultures();
      if (data) {
        defaultLocale.value = data.defaultCulture || 'zh-CN';
        supportedCultures.value = data.supportedCultures || [];

        // 转换为语言选项
        localeOptions.value = supportedCultures.value.map(culture => ({
          key: culture as App.I18n.LangType,
          label: getLocaleDisplayName(culture)
        }));

        // 将默认语言排在第一位
        const defaultIndex = localeOptions.value.findIndex(opt => opt.key === defaultLocale.value);
        if (defaultIndex > 0) {
          const defaultOpt = localeOptions.value.splice(defaultIndex, 1)[0];
          localeOptions.value.unshift(defaultOpt);
        }

        return {
          defaultLocale: defaultLocale.value,
          supportedCultures: supportedCultures.value,
          localeOptions: localeOptions.value
        };
      }

      // 如果请求失败,返回默认配置
      return getFallbackLocaleConfig();
    } catch (err) {
      console.error('Failed to load supported cultures:', err);
      return getFallbackLocaleConfig();
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    defaultLocale,
    supportedCultures,
    localeOptions,
    loadSupportedCultures,
    getFallbackLocaleConfig
  };
}
