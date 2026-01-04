<script setup lang="tsx">
import { computed, h, ref, watch } from 'vue';
import { menuTypeOptions } from '@/constants/business';
import { fetchAddMenu, fetchUpdateMenu } from '@/service/api';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import IconSelector from './icon-selector.vue';

defineOptions({ name: 'MenuOperateModal' });

export type OperateType = UI.TableOperateType | 'addChild';

interface Props {
  /** the type of operation */
  operateType: OperateType;
  /** the edit menu data or the parent menu data when adding a child menu */
  rowData?: Api.SystemManage.Menu | null;
  /** all pages */
  allPages: string[];
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<OperateType, string> = {
    add: $t('page.manage.menu.addMenu'),
    addChild: $t('page.manage.menu.addChildMenu'),
    edit: $t('page.manage.menu.editMenu')
  };
  return titles[props.operateType];
});

// Use old project's data model directly (PascalCase)
type Model = {
  Id?: string;
  Name: string;
  MenuType: Api.SystemManage.MenuType;
  Resource: string;
  Component: string;
  ParentId?: string;
  Icon: string;
  Order: number;
  Show: boolean;
  PermissionCode: string;
};

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    Name: '',
    MenuType: 'Folder',
    Resource: '',
    Component: '',
    ParentId: undefined,
    Icon: 'mdi:menu',
    Order: 0,
    Show: true,
    PermissionCode: ''
  };
}

type RuleKey = Extract<keyof Model, 'Name'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  Name: defaultRequiredRule
};

const disabledMenuType = computed(() => props.operateType === 'edit');

// Icon selector
const iconSelectorVisible = ref(false);

function handleIconSelect(iconName: string) {
  model.value.Icon = iconName;
}

// Show component field for Page menu type
const showComponent = computed(() => model.value.MenuType === 'Page');

// Show resource field for Page and External menu types
const showResource = computed(() => model.value.MenuType === 'Page' || model.value.MenuType === 'External');

const resourceLabel = computed(() => {
  if (model.value.MenuType === 'Page') return $t('page.manage.menu.routePath');
  if (model.value.MenuType === 'External') return $t('page.manage.menu.href');
  return $t('page.manage.menu.resource');
});

const resourcePlaceholder = computed(() => {
  if (model.value.MenuType === 'Page') return '/user/list';
  if (model.value.MenuType === 'External') return 'https://example.com';
  return '';
});

const pageOptions = computed(() => {
  return props.allPages.map(page => ({
    label: page,
    value: page
  }));
});

function handleInitModel() {
  model.value = createDefaultModel();

  if (!props.rowData) return;

  if (props.operateType === 'addChild') {
    const { Id } = props.rowData;
    model.value.ParentId = Id;
  }

  if (props.operateType === 'edit') {
    // Copy all fields from old project's data structure
    model.value = {
      Id: props.rowData.Id,
      Name: props.rowData.Name,
      MenuType: props.rowData.MenuType,
      Resource: props.rowData.Resource || '',
      Component: props.rowData.Component || '',
      ParentId: props.rowData.ParentId,
      Icon: props.rowData.Icon || 'mdi:menu',
      Order: props.rowData.Order,
      Show: props.rowData.Show,
      PermissionCode: props.rowData.PermissionCode || ''
    };
  }
}

function closeModal() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  const submitData: Partial<Api.SystemManage.Menu> = {
    ...model.value
  };

  const isEdit = props.operateType === 'edit';
  const { error } = isEdit ? await fetchUpdateMenu(submitData) : await fetchAddMenu(submitData);

  if (!error) {
    window.$message?.success(isEdit ? $t('common.updateSuccess') : $t('common.addSuccess'));
    closeModal();
    emit('submitted');
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
  }
});
</script>

<template>
  <ElDialog v-model="visible" :title="title" width="700px">
    <ElScrollbar class="h-500px pr-20px">
      <ElForm ref="formRef" :model="model" :rules="rules" label-position="right" :label-width="120">
        <ElRow :gutter="16">
          <ElCol :span="24">
            <ElFormItem :label="$t('page.manage.menu.menuType')" prop="MenuType">
              <ElRadioGroup v-model="model.MenuType" :disabled="disabledMenuType">
                <ElRadio
                  v-for="item in menuTypeOptions"
                  :key="item.value"
                  :value="item.value"
                  :label="item.value"
                >
                  {{ $t(item.label) }}
                </ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>

          <ElCol :span="24">
            <ElFormItem :label="$t('page.manage.menu.menuName')" prop="Name">
              <ElInput v-model="model.Name" :placeholder="$t('page.manage.menu.form.menuName')" />
            </ElFormItem>
          </ElCol>

          <ElCol v-if="showResource" :span="24">
            <ElFormItem :label="resourceLabel" prop="Resource">
              <ElInput v-model="model.Resource" :placeholder="resourcePlaceholder" />
            </ElFormItem>
          </ElCol>

          <ElCol v-if="showComponent" :span="24">
            <ElFormItem :label="$t('page.manage.menu.component')" prop="Component">
              <ElSelect v-model="model.Component" clearable filterable :placeholder="$t('page.manage.menu.form.page')">
                <ElOption v-for="{ label, value } in pageOptions" :key="value" :label="label" :value="value" />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :span="24">
            <ElFormItem :label="$t('page.manage.menu.icon')" prop="Icon">
              <ElInput v-model="model.Icon" :placeholder="$t('page.manage.menu.form.icon')">
                <template #suffix>
                  <SvgIcon v-if="model.Icon" :icon="model.Icon" class="text-icon" />
                </template>
                <template #append>
                  <ElButton @click="iconSelectorVisible = true">
                    <icon-ic-baseline-grid-on class="text-icon" />
                  </ElButton>
                </template>
              </ElInput>
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem :label="$t('page.manage.menu.order')" prop="Order">
              <ElInputNumber v-model="model.Order" class="w-full" :placeholder="$t('page.manage.menu.form.order')" />
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem :label="$t('page.manage.menu.show')" prop="Show">
              <ElSwitch v-model="model.Show" />
            </ElFormItem>
          </ElCol>

          <ElCol v-if="model.MenuType !== 'Folder'" :span="24">
            <ElFormItem :label="$t('page.manage.menu.permissionCode')" prop="PermissionCode">
              <ElInput v-model="model.PermissionCode" placeholder="sys:user:add" />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </ElScrollbar>

    <template #footer>
      <ElSpace :size="16" class="float-right">
        <ElButton @click="closeModal">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>

    <IconSelector v-model:visible="iconSelectorVisible" :current-icon="model.Icon" @select="handleIconSelect" />
  </ElDialog>
</template>

<style scoped></style>
