<script setup lang="ts">
import { $t } from '@/locales';

defineOptions({ name: 'CacheSearch' });

// interface Props {
//   model: Api.SystemManage.CacheSearchParams;
// }

// const props = defineProps<Props>();

const emit = defineEmits<{
  reset: [];
  search: [];
}>();

const model = defineModel<Api.SystemManage.CacheItemSearch>('model', { required: true });

function reset() {
  emit('reset');
}

function search() {
  emit('search');
}
</script>

<template>
  <ElCard :title="$t('common.search')" :bordered="false" size="small" class="card-wrapper">
    <ElForm :model="model" label-width="80px">
      <ElRow :gutter="16">
        <ElCol :span="6">
          <ElFormItem :label="$t('page.manage.cache.keywords')">
            <ElInput v-model="model.keywords" :placeholder="$t('page.manage.cache.keywordsPlaceholder')" clearable />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem :label="$t('page.manage.cache.prefix')">
            <ElInput v-model="model.prefix" :placeholder="$t('page.manage.cache.prefixPlaceholder')" clearable />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem>
            <div class="w-full flex gap-12px">
              <ElButton @click="reset">
                <template #icon>
                  <icon-ic-round-refresh class="align-sub text-icon" />
                </template>
                <span class="ml-8px">{{ $t('common.reset') }}</span>
              </ElButton>
              <ElButton type="primary" @click="search">
                <template #icon>
                  <icon-ic-round-search class="align-sub text-icon" />
                </template>
                <span class="ml-8px">{{ $t('common.search') }}</span>
              </ElButton>
            </div>
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
  </ElCard>
</template>

<style scoped></style>
