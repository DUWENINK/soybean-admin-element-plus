declare namespace Api {
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
      Id: string; // 菜单ID
      Name: string; // 菜单名称
      MenuType: MenuType; // 菜单类型
      Resource: string; // 资源路径（路由路径）
      Component: string; // 组件路径
      ParentId?: string; // 父级菜单ID
      Icon: string; // 菜单图标
      Order: number; // 排序值
      Show: boolean; // 是否显示
      PermissionCode: string; // 权限标识
      Children?: MenuTreeDto[]; // 子菜单
    }
  }
}
