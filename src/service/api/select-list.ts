import { request } from '../request';

/**
 * get select list by type name
 *
 * @param typeName enum type name
 */
export function fetchGetSelectList(typeName: string) {
  return request<CommonType.Option[]>({
    url: '/api/selectlist/SelectListByTypeName',
    method: 'get',
    params: { typeName }
  });
}
