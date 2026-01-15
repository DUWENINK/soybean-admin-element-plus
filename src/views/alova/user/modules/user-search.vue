<script setup lang="ts">
import { computed } from 'vue';
import { enableStatusOptions, userGenderOptions } from '@/constants/business';
import { useForm, useFormRules } from '@/hooks/common/form';
import { translateOptions } from '@/utils/common';
import { $t } from '@/locales';

defineOptions({ name: 'UserSearch' });

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useForm();

const model = defineModel<Api.SystemManage.UserSearchParams>('model', { required: true });

const initialParams = JSON.parse(JSON.stringify(model.value));

type RuleKey = Extract<keyof Api.SystemManage.UserSearch, 'userEmail' | 'userPhone'>;

const rules = computed<Record<string, App.Global.FormRule>>(() => {
  const { patternRules } = useFormRules(); // inside computed to make locale reactive

  return {
    search: {
      userEmail: patternRules.email,
      userPhone: patternRules.phone
    }
  };
});

async function reset() {
  await restoreValidation();
  Object.assign(model.value, JSON.parse(JSON.stringify(initialParams)));
}

async function search() {
  await validate();
  emit('search');
}
</script>

<template>
  <ElCard class="card-wrapper">
    <ElCollapse>
      <ElCollapseItem :title="$t('common.search')" name="user-search">
        <ElForm ref="formRef" :model="model" :rules="rules" label-position="right" :label-width="80">
          <ElRow :gutter="24">
            <ElCol :lg="6" :md="8" :sm="12">
              <ElFormItem :label="$t('page.manage.user.userName')" prop="search.userName">
                <ElInput v-model="model.search.userName" :placeholder="$t('page.manage.user.form.userName')" />
              </ElFormItem>
            </ElCol>
            <ElCol :lg="6" :md="8" :sm="12">
              <ElFormItem :label="$t('page.manage.user.userGender')" prop="search.userGender">
                <ElSelect v-model="model.search.userGender" :placeholder="$t('page.manage.user.form.userGender')" clearable>
                  <ElOption
                    v-for="{ label, value } in translateOptions(userGenderOptions)"
                    :key="value"
                    :label="label"
                    :value="value"
                  ></ElOption>
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :lg="6" :md="8" :sm="12">
              <ElFormItem :label="$t('page.manage.user.nickName')" prop="search.nickName">
                <ElInput v-model="model.search.nickName" :placeholder="$t('page.manage.user.form.nickName')" />
              </ElFormItem>
            </ElCol>
            <ElCol :lg="6" :md="8" :sm="12">
              <ElFormItem :label="$t('page.manage.user.userPhone')" prop="search.userPhone">
                <ElInput v-model="model.search.userPhone" :placeholder="$t('page.manage.user.form.userPhone')" />
              </ElFormItem>
            </ElCol>
            <ElCol :lg="6" :md="8" :sm="12">
              <ElFormItem :label="$t('page.manage.user.userEmail')" prop="search.userEmail">
                <ElInput v-model="model.search.userEmail" :placeholder="$t('page.manage.user.form.userEmail')" />
              </ElFormItem>
            </ElCol>
            <ElCol :lg="6" :md="8" :sm="12">
              <ElFormItem :label="$t('page.manage.user.userGender')" prop="search.status">
                <ElSelect v-model="model.search.status" :placeholder="$t('page.manage.user.form.userStatus')" clearable>
                  <ElOption
                    v-for="{ label, value } in translateOptions(enableStatusOptions)"
                    :key="value"
                    :label="label"
                    :value="value"
                  ></ElOption>
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :lg="12" :md="24" :sm="24">
              <ElSpace class="w-full justify-end" alignment="end">
                <ElButton @click="reset">
                  <template #icon>
                    <icon-ic-round-refresh class="text-icon" />
                  </template>
                  {{ $t('common.reset') }}
                </ElButton>
                <ElButton type="primary" plain @click="search">
                  <template #icon>
                    <icon-ic-round-search class="text-icon" />
                  </template>
                  {{ $t('common.search') }}
                </ElButton>
              </ElSpace>
            </ElCol>
          </ElRow>
        </ElForm>
      </ElCollapseItem>
    </ElCollapse>
  </ElCard>
</template>

<style scoped></style>
