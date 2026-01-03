declare namespace Api {
  /**
   * namespace SystemManage
   *
   * backend api module: "systemManage"
   */
  namespace SystemManage {
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'current' | 'size'>;

    /** role */
    type Role = Common.CommonRecord<{
      /** role name */
      roleName: string;
      /** role code */
      roleCode: string;
      /** role description */
      roleDesc: string;
    }>;

    /** role search params */
    type RoleSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.Role, 'roleName' | 'roleCode' | 'status'> & CommonSearchParams
    >;

    /** role list */
    type RoleList = Common.PaginatingQueryRecord<Role>;

    /** all role */
    type AllRole = Pick<Role, 'id' | 'roleName' | 'roleCode'>;

    /**
     * user gender
     *
     * - "1": "male"
     * - "2": "female"
     */
    type UserGender = '1' | '2';

    /** user */
    type User = Common.CommonRecord<{
      /** user name */
      userName: string;
      /** user gender */
      userGender: UserGender | undefined;
      /** user nick name */
      nickName: string;
      /** user phone */
      userPhone: string;
      /** user email */
      userEmail: string;
      /** user role code collection */
      userRoles: string[];
    }>;

    /** user search params */
    type UserSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.User, 'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'status'> &
        CommonSearchParams
    >;

    /** user list */
    type UserList = Common.PaginatingQueryRecord<User>;

    /**
     * menu type
     *
     * - "1": directory
     * - "2": menu
     */
    type MenuType = '1' | '2';

    type MenuButton = {
      /**
       * button code
       *
       * it can be used to control the button permission
       */
      code: string;
      /** button description */
      desc: string;
    };

    /**
     * icon type
     *
     * - "1": iconify icon
     * - "2": local icon
     */
    type IconType = '1' | '2';

    type MenuPropsOfRoute = Pick<
      import('vue-router').RouteMeta,
      | 'i18nKey'
      | 'keepAlive'
      | 'constant'
      | 'order'
      | 'href'
      | 'hideInMenu'
      | 'activeMenu'
      | 'multiTab'
      | 'fixedIndexInTab'
      | 'query'
    >;

    type Menu = Common.CommonRecord<{
      /** parent menu id */
      parentId: number;
      /** menu type */
      menuType: MenuType;
      /** menu name */
      menuName: string;
      /** route name */
      routeName: string;
      /** route path */
      routePath: string;
      /** component */
      component?: string;
      /** iconify icon name or local icon name */
      icon: string;
      /** icon type */
      iconType: IconType;
      /** buttons */
      buttons?: MenuButton[] | null;
      /** children menu */
      children?: Menu[] | null;
    }> &
      MenuPropsOfRoute;

    /** menu list */
    type MenuList = Common.PaginatingQueryRecord<Menu>;

    type MenuTree = {
      id: number;
      label: string;
      pId: number;
      children?: MenuTree[];
    };

    /** action log */
    type ActionLog = {
      /** log id */
      id: string;
      /** log type */
      logType: number;
      /** module name */
      moduleName: string;
      /** action name */
      actionName: string;
      /** user account */
      iTCode: string;
      /** action url */
      actionUrl: string;
      /** action time */
      actionTime: string;
      /** duration in ms */
      duration: number;
      /** ip address */
      ip: string;
      /** remark */
      remark?: string;
    };

    /** action log search params */
    type ActionLogSearchParams = CommonType.RecordNullable<{
      ITCode?: string;
      ActionUrl?: string;
      LogType?: number[];
      ActionTime?: [string, string];
      IP?: string;
      Duration?: [number, number];
    }> &
      CommonSearchParams;

    /** action log list */
    type ActionLogList = Common.PaginatingQueryRecord<ActionLog>;

    /** cache item */
    type CacheItem = {
      /** cache key */
      key: string;
      /** cache value */
      value?: string;
      /** value type */
      valueType: 'json' | 'string' | 'number' | 'boolean';
      /** latest value preview */
      latestValue?: string;
      /** hits count */
      hits: number;
      /** misses count */
      misses: number;
      /** expiration time */
      expirationTime?: string;
      /** expiration seconds */
      expirationSeconds?: number;
      /** size in bytes */
      sizeInBytes: number;
    };

    /** cache search params */
    type CacheSearchParams = CommonType.RecordNullable<{
      keywords?: string;
      prefix?: string;
    }> &
      CommonSearchParams;

    /** cache list */
    type CacheList = Common.PaginatingQueryRecord<CacheItem>;

    /** cache statistics */
    type CacheStatistics = {
      /** total keys count */
      totalKeys: number;
      /** total hits count */
      totalHits: number;
      /** total misses count */
      totalMisses: number;
      /** hit rate */
      hitRate: number;
      /** total size in bytes */
      totalSizeInBytes: number;
    };
  }
}
