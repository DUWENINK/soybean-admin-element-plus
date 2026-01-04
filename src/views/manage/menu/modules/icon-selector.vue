<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { $t } from '@/locales';

defineOptions({ name: 'IconSelector' });

interface Props {
  /** current selected icon */
  currentIcon?: string;
}

const props = withDefaults(defineProps<Props>(), { currentIcon: '' });

interface Emits {
  (e: 'select', iconName: string): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', { default: false });

const searchKeyword = ref('');
const currentIcon = ref(props.currentIcon);
const scrollContainer = ref<HTMLElement>();

// Collect all Element Plus icons
const allIcons = Object.entries(ElementPlusIconsVue).map(([name, component]) => ({
  name,
  component
}));

// Filter icons by search keyword
const filteredIcons = computed(() => {
  if (!searchKeyword.value) return allIcons;
  return allIcons.filter(icon => icon.name.toLowerCase().includes(searchKeyword.value.toLowerCase()));
});

// Virtual scroll configuration
const itemsPerRow = 10;
const itemHeight = 70;
const containerHeight = 400;
const bufferSize = 3;

// Scroll state
const scrollTop = ref(0);

// Virtual scroll calculation
const virtualData = computed(() => {
  const icons = filteredIcons.value;
  const totalRows = Math.ceil(icons.length / itemsPerRow);

  const startRow = Math.max(0, Math.floor(scrollTop.value / itemHeight) - bufferSize);
  const endRow = Math.min(totalRows, Math.ceil((scrollTop.value + containerHeight) / itemHeight) + bufferSize);

  const visibleRows = [];
  for (let i = startRow; i < endRow; i++) {
    const startIndex = i * itemsPerRow;
    const endIndex = Math.min(startIndex + itemsPerRow, icons.length);
    const rowIcons = icons.slice(startIndex, endIndex);

    visibleRows.push({
      index: i,
      top: i * itemHeight,
      icons: rowIcons
    });
  }

  return {
    totalHeight: totalRows * itemHeight,
    visibleRows,
    totalRows
  };
});

// Handle scroll event
function handleScroll(event: Event) {
  const target = event.target as HTMLElement;
  scrollTop.value = target.scrollTop;
}

// Sync external props
watch(
  () => props.currentIcon,
  newVal => {
    currentIcon.value = newVal;
  },
  { immediate: true }
);

watch(
  () => visible.value,
  newVal => {
    if (newVal) {
      currentIcon.value = props.currentIcon;
      searchKeyword.value = '';
      scrollTop.value = 0;
      // Reset scroll position
      nextTick(() => {
        if (scrollContainer.value) {
          scrollContainer.value.scrollTop = 0;
        }
      });
    }
  }
);

// Reset scroll position when search keyword changes
watch(
  () => searchKeyword.value,
  () => {
    scrollTop.value = 0;
    nextTick(() => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollTop = 0;
      }
    });
  }
);

function selectIcon(iconName: string) {
  currentIcon.value = iconName;
}

function confirmSelect() {
  if (currentIcon.value) {
    emit('select', currentIcon.value);
    visible.value = false;
  }
}

function handleClose() {
  visible.value = false;
}
</script>

<template>
  <ElDialog v-model="visible" :title="$t('page.manage.menu.iconSelector.title')" width="80%" :close-on-click-modal="false">
    <!-- Search box -->
    <div class="mb-20px text-center">
      <ElInput
        v-model="searchKeyword"
        :placeholder="$t('page.manage.menu.iconSelector.search')"
        prefix-icon="Search"
        clearable
        class="w-300px"
      />
    </div>

    <!-- Virtual scroll icon list -->
    <div class="virtual-scroll-container">
      <div class="total-count text-center text-sm color-#666 mb-16px p-8px bg-primary-50 border-1 border-primary-200 rounded-6px">
        {{ $t('page.manage.menu.iconSelector.total', { count: filteredIcons.length }) }}
      </div>
      <div
        ref="scrollContainer"
        class="scroll-viewport h-400px overflow-y-auto border-1 border-#e4e7ed rounded-8px bg-#fafafa"
        @scroll="handleScroll"
      >
        <div class="scroll-content relative w-full" :style="{ height: virtualData.totalHeight + 'px' }">
          <div
            v-for="row in virtualData.visibleRows"
            :key="row.index"
            class="icon-row absolute w-full h-70px flex items-center px-12px gap-8px left-0"
            :style="{ transform: `translateY(${row.top}px)` }"
          >
            <div
              v-for="icon in row.icons"
              :key="icon.name"
              class="icon-item flex-col items-center justify-center h-60px p-6px border-1 border-transparent rounded-6px cursor-pointer transition-all-200 bg-white/80 relative hover:bg-primary-100 hover:translate-y--1px hover:shadow-md hover:border-primary-300"
              :class="{ 'border-primary !bg-primary-100 shadow-lg': currentIcon === icon.name }"
              :style="{ width: 'calc(10% - 8px)' }"
              @click="selectIcon(icon.name)"
            >
              <div class="icon-preview flex items-center justify-center w-24px h-24px mb-4px color-primary">
                <component :is="icon.component" class="text-18px" />
              </div>
              <div class="icon-name text-10px color-#666 text-center line-height-1.1 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                {{ icon.name }}
              </div>
              <div
                v-if="currentIcon === icon.name"
                class="checkmark absolute top-2px right-2px w-16px h-16px bg-primary color-white rounded-50% text-10px flex items-center justify-center font-bold"
              >
                ✓
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <ElSpace :size="16" class="float-right">
        <ElButton @click="handleClose">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" :disabled="!currentIcon" @click="confirmSelect">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style scoped>
.scroll-viewport::-webkit-scrollbar {
  width: 8px;
}

.scroll-viewport::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.scroll-viewport::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
  border-radius: 4px;
}

.scroll-viewport::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, var(--el-color-primary-dark-2) 0%, var(--el-color-primary) 100%);
}
</style>
