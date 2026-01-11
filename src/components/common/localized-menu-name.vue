<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'LocalizedMenuName' });

interface Props {
  /** 菜单Key */
  menuKey: string;
  /** 本地化名称 */
  localizedName?: string;
  /** 是否只显示本地化名称（不显示key） */
  localizedOnly?: boolean;
  /** 本地化名称和key之间的分隔符 */
  separator?: string;
  /** 当没有本地化名称时是否显示key */
  showKeyWhenEmpty?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  localizedOnly: false,
  separator: ' ',
  showKeyWhenEmpty: true
});

// 显示的文本
const displayText = computed(() => {
  // 如果有本地化名称
  if (props.localizedName) {
    if (props.localizedOnly) {
      return props.localizedName;
    }
    return `${props.localizedName}${props.separator}(${props.menuKey})`;
  }

  // 如果没有本地化名称
  return props.showKeyWhenEmpty ? props.menuKey : '';
});

const hasLocalizedName = computed(() => !!props.localizedName);
</script>

<template>
  <span class="localized-menu-name">
    <template v-if="hasLocalizedName">
      <span class="localized-text">{{ localizedName }}</span>
      <span v-if="!localizedOnly" class="separator">{{ separator }}</span>
      <span v-if="!localizedOnly" class="menu-key">({{ menuKey }})</span>
    </template>
    <span v-else-if="showKeyWhenEmpty" class="menu-key-only">{{ menuKey }}</span>
  </span>
</template>

<style scoped>
.localized-menu-name {
  display: inline-flex;
  align-items: center;
}

.localized-text {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.menu-key {
  font-size: 0.85em;
  color: var(--el-text-color-secondary);
}

.menu-key-only {
  color: var(--el-text-color-primary);
}

.separator {
  margin: 0 2px;
  color: var(--el-text-color-secondary);
}
</style>
