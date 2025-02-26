import {useNavigatorQuery} from '../OpenQuery.ts';
import {MenusResponseData} from '../../../libraries/Structs/NavigatorStructs.ts';

export const useMenusQuery = () => {
  return useNavigatorQuery<MenusResponseData>('/anchor/api/content/na/menu');
};
