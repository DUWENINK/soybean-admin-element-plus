<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useEnumStore } from '@/store/modules/enum';

defineOptions({ name: 'SystemEnumSelect' });

interface Props {
  modelValue?: string | number;
  enumName: string;
  placeholder?: string;
  clearable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  placeholder: '请选择',
  clearable: true
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | undefined): void;
}>();

const enumStore = useEnumStore();
const options = ref<CommonType.Option[]>([]);

async function getOptions() {
  const data = await enumStore.getEnumOptions(props.enumName);
  if (data) {
    options.value = data;
  }
}

function handleChange(val: string | number | undefined) {
  emit('update:modelValue', val);
}

onMounted(() => {
  getOptions();
});
</script>

<template>
  <ElSelect
    :model-value="modelValue"
    :placeholder="placeholder"
    :clearable="clearable"
    @update:model-value="handleChange"
  >
    <ElOption v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
  </ElSelect>
</template>
