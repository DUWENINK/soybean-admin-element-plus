declare namespace MenuApi {
  /**
   * namespace Menu
   *
   * backend api module: "menu"
   */
  namespace Menu {
    enum MenuType {
      Folder = 'Folder', // 目录
      Page = 'Page', // 页面菜单
      Api = 'Api', // API权限
      External = 'External' // 外链
    }

    interface MenuTreeDto {
      id: string; // 菜单ID
      name: string; // 菜单名称
      localizedName: string; // 本地化名称
      menuType: MenuType; // 菜单类型
      resource: string; // 资源路径（路由路径）
      component: string; // 组件路径
      parentId?: string; // 父级菜单ID
      icon: string; // 菜单图标
      order: number; // 排序值
      show: boolean; // 是否显示
      permissionCode: string; // 权限标识
      children?: MenuTreeDto[]; // 子菜单
    }
  }
}
