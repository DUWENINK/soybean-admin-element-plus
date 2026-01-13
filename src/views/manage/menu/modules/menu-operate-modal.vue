<script setup lang="tsx">
import { computed, h, ref, watch } from 'vue';
import { menuTypeOptions } from '@/constants/business';
import { fetchAddMenu, fetchUpdateMenu } from '@/service/api';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import IconSelector from './icon-selector.vue';
import GenericLocalizationEditor from '@/components/common/generic-localization-editor.vue';

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
  id?: string;
  name: string;
  menuType: Api.SystemManage.MenuType;
  resource: string;
  component: string;
  parentId?: string;
  icon: string;
  order: number;
  show: boolean;
  permissionCode: string;
};

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    name: '',
    menuType: 'Folder',
    resource: '',
    component: '',
    parentId: undefined,
    icon: 'mdi:menu',
    order: 0,
    show: true,
    permissionCode: ''
  };
}

type RuleKey = Extract<keyof Model, 'name'>;
const rules: Record<RuleKey, App.Global.FormRule> = {
  name: defaultRequiredRule
};

const disabledMenuType = computed(() => props.operateType === 'edit');

// Icon selector
const iconSelectorVisible = ref(false);

function handleIconSelect(iconName: string) {
  model.value.icon = iconName;
}

// Localization editor
const localizationEditorVisible = ref(false);

function openLocalizationEditor() {
  if (!model.value.name) {
    window.$message?.warning('请先输入菜单名称Key');
    return;
  }
  localizationEditorVisible.value = true;
}

function handleLocalizationSubmitted() {
  // Refresh if needed
}

// Show component field for Page menu type
const showComponent = computed(() => model.value.menuType === 'Page');

// Show resource field for Folder, Page and External menu types (not Api)
const showResource = computed(() => model.value.menuType !== 'Api');

const resourceLabel = computed(() => {
  if (model.value.menuType === 'Page') return $t('page.manage.menu.routePath');
  if (model.value.menuType === 'External') return $t('page.manage.menu.href');
  return $t('page.manage.menu.routePath');
});

const resourcePlaceholder = computed(() => {
  if (model.value.menuType === 'External') return 'https://example.com';
  if (model.value.menuType === 'Folder') return '/system';
  return '/user/list';
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
    const { id } = props.rowData;
    model.value.parentId = id;
  }

  if (props.operateType === 'edit') {
    // Copy all fields from old project's data structure
    model.value = {
      id: props.rowData.id,
      name: props.rowData.name,
      menuType: props.rowData.menuType,
      resource: props.rowData.resource || '',
      component: props.rowData.component || '',
      parentId: props.rowData.parentId,
      icon: props.rowData.icon || 'mdi:menu',
      order: props.rowData.order,
      show: props.rowData.show,
      permissionCode: props.rowData.permissionCode || ''
    };
  }
}

function closeModal() {
  visible.value = false;
}

function validateModel(): boolean {
  const { name, menuType, resource, component, permissionCode } = model.value;

  // Name is always required
  if (!name?.trim()) {
    window.$message?.error($t('page.manage.menu.form.menuName'));
    return false;
  }

  // Validate Resource for Folder, Page, External
  if ((menuType === 'Folder' || menuType === 'Page' || menuType === 'External') && !resource?.trim()) {
    const msg = menuType === 'External' ? $t('page.manage.menu.form.href') : $t('page.manage.menu.form.routePath');
    window.$message?.error(msg);
    return false;
  }

  // Validate Component for Page
  if (menuType === 'Page' && !component?.trim()) {
    window.$message?.error($t('page.manage.menu.form.page'));
    return false;
  }

  // Validate PermissionCode for Api
  if (menuType === 'Api' && !permissionCode?.trim()) {
    window.$message?.error('请输入权限标识');
    return false;
  }

  return true;
}

async function handleSubmit() {
  await validate();

  // Additional validation based on menu type
  if (!validateModel()) {
    return;
  }

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
            <ElFormItem :label="$t('page.manage.menu.menuType')" prop="menuType">
              <ElRadioGroup v-model="model.menuType" :disabled="disabledMenuType">
                <ElRadio v-for="item in menuTypeOptions" :key="item.value" :value="item.value" :label="item.value">
                  {{ $t(item.label) }}
                </ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>

          <ElCol :span="24">
            <ElFormItem :label="$t('page.manage.menu.menuName')" prop="name">
              <ElInput v-model="model.name" :placeholder="$t('page.manage.menu.form.menuName')">
                <template #append>
                  <ElButton @click="openLocalizationEditor">
                    <icon-mdi:translate class="text-icon" />
                  </ElButton>
                </template>
              </ElInput>
            </ElFormItem>
          </ElCol>

          <ElCol v-if="showResource" :span="24">
            <ElFormItem :label="resourceLabel" prop="resource">
              <ElInput v-model="model.resource" :placeholder="resourcePlaceholder" />
            </ElFormItem>
          </ElCol>

          <ElCol v-if="showComponent" :span="24">
            <ElFormItem :label="$t('page.manage.menu.component')" prop="component">
              <ElSelect v-model="model.component" clearable filterable :placeholder="$t('page.manage.menu.form.page')">
                <ElOption v-for="{ label, value } in pageOptions" :key="value" :label="label" :value="value" />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :span="24">
            <ElFormItem :label="$t('page.manage.menu.icon')" prop="icon">
              <ElInput v-model="model.icon" :placeholder="$t('page.manage.menu.form.icon')">
                <template #suffix>
                  <SvgIcon v-if="model.icon" :icon="model.icon" class="text-icon" />
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
            <ElFormItem :label="$t('page.manage.menu.order')" prop="order">
              <ElInputNumber v-model="model.order" class="w-full" :placeholder="$t('page.manage.menu.form.order')" />
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem :label="$t('page.manage.menu.show')" prop="show">
              <ElSwitch v-model="model.show" />
            </ElFormItem>
          </ElCol>

          <ElCol v-if="model.menuType !== 'Folder'" :span="24">
            <ElFormItem :label="$t('page.manage.menu.permissionCode')" prop="permissionCode">
              <ElInput v-model="model.permissionCode" placeholder="sys:user:add" />
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

    <IconSelector v-model:visible="iconSelectorVisible" :current-icon="model.icon" @select="handleIconSelect" />
    <GenericLocalizationEditor
      v-model:visible="localizationEditorVisible"
      :resource-key="model.name"
      localization-type="Menu"
      @submitted="handleLocalizationSubmitted"
    />
  </ElDialog>
</template>

<style scoped></style>
