<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { ElTag } from 'element-plus';
import { fetchGetSelectList } from '@/service/api';

defineOptions({ name: 'SystemEnumTag' });

interface Props {
  enumName: string;
  value: string | number;
  typeMap?: Record<string | number, UI.ThemeColor>; // 可选：自定义颜色映射
}

const props = defineProps<Props>();

const label = ref<string>('');
const tagType = ref<UI.ThemeColor>('primary'); // 默认为 primary

// 默认颜色轮询，如果没有提供 typeMap，可以按顺序分配颜色
const defaultColors: UI.ThemeColor[] = ['primary', 'success', 'warning', 'danger', 'info'];

async function getEnumLabel() {
  const data = await fetchGetSelectList(props.enumName);
  if (data) {
    const item = data.find((opt: any) => {
      // 宽松比较，处理字符串/数字差异
      return String(opt.key) === String(props.value);
    });

    if (item) {
      label.value = item.label;

      // 确定颜色
      if (props.typeMap && props.typeMap[props.value]) {
        tagType.value = props.typeMap[props.value];
      } else {
        // 如果没有自定义映射，可以尝试根据 value 的索引给一个固定的颜色
        // 或者简单地根据 value 的哈希值选一个颜色
        const index = data.indexOf(item);
        tagType.value = defaultColors[index % defaultColors.length];
      }
    } else {
      label.value = String(props.value); // Fallback to value
    }
  }
}

watch(
  () => props.value,
  () => {
    getEnumLabel();
  }
);

onMounted(() => {
  getEnumLabel();
});
</script>

<template>
  <ElTag :type="tagType">{{ label || value }}</ElTag>
</template>
