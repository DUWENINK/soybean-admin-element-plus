declare namespace Api {
  /**
   * namespace SystemManage
   *
   * backend api module: "systemManage"
   */
  namespace SystemManage {
    /** 前端搜索通用参数（用于构建后端请求） */
    type CommonSearchParams = {
      /** 当前页码 */
      current: number;
      /** 每页大小 */
      size: number;
    };

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
    type RoleList = Common.PagedResult<Role>;

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
    type UserSearch = Pick<Api.SystemManage.User, 'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'status'>;

    /** user search params */
    type UserSearchParams = Common.PageBaseFilter<UserSearch>;

    /** user list */
    type UserList = Common.PagedResult<User>;

    /**
     * menu type enum (from old project)
     *
     * - "Folder": directory
     * - "Page": menu page
     * - "External": external link
     * - "Api": api permission
     */
    type MenuType = 'Folder' | 'Page' | 'External' | 'Api';

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

    /** Menu data structure (compatible with old project) */
    type Menu = {
      /** menu ID */
      id: string;
      /** menu name */
      name: string;
      /** localized menu name */
      localizedName?: string;
      /** menu type */
      menuType: MenuType;
      /** resource path */
      resource: string;
      /** component path */
      component?: string;
      /** parent menu ID */
      parentId?: string;
      /** icon */
      icon: string;
      /** sort order */
      order: number;
      /** whether to show */
      show: boolean;
      /** permission code */
      permissionCode?: string;
      /** children menus */
      children?: Menu[];
    };

    /** menu list */
    type MenuList = Common.PagedResult<Menu>;

    type MenuTree = {
      id: number;
      label: string;
      pId: number;
      children?: MenuTree[];
    };

    /**
     * menu move type
     *
     * - "MoveToParent": move to parent level
     * - "MoveToSibling": move to sibling level
     */
    type MenuMoveType = 'MoveToParent' | 'MoveToSibling';

    /**
     * menu insert position
     *
     * - "Before": insert before target
     * - "After": insert after target
     * - "AsChild": insert as child of target
     */
    type MenuInsertPosition = 'Before' | 'After' | 'AsChild';

    /** update menu order params */
    type UpdateMenuOrderParams = {
      /** menu id to move */
      id: number | string;
      /** target menu id */
      targetId: number | string;
      /** move type */
      moveType: MenuMoveType;
      /** insert position */
      insertPosition: MenuInsertPosition;
    };

    /** action log */
    type ActionLog = Common.CommonRecord<{
      /** log type */
      logType: number;
      /** module name */
      moduleName: string;
      /** action name */
      actionName: string;
      /** user account */
      itCode: string;
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
    }>;

    /** action log search params */
    type ActionLogSearch = Partial<
      Pick<ActionLog, 'logType' | 'moduleName' | 'actionName' | 'itCode' | 'actionUrl' | 'actionTime' | 'ip'>
    >;

    /** action log page request */
    type ActionLogPageRequest = Common.PageBaseFilter<ActionLogSearch>;

    /** action log list  */
    type ActionLogList = Common.PagedResult<ActionLog>;

    /** cache item */
    type CacheItem = Common.CommonRecord<{
      /** cache key */
      key: string;
      /** cache value */
      value?: string;
      /** value type */
      valueType: string;
      /** latest value preview */
      latestValue?: string;
      /** hits count */
      hits: number;
      /** misses count */
      misses: number;
      /** expiration time */
      expirationTime?: string;
      /** TTL in seconds */
      ttlSeconds?: number;
      /** created time */
      createdTime?: string;
      /** last access time */
      lastAccessTime?: string;
      /** size in bytes */
      sizeInBytes?: number;
    }>;

    /** action log search params */
    type CacheItemSearch = Partial<Pick<CacheItem, 'key' | 'valueType'> & { prefix: string } & { keywords: string }>;

    /** action log page request */
    type CacheItemPageRequest = Common.PageBaseFilter<CacheItemSearch>;

    /** cache list - 使用后端分页格式 */
    type CacheList = Common.PagedResult<CacheItem>;

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

    /** menu localization translation */
    type GenericLocalizationTranslation = {
      /** translation id */
      id: string;
      /** culture code (e.g., "zh-CN", "en-US") */
      culture: string;
      /** translation value */
      value: string;
      /** whether verified */
      isVerified: boolean;
    };


    /** save menu localization params */
    type SaveMenuLocalizationParams = {
      /** resource key */
      key: string;
      /** description */
      description?: string;
      /** translations (culture code -> value) */
      translations: Record<string, string>;
    };

    /** supported cultures response */
    type SupportedCulturesResponse = {
      /** default culture */
      defaultCulture: string;
      /** supported cultures list */
      supportedCultures: string[];
    };

    /** localization type enum */
    type LocalizationType = 'Menu' | 'Role' | 'Exception' | 'Enum';

    /** generic localization data */
    type GenericLocalization = {
      /** resource id */
      id: string;
      /** resource key */
      key: string;
      /** resource type */
      resourceType: string;
      /** description */
      description?: string;
      /** whether system resource */
      isSystem: boolean;
      /** translations array */
      translations: GenericLocalizationTranslation[];
    };

    /** generic save localization params */
    type GenericSaveLocalizationParams = {
      /** resource key */
      key: string;
      /** description */
      description?: string;
      /** translations (culture code -> value) */
      translations: Record<string, string>;
      /** localization type */
      localizationType?: LocalizationType;
    };
  }
}
