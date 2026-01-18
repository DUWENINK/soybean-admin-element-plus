<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { $t } from '@/locales';

type Row = {
  key: string;
  value: string;
};

const modelValue = defineModel<string | undefined>('modelValue', { required: true });

const defaultKeyOptions = [
  { label: '注册', value: 'Register' },
  { label: '重置密码', value: 'ResetPassword' },
  { label: '修改手机号', value: 'ChangePhone' }
];

const rows = ref<Row[]>([]);
const rawJson = ref('');
const jsonError = ref<string | null>(null);
const syncingFromOutside = ref(false);

function normalizeRows(next: Row[]) {
  const cleaned = next
    .map(r => ({ key: (r.key ?? '').trim(), value: (r.value ?? '').trim() }))
    .filter(r => r.key || r.value);

  const seen = new Set<string>();
  const uniq: Row[] = [];
  for (const r of cleaned) {
    if (!r.key) continue;
    if (seen.has(r.key)) continue;
    seen.add(r.key);
    uniq.push(r);
  }

  return uniq;
}

function buildJsonFromRows(nextRows: Row[]) {
  const obj: Record<string, string> = {};
  for (const r of nextRows) {
    if (!r.key || !r.value) continue;
    obj[r.key] = r.value;
  }

  const keys = Object.keys(obj);
  if (keys.length === 0) return '';

  return JSON.stringify(obj);
}

function parseJsonToRows(text: string | undefined) {
  const input = (text ?? '').trim();
  if (!input) return { rows: [] as Row[], error: null as string | null };

  try {
    const parsed = JSON.parse(input) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { rows: [] as Row[], error: $t('page.manage.smsConfig.templateMap.invalidJson') };
    }

    const obj = parsed as Record<string, unknown>;
    const nextRows = Object.entries(obj).map(([k, v]) => ({
      key: String(k),
      value: v == null ? '' : String(v)
    }));

    return { rows: normalizeRows(nextRows), error: null };
  } catch {
    return { rows: [], error: $t('page.manage.smsConfig.templateMap.invalidJson') };
  }
}

function addRow() {
  rows.value = [...rows.value, { key: '', value: '' }];
}

function removeRow(index: number) {
  rows.value = rows.value.filter((_, i) => i !== index);
}

function applyRawJson() {
  const parsed = parseJsonToRows(rawJson.value);
  jsonError.value = parsed.error;
  if (parsed.error) return;

  rows.value = parsed.rows;
}

const jsonPreview = computed(() => buildJsonFromRows(rows.value));

watch(
  modelValue,
  next => {
    syncingFromOutside.value = true;
    const parsed = parseJsonToRows(next);
    rows.value = parsed.rows.length ? parsed.rows : rows.value.length ? rows.value : [];
    rawJson.value = (next ?? '').trim();
    jsonError.value = parsed.error;
    syncingFromOutside.value = false;
  },
  { immediate: true }
);

watch(
  rows,
  next => {
    if (syncingFromOutside.value) return;
    const normalized = normalizeRows(next);
    if (normalized.length !== next.length) rows.value = normalized;

    const json = buildJsonFromRows(normalized);
    modelValue.value = json;
    rawJson.value = json;
    jsonError.value = null;
  },
  { deep: true }
);
</script>

<template>
  <div class="flex-col gap-12px">
    <div class="flex items-center justify-between">
      <div class="text-14px text-[var(--el-text-color-regular)]">{{ $t('page.manage.smsConfig.templateMap.tips') }}</div>
      <ElButton type="primary" plain size="small" @click="addRow">{{ $t('page.manage.smsConfig.templateMap.addRow') }}</ElButton>
    </div>

    <ElEmpty v-if="rows.length === 0" :description="$t('page.manage.smsConfig.templateMap.empty')" :image-size="60" />

    <div v-else class="flex-col gap-8px">
      <div v-for="(row, index) in rows" :key="index" class="flex gap-8px items-start">
        <ElSelect
          v-model="row.key"
          class="w-180px"
          filterable
          allow-create
          default-first-option
          :placeholder="$t('page.manage.smsConfig.templateMap.keyPlaceholder')"
        >
          <ElOption v-for="opt in defaultKeyOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </ElSelect>
        <ElInput v-model="row.value" class="flex-1" :placeholder="$t('page.manage.smsConfig.templateMap.valuePlaceholder')" />
        <ElButton type="danger" plain size="small" @click="removeRow(index)">{{ $t('common.delete') }}</ElButton>
      </div>
    </div>

    <ElCollapse>
      <ElCollapseItem :title="$t('page.manage.smsConfig.templateMap.advancedTitle')" name="template-map-advanced">
        <ElFormItem :error="jsonError ?? undefined" :label="$t('page.manage.smsConfig.templateMap.jsonLabel')" class="mb-8px">
          <ElInput
            v-model="rawJson"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 8 }"
            :placeholder="$t('page.manage.smsConfig.templateMap.jsonPlaceholder')"
          />
          <div class="mt-4px text-12px text-gray-400">{{ $t('page.manage.smsConfig.templateMap.jsonExample') }}</div>
        </ElFormItem>
        <ElSpace>
          <ElButton type="primary" plain @click="applyRawJson">{{ $t('page.manage.smsConfig.templateMap.applyJson') }}</ElButton>
          <ElButton @click="rawJson = jsonPreview">{{ $t('page.manage.smsConfig.templateMap.copyFromEditor') }}</ElButton>
        </ElSpace>
      </ElCollapseItem>
    </ElCollapse>
  </div>
</template>

<style scoped></style>

