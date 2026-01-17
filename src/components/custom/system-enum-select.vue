<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchGetSelectList } from '@/service/api';

defineOptions({ name: 'SystemEnumSelect' });

interface Props {
  enumName: string;
  placeholder?: string;
  clearable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  clearable: true
});

const modelValue = defineModel<string | number | undefined>('modelValue');

const options = ref<CommonType.Option[]>([]);

async function getOptions() {
  const data = await fetchGetSelectList(props.enumName);
  if (data) {
    options.value = data;
  }
}

onMounted(() => {
  getOptions();
});
</script>

<template>
  <ElSelect v-model="modelValue" :placeholder="placeholder" :clearable="clearable">
    <ElOption v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
  </ElSelect>
</template>
