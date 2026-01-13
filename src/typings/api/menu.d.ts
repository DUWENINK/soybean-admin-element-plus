/**
 * Extend Api namespace to add Menu module
 * This is an alias to avoid duplication with Api.SystemManage.Menu
 */
declare namespace Api {
  namespace Menu {
    /**
     * Menu tree data transfer object
     * This is an alias for Api.SystemManage.Menu to maintain compatibility
     */
    type MenuTreeDto = Api.SystemManage.Menu;
  }
}
