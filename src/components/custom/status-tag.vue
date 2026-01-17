<script setup lang="ts">
import { computed } from 'vue';
import { ElTag } from 'element-plus';
import { $t } from '@/locales';

defineOptions({ name: 'StatusTag' });

interface Props {
  value?: boolean;
  trueLabel?: string;
  falseLabel?: string;
  trueType?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  falseType?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

const props = withDefaults(defineProps<Props>(), {
  value: false,
  trueLabel: 'common.yesOrNo.yes',
  falseLabel: 'common.yesOrNo.no',
  trueType: 'success',
  falseType: 'danger'
});

const label = computed(() => {
  const key = props.value ? props.trueLabel : props.falseLabel;
  return $t(key);
});

const type = computed(() => {
  return props.value ? props.trueType : props.falseType;
});
</script>

<template>
  <ElTag :type="type">{{ label }}</ElTag>
</template>
