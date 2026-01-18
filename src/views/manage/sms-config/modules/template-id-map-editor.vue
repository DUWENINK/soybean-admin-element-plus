<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { fetchGetSelectList } from '@/service/api/select-list';
import { $t } from '@/locales';

type Row = {
  key: string;
  value: string;
};

const modelValue = defineModel<string | undefined>('modelValue', { required: true });

const rows = ref<Row[]>([]);
const purposeOptions = ref<CommonType.Option[]>([]);
const syncingFromOutside = ref(false);

onMounted(async () => {
  try {
    const data = await fetchGetSelectList('PurposeType');
    if (data) {
      purposeOptions.value = data;
    }
  } catch (error) {
    console.error('Failed to fetch PurposeType options', error);
  }
});

function isOptionDisabled(optionValue: string | number, rowIndex: number) {
  const strValue = String(optionValue);
  return rows.value.some((r, i) => i !== rowIndex && r.key === strValue);
}

// function normalizeRows(next: Row[]) {
//   const cleaned = next
//     .map(r => ({ key: (r.key ?? '').trim(), value: (r.value ?? '').trim() }));
//     // Don't filter out empty ones immediately to allow editing

//   // Deduplication logic handled in UI via disabled options, but good to have here too for safety
//   const seen = new Set<string>();
//   const uniq: Row[] = [];
//   for (const r of cleaned) {
//     if (r.key && seen.has(r.key)) continue; // Skip if duplicate key exists
//     if (r.key) seen.add(r.key);
//     uniq.push(r);
//   }

//   // If we filtered, return uniq. But for editing experience, we might want to keep the structure until save?
//   // The original logic normalized heavily. Let's keep it simple: just map.
//   // The UI prevents duplicates, so we just trust the UI primarily, but filter duplicates on save/json build.
//   return cleaned;
// }

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
  if (!input) return [];

  try {
    const parsed = JSON.parse(input) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return [];
    }

    const obj = parsed as Record<string, unknown>;
    return Object.entries(obj).map(([k, v]) => ({
      key: String(k),
      value: v === null ? '' : String(v)
    }));
  } catch {
    return [];
  }
}

function addRow() {
  rows.value.push({ key: '', value: '' });
}

function removeRow(index: number) {
  rows.value.splice(index, 1);
}

watch(
  modelValue,
  next => {
    syncingFromOutside.value = true;
    const parsedRows = parseJsonToRows(next);
    // Only update if different to avoid cursor jumping or resetting if we were typing?
    // Actually, usually modelValue comes from parent. If we are editing, we emit update.
    // We should only overwrite if the external value is significantly different and we are not editing?
    // For now, follow original logic: overwrite if syncing.

    // Simple check: if we have rows and next is empty/same, maybe don't wipe?
    // But if parent clears it, we should clear.
    rows.value = parsedRows;
    syncingFromOutside.value = false;
  },
  { immediate: true }
);

watch(
  rows,
  next => {
    if (syncingFromOutside.value) return;
    // We don't auto-normalize (remove duplicates) instantly while typing,
    // but we do generate valid JSON which naturally deduplicates keys (last one wins in JSON obj).
    // However, our buildJsonFromRows iterates and sets keys. If duplicates exist in rows, last one overrides.

    const json = buildJsonFromRows(next);
    modelValue.value = json;
  },
  { deep: true }
);
</script>

<template>
  <div class="flex-col gap-12px">
    <div class="flex items-center justify-between">
      <div class="text---el-text-color-regular text-(14px)">{{ $t('page.manage.smsConfig.templateMap.tips') }}</div>
      <ElButton type="primary" plain size="small" @click="addRow">
        {{ $t('page.manage.smsConfig.templateMap.addRow') }}
      </ElButton>
    </div>

    <ElEmpty v-if="rows.length === 0" :description="$t('page.manage.smsConfig.templateMap.empty')" :image-size="60" />

    <div v-else class="flex-col gap-8px">
      <div v-for="(row, index) in rows" :key="index" class="flex items-start gap-8px">
        <ElSelect v-model="row.key" placeholder="请选择用途" class="w-200px" filterable>
          <ElOption
            v-for="item in purposeOptions"
            :key="item.value"
            :label="item.label"
            :value="String(item.value)"
            :disabled="isOptionDisabled(item.value, index)"
          />
        </ElSelect>
        <ElInput
          v-model="row.value"
          class="flex-1"
          :placeholder="$t('page.manage.smsConfig.templateMap.valuePlaceholder')"
        />
        <ElButton type="danger" plain size="small" @click="removeRow(index)">{{ $t('common.delete') }}</ElButton>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
